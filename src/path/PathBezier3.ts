/**
 * The class implementation of SVG Elliptical Path.
 * Mostly this will be some "Segment" of another path.
 */

import Polygon from "../geometry/Polygon.js";
import Ellipse from "../geometry/Ellipse.js";
import LineSeg from "../geometry/LineSeg.js";
import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgPath,
  ISvgPathSegment,
  ISvgPoint,
} from "../svg/ISvg.js";

import { PathGeneric } from "./PathGeneric.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { Bezier3 } from "../geometry/Bezier.js";
import { PathSegmentedPath } from "./PathSegmentedPath.js";

export class PathBezier3 extends PathGeneric implements ISvgPathSegment {
  public pStart: SvgPoint;
  public pEnd: SvgPoint;
  public pControl1: SvgPoint;
  public pControl2: SvgPoint;
  public isStartSeg: boolean = false;
  public closePath: boolean = false;
  public auxModel: Bezier3;

  constructor(
    pStart: ISvgPoint,
    pCtrl1: ISvgPoint,
    pCtrl2: ISvgPoint,
    pEnd: ISvgPoint)
  {
    super();
    this.pStart = new SvgPoint(pStart.x, pStart.y);
    this.pEnd = new SvgPoint(pEnd.x, pEnd.y);
    this.pControl1 = new SvgPoint(pCtrl1.x, pCtrl1.y);
    this.pControl2 = new SvgPoint(pCtrl2.x, pCtrl2.y);
    this.auxModel = new Bezier3(pStart, pCtrl1, pCtrl2, pEnd);
    this.models = [this.auxModel];
    let xMin = this.pStart.x,
        xMax = this.pStart.x,
        yMin = this.pStart.y,
        yMax = this.pStart.y;
    for (let t = 1; t > 0; t -= 3e-3) {
      const p = this.auxModel.calcPoint(t);
      xMin = Math.min(xMin, p.x);
      xMax = Math.max(xMax, p.x);
      yMin = Math.min(yMin, p.y);
      yMax = Math.max(yMax, p.y);
    }
    this.bbox = new SvgBBox(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  getPathAttr(): string[] {
    return [`d="${this.buildPathData()}"`];
  }

  buildPathData(): string {
    return `M${this.pStart.toCoors()} ${this.buildPureCurve()}`;
  }

  buildPureCurve(): string {
    return `C${this.pControl1.toCoors()} ${this.pControl2.toCoors()} ${this.pEnd.toCoors()}`;
  }

  /* Functions for the role as Path Segment */
  buildSegPathData(): string {
    return (this.isStartSeg ? `M${this.pStart.toCoors()} ` : ``)
      + this.buildPureCurve()
      + (this.closePath ? " z": "");
  }

  moveBy(dx: number, dy: number): ISvgPathSegment | undefined {
    const model = this.auxModel.moveBy(dx, dy);
    return model ? PathBezier3.fromBezier3(model as Bezier3) : undefined;
  }

  rotateBy(rotDeg: number, at?: ISvgPoint | undefined): ISvgPathSegment | undefined {
    const model = this.auxModel.rotateBy(rotDeg, at);
    return model ? PathBezier3.fromBezier3(model as Bezier3) : undefined;
  }

  reverse(): ISvgPathSegment | undefined {
    return new PathBezier3(this.pEnd, this.pControl2, this.pControl1, this.pStart);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    dir = dir === "in" ? (this.auxModel.isCw() ? "right" : "left")
      : dir === "out" ? (this.auxModel.isCw() ? "left" : "right")
      : dir;
    const b3 = this.auxModel.duplicateTo(distance, dir);
    if (Array.isArray(b3)) {
      const path = new PathSegmentedPath();
      b3.forEach(x => path.addSeg(PathBezier3.fromBezier3(x)));
      return path;
    }
    else if (b3) {
      return PathBezier3.fromBezier3(b3);
    }
    else {
      return undefined;
    }
  }

  makeSubPath(pStart: ISvgPoint, pEnd: ISvgPoint): PathBezier3 | undefined {
    let b3 = this.auxModel.makeSubSeg(pStart, pEnd);
    if (!b3) return undefined;
    return PathBezier3.fromBezier3(b3);
  }
  
  // Static methods

  static fromBezier3(bezier: Bezier3): PathBezier3 {
    return new PathBezier3(bezier.pStart, bezier.ctrlPoint1, bezier.ctrlPoint2, bezier.pEnd);
  }

}



