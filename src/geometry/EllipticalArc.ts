/**
 * The class implementation of SVG Elliptical Path.
 * Mostly this will be some "Segment" of another path.
 */

import Point from "./Point.js";
import Ellipse from "./Ellipse.js";
import LineSeg from "./LineSeg.js";
import Circle from "./Circle.js";

import type {
  ICurveFuncsByT,
  IEllipticalArc,
  IGeometryModel,
  ILine,
  IPoint,
  ISegmentModel
} from "./IGeometry.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { AngDeg } from "./AngDeg.js";
import { WtMath } from "../math/WtMath.js";
import Line from "./Line.js";

export class EllipticalArc implements IEllipticalArc, IGeometryModel, ISegmentModel {
  public pStart: IPoint = new Point(0, 0);
  public pEnd: IPoint = new Point(0, 0);
  public cx: number = 0;
  public cy: number = 0;
  public rx: number = 0;
  public ry: number = 0;
  public rotDeg: number = 0;
  public rot: number = 0;
  public largeArc: boolean = false;
  public cw: boolean = true;
  public angStart: number = 0;
  public angEnd: number = 0;
  public angRange: number = 0;

  public isValid: boolean = false;
  public isEnlarged: boolean = false;
  public auxEllipse?: Ellipse;

  public xMin: number = 0;
  public xMax: number = 0;
  public yMin: number = 0;
  public yMax: number = 0;

  constructor() {
  }

  calcAngRange() {
    return AngDeg.fitAng(this.cw ? (this.angEnd - this.angStart) : (this.angStart - this.angEnd));
  }

  angDeviFromStart(ang: number): number {
    if (WtMath.isEqualOnTol(ang, this.angStart, WtMath.TOL_FOR_ANG)) return 0;
    if (WtMath.isEqualOnTol(ang, this.angEnd, WtMath.TOL_FOR_ANG)) return this.angRange;
    return AngDeg.fitAng(this.cw ? (ang - this.angStart) : (this.angStart - ang));
  }

  calcAngFromStart(deltaAng: number): number {
    return this.cw ? AngDeg.fitAng(this.angStart + deltaAng) : AngDeg.fitAng(this.angStart - deltaAng);
  }

  isAngInRange(ang: number): boolean {
    return WtMath.isEqualOnTol(ang, this.angStart, WtMath.TOL_FOR_ANG) ||
           WtMath.isEqualOnTol(ang, this.angEnd, WtMath.TOL_FOR_ANG) ||
           this.angDeviFromStart(ang) <= this.angRange;
  }

  calcBoundary() {
    if (!this.auxEllipse) return;
    const boundPoints = [
      this.auxEllipse.thetaE,
      this.auxEllipse.thetaN,
      this.auxEllipse.thetaW,
      this.auxEllipse.thetaS
    ]
      .filter(a => this.isAngInRange(a))
      .map(a => this.auxEllipse!.getPointAng(a))
      .concat(this.pStart, this.pEnd);
    const xs = boundPoints.map(p => p.x);
    const ys = boundPoints.map(p => p.y);
    this.xMin = Math.min(...xs);
    this.xMax = Math.max(...xs);
    this.yMin = Math.min(...ys);
    this.yMax = Math.max(...ys);
  }

  private calcPoint(t: number): IPoint | undefined {
    if (!this.isValid) return undefined;
    if (!this.auxEllipse) return undefined;
    t = WtMath.fitTin0and1(t);
    return this.auxEllipse.getPointAng(this.calcAngFromStart(t * this.angRange));
  }

  getPoint(pos: string | number): IPoint | undefined {
    if (!this.isValid) return undefined;
    if (!this.auxEllipse) return undefined;
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "c" || pos === "center") return this.auxEllipse.center;
      if (pos === "m" || pos === "mid" || pos === "middle") return this.calcPoint(0.5);
      if (pos === "s" || pos === "start") return this.pStart;
      if (pos === "e" || pos === "end") return this.pEnd;
      return undefined;
    }
    // It pos is a number, then it should be the t in [0, 1]
    if (WtMath.isIn0and1(pos)) return this.calcPoint(pos);
    return undefined;
  }

  getParam(name: string): number | undefined {
    if (!name || !this.isValid) return undefined;
    name = name.toLowerCase();
    if (name === "angs") return this.angStart;
    if (name === "ange") return this.angEnd;
    if (name === "angrange") return this.angRange;
    if (name === "degs") return AngDeg.ang2Deg(this.angStart);
    if (name === "dege") return AngDeg.ang2Deg(this.angEnd);
    if (name === "degr") return AngDeg.ang2Deg(this.angRange);
    if (name === "rx") return this.auxEllipse?.rx;
    if (name === "ry") return this.auxEllipse?.ry;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return EllipticalArc.fromStartEndPoints(
      Point.moveBy(this.pStart, dx, dy),
      Point.moveBy(this.pEnd, dx, dy),
      this.rx, this.ry,
      this.largeArc,
      this.cw,
      this.rotDeg
    );
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return EllipticalArc.fromStartEndPoints(
      Point.rotateBy(this.pStart, rotDeg, at),
      Point.rotateBy(this.pEnd, rotDeg, at),
      this.rx, this.ry,
      this.largeArc,
      this.cw,
      this.rotDeg + rotDeg
    );
  }

  getCurveFuncs(): ICurveFuncsByT {
    let angD = this.cw ? this.angRange : -this.angRange;
    return {
      px: t => {
        let theta = this.angStart + t * angD;
        return this.cx + this.rx * Math.cos(theta) * Math.cos(this.rot) - this.ry * Math.sin(theta) * Math.sin(this.rot);
      },
      py: t => {
        let theta = this.angStart + t * angD;
        return this.cy + this.rx * Math.cos(theta) * Math.sin(this.rot) + this.ry * Math.sin(theta) * Math.cos(this.rot);
      },
      dpx: t => {
        let theta = this.angStart + t * angD;
        return - this.rx * Math.sin(theta) * Math.cos(this.rot) * angD - this.ry * Math.cos(theta) * Math.sin(this.rot) * angD;
      },
      dpy: t => {
        let theta = this.angStart + t * angD;
        return - this.rx * Math.sin(theta) * Math.sin(this.rot) * angD + this.ry * Math.cos(theta) * Math.cos(this.rot) * angD;
      }
    }
  }

  getTofPoint(p: IPoint): number | undefined {
    if (!this.auxEllipse) return undefined;
    const ls = new LineSeg(this.auxEllipse.center, p);
    if (WtMath.isZero(ls.len)) return undefined;
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    if (!WtMath.isEqualOnTol(ls.len, Ellipse.getDistanceToCenter(this.rx, this.ry, theta), 1e-3)) return undefined;
    if (!this.isAngInRange(theta)) return undefined;
    return this.angDeviFromStart(theta) / this.angRange;
  }

  makeSubSeg(pStart: IPoint, pEnd: IPoint): EllipticalArc | undefined {
    if (!this.auxEllipse) return undefined;
    const tStart = this.getTofPoint(pStart),
          tEnd = this.getTofPoint(pEnd);
    if (tStart === undefined || tEnd === undefined) return undefined;
    const arc = EllipticalArc.fromEllipse(
      this.auxEllipse,
      AngDeg.ang2Deg(this.calcAngFromStart(tStart * this.angRange)),
      AngDeg.ang2Deg(this.calcAngFromStart(tEnd * this.angRange)),
      (tEnd >= tStart) ? this.cw : !this.cw);
    // Re-assign to make sure the start/end points exactly the same as inputs
    arc.pStart.x = pStart.x;
    arc.pStart.y = pStart.y;
    arc.pEnd.x = pEnd.x;
    arc.pEnd.y = pEnd.y;
    return arc;
  }

  getTangentLineOfPoint(p: IPoint): ILine | undefined {
    if (!this.auxEllipse) return undefined;
    const ls = new LineSeg(this.auxEllipse.center, p);
    if (WtMath.isZero(ls.len)) return undefined;
    const theta = Ellipse.getThetaByVectorAngle(this.rx, this.ry, ls.ang - this.rot);
    const tLine = this.auxEllipse.getTangentLine(theta);
    if (!this.cw) tLine.ang = AngDeg.fitAng(tLine.ang + AngDeg.DEG180);
    return tLine;
  }

  getNormalPoint(t: number, dist: number, dir: "right" | "left"): Point | undefined {
    const pT = this.calcPoint(t),
          theta = this.calcAngFromStart(t * this.angRange),
          ln = this.auxEllipse?.getTangentLine(theta);
    if (!pT || !ln) return undefined;
    if (!this.cw) ln.ang = AngDeg.fitAng(ln.ang + AngDeg.DEG180);
    const ang = dir === "right" ? ln.ang + AngDeg.DEG90 : ln.ang - AngDeg.DEG90;
    return new Line(pT, ang).getPointByLen(dist);
  }

  // Static methods

  static fromStartEndPoints(pStart: IPoint, pEnd: IPoint, rx: number, ry: number, largeArc: boolean, cw: boolean, rotDeg?: number): EllipticalArc {
    const arc = new EllipticalArc();
    arc.pStart.x = pStart.x;
    arc.pStart.y = pStart.y;
    arc.pEnd.x = pEnd.x;
    arc.pEnd.y = pEnd.y;
    if (WtMath.isZero(rx) || WtMath.isZero(ry)) {
      arc.isValid = false;
      return arc;
    } else if (WtMath.isEqual(rx, ry)) {
      arc.rx = rx;
      arc.ry = rx;
      arc.rotDeg = 0;
    } else {
      arc.rx = rx;
      arc.ry = ry;
      arc.rotDeg = rotDeg ?? 0;
      arc.rot = AngDeg.fitDeg(arc.rotDeg);
    }
    arc.largeArc = largeArc;
    arc.cw = cw;
    const ellResolved = Ellipse.calcEllipseByTwoPoints(pStart, pEnd, rx, ry, cw, largeArc, rotDeg);
    if (ellResolved) {
      arc.isValid = true;
      arc.cx = ellResolved.cx;
      arc.cy = ellResolved.cy;
      arc.rx = ellResolved.rx;
      arc.ry = ellResolved.ry;
      arc.angStart = ellResolved.angStart;
      arc.angEnd = ellResolved.angEnd;
      arc.angRange = arc.calcAngRange();
      arc.isEnlarged = ellResolved.rx > rx && !WtMath.isEqualOnTol(ellResolved.rx, rx, 1e-5);
      arc.rot = ellResolved.rot;
      arc.auxEllipse = new Ellipse(
        ellResolved.cx,
        ellResolved.cy,
        ellResolved.rx,
        ellResolved.ry,
        ellResolved.rot);

      // Calculate X/Y min/max
      arc.calcBoundary();
    } else {
      arc.isValid = false;
    }

    return arc;
  }

  static fromCircleParams(cx: number, cy: number, r: number, startDeg: number, endDeg: number, cw: boolean): EllipticalArc {
    const arc = new EllipticalArc();
    if (r <= 0) {
      arc.isValid = false;
      return arc;
    }

    const ell = new Ellipse(cx, cy, r, r, 0);
    arc.isValid = true;
    arc.cw = cw;
    arc.cx = cx;
    arc.cy = cy;
    arc.rx = r;
    arc.ry = r;
    arc.rotDeg = 0;
    arc.rot = 0;
    arc.auxEllipse = ell;
    arc.angStart = AngDeg.fitDeg(startDeg);
    arc.angEnd = AngDeg.fitDeg(endDeg);
    arc.angRange = arc.calcAngRange();
    arc.pStart = ell.getPointAng(arc.angStart);
    arc.pEnd = ell.getPointAng(arc.angEnd);
    arc.largeArc = arc.angRange > AngDeg.DEG180;
    arc.isEnlarged = false;

    // Calculate X/Y min/max
    arc.calcBoundary();
    return arc;
  }

  static fromCircle(circ: Circle, startDeg: number, endDeg: number, cw: boolean): EllipticalArc {
    return EllipticalArc.fromCircleParams(circ.cx, circ.cy, circ.r, startDeg, endDeg, cw);
  }

  static fromEllipseParams(cx: number, cy: number, rx: number, ry: number, rotDeg: number, startDeg: number, endDeg: number, cw: boolean): EllipticalArc {
    const arc = new EllipticalArc();

    if (WtMath.isZero(rx) || WtMath.isZero(ry)) {
      arc.isValid = false;
      return arc;
    }
    if (WtMath.isEqual(rx, ry)) {
      arc.rx = rx;
      arc.ry = rx;
      arc.rotDeg = 0;
    } else {
      arc.rx = rx;
      arc.ry = ry;
      arc.rotDeg = rotDeg;
      arc.rot = AngDeg.fitDeg(arc.rotDeg);
    }

    const ell = new Ellipse(cx, cy, rx, ry, arc.rot);
    arc.isValid = true;
    arc.cw = cw;
    arc.cx = cx;
    arc.cy = cy;
    arc.rx = rx;
    arc.ry = ry;
    arc.auxEllipse = ell;
    arc.angStart = AngDeg.fitDeg(startDeg);
    arc.angEnd = AngDeg.fitDeg(endDeg);
    arc.angRange = arc.calcAngRange();
    arc.pStart = ell.getPointAng(arc.angStart);
    arc.pEnd = ell.getPointAng(arc.angEnd);
    arc.largeArc = arc.angRange > AngDeg.DEG180;
    arc.isEnlarged = false;

    // Calculate X/Y min/max
    arc.calcBoundary();
    return arc;
  }

  static fromEllipse(ell: Ellipse, startDeg: number, endDeg: number, cw: boolean): EllipticalArc {
    const arc = new EllipticalArc();

    arc.isValid = true;
    arc.rx = ell.rx;
    arc.ry = ell.ry;
    arc.rotDeg = AngDeg.ang2Deg(ell.rot);
    arc.rot = ell.rot;
    arc.cw = cw;
    arc.cx = ell.cx;
    arc.cy = ell.cy;
    arc.rx = ell.rx;
    arc.ry = ell.ry;
    arc.auxEllipse = ell;
    arc.angStart = AngDeg.fitDeg(startDeg);
    arc.angEnd = AngDeg.fitDeg(endDeg);
    arc.angRange = arc.calcAngRange();
    arc.pStart = ell.getPointAng(arc.angStart);
    arc.pEnd = ell.getPointAng(arc.angEnd);
    arc.largeArc = arc.angRange > AngDeg.DEG180;
    arc.isEnlarged = false;

    // Calculate X/Y min/max
    arc.calcBoundary();
    return arc;
  }

}
