/**
 * The class implementation of SVG BBOX (Bounding box).
 */

import { WtMath } from "../math/WtMath.js";
import Vector from "../geometry/Vector.js";
import type {
  ISvgBBox,
  ISvgBBoxMaxMin,
  ISvgPoint,
} from "./ISvg.js";
import { SvgPoint } from "./SvgPoint.js";


export class SvgBBox implements ISvgBBox {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public isDummy: boolean = true;

  constructor(x: number, y: number, w: number, h: number, dummy?: boolean) {
    this.x = x;
    this.y = y;
    this.w = Math.abs(w);
    this.h = Math.abs(h);
    this.isDummy = !!dummy;
  }
  
  copy(): ISvgBBox {
    if (this.isDummy) return SvgBBox.DUMMY;
    return new SvgBBox(this.x, this.y, this.w, this.h);
  }
  
  toMaxMins(): ISvgBBoxMaxMin {
    return {
      xMin: this.x,
      xMax: this.x + this.w,
      yMin: this.y,
      yMax: this.y + this.h,
    }
  }

  getAnchor(): ISvgPoint {
    return new SvgPoint(this.x, this.y);
  }

  getCenter(): ISvgPoint {
    return new SvgPoint(this.x + this.w / 2, this.y + this.h / 2);
  }

  buildString(): string {
    return `${this.x} ${this.y} ${this.w} ${this.h}`;
  }

  mergeAnother(box: ISvgBBox): ISvgBBox {
    if ( this.isDummy &&  box.isDummy) return SvgBBox.DUMMY;
    if ( this.isDummy && !box.isDummy) return box;
    if (!this.isDummy &&  box.isDummy) return this;
    const merged = SvgBBox.mergeTwo(this.toMaxMins(), box.toMaxMins());
    return SvgBBox.fromMaxMins(merged.xMin, merged.xMax, merged.yMin, merged.yMax);
  }

  /** Here this function will extend the border 2*strokeWidth far away,
   * It is not accurate, and might be not very correct since there is another
   * factor that miter limit determines. So here it is just some simple
   * and approximating method to estimate the boundary of the bbox with
   * some stroke. To precisely estimate the extended bbox, we should examine
   * every corner of the vertices of the path, and it is path dependent,
   * will cost a lot of calculating effort. Please modify and optimize this
   * if you have some better idea.
   */
  extendByStroke(strokeWidth: number): ISvgBBox {
    if (this.isDummy) return SvgBBox.DUMMY;
    if (WtMath.isZero(this.w) && WtMath.isZero(this.h)) return SvgBBox.DUMMY;
    let k = 0.8;
    return new SvgBBox(
      this.x -     k * strokeWidth, 
      this.y -     k * strokeWidth,
      this.w + 2 * k * strokeWidth,
      this.h + 2 * k * strokeWidth
    );
  }

  moveBy(dx: number, dy: number): SvgBBox {
    return SvgBBox.moveBy(this, dx, dy);
  }

  rotateAt(rotCenter: ISvgPoint, rotDeg: number): SvgBBox {
    return SvgBBox.rotateAt(this, rotCenter, rotDeg);
  }

  scale(t: number) {
    if (t <= 0) return this;
    return new SvgBBox(t * this.x, t * this.y, t * this.w, t * this.h);
  }

  buildRectSvg(withClass?: boolean) {
    return SvgBBox.buildRectSvg(this, withClass);
  }

  mirrorAt(mirrorX?: boolean, mirrorY?: boolean, at?: ISvgPoint) {
    const p = at || new SvgPoint(0, 0);
    const x = mirrorX ? 2 * p.x - (this.x + this.w) : this.x;
    const y = mirrorY ? 2 * p.y - (this.y + this.h) : this.y;
    return new SvgBBox(x, y, this.w, this.h);
  }

  // ================ Static Methods ==================================================

  static DUMMY = new SvgBBox(0, 0, 0, 0, true);

  static mergeTwo = (box1: ISvgBBoxMaxMin, box2: ISvgBBoxMaxMin): ISvgBBoxMaxMin => {
    return {
      xMin: Math.min(box1.xMin, box2.xMin),
      xMax: Math.max(box1.xMax, box2.xMax),
      yMin: Math.min(box1.yMin, box2.yMin),
      yMax: Math.max(box1.yMax, box2.yMax),
    };
  }

  static mergeBoxes = (boxes: ISvgBBox[]) => {
    let box = SvgBBox.DUMMY;
    boxes.forEach(b => box = box.mergeAnother(b));
    return box;
  }

  static buildCornerPoints(bbox: ISvgBBox): ISvgPoint[] {
    return [
      new SvgPoint(bbox.x, bbox.y),
      new SvgPoint(bbox.x + bbox.w, bbox.y),
      new SvgPoint(bbox.x + bbox.w, bbox.y + bbox.h),
      new SvgPoint(bbox.x, bbox.y + bbox.h),
    ];
  }

  static fromMaxMins(xMin: number, xMax: number, yMin: number, yMax: number): SvgBBox {
    return new SvgBBox(
      Math.min(xMax, xMin), 
      Math.min(yMin, yMax), 
      Math.abs(xMax - xMin), 
      Math.abs(yMax - yMin));
  }

  static fromCenterWidthHeight(center: ISvgPoint, w: number, h: number): SvgBBox {
    w = Math.abs(w);
    h = Math.abs(h);
    return new SvgBBox(
      center.x - w / 2,
      center.y - h / 2,
      w,
      h
    );
  }

  static rotateAt(bbox: ISvgBBox, rotCenter: ISvgPoint, rotDeg: number): SvgBBox {
    const corners = SvgBBox.buildCornerPoints(bbox)
      .map(p => Vector.fromTo(rotCenter, p)
        .rotateByDeg(rotDeg)
        .addVector(Vector.fromPoint(rotCenter))
        .toPoint());
    const xs = corners.map(p => p.x);
    const ys = corners.map(p => p.y);
    return SvgBBox.fromMaxMins(
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    );
  }

  static moveBy(bbox: ISvgBBox, dx: number, dy: number): SvgBBox {
    return new SvgBBox(bbox.x + dx, bbox.y + dy, bbox.w, bbox.h);
  }

  static buildRectSvg(bbox: ISvgBBox, withClass?: boolean): string {
    // Return Nothing when it is dummy or Width/Height is zero
    if (bbox.isDummy || WtMath.isZero(bbox.w) || WtMath.isZero(bbox.h)) return "";
    const attrClass = withClass ? `class="wthuatu-bbox-ref-${globalThis.wthtJobBuildId}"` : ``;
    return `<rect x="${bbox.x.toFixed(6)}" y="${bbox.y.toFixed(6)}" width="${bbox.w.toFixed(6)}" height="${bbox.h.toFixed(6)}" ${attrClass} />`
  }

  static parseFromTwoPoints(p1: ISvgPoint, p2: ISvgPoint): SvgBBox | undefined {
    let w = Math.abs(p1.x - p2.x);
    let h = Math.abs(p1.y - p2.y);
    let x = Math.min(p1.x, p2.x);
    let y = Math.min(p1.y, p2.y);
    if (WtMath.isZero(w) || (WtMath.isZero(h))) return undefined;
    return new SvgBBox(x, y, w, h);
  }

}
