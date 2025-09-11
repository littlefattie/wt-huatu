/**
 * The class implementation of SVG Line.
 */

import Polygon from "../geometry/Polygon.js";
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
import { PathEllipticalArc } from "./PathEllipticalArc.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { WtMath } from "../math/WtMath.js";
import { PathLine } from "./PathLine.js";
import LineSeg from "../geometry/LineSeg.js";
import { AngDeg } from "../geometry/AngDeg.js";
import type { IPoint } from "../geometry/IGeometry.js";

export class PathPolygon extends PathGeneric {
  public points: SvgPoint[];
  public polygon: Polygon;
  public angArcRadius: number | number[] = 0;

  constructor(...points: ISvgPoint[]) {
    super();
    this.points = points.map(p => new SvgPoint(p.x, p.y));
    this.polygon = new Polygon(...this.points);
    this.realPoints.push(...this.points);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    this.bbox = SvgBBox.fromMaxMins(
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys)
    )
    this.models = [this.polygon];
  }

  setAngArcRadius(radius: number | number[]) {
    this.angArcRadius = radius;
    this.pathTag = "path";
  }

  removeAngArcRadius() {
    this.angArcRadius = 0;
    this.pathTag = "polygon"
  }

  getPathAttr(): string[] {
    const attr = (this.pathTag === "polygon")
      ? `points="${this.points.map(p => p.toCoors()).join(" ")}"`
      : `d="${this.buildPathData()}"`
    return [attr];
  }

  buildPathData(angArcRadius?: number | number[]): string {
    if (!this.polygon.isValid) return "";
    const radius = angArcRadius || this.angArcRadius;
    // No radius
    if (typeof radius === "number" && WtMath.isZero(radius)) {
      return this.points.map((p, idx) => `${idx === 0 ? 'M':'L'}${p.toCoors()}`).join(" ") + ' z';
    }
    const angRadius = WtMath.expandRadius(this.points.length, radius);
    return this.polygon.getAngles(true)
      .map((a, idx) => {
        const aps = a.getArcPoints(angRadius[idx]);
        const mOrL = idx === 0 ? "M" : "L";
        const ellArc = PathEllipticalArc.fromStartEndPoints(aps.pArcStart, aps.pArcEnd, aps.r, aps.r, false , aps.cw);
        return aps.hasArc
          ? `${mOrL}${SvgPoint.toCoors(aps.pArcStart)} ${ellArc.buildPureArc()}`
          : `${mOrL}${SvgPoint.toCoors(aps.pStart)}`;
      }).join(" ") + " z";
  }

  getLength(): number {
    return this.polygon.angles.map(a => a.lineOA.len).reduce((sum, l) => sum + l, 0);
  }

  toAngleArced(radius?: number | number[]) {
    if (!radius) return this;
    // Copy the polygon to make a new Path
    const path = PathPolygon.fromPolygon(this.polygon)!;
    path.setAngArcRadius(radius);
    return path;
  }

  toPathSegs(radius?: number | number[]): ISvgPathSegment[] {
    if (!this.polygon.isValid) return [];
    const segments: ISvgPathSegment[] = [];
    // No radius
    if (!radius || 
        (typeof radius === "number" && WtMath.isZero(radius)) ||
        (Array.isArray(radius) && radius.length < 1)) {
      this.points.forEach((p, idx) => {
        if (idx < this.points.length - 1) {
          segments.push(PathLine.fromEnds(this.points[idx], this.points[idx + 1]));
        } else {
          const seg = PathLine.fromEnds(this.points[idx], this.points[0]);
          seg.closePath = true;
          segments.push(seg)
        }
      });
      return segments;
    }
    // Has radius
    const angRadius = WtMath.expandRadius(this.points.length, radius);
    const angles = this.polygon.getAngles(true);
    let lastPoint: ISvgPoint = angles[0].pA;
    angles.forEach((a, idx) => {
      const aps = a.getArcPoints(angRadius[idx]);
      const ellArc = PathEllipticalArc.fromStartEndPoints(aps.pArcStart, aps.pArcEnd, aps.r, aps.r, false , aps.cw);
      if (aps.hasArc) {
        segments.push(PathLine.fromEnds(lastPoint, aps.pArcStart), ellArc);
        lastPoint = aps.pArcEnd;
      } else {
        segments.push(PathLine.fromEnds(lastPoint, aps.pStart));
        lastPoint = aps.pStart;
      }
    })
    const lastSeg = PathLine.fromEnds(lastPoint, angles[0].pA);
    lastSeg.closePath = true;
    segments.push(lastSeg);
    return segments;
  }

  toCwOrCcw(cw?: "cw" | "ccw") {
    // If it is invalid, then return itself, because it will not make anything since it is invalid
    // And if cw/ccw not specified, it will use the default case
    if (!this.polygon.isValid || !cw) return this;
    // Judge if the original polygon is cw or ccw, and reverse points order accordingly
    let isCw = this.polygon.isCw(),
        pts = (cw === "cw" && isCw) || (cw === "ccw" && !isCw)
          ? this.points 
          : this.points.map((p, i) => this.points[i === 0 ? 0 : this.points.length - i]);
    return new PathPolygon(...pts);
  }

  toPathSegments(radius?: number | number[], cw?: "cw" | "ccw"): ISvgPathSegment[] {
    if (!this.polygon.isValid) return [];
    return this.toCwOrCcw(cw).toPathSegs(radius);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    if (!this.polygon.isValid) return undefined;
    let isCw = this.polygon.isCw();
    dir = dir === "in" ? (isCw ? "right" : "left")
    : dir === "out" ? (isCw ? "left" : "right")
    : dir
    const plg = this.polygon.duplicateTo(distance, dir);
    return plg ? PathPolygon.fromPolygon(plg) : undefined;
  }

  // Static methods

  static fromPolygon(plg: Polygon): PathPolygon | undefined {
    if (plg.isValid) return new PathPolygon(...plg.points);
    return undefined;
  }

}
