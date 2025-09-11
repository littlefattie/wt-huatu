/**
 * The class implementation of SVG Line.
 */

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
import type { ILineSeg } from "../geometry/IGeometry.js";
import LineSeg from "../geometry/LineSeg.js";

export class PathLine extends PathGeneric implements ISvgPathSegment {
  public pStart: SvgPoint;
  public pEnd: SvgPoint;
  public auxModel: LineSeg;
  public isStartSeg: boolean = false;
  public closePath: boolean = false;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    super();
    this.pathTag = "line";
    this.pStart = new SvgPoint(x1, y1);
    this.pEnd = new SvgPoint(x2, y2);
    this.realPoints.push(this.pStart, this.pEnd);
    this.bbox = SvgBBox.fromMaxMins(x1, x2, y1, y2);
    this.auxModel = new LineSeg(this.pStart, this.pEnd);
    this.models = [this.auxModel];
  }

  getPathAttr(): string[] {
    return [
      `x1="${this.pStart.x.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `y1="${this.pStart.y.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `x2="${this.pEnd.x.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `y2="${this.pEnd.y.toFixed(SvgCsts.COORS_DIGITS)}"`
    ];
  }

  buildPathData(): string {
    return `M${this.pStart.toCoors()} L${this.pEnd.toCoors()}`;
  }

  getLength(): number {
    return Math.sqrt(this.bbox.w ** 2 + this.bbox.h ** 2);
  }

  /* Functions for the role as Path Segment */
  buildSegPathData(): string {
    return (this.isStartSeg ? `M${this.pStart.toCoors()}` : "")
      + ` L${this.pEnd.toCoors()}`
      + (this.closePath ? " z": "");
  }

  moveBy(dx: number, dy: number): ISvgPathSegment | undefined {
    const ls = new LineSeg(this.pStart, this.pEnd).moveBy(dx, dy);
    return PathLine.fromLineSeg(ls as LineSeg);
  }

  rotateBy(rotDeg: number, at?: ISvgPoint | undefined): ISvgPathSegment | undefined {
    const ls = new LineSeg(this.pStart, this.pEnd).rotateBy(rotDeg, at);
    return PathLine.fromLineSeg(ls as LineSeg);
  }

  reverse(): ISvgPathSegment | undefined {
    return PathLine.fromEnds(this.pEnd, this.pStart);
  }
  
  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined { 
    dir = dir === "in" ? "right"
      : dir === "out" ? "left"
      : dir;
    return PathLine.fromLineSeg(this.auxModel.duplicateTo(distance, dir));
  }
  
  makeSubPath(pStart: ISvgPoint, pEnd: ISvgPoint): PathLine | undefined {
    let ls = this.auxModel.makeSubSeg(pStart, pEnd);
    if (!ls) return undefined;
    return PathLine.fromLineSeg(ls as LineSeg);
  }

  /** Static methods  */
  static fromEnds(pStart: ISvgPoint, pEnd: ISvgPoint) {
    return new PathLine(pStart.x, pStart.y, pEnd.x, pEnd.y);
  }

  static fromLineSeg(seg: ILineSeg) {
    return new PathLine(seg.pStart.x, seg.pStart.y, seg.pEnd.x, seg.pEnd.y);
  }

}

