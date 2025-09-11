
import type {
  IHuatuTransform,
} from "./IHuatu.js";

import { SvgPoint } from "../svg/SvgPoint.js";
import Vector from "../geometry/Vector.js";
import type { ISvgPoint } from "../svg/ISvg.js";
import { WtMath } from "../math/WtMath.js";

export interface IHuatuTransformParams {
  move?: string;
  rotDeg?: string;
  at?: string;
  scale?: number;
}

export class HuatuTransform implements IHuatuTransform {
  x?: number;
  y?: number;
  rotCx?: number;
  rotCy?: number;
  rotDeg?: number;
  scale?: number;

  constructor(
    x?: number,
    y?: number,
    rotCx?: number,
    rotCy?: number,
    rotDeg?: number,
    scale?: number
  ) {
    this.x = x;
    this.y = y;
    this.rotCx = rotCx;
    this.rotCy = rotCy;
    this.rotDeg = rotDeg;
    this.scale = scale;
  }

  static addMove(arr: string[], move: ISvgPoint) {
    if (!WtMath.isZero(move.x) || !WtMath.isZero(move.y)) {
      arr.push(`translate(${SvgPoint.toCoors(move)})`);
    }
  }

  static addRotate(arr: string[], rotDeg: number, rotCenter?: ISvgPoint) {
    if (!WtMath.isZero(rotDeg)) {
      const vals: number[] = [rotDeg];
      if (rotCenter) {
        vals.push(rotCenter.x, rotCenter.y);
      }
      const valStrs = vals.map(x => `${x}`).join(",");
      arr.push(`rotate(${valStrs})`);
    }
  }

  static addScale(arr: string[], scale: number, scaleCenter?: ISvgPoint) {
    if (!WtMath.isEqual(scale, 1)) {
      if (scaleCenter) {
        const dx = scaleCenter.x * (1 - scale),
              dy = scaleCenter.y * (1 - scale);
        arr.push(`translate(${dx},${dy})`);
      }
      arr.push(`scale(${scale})`);
    }
  }

  static buildTransformAttrsForBlockAndPath(transform?: IHuatuTransform): string[] {
    if (!transform) return [];
    const move = (transform.x || transform.y)
      ? new SvgPoint(transform.x ?? 0, transform.y ?? 0)
      : undefined;
    const attrs: string[] = [];
    if (transform.rotDeg) {
      const rotCenter = new SvgPoint(0, 0);
      if (transform.rotCx) rotCenter.x = transform.rotCx;
      if (transform.rotCy) rotCenter.y = transform.rotCy;
      const scale = HuatuTransform.judgeScale(transform);
      // Rotate at
      HuatuTransform.addRotate(attrs, transform.rotDeg, rotCenter);
      // Scale at
      HuatuTransform.addScale(attrs, scale, rotCenter);
    } else {
      if (transform.scale) {
        const scale = HuatuTransform.judgeScale(transform);
        let scaleCenter = (transform.rotCx || transform.rotCy)
          ? new SvgPoint(transform.rotCx ?? 0, transform.rotCy ?? 0)
          : undefined;
        HuatuTransform.addScale(attrs, scale, scaleCenter);
      }
    }
    // First move action will be placed as last
    if (move) {
      HuatuTransform.addMove(attrs, move);
    }
    return attrs;
  }

  static buildTransformStrForBlockAndPath(transform?: IHuatuTransform): string {
    if (!transform) return "";
    const attrs = HuatuTransform.buildTransformAttrsForBlockAndPath(transform);
    if (attrs.length < 1) return "";
    return `transform="${attrs.join(" ")}"`;
  }

  static buildTransformAttrsForSymbol(transform?: IHuatuTransform): string[] {
    if (!transform) return [];
    const move = (transform.x || transform.y)
      ? new SvgPoint(transform.x ?? 0, transform.y ?? 0)
      : undefined;
    const attrs: string[] = [];
    if (transform.rotDeg) {
      // If the rotation center is not given, then use the point of move
      // If both not given, then leave no translate action
      const rotCenter = transform.rotCx || transform.rotCy
        ? new SvgPoint(transform.rotCx ?? 0, transform.rotCy ?? 0)
        : move;
      if (rotCenter) HuatuTransform.addMove(attrs, rotCenter);
      HuatuTransform.addRotate(attrs, transform.rotDeg);
    } else if (move) {
      HuatuTransform.addMove(attrs, move);
    }
    return attrs;
  }

  static judgeScale(transform?: IHuatuTransform): number {
    if (!transform) return 1;
    if (!transform.scale || transform.scale <= 0) return 1;
    return transform.scale;
  }

}
