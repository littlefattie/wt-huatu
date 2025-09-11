
import type { IGeometryModel, ILineSegments, IPoint, IRect } from './IGeometry.js';
import Point from './Point.js';
import Line from './Line.js';
import LineSeg from './LineSeg.js';
import Circle from './Circle.js';
import Polygon from './Polygon.js';
import { WtMath } from '../math/WtMath.js';
import { AngDeg } from './AngDeg.js';

export default class Rect implements IRect, IGeometryModel, ILineSegments {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public center: Point;
  public anchor: Point;

  public area: number;
  public circum: number;

  public pNW: Point;
  public pNE: Point;
  public pSW: Point;
  public pSE: Point;

  public pNM: Point;
  public pSM: Point;
  public pWM: Point;
  public pEM: Point;

  public xMin: number;
  public xMax: number;
  public yMin: number;
  public yMax: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.width = Math.abs(width);
    this.height = Math.abs(height);
    this.area = this.width * this.height;
    this.circum = 2 * (this.width + this.height);
    if (width >= 0) {
      this.xMin = x;
      this.xMax = x + width;
    } else {
      this.xMin = x + width;
      this.xMax = x;
    }
    if (height >= 0) {
      this.yMin = y;
      this.yMax = y + height;
    } else {
      this.yMin = y + height;
      this.yMax = y;
    }
    this.x = this.xMin;
    this.y = this.yMin;
    this.anchor = new Point(this.x, this.y);
    this.center = new Point(this.xMin + this.width / 2, this.yMin + this.height / 2);
    this.pNW = new Point(this.xMin, this.yMin);
    this.pNE = new Point(this.xMax, this.yMin);
    this.pSW = new Point(this.xMin, this.yMax);
    this.pSE = new Point(this.xMax, this.yMax);
    this.pNM = new Point(this.center.x, this.yMin);
    this.pSM = new Point(this.center.x, this.yMax);
    this.pWM = new Point(this.xMin, this.center.y);
    this.pEM = new Point(this.xMax, this.center.y);
  }

  toPolygon(cw?: "cw" | "ccw"): Polygon {
    if (cw && cw === "cw") {
      return new Polygon(this.pNW, this.pNE, this.pSE, this.pSW);
    } else {
      return new Polygon(this.pNW, this.pSW, this.pSE, this.pNE);
    }
  }

  getPoint(pos: string | number, t?: number): IPoint | undefined {
    if (typeof pos !== "string") return undefined;
    pos = pos.toLowerCase();
    if (pos === "nw" || pos === "topleft"      || pos === "top-left")      return this.pNW;
    if (pos === "sw" || pos === "bottomleft"   || pos === "bottom-left")   return this.pSW;
    if (pos === "se" || pos === "bottomright"  || pos === "bottom-right")  return this.pSE;
    if (pos === "ne" || pos === "topright"     || pos === "top-right")     return this.pNE;
    if (pos === "n"  || pos === "nm" || pos === "topmiddle"    || pos === "top-middle")    return this.pNM;
    if (pos === "w"  || pos === "wm" || pos === "leftmiddle"   || pos === "left-middle")   return this.pWM;
    if (pos === "s"  || pos === "sm" || pos === "bottommiddle" || pos === "bottom-middle") return this.pSM;
    if (pos === "e"  || pos === "em" || pos === "rightmiddle"  || pos === "right-middle")  return this.pEM;
    if (pos === "c"  || pos === "center") return this.center;
    if (t !== undefined && WtMath.isIn0and1(t)) {
      if (pos === "north" || pos === "top")     return new LineSeg(this.pNW, this.pNE).getPoint(t);
      if (pos === "west"  || pos === "left")    return new LineSeg(this.pNW, this.pSW).getPoint(t);
      if (pos === "south" || pos === "bottom")  return new LineSeg(this.pSW, this.pSE).getPoint(t);
      if (pos === "east"  || pos === "right")   return new LineSeg(this.pNE, this.pSE).getPoint(t);
    }
    return undefined;
  }

  toLineSegs(): LineSeg[] {
    return [
      new LineSeg(this.pNE, this.pNW),
      new LineSeg(this.pNW, this.pSW),
      new LineSeg(this.pSW, this.pSE),
      new LineSeg(this.pSE, this.pNE),
    ];
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "w") return this.width;
    if (name === "h") return this.height;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    return Rect.fromCenterWH(Point.moveBy(this.center, dx, dy), this.width, this.height);
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    return new Polygon(...[this.pNW, this.pNE, this.pSE, this.pSW].map(p => Point.rotateBy(p, rotDeg, at)));
  }

  duplicateTo(distance: number, dir: "in" | "out"): Rect | undefined {
    distance = Math.abs(distance);
    if ((distance >= this.width / 2 || distance >= this.height / 2) && dir === "in") return undefined;
    let whDelta = (dir === "in" ? -1 : 1) * 2 * distance;
    return Rect.fromCenterWH(this.center, this.width + whDelta, this.height + whDelta);
  }

  // Static Methods

  static fromCenterWH(center: IPoint, w: number, h: number) {
    const width = Math.abs(w),
          height = Math.abs(h);
    return new Rect(center.x - width / 2, center.y - height / 2, width, height);
  }

  static fromTwoPoints(p1: IPoint, p2: IPoint): Rect | undefined {
    const width = Math.abs(p1.x - p2.x);
    const height = Math.abs(p1.y - p2.y);
    if (WtMath.isZero(width)) return undefined;
    if (WtMath.isZero(height)) return undefined;
    const x1 = Math.min(p1.x, p2.x);
    const y1 = Math.min(p1.y, p2.y);
    return new Rect(x1, y1, width, height);
  }

}
