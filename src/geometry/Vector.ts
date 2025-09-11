
import type { IPoint } from "./IGeometry.js";

import { Complex } from "../math/Complex.js";
import { WtMath } from "../math/WtMath.js";
import { AngDeg } from "./AngDeg.js";
import Point from "./Point.js";

export default class Vector implements IPoint {
  public x: number;
  public y: number;
  public len: number;
  public ang: number;
  public deg: number;
  public IsZero: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.len = Math.sqrt(x ** 2 + y ** 2);
    this.IsZero = this.len < WtMath.EPSILON;
    this.ang = Complex.getAng(this.x, this.y);
    this.deg = AngDeg.ang2Deg(this.ang);
  }

  public addVector(vector: Vector): Vector{
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  public angToVector(vector: Vector): number | undefined {
    if (vector.IsZero) return undefined;
    const angDiff = vector.ang - this.ang;
    return angDiff < 0 ? angDiff + AngDeg.DEG360 : angDiff;
  }

  public degToVector(vector: Vector): number | undefined {
    if (vector.IsZero) return undefined;
    return vector.deg - this.deg;
  }
  
  public scale(scale: number): Vector {
    return Vector.fromLenAng(this.len * scale, this.ang);
  }

  public rotateByAng(ang: number): Vector{
    return Vector.fromLenAng(this.len, this.ang + ang);
  }

  public rotateByDeg(deg: number): Vector{
    return Vector.fromLenAng(this.len, this.ang + AngDeg.deg2Ang(deg));
  }

  public reflectedBy(center: IPoint): Vector{
    return new Vector(center.x * 2 - this.x, center.y * 2 - this.y);
  }

  public moveByX(deltaX: number): Vector{
    return new Vector(this.x + deltaX, this.y);
  }

  public moveByY(deltaY: number): Vector{
    return new Vector(this.x, this.y + deltaY);
  }

  public moveToX(x: number): Vector{
    return new Vector(x, this.y);
  }

  public moveToY(y: number): Vector{
    return new Vector(this.x, y);
  }

  public moveByXy(deltaX: number, deltaY: number): Vector {
    return new Vector(this.x + deltaX, this.y + deltaY);
  }

  public moveByLenAndAng(len: number, ang: number): Vector {
    return this.addVector(Vector.fromLenAng(len, ang))
  }
  
  public subtractVector(vector: Vector): Vector {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  public dotProductWith(vector: Vector): number {
    return this.x * vector.x + this.y * vector.y;
  }

  public scaleAndRotate(scale: number, ang: number): Vector {
    return Vector.fromLenAng(this.len * scale, this.ang + ang);
  }

  public distanceToVector(vector: Vector): number {
    return this.subtractVector(vector).len;
  }

  public toPoint(): Point {
    return new Point(this.x, this.y);
  }

  public toComplex(): Complex {
    return new Complex(this.x, this.y);
  }


  /**  Static methods */

  public static fromTo(from: IPoint, to: IPoint): Vector {
    return new Vector(to.x - from.x, to.y - from.y);
  }

  public static fromLenAng(len: number, ang: number): Vector {
    return new Vector(len * Math.cos(ang), len * Math.sin(ang));
  }

  public static fromPoint(point: IPoint) {
    return new Vector(point.x, point.y);
  }

}