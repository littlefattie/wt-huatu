
import type {
  IPoint,
  ILineSeg,
  ILine,
  IEllipse,
  IEllipticalArc,
  IGeometryModel
} from './IGeometry.js';

import { AngDeg } from './AngDeg.js';
import { WtMath } from '../math/WtMath.js';

import Point from './Point.js';
import Line from './Line.js';
import LineSeg from './LineSeg.js';
import { Intersection } from './Intersection.js';


export type IterateCalcResult ={
  target: number;
  value: number | number[],
  iterateCount: number,
  succeeded: boolean
};

export interface IEllipseTouchingPoint  {
  theta: number;
  rot: number;
  point: IPoint;
};


export default class Ellipse implements IEllipse, IGeometryModel {
  center: Point;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;

  private rLong: number;
  private rShort: number;

  rf: number;
  isCircle: boolean;
  focalOnX = false;
  focalOnY = false;

  focalLeft: Point;
  focalRight: Point;

  circum: number;
  area: number;

  thetaE: number = AngDeg.DEG0;
  thetaW: number = AngDeg.DEG180;
  thetaN: number = AngDeg.DEG90;
  thetaS: number = AngDeg.DEG270;

  pE: Point;
  pW: Point;
  pN: Point;
  pS: Point;

  constructor(cx: number, cy: number, rx: number, ry: number, rot: number) {
    this.cx = cx;
    this.cy = cy;
    this.center = new Point(cx, cy);
    this.rx = rx;
    this.ry = ry;
    this.rLong = Math.max(rx, ry);
    this.rShort = Math.min(rx, ry);
    this.rot = AngDeg.fitAng(rot);

    this.area = rx * ry * Math.PI;
    this.circum = Ellipse.calculateCircum(rx, ry);

    if (WtMath.isEqual(rx, ry)) {
      this.isCircle = true;
      this.focalLeft = this.center;
      this.focalRight = this.center;
      this.rf = 0;
    }  else {
      this.isCircle = false;
      this.rf = Math.sqrt(this.rLong ** 2 - this.rShort ** 2);
      if (rx > ry) {
        this.focalLeft = this.center.moveByLenAndAng(this.rf, rot + AngDeg.DEG180);
        this.focalRight = this.center.moveByLenAndAng(this.rf, rot);
      }
      else {
        this.focalLeft = this.center.moveByLenAndAng(this.rf, rot + AngDeg.DEG270);
        this.focalRight = this.center.moveByLenAndAng(this.rf, rot + AngDeg.DEG90);
      }
    }
    this.thetaE = this.getThetaByTangentAngle(AngDeg.DEG90);
    this.thetaN = this.getThetaByTangentAngle(AngDeg.DEG0);
    this.thetaW = this.getThetaByTangentAngle(AngDeg.DEG270);
    this.thetaS = this.getThetaByTangentAngle(AngDeg.DEG180);
    this.pE = this.calcPoint(this.thetaE);
    this.pN = this.calcPoint(this.thetaN);
    this.pW = this.calcPoint(this.thetaW);
    this.pS = this.calcPoint(this.thetaS);
  }

  private calcPoint(theta: number): Point {
    return new Point(this.rx * Math.cos(theta), this.ry * Math.sin(theta))
      .rotate(this.rot)
      .moveByXY(this.cx, this.cy);
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "c" || pos === "center") return this.center;
      if (pos === "n") return this.pN;
      if (pos === "s") return this.pS;
      if (pos === "e") return this.pE;
      if (pos === "w") return this.pW;
      
      // For NW/SW/NE/SE, return the point at real direction
      if (pos === "nw") return Intersection.pickPoint(Intersection.line2Ellipse(new Line(this.center, AngDeg.DEG45), this), "w");
      if (pos === "sw") return Intersection.pickPoint(Intersection.line2Ellipse(new Line(this.center,-AngDeg.DEG45), this), "s");
      if (pos === "ne") return Intersection.pickPoint(Intersection.line2Ellipse(new Line(this.center,-AngDeg.DEG45), this), "n");
      if (pos === "se") return Intersection.pickPoint(Intersection.line2Ellipse(new Line(this.center, AngDeg.DEG45), this), "e");
      return undefined;
    }
    // It pos is a number, then it should be a degree
    return this.calcPoint(AngDeg.deg2Ang(pos));
  }

  getPointAng(ang: number): IPoint {
    return this.calcPoint(ang);
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "rx") return this.rx;
    if (name === "ry") return this.ry;
    if (name === "rotdeg") return AngDeg.ang2Deg(this.rot);
    if (name === "rotang") return this.rot;
    return undefined;
  }

  public getVectorAngle(theta: number) {
    return Ellipse.getVectorAngleByTheta(this.rx, this.ry, theta);
  }

  public getThetaByTangentAngle(ang: number) {
    return Ellipse.getThetaByTangentAngle(this.rx, this.ry, AngDeg.fitAng(ang - this.rot));
  }

  public getTangentLine(theta: number): Line {
    const p = this.calcPoint(theta);
    const ang = Ellipse.getTangentAngleByTheta(this.rx, this.ry, theta);
    return new Line(p, ang + this.rot);
  }

  public getTangentLineWithPoint(point: IPoint): Line[] | null {
    const ls = new LineSeg(this.center, point);
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    const lenTheta = Ellipse.getDistanceToCenter(this.rx, this.ry, theta);
    if (ls.len < lenTheta) return null;
    if (WtMath.isEqual(ls.len, lenTheta)) return [ this.getTangentLine(theta) ];
    // Now calculates the tangent lines, which are two
    const Y = this.cy - point.y,
          X = this.cx - point.x,
          Cxs = this.rx * Math.sin(this.rot),
          Cyc = this.ry * Math.cos(this.rot),
          Cys = this.ry * Math.sin(this.rot),
          Cxc = this.rx * Math.cos(this.rot);
    const A = Y * Cxc - X * Cxs,
          B = Y * Cys + X * Cyc,
          M = Cys * Cxs + Cyc * Cxc;
    const delta = A ** 2 + B ** 2 - M ** 2;
    if (delta < 0 || M === B) return null;
    return [
        (-A + Math.sqrt(delta)) / (M - B),
        (-A - Math.sqrt(delta)) / (M - B)
      ].map(z => {
        return {
          sin: 2 * z / (1 + z ** 2),
          cos: (1 - z ** 2) / (1 + z ** 2)
        };
      }).map(t => new Point(
        this.cx + this.rx * t.cos * Math.cos(this.rot) - this.ry * t.sin * Math.sin(this.rot),
        this.cy + this.rx * t.cos * Math.sin(this.rot) + this.ry * t.sin * Math.cos(this.rot)
      )).map(p => new LineSeg(p, point).toLine());
  }

  public isPointIn(point: IPoint): boolean {
    const ls = new LineSeg(this.center, point);
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    return ls.len < Ellipse.getDistanceToCenter(this.rx, this.ry, theta);
  }

  public isPointOut(point: IPoint): boolean {
    const ls = new LineSeg(this.center, point);
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    return ls.len > Ellipse.getDistanceToCenter(this.rx, this.ry, theta);
  }

  public isPointOn(point: IPoint): boolean {
    const ls = new LineSeg(this.center, point);
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    return WtMath.isEqual(ls.len, Ellipse.getDistanceToCenter(this.rx, this.ry, theta));
  }

  public getThetaOfVector(point: IPoint) {
    const ls = new LineSeg(this.center, point);
    if (WtMath.isZero(ls.len)) return undefined;
    else {
      return Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    }
  }
  
  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    const newCenter = Point.moveBy(this.center, dx, dy);
    return new Ellipse(newCenter.x, newCenter.y, this.rx, this.ry, this.rot);
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    const newCenter = Point.rotateBy(this.center, rotDeg, at);
    const newRotAng = this.rot + AngDeg.deg2Ang(rotDeg);
    return new Ellipse(newCenter.x, newCenter.y, this.rx, this.ry, newRotAng);
  }

  duplicateTo(distance: number, dir: "in" | "out"): Ellipse | undefined {
    distance = Math.abs(distance);
    if ((distance >= this.rx || distance >= this.ry) && dir === "in") return undefined;
    let rd = distance * (dir === "in" ? -1 : 1),
        rx = this.rx + rd,
        ry = this.ry + rd;
    return new Ellipse(this.cx, this.cy, rx, ry, this.rot);
  }

  // Static methods

  public static calcPoint(x: number, y: number, rx: number, ry: number, theta: number, rot: number): Point
  {
    return new Point(rx * Math.cos(theta), ry * Math.sin(theta))
      .rotate(rot)
      .moveByXY(x, y);
  }
  
  public static getDistanceToCenter(rx: number, ry: number, theta: number) {
    return Math.sqrt(rx ** 2 * Math.cos(theta) ** 2 + ry ** 2 * Math.sin(theta) ** 2);
  }

  public static calculateCircum(rx: number, ry: number){
    return 4 * (rx + ry) - 4 * (4 - Math.PI + (0.1218 * (rx - ry) ** 2) / ((rx + ry) ** 2 + 2.8 * rx * ry)) * rx * ry / (rx + ry);
  }

  public static getVectorAngleByTheta(rx: number, ry: number, theta: number): number {
    theta = AngDeg.fitAng(theta);
    if (WtMath.isEqual(theta, AngDeg.DEG0) ||
        WtMath.isEqual(theta, AngDeg.DEG90) ||
        WtMath.isEqual(theta, AngDeg.DEG180) ||
        WtMath.isEqual(theta, AngDeg.DEG270))
    {
      return theta;
    }
    const slope = ry / rx * Math.tan(theta);
    let slopeAngle = Math.atan(slope);
    if (theta > AngDeg.DEG90 && theta < AngDeg.DEG270) {
      slopeAngle += AngDeg.DEG180;
    }
    return AngDeg.fitAng(slopeAngle);
  }

  public static getThetaByVectorAngle(rx: number, ry: number, ang: number): number {
    ang = AngDeg.fitAng(ang);
    if (WtMath.isEqual(ang, AngDeg.DEG0) ||
        WtMath.isEqual(ang, AngDeg.DEG90) ||
        WtMath.isEqual(ang, AngDeg.DEG180) ||
        WtMath.isEqual(ang, AngDeg.DEG270))
    {
      return ang;
    }
    /**
     * The slope of the vector is `tan(ang) while it equals to `Ry * tan(theta) / Rx`
     */
    const slope = Math.tan(ang);
    let theta = Math.atan(slope * rx / ry);
    if (ang > AngDeg.DEG90 && ang < AngDeg.DEG270) {
      theta += AngDeg.DEG180;
    }
    return AngDeg.fitAng(theta);
  }

  public static getTangentAngleByTheta(rx: number, ry: number, theta: number): number {
    theta = AngDeg.fitAng(theta);
    if (WtMath.isEqual(theta, AngDeg.DEG0) ||
        WtMath.isEqual(theta, AngDeg.DEG90) ||
        WtMath.isEqual(theta, AngDeg.DEG180) ||
        WtMath.isEqual(theta, AngDeg.DEG270))
    {
      return AngDeg.fitAng(theta + AngDeg.DEG90);
    }
    const tangentSlope = -ry / rx / Math.tan(theta);
    let slopeAngle = Math.atan(tangentSlope);
    if (theta > AngDeg.DEG0 && theta < AngDeg.DEG180) {
      slopeAngle += AngDeg.DEG180;
    }
    return AngDeg.fitAng(slopeAngle);
  }

  public static getThetaByTangentAngle(rx: number, ry: number, ang: number) {
    ang = AngDeg.fitAng(ang);
    if (ang === 0 || ang === AngDeg.DEG90 || ang === AngDeg.DEG180 || ang === AngDeg.DEG270) {
      return AngDeg.fitAng(ang - AngDeg.DEG90);
    }
    else {
      const tangentSlope = Math.tan(ang);
      const thetaTan = -ry / rx / tangentSlope;
      let theta = Math.atan(thetaTan);
      if (ang > AngDeg.DEG180 && ang < AngDeg.DEG360) {
        theta += AngDeg.DEG180;
      }
      return AngDeg.fitAng(theta);
    }
  }

  public static calcEllipseByTwoPoints(
    p1: IPoint,
    p2: IPoint,
    rx: number,
    ry: number,
    isCW: boolean,
    largeArc: boolean,
    rotDeg?: number): IEllipticalArc | null
  {
    if (rx<=0 || ry <= 0) return null;
    // The line direction is from P2 (end point) to P1 (start point)
    const lsEndPoints = new LineSeg(p2, p1);
    if (WtMath.isZero(lsEndPoints.len)) return null;
    // Check if the given Ellipse size is too small, if so, enlarge it by some scale factor
    const r = AngDeg.fitDeg(rotDeg ?? 0);
    const vecAng = lsEndPoints.ang - r;
    const thetaOfLine = Ellipse.getThetaByVectorAngle(rx, ry, vecAng);
    const distToCenter = Ellipse.getDistanceToCenter(rx, ry, thetaOfLine);
    if (distToCenter <= lsEndPoints.len / 2) {
      const scaleFactor = lsEndPoints.len / 2 / distToCenter;
      return {
        rx: rx * scaleFactor,
        ry: ry * scaleFactor,
        cx: lsEndPoints.middle.x,
        cy: lsEndPoints.middle.y,
        rot: r,
        angStart: thetaOfLine,
        angEnd: AngDeg.fitAng(thetaOfLine + AngDeg.DEG180),
        pStart: p1,
        pEnd: p2,
      } as IEllipticalArc;
    }

    const A = (p1.x - p2.x) * Math.cos(r) + (p1.y - p2.y) * Math.sin(r);
    const B = -(p1.x - p2.x) * Math.sin(r) + (p1.y - p2.y) * Math.cos(r);
    // console.log(`r: ${r}, A: ${A}, B: ${B}`);
    if (WtMath.isZero(A) && WtMath.isZero(B)) return null;
    let alphaBetas: {alpha: number; beta: number}[] = [];
    if (WtMath.isZero(A)) {
      alphaBetas.push(
        {alpha: AngDeg.DEG0, beta: Math.asin(B / 2 / ry)},
        {alpha: AngDeg.DEG0, beta: AngDeg.DEG180 - Math.asin(B / 2 / ry)},
        {alpha: AngDeg.DEG180, beta: Math.asin(-B / 2 / ry)},
        {alpha: AngDeg.DEG180, beta: AngDeg.DEG180 - Math.asin(-B / 2 / ry)}
        );
    } else if (WtMath.isZero(B)) {
      alphaBetas.push(
        {alpha: AngDeg.DEG90, beta: Math.asin(-A / 2 / rx)},
        {alpha: AngDeg.DEG90, beta: AngDeg.DEG180 - Math.asin(-A / 2 / rx)},
        {alpha: AngDeg.DEG270, beta: Math.asin(A / 2/ rx)},
        {alpha: AngDeg.DEG270, beta: AngDeg.DEG180 - Math.asin(A / 2/ rx)}
      );
    } else {
      const alphaTan = Math.atan(-A * ry / B / rx);
      let sinBeta = -A / 2 / rx / Math.sin(alphaTan);
      sinBeta = sinBeta > 1 ? 1 : sinBeta < -1 ? -1 : sinBeta;
      // console.log(-A / 2 / rx / Math.sin(alphaTan));
      const betaSin = Math.asin(sinBeta);
      alphaBetas.push(
        {alpha: alphaTan, beta: betaSin},
        {alpha: alphaTan, beta: AngDeg.DEG180 - betaSin},
        {alpha: alphaTan + AngDeg.DEG180, beta: -betaSin},
        {alpha: alphaTan + AngDeg.DEG180, beta: betaSin + AngDeg.DEG180 }
      );
    }
    // console.log(alphaBetas);
    let thetas = alphaBetas.map(ab => {
      return {
        theta1: AngDeg.fitAng(ab.alpha + ab.beta),
        theta2: AngDeg.fitAng(ab.alpha - ab.beta)
      }})
      .reduce((final, th) => {
        if (final.filter(x => WtMath.isEqual(x.theta1, th.theta1) && WtMath.isEqual(x.theta2, th.theta2)).length < 1) {
          return [...final, th]
        } else return final
      }, [] as {theta1: number, theta2: number}[]);
    // console.log(thetas);

    thetas = thetas.length === 1
      ? thetas
      : (largeArc && !isCW) || (!largeArc && isCW)
      ? thetas.filter(x => AngDeg.fitAng(x.theta1 - x.theta2) > AngDeg.DEG180)
      : thetas.filter(x => AngDeg.fitAng(x.theta1 - x.theta2) < AngDeg.DEG180);
    const ang1 = thetas[0].theta1;
    const cx = p1.x - (rx * Math.cos(ang1) * Math.cos(r) - ry * Math.sin(ang1) * Math.sin(r));
    const cy = p1.y - (rx * Math.cos(ang1) * Math.sin(r) + ry * Math.sin(ang1) * Math.cos(r));

    const ellipse = new Ellipse(cx, cy, rx, ry, r);
    return {
      rx: ellipse.rx,
      ry: ellipse.ry,
      cx: ellipse.cx,
      cy: ellipse.cy,
      rot: ellipse.rot,
      angStart: thetas[0].theta1,
      angEnd: thetas[0].theta2,
      pStart: p1,
      pEnd: p2,
    }
  }
  
  public static getXPoints(ell1: IEllipse, ell2: IEllipse): Point[] {
    return Ellipse.getXPointsOfTwo(ell1, ell2);
  }

  private static getXPointsOfTwo(ell1: IEllipse, ell2: IEllipse): Point[] {
    const rotDiff = AngDeg.fitAng(ell2.rot - ell1.rot);
    const xAxisParallel = WtMath.isZero(rotDiff) || WtMath.isEqual(AngDeg.DEG180, rotDiff);
    const xAxisPerpendicular = WtMath.isEqual(AngDeg.DEG90, rotDiff) || WtMath.isEqual(AngDeg.DEG270, rotDiff);
    // If the two ellipse are identical (long/short axis are equal), then null will be returned, because there will be tremendous intersection points
    if (WtMath.isEqual(ell1.cx, ell2.cx) && 
        WtMath.isEqual(ell1.cy, ell2.cy) &&
        ((WtMath.isEqual(ell1.rx, ell2.rx) && WtMath.isEqual(ell1.ry, ell2.ry) && xAxisParallel) ||
         (WtMath.isEqual(ell1.rx, ell2.ry) && WtMath.isEqual(ell1.ry, ell2.rx) && xAxisPerpendicular)
        )
      ) {
        return [];
      }
    const A =  (ell2.cx - ell1.cx) * Math.cos(ell1.rot) + (ell2.cy - ell1.cy) * Math.sin(ell1.rot),
          B = -(ell2.cx - ell1.cx) * Math.sin(ell1.rot) + (ell2.cy - ell1.cy) * Math.cos(ell1.rot),
          M = A / ell1.rx,
          k1 =  ell2.rx * Math.cos(rotDiff) / ell1.rx,
          k2 = -ell2.ry * Math.sin(rotDiff) / ell1.rx,
          N = B / ell1.ry,
          l1 =  ell2.rx * Math.sin(rotDiff) / ell1.ry,
          l2 =  ell2.ry * Math.cos(rotDiff) / ell1.ry;
    const a = M ** 2 + k1 ** 2 - 2 * M * k1 + N ** 2 + l1 ** 2 - 2 * N * l1 - 1,
          b = 4 * M * k2 - 4 * k1 * k2 + 4 * N * l2 - 4 * l1 * l2,
          c = 2 * M ** 2 - 2 * k1 ** 2 + 4 * k2 ** 2 + 2 * N ** 2 - 2 * l1 ** 2 + 4 * l2 ** 2 - 2,
          d = 4 * M * k2 + 4 * k1 * k2 + 4 * N * l2 + 4 * l1 * l2,
          e = M ** 2 + k1 ** 2 + 2 * M * k1 + N ** 2 + l1 ** 2 + 2 * N * l1 - 1;
    const xps = WtMath.solveQuarticToSinCos(a, b, c, d, e)
      .map(theta => 
        new Point(ell2.rx * theta.cos, ell2.ry * theta.sin)
          .rotate(ell2.rot)
          .moveByXY(ell2.cx, ell2.cy)
      );
    return Point.deDupPoints(xps);
  }

  public static getTouchingPointsOfCircle(ell1: IEllipse, cCircle: IPoint): IPoint[] {
    const deltaX = ell1.cx - cCircle.x,
          deltaY = ell1.cy - cCircle.y,          
          v1 = deltaY * Math.cos(ell1.rot) - deltaX * Math.sin(ell1.rot),
          v2 = ell1.ry ** 2 - ell1.rx ** 2,
          v3 = deltaY * Math.sin(ell1.rot) + deltaX * Math.cos(ell1.rot),
          a = ell1.ry * v1,
          b =  2 * v2 + 2 * ell1.rx * v3,
          c = -2 * v2 + 2 * ell1.rx * v3;
    const points = WtMath.solveQuarticToSinCos(a, b, 0, c, -a)
      .map(t =>new Point(
        ell1.cx + ell1.rx * t.cos * Math.cos(ell1.rot) - ell1.ry * t.sin * Math.sin(ell1.rot),
        ell1.cy + ell1.rx * t.cos * Math.sin(ell1.rot) + ell1.ry * t.sin * Math.cos(ell1.rot)
      ));
    return Point.deDupPoints(points);
  }

  public static getRotateAngleOnTouch(ell1: IEllipse, ell2: IEllipse, keepExternal?: boolean): IEllipseTouchingPoint[] {
    const possibleRadius = Ellipse.getTouchingPointsOfCircle(ell1, new Point(ell2.cx, ell2.cy))
    if (!possibleRadius) return [];
    const minRadius = possibleRadius.map(p => ({
      p: p,
      r: Math.sqrt((p.x - ell2.cx) ** 2 + (p.y - ell2.cy) ** 2)
    }))
      .reduce((final, val) => {
        if (final.r < 0) {
          return {
            p: val.p,
            r: val.r
          }
        } else {
          return val.r <= final.r ? val: final;
        }
      }, {
        p: new Point(0, 0),
        r: -1
      });
    // When Ellipse 2 is circle, it will have the only point that calculated by previous step and only on the condition
    // that the radiuses are identical
    if (WtMath.isEqual(ell2.ry / ell2.rx, 1)) {
      return WtMath.isEqual(minRadius.r, ell2.rx) 
        ? [{
          theta: 0,
          rot: 0,
          point: minRadius.p,
        }] : []
    }
    const ell2Rmin = Math.min(ell2.rx, ell2.ry);
    const ell2Rmax = Math.max(ell2.rx, ell2.ry);
    // If Ellipse 2 is always intersect with Ellipse 1 or never intersect with Ellipse 1, then no results returned.
    if (minRadius.r < ell2Rmin || minRadius.r > ell2Rmax) return [];
    // Now calculate the normal case
    const dcx = ell2.cx - ell1.cx,
          dcy = ell2.cy - ell1.cy,
          cr1 = Math.cos(ell1.rot),
          sr1 = Math.sin(ell1.rot),
          A =   dcx * cr1 + dcy * sr1,
          B = - dcx * sr1 + dcy * cr1,
          k0 = ell2.rx / ell1.rx,
          k1 = ell1.ry / ell1.rx,
          k2 = ell2.ry / ell2.rx,
          M = A / k0 / ell1.rx,
          N = B / k0 / ell1.rx,
          k = (1 - k2) / (1 + k2),
          m = 2 * M / (1 + k2),
          n = 2 * N / (1 + k2),
          k12 = k1 ** 2,
          mk12 = m * k12,
          mk1 = 1 - k12,
          pk1 = 1 + k12;
    const f1 = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return n * cx - mk12 * sx
           - n * k * cy + mk12 * k * sy
           + mk1 * sx * cx
           - k * pk1 * sx * cy
           + k * pk1 * cx * sy
           - k ** 2 * mk1 * sy * cy;
    };
    const f1dx = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return - n * sx - mk12 * cx
             + mk1 * (cx * cx - sx * sx)
             - k * pk1 * cx * cy
             - k * pk1 * sx * sy;
    };
    const f1dy = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return n * k * sy + mk12 * k * cy
           + k * pk1 * sx * sy
           + k * pk1 * cx * cy
           - k ** 2 * mk1 * (cy * cy - sy * sy);
    }
    const f2 = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return 2 * mk12 * cx + 2 * n * sx
           + 2 * mk12 * k * cy + 2 * n * k * sy
           + mk1 * sx * sx
           + k ** 2 * mk1 * sy * sy
           + 2 * k * k12 * cx * cy + 2 * k * sx * sy
           + m ** 2 * k12 + n ** 2 + k12 + k ** 2 * k12 - 4 * k12 / (k0 ** 2 * (1 + k2) ** 2);
    };
    const f2dx = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return - 2 * mk12 * sx + 2 * n * cx
             + mk1 * 2 * sx * cx
             - 2 * k * k12 * sx * cy + 2 * k * cx * sy;
    }
    const f2dy = (x: number, y: number) => {
      const cx = Math.cos(x);
      const sx = Math.sin(x);
      const cy = Math.cos(y);
      const sy = Math.sin(y);
      return - 2 * mk12 * k * sy + 2 * n * k * cy
             + k ** 2 * mk1 * 2 * sy * cy
             - 2 * k * k12 * cx * sy + 2 * k * sx * cy;
    }
    const results: IEllipseTouchingPoint[] = [];
    const angInitials = [
      [AngDeg.deg2Ang(   6), AngDeg.deg2Ang(  15)],
      [AngDeg.deg2Ang( 112), AngDeg.deg2Ang( -20)],
      [AngDeg.deg2Ang( 173), AngDeg.deg2Ang(  13)],
      [AngDeg.deg2Ang( 194), AngDeg.deg2Ang(-201)],
      [AngDeg.deg2Ang( 267), AngDeg.deg2Ang( 280)],
      [AngDeg.deg2Ang( 272), AngDeg.deg2Ang(-160)],
      [AngDeg.deg2Ang( 316), AngDeg.deg2Ang( 142)],
      [AngDeg.deg2Ang( 358), AngDeg.deg2Ang(  46)],
      [AngDeg.deg2Ang( -22), AngDeg.deg2Ang( 342)],
      [AngDeg.deg2Ang( -66), AngDeg.deg2Ang(-280)],
      [AngDeg.deg2Ang( -88), AngDeg.deg2Ang(  15)],
      [AngDeg.deg2Ang(-111), AngDeg.deg2Ang( -20)],
      [AngDeg.deg2Ang(-167), AngDeg.deg2Ang(  13)],
      [AngDeg.deg2Ang(-232), AngDeg.deg2Ang(-201)],
      [AngDeg.deg2Ang(-265), AngDeg.deg2Ang( 280)],
      [AngDeg.deg2Ang(-288), AngDeg.deg2Ang( -70)],
      [AngDeg.deg2Ang(-311), AngDeg.deg2Ang( 142)],
      [AngDeg.deg2Ang(-342), AngDeg.deg2Ang(  46)],
    ];
    angInitials.forEach(ang => {
      const res = WtMath.newtonMethodSolveXY(
        f1, f1dx, f1dy,
        f2, f2dx, f2dy,
        ang[0], ang[1],
        1000);
      if (res.succeeded) {
        const alpha = (res.value as number[])[0];
        const beta  = (res.value as number[])[1];
        let rot2  = AngDeg.fitAng((alpha + beta) / 2 + ell1.rot);
        let theta2 = AngDeg.fitAng((alpha - beta) / 2);
        if (rot2 > AngDeg.DEG180) {
          rot2 -= AngDeg.DEG180;
          theta2 = AngDeg.fitAng(theta2 - AngDeg.DEG180);
        }
        // console.log(`ITER COUNT: ${res.iterCount}, ROT: ${rot2}, THETA: ${theta2}`);
        if (results.filter(r => 
          Math.abs(r.theta - theta2) < 1e-8 && 
          Math.abs(r.rot - rot2)     < 1e-8).length < 1
          ) {
            results.push({
              theta: theta2,
              rot: rot2,
              point: Ellipse.calcPoint(ell2.cx, ell2.cy, ell2.rx, ell2.ry, theta2, rot2)
            });
          }
      }
    })
    if (keepExternal && results.length > 2) {
      const c1 = new Point(ell1.cx, ell1.cy);
      const centerLine = new LineSeg(c1, new Point(ell2.cx, ell2.cy));
      const angDiffsCW = results.map((r,idx) => {
        let angDiff = AngDeg.fitAng(new LineSeg(c1, r.point).ang - centerLine.ang);
        return {
          diff: angDiff,
          idx: idx,
        }        
      });
      const angDiffsCCW = results.map((r,idx) => {
        let angDiff = AngDeg.fitAng(centerLine.ang - new LineSeg(c1, r.point).ang);
        return {
          diff: angDiff,
          idx: idx,
        }        
      });
      angDiffsCW.sort((a, b) => a.diff - b.diff);
      angDiffsCCW.sort((a, b) => a.diff - b.diff);
      return [results[angDiffsCCW[0].idx], results[angDiffsCW[0].idx]];
    }
    return results;
  }
}
