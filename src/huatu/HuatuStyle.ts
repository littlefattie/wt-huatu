
import type {
  IHuatuPoint,
  IHuatuSymbol,
  IHuatuDrawing,
  IHuatuLabel,
  IHuatuStyle,
  IHuatuClipPath,
  IHuatuPattern,
  IHuatuCss,
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { IPathConfigs, ISvgPoint, TSvgLineCap, TSvgLineJoin } from "../svg/ISvg.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { HuatuPattern } from "./HuatuPattern.js";
import { HuatuClipPath } from "./HuatuClipPath.js";
import { HuatuMarker } from "./HuatuMarker.js";
import { WtMath } from "../math/WtMath.js";
import type { IKeyValueOptions, IKeyValueParsingResult } from "../tools/utils.js";
import { isValidColor } from "../tools/webColor.js";
import { genHex } from "../tools/gen-id.js";

export interface IHuatuStyleFillParams {
  color?: string;
  opacity?: number;
  pattern?: string;
  gradient?: string;
  rule?: string;
}

export interface IHuatuStyleStrokeParams {
  color?: string;
  width?: number;
  opacity?: number;
  lineCap?: string;
  lineJoin?: string;
  miterLimit?: number;
  dashArray?: number[];
  dashOffset?: number;
}

export interface IHuatuStyleMarkerParams {
  start?: string;
  mid?: string;
  end?: string;
}

export interface IHuatuStyleParams {
  styles?: string;
  fill?: string;
  fillOpacity?: number;
  opaque?: number;
  fillRule?: string;
  fillColor?: string;
  stroke?: string
  lineJoin?: string;
  lineCap?: string;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  dashArray?: number[];
  dashOffset?: number;
  gradient?: string;
  pattern?: string;
  marker?: string;
  clip?: string;
  markerStart?: string;
  markerMid?: string;
  markerEnd?: string;
}

type HuatuStyleAttrNames =
  | "fillColor" | "fillOpacity" | "fillPattern" | "fillRule" | "fillGradient"
  | "strokeColor" | "strokeWidth" | "strokeOpacity" | "strokeLineCap"
  | "strokeLineJoin" | "strokeMiterLimit" | "strokeDashArray" | "strokeDashOffset"
  | "markerStart" | "markerMid" | "markerEnd"
  | "clipPath";

export class HuatuStyle implements IHuatuStyle, IHuatuCss {

  refStyles: HuatuStyle[] = [];

  name?: string;

  fillColor?: string;
  fillOpacity?: number;
  fillPattern?: HuatuPattern;
  fillRule?: "nonzero" | "evenodd";
  fillGradient?: string;

  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeLineCap?: TSvgLineCap;
  strokeLineJoin?: TSvgLineJoin;
  strokeMiterLimit?: number;
  strokeDashArray?: number[] | "none" ;
  strokeDashOffset?: number;

  markerStart?: HuatuMarker;
  markerMid?:   HuatuMarker;
  markerEnd?:   HuatuMarker;

  clipPath?: HuatuClipPath;

  refCount: number = 0;
  magicId: string;

  constructor(name?: string) {
    this.name = name;
    this.magicId = genHex(8);
  }

  copyRefAttrs() {
    if (this.refStyles.length < 1) return;
    // Assign
    [ "fillColor", "fillOpacity", "fillPattern", "fillRule", "fillGradient",
      "strokeColor", "strokeWidth", "strokeOpacity", "strokeLineCap",
      "strokeLineJoin", "strokeMiterLimit", "strokeDashArray", "strokeDashOffset",
      "markerStart", "markerMid", "markerEnd",
      "clipPath"
    ].forEach(k => {
      const kAttr = k as HuatuStyleAttrNames;
      if (!this[kAttr]) {
        let i = this.refStyles.length - 1;
        while(i >= 0) {
          const ref = this.refStyles[i--];
          if (ref[kAttr]) {
            this[kAttr] = ref[kAttr] as any;
            break;
          }
        }
      }
    });
  }

  buildAttrArray(): string[][] {
    const attrs: string[][]= [];
    // Fill
    if (this.fillPattern) {
      attrs.push([`fill`, `url(#${this.fillPattern.buildId()})`]);
    } else if (this.fillGradient) {     // TODO: for gradient, there might be some similar actions to build IDs
      attrs.push([`fill`, `url(#${this.fillGradient})`]);
    } else if (this.fillColor) {
      attrs.push([`fill`, `${this.fillColor}`]);
    }
    if (this.fillOpacity !== undefined && WtMath.isIn0and1(this.fillOpacity)) {
      attrs.push([`fill-opacity`, `${this.fillOpacity.toFixed(2)}`]);
    }
    if (this.fillRule) {
      attrs.push([`fill-rule`, this.fillRule]);
    }
    // Stroke
    if (this.strokeColor) {
      attrs.push([`stroke`, `${this.strokeColor}`]);
    }
    if (this.strokeWidth) {
      attrs.push([`stroke-width`, `${this.strokeWidth.toFixed(6)}`]);
    }
    if (this.strokeOpacity) {
      attrs.push([`stroke-opacity`, `${this.strokeOpacity}`]);
    }
    if (this.strokeLineCap && this.strokeLineCap !== "butt") {
      attrs.push([`stroke-linecap`, `${this.strokeLineCap}`]);
    }
    if (this.strokeLineJoin && this.strokeLineJoin !== "miter") {
      attrs.push([`stroke-linejoin`, `${this.strokeLineJoin}`]);
    }
    if (this.strokeDashArray && Array.isArray(this.strokeDashArray)) {
      attrs.push([
        `stroke-dasharray`,
        this.strokeDashArray.map(d => `${d}`).join(" ")
      ]);
    }
    if (this.strokeDashOffset) {
      attrs.push([`stroke-dashoffset`, `${this.strokeDashOffset}`]);
    }
    if (this.markerStart) {
      attrs.push([`marker-start`, `url(#${this.markerStart.buildId()})`]);
    }
    if (this.markerMid) {
      attrs.push([`marker-mid`, `url(#${this.markerMid.buildId()})`]);
    }
    if (this.markerEnd) {
      attrs.push([`marker-end`, `url(#${this.markerEnd.buildId()})`]);
    }
    if (this.clipPath) {
      attrs.push([`clip-path`, `url(#${this.clipPath.buildId()})`]);
    }
    return attrs;
  }

  buildCss(): string {
    if (!this.name) return ""
    const attrs = this.buildAttrArray();
    if (attrs.length < 1) return "";
    return `.${HuatuStyle.buildStyleClassName(this)} {\n${attrs.map(a => `${a[0]}: ${a[1]};`).join("\n")}\n}`;
  }

  buildSvgAttr(direct?: boolean): string {
    const mergeStyles = (styles: string[][], newStyles: string[][]) => {
      newStyles.forEach(ns => {
        let idx = styles.findIndex(s => s[0] === ns[0]);
        if (idx >= 0) styles[idx][1] = ns[1];
        else styles.push([ns[0], ns[1]]);
      });
    }
    const attrArray: string[][] = [];// = this.buildAttrArray();
    if (globalThis.wtHuatuConfig?.noRefStyle) {
      this.refStyles.forEach(s => mergeStyles(attrArray, s.buildAttrArray()));
      mergeStyles(attrArray, this.buildAttrArray());
      return attrArray.map(a => `${a[0]}="${a[1]}"`).join(" ");
    }
    const classes = this.refStyles.map(s => HuatuStyle.buildStyleClassName(s)).filter(x => !!x);
    if (!direct && this.name) {
      classes.push(HuatuStyle.buildStyleClassName(this));
      return `class="${classes.join(' ')}"`;
    }
    if (classes.length > 0) {
      attrArray.push(["class", `${classes.join(' ')}`]);
    }
    attrArray.push(...this.buildAttrArray());
    return attrArray.map(a => `${a[0]}="${a[1]}"`).join(" ");
  }

  toPathConfigs(): IPathConfigs {
    return HuatuStyle.convertStyleToPathConfigs(this);
  }

  static buildStyleClassName(style: HuatuStyle): string {
    if (!style.name) return "";
    return `sty-${style.magicId}`;
  }

  static judgeStrokeWidth(style?: IHuatuStyle): number {
    if (!style) return 0;
    let i = 0;
    let strokeWidth: number | undefined;
    let strokeColor: string | undefined;
    while(i < style.refStyles.length) {
      let sty = style.refStyles[i++];
      if (sty.strokeWidth && strokeWidth === undefined) strokeWidth = sty.strokeWidth;
      if (sty.strokeColor && !strokeColor) strokeColor = sty.strokeColor;
      if (strokeWidth && strokeColor) break;
    }
    strokeColor = style.strokeColor ? style.strokeColor : strokeColor;
    let swUsed = style.strokeWidth ? style.strokeWidth
      : strokeWidth ? strokeWidth
      : strokeColor && strokeColor.toLowerCase() !== "none" ? 1
      : 0;
    let hasMarker = !!style.markerEnd || !!style.markerMid || !!style.markerStart;
    return hasMarker ? 10 * swUsed : swUsed;
  }

  static buildForSvg(style?: IHuatuStyle, direct?: boolean) {
    if (!style) return ``;
    return style.buildSvgAttr(direct);
  }

  static convertStyleToPathConfigs(style: HuatuStyle): IPathConfigs {
    const configs: IPathConfigs = {};
    if (style.fillPattern) {
      configs.fill = { color: `url(#${style.fillPattern.buildId()})` };
    } else if (style.fillGradient) {
      configs.fill = { color: `url(#${style.fillGradient})` };
    } else if (style.fillColor) {
      configs.fill = { color: `${style.fillColor}` };
    }
    if (style.fillOpacity !== undefined && WtMath.isIn0and1(style.fillOpacity)) {
      if (configs.fill) configs.fill.opacity = style.fillOpacity;
      else configs.fill = { opacity: style.fillOpacity };
    }
    if (style.fillRule) {
      if (configs.fill) configs.fill.rule = style.fillRule;
      else configs.fill = { rule: style.fillRule };
    }

    configs.stroke = { color: style.strokeColor };
    if (style.strokeWidth) {
      configs.stroke.width = style.strokeWidth;
    }
    if (style.strokeOpacity) {
      configs.stroke.opacity = style.strokeOpacity;
    }
    if (style.strokeLineCap && style.strokeLineCap !== "butt") {
      configs.stroke.lineCap = style.strokeLineCap;
    }
    if (style.strokeLineJoin && style.strokeLineJoin !== "miter") {
      configs.stroke.lineJoin = style.strokeLineJoin;
    }
    if (style.strokeDashArray) {
      configs.stroke.dashArray = style.strokeDashArray;
    }
    if (style.strokeDashOffset) {
      configs.stroke.dashOffset = style.strokeDashOffset;
    }

    if (style.markerStart) {
      if (configs.marker) configs.marker.start = style.markerStart.buildId();
      else configs.marker = { start: style.markerStart.buildId() };
    }
    if (style.markerMid) {
      if (configs.marker) configs.marker.mid = style.markerMid.buildId();
      else configs.marker = { mid: style.markerMid.buildId() };
    }
    if (style.markerEnd) {
      if (configs.marker) configs.marker.end = style.markerEnd.buildId();
      else configs.marker = { end: style.markerEnd.buildId() };
    }
    if (style.clipPath) {
      configs.clip = style.clipPath.buildId();
    }
    return configs;
  }

  static optsFill: IKeyValueOptions = {
    keys: [
      ["color"],
      ["opacity"],
      ["pattern"],
      ["gradient"],
      ["rule"],
    ],
    allowAppend: [],
    numbers: ["opacity"],
    ints: [],
    booleans: [],
    qualifiers: {
      "color": isValidColor,
      "rule": SvgCsts.FILL_RULES,
    },
    blindGuess: {
      "color": isValidColor,
      "rule": SvgCsts.FILL_RULES,
      "opacity": (op: string) => {
        let x = parseFloat(op);
        return Number.isNaN(x) ? undefined : x;
      },
    }
  };

  static optsFillColorAndOpacity: IKeyValueOptions = {
    keys: [
      ["color"],
      ["opacity"],
    ],
    allowAppend: [],
    numbers: ["opacity"],
    ints: [],
    booleans: [],
    qualifiers: {
      "color": isValidColor,
    },
    blindGuess: {
      "color": isValidColor,
      "opacity": (op: string) => {
        let x = parseFloat(op);
        return Number.isNaN(x) ? undefined : x;
      },
    }
  };

  static optsStroke: IKeyValueOptions = {
    keys: [
      ["color"],
      ["width"],
      ["opacity"],
      ["lineCap"],
      ["lineJoin"],
      ["miterLimit"],
      ["dashArray", "array", "dash"],
      ["dashOffset", "offset"],
    ],
    allowAppend: ["dashArray", "array", "dash"],
    numbers: ["width", "opacity","miterLimit", "dashOffset", "offset"],
    ints: [],
    booleans: [],
    qualifiers: {
      "color": isValidColor,
      "dashArray": "number[]",
      "array": "number[]",
      "dash": "number[]",
      "lineCap": SvgCsts.LINE_CAPS,
      "lineJoin": SvgCsts.LINE_JOINS,
    },
    blindGuess: {
      "color": isValidColor,
      "lineCap": SvgCsts.LINE_CAPS,
      "lineJoin": SvgCsts.LINE_JOINS,
      "width": (w: string) => {
        let x = parseFloat(w);
        return Number.isNaN(x) ? undefined : x;
      },
    }
  };

  static optsMarker: IKeyValueOptions = {
    keys: [
      ["start"],
      ["mid", "middle"],
      ["end"],
    ],
    allowAppend: [],
    ints: [],
    numbers: [],
    booleans: [],
    qualifiers: {},
    blindGuess: {},
  }

  static optsStyle: IKeyValueOptions = {
    keys: [
      ["styles", "style", "refs", "ref"],
      // Style keys
      ["fill"],
      ["fillOpacity"],
      ["opaque"],     // This is global opacity setting, if specified, will both assign fill and stroke opacity
      ["fillRule"],
      ["fillColor"],
      ["stroke"],
      ["lineJoin", "strokeLineJoin"],
      ["lineCap", "strokeLineCap"],
      ["strokeOpacity"],
      ["strokeColor"],
      ["strokeWidth"],
      ["dashArray", "array", "dash", "strokeDashArray"],
      ["dashOffset", "arrayOffset", "offset"],
      ["gradient"],
      ["pattern"],
      ["marker"],
      ["clip"],
      ["markerStart"],
      ["markerMid", "markerMiddle"],
      ["markerEnd"],
    ],
    allowAppend: ["fill", "stroke", "marker", "smooth"],
    booleans: [],
    ints: [],
    numbers: [
      "fillOpacity", "opaque",
      "strokeWidth",
      "strokeOpacity",
      "dashOffset", "arrayOffset", "offset",
    ],
    qualifiers: {
      "dashArray": "number[]",
      "array": "number[]",
      "dash": "number[]",
      "strokeDashArray": "number[]",
      "fillColor": isValidColor,
      "strokeColor": isValidColor,
      "lineCap": SvgCsts.LINE_CAPS,
      "strokeLineCap": SvgCsts.LINE_CAPS,
      "lineJoin": SvgCsts.LINE_JOINS,
      "strokeLineJoin": SvgCsts.LINE_JOINS,
      "fillRule": SvgCsts.FILL_RULES,
    },
    blindGuess: {
      "fillRule": SvgCsts.FILL_RULES,
      "lineCap": SvgCsts.LINE_CAPS,
      "lineJoin": SvgCsts.LINE_JOINS,
    },
    subKeys: {
      "fill": HuatuStyle.optsFill,
      "stroke": HuatuStyle.optsStroke,
      "marker": HuatuStyle.optsMarker,
    }
  };
}
