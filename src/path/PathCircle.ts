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

export class PathCircle extends PathGeneric {
  radius: number;
  cx: number;
  cy: number;
  center: SvgPoint;
  auxCircle: Circle;

  constructor(cx: number, cy: number, r: number) {
    super();
    this.pathTag = "circle";
    this.cx = cx;
    this.cy = cy;
    this.radius = r;
    this.center = new SvgPoint(cx, cy);
    this.centers.push(this.center);
    this.auxCircle = new Circle(cx, cy, r);
    this.bbox = SvgBBox.fromMaxMins(cx - r, cx + r, cy - r, cy + r);
    this.models = [this.auxCircle];
  }

  getPathAttr(): string[] {
    return [
      `cx="${this.center.x.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `cy="${this.center.y.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `r="${this.radius.toFixed(SvgCsts.COORS_DIGITS)}"`
    ];
  }

  buildPathData(): string {
    const path = new PathSegmentedPath();
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 0,    90, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 90,  180, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 180, 270, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 270,   0, true)));
    path.closePath();
    // console.log(path.buildBBoxesSvg());
    return path.buildPathData();
  }

  buildSegmentedPathData(cw?: "cw" | "ccw") {
    const path = new PathSegmentedPath();
    path.addSeg(...this.toPathSegments(undefined, cw));
    path.closePath();
    return path.buildPathData();
  }

  toPathSegments(radius?: number | number[], cw?: "cw" | "ccw"): ISvgPathSegment[] {
    const segs = cw && cw === "cw" ? [
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 0,    90, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 90,  180, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 180, 270, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 270,   0, true))
    ] : [
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 0,   270, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 270, 180, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 180,  90, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromCircle(this.auxCircle, 90,    0, false))
    ]
    segs[segs.length - 1].closePath = true;
    return segs;
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    dir = dir === "right" ? "in"
      : dir === "left" ? "out"
      : dir;
    let circ = this.auxCircle.duplicateTo(distance, dir);
    return circ ? PathCircle.fromCircle(circ) : undefined;
  }
  
  getLength(): number {
    return 2 * Math.PI * this.radius
  }

  // Static Methods

  static fromCircle(circ: Circle): PathCircle {
    return new PathCircle(circ.cx, circ.cy, circ.r);
  }

}



