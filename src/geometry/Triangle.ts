
import Point from './Point.js';
import Line from './Line.js';
import LineSeg from './LineSeg.js';
import Circle from './Circle.js';
import { WtMath } from '../math/WtMath.js';
import { AngDeg } from './AngDeg.js';
import type { IGeometryModel, ILineSegments, IPoint, ITriangle } from './IGeometry.js';
import Polygon from './Polygon.js';

export default class Triangle implements ITriangle, IGeometryModel, ILineSegments {
  pA: Point;
  pB: Point;
  pC: Point;

  angA: number;
  angB: number;
  angC: number;

  lAB: number;
  lBC: number;
  lCA: number;

  mAB: Point;
  mBC: Point;
  mCA: Point;

  area: number;
  circum: number;

  rInner: number;
  rOuter: number;
  cirInner?: Circle;
  cirOuter?: Circle;
  pCIn?: IPoint;
  pCOut?: IPoint;
  pGravity?: IPoint;

  isValid: boolean;
  isCW: boolean = true;

  constructor(pA: IPoint, pB: IPoint, pC: IPoint) {
    this.pA = new Point(pA.x, pA.y);
    this.pB = new Point(pB.x, pB.y);
    this.pC = new Point(pC.x, pC.y);

    const lineAB = new LineSeg(pA, pB);
    const lineBC = new LineSeg(pB, pC);
    const lineCA = new LineSeg(pC, pA);
    const lineAC = new LineSeg(pA, pC);
    const angA = lineAC.ang - lineAB.ang;

    if (angA > 0) {
      this.isCW = angA < AngDeg.DEG180;
    } else if (angA < 0) {
      this.isCW = angA < -AngDeg.DEG180;
    }

    this.isValid = !lineAB.isParallelWith(lineBC);

    this.mAB = lineAB.middle;
    this.mBC = lineBC.middle;
    this.mCA = lineCA.middle;

    this.lBC = lineBC.len;
    this.lCA = lineCA.len;
    this.lAB = lineAB.len;

    this.angA = Math.acos((this.lAB ** 2 + this.lCA ** 2 - this.lBC ** 2) / (2 * this.lAB * this.lCA));
    this.angB = Math.acos((this.lBC ** 2 + this.lAB ** 2 - this.lCA ** 2) / (2 * this.lBC * this.lAB));
    this.angC = Math.acos((this.lCA ** 2 + this.lBC ** 2 - this.lAB ** 2) / (2 * this.lCA * this.lBC));
    this.area =
      Math.sqrt(
        2 * this.lAB ** 2 * this.lBC ** 2 +
        2 * this.lBC ** 2 * this.lCA ** 2 +
        2 * this.lCA ** 2 * this.lAB ** 2 -
        this.lAB ** 4 -
        this.lBC ** 4 -
        this.lCA ** 4) / 4;

    this.circum = this.lBC + this.lCA + this.lAB;

    if (this.isValid) {
      this.rInner = (this.lAB * Math.tan(this.angA / 2) * Math.tan(this.angB / 2))
                  / (Math.tan(this.angA / 2) + Math.tan(this.angB / 2));

      const lineAC = new LineSeg(pA, pC);
      const lineBA = new LineSeg(pB, pA);
      this.pCIn = Line.getXPoint(
        Line.fromPointAng(this.pA, (lineAB.ang + lineAC.ang)/2),
        Line.fromPointAng(this.pB, (lineBA.ang + lineBC.ang)/2)
      );

      this.cirInner = Circle.byCenterAndRadius(this.pCIn!, this.rInner);

      this.rOuter = (this.lAB * this.lBC * this.lCA) / 4 / this.area;

      this.pCOut = Line.getXPoint(
        lineAB.getMiddleNormalLine(),
        lineBC.getMiddleNormalLine());

      this.cirOuter = Circle.byCenterAndRadius(this.pCOut!, this.rOuter);

      this.pGravity = Line.getXPoint(
        new LineSeg(pA, lineBC.middle).toLine(),
        new LineSeg(pB, lineCA.middle).toLine()
      );

    } else {
      this.rInner = 0;
      this.rOuter = Number.POSITIVE_INFINITY;
    }

  }

  getPoint(pos: string | number, t?: number) {
    if (!this.isValid) return undefined;
    if (typeof pos === "string") {
      pos = pos.toLowerCase();
      if (pos === "cin") return this.pCIn;
      if (pos === "cout") return this.pCOut;
      if (pos === "cg" || pos === "cgravity") return this.pGravity;
      if (pos === "a") return this.pA;
      if (pos === "b") return this.pB;
      if (pos === "c") return this.pC;
      return undefined;
    }
    const ls = pos === 1
      ? new LineSeg(this.pA, this.pB)
      : pos === 2
      ? new LineSeg(this.pB, this.pC)
      : pos === 3
      ? new LineSeg(this.pC, this.pA)
      : undefined;
    if (!ls) return undefined;
    if (!t) return ls.pStart;
    if (WtMath.isIn0and1(t)) return ls.getPoint(t);
    return undefined;
  }

  toPolygon(cw?: "cw" | "ccw"): Polygon | undefined {
    if (!this.isValid) return undefined;
    if (!cw) return new Polygon(this.pA, this.pB, this.pC);
    if (cw === "cw") {
      return this.isCW ? new Polygon(this.pA, this.pB, this.pC) : new Polygon(this.pA, this.pC, this.pB);
    } else {
      return this.isCW ? new Polygon(this.pA, this.pC, this.pB) : new Polygon(this.pA, this.pB, this.pC);
    }
  }

  toLineSegs() {
    if (!this.isValid) return [];
    return [
      new LineSeg(this.pA, this.pB),
      new LineSeg(this.pB, this.pC),
      new LineSeg(this.pC, this.pA),
    ];
  }

  getParam(name: string): number | undefined {
    if (!name ||!this.isValid) return undefined;
    name = name.toLowerCase();
    if (name === "rin") return this.rInner;
    if (name === "rout") return this.rOuter;
    return undefined;
  }

  moveBy(dx: number, dy: number): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new Triangle(
      Point.moveBy(this.pA, dx, dy),
      Point.moveBy(this.pB, dx, dy),
      Point.moveBy(this.pC, dx, dy)
    );
  }

  rotateBy(rotDeg: number, at?: IPoint | undefined): IGeometryModel | undefined {
    if (!this.isValid) return undefined;
    return new Triangle(
      Point.rotateBy(this.pA, rotDeg, at),
      Point.rotateBy(this.pB, rotDeg, at),
      Point.rotateBy(this.pC, rotDeg, at)
    );
  }

  duplicateTo(distance: number, dir: "in" | "out"): Triangle | undefined {
    if (!this.isValid) return undefined;
    distance = Math.abs(distance);
    if (distance >= this.rInner && dir === "in") return undefined;
    let plg = this.toPolygon("cw")!.duplicateTo(distance, dir === "in" ? "right" : "left");
    if (!plg) return undefined;
    return new Triangle(plg.points[0], plg.points[1], plg.points[2]);
  }

}
