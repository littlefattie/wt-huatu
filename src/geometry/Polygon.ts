
import type {
  IGeometryModel,
  ILineSegments,
  IPoint,
  IPolygon
} from './IGeometry.js';

import { AngDeg } from './AngDeg.js';
import { WtMath } from '../math/WtMath.js';

import Point from './Point.js';
import Angle from './Angle.js';
import Line from './Line.js';
import LineSeg from './LineSeg.js';
import Vector from './Vector.js';
import { Intersection } from './Intersection.js';

export default class Polygon implements IPolygon, IGeometryModel, ILineSegments {
  isValid: boolean;
  vertices: number;
  points: IPoint[];
  isConvex: boolean;
  angles: Angle[];

  constructor(...points: IPoint[]) {
    if (!points || points.length < 3) {
      this.isValid = false;
      this.vertices = 0;
      this.points = points ? [...points] : [];
      this.angles = [];
      this.isConvex = false;
    } else {
      this.isValid = true;
      this.vertices = points.length;
      this.points = points.map(p => new Point(p.x, p.y));
      this.isConvex = true;
      this.angles = this.points.map((p, idx) => {
        const pPrev = idx === 0 ? this.points[this.vertices - 1] : this.points[idx - 1];
        const pNext = idx === this.vertices - 1 ? this.points[0] : this.points[idx + 1];
        return new Angle(pPrev, p, pNext);
      });
      const angSum = this.angles.reduce((sum, a) => sum + a.ang, 0);
      this.isConvex = WtMath.isEqual(angSum, (this.vertices - 2) * AngDeg.DEG180);
    }
  }

  private buildLineSeg(i: number): LineSeg {
    i = i < 0 ? 0 : i > this.points.length - 1 ? this.points.length - 1 : i;
    const iEnd = i === this.points.length - 1 ? 0 : i + 1;
    return new LineSeg(this.points[i], this.points[iEnd]);
  }

  toLineSegs() {
    return this.points.map((p, idx) => this.buildLineSeg(idx));
  }

  getPoint(pos: string | number, t?: number): IPoint | undefined {
    if (!this.isValid) return undefined;
    if (typeof pos === "string") return undefined;
    pos = Math.round(pos);
    if (pos < 1 || pos > this.points.length) return undefined;
    const ls = this.buildLineSeg(pos - 1);
    if (!t) return ls.pStart;
    if (WtMath.isIn0and1(t)) return ls.getPoint(t);
    return undefined;
  }

  getAngles(useMiddlePoint?: boolean) {
    if (!this.isValid) return [];
    if (useMiddlePoint) {
      const segs = this.toLineSegs();
      const angles: Angle[] = [];
      return this.toLineSegs().map((seg, idx, segs) => new Angle(
        (idx === 0 ? segs[segs.length - 1] : segs[idx - 1]).middle,
        seg.pStart,
        seg.middle));
    } else {
      return this.angles;
    }
  }

  getParam(name: string): number | undefined {
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new Polygon(...this.points.map(p => Point.moveBy(p, dx, dy)));
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new Polygon(...this.points.map(p => Point.rotateBy(p, rotDeg, at)));
  }

  isCw() {
    if (!this.isValid) return true; // It doesn't mean anything for cw/ccw, make true anyway
    return AngDeg.isFromToCw(
      new LineSeg(this.points[0], this.points[1]).ang,
      new LineSeg(this.points[1], this.points[2]).ang
    );
  }

  duplicateTo(distance: number, dir: "right" | "left"): Polygon | undefined {
    if (!this.isValid) return undefined;
    //let lnDir: "left" | "right" = (this.isCw() && dir === "in") || (!this.isCw() && dir === "out") ? "right" : "left";
    distance = Math.abs(distance);
    let havingBadPoints = false;
    let pts = this.toLineSegs()
      .map(s => s.duplicateTo(distance, dir).toLine())
      .map((l, i, lns) => {
        let xp = Intersection.line2Line(l, lns[i === 0 ? lns.length - 1 : i - 1]);
        if (xp.length < 1) {
          havingBadPoints = true;
        }
        return xp[0];
      })
    if (havingBadPoints) return undefined;
    return new Polygon(...pts);
  }

  static buildRegularPolygon(sideCount: number, center: IPoint, radius: number, rotateDeg?: number): Polygon {
    const N = Math.floor(sideCount);
    if (N < 3 || radius <= 0) return new Polygon();
    const degDelta = 360 / N;
    const startDeg = rotateDeg ? rotateDeg : 0;
    const vecCenter = Vector.fromPoint(center);
    const vertices = [...Array(N).keys()]
      .map(i => {
        const ang = AngDeg.fitDeg(startDeg + i * degDelta),
              vecVertex = Vector.fromLenAng(radius, ang);
        return vecCenter.addVector(vecVertex).toPoint();
      })
    return new Polygon(...vertices);
  }

}
