

import type {
  IHuatuPath,
  IHuatuPathSeries,
  IHuatuSymbol,
  IHuatuSymbolArray,
  IHuatuDrawing,
  IHuatuStyle,
  IHuatuPoint,
  IHuatuTransform,
  IHuatuDrawingElement,
  IHuatuFinalDraw,
  SvgBuildType,
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";
import { HuatuPath } from "./HuatuPath.js";
import { HuatuPathSeries } from "./HuatuPathSeries.js";
import { HuatuBlock } from "./HuatuBlock.js";
import { HuatuSymbol } from "./HuatuSymbol.js";
import { HuatuSymbolArray } from "./HuatuSymbolArray.js";
import { HuatuLayer } from "./HuatuLayer.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuStyle, type IHuatuStyleParams } from "./HuatuStyle.js";
import { HuatuTransform, type IHuatuTransformParams } from "./HuatuTransform.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";

export interface IHuatuDrawingParams extends IHuatuStyleParams, IHuatuTransformParams {
  alignCenter?: boolean;
  radius?: number[];
}
export interface IHuatuDrawingSmoothParams {
  factor?: number;
  mode?: string;
}
export class HuatuDrawing implements IHuatuDrawing, IHuatuFinalDraw {

  /**
   * The Element going to draw
   */
  element?: IHuatuDrawingElement;

  /**
   * Shared style if applicable
   */
  style?: IHuatuStyle;

  /**
   * Transform settings when making the drawing. These coordinates are used to place symbol/Symbol Array/block,
   * if it is required to define the offset. rotCx, rotCy, rotDeg and scale will only be used by Symbol.
   * Symbol Array and block will not accept to be rotated.
   */
  transform?: IHuatuTransform;

  /**
   * Align-To-Center switch
   */
  alignCenter?: boolean;

  constructor(element?: IHuatuDrawingElement, style?: IHuatuStyle,  transform?: IHuatuTransform, alignCenter?: boolean) {
    this.assignElement(element);
    this.setStyle(style);
    this.setTransform(transform);
    if (alignCenter) this.alignCenter = true;
  }

  getBBox(): ISvgBBox {
    if (!this.element) return SvgBBox.DUMMY;
    // The original bbox;
    let bbox = this.element.getBBox();
    // Assign the X/Y for Symbol, or move by the offset specified
    if (this.element instanceof HuatuSymbol) {
      if (this.transform) {
        if (this.transform.x || this.transform.y) {
          bbox.x = this.transform.x ?? 0;
          bbox.y = this.transform.y ?? 0;
        } else if (this.transform.rotCx || this.transform.rotCy) {
          bbox.x = this.transform.rotCx ?? 0;
          bbox.y = this.transform.rotCy ?? 0;
        }
        if (this.transform.scale) {
          let scale = HuatuTransform.judgeScale(this.transform);
          bbox.w *= scale;
          bbox.h *= scale;
        }
        if (this.alignCenter) {
          bbox = bbox.moveBy(-bbox.w / 2, -bbox.h / 2);
          if (this.transform.rotDeg) {
            bbox = bbox.rotateAt(bbox.getCenter(), this.transform.rotDeg);
          }
        }
        else if (this.transform.rotDeg) {
          bbox = bbox.rotateAt(bbox.getAnchor(), this.transform.rotDeg);
        }
      }
    }
    else if (this.transform) {
      const manipulateBBox = (box: ISvgBBox, move?: ISvgPoint, scale?: number, rotDeg?: number, at?: ISvgPoint) => {
        if (move) {
          box = box.moveBy(move.x, move.y);
        }
        if (scale) {
          box = box.scale(scale);
          if (at) {
            box = box.moveBy(at.x * (1 - scale), at.y * (1 - scale));
          }
        }
        if (rotDeg) {
          box = box.rotateAt(at || new SvgPoint(0, 0), rotDeg);
        }
        return box;
      }
      const move = (this.transform.x || this.transform.y)
        ? new SvgPoint(this.transform.x ?? 0, this.transform.y ?? 0)
        : undefined;
      const scale = this.transform.scale
        ? HuatuTransform.judgeScale(this.transform)
        : undefined;
      const rotAt = new SvgPoint(this.transform.rotCx ?? 0, this.transform.rotCy ?? 0);
      if (this.element instanceof HuatuDrawingGroup) {
        const bboxes = this.element.bboxes
          .map(box => manipulateBBox(box, move, scale, this.transform?.rotDeg, rotAt));
        if (bboxes.length > 0) {
          bbox = SvgBBox.mergeBoxes(bboxes);
        }
      } else {
        bbox = manipulateBBox(bbox, move, scale, this.transform.rotDeg, rotAt);
      }
    }
    return bbox.extendByStroke(HuatuStyle.judgeStrokeWidth(this.style));
  }

  assignElement(element?: IHuatuDrawingElement) {
    if (element) {
      this.element = element;
    }
  }

  setElement(element?: IHuatuDrawingElement) {
    if (!element) return;
    this.clearElement();
    this.assignElement(element);
  }

  setStyle(style?: IHuatuStyle) {
    if (style) this.style = style;
  }

  setTransform(transform?: IHuatuTransform) {
    if (transform) this.transform = transform;
  }

  clearElement() {
    this.element = undefined;
    this.style = undefined;
    this.transform = undefined;
    this.alignCenter = undefined;
  }

  buildHtml(buildType: SvgBuildType): string {
    if (!this.element) return "";
    const html = this.element instanceof HuatuSymbol
      ? this.element.buildSvgOfLink(this.style, this.transform, this.alignCenter)
      : this.element.buildHtml(buildType, this.style,  this.transform);
    const bboxSvg = globalThis.wtHuatuConfig && globalThis.wtHuatuConfig.showBBox
      ? `\n${this.getBBox().buildRectSvg(true)}`
      : ``;
    return `${html}${bboxSvg}`;
  }

  static optsDrawingStyleAndTransform: IKeyValueOptions = {
    keys: [
      ...HuatuStyle.optsStyle.keys,
      ["move"],
      ["at"],
      ["rotDeg", "rotate", "deg"],
      ["scale", "zoom"],
      ["alignCenter"],
      ["smooth"],
      ["radius"],
    ],
    allowAppend: HuatuStyle.optsStyle.allowAppend,
    booleans: [
      ...HuatuStyle.optsStyle.booleans,
      "alignCenter"
    ],
    ints: HuatuStyle.optsStyle.ints,
    numbers: [
      ...HuatuStyle.optsStyle.numbers,
      "scale", "zoom"
    ],
    qualifiers: {
      ...HuatuStyle.optsStyle.qualifiers,
      "radius": "number[]",
    },
    blindGuess: HuatuStyle.optsStyle.blindGuess,
    subKeys: {
      ...HuatuStyle.optsStyle.subKeys,
      "smooth": {
        keys: [
          ["factor"],
          ["mode"],
        ],
        allowAppend: [],
        ints: [],
        numbers: [ "factor" ],
        booleans: [],
        qualifiers: {},
        blindGuess: {
          "mode": ["normal", "xy"],
          "factor":  (factor: string) => {
            let x = parseFloat(factor);
            return Number.isNaN(x) ? undefined : x;
          },
        },
        
      }
    },
  }

}
