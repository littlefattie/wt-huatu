
import Point from "./Point.js";
import LineSeg from "./LineSeg.js";
import Circle from "./Circle.js";
import { WtMath } from "../math/WtMath.js";
import Triangle from "./Triangle.js";
import { AngDeg } from "./AngDeg.js";

import type { IPoint, IAngle, IAngleArcPoints } from "./IGeometry.js";

/**
 * This function is to define a model of Angle AOB, it is actually a triangle, but a little different,
 * because it mainly focus on the center angle, not the virtually formed triangle.
 * And with this Angle Model, the Angle will less than 180 deg.
 */
export default class Angle implements IAngle {
  pA: Point;
  pO: Point;
  pB: Point;

  lineOA: LineSeg;
  lineOB: LineSeg;

  ang: number;
  rMax: number;
  cw: boolean;

  constructor(pA: IPoint, pO: IPoint, pB: IPoint) {
    this.pA = new Point(pA.x, pA.y);
    this.pO = new Point(pO.x, pO.y);
    this.pB = new Point(pB.x, pB.y);

    this.lineOA = new LineSeg(pO, pA);
    this.lineOB = new LineSeg(pO, pB);

    let angDiff = this.lineOA.ang - this.lineOB.ang;
    this.cw = (angDiff < 0 && angDiff > -AngDeg.DEG180) || (angDiff > 0 && angDiff > AngDeg.DEG180);
    if (angDiff < AngDeg.DEG0) angDiff += AngDeg.DEG360;
    if (angDiff > AngDeg.DEG180) angDiff = AngDeg.DEG360 - angDiff;
    this.ang = angDiff;

    if (WtMath.isEqual(this.ang, AngDeg.DEG0) || 
        WtMath.isEqualOnTol(this.ang, AngDeg.DEG360, 1e-5) || 
        WtMath.isEqual(this.ang, AngDeg.DEG180)) {
      this.rMax = 0;
    } else {
      const tTriangle = new Triangle(pA, pO, pB);
      const lShort = Math.min(this.lineOA.len, this.lineOB.len);
      const lRin = tTriangle.rInner / Math.abs(Math.tan(this.ang / 2));
      // This 0.9999 is to make it "a little" smaller to avoid equity of arc p-end to pA/PB
      this.rMax = lShort / lRin * tTriangle.rInner * (0.9999);
    }
  }

  public getArcPoints(radius: number): IAngleArcPoints {
    const r = radius <= 0
      ? 0
      : radius > this.rMax
      ? this.rMax
      : radius;
    if (this.rMax === 0 || r === 0)  return {
      hasArc: false,
      r: r,
      pStart: this.pO,
      pArcStart: this.pO,
      pArcEnd: this.pO,
      pEnd: this.pO,
      cw: !this.cw
    }
    const len = r / Math.tan(this.ang / 2),
          lenMax = this.rMax / Math.tan(this.ang / 2),
          lenR = r / Math.sin(this.ang / 2),
          angR = AngDeg.fitAng(this.lineOA.ang + (this.cw ? 1 : -1) * this.ang / 2);
    return {
      hasArc: true,
      r: r,
      pStart: this.pO.moveByLenAndAng(lenMax, this.lineOA.ang),
      pArcStart: this.pO.moveByLenAndAng(len, this.lineOA.ang),
      pArcEnd: this.pO.moveByLenAndAng(len, this.lineOB.ang),
      pEnd: this.pO.moveByLenAndAng(lenMax, this.lineOB.ang),
      cw: !this.cw,
      arcCenter: this.pO.moveByLenAndAng(lenR, angR)
    };
  }

  public toTriangle(): Triangle {
    return new Triangle(this.pA, this.pO, this.pB);
  }

}
