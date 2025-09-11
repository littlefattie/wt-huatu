import { SvgBBox } from "../svg/SvgBBox.js";
import { PathLine } from "../path/PathLine.js";
import { SvgPattern } from "../svg/SvgPattern.js";
import { PathRect } from "../path/PathRect.js";
import Rect from "../geometry/Rect.js";
import Point from "../geometry/Point.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Line from "../geometry/Line.js";
import { PathLines } from "../path/PathLines.js";
import type { IStrokeConfig, ISvgBBox, ISvgPath } from "../svg/ISvg.js";
import LineSeg from "../geometry/LineSeg.js";
import { fitNumInRange } from "../tools/utils.js";

const SLASH_LINE_DISTANCE_MIN = 1;
const SLASH_LINE_DISTANCE_MAX = 300;
const SLASH_LINE_WIDTH_MIN = 0.005;

const buildSlashLines = (
  lineDistance: number,
  lineWidth: number,
  direction: "NE2SW" | "NW2SE",
  lineColor?: string,
  bgColor?: string,
  bgOpacity?: number
) => {
  lineDistance = lineDistance < SLASH_LINE_DISTANCE_MIN
    ? SLASH_LINE_DISTANCE_MIN
    : lineDistance > SLASH_LINE_DISTANCE_MAX
    ? SLASH_LINE_DISTANCE_MAX
    : lineDistance;
  lineDistance = Math.floor(lineDistance);
  lineWidth = lineWidth < SLASH_LINE_WIDTH_MIN
    ? SLASH_LINE_WIDTH_MIN
    : lineWidth > lineDistance / 3
    ? lineDistance / 3
    : lineWidth;
  const size = lineDistance * 4;
  lineColor = lineColor ?? "grey";
  const ptnId = `ptnSlashLine`
    + `_${direction}`
    + `_${lineDistance.toFixed()}`
    + `_${Math.floor(lineWidth * 10)}`
    + `_${lineColor}`
    + (bgColor ? `_${bgColor}`: ``);
  const pattern = new SvgPattern(ptnId);
  pattern.width = size;
  pattern.height = size;
  pattern.setViewBox(new SvgBBox(0, 0, size, size))
  if (bgColor) {
    const pathBg = PathRect.fromRect(new Rect(0, 0, size, size));
    pathBg.setFill({
      color: bgColor,
      opacity: bgOpacity
    });
    pattern.addPaths(pathBg);
  }
  const extrude = size / 10;
  const pCenter = new Point(size / 2, size / 2);
  let ang: number,
      deltaX: number,
      deltaY: number;
  if (direction === "NE2SW") {
    ang = AngDeg.DEG135;
    deltaX = lineDistance;
    deltaY = lineDistance;
  } else {
    ang = AngDeg.DEG45;
    deltaX = lineDistance;
    deltaY = -lineDistance;
  }
  const lines = [...Array(8).keys()]
    .map(i => {
      return new Line(
        pCenter.moveByXY(deltaX * (-3.5 + i) / 2, deltaY *(-3.5 + i) / 2),
        ang);
    })
    .map((l, i) => {
      const len = (size / 2 - lineDistance * Math.abs(i - 3.5) / 2 ) * Math.sqrt(2) + extrude;
      return l.buildSeg(-len, len);
    });
  const linesPath = PathLines.fromLineSegments(...lines);
  linesPath.setStroke({
    color: lineColor,
    width: lineWidth
  });
  pattern.addPaths(linesPath);

  return pattern;
}

const ptnSlash1 = buildSlashLines(5, 1, "NE2SW","grey", "yellow", 0.5);
const ptnSlash2 = buildSlashLines(4, 0.5, "NE2SW","yellow", "green");
const ptnSlash3 = buildSlashLines(6, 0.8, "NW2SE","black", "red", 0.7);
const ptnSlash4 = buildSlashLines(3, 0.2, "NW2SE","skyblue", "cyan");
const ptnSlash5 = buildSlashLines(3, 0.2, "NW2SE","yellow");

export const predefinedPatterns: {
  [ptnName: string]: SvgPattern | undefined;
} = {
  "slash1": ptnSlash1,
  "slash2": ptnSlash2,
  "slash3": ptnSlash3,
  "slash4": ptnSlash4,
  "slash5": ptnSlash5,
  // TODO: make more as you develop this
}
