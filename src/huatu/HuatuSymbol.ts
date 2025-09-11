
import type {
  IHuatuPoint,
  IHuatuSymbol,
  IHuatuDrawing,
  IHuatuLabel,
  IHuatuTransform,
  IHuatuStyle,
  IHuatuDrawingElement,
  IHuatuDefinable,
  IHuatuDrawingGroup,
} from "./IHuatu.js";

import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";
import { HuatuTransform } from "./HuatuTransform.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuSymbol extends HuatuDrawingGroup implements IHuatuSymbol, IHuatuDefinable {

  refCount: number = 0;
  alwaysInDef: boolean = true;
  magicId: string;

  viewBox?: ISvgBBox;

  constructor(name: string, desc?: string) {
    super(name, desc);
    this.magicId = genHex(8);
  }

  getWidth() {
    return this.viewBox ? this.viewBox.w : this.bbox.w;
  }

  getHeight() {
    return this.viewBox ? this.viewBox.h : this.bbox.h;
  }

  setViewBox(viewBox: ISvgBBox) {
    this.viewBox = viewBox;
  }

  // For a Symbol, the real size is determined by viewBox, so here we have to override the definition in parent class
  // i.e. Huatu Drawing Group
  getBBox(style?: IHuatuStyle): ISvgBBox {
    let width, height;
    if (this.viewBox) {
      width = this.viewBox.w;
      height = this.viewBox.h;
    } else {
      const bbox = this.bbox.extendByStroke(HuatuStyle.judgeStrokeWidth(style));
      width = bbox.w;
      height = bbox.h;
    }
    // The X and Y is not determined by symbol it self, so return 0 here
    return new SvgBBox(0, 0, width, height);
  }

  buildId(): string {
    return `sym-${this.magicId}`;
  }

  buildHtmlForDef(): string {
    return `<symbol id="${this.buildId()}" viewBox="${(this.viewBox ?? this.bbox).buildString()}">\n`
      + (this.desc ? `<desc>${this.desc}</desc>\n` : ``)
      + this.elements.map(e => e.buildHtml("direct")).join("\n")      // For def building, always use direct output
      + `</symbol>`;
  }

  buildTransformStr(transform?: IHuatuTransform, alignCenter?: boolean): string {
    const attrs: string[] = [];
    let width = this.getWidth(),
        height = this.getHeight();
    if (transform) {
      const scale = HuatuTransform.judgeScale(transform);
      width *= scale;
      height *= scale;
      const rotAttrs = HuatuTransform.buildTransformAttrsForSymbol(transform);
      if (rotAttrs.length > 0) attrs.push(...rotAttrs);
    }
    // This Align-To-Center action is to make sure that the symbol will be re-positioned
    // to make sure its geometry center is at the point given. And the parameter input
    // alignCenter will switch it on/off
    if (alignCenter) attrs.push(`translate(${-width/2},${-height/2})`);
    if (attrs.length < 1) return "";
    return `transform="${attrs.join(" ")}"`;
  }

  buildSvgOfLink(style?: IHuatuStyle, transform?: IHuatuTransform, alignCenter?: boolean): string {
    const scale = HuatuTransform.judgeScale(transform);
    let width  = scale * this.getWidth(),
        height = scale * this.getHeight();
    const attrs: string[] = [];
    attrs.push(`xlink:href="#${this.buildId()}"`);
    attrs.push(`href="#${this.buildId()}"`);
    attrs.push(`width="${width}"`);
    attrs.push(`height="${height}"`);
    attrs.push(this.buildTransformStr(transform, alignCenter));
    attrs.push(HuatuStyle.buildForSvg(style));
    return `<use ${attrs.join(" ")} />`;
  }

}
