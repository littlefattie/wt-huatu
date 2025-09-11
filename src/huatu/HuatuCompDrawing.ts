
import type {
  IHuatuStyle,
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuDrawingElement,
  IHuatuTransform,
} from "./IHuatu.js";

import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { HuatuComponentPlacement } from "../component/HuatuComponentPlacement.js";
import type { ISvgBBox } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { genHex } from "../tools/gen-id.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { WtMath } from "../math/WtMath.js";
import { HuatuLabel } from "./HuatuLabel.js";

export class HuatuCompDrawing implements IHuatuDrawingElement {
  magicId: string;
  placement: HuatuComponentPlacement;

  constructor(placement: HuatuComponentPlacement) {
    this.magicId = genHex(8);
    this.placement = placement;
  }

  buildId(): string {
    return `comp-${this.magicId}`;
  }

  getBBox(): ISvgBBox {
    const job = this.placement.huatu?.draw;
    if (!job) return SvgBBox.DUMMY;
    let vb: ISvgBBox = job.vbExplicit ? job.viewBox! : job.getViewBoxWithoutLabels();
    const refPoint = this.placement.refPointType === "center" ? vb.getCenter() : SvgPoint.ORIGIN;
    if (this.placement.mirror) {
      vb = vb.mirrorAt(this.placement.mirror?.includes("x"), this.placement.mirror?.includes("y"), refPoint);
    }
    if (this.placement.rotDeg) {
      vb = vb.rotateAt(refPoint, this.placement.rotDeg);
    }
    if (!job.vbExplicit) {
      const lblBboxes = job.drawings.filter(x => x instanceof HuatuLabel)
        .map(x => x.getBBox());
      vb = vb.mergeAnother(SvgBBox.mergeBoxes(lblBboxes));
    }
    return vb.moveBy(this.placement.location.x - refPoint.x, this.placement.location.y - refPoint.y);
  }

  // Two functions for Drawing Html building, Direct and Linking way
  buildHtml(buildType: SvgBuildType, style?: IHuatuStyle, transform?: IHuatuTransform): string {
    if (!this.placement.huatu?.draw) return "";
    let refPoint = this.placement.getRefPoint();
    let isRefPointOrigin = WtMath.isZero(refPoint.x) && WtMath.isZero(refPoint.y);
    const realLoc = isRefPointOrigin
      ? this.placement.location
      : new SvgPoint(this.placement.location.x - refPoint.x, this.placement.location.y - refPoint.y);
    const attrs: string[] = [`id="${this.buildId()}"`];
    if (style) {
      attrs.push(HuatuStyle.buildForSvg(style, buildType === "direct"));
    }
    attrs.push(`transform="translate(${SvgPoint.toCoors(realLoc)})"`);
    let svg = `<g ${attrs.join(" ")} >\n`
    let trans = ``;
    if (this.placement.rotDeg) {
      trans += `rotate(${this.placement.rotDeg}${ isRefPointOrigin ? "" : "," + SvgPoint.toCoors(refPoint)})`;
    }
    let mirrorX = this.placement.mirror?.includes("x"),
        mirrorY = this.placement.mirror?.includes("y");
    let scaleTrans = this.placement.mirror
      ? `scale(${mirrorX ? "-1" : "1"}, ${mirrorY ? "-1" : "1"})`
      : ``;

    if (isRefPointOrigin) {
      trans += ` ${scaleTrans}`
    } else {
      trans += ` translate(${(mirrorX ? 2 * refPoint.x : 0)}, ${mirrorY ? 2 * refPoint.y : 0}) ${scaleTrans}`;
    }
    let svgPlacement = this.placement.huatu.draw.buildHtmlForComponent();
    svg += `<g `;
    if (trans) {
      svg += `transform="${trans}"`
    }
    svg += `>\n`;
    svg += svgPlacement.graphs;
    svg += `\n</g>`;
    svg += svgPlacement.labels;
    svg += `\n</g>`;
    return svg;
  }

}
