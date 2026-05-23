import type {
  IBezier2,
  IBezier3,
  IBezier3CurveRadius,
  ICurveFuncsByT,
  IGeometryModel,
  ILine,
  IPoint,
  ISegmentModel
} from "./IGeometry.js";
import { WtMath } from "../math/WtMath.js";
import Line from "./Line.js";
import Point from "./Point.js";
import LineSeg from "./LineSeg.js";
import Vector from "./Vector.js";
import { AngDeg } from "./AngDeg.js";
import { solveCubic, solveQuadratic } from "../math/solve-equation.js";
import { SegmentModel } from "./SegmentModel.js";

export class Bezier {
  isValid: boolean;
  pStart?: Point;
  pEnd?: Point;
  ctrlPoints: Point[] = [];
  order: number = 0;
  constructor(...points: IPoint[]) {
    if (!points || points.length < 2) this.isValid = false;
    this.isValid = true;
    this.order = points.length - 1;
    this.pStart = new Point(points[0].x, points[0].y);
    this.pEnd = new Point(points[points.length - 1].x, points[points.length - 1].y);
    this.ctrlPoints = points.reduce((cp, p, idx, arr) => {
      if (idx > 0 && idx < arr.length - 1) return [...cp, new Point(p.x, p.y)];
      return cp;
    }, [] as Point[]);
  }

  calcPoint(t: number): Point | undefined {
    if (!this.isValid) return undefined;
    t = WtMath.fitTin0and1(t);
    const point = [this.pStart as Point, ...this.ctrlPoints, this.pEnd as Point]
      .reduce((pt, p, idx) => {
        return {
          x: pt.x + p.x * WtMath.bernsteinPolynomial(idx, this.ctrlPoints.length + 1, t),
          y: pt.y + p.y * WtMath.bernsteinPolynomial(idx, this.ctrlPoints.length + 1, t),
        }
      }, { x: 0, y: 0 } as IPoint);
    return new Point(point.x, point.y);
  }

  getTangentLine = (t: number): Line | undefined => {
    if (!this.isValid) return undefined;
    if (!WtMath.isIn0and1(t)) return undefined;
    const p = this.calcPoint(t) as Point;
    const pDelta = this.calcPoint(t > (1 - WtMath.CURVE_T_DELTA) ? t - WtMath.CURVE_T_DELTA : t + WtMath.CURVE_T_DELTA) as Point;
    return Line.fromTwoPoints(p, pDelta);
  }
}

/**
 * The 2nd order Bezier curve, only one control point.
 */
export class Bezier2 implements IBezier2, IGeometryModel, ISegmentModel {
  pStart: Point;
  pEnd: Point;
  ctrlPoint: Point;

  constructor(pStart: IPoint, pCtrl: IPoint, pEnd: IPoint) {
    this.pStart = new Point(pStart.x, pStart.y);
    this.pEnd = new Point(pEnd.x, pEnd.y);
    this.ctrlPoint = new Point(pCtrl.x, pCtrl.y);
  }

  calcPoint(t: number): Point {
    t = WtMath.fitTin0and1(t);
    return new Point(
      this.pStart.x * (1 - t) ** 2 + 2 * this.ctrlPoint.x * (1 - t) * t + this.pEnd.x * t ** 2,
      this.pStart.y * (1 - t) ** 2 + 2 * this.ctrlPoint.y * (1 - t) * t + this.pEnd.y * t ** 2,
    );
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "s" || pos === "start") return this.pStart;
      if (pos === "m" || pos === "mid" || pos === "middle") return this.calcPoint(0.5);
      if (pos === "e" || pos === "end") return this.pEnd;
      return undefined;
    }
    if (WtMath.isIn0and1(pos)) return this.calcPoint(pos);
    return undefined;
  }

  getTangentLine(t: number): Line | undefined {
    if (!WtMath.isIn0and1(t)) return undefined;
    const p = this.calcPoint(t);
    // This is the point of (dx/dt, dy/dt)
    const vecDp = new Vector(
      2 * (t - 1) * this.pStart.x + 2 * (1 - 2 * t) * this.ctrlPoint.x + 2 * t * this.pEnd.x,
      2 * (t - 1) * this.pStart.y + 2 * (1 - 2 * t) * this.ctrlPoint.y + 2 * t * this.pEnd.y,
    );
    return new Line(p, vecDp.ang);
  }

  getSubCurve(tStart: number, tEnd: number): Bezier2 {
    tStart = WtMath.fitTin0and1(tStart);
    tEnd = WtMath.fitTin0and1(tEnd);
    const pStart = this.calcPoint(tStart),
          pEnd = this.calcPoint(tEnd),
          pm = this.calcPoint(tStart + (tEnd - tStart) / 2);
    return Bezier2.buildFrom3Points(pStart, pm, pEnd);
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "degs")  return new LineSeg(this.pStart, this.ctrlPoint).getParam("deg");
    if (name === "degsr") return new LineSeg(this.pStart, this.ctrlPoint).getParam("degr");
    if (name === "clens") return new LineSeg(this.pStart, this.ctrlPoint).len;
    if (name === "dege")  return new LineSeg(this.ctrlPoint, this.pEnd).getParam("deg");
    if (name === "deger") return new LineSeg(this.ctrlPoint, this.pEnd).getParam("degr");
    if (name === "clene") return new LineSeg(this.ctrlPoint, this.pEnd).len;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel {
    return new Bezier2(
      Point.moveBy(this.pStart, dx, dy),
      Point.moveBy(this.ctrlPoint, dx, dy),
      Point.moveBy(this.pEnd, dx, dy)
    )
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel {
    return new Bezier2(
      Point.rotateBy(this.pStart, rotDeg, at),
      Point.rotateBy(this.ctrlPoint, rotDeg, at),
      Point.rotateBy(this.pEnd, rotDeg, at)
    )
  }

  duplicateTo(distance: number, dir: "right" | "left"): Bezier2 {
    distance = Math.abs(distance);
    const lnStart = this.getTangentLine(0),
          lnHalf = this.getTangentLine(0.5),
          lnEnd = this.getTangentLine(1),
          angNormal = dir === "right" ? AngDeg.DEG90 : AngDeg.DEG270;
    const pStart = new Line(lnStart!.anchor, lnStart!.ang + angNormal).getPointByLen(distance),
          pHalf = new Line(lnHalf!.anchor, lnHalf!.ang + angNormal).getPointByLen(distance),
          pEnd = new Line(lnEnd!.anchor, lnEnd!.ang + angNormal).getPointByLen(distance);
    return Bezier2.buildFrom3Points(pStart, pHalf, pEnd);
  }

  isCw(): boolean {
    const ln0 = this.getTangentLine(0),
          lnHalf = new LineSeg(this.pStart, this.calcPoint(0.5));
    return AngDeg.isFromToCw(ln0!.ang, lnHalf.ang);
  }

  getTofPoint(p: IPoint): number | undefined {
    const xts = Bezier2.solveT(this, "x", p.x),
          yts = Bezier2.solveT(this, "y", p.y);
    if (xts.length < 1 || yts.length < 1) return undefined;
    for (let i = 0; i < xts.length; i++) {
      if (yts.filter(y => WtMath.isEqualOnTol(y, xts[i], 5e-4)).length > 0) {
        return xts[i];
      }
    }
  }
  
  getIntersectionToHline(y: number): Point[] {
    return Bezier2.solveT(this, "y", y).map(t => this.calcPoint(t))
  }

  getIntersectionToVline(x: number): Point[] {
    return Bezier2.solveT(this, "x", x).map(t => this.calcPoint(t))
  }

  
  makeSubSeg(pStart: IPoint, pEnd: IPoint): Bezier2 | undefined {
    const tStart = this.getTofPoint(pStart),
          tEnd = this.getTofPoint(pEnd);
    if (tStart === undefined || tEnd === undefined) return undefined;
    if (WtMath.isEqual(tStart, tEnd)) return undefined;
    return Bezier2.buildFrom3Points(
      pStart, 
      this.calcPoint(tStart / 2 + tEnd / 2),
      pEnd
    );
  }

  getTangentLineOfPoint(p: IPoint): ILine | undefined {
    let t = this.getTofPoint(p);
    return t ? this.getTangentLine(t) : undefined;
  }

  getCurveFuncs(): ICurveFuncsByT {
    return {
      px: (t: number) => this.pStart.x * (1 - t) ** 2 + 2 * this.ctrlPoint.x * (1 - t) * t + this.pEnd.x * t ** 2,
      py: (t: number) => this.pStart.y * (1 - t) ** 2 + 2 * this.ctrlPoint.y * (1 - t) * t + this.pEnd.y * t ** 2,
      dpx: (t: number) => - 2 * (1 - t) * this.pStart.x + 2 * (1 - 2 * t) * this.ctrlPoint.x + 2 * t * this.pEnd.x,
      dpy: (t: number) => - 2 * (1 - t) * this.pStart.y + 2 * (1 - 2 * t) * this.ctrlPoint.y + 2 * t * this.pEnd.y,
    }
  }
  
  getNormalPoint(t: number, dist: number, dir: "right" | "left"): Point | undefined {
    const ln = this.getTangentLine(t);
    if (!ln) return undefined;
    const ang = dir === "right" ? ln.ang + AngDeg.DEG90 : ln.ang - AngDeg.DEG90;
    return new Line(ln.anchor, ang).getPointByLen(dist);
  }

  // Static Methods
  
  static solveT(b2: Bezier2, xOrY: "x" | "y", target: number): number[] {
    const m = xOrY === "x"
      ? [b2.pStart.x, b2.ctrlPoint.x, b2.pEnd.x]
      : [b2.pStart.y, b2.ctrlPoint.y, b2.pEnd.y];
    let c2 = m[2] - 2 * m[1] + m[0], 
        c1 = 2 * m[1] - 2 * m[0],
        c0 = m[0] - target;
    return solveQuadratic(c2, c1, c0)
      .filter(x => WtMath.isZero(x.im))
      .map(x => x.re)
      .filter(x => WtMath.isEqual(x, 0) || WtMath.isEqual(x, 1) || WtMath.isIn0and1(x));
  }

  static buildFrom3Points(pStart: IPoint, pMid: IPoint, pEnd: IPoint): Bezier2 {
    const pCtrl = new Point(
      (4 * pMid.x - pStart.x - pEnd.x) / 2,
      (4 * pMid.y - pStart.y - pEnd.y) / 2
    );
    return new Bezier2(pStart, pCtrl, pEnd);
  }

}

/**
 * The 3rd order Bezier curve, has two control points.
 */
export class Bezier3 implements IBezier3, IGeometryModel, ISegmentModel {
  pStart: Point;
  pEnd: Point;
  ctrlPoint1: Point;
  ctrlPoint2: Point;

  constructor(pStart: IPoint, pCtrl1: IPoint, pCtrl2: IPoint, pEnd: IPoint) {
    this.pStart = new Point(pStart.x, pStart.y);
    this.pEnd = new Point(pEnd.x, pEnd.y);
    this.ctrlPoint1 = new Point(pCtrl1.x, pCtrl1.y);
    this.ctrlPoint2 = new Point(pCtrl2.x, pCtrl2.y);
  }

  calcPoint(t: number) {
    t = WtMath.fitTin0and1(t);
    return new Point(
      this.pStart.x * (1 - t) ** 3 + 3 * this.ctrlPoint1.x * (1 - t) ** 2 * t + 3 * this.ctrlPoint2.x * (1 - t) * t ** 2 + this.pEnd.x * t ** 3,
      this.pStart.y * (1 - t) ** 3 + 3 * this.ctrlPoint1.y * (1 - t) ** 2 * t + 3 * this.ctrlPoint2.y * (1 - t) * t ** 2 + this.pEnd.y * t ** 3,
    );
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (typeof pos === "string") {
      if (pos === "s" || pos === "start") return this.pStart;
      if (pos === "m" || pos === "mid" || pos === "middle") return this.calcPoint(0.5);
      if (pos === "e" || pos === "end") return this.pEnd;
      return undefined;
    }
    if (WtMath.isIn0and1(pos)) return this.calcPoint(pos);
    return undefined;
  }

  getTangentVector(t: number): Vector {
    // This is the point of (d(P.x)/dt, d(P.y)/dt)/3, where 3 is the shared coefficient, so removed
    return new Vector(
      (1 - 4 * t + 3 * t ** 2) * this.ctrlPoint1.x - (1 - t) ** 2 * this.pStart.x + (2 * t - 3 * t ** 2) * this.ctrlPoint2.x + t ** 2 * this.pEnd.x,
      (1 - 4 * t + 3 * t ** 2) * this.ctrlPoint1.y - (1 - t) ** 2 * this.pStart.y + (2 * t - 3 * t ** 2) * this.ctrlPoint2.y + t ** 2 * this.pEnd.y
    );
  }

  getXy2ndDerivation(t: number): Vector {
    return new Vector(
      (- 4 + 6 * t) * this.ctrlPoint1.x + 2 * (1 - t) * this.pStart.x + (2 - 6 * t) * this.ctrlPoint2.x + 2 * t * this.pEnd.x,
      (- 4 + 6 * t) * this.ctrlPoint1.y + 2 * (1 - t) * this.pStart.y + (2 - 6 * t) * this.ctrlPoint2.y + 2 * t * this.pEnd.y
    );
  }

  getAngDiff(t: number): number {
    return this.getCurveRadius(t).dAng;
  }

  getCurveRadius(t: number): IBezier3CurveRadius {
    let diff1 = this.getTangentVector(t),
        diff2 = this.getXy2ndDerivation(t),
        dAngNum = diff1.x * diff2.y - diff1.y * diff2.x,
        dAngDenom = diff1.x ** 2 + diff1.y ** 2;
    if (WtMath.isZero(dAngNum)) return {
      t: t,
      r: Number.POSITIVE_INFINITY,
      dAng: 0,
    };
    return {
      t: t,
      r: 3 * (dAngDenom ** 1.5) / Math.abs(dAngNum),
      dAng: dAngNum / dAngDenom,
    };
  }

  getMinCurveRadius(): IBezier3CurveRadius[] {
    let N = 10000;
    const minRadius: IBezier3CurveRadius[] = [];
    let isRDec = false;
        // rPrev = Number.POSITIVE_INFINITY;
    let resPrev: IBezier3CurveRadius = {
      r: Number.POSITIVE_INFINITY,
      t: 0,
      dAng: 0,
    };
    for (let i = 0; i < N + 1; i++) {
      let t = i / N;
      let rt = this.getCurveRadius(t);
      if (rt.r <= resPrev.r) {
        isRDec = true;
      } else {
        if (isRDec) {
          minRadius.push(resPrev);
        }
        isRDec = false;
      }
      resPrev = rt;
    }
    return minRadius;
  }

  getTangentLine(t: number): Line | undefined {
    if (!WtMath.isIn0and1(t)) return undefined;
    const p = this.calcPoint(t);
    const vecDp = this.getTangentVector(t);
    return new Line(p, vecDp.ang);
  }

  getSubCurve(tStart: number, tEnd: number): Bezier3 {
    tStart = WtMath.fitTin0and1(tStart);
    tEnd = WtMath.fitTin0and1(tEnd);
    const pStart = this.calcPoint(tStart),
          pEnd = this.calcPoint(tEnd),
          p1 = this.calcPoint(tStart + (tEnd - tStart) / 3),
          p2 = this.calcPoint(tStart + (tEnd - tStart) * 2 / 3);
    return Bezier3.buildFrom4Points(pStart, p1, p2, pEnd);
  }

  getParam(name: string): number | undefined {
    if (!name) return undefined;
    name = name.toLowerCase();
    if (name === "degs")  return new LineSeg(this.pStart, this.ctrlPoint1).getParam("deg");
    if (name === "degsr") return new LineSeg(this.pStart, this.ctrlPoint1).getParam("degr");
    if (name === "clens") return new LineSeg(this.pStart, this.ctrlPoint1).len;
    if (name === "dege")  return new LineSeg(this.ctrlPoint2, this.pEnd).getParam("deg");
    if (name === "deger") return new LineSeg(this.ctrlPoint2, this.pEnd).getParam("degr");
    if (name === "clene") return new LineSeg(this.ctrlPoint2, this.pEnd).len;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    return new Bezier3(
      Point.moveBy(this.pStart, dx, dy),
      Point.moveBy(this.ctrlPoint1, dx, dy),
      Point.moveBy(this.ctrlPoint2, dx, dy),
      Point.moveBy(this.pEnd, dx, dy)
    );
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    return new Bezier3(
      Point.rotateBy(this.pStart, rotDeg, at),
      Point.rotateBy(this.ctrlPoint1, rotDeg, at),
      Point.rotateBy(this.ctrlPoint2, rotDeg, at),
      Point.rotateBy(this.pEnd, rotDeg, at)
    );
  }

  isPointOn(p: IPoint): boolean {
    let t = this.getTofPoint(p);
    return t !== undefined;
  }

  getTofPoint(p: IPoint): number | undefined {
    const xts = Bezier3.solveT(this, "x", p.x),
          yts = Bezier3.solveT(this, "y", p.y);
    if (xts.length < 1 || yts.length < 1) return undefined;
    for (let i = 0; i < xts.length; i++) {
      if (yts.filter(y => WtMath.isEqualOnTol(y, xts[i], 5e-4)).length > 0) {
        return xts[i];
      }
    }
  }

  makeSubSeg(pStart: IPoint, pEnd: IPoint): Bezier3 | undefined {
    const tStart = this.getTofPoint(pStart),
          tEnd = this.getTofPoint(pEnd);
    if (tStart === undefined || tEnd === undefined) return undefined;
    if (WtMath.isEqual(tStart, tEnd)) return undefined;
    return Bezier3.buildFrom4Points(
      pStart, 
      this.calcPoint(tStart * 2 / 3 + tEnd / 3),
      this.calcPoint(tStart / 3 + tEnd * 2 / 3),
      pEnd
    );
  }

  getTangentLineOfPoint(p: IPoint): ILine | undefined {
    let t = this.getTofPoint(p);
    return t ? this.getTangentLine(t) : undefined;
  }
  
  minDistanceToPoint(pFixed: IPoint): number {
    const N = 100;
    let p0toN = [...Array(N + 1).keys()]
      .map(i => this.calcPoint(i * 1/N));
    let dMin = 1e10,
        iMin = 0,
        iMinPrev = 0;
    for (let i = 0; i < N+1; i++) {
      let di = Point.getDistance(p0toN[i], pFixed);
      // Get the Index of Min Distance
      if (di <= dMin) {
        dMin = di;
        iMin = i;
      }
    }
    if (iMin <= 0 || iMin >= N) {
      return dMin;
    }
    iMinPrev = iMin - 1;
    let tDelta = 1 / N / N,
        tRunning = iMinPrev / N,
        d0 = Point.getDistance(this.calcPoint(tRunning), pFixed),
        d1 = Point.getDistance(this.calcPoint(tRunning + tDelta), pFixed),
        iterCount = 0;
    while(Math.abs(d1 - d0) > WtMath.EPSILON && iterCount < 3000) {
      tRunning = tRunning + tDelta;
      if (d1 >= d0) tDelta = -0.33 * tDelta;
      d0 = Point.getDistance(this.calcPoint(tRunning), pFixed);
      d1 = Point.getDistance(this.calcPoint(tRunning + tDelta), pFixed);
      iterCount++;
    }
    return d0;
  }

  getNormalPoint(t: number, dist: number, dir: "right" | "left"): Point | undefined {
    const ln = this.getTangentLine(t);
    if (!ln) return undefined;
    const ang = dir === "right" ? ln.ang + AngDeg.DEG90 : ln.ang - AngDeg.DEG90;
    return new Line(ln.anchor, ang).getPointByLen(dist);
  }

  getNormalLine(t: number): Line | undefined {
    const ln = this.getTangentLine(t);
    return ln ? new Line(ln.anchor, ln.ang + AngDeg.DEG90) : undefined;
  }

  getTofCurveRadius(t0: number, r0: number) {
    let tLeft = 0,
        tRight = 1;
    if (t0 < 0 || t0 > 1) return undefined;
    let t = t0;
    while (t > 0) {
      let r = this.getCurveRadius(t).r;
      if (r >= r0) {
        tLeft = t;
        break;
      }
      t -= 0.0001;
    }
    if (t <= 0) return undefined;
    t = t0;
    while (t < 1) {
      let r = this.getCurveRadius(t).r;
      if (r >= r0) {
        tRight = t;
        break;
      }
      t += 0.0001;
    }
    if (t >= 1) return undefined;
    let ang = (this.getTangentVector(tLeft).ang + this.getTangentVector(tRight).ang) / 2;
    return {
      left: tLeft,
      right: tRight,
      ang: ang,
    }
  }

  duplicateTo(distance: number, dir: "right" | "left"): Bezier3 | Bezier3[] | undefined {
    distance = Math.abs(distance);
    // Build the normal line seg
    const getNormalPointOfT = (t: number) => this.getNormalPoint(t, distance, dir)!;
    const buildNormalLineSeg = (t: number) => new LineSeg(this.calcPoint(t), getNormalPointOfT(t));
    const buildDuplicatedSeg = (tStart: number, tEnd: number, pStart?: IPoint, pEnd?: IPoint) => {
      const ps = pStart || getNormalPointOfT(tStart),
            pe = pEnd || getNormalPointOfT(tEnd),
            t33 = tStart * 2 / 3 + tEnd / 3,
            t66 = tStart / 3 + tEnd * 2 / 3,
            p33 = getNormalPointOfT(t33),
            p66 = getNormalPointOfT(t66),
            angS = this.getTangentVector(tStart).ang,
            angE = this.getTangentVector(tEnd).ang
      return Bezier3.fitWithTangentLine(ps, angS, pe, angE - AngDeg.DEG180, p33, p66);
    }

    // Get Curve Min Radius
    const minR = this.getMinCurveRadius();
    // If the two turning points are close enough, then merge them.
    if (minR.length === 2 && Math.abs((minR[0].t - minR[1].t)) < 0.005) {
      minR[0].t = (minR[0].t + minR[1].t) / 2;
      minR[0].dAng = (minR[0].dAng + minR[1].dAng) / 2;
      minR[0].r = (minR[0].r + minR[1].r) / 2;
      minR.pop();
    }
    if (minR.length === 1) {
      let pMid;
      if (distance > minR[0].r * 2 && ((minR[0].dAng > 0 && dir === "right") || (minR[0].dAng < 0 && dir === "left"))) {
        const lsMove1 = buildNormalLineSeg(minR[0].t / 2);
        const lsMove2 = buildNormalLineSeg(minR[0].t / 2 + 1 / 2);
        const b3Move1 = this.moveBy(lsMove1.len * Math.cos(lsMove1.ang), lsMove1.len * Math.sin(lsMove1.ang)) as Bezier3;
        const b3Move2 = this.moveBy(lsMove2.len * Math.cos(lsMove2.ang), lsMove2.len * Math.sin(lsMove2.ang)) as Bezier3;
        const xCorner = SegmentModel.getIntersection(b3Move1, minR[0].t * 0.995, b3Move2, minR[0].t * 1.005);
        if (!xCorner) return undefined;
        pMid = new Point(xCorner.px, xCorner.py);
      }
      let tM = minR[0].t,
          tM1 = tM / 2,
          tM2 = tM / 2 + 1 / 2,
          segs = [
            buildDuplicatedSeg(0, tM1),
            buildDuplicatedSeg(tM1, tM, undefined, pMid),
            buildDuplicatedSeg(tM, tM2, pMid),
            buildDuplicatedSeg(tM2, 1)
          ];
      if (segs.filter(x => x === undefined).length > 0) return undefined;
      else return segs.filter(x => !!x) as Bezier3[];
    }
    else if (minR.length === 2) {
      let tMid = (minR[0].t + minR[1].t) / 2;
      let segs: (Bezier3 | undefined)[] = [];
      let pTurn1, pTurn2;
      let t1Left  = minR[0].t, 
          t1Right = minR[0].t, 
          t2Left  = minR[1].t,
          t2Right = minR[1].t;
      // Handle the first turn point
      if (distance >= minR[0].r * 2 && ((minR[0].dAng > 0 && dir === "right") || (minR[0].dAng < 0 && dir === "left"))) {
        const lsMove1 = buildNormalLineSeg(0);
        const lsMove2 = buildNormalLineSeg(tMid);
        const b3Move1 = this.moveBy(lsMove1.len * Math.cos(lsMove1.ang), lsMove1.len * Math.sin(lsMove1.ang)) as Bezier3;
        const b3Move2 = this.moveBy(lsMove2.len * Math.cos(lsMove2.ang), lsMove2.len * Math.sin(lsMove2.ang)) as Bezier3;
        const xCorner = SegmentModel.getIntersection(b3Move1, minR[0].t * 0.995, b3Move2, minR[0].t * 1.005);
        if (!xCorner) return undefined;
        pTurn1 = new Point(xCorner.px, xCorner.py);
        t1Left = xCorner.t1;
        t1Right = xCorner.t2;
      }

      if (t1Left > 0.25) {
        segs.push(
          buildDuplicatedSeg(0, t1Left / 2),
          buildDuplicatedSeg(t1Left / 2, t1Left, undefined, pTurn1)
        )
      } else {
        segs.push(
          buildDuplicatedSeg(0, t1Left, undefined, pTurn1)
        )
      }
      if (tMid - t1Right > 0.25) {
        let tMid2 = t1Right / 2 + tMid / 2;
        segs.push(
          buildDuplicatedSeg(t1Right, tMid2, pTurn1),
          buildDuplicatedSeg(tMid2, tMid)
        )
      } else {
        segs.push(
          buildDuplicatedSeg(t1Right, tMid, pTurn1)
        )
      }

      // Handle the second turn point
      if (distance >= minR[1].r * 2 && ((minR[1].dAng > 0 && dir === "right") || (minR[1].dAng < 0 && dir === "left"))) {
        const lsMove1 = buildNormalLineSeg(tMid);
        const lsMove2 = buildNormalLineSeg(1);
        const b3Move1 = this.moveBy(lsMove1.len * Math.cos(lsMove1.ang), lsMove1.len * Math.sin(lsMove1.ang)) as Bezier3;
        const b3Move2 = this.moveBy(lsMove2.len * Math.cos(lsMove2.ang), lsMove2.len * Math.sin(lsMove2.ang)) as Bezier3;
        const xCorner = SegmentModel.getIntersection(b3Move1, minR[1].t * 0.995, b3Move2, minR[1].t * 1.005);
        if (!xCorner) return undefined;
        pTurn2 = new Point(xCorner.px, xCorner.py);
        t2Left = xCorner.t1;
        t2Right = xCorner.t2;
      }

      if (t2Left - tMid > 0.25) {
        let tMid3 = t2Left / 2 + tMid / 2;
        segs.push(
          buildDuplicatedSeg(tMid, tMid3),
          buildDuplicatedSeg(tMid3, t2Left, undefined, pTurn2)
        )
      } else {
        segs.push(
          buildDuplicatedSeg(tMid, t2Left, undefined, pTurn2)
        )
      }
      if (t2Right < 0.75) {
        let tMid4 = t2Right / 2 + 1 / 2;
        segs.push(
          buildDuplicatedSeg(t2Right, tMid4),
          buildDuplicatedSeg(tMid4, 1, pTurn2)
        )
      } else {
        segs.push(
          buildDuplicatedSeg(t2Right, 1, pTurn2)
        )
      }
      if (segs.filter(x => x === undefined).length > 0) return undefined;
      return segs.filter(x => !!x)  as Bezier3[];
    }
    // Try fit the duplicated curve with distance
    return buildDuplicatedSeg(0, 1);
  }

  isCw(): boolean {
    const ln0 = this.getTangentLine(0),
          lnHalf = new LineSeg(this.pStart, this.calcPoint(0.5));
    return AngDeg.isFromToCw(ln0!.ang, lnHalf.ang);
  }

  selfIntersection(): Point | undefined {
    let xp = SegmentModel.getIntersection(this, 0, this, 1);
    return xp ? new Point(xp.px, xp.py) : undefined;
  }

  getIntersectionToHline(y: number): Point[] {
    return Bezier3.solveT(this, "y", y).map(t => this.calcPoint(t))
  }

  getIntersectionToVline(x: number): Point[] {
    return Bezier3.solveT(this, "x", x).map(t => this.calcPoint(t))
  }
  
  getCurveFuncs(): ICurveFuncsByT {
    return {
      px: (t: number) => this.pStart.x * (1 - t) ** 3 + 3 * this.ctrlPoint1.x * (1 - t) ** 2 * t + 3 * this.ctrlPoint2.x * (1 - t) * t ** 2 + this.pEnd.x * t ** 3,
      py: (t: number) => this.pStart.y * (1 - t) ** 3 + 3 * this.ctrlPoint1.y * (1 - t) ** 2 * t + 3 * this.ctrlPoint2.y * (1 - t) * t ** 2 + this.pEnd.y * t ** 3,
      dpx: (t: number) => (1 - 4 * t + 3 * t ** 2) * this.ctrlPoint1.x - (1 - t) ** 2 * this.pStart.x + (2 * t - 3 * t ** 2) * this.ctrlPoint2.x + t ** 2 * this.pEnd.x,
      dpy: (t: number) => (1 - 4 * t + 3 * t ** 2) * this.ctrlPoint1.y - (1 - t) ** 2 * this.pStart.y + (2 * t - 3 * t ** 2) * this.ctrlPoint2.y + t ** 2 * this.pEnd.y,
    }
  }

  static solveT(b3: Bezier3, xOrY: "x" | "y", target: number): number[] {
    const m = xOrY === "x"
      ? [b3.pStart.x, b3.ctrlPoint1.x, b3.ctrlPoint2.x, b3.pEnd.x]
      : [b3.pStart.y, b3.ctrlPoint1.y, b3.ctrlPoint2.y, b3.pEnd.y];
    let c3 = m[3] - m[0] + 3 * m[1] - 3 * m[2],
        c2 = 3 * m[0] + 3 * m[2] - 6 * m[1],
        c1 = 3 * m[1] - 3 * m[0],
        c0 = m[0] - target;
    return solveCubic(c3, c2, c1, c0)
      .filter(x => WtMath.isZero(x.im))
      .map(x => x.re)
      .filter(x => WtMath.isEqual(x, 0) || WtMath.isEqual(x, 1) || WtMath.isIn0and1(x));
  }

  /**
   * This ratio is 4 (sqrt(2) - 1) /3, and be used to simulate 1/4 circle arc with Bezier3 curve.
   * e.g. From Point (R, 0) to (0, R), we need to add control points P1 (R, kR) and P2, (kR, R)
   * Then the Bezier Curve from (R, 0) to (0, R) with control points (R, kR) and (kR, R) will perfectly simulate the circle arc.
   */
  static K = 0.5522847498307936;

// Static Methods

  static fitWithTangentLine(
    pStart: IPoint,
    angStart: number,
    pEnd: IPoint,
    angEnd: number,
    p33: IPoint,
    p66: IPoint): Bezier3 | undefined
  {
    const lnStart = new Line(pStart, angStart),
          lnEnd = new Line(pEnd, angEnd);

    const pp33x = (ks: number, ke: number) => {
      return pStart.x * (1 - 1/3) ** 3
        + 3 * (pStart.x + ks * Math.cos(lnStart.ang)) * (1 - 1/3) ** 2 * (1/3)
        + 3 * (pEnd.x   + ke * Math.cos(lnEnd.ang))   * (1 - 1/3) * (1/3) ** 2
        + pEnd.x * (1/3) ** 3;
    }
    const pp33xDks = 3 * Math.cos(lnStart.ang) * (1 - 1/3) ** 2 * (1/3);
    const pp33xDke = 3 * Math.cos(lnEnd.ang)   * (1 - 1/3) * (1/3) ** 2;

    const pp33y = (ks: number, ke: number) => {
      return pStart.y * (1 - 1/3) ** 3
        + 3 * (pStart.y + ks * Math.sin(lnStart.ang)) * (1 - 1/3) ** 2 * (1/3)
        + 3 * (pEnd.y   + ke * Math.sin(lnEnd.ang))   * (1 - 1/3) * (1/3) ** 2
        + pEnd.y * (1/3) ** 3;
    }
    const pp33yDks = 3 * Math.sin(lnStart.ang) * (1 - 1/3) ** 2 * (1/3);
    const pp33yDke = 3 * Math.sin(lnEnd.ang)   * (1 - 1/3) * (1/3) ** 2;

    const pp66x = (ks: number, ke: number) => {
      return pStart.x * (1 - 2/3) ** 3
        + 3 * (pStart.x + ks * Math.cos(lnStart.ang)) * (1 - 2/3) ** 2 * (2/3)
        + 3 * (pEnd.x   + ke * Math.cos(lnEnd.ang))   * (1 - 2/3) * (2/3) ** 2
        + pEnd.x * (2/3) ** 3;
    }
    const pp66xDks = 3 * Math.cos(lnStart.ang) * (1 - 2/3) ** 2 * (2/3);
    const pp66xDke = 3 * Math.cos(lnEnd.ang)   * (1 - 2/3) * (2/3) ** 2;

    const pp66y = (ks: number, ke: number) => {
      return pStart.y * (1 - 2/3) ** 3
        + 3 * (pStart.y + ks * Math.sin(lnStart.ang)) * (1 - 2/3) ** 2 * (2/3)
        + 3 * (pEnd.y   + ke * Math.sin(lnEnd.ang))   * (1 - 2/3) * (2/3) ** 2
        + pEnd.y * (2/3) ** 3;
    }
    const pp66yDks = 3 * Math.sin(lnStart.ang) * (1 - 2/3) ** 2 * (2/3);
    const pp66yDke = 3 * Math.sin(lnEnd.ang)   * (1 - 2/3) * (2/3) ** 2;

    const fxn = (ks: number, ke: number) => {
      return (pp33x(ks, ke) - p33.x) ** 2 + (pp33y(ks, ke) - p33.y) ** 2
          +  (pp66x(ks, ke) - p66.x) ** 2 + (pp66y(ks, ke) - p66.y) ** 2;
    }
    const fxnDks = (ks: number, ke: number) => {
      return 2 * (pp33x(ks, ke) - p33.x) * pp33xDks + 2 * (pp33y(ks, ke) - p33.y) * pp33yDks
           + 2 * (pp66x(ks, ke) - p66.x) * pp66xDks + 2 * (pp66y(ks, ke) - p66.y) * pp66yDks;
    }
    const fxnDke = (ks: number, ke: number) => {
      return 2 * (pp33x(ks, ke) - p33.x) * pp33xDke + 2 * (pp33y(ks, ke) - p33.y) * pp33yDke
           + 2 * (pp66x(ks, ke) - p66.x) * pp66xDke + 2 * (pp66y(ks, ke) - p66.y) * pp66yDke;
    }
    let lenS = Point.getDistance(pStart, p33),
        lenE = Point.getDistance(p66, pEnd),
        ks = lenS,      // The initial value, use Len of Start-to-P33, and P66-to-End accordingly
        ke = lenE,
        iterCount = 0,
        fxnPrev = fxn(ks, ke);
    const alpha = 0.05,
          fitCriteria = 0.02,
          ITER_COUNT_MAX = 300000;
    while (fxnPrev > fitCriteria && iterCount < ITER_COUNT_MAX) {
      let dks = fxnDks(ks, ke),
          dke = fxnDke(ks, ke);
      ks = ks - alpha * dks,
      ke = ke - alpha * dke;
      const fxnVal = fxn(ks, ke);
      if (Math.abs(fxnPrev - fxnVal) < fitCriteria) break;
      fxnPrev = fxnVal;
      iterCount++;
    }
    if (iterCount >= ITER_COUNT_MAX) {
      return undefined;
    }
    if (ks <= 0) ks = 0.001;
    if (ke <= 0) ke = 0.001;
    return new Bezier3(pStart, lnStart.getPointByLen(ks), lnEnd.getPointByLen(ke), pEnd);
  }

  static buildFrom4Points(pStart: IPoint, p1by3: IPoint, p2by3: IPoint, pEnd: IPoint): Bezier3 {
    let xa = 27 * p1by3.x - 8 * pStart.x - pEnd.x,
        xb = 27 * p2by3.x - pStart.x - 8 * pEnd.x,
        ya = 27 * p1by3.y - 8 * pStart.y - pEnd.y,
        yb = 27 * p2by3.y - pStart.y - 8 * pEnd.y,
        xc1 = (2 * xa - xb) / 18,
        xc2 = (2 * xb - xa) / 18,
        yc1 = (2 * ya - yb) / 18,
        yc2 = (2 * yb - ya) / 18,
        pCtrl1 = new Point(xc1, yc1),
        pCtrl2 = new Point(xc2, yc2);
    return new Bezier3(pStart, pCtrl1, pCtrl2, pEnd);
  }

}

