/**
 * The class implementation of SVG Line.
 */

import Triangle from "../geometry/Triangle.js";
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
import { PathPolygon } from "./PathPolygon.js";

export class PathTriangle extends PathGeneric {
  public triangle?: Triangle;

  constructor() {
    // Please note that this constructor is not used directly, please use the static formXXXX methods
    super();
  }

  getPathAttr(): string[] {
    if (!this.triangle || !this.triangle.isValid) return [];
    return [`d="${this.buildPathData()}"`];
  }

  buildPathData(angArcRadius?: number): string {
    if (!(this.triangle && this.triangle.isValid)) return "";
    return `M${SvgPoint.toCoors(this.triangle.pA)}`
      + ` L${SvgPoint.toCoors(this.triangle.pB)}`
      + ` L${SvgPoint.toCoors(this.triangle.pC)} z`;
  }

  getLength(): number {
    if (!this.triangle || !this.triangle.isValid) return 0;
    return this.triangle.circum;
  }

  toAngleArced(radius?: number | number[]) {
    if (!radius) return this;
    const plg = this.triangle?.toPolygon();
    if (!plg) return this;
    // Copy the polygon to make a new Path
    const path = PathPolygon.fromPolygon(plg)!;
    path.setAngArcRadius(radius);
    return path;
  }

  toPathSegments(radius?: number | number[], cw?: "cw" | "ccw"): ISvgPathSegment[] {
    if (!this.triangle || !this.triangle.isValid) return [];
    return PathPolygon.fromPolygon(this.triangle!.toPolygon(cw)!)!.toPathSegs(radius);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    if (!this.triangle) return undefined;
    dir = dir === "right" ? "in"
      : dir === "left" ? "out"
      : dir;
    let tri = this.triangle.duplicateTo(distance, dir);
    return tri ? PathTriangle.fromTriangle(tri) : undefined;
  }

  // Static methods
  static fromPoints(...points: ISvgPoint[]): PathTriangle {
    const path = new PathTriangle();
    if (points.length < 3) return path;
    const triangle = new Triangle(points[0], points[1], points[2]);
    path.triangle = triangle;
    path.models = [triangle];
    if (triangle.isValid) {
      const vertices = [
        SvgPoint.from(triangle.pA),
        SvgPoint.from(triangle.pB),
        SvgPoint.from(triangle.pC)];
      path.realPoints.push(...vertices);
      const xs = vertices.map(p => p.x);
      const ys = vertices.map(p => p.y);
      path.bbox = SvgBBox.fromMaxMins(
        Math.min(...xs),
        Math.max(...xs),
        Math.min(...ys),
        Math.max(...ys)
      );
    }
    return path;
  }

  static fromTriangle(tri: Triangle): PathTriangle {
    const path = new PathTriangle();
    path.triangle = tri;
    path.models = [tri];
    if (tri.isValid) {
      path.realPoints.push(SvgPoint.from(tri.pA), SvgPoint.from(tri.pB), SvgPoint.from(tri.pC));
      const xs = path.realPoints.map(p => p.x),
            ys = path.realPoints.map(p => p.y);
      path.bbox = SvgBBox.fromMaxMins(
        Math.min(...xs),
        Math.max(...xs),
        Math.min(...ys),
        Math.max(...ys),
      )
      path.centers.push(SvgPoint.from(tri.cirInner!.center), SvgPoint.from(tri.cirOuter!.center));
    }
    return path;
  }

}



