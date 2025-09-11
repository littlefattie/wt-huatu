/**
 * The class implementation of SVG Line.
 */

import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgPathSegment,
  ISvgPoint,
} from "../svg/ISvg.js";

import { PathGeneric } from "./PathGeneric.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import LineSeg from "../geometry/LineSeg.js";
import type { ILineSeg, IPoint } from "../geometry/IGeometry.js";

export class PathLines extends PathGeneric {
  public lines: LineSeg[] = [];

  constructor() {
    super();
  }

  addLine(pStart: IPoint, pEnd: IPoint) {
    const ls = new LineSeg(pStart, pEnd);
    this.lines.push(ls);
    this.models.push(ls)
  }

  addLineSegs(...segs: LineSeg[]) {
    this.lines.push(...segs);
    this.models.push(...segs);
  }
  
  getPathAttr(): string[] {
    return [`d="${this.buildPathData()}"`];
  }

  buildPathData(): string {
    if (this.lines.length < 1) return "";
    return this.lines
      .map(l => `M${SvgPoint.toCoors(l.pStart)} L${SvgPoint.toCoors(l.pEnd)}`)
      .join(" ");;
  }

  getLength(): number {
    return this.lines.map(l => l.len)
      .reduce((sum, len) => sum + len, 0);
  }

  /** Static methods  */
  static fromLineSegments(...lines: LineSeg[]) {
    const path = new PathLines();
    if (lines.length < 1) return path;
    lines.forEach(l => {
      path.addLine(l.pStart, l.pEnd);
    })
    return path;
  }
}
