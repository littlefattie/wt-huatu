export interface IComplex {
  re: number;
  im: number;
}

/**
 * To test is a real number is "nearly" equals to ZERO, due to the calculation precision of Javascript,
 * there might be some result which should be zero, but was presented as a non-zero value. The epsilon I
 * set here is 1e-15, but it could be adjustable, please modify it and adapt to your own requirements if
 * it is not proper.
 * @param x The number being tested
 * @returns If "very close to zero" or not
 */
export const isZeroReal = (x: number) => {
  return Math.abs(x) < 1e-15;
}

/**
 * Because the Math.pow() function will return NaN if the input is negative, so I made some wrapper to
 * calculate the third square root of number x, judge the sign before doing the pow().
 * @param x The number being made sqrt3 with
 * @returns third square root
 */
export const sqrt3 = (x: number) => {
   return x >= 0 ? Math.pow(x, 1/3) : -Math.pow(-x, 1/3);
}

// A compact class of COMPLEX
export class CPX {
  
  static ZERO: IComplex = {
    re: 0,
    im: 0
  };
  
  static isZero(c: IComplex): boolean {
    return isZeroReal(c.re) && isZeroReal(c.im);
  }
  
  static getLen(c: IComplex): number {
    return Math.sqrt(c.re ** 2 + c.im ** 2);
  }
  
  static getAng(c: IComplex): number {
    if (c.re === 0) {
      return c.im > 0
        ? Math.PI / 2
        : c.im < 0
        ? Math.PI * 3 / 2
        : 0;
    } else {
      const arcTan = Math.atan(c.im / c.re);
      if (c.re < 0) return arcTan + Math.PI;
      else if (c.im >= 0) return arcTan;
      else return arcTan + Math.PI * 2;
    }
  }
  
  static fromLenAndAng(len: number, ang: number): IComplex
  {
    return {
      re: len * Math.cos(ang),
      im: len * Math.sin(ang)
    };
  }
  
  static sqrt2(c: IComplex): IComplex[] {
    if (CPX.isZero(c)) {
      return [CPX.ZERO];
    }
    // To make it compatible with real number square root operation
    if (c.im === 0) {
      return c.re >= 0
        ? [{re:  Math.sqrt(c.re), im: 0},
           {re: -Math.sqrt(c.re), im: 0}]
        : [{re: 0, im:  Math.sqrt(-c.re)},
           {re: 0, im: -Math.sqrt(-c.re)}];
    }
    const sqrt = CPX.fromLenAndAng(Math.sqrt(CPX.getLen(c)), CPX.getAng(c) / 2);
    return [
      {re:  sqrt.re, im:  sqrt.im},
      {re: -sqrt.re, im: -sqrt.im},
    ];
  }
  
  static sqrtn(c: IComplex, n: number): IComplex[] {
    if (CPX.isZero(c)) {
      return [CPX.ZERO];
    }
    const sqrtnLen = Math.pow(CPX.getLen(c), 1/n);
    const cAng = CPX.getAng(c);
    const res = [];
    for (let i = 0; i < n; i++) {
      res.push(CPX.fromLenAndAng(sqrtnLen, (cAng + 2 * Math.PI * i) / n));
    }
    return res;
  }
  
  static reciprocal(c: IComplex): IComplex {
    if (CPX.isZero(c)) return CPX.ZERO;
    else {
      const denom = c.re ** 2 + c.im ** 2;
      return {
        re:  c.re / denom,
        im: -c.im / denom
      };
    }
  }
  
  static add(c1: IComplex, c2: IComplex): IComplex {
    return {
      re: c1.re + c2.re,
      im: c1.im + c2.im
    }
  }
  
  static subtract(c1: IComplex, c2: IComplex): IComplex {
    return {
      re: c1.re - c2.re,
      im: c1.im - c2.im
    }
  }
  
  static multiply(c1: IComplex, c2: IComplex): IComplex {
    return {
      re: c1.re * c2.re - c1.im * c2.im,
      im: c1.re * c2.im + c1.im * c2.re
    }
  }
  
  static multiplyReal(c: IComplex, r: number): IComplex {
    return {
      re: c.re * r,
      im: c.im * r
    }
  }
  
  static divide(c1: IComplex, c2: IComplex): IComplex {
    if (CPX.isZero(c2)) return CPX.ZERO;
    return CPX.multiply(c1, CPX.reciprocal(c2));
  }
  
}


export function solveLinear(a: number, b: number): IComplex[] {
  if (a === 0) return [];
  return [
    {re: -b / a, im: 0}
  ];
}

export function solveQuadratic(a: number, b: number, c: number): IComplex[]
{
  if (a === 0) return solveLinear(b, c);
  const delta = b ** 2 - 4 * a * c;
  const sqrtDelta = Math.sqrt(Math.abs(delta));
  if (isZeroReal(delta)) {
    return [
      { re: -b / (2 * a), im: 0 },
    ];
  } else if(delta > 0) {
    return [
      { re: (-b + sqrtDelta) / (2 * a), im: 0 },
      { re: (-b - sqrtDelta) / (2 * a), im: 0 },
    ]
  } else {
    return [
      {re: -b / (2 * a), im:  sqrtDelta / (2 * a) },
      {re: -b / (2 * a), im: -sqrtDelta / (2 * a) },
    ]
  }
}

export function solveCubic(a: number, b: number, c: number, d: number): IComplex[] {
  if (a === 0) return solveQuadratic(b, c, d);
  const B = b / a,
        C = c / a,
        D = d / a;
  const p = C - B ** 2 / 3,
        q = D - B * C / 3 + 2 * B ** 3 /27;
  const Delta = q ** 2 + 4 * p ** 3 / 27;
  
  if (isZeroReal(p) && isZeroReal(q)) {
    return [
      {re: -B / 3, im: 0}
    ];
  }

  const b3 = -B / 3;
  const ang2Pi3 = Math.PI * 2 / 3;
  if (isZeroReal(Delta)) {
    return [
      {re: b3 - sqrt3(4 * q), im: 0 },
      {re: b3 + sqrt3(q / 2), im: 0 },
    ]
  } else if (Delta < 0) {
    const r = Math.sqrt(-p / 3);
    const u3: IComplex = {
      re: -q / 2,
      im: Math.sqrt(-Delta) / 2
    }
    const u3Ang = CPX.getAng(u3);
    return [0, 1, 2]
      .map(k => {return {
        re: b3 + 2 * r * Math.cos(u3Ang / 3 + ang2Pi3 * k),
        im: 0
      }});
  } else {
    const u1 = isZeroReal(p) ? 0 : sqrt3((-q + Math.sqrt(Delta)) / 2);
    const v1 = isZeroReal(p) ? sqrt3(-q) : -p / 3 / u1;
    const u2 = CPX.multiplyReal(CPX.fromLenAndAng(1,  ang2Pi3), u1);
    const v2 = CPX.multiplyReal(CPX.fromLenAndAng(1, -ang2Pi3), v1);
    const u3 = CPX.multiplyReal(CPX.fromLenAndAng(1, -ang2Pi3), u1);
    const v3 = CPX.multiplyReal(CPX.fromLenAndAng(1,  ang2Pi3), v1);
    return [
        { re: u1 + v1, im: 0 },
        CPX.add(u2, v2),
        CPX.add(u3, v3)
      ]
      .map(y => {return {re: y.re + b3, im: y.im }});
  }
  // For Delta > 0 and Delta < 0, we can unify them, i.e. CPX.sqrtn(C, 3).
  // But considering the calculation precision, it would be possible that
  // the result is truly some real, but it is presented as a complex with very small
  // imaginary part. So here we can split it to different case, to ensure that we get
  // very clear and definite results for "pure-real" roots, with imaginary part being 0.
}

export function solveQuartic(a: number, b: number, c: number, d: number, e: number): IComplex[] {
  if (a === 0) return solveCubic(b, c, d, e);
  const B = b / a,
        C = c / a,
        D = d / a,
        E = e / a;
  const p = C - 3 * B ** 2 / 8,
        q = B ** 3 / 8 - B * C / 2 + D,
        r = -3 * B ** 4 / 256 + B ** 2 * C / 16 - B * D / 4 + E;
  const b4 = -B / 4;
  // Now make some quick judgements
  let ys: IComplex[] = [];
  if (isZeroReal(p) && isZeroReal(q) && isZeroReal(r)) {
    ys = [{re: 0, im: 0}];
  } else if (isZeroReal(p) && isZeroReal(q)) {
    ys = CPX.sqrtn({re: -4, im: 0}, 4);
  } else if (isZeroReal(q) && isZeroReal(r)) {
    ys = [
      {re: 0, im: 0},
      ...(CPX.sqrt2({re: -p, im: 0}))
    ]
  } else if (isZeroReal(p) && isZeroReal(r)) {
    ys = [
      {re: 0, im: 0},
      ...(CPX.sqrtn({re: -q, im: 0}, 3))
    ]
  } else if (isZeroReal(r)) {
    ys = [
      {re: 0, im: 0},
      ...(solveCubic(1, 0, p, q))
    ]
  } else if (isZeroReal(q)) {
    ys = [];
    solveQuadratic(1, p, r)
      .forEach(y => {
        ys.push(...(CPX.sqrt2(y)));
      });
  } else {
    ys = [];
    const ms = solveCubic(1, -p/2, -r, (4 * p * r - q ** 2) / 8);
    const m1 = ms.filter(m => isZeroReal(m.im))[0].re;
    const alpha = q / (2 * (2 * m1 - p));
    // const cBeta =  new CNumber(2 * m1 -p, 0);
    CPX.sqrt2({re: 2 * m1 - p, im: 0})
      .forEach(beta => {
        const cRe: IComplex = {re: -2 * m1 - p, im: 0};
        const cIm: IComplex = CPX.multiplyReal(beta, -4 * alpha);
        const cInSqrt: IComplex = CPX.add(cRe, cIm);
        CPX.sqrt2(cInSqrt)
          .map(y => {
            return CPX.multiplyReal(CPX.add(beta, y), 0.5);
          })
          .forEach(y => {
            ys.push(y);
          });
      });
  }
  // convert from y to x
  return ys.map(y => {return {re: b4 + y.re, im: y.im}});
}
