
import type { IPoint } from "./IGeometry.js";
import Vector from "./Vector.js";
import { WtMath } from "../math/WtMath.js";
import { Matrix2by2 } from "../math/Matrix.js";
import { AngDeg } from "./AngDeg.js";

export default class Point implements IPoint {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public distanceTo(point: IPoint): number {
    return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
  }

  public toVector(): Vector {
    return new Vector(this.x, this.y);
  }

  public moveByLenAndAng(len: number, ang: number): Point {
    return new Point(this.x + len * Math.cos(ang), this.y + len * Math.sin(ang));
  }

  public moveByXY(x: number, y: number): Point {
    return new Point(this.x + x, this.y + y);
  }

  public rotate(ang: number): Point {
    const x = this.x * Math.cos(ang) - this.y * Math.sin(ang);
    const y = this.x * Math.sin(ang) + this.y * Math.cos(ang);
    return new Point(x, y);
  }

  public reflectedBy(center: Point): Point {
    return new Point(2 * center.x - this.x, 2 * center.y - this.y);
  }

  public mirrorX(): Point {
    return new Point(-this.x, this.y);
  }

  public mirrorY(): Point {
    return new Point(this.x, -this.y);
  }

  public mirrorO(): Point {
    return new Point(-this.x, -this.y);
  }

  public multiplyMatrix(mat: Matrix2by2): Point {
    return new Point(this.x * mat.a11 + this.y * mat.a21, this.x * mat.a12 + this.y * mat.a22);
  }

  //Static methods

  public static getDistance(p1: IPoint, p2: IPoint): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  public static fromVector(vector: Vector): Point{
    return new Point(vector.x, vector.y);
  }

  // Check if two points if two close to each other that we can treat them as identical
  // Because the displaying resolution is SVG is not that precise, here we give the rough threshold of 1e-8
  // If in some case there are more accurateness required, we can change.
  public static areIdentical(p1: IPoint, p2: IPoint, tol?: number): boolean {
    let tolerance = tol ?? 1e-6;
    if (tolerance <= 0) tolerance = 1e-6;
    if (tolerance > 0.05) tolerance = 0.05;
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }

  public static deDupPoints(points: Point[], tol?: number): Point[] {
    return points.reduce<Point[]>((final, p) => {
      if (!final.find(x => Point.areIdentical(x, p, tol))) {
        final.push(p);
      }
      return final;
    }, []);
  }

  public static deDupRepeated(points: IPoint[], tol: number): IPoint[] {
    return points.reduce((a, p, i) => {
        if (i < 1) {
          a.push(p);
        }
        else if (!Point.areIdentical(a[a.length - 1], p, tol)) {
          a.push(p);
        }
        return a;
      },
      [] as IPoint[]
    );
  }
  
  public static moveBy(p: IPoint, dx: number, dy: number): Point {
    return new Point(p.x + dx, p.y + dy);
  }

  public static rotateBy(p: IPoint, deg: number, at?: IPoint): Point {
    at = at || new Point(0, 0);
    return new Point(p.x - at.x, p.y - at.y)
      .rotate(AngDeg.deg2Ang(deg))
      .moveByXY(at.x, at.y);
  }

}