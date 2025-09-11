/**
 * The class implementation of SVG Point.
 */

import type { IPoint } from "../geometry/IGeometry.js";
import type { ISvgPoint } from "./ISvg.js";
import { SvgCsts } from "./SvgConstants.js";
import { SvgPoint } from "./SvgPoint.js";

export class SvgPointSet {
  public points: SvgPoint[] = [];

  constructor() {
  }

  add(...points: (ISvgPoint | IPoint)[]) {
    this.points.push(...points.map(p => SvgPoint.from(p)));
  }

  concat(set: SvgPointSet) {
    this.add(...set.points);
    return this;
  }

  //=======     Static Methods     =====================================================
  
  static from(points: (ISvgPoint | IPoint)[]) {
    const set = new SvgPointSet();
    set.points = points.map(p => SvgPoint.from(p));
    return set;
  }

  static zipTwo(set1: SvgPointSet, set2: SvgPointSet) {
    const set = new SvgPointSet();
    const lenLonger = Math.max(set1.points.length, set2.points.length);
    for (let i = 0; i < lenLonger; i++) {
        if (i < set1.points.length) {
          set.add(set1.points[i]);
        }
        if (i < set2.points.length) {
          set.add(set2.points[i]);
        }
    }
    return set;
  }

  static concatTwo(set1: SvgPointSet, set2: SvgPointSet) {
    const set = new SvgPointSet();
    set.add(...set1.points);
    set.add(...set2.points);
    return set;
  }

}
