/**
 * The class implementation of SVG Point.
 */

import type {
  ISvgPoint,
  ISvgPattern,
  SvgUnitsType,
  SvgFillGradientSpreadMethod,
  ISvgPath,
  ISvgBBox,
  TSvgLineCap,
} from "./ISvg.js";
import { fitNumInRange } from "../tools/utils.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Line from "../geometry/Line.js";
import LineSeg from "../geometry/LineSeg.js";
import Point from "../geometry/Point.js";
import { SvgBBox } from "./SvgBBox.js";
import { PathRect } from "../path/PathRect.js";
import { PathLines } from "../path/PathLines.js";
import { PathCircle } from "../path/PathCircle.js";

export class SvgPattern implements ISvgPattern {
  id: string;
  units: SvgUnitsType = "userSpaceOnUse";
  contentUnits?: SvgUnitsType;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  paths: ISvgPath[] = [];
  viewBox?: ISvgBBox | undefined;

  constructor(id: string,x?: number, y?: number, width?: number, height?: number) {
    this.id = id;
    if (x) this.x = x;
    if (y) this.y = y;
    if (width) this.width = width;
    if (height) this.height = height;
  }

  setUnits(units: SvgUnitsType) {
    this.units = units;
  }

  setContentUnits(units: SvgUnitsType) {
    // If there is a View Box defined, then the content unit should not be defined
    if (this.viewBox) return;
    this.units = units;
  }

  setViewBox(box: ISvgBBox) {
    this.viewBox = box;
  }

  addPaths(...paths: ISvgPath[]) {
    this.paths.push(...paths);
  }

  buildHtml(id?: string) {
    const attrs: string[] = [
      `id="${id ?? this.id}"`,
      `x="${this.x}"`,
      `y="${this.y}"`,
      `width="${this.width}"`,
      `height="${this.height}"`
    ];
    if (this.units === "userSpaceOnUse") attrs.push(`patternUnits="${this.units}"`);
    if (this.contentUnits && this.viewBox) attrs.push(`patternContentUnits="${this.contentUnits}"`);
    if (this.viewBox) attrs.push(`viewBox="${this.viewBox.buildString()}"`);

    return `<pattern ${attrs.join(" ")} >\n`
      + this.paths.map(p => p.buildHtml()).join("\n")
      + `\n</pattern>`;
  }

  //=======     Static Methods     =====================================================

}

const buildRectFromViewBox = (vb: ISvgBBox, bg: string, bgOpacity?: number) => {
  const rect = PathRect.fromXYWH(vb.x, vb.y, vb.w, vb.h);
  rect.fill = { color: bg };
  if (bgOpacity) {
    rect.fill.opacity = fitNumInRange(bgOpacity, 0, 1);
  }
  return rect;
}

export const buildLinePattern = (
  name: string,
  lineDensity: number,
  rotDeg: number,
  lineWeight: number,
  lineStyle: "solid" | "dotted" | "dashed" | string,
  dashDensity: number,
  color?: string,
  background?: string,
  bgOpacity?: number,
  opacity?: number,
) => {
  const buildLineSegAndViewBox = (lineDistance: number, rotDeg: number) => {
    let wBox: number,
        hBox: number;
    let path: PathLines = new PathLines();
    let deg = AngDeg.fitDeg(rotDeg);
    deg = AngDeg.ang2Deg(deg);
    if (deg > 180) deg -= 180;
    const degUsed = deg < 5
      ? 0
      : deg > 85 && deg < 95
      ? 90
      : deg > 175
      ? 0
      : deg;
    let w: number,
        h: number;
    let N = 8;                        // Here N should be odd integer
    const idx = [...Array(N).keys()];
    if (degUsed === 0) {              // Horizontal Line
      wBox = N * lineDistance;
      hBox = N * lineDistance;
      h = lineDistance / 2;
      path.addLineSegs(
        ...idx.map(i => LineSeg.fromXYs(-wBox / 2, (2 * i - N + 1) * h, wBox / 2, (2 * i - N + 1) * h))
      );
    } else if (degUsed === 90) {      // Vertical Line
      wBox = N * lineDistance;
      hBox = N * lineDistance;
      w = lineDistance / 2;
      path.addLineSegs(
        ...idx.map(i => LineSeg.fromXYs((2 * i - N + 1) * w, -hBox / 2, (2 * i - N + 1) * w, hBox /2))
      );
    } else {
      let angUsed = AngDeg.deg2Ang(degUsed);
      w = lineDistance / Math.abs(Math.sin(angUsed)) / 2;
      h = lineDistance / Math.abs(Math.cos(angUsed)) / 2;
      let d = Math.sqrt(w ** 2 + h ** 2);
      wBox = N * 2 * w;
      hBox = N * 2 * h;
      let lines = [...Array(2 * N).keys()]
        .map(i => degUsed < 90
          ? new Point(-wBox / 2, (N - 1 - 2 * i) * h)
          : new Point( wBox / 2, (N - 1 - 2 * i) * h))
        .map((p, i) => {
          let len =  (i >= N ? (2 * N) : (2 * i + 1)) * d;
          return new Line(p, angUsed).buildSeg(-strokeWidth, len + strokeWidth);
        });
      path.addLineSegs(...lines);
    }
    return {
      path,
      viewBox: new SvgBBox(-wBox / 2, -hBox / 2, wBox, hBox)
    }
  }

  // Fit Line Weight, it should be in 1 and 100
  lineWeight = fitNumInRange(lineWeight, 1, 100);
  let strokeWidth = lineWeight ** 1.4 * 0.02;
  // Fit Density, it should be in 1 and 100
  lineDensity = fitNumInRange(lineDensity, 1, 100);
  let lineDistance = 40 / lineDensity + strokeWidth * 2;
  // Fit DashDensity, it should be in 1 and 100
  dashDensity = fitNumInRange(dashDensity, 1, 100);
  let dashArray: number[] = [];
  let lineCap: TSvgLineCap | undefined;
  if (lineStyle === "dotted") {
    lineCap = "round";
    let k = 100 / dashDensity;
    dashArray.push(0, k * strokeWidth);
  } else if (lineStyle === "dashed") {
    let k = 100 / dashDensity;
    dashArray.push(k * 1.6 * strokeWidth, k ** 1.5 * 1.6 * strokeWidth);
  }
  const lines = buildLineSegAndViewBox(lineDistance, rotDeg);

  const pattern = new SvgPattern(name, 0, 0, lines.viewBox.w, lines.viewBox.h);
  if (background) {
    pattern.addPaths(buildRectFromViewBox(lines.viewBox, background, bgOpacity));
  }
  lines.path.stroke = {
    color: color ? color : "currentColor",
    width: strokeWidth,
  }
  if (lineCap) {
    lines.path.stroke.lineCap = lineCap;
  }
  if (dashArray.length > 0) {
    lines.path.stroke.dashArray = dashArray;
  }
  if (opacity) {
    lines.path.stroke.opacity = fitNumInRange(opacity, 0, 1);
  }
  pattern.viewBox = lines.viewBox;
  pattern.addPaths(lines.path);
  return pattern;
}

export const buildDotPattern = (
  name: string,
  dotDensity: number,
  dotSize: number,
  color: string,
  opacity?: number,
  background?: string,
  bgOpacity?: number,
) => {
  dotDensity = fitNumInRange(dotDensity, 1, 100);
  dotSize = fitNumInRange(dotSize, 1, 100);
  let r = dotSize * 0.2,
      d = r * (40 / dotDensity ** 0.56247);    // Max density: 3r, min Density: 40r, this is half of the viewBox square side length
  const vb = new SvgBBox(-d, -d, 2 * d, 2 * d);
  const pattern = new SvgPattern(name, 0, 0, vb.w, vb.h);
  const circ = new PathCircle(0, 0, r);
  circ.fill = {color : color};
  if (opacity) {
    circ.fill.opacity = fitNumInRange(opacity, 0, 1);
  }
  pattern.viewBox = vb;
  if (background) {
    pattern.addPaths(buildRectFromViewBox(vb, background, bgOpacity));
  }
  pattern.addPaths(circ);
  return pattern;
}

export const buildSquarePattern = (
  name: string,
  sqDensity: number,
  sqSize: number,
  color: string,
  opacity?: number,
  background?: string,
  bgOpacity?: number,
) => {
  sqDensity = fitNumInRange(sqDensity, 1, 100);
  sqSize = fitNumInRange(sqSize, 1, 100);
  let l = sqSize * 0.2,
      d = l * (40 / sqDensity ** 0.56247);    // Max density: 3r, min Density: 40r, this is half of the viewBox square side length
  const vb = new SvgBBox(-d, -d, 2 * d, 2 * d);
  const pattern = new SvgPattern(name, 0, 0, vb.w, vb.h);
  const sq = PathRect.fromXYWH(-l, -l, 2 * l, 2 * l);
  sq.fill = {color : color};
  if (opacity) {
    sq.fill.opacity = fitNumInRange(opacity, 0, 1);
  }
  pattern.viewBox = vb;
  if (background) {
    pattern.addPaths(buildRectFromViewBox(vb, background, bgOpacity));
  }
  pattern.addPaths(sq);
  return pattern;
}

export const buildGridPattern = (
  name: string,
  gridSize: number,
  lineWidth: number,
  color: string,
  bgColor?: string,
  bgOpacity?: number,
  opacity?: number,
  sparseK?: number,
) => {
  gridSize = fitNumInRange(gridSize, 1, 100);
  let d = Math.ceil(gridSize);
  sparseK = fitNumInRange(sparseK ?? 1, 0.3, 30);
  let len = d * (1 + sparseK);
  const vb = new SvgBBox(-len/2, -len/2, len, len);
  const lines = new PathLines();
  lines.addLineSegs(
    LineSeg.fromXYs(-len/2, -d/2, len/2,  -d/2),
    LineSeg.fromXYs(-len/2,  d/2, len/2,   d/2),
    LineSeg.fromXYs(-d/2, -len/2,  -d/2, len/2),
    LineSeg.fromXYs( d/2, -len/2,   d/2, len/2)
  );
  lineWidth = fitNumInRange(lineWidth, 1, 100);
  lines.stroke = {
    color: color,
    width: lineWidth ** 1.4 * 0.02
  }
  if (opacity) {
    lines.stroke.opacity = fitNumInRange(opacity, 0, 1);
  }
  const pattern = new SvgPattern(name, 0, 0, vb.w, vb.h);
  pattern.viewBox = vb;
  if (bgColor) {
    pattern.addPaths(buildRectFromViewBox(vb, bgColor, bgOpacity));
  }
  pattern.addPaths(lines);
  return pattern;
}
