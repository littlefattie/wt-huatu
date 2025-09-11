
import type {
  IHuatuJob,
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuDefinable,
  IHuatuCss,
  IHuatuConfig,
  IHuatu,
  IHuatuDrawing,
  IHuatuLabel,
  IHuatuDrawingElement,
  IHuatuStyle,
} from "./IHuatu.js";

import type { ISvgBBox } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuDrawing } from "./HuatuDrawing.js";
import { HuatuLabel } from "./HuatuLabel.js";
import { HuatuPath } from "./HuatuPath.js";
import { HuatuPathSeries } from "./HuatuPathSeries.js";
import { HuatuSymbol } from "./HuatuSymbol.js";
import { HuatuSymbolArray } from "./HuatuSymbolArray.js";
import { HuatuBlock } from "./HuatuBlock.js";
import { HuatuPattern } from "./HuatuPattern.js";
import { HuatuMarker } from "./HuatuMarker.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { HuatuLabelStyle } from "./HuatuLabelStyle.js";
import { fitNumInRange, indentHtmlLines } from "../tools/utils.js";
import { WtHuatu } from "./Huatu.js";
import { HuatuClipPath } from "./HuatuClipPath.js";
import { buildCssHtmlTag } from "../tools/html.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuJob implements IHuatuJob {
  huatu: IHuatu;
  name: string;
  desc?: string | undefined;
  drawings: IHuatuFinalDraw[] = [];
  defines: IHuatuDefinable[] = [];
  styles: IHuatuCss[] = [];
  viewBox?: ISvgBBox;
  vbExplicit: boolean = false;
  width?: number;;
  height?: number;
  config?: IHuatuConfig;

  constructor(huatu: IHuatu, name: string) {
    this.huatu = huatu;
    this.name = name;
  }

  // TODO: This might be updated later
  static HUATU_HUB_KATEX_CSS = "";

  static getKatexCss = () => buildCssHtmlTag(
    globalThis.huatuKatexCss || 
    this.HUATU_HUB_KATEX_CSS || 
    `https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css`
  );
  
  buildStyleDefs(): string {
    return `<style type="text/css"><![CDATA[\n`
      + `foreignObject > body { margin: 0; width: 100%; height: 100%; }\n`
      + WtHuatu.buildEmbeddedStyles() + "\n"
      + this.styles.map(s => s.buildCss()).join("\n")
      + `\n]]></style>`;
  }

  resolveDefineOfDrawingElement(element: IHuatuDrawingElement) {
    if (element instanceof HuatuPath) {
      if (!this.defines.find(x => (x instanceof HuatuPath) && x.name === element.name)) {
        this.defines.push(element);
      }
    }
    if (element instanceof HuatuPathSeries) {
      if (!this.defines.find(x => (x instanceof HuatuPathSeries) && x.name === element.name)) {
        this.defines.push(element);
      }
    }
    if (element instanceof HuatuSymbol) {
      if (!this.defines.find(x => (x instanceof HuatuSymbol) && x.name === element.name)) {
        // Push the drawings first
        element.elements.forEach(draw => {
          this.resolveDefineOfFinalDraw(draw);
        })
        this.defines.push(element);
      }
    }
    if (element instanceof HuatuSymbolArray) {
      if (!this.defines.find(x => (x instanceof HuatuSymbol) && x.name === element.symbol.name)) {
        this.resolveDefineOfDrawingElement(element.symbol);
      }
    }
    if (element instanceof HuatuBlock) {
      element.elements.forEach(draw => {
        this.resolveDefineOfFinalDraw(draw);
      })
      this.defines.push(element);
    }
  }

  resolveDefineOfStyle(style: IHuatuStyle) {
    if (style.fillPattern) {
      const pattern = style.fillPattern instanceof HuatuPattern
        ? style.fillPattern
        : this.huatu.patterns.find(x => x.name === style.fillPattern);
      if (pattern) {
        let ptn = pattern as HuatuPattern;
        if (!this.defines.find(x => x === ptn)) this.defines.push(ptn);
      }
    }
    if (style.markerEnd) {
      const marker = style.markerEnd instanceof HuatuMarker
        ? style.markerEnd
        : this.huatu.markers.find(x => x.name === style.markerEnd);
      if (marker) {
        let mkr = marker as HuatuMarker;
        if (!this.defines.find(x => x === mkr)) this.defines.push(mkr);
      }
    }
    if (style.markerMid) {
      const marker = style.markerMid instanceof HuatuMarker
        ? style.markerMid
        : this.huatu.markers.find(x => x.name === style.markerMid);
      if (marker) {
        let mkr = marker as HuatuMarker;
        if (!this.defines.find(x => x === mkr)) this.defines.push(mkr);
      }
    }
    if (style.markerStart) {
      const marker = style.markerStart instanceof HuatuMarker
        ? style.markerStart
        : this.huatu.markers.find(x => x.name === style.markerStart);
      if (marker) {
        let mkr = marker as HuatuMarker;
        if (!this.defines.find(x => x === mkr)) this.defines.push(mkr);
      }
    }
    if (style.clipPath) {
      const clip = style.clipPath instanceof HuatuClipPath
        ? style.clipPath
        : this.huatu.clips.find(x => x.name === style.clipPath);
      if (clip) {
        let clp = clip as HuatuClipPath;
        if (!this.defines.find(x => x === clp)) this.defines.push(clp);
      }
    }
    if (style.fillGradient) {
      // TODO: handle gradient
    }
    if (style.refStyles.length > 0) {
      style.refStyles.forEach(s => this.resolveDefineOfStyle(s));
    }
    if (style.name && !this.styles.find(x => (x as HuatuStyle).name === style.name)) {
      this.styles.push(style as HuatuStyle);
    }
  }

  resolveDefineOfDrawing(drawing: IHuatuDrawing) {
    const element = drawing.element;
    const style = drawing.style;
    if (drawing.element) this.resolveDefineOfDrawingElement(drawing.element);
    if (drawing.style) this.resolveDefineOfStyle(drawing.style);
  }

  resolveDefineOfLabel(label: IHuatuLabel) {
    if (label.styles) {
      label.styles.forEach(s => {
        if (this.huatu.labelStyles.find(x => x === (s as HuatuLabelStyle)) &&
           !this.styles.find(x => x === (s as HuatuLabelStyle))) {
          this.styles.push(s as HuatuLabelStyle);
        }
      })
    }
  }

  resolveDefineOfFinalDraw(draw: IHuatuFinalDraw) {
    if (draw instanceof HuatuDrawing) {
      this.resolveDefineOfDrawing(draw);
    } else if (draw instanceof HuatuLabel) {
      this.resolveDefineOfLabel(draw);
    }
  }

  // This function will resolve all the "defines" (including path(series) block, symbol, etc.) that this job used
  resolveDefines() {
    this.drawings.forEach(d => this.resolveDefineOfFinalDraw(d));
  }

  buildInnerSvg(buildType: SvgBuildType): string {
    // Make New JobID
    globalThis.wthtJobBuildId = genHex(8);
    const config = this.config ?? this.huatu.config;
    // Assign config
    globalThis.wtHuatuConfig = config;
    const printUnused = globalThis.wtHuatuConfig && globalThis.wtHuatuConfig.printUnusedModule;

    // Resolve Defines
    this.resolveDefines();

    let svg = "";
    // Title
    if (this.huatu.title) svg += `<title>${this.huatu.title}</title>\n`;
    // Description
    if (this.desc) svg += `<desc>${this.desc}</desc>\n`;
    // Defs
    svg += `<defs>\n`
    svg += `${this.buildStyleDefs()}\n`
    svg += this.defines
      .map(d => {
        return (d.alwaysInDef || printUnused || buildType === "linking")
          ? d.buildHtmlForDef().trim()
          : ""
      })
      .filter(d => !!d)
      .join("\n");
    svg += `\n</defs>\n`
    // Svg Elements
    svg += this.drawings.map(d => d.buildHtml(buildType)).join("\n");

    // Remove Config
    globalThis.wtHuatuConfig = undefined;

    return svg;
  }

  buildSvgOnly(inner: string, extraAttrs: string[][]): string {
    const attrs:  string[][] = [
      ["version", "1.1"],
      ["xmlns", "http://www.w3.org/2000/svg"],
      ["xmlns:xlink", "http://www.w3.org/1999/xlink"]
    ];
    if (extraAttrs.length > 0) {
      attrs.push(...extraAttrs);
    }
    return `<svg ${attrs.map(x => `${x[0]}="${x[1]}"`).join(" ")} >\n`
      + inner
      + `\n</svg>`;
  }

  buildWithEmptyMsg(): string {
    return this.buildSvgOnly(
      `<text x="0" y="20" fill="red" font-family="Times New Roman, Times" font-size="16">ERROR!!! Job [${this.name}] has nothing to be drawn!</text>\n`,
      [
        ["viewBox", "0 0 320 30"],
        ["width", "320"],
        ["height", "30"],
      ]
    );
  }

  buildSvg(buildType: SvgBuildType, withSize?: boolean, width?: number, height?: number): string {
    // If job specified doesn't exist, then return error message as SVG
    if (this.drawings.length < 1) return this.buildWithEmptyMsg();
    const attrs:  string[][] = [];
    if (withSize) {
      let w = width || this.width,
          h = height || this.height;
      if (w) w = Math.abs(w);
      if (h) h = Math.abs(h);
      if (w || h) {
        if (w) attrs.push(["width",  `${w}`]);
        if (h) attrs.push(["height", `${Math.ceil(h)}`]);
      }
      else if (this.viewBox) {
        attrs.push(["width",  `${this.viewBox.w}`]);
        attrs.push(["height", `${Math.ceil(this.viewBox.h)}`]);
      }
    }
    if (this.viewBox) attrs.push(["viewBox", `${this.viewBox.buildString()}`]);
    return this.buildSvgOnly(this.buildInnerSvg(buildType), attrs);
  }

  buildSvgOfScale(buildType: SvgBuildType, scale?: number): string {
    // If job specified doesn't exist, then return error message as SVG
    if (this.drawings.length < 1) return this.buildWithEmptyMsg();
    if (!scale) return this.buildSvg(buildType);
    scale = fitNumInRange(scale, 0.2, 100);
    const attrs:  string[][] = [];
    let w = this.viewBox ? scale * this.viewBox.w : undefined,
        h = this.viewBox ? scale * this.viewBox.h : undefined;
    if (w) attrs.push(["width", `${w}`]);
    if (h) attrs.push(["height", `${Math.ceil(h)}`]);
    if (this.viewBox) attrs.push(["viewBox", `${this.viewBox.buildString()}`]);
    return this.buildSvgOnly(this.buildInnerSvg(buildType), attrs);
  }

  buildHtml(buildType: SvgBuildType, indent?: boolean, withSize?: boolean): string {
    globalThis.buildType = buildType;
    // TODO: Check and Link external CSS files
    const htmlFile = `<!DOCTYPE html>\n`
      + `<html lang="EN">\n`
      + `<head>\n`
      + `<meta charset="utf-8" />\n`
      + `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n`
      + `<title>${this.huatu.title ?? "Untitled"}</title>\n`
      + HuatuJob.getKatexCss() + '\n'
      + `<style>\n`
      + `body {margin: 0; overflow: hidden;}\n`
      + `body::-webkit-scrollbar { display: none; }\n`
      + `span.katex { margin: 0 3px; }\n`
      + `.katex { font-size: 1em;}\n`
      + `</style>\n`
      + `</head>\n`
      + `<body>\n`
      + `<div style="display:flex;">\n`
      + this.buildSvg(buildType, withSize) + '\n'
      + `</div>\n`
      + `</body>\n`
      + `</html>`;

    if (indent) return indentHtmlLines(htmlFile).join("\n");
    else return htmlFile;
  }

  buildSvgStandalone(buildType: SvgBuildType, indent?: boolean, withSize?: boolean): string {
    globalThis.buildType = buildType;
    // TODO: Check and Link external CSS files
    const svgFile = `<?xml version="1.0" standalone="no"?>\n`
      + `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n`
      + `${HuatuJob.getKatexCss()}\n`
      + `${this.buildSvg(buildType, withSize)}`;

    if (indent) return indentHtmlLines(svgFile).join("\n");
    else return svgFile;
  }

  calcViewBox() {
    const boxes = this.drawings.map(d => d.getBBox());
    if (boxes.length > 0) {
      return SvgBBox.mergeBoxes(boxes);
    } else {
      return undefined;
    }
  }

  /* ------------------------------ For component -----------------------------  */
  getViewBoxWithoutLabels(): ISvgBBox {
    const boxes = this.drawings
      .filter(x => !(x instanceof HuatuLabel)).map(d => d.getBBox());
    return SvgBBox.mergeBoxes(boxes);
  }

  buildHtmlForComponent() {
    let config = this.config ?? this.huatu.config;
    if (!config) {
      config = { noRefStyle: true }; 
    } else {
      config.noRefStyle = true;
    }
    // Assign config
    const configBkp = globalThis.wtHuatuConfig;
    globalThis.wtHuatuConfig = config;
    let svg = {
      graphs: "",
      labels: ""
    };
    this.drawings.forEach(d => {
      if (d instanceof HuatuLabel) {
        svg.labels += d.buildHtml("direct") + "\n";
      } else {
        svg.graphs += d.buildHtml("direct") + "\n";
      }
    })
    
    // Remove Config
    globalThis.wtHuatuConfig = configBkp;
    return svg;
  }

}
