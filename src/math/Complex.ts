import { AngDeg } from "../geometry/AngDeg.js";
import { WtMath } from "./WtMath.js";

export interface IComplex {
  re: number;
  im: number;
  len: number;
  ang: number;
  deg: number;
}

export class Complex implements IComplex {
  re: number = 0;
  im: number = 0;
  len: number = 0;
  ang: number = 0;
  deg: number = 0;

  constructor(re: number,im: number) {
    this.re = re;
    this.im = im;
    this.len = Math.sqrt(this.re ** 2 + this.im ** 2);
    this.ang = this.isZero() ? 0 : Complex.getAng(this.re, this.im);
    this.deg = AngDeg.ang2Deg(this.ang);
  }

  isZero() {
    return this.len < WtMath.EPSILON;
  }

  conjugate() {
    return new Complex(this.re, -this.im);
  }

  reciprocal() {
    return new Complex(this.re / (this.len ** 2), -this.im / (this.len ** 2));
  }

  rootN(n: number): IComplex[] {
    if (n <= 0) return [];
    if (!Number.isInteger(n)) return [];
    if (this.isZero()) return [Complex.ZERO];
    const a = Math.pow(this.len, 1 / n);
    const root: Complex[] = [];
    for (let i = 0; i < n; i++) {
      root.push(Complex.fromAmpAngle(a, this.ang / n + i * (AngDeg.DEG360 / n)))
    }
    return root;
  }

  equals(z: IComplex) {
    return Complex.isEqual(this, z);
  }

  static fromAmpAngle(amp: number, ang: number) {
    return new Complex(amp * Math.cos(ang), amp * Math.sin(ang));
  }

  static getAng(x: number, y: number): number {
    if (x === 0 && y === 0) return 0;
    if (x === 0) return y > 0 ? AngDeg.DEG90 : AngDeg.DEG270;
    const ang = Math.atan(y / x);
    if (x < 0) return AngDeg.DEG180 + ang;
    return y >= 0 ? ang : AngDeg.DEG360 + ang;
  }

  static isEqual(z1: IComplex, z2: IComplex) {
    return (WtMath.isEqual(z1.re, z2.re) && WtMath.isEqual(z1.im, z2.im));
  }

  static ZERO: IComplex = {
    re: 0,
    im: 0,
    len: 0,
    ang: 0,
    deg: 0
  };

  static ONE: IComplex = {
    re: 1,
    im: 0,
    len: 1,
    ang: 0,
    deg: 0,
  }

}