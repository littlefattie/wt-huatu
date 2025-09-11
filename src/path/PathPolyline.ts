/**
 * The class implementation of SVG Polyline.
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
import Line from "../geometry/Line.js";
import LineSeg from "../geometry/LineSeg.js";
import type { ILineSeg, IPolyLine } from "../geometry/IGeometry.js";
import { WtMath } from "../math/WtMath.js";
import { PathLine } from "./PathLine.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { fitNumInRange } from "../tools/utils.js";
import { PathBezier3 } from "./PathBezier3.js";
import { PathSegmentedPath } from "./PathSegmentedPath.js";
import Angle from "../geometry/Angle.js";
import { PathPolygon } from "./PathPolygon.js";
import PolyLine from "../geometry/PolyLine.js";
import Point from "../geometry/Point.js";
import { SegmentModel } from "../geometry/SegmentModel.js";

export class PathPolyline extends PathGeneric {
  static SMOOTH_FACTOR_DEFAULT = 0.44;
  static SMOOTH_FACTOR_MIN = 0.02;
  static SMOOTH_FACTOR_MAX = 0.88;

  points: SvgPoint[];
  close: boolean = false;
  public angArcRadius: number | number[] = 0;

  constructor(...points: ISvgPoint[]) {
    super();
    this.pathTag = "polyline";
    this.points = points.map(p => new SvgPoint(p.x, p.y));
    this.realPoints.push(...this.points);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    this.bbox = SvgBBox.fromMaxMins(
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys)
    )
    this.models = (this.toPathSegments() as PathLine[]).map(s => s.auxModel);
  }

  makeClose() {
    this.close = true;
    this.pathTag = "path";
  }

  getPathAttr(): string[] {
    if (this.pathTag === "polyline" && !this.close) {
      return [`points="${this.points.map(p => p.toCoors()).join(" ")}"`]
    } else {
      return [`d="${this.buildPathData()}"`];
    }
  }

  buildPathData(angArcRadius?: number | number[]): string {
    const radius = angArcRadius || this.angArcRadius;
    // No radius
    if (typeof radius === "number" && WtMath.isZero(radius)) {
      return this.points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.toCoors()}`).join(" ")
        + (this.close ? " z" : "");
    }
    if (this.close) {
      return new PathPolygon(...this.points).toAngleArced().buildPathData(radius);
    }
    const dedupPoints = Point.deDupRepeated(this.points, SegmentModel.DE_DUP_THRESHOLD);
    const angRadius = WtMath.expandRadius(dedupPoints.length - 2, radius);
    const middleArcs = dedupPoints.reduce(
        (a, p, i) => {
          if (i < dedupPoints.length - 2) {
            const pStart = new LineSeg(dedupPoints[i], dedupPoints[i + 1]).middle;
            const pEnd = new LineSeg(dedupPoints[i + 1], dedupPoints[i + 2]).middle;
            return [...a, new Angle(pStart, dedupPoints[i + 1], pEnd)];
          } else {
            return a;
          }
        },
        [] as Angle[])
      .map((a, idx) => {
        const aps = a.getArcPoints(angRadius[idx]);
        const ellArc = PathEllipticalArc.fromStartEndPoints(aps.pArcStart, aps.pArcEnd, aps.r, aps.r, false , aps.cw);
        return aps.hasArc
          ? `L${SvgPoint.toCoors(aps.pArcStart)} ${ellArc.buildPureArc()}`
          : `L${SvgPoint.toCoors(aps.pStart)}`;
      })
      .join(" ");
    return `M${SvgPoint.toCoors(dedupPoints[0])} ${middleArcs} L${SvgPoint.toCoors(dedupPoints[dedupPoints.length - 1])}`;
  }

  getLength(): number {
    return this.points
      .map((p, idx) => idx === 0 ? 0 : new LineSeg(this.points[idx - 1], p).len)
      .reduce((sum, l) => sum + l, 0);
  }

  toAngleArced(radius?: number | number[]) {
    if (!radius) return this;
    // Re-build the polyline and add radius
    const path = new PathPolyline(...this.points);
    path.angArcRadius = radius;
    path.pathTag = "path";
    return path;
  }

  toSmoothed(
    factor: number = 3,
    mode: "normal" | "xy" = "normal"
  ): PathSegmentedPath {
    const path = new PathSegmentedPath();
    if (this.points.length < 2) return path;
    if (this.points.length < 3) {
      path.addSeg(PathLine.fromEnds(this.points[0], this.points[1]));
      return path;
    };
    // Judge Factor
    factor = PathPolyline.calcSmoothFactor(factor);
    // Translate the polyline points into line segments
    const segs: LineSeg[] = [];
    let i = 0;
    let pStart: SvgPoint | undefined = undefined;
    while(i < this.points.length - 1) {
      pStart = pStart ?? this.points[i];
      const seg = new LineSeg(pStart, this.points[i + 1]);
      if (!WtMath.isZero(seg.len)) {
        segs.push(seg);
        pStart = undefined;
      }
      i++;
    }
    if (segs.length < 2) {
      path.addSeg(PathLine.fromLineSeg(segs[0]));
      return path;
    }
    const pathSegs: {
      pStart: ISvgPoint;
      pEnd: ISvgPoint;
      angStart: number;
      angEnd: number;
      angLine: number;
      isVert: boolean;
      isHori: boolean;
      segLen: number;
    }[] = [];
    i = 0;
    let angAvg: number = 0;
    while(i < segs.length) {
      const seg = segs[i];
      let angStart: number = seg.ang,
          angEnd: number = AngDeg.fitAng(seg.ang - AngDeg.DEG180);
      if (i === 0) {
        angAvg = AngDeg.fitAng(seg.ang + segs[i + 1].ang) / 2;
        if (AngDeg.absAng(angEnd, angAvg) > AngDeg.DEG90) {   // Make acute angle
          angEnd = AngDeg.fitAng(angAvg - AngDeg.DEG180);
        } else {
          angEnd = angAvg;
        }
      }
      else if (i === segs.length - 1) {
        if (AngDeg.absAng(angStart, angAvg) > AngDeg.DEG90) {
          angStart = AngDeg.fitAng(angAvg - AngDeg.DEG180);
        } else {
          angStart = angAvg;
        }
      }
      else {
        if (AngDeg.absAng(angStart, angAvg) > AngDeg.DEG90) {
          angStart = AngDeg.fitAng(angAvg - AngDeg.DEG180);
        } else {
          angStart = angAvg;
        }
        // Update Average Angle
        angAvg = AngDeg.fitAng(seg.ang + segs[i + 1].ang) / 2;
        if (AngDeg.absAng(angEnd, angAvg) > AngDeg.DEG90) {   // Make acute angle
          angEnd = AngDeg.fitAng(angAvg - AngDeg.DEG180);
        } else {
          angEnd = angAvg;
        }
      }
      pathSegs.push({
        pStart: seg.pStart,
        pEnd: seg.pEnd,
        angStart,
        angEnd,
        angLine: seg.ang,
        isVert: WtMath.isZero(seg.pStart.x - seg.pEnd.x),
        isHori: WtMath.isZero(seg.pStart.y - seg.pEnd.y),
        segLen: seg.len
      })
      i++;
    }
    if (mode === "normal") {
      path.addSeg(...pathSegs.map(seg => new PathBezier3(
        seg.pStart,
        new Line(seg.pStart, seg.angStart).getPointByLen(factor * seg.segLen / 2),
        new Line(seg.pEnd, seg.angEnd).getPointByLen(factor * seg.segLen / 2),
        seg.pEnd))
      );
    } else {      // "xy mode"
      i = 0;
      while (i < pathSegs.length) {
        let seg = pathSegs[i];
        if (seg.isHori || seg.isVert) {
          path.addSeg(PathLine.fromEnds(seg.pStart, seg.pEnd));
        } else {
          let angStartUsed = i > 0 && (pathSegs[i - 1].isVert || pathSegs[i - 1].isHori)
            ? pathSegs[i-1].angLine
            : seg.angStart;
          let angEndUsed = i < pathSegs.length - 1 && (pathSegs[i + 1].isVert || pathSegs[i + 1].isHori)
            ? AngDeg.fitAng(pathSegs[i + 1].angLine - AngDeg.DEG180)
            : seg.angEnd;
          let smoothLen = Math.min(Math.abs(seg.pStart.x - seg.pEnd.x), Math.abs(seg.pStart.y - seg.pEnd.y));
          path.addSeg(new PathBezier3(
            seg.pStart,
            new Line(seg.pStart, angStartUsed).getPointByLen(factor * smoothLen),
            new Line(seg.pEnd, angEndUsed).getPointByLen(factor * smoothLen),
            seg.pEnd
          ));
        }
        i++;
      }
    }
    return path;
  }

  toPathSegments(radius?: number | number[]): ISvgPathSegment[] {
    const segments: ISvgPathSegment[] = [];
    // No radius
    if (!radius ||
        (typeof radius === "number" && WtMath.isZero(radius)) ||
        (Array.isArray(radius) && radius.length < 1)) {
      this.points.forEach((p, idx) => {
        if (idx < this.points.length - 1) {
          segments.push(PathLine.fromEnds(this.points[idx], this.points[idx + 1]));
        }
      });
      if (this.close) {
        segments.push(PathLine.fromEnds(this.points[this.points.length - 1], this.points[0]));
      }
      return segments;
    }

    const dedupPoints = Point.deDupRepeated(this.points, SegmentModel.DE_DUP_THRESHOLD);
    const angRadius = WtMath.expandRadius(dedupPoints.length - 2, radius);
    let lastPoint: ISvgPoint = dedupPoints[0];
    dedupPoints.reduce(
      (a, p, i) => {
        if (i < dedupPoints.length - 2) {
          const pStart = new LineSeg(dedupPoints[i], dedupPoints[i + 1]).middle;
          const pEnd = new LineSeg(dedupPoints[i + 1], dedupPoints[i + 2]).middle;
          return [...a, new Angle(pStart, dedupPoints[i + 1], pEnd)];
        } else {
          return a;
        }
      },
      [] as Angle[])
    .forEach((a, idx) => {
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
    segments.push(PathLine.fromEnds(lastPoint, dedupPoints[dedupPoints.length - 1]));

    return segments;
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    const pln = new PolyLine(...this.points);
    dir = this.points.length < 3
      ? ( dir === "in" ? "right"
        : dir === "out" ? "left"
        : dir)
      : ( dir === "in" ? (pln.isCw() ? "right" : "left")
        : dir === "out" ? (pln.isCw() ? "left" : "right")
        : dir);
    const pln2 = pln.duplicateTo(distance, dir);
    return pln2 ? PathPolyline.fromPolyLine(pln2) : undefined;
  }

  // Static Methods

  static fromPolyLine(line: IPolyLine): PathPolyline | undefined {
    if (!line.isValid) return undefined;
    return new PathPolyline(...line.points);
  }

  static calcSmoothFactor(val: number): number {
    const input = fitNumInRange(val, 1, 10);
    return (input - 1) * (PathPolyline.SMOOTH_FACTOR_MAX - PathPolyline.SMOOTH_FACTOR_MIN) / (10 - 1) + PathPolyline.SMOOTH_FACTOR_MIN;
  }

}
