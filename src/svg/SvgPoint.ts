/**
 * The class implementation of SVG Point.
 */

import type { IPoint } from "../geometry/IGeometry.js";
import type { ISvgPoint } from "./ISvg.js";
import { SvgCsts } from "./SvgConstants.js";

export class SvgPoint implements ISvgPoint, IPoint {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public toCoors(digits?: number): string {
    const digitPlace = digits
      ? (digits < SvgCsts.COORS_DIGITS_MIN ? SvgCsts.COORS_DIGITS_MIN : Math.round(digits))
      : SvgCsts.COORS_DIGITS;
    return `${this.x.toFixed(digitPlace)},${this.y.toFixed(digitPlace)}`;
  }
  
  public moveBy(dx: number, dy: number): SvgPoint {
    return new SvgPoint(this.x + dx, this.y + dy);
  }

  //=======     Static Methods     =====================================================
  
  public static from(p: ISvgPoint | IPoint) {
    return new SvgPoint(p.x, p.y);
  }

  public static toCoors(p: ISvgPoint, digits?: number): string {
    const digitPlace = digits
      ? (digits < SvgCsts.COORS_DIGITS_MIN ? SvgCsts.COORS_DIGITS_MIN : Math.round(digits))
      : SvgCsts.COORS_DIGITS;
    return `${p.x.toFixed(digitPlace)},${p.y.toFixed(digitPlace)}`;
  }
  
  static ORIGIN = new SvgPoint(0, 0);
  static ZERO = new SvgPoint(0, 0);
}
