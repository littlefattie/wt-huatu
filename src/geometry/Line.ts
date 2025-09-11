import { WtMath } from "../math/WtMath.js";
import type { IPoint, ILine, IGeometryModel } from "./IGeometry.js";
import { AngDeg } from "./AngDeg.js";
import LineSeg from "./LineSeg.js";
import Point from "./Point.js";

export default class Line implements ILine, IGeometryModel {
  ang: number;
  deg: number;
  anchor: Point;
  slope: number;

  constructor(pOnLine: IPoint, ang: number) {
    this.anchor = new Point(pOnLine.x, pOnLine.y);
    this.ang = AngDeg.fitAng(ang);
    this.deg = AngDeg.ang2Deg(ang);
    this.slope = Math.tan(ang);
  }

  getParallelLine(distance: number, atOtherSide: boolean): Line {
    let normalAng = this.ang + AngDeg.DEG90 * (atOtherSide ? -1 : 1);
    normalAng = AngDeg.fitAng(normalAng);
    let parallelAnchor = this.anchor.moveByLenAndAng(distance, normalAng);
    return new Line(parallelAnchor, this.ang);
  }

  getNormalLine(): Line {
    return new Line(this.anchor, AngDeg.fitAng(this.ang + AngDeg.DEG90));
  }

  isParallelWith(line: ILine): boolean {
    return Line.isTwoLinesParallel(this, line);
  }

  isH(): boolean {
    return WtMath.isEqual(this.ang, AngDeg.DEG0) || WtMath.isEqual(this.ang, AngDeg.DEG360) || WtMath.isEqual(this.ang, AngDeg.DEG180);
  }

  isV(): boolean {
    return WtMath.isEqual(this.ang, AngDeg.DEG90) || WtMath.isEqual(this.ang, AngDeg.DEG270);
  }

  hasPointOn(point: IPoint): boolean {
    // Anchor points are identical
    if (WtMath.isEqual(this.anchor.x, point.x) && WtMath.isEqual(this.anchor.y, point.y)) return true;
    // Connection of Anchor points has the same angle with This line
    let conn = new LineSeg(this.anchor, point).toLine();
    // This means the two lines are actually one
    return Line.isTwoLinesParallel(this, conn);
  }

  isIdenticalWith(line: ILine): boolean {
    return this.hasPointOn(line.anchor) && this.isParallelWith(line);
  }

  getPointByLen(len: number): Point {
    return new Point(this.anchor.x + len * Math.cos(this.ang), this.anchor.y + len * Math.sin(this.ang));
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      if (pos === "c" ||
          pos === "center" ||
          pos === "o" ||
          pos === "a" ||
          pos === "anchor") return this.anchor;
      return undefined;
    }
    return this.getPointByLen(pos);
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "deg") return this.deg;
    if (name === "degr") return AngDeg.ang2Deg(this.deg + AngDeg.DEG180);
    return undefined;
  }

  getPointByX(x: number): Point | undefined {
    if (WtMath.isEqual(this.ang, AngDeg.DEG90) || WtMath.isEqual(this.ang, AngDeg.DEG270)) {
      return undefined;
    }
    const y = (x - this.anchor.x) * Math.tan(this.ang) + this.anchor.y;
    return new Point(x, y);
  }

  getPointByY(y: number): Point | undefined {
    if (WtMath.isEqual(this.ang, AngDeg.DEG0) || WtMath.isEqual(this.ang, AngDeg.DEG180)) {
      return undefined;
    }
    const x = (y - this.anchor.y) * Math.cos(this.ang) / Math.sin(this.ang) + this.anchor.x;
    return new Point(x, y);
  }

  getXPointWith(line: ILine): Point | undefined {
    if (this.isIdenticalWith(line) || this.isParallelWith(line)) return undefined;
    return Line.getXPoint(this, line);
  }

  buildSeg(len1: number, len2?: number): LineSeg {
    if (len2 === undefined) return new LineSeg(this.anchor, this.getPointByLen(len1));
    return new LineSeg(this.getPointByLen(len1), this.getPointByLen(len2));
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    return new Line(Point.moveBy(this.anchor, dx, dy), this.ang);
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    return new Line(Point.rotateBy(this.anchor, rotDeg, at), this.ang + AngDeg.deg2Ang(rotDeg));
  }

  /** The static methods */

  static fromTwoPoints(p1: IPoint, p2: IPoint): Line {
    return new Line(p1, new LineSeg(p1, p2).ang);
  }

  static fromPointAng(p: IPoint, ang: number): Line {
    return new Line(p, ang);
  }

  static fromXYang(x: number, y: number, ang: number): Line {
    return new Line(new Point(x, y), ang);
  }

  static getXPoint(l1: ILine, l2: ILine): Point | undefined {
    if (Line.isTwoLinesParallel(l1, l2)) return undefined;
    let x = (l2.anchor.x * Math.sin(l2.ang) * Math.cos(l1.ang) -
             l1.anchor.x * Math.cos(l2.ang) * Math.sin(l1.ang) -
             (l2.anchor.y - l1.anchor.y) * Math.cos(l2.ang) * Math.cos(l1.ang)) / Math.sin(l2.ang - l1.ang);
    let y = (l1.anchor.y * Math.sin(l2.ang) * Math.cos(l1.ang) -
             l2.anchor.y * Math.cos(l2.ang) * Math.sin(l1.ang) +
             (l2.anchor.x - l1.anchor.x) * Math.sin(l2.ang) * Math.sin(l1.ang)) / Math.sin(l2.ang - l1.ang);
    return new Point(x, y);
  }

  static isTwoLinesParallel(l1: ILine, l2: ILine): boolean {
    return (WtMath.isEqual(l1.ang, l2.ang) ||
            WtMath.isEqual(l1.ang, AngDeg.fitAng(l2.ang + AngDeg.DEG180)));
  }

  static makeHLine(y: number): Line {
    return new Line({x: 0, y: y}, AngDeg.DEG0);
  }

  static makeVLine(x: number): Line {
    return new Line({x: x, y: 0}, AngDeg.DEG90);
  }

  static AXIS_X: ILine = new Line({x: 0, y: 0}, AngDeg.DEG0);
  static AXIS_Y: ILine = new Line({x: 0, y: 0}, AngDeg.DEG90);
  static LINE_YXp: ILine = new Line({x: 0, y: 0}, AngDeg.DEG45);
  static LINE_YXm: ILine = new Line({x: 0, y: 0}, AngDeg.DEG135);

}
