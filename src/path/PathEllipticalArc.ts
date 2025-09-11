/**
 * The class implementation of SVG Elliptical Path.
 * Mostly this will be some "Segment" of another path.
 */

import { AngDeg } from "../geometry/AngDeg.js";
import Polygon from "../geometry/Polygon.js";
import Ellipse from "../geometry/Ellipse.js";
import LineSeg from "../geometry/LineSeg.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";

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
import { SvgCsts } from "../svg/SvgConstants.js";

export class PathEllipticalArc extends PathGeneric implements ISvgPathSegment {
  public pStart: SvgPoint = new SvgPoint(0, 0);
  public pEnd: SvgPoint = new SvgPoint(0, 0);

  public isEnlarged: boolean = false;
  public isStartSeg: boolean = false;
  public closePath: boolean = false;

  public auxModel: EllipticalArc | undefined = undefined;
  public auxEllipse?: Ellipse;

  constructor() {
    // Please NOTE that, the constructor will not be used, please use the static method fromXXXX
    super();
  }

  getPathAttr(): string[] {
    return [`d="${this.buildPathData()}"`];
  }

  buildPathData(): string {
    if (!(this.auxModel && this.auxModel.isValid)) return "";
    return `M${this.pStart.toCoors()} ${this.buildPureArc()}`;
  }

  buildPureArc(): string {
    if (!(this.auxModel && this.auxModel.isValid)) return "";
    const rxy = `${this.auxModel.rx.toFixed(SvgCsts.COORS_DIGITS)},${this.auxModel.ry.toFixed(SvgCsts.COORS_DIGITS)}`;
    const rot = `${this.auxModel?.rotDeg.toFixed(SvgCsts.COORS_DIGITS_MIN)}`;
    const arcAndCw = `${this.auxModel.largeArc ? '1' : '0'},${this.auxModel.cw ? '1' : '0'}`
    return `A ${rxy} ${rot} ${arcAndCw} ${this.pEnd.toCoors()}`;
  }

  /* Functions for the role as Path Segment */
  buildSegPathData(): string {
    return (this.isStartSeg ? `M${this.pStart.toCoors()} ` : ``)
      + this.buildPureArc()
      + (this.closePath ? " z": "");
  }

  moveBy(dx: number, dy: number): ISvgPathSegment | undefined {
    if (!this.auxModel) return undefined;
    const model = this.auxModel.moveBy(dx, dy);
    return model ? PathEllipticalArc.fromArc(model as EllipticalArc) : undefined;
  }

  rotateBy(rotDeg: number, at?: ISvgPoint | undefined): ISvgPathSegment | undefined {
    if (!this.auxModel) return undefined;
    const model = this.auxModel.rotateBy(rotDeg, at);
    return model ? PathEllipticalArc.fromArc(model as EllipticalArc) : undefined;
  }

  reverse(): ISvgPathSegment | undefined {
    if (!this.auxModel || !this.auxEllipse) return undefined;
    return PathEllipticalArc.fromStartEndPoints(
      this.pEnd,
      this.pStart,
      this.auxEllipse.rx,
      this.auxEllipse.ry,
      this.auxModel.largeArc,
      !this.auxModel.cw,
      this.auxModel.rotDeg
    );
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    if (!this.auxEllipse || !this.auxModel) return undefined;
    dir = dir === "right" ? (this.auxModel.cw ? "in" : "out")
        : dir === "left" ? (this.auxModel.cw ? "out" : "in")
        : dir;
    let ell = this.auxEllipse.duplicateTo(distance, dir);
    if (!ell) return undefined;
    return PathEllipticalArc.fromArc(
      EllipticalArc.fromEllipse(
        ell,
        AngDeg.ang2Deg(this.auxModel.angStart),
        AngDeg.ang2Deg(this.auxModel.angEnd),
        this.auxModel.cw));
  }

  makeSubPath(pStart: ISvgPoint, pEnd: ISvgPoint): PathEllipticalArc | undefined {
    if (!this.auxModel) return undefined;
    let arc = this.auxModel.makeSubSeg(pStart, pEnd);
    if (!arc) return undefined;
    return PathEllipticalArc.fromArc(arc);
  }

  // Static methods, builders/constructors

  static fromStartEndPoints(
    pStart: ISvgPoint,
    pEnd: ISvgPoint,
    rx: number,
    ry: number,
    largeArc: boolean,
    cw: boolean,
    rotDeg?: number
  ): PathEllipticalArc {
    const path = new PathEllipticalArc();
    const arc = EllipticalArc.fromStartEndPoints(pStart, pEnd, rx, ry, largeArc, cw, rotDeg);
    if (!arc.isValid) return path;
    path.pStart = new SvgPoint(pStart.x, pStart.y);
    path.pEnd = new SvgPoint(pEnd.x, pEnd.y);
    path.auxModel = arc;
    path.auxEllipse = arc.auxEllipse;

    path.bbox = SvgBBox.fromMaxMins(path.auxModel.xMin, path.auxModel.xMax, path.auxModel.yMin, path.auxModel.yMax);
    path.realPoints.push(path.pStart, path.pEnd);
    path.centers.push(new SvgPoint(path.auxModel.cx, path.auxModel.cy));

    path.models = [arc];
    return path;
  }

  static fromArc(arc: EllipticalArc): PathEllipticalArc {
    const path = new PathEllipticalArc();
    if (!arc.isValid) return path;
    path.auxModel = arc;
    path.auxEllipse = arc.auxEllipse;
    path.pStart = new SvgPoint(arc.pStart.x, arc.pStart.y);
    path.pEnd = new SvgPoint(arc.pEnd.x, arc.pEnd.y);
    path.bbox = SvgBBox.fromMaxMins(arc.xMin, arc.xMax, arc.yMin, arc.yMax);
    path.realPoints.push(path.pStart, path.pEnd);
    path.centers.push(new SvgPoint(arc.cx, arc.cy));
    path.models = [arc];
    return path;
  }

}

