/**
 * The class implementation of SVG Basic Shape of Circle.
 */

import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgPath,
  ISvgPathSegment,
} from "../svg/ISvg.js";

import { PathGeneric } from "./PathGeneric.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import Circle from "../geometry/Circle.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";
import { PathSegmentedPath } from "./PathSegmentedPath.js";
import { PathEllipticalArc } from "./PathEllipticalArc.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import Ring from "../geometry/Ring.js";
import { PathBezier3 } from "./PathBezier3.js";

export class PathRing extends PathGeneric {
  cx: number;
  cy: number;
  center: SvgPoint;
  auxRing: Ring;

  constructor(cx: number, cy: number, r1: number, r2: number) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.center = new SvgPoint(cx, cy);
    this.centers.push(this.center);
    this.auxRing = new Ring(cx, cy, r1, r2);
    this.bbox =  SvgBBox.fromMaxMins(
      cx - this.auxRing.rLong,
      cx + this.auxRing.rLong,
      cy - this.auxRing.rLong,
      cy + this.auxRing.rLong);
    this.models = [this.auxRing];
  }

  getPathAttr(): string[] {
    return [`d="${this.buildPathData()}"`];
  }

  buildPathData(): string {
    const segsOut = this.auxRing.cOut.buildBezier3Simulate().map(x => PathBezier3.fromBezier3(x));    // CW
    segsOut[segsOut.length - 1].closePath = true;
    const segsIn = this.auxRing.cIn.buildBezier3Simulate(true).map(x => PathBezier3.fromBezier3(x));  // CCW
    segsIn[segsIn.length - 1].closePath = true;

    const path = new PathSegmentedPath();
    path.addSeg(...segsOut, ...segsIn);
    return path.buildPathData();
  }

  getLength(): number {
    return this.auxRing.circum;
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    dir = dir === "right" ? "in"
      : dir === "left" ? "out"
      : dir;
    let ring = this.auxRing.duplicateTo(distance, dir);
    return ring ? PathRing.fromRing(ring) : undefined;
  }

  // Static Methods

  static fromRing(ring: Ring): PathRing {
    return new PathRing(ring.cx, ring.cy, ring.rShort, ring.rLong);
  }

}



