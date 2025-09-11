
import type {
  IPoint,
  ILineSeg,
  IGeometryModel,
  ISegmentModel,
  ICurveFuncsByT,
  ILine
} from "./IGeometry.js";

import Point from "./Point.js";
import Vector from "./Vector.js";
import Line from "./Line.js";
import { WtMath } from "../math/WtMath.js";
import { AngDeg } from "./AngDeg.js";

export default class LineSeg implements ILineSeg, IGeometryModel, ISegmentModel {
  public pStart: Point;
  public pEnd: Point;
  public middle: Point;
  public len: number;
  public ang: number;
  public deg: number;
  public slope: number;

  private xMin: number;
  private xMax: number;
  private yMin: number;
  private yMax: number;

  constructor(pStart: IPoint, pEnd: IPoint) {
    this.pStart = new Point(pStart.x, pStart.y);
    this.pEnd = new Point(pEnd.x, pEnd.y);
    const vector = Vector.fromTo(pStart, pEnd);
    this.len = vector.len;
    this.ang = vector.ang;
    this.deg = vector.deg;
    this.slope = vector.IsZero
      ? 0
      : pStart.x === pEnd.x
      ? (pStart.y < pEnd.y ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      : (pEnd.y - pStart.y) / (pEnd.x - pStart.x);

    this.xMin = Math.min(pStart.x, pEnd.x);
    this.xMax = Math.max(pStart.x, pEnd.x);
    this.yMin = Math.min(pStart.y, pEnd.y);
    this.yMax = Math.max(pStart.y, pEnd.y);
    this.middle = new Point((pStart.x + pEnd.x)/2, (pStart.y + pEnd.y)/2);
  }

  private calcPoint(t: number) {
    t = WtMath.fitTin0and1(t);
    return new Point(
      this.pStart.x + t * (this.pEnd.x - this.pStart.x),
      this.pStart.y + t * (this.pEnd.y - this.pStart.y)
    );
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "m" || pos === "mid" || pos === "middle") return this.middle;
      if (pos === "s" || pos === "start") return this.pStart;
      if (pos === "e" || pos === "end") return this.pEnd;
      return undefined;
    }
    if (WtMath.isIn0and1(pos)) return this.calcPoint(pos);
    return undefined;
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "len") return this.len;
    if (name === "deg") return this.deg;
    if (name === "degr") return AngDeg.ang2Deg(this.ang + AngDeg.DEG180);
    return undefined;
  }

  toLine(): Line {
    return new Line(this.pStart, this.ang);
  }

  toVector(): Vector {
    return  Vector.fromTo(this.pStart, this.pEnd);
  }

  intersectionWith(seg: LineSeg): Point | undefined {
    return LineSeg.xPointOfTwo(this, seg);
  }

  getMiddleNormalLine() {
    return new Line(this.middle, this.ang).getNormalLine();
  }

  isParallelWith(seg: LineSeg): boolean {
    return LineSeg.isTwoSegsParallel(this, seg);
  }

  /**
   * Judge if the given point falls on the Segment, please note that, this function normally
   * is used to judge if the "calculated point" which is definitely on the Line falls in this
   * segment.
   * @param p The point on the Line of this line segment
   * @returns if the p in the range of the Segment
   */
  isLinePointInSeg(p: IPoint) {
    return (WtMath.isEqual(p.x, this.xMin) || WtMath.isEqual(p.x, this.xMax) || (p.x >= this.xMin && p.x <= this.xMax)) &&
           (WtMath.isEqual(p.y, this.yMin) || WtMath.isEqual(p.y, this.yMax) || (p.y >= this.yMin && p.y <= this.yMax));
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    return new LineSeg(Point.moveBy(this.pStart, dx, dy), Point.moveBy(this.pEnd, dx, dy));
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    return new LineSeg(Point.rotateBy(this.pStart, rotDeg, at), Point.rotateBy(this.pEnd, rotDeg, at));
  }

  duplicateTo(distance: number, dir: "right" | "left"): LineSeg {
    distance = Math.abs(distance);
    let ang = this.ang + (dir === "right" ? 1 : -1) * AngDeg.DEG90;
    return new LineSeg(
      new Line(this.pStart, ang).getPointByLen(distance),
      new Line(this.pEnd, ang).getPointByLen(distance)
    );
  }

  getCurveFuncs(): ICurveFuncsByT {
    return {
      px: t => this.pStart.x + t * (this.pEnd.x - this.pStart.x),
      py: t => this.pStart.y + t * (this.pEnd.y - this.pStart.y),
      dpx: t => this.pEnd.x - this.pStart.x,
      dpy: t => this.pEnd.y - this.pStart.y,
    }
  }

  getTofPoint(p: IPoint): number | undefined {
    if (WtMath.isZero(this.len)) {
      return Point.areIdentical(this.pStart, p) ? 0 : undefined;
    }
    if (WtMath.isZero(this.pStart.x - this.pEnd.x)) {
      if (!WtMath.isEqual(p.x, this.pStart.x)) return undefined;
      let yt = (p.y - this.pStart.y) / (this.pEnd.y - this.pStart.y);
      if (WtMath.isEqual(yt, 0) || WtMath.isEqual(yt, 1) || WtMath.isIn0and1(yt)) return yt;
      return undefined;
    }
    if (WtMath.isZero(this.pStart.y - this.pEnd.y)) {
      if (!WtMath.isEqual(p.y, this.pStart.y)) return undefined;
      let xt = (p.x - this.pStart.x) / (this.pEnd.x - this.pStart.x);
      if (WtMath.isEqual(xt, 0) || WtMath.isEqual(xt, 1) || WtMath.isIn0and1(xt)) return xt;
      return undefined;
    }
    let xt = (p.x - this.pStart.x) / (this.pEnd.x - this.pStart.x);
    let yt = (p.y - this.pStart.y) / (this.pEnd.y - this.pStart.y);
    if (WtMath.isEqualOnTol(xt, yt, 1e-4) && (WtMath.isEqual(xt, 0) || WtMath.isEqual(xt, 1) || WtMath.isIn0and1(xt))) return xt;
    return undefined;
  }

  makeSubSeg(pStart: IPoint, pEnd: IPoint): ISegmentModel | undefined {
    const tStart = this.getTofPoint(pStart),
          tEnd = this.getTofPoint(pEnd);
    if (tStart === undefined || tEnd === undefined) return undefined;
    return new LineSeg(pStart, pEnd);
  }

  getTangentLineOfPoint(p: IPoint): ILine | undefined {
    return new Line(p, this.ang);
  }

  getNormalPoint(t: number, dist: number, dir: "right" | "left"): Point | undefined {
    const ang = dir === "right" ? this.ang + AngDeg.DEG90 : this.ang - AngDeg.DEG90;
    return new Line(this.calcPoint(t), ang).getPointByLen(dist);
  }

  // Static methods

  static fromXYs(x1: number, y1: number, x2: number, y2: number): LineSeg{
    return new LineSeg(new Point(x1, y1), new Point(x2, y2));
  }

  static getMiddlePoint(pStart: Point, pEnd: Point): Point {
    return new Point((pStart.x + pEnd.x)/2, (pStart.y + pEnd.y)/2);
  }

  static makeVertLine(x: number, yStart: number, yStop: number): LineSeg {
    return LineSeg.fromXYs(x, yStart, x, yStop);
  }

  static makeHoriLine(y: number, xStart: number, xStop: number): LineSeg {
    return LineSeg.fromXYs(xStart, y, xStop, y);
  }

  static isTwoSegsParallel(seg1: LineSeg, seg2: LineSeg): boolean {
    return (WtMath.isEqual(seg1.ang, seg2.ang) ||
            WtMath.isEqual(seg1.ang, AngDeg.fitAng(seg2.ang + AngDeg.DEG180)));
  }

  static xPointOfTwo(ls1: LineSeg, ls2: LineSeg): Point | undefined {
    let xPoint = Line.getXPoint(ls1.toLine(), ls2.toLine());
    if (xPoint &&
        ls1.isLinePointInSeg(xPoint) &&
        ls2.isLinePointInSeg(xPoint)) {
      return xPoint;
    } else {
      return undefined;
    }
  }

}