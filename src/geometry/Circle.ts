
import Point from './Point.js';
import Line from './Line.js';
import type { IPoint, ICircle, IGeometryModel } from './IGeometry.js';
import { AngDeg } from './AngDeg.js';
import LineSeg from './LineSeg.js';
import { WtMath } from '../math/WtMath.js';
import { Bezier3 } from './Bezier.js';

export default class Circle implements ICircle, IGeometryModel {
  cx: number;
  cy: number;
  r: number;
  center: Point;
  circum: number;
  area: number;

  constructor(cx: number, cy: number, r: number) {
    this.cx = cx;
    this.cy = cy;
    this.center = new Point(cx, cy);
    this.r = Math.abs(r);
    this.circum = 2 * Math.PI * r;
    this.area = Math.PI * r * r;
  }

  private calcPoint(theta: number) {
    return new Point(this.cx + this.r * Math.cos(theta), this.cy + this.r * Math.sin(theta));
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "c" || pos === "center") return this.center;
      if (pos === "n") return this.calcPoint(AngDeg.DEG270);
      if (pos === "s") return this.calcPoint(AngDeg.DEG90);
      if (pos === "e") return this.calcPoint(AngDeg.DEG0);
      if (pos === "w") return this.calcPoint(AngDeg.DEG180);
      if (pos === "nw") return this.calcPoint(AngDeg.DEG225);
      if (pos === "sw") return this.calcPoint(AngDeg.DEG135);
      if (pos === "ne") return this.calcPoint(AngDeg.DEG315);
      if (pos === "se") return this.calcPoint(AngDeg.DEG45);
      return undefined;
    }
    // It pos is a number, then it should be a degree
    return this.calcPoint(AngDeg.deg2Ang(pos));
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "r") return this.r;
    return undefined;
  }

  getPointAng(ang: number) {
    return this.calcPoint(ang);
  }

  getThetaOfPoint(point: IPoint): number | undefined {
    const ray = new LineSeg(this.center, point);
    if (WtMath.isZero(ray.len)) return undefined;
    return ray.ang;
  }

  getTangentLine(theta: number): Line {
    return new Line(this.calcPoint(theta), AngDeg.fitAng(theta - AngDeg.DEG90));
  }

  isIdenticalWith(c: Circle) {
    return WtMath.isEqual(this.cx, c.cx)
      && WtMath.isEqual(this.cy, c.cy)
      && WtMath.isEqual(this.r, c.r);
  }

  buildBezier3Simulate(ccw?: boolean) {
    return Circle.buildBezier3Simulate(this, ccw);
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    const newCenter = Point.moveBy(this.center, dx, dy);
    return new Circle(newCenter.x, newCenter.y, this.r);
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    const newCenter = Point.rotateBy(this.center, rotDeg, at);
    return new Circle(newCenter.x, newCenter.y, this.r);
  }

  duplicateTo(distance: number, dir: "in" | "out"): Circle | undefined {
    distance = Math.abs(distance);
    if (distance >= this.r && dir === "in") return undefined;
    return new Circle(this.cx, this.cy, this.r + distance * (dir === "in" ? -1 : 1));
  }
  
  // Static methods

  static byCenterAndRadius(center: IPoint, radius: number): Circle {
    return new Circle(center.x, center.y, radius);
  }

  static calcPoint(radius: number, theta: number) {
    return new Point(radius * Math.cos(theta), radius * Math.sin(theta));
  }

  static intersectionsOf(c1: Circle, c2: Circle): Point[] | undefined {
    if (WtMath.isZero(c1.r) || WtMath.isZero(c2.r)) return undefined;
    if (c1.isIdenticalWith(c2)) return undefined;
    const dx = c2.cx - c1.cx,
          dy = c2.cy - c1.cy,
          L2 = dx ** 2 + dy ** 2,
          A = (c1.r ** 2 - c2.r ** 2 - L2) / (2 * c2.r),
          E = L2 - A ** 2,
          Adx = A + dx;
    if (WtMath.isZero(Adx)) {
      return [new Point(c2.cx - c2.r, c2.cy)];
    }
    else if (WtMath.isZero(E)) {
      const z = dy / Adx;
      const cos = (1 - z ** 2) / (1 + z ** 2),
            sin = (2 * z) / (1 + z ** 2);
      return [new Point(c2.r * cos + c2.cx, c2.r * sin + c2.cy)];
    } else if (E < 0) {
      return undefined;
    } else {
      return [(dy + Math.sqrt(E)) / Adx, (dy - Math.sqrt(E)) / Adx]
        .map(z => ({
          cos: (1 - z ** 2) / (1 + z ** 2),
          sin: (2 * z) / (1 + z ** 2)
        }))
        .map(x => new Point(c2.r * x.cos + c2.cx, c2.r * x.sin + c2.cy));
    }
  }

  static buildBezier3Simulate(circle: Circle, ccw?: boolean): Bezier3[] {
    let d = Bezier3.K * circle.r;
    const pE = circle.calcPoint(AngDeg.DEG0),
          pEu = new Point(pE.x, pE.y - d),
          pEd = new Point(pE.x, pE.y + d),
          pN = circle.calcPoint(AngDeg.DEG270),
          pNe = new Point(pN.x + d, pN.y),
          pNw = new Point(pN.x - d, pN.y),
          pW = circle.calcPoint(AngDeg.DEG180),
          pWu = new Point(pW.x, pW.y - d),
          pWd = new Point(pW.x, pW.y + d),
          pS = circle.calcPoint(AngDeg.DEG90),
          pSe = new Point(pS.x + d, pS.y),
          pSw = new Point(pS.x - d, pS.y);
    return ccw
      ? [
        new Bezier3(pE, pEu, pNe, pN),
        new Bezier3(pN, pNw, pWu, pW),
        new Bezier3(pW, pWd, pSw, pS),
        new Bezier3(pS, pSe, pEd, pE),
      ]
      : [
        new Bezier3(pE, pEd, pSe, pS),
        new Bezier3(pS, pSw, pWd, pW),
        new Bezier3(pW, pWu, pNw, pN),
        new Bezier3(pN, pNe, pEu, pE),
      ];
  }
}
