/**
 * The class implementation of SVG Point.
 */

import type { IPoint } from "../geometry/IGeometry.js";
import type {
  ISvgPoint,
  ISvgGradient,
  ISvgGradientStop,
  ISvgGradientLinear,
  ISvgGradientRadial,
  SvgUnitsType,
  SvgFillGradientSpreadMethod,
} from "./ISvg.js";
import { SvgCsts } from "./SvgConstants.js";

export class SvgGradient implements ISvgGradient {
  id: string;
  units: SvgUnitsType = "objectBoundingBox";
  spreadMethod: SvgFillGradientSpreadMethod = "pad";
  stops: ISvgGradientStop[] = [];
  type: "linear" | "radial" = "linear";

  constructor(id: string) {
    this.id = id;
  }

  addStop(offset: number, color: string, opacity?: number) {
    const stop: ISvgGradientStop = {
      offset: offset,
      color: color,
    };
    if (opacity) stop.opacity = opacity;
    this.stops.push(stop);
    this.stops.sort((s1, s2) => s1.offset - s2.offset);
  }

  setUnits(units: SvgUnitsType) {
    this.units = units;
  }

  setSpreadMethod(method: SvgFillGradientSpreadMethod) {
    this.spreadMethod = method;
  }

  coorsToString(coors: string[]): string {
    const percentSign = this.units === "objectBoundingBox" ? "%" : "";
    const parent = this as unknown as {
      [key: string]: number | undefined;
    };
    return coors.map(n => ({name: n, value: parent[n]}))
    .filter(x => !!x.value)
    .map(x => `${x.name}="${x.value?.toFixed()}${percentSign}"`)
    .join(" ");
  }

  buildCoors() {
    return ""
  }

  buildHtml() {
    return `<${this.type}Gradient`
      + ` id="${this.id}"`
      + (this.units === "objectBoundingBox" ? `` : ` gradientUnits="${this.units}"`)
      + (this.spreadMethod === "pad" ? `` : ` spreadMethod="${this.spreadMethod}"`)
      + ` ${this.buildCoors()} >\n`
      + this.stops.map(s => {
        return `  <stop`
          + ` offset="${s.offset > 100 ? 100 : s.offset < 0 ? 0 : s.offset}%"`
          + ` stop-color="${s.color}"`
          + (s.opacity ? ` stop-opacity="${s.opacity}"` : ``)
          + ` />`;
      }).join("\n")
      + `\n</${this.type}Gradient>`;
  }

  //=======     Static Methods     =====================================================

  static newLinear(id: string, x1?: number, y1?: number, x2?: number, y2?: number): SvgGradientLinear {
    return new SvgGradientLinear(id, x1, y1, x2, y2);
  }

  static newRadial(id: string, cx?: number, cy?: number, r?: number, fx?: number, fy?: number): SvgGradientRadial {
    return new SvgGradientRadial(id, cx, cy, r, fx, fy);
  }

}

export class SvgGradientLinear extends SvgGradient implements ISvgGradientLinear {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;

  constructor(id: string, x1?: number, y1?: number, x2?: number, y2?: number) {
    super(id);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  buildCoors(): string {
    return this.coorsToString(["x1", "x2", "y1", "y2"]);
  }
}

export class SvgGradientRadial extends SvgGradient implements ISvgGradientRadial {
  cx?: number;
  cy?: number;
  r?: number;
  fx?: number;
  fy?: number;

  constructor(id: string, cx?: number, cy?: number, r?: number, fx?: number, fy?: number) {
    super(id);
    this.type = "radial";
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.fx = fx;
    this.fy = fy;
  }

  buildCoors(): string {
   return this.coorsToString(["cx", "cy", "r", "fx", "fy"]);
  }

}
