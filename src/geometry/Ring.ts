
import Point from './Point.js';
import Line from './Line.js';
import type { IPoint, ICircle, IGeometryModel, IRing } from './IGeometry.js';
import { AngDeg } from './AngDeg.js';
import LineSeg from './LineSeg.js';
import { WtMath } from '../math/WtMath.js';
import Circle from './Circle.js';

export default class Ring implements IRing, IGeometryModel {
  cx: number;
  cy: number;
  center: IPoint;
  rShort: number;
  rLong: number;
  circum: number;
  area: number;
  cIn: Circle;
  cOut: Circle;

  constructor(cx: number, cy: number, r1: number, r2: number) {
    this.cx = cx;
    this.cy = cy;
    this.center = new Point(cx, cy);
    r1 = Math.abs(r1);
    r2 = Math.abs(r2);
    this.rShort = Math.min(r1, r2);
    this.rLong = Math.max(r1, r2);
    this.cIn = new Circle(cx, cy, this.rShort);
    this.cOut = new Circle(cx, cy, this.rLong);
    this.circum = 2 * Math.PI * (r1 + r2);
    this.area = Math.PI * (this.rLong ** 2 - this.rShort ** 2);
  }

  private getCirclePoint(c: "in" | "out", deg: number) {
    let circle = c === "in" ? this.cIn : this.cOut;
    return circle.getPoint(deg);
  }

  getPoint(pos: string | number, t?: number): IPoint | undefined {
    if (typeof pos === "string") {
      const lcPos = pos.toLowerCase();
      if (lcPos === "in") {
        return t === undefined ? this.cIn.center : this.getCirclePoint(lcPos, t)
      }
      else if (lcPos === "out") {
        return t === undefined ? this.cOut.center : this.getCirclePoint(lcPos, t)
      }
      else if (lcPos === "cin")  return this.cIn.center;
      else if (lcPos === "cout") return this.cOut.center;
      else return undefined;
    }
    // It pos is a number, then it should be a degree, and will return the point
    // of Outer circle
    return this.getCirclePoint("out", pos);
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "rin") return this.rShort;
    if (name === "rout") return this.rLong;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    const newCenter = Point.moveBy(this.center, dx, dy);
    return new Ring(newCenter.x, newCenter.y, this.rShort, this.rLong);
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    const newCenter = Point.rotateBy(this.center, rotDeg, at);
    return new Ring(newCenter.x, newCenter.y, this.rShort, this.rLong);
  }

  duplicateTo(distance: number, dir: "in" | "out"): Ring | undefined {
    distance = Math.abs(distance);
    if (distance >= (this.rLong - this.rShort) / 2 && dir === "in") return undefined;
    if (distance >= this.rShort && dir === "out") return undefined;
    let rDelta = dir === "in" ? distance : -distance;
    return new Ring(this.cx, this.cy, this.rShort + rDelta, this.rLong - rDelta);
  }

  toCircles(): Circle[] {
    if (WtMath.isEqual(this.rLong, this.rShort)) return [new Circle(this.cx, this.cy, this.rShort)]
    else return [
      new Circle(this.cx, this.cy, this.rShort),
      new Circle(this.cx, this.cy, this.rLong),
    ]
  }
  
  // Static methods

  static byCenterAndRadius(center: IPoint, r1: number, r2: number): Ring {
    return new Ring(center.x, center.y, r1, r2);
  }

}
