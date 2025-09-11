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
import { Bezier2, Bezier3 } from "../geometry/Bezier.js";

export class PathBezier2 extends PathGeneric implements ISvgPathSegment {
  public pStart: SvgPoint;
  public pEnd: SvgPoint;
  public pControl: SvgPoint;
  public isStartSeg: boolean = false;
  public closePath: boolean = false;
  public auxModel: Bezier2;

  constructor(
    pStart: ISvgPoint,
    pCtrl: ISvgPoint,
    pEnd: ISvgPoint)
  {
    super();
    this.pStart = new SvgPoint(pStart.x, pStart.y);
    this.pEnd = new SvgPoint(pEnd.x, pEnd.y);
    this.pControl = new SvgPoint(pCtrl.x, pCtrl.y);
    this.auxModel = new Bezier2(pStart, pCtrl, pEnd);
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
    return `Q${this.pControl.toCoors()} ${this.pEnd.toCoors()}`;
  }

  /* Functions for the role as Path Segment */
  buildSegPathData(): string {
    return (this.isStartSeg ? `M${this.pStart.toCoors()} ` : "")
      + this.buildPureCurve()
      + (this.closePath ? " z": "");
  }

  moveBy(dx: number, dy: number): ISvgPathSegment | undefined {
    const model = this.auxModel.moveBy(dx, dy);
    return model ? PathBezier2.fromBezier2(model as Bezier2) : undefined;
  }

  rotateBy(rotDeg: number, at?: ISvgPoint | undefined): ISvgPathSegment | undefined {
    const model = this.auxModel.rotateBy(rotDeg, at);
    return model ? PathBezier2.fromBezier2(model as Bezier2) : undefined;
  }

  reverse(): ISvgPathSegment | undefined {
    return new PathBezier2(this.pEnd, this.pControl, this.pStart);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    dir = dir === "in" ? (this.auxModel.isCw() ? "right" : "left")
      : dir === "out" ? (this.auxModel.isCw() ? "left" : "right")
      : dir;
    return PathBezier2.fromBezier2(this.auxModel.duplicateTo(distance, dir));
  }

  makeSubPath(pStart: ISvgPoint, pEnd: ISvgPoint): PathBezier2 | undefined {
    let b2 = this.auxModel.makeSubSeg(pStart, pEnd);
    if (!b2) return undefined;
    return PathBezier2.fromBezier2(b2);
  }

  // Static methods

  static fromBezier2(bezier: Bezier2): PathBezier2 {
    return new PathBezier2(bezier.pStart, bezier.ctrlPoint, bezier.pEnd);
  }

}



