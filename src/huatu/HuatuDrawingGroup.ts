
import type {
  IHuatuDrawingElement,
  IHuatuDrawingGroup,
  IHuatuFinalDraw,
  IHuatuStyle,
  IHuatuTransform,
  SvgBuildType,
} from "./IHuatu.js";

import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { HuatuTransform } from "./HuatuTransform.js";

export class HuatuDrawingGroup implements IHuatuDrawingGroup, IHuatuDrawingElement {
  name: string;
  desc?: string;
  bbox: ISvgBBox = SvgBBox.DUMMY;
  elements: IHuatuFinalDraw[] = [];
  bboxes: ISvgBBox[] = [];

  acceptStyle: boolean = true;        // Normally all the kind of groups will accept style settings
  acceptTransform: boolean = false;
  transformForSymbol: boolean = false;

  linkable: boolean = false;

  constructor(name: string, desc?: string) {
    this.name = name;
    this.desc = desc;
  }

  getLinkId():string {
    return "";
  }

  addElement(element: IHuatuFinalDraw) {
    let bbox = element.getBBox();
    this.bboxes.push(bbox);
    this.bbox = this.bbox.mergeAnother(bbox);
    this.elements.push(element);
  }

  getBBox(style?: IHuatuStyle): ISvgBBox {
    return this.bbox.extendByStroke(HuatuStyle.judgeStrokeWidth(style));
  }

  buildHtml(buildType: SvgBuildType, style?: IHuatuStyle, transform?: IHuatuTransform | undefined): string {
    const attrs: string[] = [];
    if (this.acceptStyle) attrs.push(HuatuStyle.buildForSvg(style, buildType === "direct"));
    if (this.acceptTransform) {
      if (!this.transformForSymbol)  {
        attrs.push(HuatuTransform.buildTransformStrForBlockAndPath(transform));
      }
    }
    const htmlDirect = `<g ${attrs.join(" ")} >\n`
      + (this.desc? `<desc>${this.desc}</desc>\n` : ``)
      + this.elements.map(e => e.buildHtml(buildType)).join("\n")
      + `\n</g>`;
    if (buildType === "direct") {
      return htmlDirect;
    }
    if (this.linkable) {
      return `<use xlink:href="#${this.getLinkId()}" href="#${this.getLinkId()}" ${attrs.join(" ")} />`;
    }
    // If not linkable, then return the same as "direct" but with giving "linking" to sub elements
    return htmlDirect;
  }

}
