import { WtMath } from "./WtMath.js";

export interface IMatrix {
  sizeX: number;
  sizeY: number;
  size: number[];    // This would be [dimX, dimY]
  det?: number;
  isSquare: boolean;
}

export class Matrix2by2 implements IMatrix {
  a11: number;
  a12: number;
  a21: number;
  a22: number;

  sizeX: number = 2;
  sizeY: number = 2;
  size: number[] = [2, 2];
  isSquare: boolean = true;
  det: number;

  constructor(a11: number, a12: number, a21: number, a22: number) {
    this.a11 = a11;
    this.a12 = a12;
    this.a21 = a21;
    this.a22 = a22;
    this.det = a11 * a22 - a12 * a21;  
  }

  inv(): Matrix2by2 | null {
    if (WtMath.isEqual(this.det, 0)) return null;
    else return new Matrix2by2(
        this.a22 / this.det,
      - this.a12 / this.det,
      - this.a21 / this.det,
        this.a11 / this.det
    )
  }

  scalerBy(scaler: number): Matrix2by2 {
    return new Matrix2by2(
      scaler * this.a11, 
      scaler * this.a12, 
      scaler * this.a21, 
      scaler * this.a22);
  }
  
  static buildVectorRotateMatrix(alpha: number): Matrix2by2 {
    return new Matrix2by2(
        Math.cos(alpha), 
        Math.sin(alpha), 
      - Math.sin(alpha), 
        Math.cos(alpha));
  }

}