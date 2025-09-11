
import type {
  IGeometryModel,
  ILineSegments,
  IPoint,
  IPolyLine,
} from './IGeometry.js';

import Point from './Point.js';
import LineSeg from './LineSeg.js';
import { WtMath } from '../math/WtMath.js';
import { Intersection } from './Intersection.js';
import { AngDeg } from './AngDeg.js';

export default class PolyLine implements IPolyLine, IGeometryModel, ILineSegments {
  isValid: boolean;
  points: IPoint[] = [];

  constructor(...points: IPoint[]) {
    if (!points || points.length < 2) {
      this.isValid = false;
    } else {
      this.isValid = true;
      this.points = points.map(p => new Point(p.x, p.y));
    }
  }

  toLineSegs(): LineSeg[] {
    return this.points
      .reduce((segs: LineSeg[], p, idx) => {
        if (idx < this.points.length - 1) {
          return [...segs, new LineSeg(p, this.points[idx + 1])]
        } else {
          return segs;
        }
      }, []);
  }

  getPoint(pos: string | number, t?: number): IPoint | undefined {
    if (!this.isValid) return undefined;
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "s" || pos === "start" || pos === "first") return this.points[0];
      if (pos === "e" || pos === "end" || pos === "last") return this.points[this.points.length - 1];
      return undefined;
    }
    let n = Math.floor(pos);
    if (n <= 0 || n > this.points.length) return undefined;
    if (t === undefined) return this.points[n - 1];
    if (n === this.points.length || !WtMath.isIn0and1(t)) return undefined;
    return new LineSeg(this.points[n - 1], this.points[n]).getPoint(t);
  }

  getParam(name: string): number | undefined {
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new PolyLine(...this.points.map(p => Point.moveBy(p, dx, dy)));
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new PolyLine(...this.points.map(p => Point.rotateBy(p, rotDeg, at)));
  }

  isCw() {
    // In this case it doesn't mean anything for cw/ccw, make true anyway
    if (!this.isValid || this.points.length < 3) return true;
    return AngDeg.isFromToCw(
      new LineSeg(this.points[0], this.points[1]).ang,
      new LineSeg(this.points[1], this.points[2]).ang
    );
  }

  duplicateTo(distance: number, dir: "right" | "left"): PolyLine | undefined {
    if (!this.isValid) return undefined;
    distance = Math.abs(distance);
    if (this.points.length < 3) {
      const ls = new LineSeg(this.points[0], this.points[1]).duplicateTo(distance, dir);
      return new PolyLine(ls.pStart, ls.pEnd);
    }
    let havingBadPoints = false;
    let segs = this.toLineSegs()
      .map(s => s.duplicateTo(distance, dir))
    let lines = segs.map(s => s.toLine());
    let pts: Point[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) pts.push(lines[i].anchor);
      else {
        let xp = Intersection.line2Line(lines[i], lines[i - 1]);
        if (xp.length > 0) pts.push(xp[0]);
        else havingBadPoints = true;
      }
    }
    if (havingBadPoints) return undefined;
    pts.push(segs[segs.length - 1].pEnd);
    return new PolyLine(...pts);
  }
}
