import { solveQuartic } from "./solve-equation.js";
import { Matrix2by2 } from "./Matrix.js";

export interface INewtonMethodResult {
  succeeded: boolean;
  iterCount: number;
  value?: number | number[];
}

export interface ISinCosPair {
  sin: number;
  cos: number;
}

export class WtMath {
  static EPSILON = 2.220446049250313e-13;                 // This is 1000 x Number.EPSILON (2.220446049250313e-16)
  static CURVE_T_DELTA = 2.220446049250313e-12;           // Used when calculating the tangent line of a curve, i.e. slope = (C(t + dt) - C(t)) / dt
  static TOL_FOR_ANG = 1e-5;

  static isEqual = (a: number, b: number): boolean => {
    return Math.abs(a - b) < WtMath.EPSILON;
  }

  static isEqualOnTol = (a: number, b: number, tol: number): boolean => {
    return Math.abs(a - b) < tol;
  }

  static isEqualOnEpsilon = (a: number, b: number, scale?: number): boolean => {
    return Math.abs(a - b) < WtMath.EPSILON * (scale ?? 1);
  }

  static isZero = (x: number): boolean => {
    return Math.abs(x) < WtMath.EPSILON;
  }

  static fitTin0and1 = (t: number): number => {
    return t > 1 ? 1 : t < 0 ? 0 : t;
  }

  static isIn0and1 = (t: number): boolean => {
    return t >= 0 && t <= 1;
  }

  static makeInRange = (x: number, min: number, max: number) => {
    let vMin = Math.min(min, max),
        vMax = Math.max(min, max);
    return x > vMax ? vMax : x < vMin ? vMin : x;
  }

  static combo = (k: number, n: number): number => {
    if (!Number.isInteger(k) || !Number.isInteger(n)) return 0;
    if (n <= 0) return 0;
    if (k < 0 || k > n) return 0;
    if (k === 0) return 1;
    let numerator = 1;
    let denominator = 1;
    for (let i = 0; i < k; i++) {
      numerator *= n - i;
      denominator *= (i + 1);
    }
    return numerator / denominator;
  }

  static bernsteinPolynomial = (i: number, n: number, t: number) => {
    return WtMath.combo(i, n) * Math.pow(t, i) * Math.pow(1 - t, n - i);
  }

  static expandRadius(n: number, radius?: number | number[]): number[] {
    n = Math.floor(Math.abs(n));
    if (typeof radius === "number") {
      let r = Math.abs(radius);
      return [...Array(n).keys()].map(i => r);
    }
    else if (Array.isArray(radius)) {
      let rs = radius.map(r => Math.abs(r));
      return [...Array(n).keys()].map(i => i >= rs.length ? rs[rs.length - 1] : rs[i]);
    }
    else {
      return [...Array(n).keys()].map(i => 0);
    }
  }

  static newtonMethodSolveXY(
    f1: (x: number, y: number) => number,
    f1dx: (x: number, y: number) => number,
    f1dy: (x: number, y: number) => number,
    f2: (x: number, y: number) => number,
    f2dx: (x: number, y: number) => number,
    f2dy: (x: number, y: number) => number,
    x0: number,
    y0: number,
    iterMax?: number): INewtonMethodResult {
      let done = false;
      iterMax = iterMax ?? 300000;
      const res: INewtonMethodResult = {
        succeeded: false,
        iterCount: 0
      };
      while (!done) {
        const jacob0 = new Matrix2by2(
          f1dx(x0, y0),
          f1dy(x0, y0),
          f2dx(x0, y0),
          f2dy(x0, y0),
          );
        const invJacob0 = jacob0.inv();
        if (!invJacob0) {
          // If There is no inverse matrix of the Jacobian, then it will fail
          done = true;
        } else {
          const x1 = x0 - invJacob0.a11 * f1(x0, y0) - invJacob0.a12 * f2(x0, y0);
          const y1 = y0 - invJacob0.a21 * f1(x0, y0) - invJacob0.a22 * f2(x0, y0);
          // console.log(`${res.iterCount + 1}: X: ${x1.toFixed(6)}, Y: ${y1.toFixed(6)}`);
          if (Math.abs(x1 - x0) < WtMath.EPSILON && Math.abs(y1 - y0) < WtMath.EPSILON) {
            res.succeeded = true;
            res.value = [x1, y1];
            done = true;
          } else if (res.iterCount >= iterMax) {
            done = true;
          } else {
            x0 = x1;
            y0 = y1;
            res.iterCount += 1;
          }
        }
      }
      return res;
    }


  static newtonMethodSolve2DUsingMinSquare(
    f1: (x: number, y: number) => number,
    f1dx: (x: number, y: number) => number,
    f1dy: (x: number, y: number) => number,
    f2: (x: number, y: number) => number,
    f2dx: (x: number, y: number) => number,
    f2dy: (x: number, y: number) => number,
    x0: number,
    y0: number,
    iterMax?: number): INewtonMethodResult {
      const squareSum = (a: number, b: number): number => {
        return a ** 2 / 2 + b ** 2 / 2;
      }

      const alpha = 0.02,
            lambda = 0.01;
      iterMax = iterMax ?? 30000000;
      let xt = x0,
          yt = y0;
      let iterCount = 0;
      let f1t = f1(xt, yt),
          f2t = f2(xt, yt),
          f = squareSum(f1t, f2t);
      // let x1, y1;
      let vtx = 0,
          vty = 0;
      while (f > WtMath.EPSILON && iterCount < iterMax) {
        let f1dxt = f1dx(xt, yt),
            f1dyt = f1dy(xt, yt),
            f2dxt = f2dx(xt, yt),
            f2dyt = f2dy(xt, yt);
        let nablaFx = f1t * f1dxt + f2t * f2dxt,
            nablaFy = f1t * f1dyt + f2t * f2dyt;
        vtx = lambda * vtx - alpha * nablaFx;
        vty = lambda * vty - alpha * nablaFy;
        xt = xt + vtx;
        yt = yt + vty;
        f1t = f1(xt, yt);
        f2t = f2(xt, yt);
        f = squareSum(f1t, f2t);
        iterCount++;
        // console.log(`Count: ${iterCount}, X: ${xt}, Y: ${yt}, VX: ${vtx}, VY: ${vty}, F: ${f}`);
      }

      // let x1 = x0 - f1(x0, y0) / f1dx(x0, y0) - f2(x0, y0) / f2dx(x0, y0);
      // let y1 = y0 - f1(x0, y0) / f1dy(x0, y0) - f2(x0, y0) / f2dy(x0, y0);
      // let err = (x1 - x0) ** 2 + (y1 - y0) ** 2;
      // while(err > WtMath.EPSILON && iterCount < iterMax) {
      //   x0 = x1;
      //   y0 = y1;
      //   x1 = x0 - f1(x0, y0) / f1dx(x0, y0) - f2(x0, y0) / f2dx(x0, y0);
      //   y1 = y0 - f1(x0, y0) / f1dy(x0, y0) - f2(x0, y0) / f2dy(x0, y0);
      //   err = (x1 - x0) ** 2 + (y1 - y0) ** 2;
      //   iterCount++;
      //   console.log(`Count: ${iterCount}, x0: ${x0.toFixed(5)}, x1: ${x1.toFixed(5)}, y0: ${y0.toFixed(5)}, y1: ${y1.toFixed(5)}`);
      // }
      if (iterCount >= iterMax) return {
        succeeded: false,
        iterCount: iterCount,
      };
      else return {
        succeeded: true,
        iterCount: iterCount,
        value: [xt, yt]
      };
    }

  static newtonMethodSolve2DUsingAbs(
    f1: (x: number, y: number) => number,
    f1dx: (x: number, y: number) => number,
    f1dy: (x: number, y: number) => number,
    f2: (x: number, y: number) => number,
    f2dx: (x: number, y: number) => number,
    f2dy: (x: number, y: number) => number,
    x0: number,
    y0: number,
    iterMax?: number): INewtonMethodResult {
      const alpha = 0.0002,
            lambda = 0.001;
      iterMax = iterMax ?? 30000000;
      let xt = x0,
          yt = y0;
      let iterCount = 0;
      let f1t = f1(xt, yt),
          f2t = f2(xt, yt),
          f = Math.abs(f1t) + Math.abs(f2t);// f1t ** 2 + f2t ** 2;
      // let x1, y1;
      let vtx = 0,
          vty = 0;
      const absDerivative = (fVal: number, diffVal:number) => {
        if (fVal > 0) return diffVal;
        else if (fVal < 0) return -diffVal;
        else return 0;
      }

      while (f > WtMath.EPSILON && iterCount < iterMax) {
        let f1dxt = f1dx(xt, yt),
            f1dyt = f1dy(xt, yt),
            f2dxt = f2dx(xt, yt),
            f2dyt = f2dy(xt, yt);
        let nablaFx = absDerivative(f1t, f1dxt) + absDerivative(f2t, f2dxt), // 2 * f1t * f1dxt + 2 * f2t * f2dxt,
            nablaFy = absDerivative(f1t, f1dyt) + absDerivative(f2t, f2dyt); // 2 * f1t * f1dyt + 2 * f2t * f2dyt;
        vtx = lambda * vtx - alpha * nablaFx;
        vty = lambda * vty - alpha * nablaFy;
        xt = xt + vtx;
        yt = yt + vty;
        f1t = f1(xt, yt);
        f2t = f2(xt, yt);
        f = Math.abs(f1t) + Math.abs(f2t);
        iterCount++;
        // console.log(`Count: ${iterCount}, X: ${xt}, Y: ${yt}, VX: ${vtx}, VY: ${vty}, F: ${f}`);
      }

      // let x1 = x0 - f1(x0, y0) / f1dx(x0, y0) - f2(x0, y0) / f2dx(x0, y0);
      // let y1 = y0 - f1(x0, y0) / f1dy(x0, y0) - f2(x0, y0) / f2dy(x0, y0);
      // let err = (x1 - x0) ** 2 + (y1 - y0) ** 2;
      // while(err > WtMath.EPSILON && iterCount < iterMax) {
      //   x0 = x1;
      //   y0 = y1;
      //   x1 = x0 - f1(x0, y0) / f1dx(x0, y0) - f2(x0, y0) / f2dx(x0, y0);
      //   y1 = y0 - f1(x0, y0) / f1dy(x0, y0) - f2(x0, y0) / f2dy(x0, y0);
      //   err = (x1 - x0) ** 2 + (y1 - y0) ** 2;
      //   iterCount++;
      //   console.log(`Count: ${iterCount}, x0: ${x0.toFixed(5)}, x1: ${x1.toFixed(5)}, y0: ${y0.toFixed(5)}, y1: ${y1.toFixed(5)}`);
      // }
      if (iterCount >= iterMax) return {
        succeeded: false,
        iterCount: iterCount,
      };
      else return {
        succeeded: true,
        iterCount: iterCount,
        value: [xt, yt]
      };
    }

  static solveQuarticToSinCos(a: number, b: number, c: number, d: number, e: number): ISinCosPair[] {
    const zs = solveQuartic(a, b, c, d, e)
      .filter(z => WtMath.isZero(z.im))
      .map(z => ({
        sin:        2 * z.re / (1 + z.re ** 2),
        cos: (1 - z.re ** 2) / (1 + z.re ** 2)
      }));
    const ts = solveQuartic(e, d, c, b, a)
      .filter(t => WtMath.isZero(t.im))
      .map(t => ({
        sin:        2 * t.re / (t.re ** 2 + 1),
        cos: (t.re ** 2 - 1) / (t.re ** 2 + 1)
      }));
    return [...zs, ...ts]
      .reduce<ISinCosPair[]>((final, p) => {
        if (!final.find(x => WtMath.isEqualOnEpsilon(x.sin, p.sin, 100) && WtMath.isEqualOnEpsilon(x.cos, p.cos, 100))) {
          final.push(p);
        }
        return final;
      }, []);
  }

}

