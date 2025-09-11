
import type {
  IGeometryModel,
  IPoint
} from "../geometry/IGeometry.js";

import type {
  IHuatuDefinable,
  IHuatuDrawingElement,
  IHuatuPath,
  IHuatuPathSeries,
  IHuatuPoint,
  IHuatuStyle,
  IHuatuTransform,
  SvgBuildType
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgBBox, ISvgPath, ISvgPoint } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuTransform } from "./HuatuTransform.js";
import { HuatuPath } from "./HuatuPath.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuPathSeries implements IHuatuPathSeries, IHuatuDrawingElement, IHuatuDefinable {
  name?: string;
  paths: ISvgPath[] = [];
  models: IGeometryModel[] = [];

  refCount: number = 0;
  alwaysInDef: boolean = false;
  magicId: string;

  constructor(name?: string, paths?: ISvgPath[]) {
    this.name = name;
    if (paths && paths.length > 0) this.paths = paths;
    this.magicId = genHex(8);
  }

  buildId(): string {
    return `ps-${this.magicId}`;
  }

  buildHtmlForDef(): string {
    return `<g id="${this.buildId()}" >\n`
      +  this.paths.map(p => p.buildPathHtmlOnly()).join("\n")
      + `\n</g>`;
  }

  buildHtml(buildType: SvgBuildType, style?: IHuatuStyle | undefined, transform?: IHuatuTransform | undefined): string {
    const attrs: string[] = [];
    attrs.push(HuatuStyle.buildForSvg(style, buildType === "direct"));
    if (transform) attrs.push(HuatuTransform.buildTransformStrForBlockAndPath(transform));    
    return buildType === "direct"
      ? `<g ${attrs.join(" ")} >\n${this.paths.map(p => p.buildPathHtmlOnly()).join("\n")}\n</g>`
      : `<use xlink:href="#${this.buildId()}" href="#${this.buildId()}" ${attrs.join(" ")} />`;
  }

  getBBox(): ISvgBBox {
    return SvgBBox.mergeBoxes(this.paths.map(p => p.bbox));
  }

  // Static methods

  static fromModels(models: IGeometryModel[], name?: string): HuatuPathSeries {
    const series  = new HuatuPathSeries(name);
    models.forEach(m => {
      const path = HuatuPath.model2Path(m);
      if  (path) {
        series.paths.push(path);
        series.models.push(m);
      }
    });
    return series;
  }

}
