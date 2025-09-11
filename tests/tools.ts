
import type { IPoint } from "../src/geometry/IGeometry.js";

import Line from "../src/geometry/Line.js";
import Point from "../src/geometry/Point.js";
import Ellipse from "../src/geometry/Ellipse.js";
import Circle from "../src/geometry/Circle.js";
import Polygon from "../src/geometry/Polygon.js";

import { AngDeg } from "../src/geometry/AngDeg.js";
import { Intersection } from "../src/geometry/Intersection.js";
import { SvgBBox } from "../src/svg/SvgBBox.js";
import type { ISvgBBox } from "../src/svg/ISvg.js";


export const buildPoint2Svg = (point: IPoint, size: number, color: string, opacity?: number) => {
  return `<circle cx="${point.x.toFixed(4)}" cy="${point.y.toFixed(4)}" r="${(size/2).toFixed(4)}" fill="${color}"`
    + (opacity ? ` fill-opacity="${opacity}" `: " ")
    + `/>`
}

export const printPoints = (points: (IPoint | undefined)[], size: number, color: string, opacity?: number) => {
  const svg = points.map(p => p ? buildPoint2Svg(p, size, color, opacity) : "undefined").join("\n");
  console.log(svg);
}


export const bbox2rect = (bbox: ISvgBBox) => {
  return `<rect x="${bbox.x.toFixed(4)}" y="${bbox.y.toFixed(4)}" width="${bbox.w.toFixed(4)}" height="${bbox.h.toFixed(4)}" fill="pink" fill-opacity="0.5" stroke="blue" stroke-width="0.03" />`
}
