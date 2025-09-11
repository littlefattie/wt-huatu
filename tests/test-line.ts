import Point from "../src/geometry/Point.js";
import Triangle from "../src/geometry/Triangle.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { SvgPoint } from "../src/svg/SvgPoint.js";
import { PathCircle } from "../src/path/PathCircle.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";
import Circle from "../src/geometry/Circle.js";
import { PathLine } from "../src/path/PathLine.js";
import { PathLines } from "../src/path/PathLines.js";

import { printPoints } from "./tools.js";
import type { IPoint } from "../src/geometry/IGeometry.js";
import LineSeg from "../src/geometry/LineSeg.js";

const l1 = new Line(new Point(0, 0), AngDeg.DEG30);
const p1 = l1.getPointByX(5);
const p2 = l1.getPointByY(6);
const p3 = l1.getPointByX(-2);

const ls = l1.buildSeg(20, 40);
const pathLs = PathLine.fromEnds(ls.pStart, ls.pEnd);
console.log(pathLs.buildHtmlFull({color: "yellow", width: 0.2}));

const lsv1 = new PathLine(5, -20, 5, 20);
const lsv2 = new PathLine(-6, 6, 20, 6);
const lsv3 = new PathLine(-2, -20, -2, 20);
console.log(lsv1.buildHtmlFull({color: "lime", width: 0.2}));
console.log(lsv2.buildHtmlFull({color: "lime", width: 0.2}));
console.log(lsv3.buildHtmlFull({color: "lime", width: 0.2}));
printPoints([p1, p2, p3] as IPoint[], 1, "aqua");
printPoints([l1.anchor] as IPoint[], 1, "red");
printPoints([ls.pStart] as IPoint[], 1, "blue");
printPoints([ls.pEnd] as IPoint[], 1, "pink");

const lns = PathLines.fromLineSegments(
  new LineSeg(lsv1.pStart, lsv1.pEnd),
  new LineSeg(lsv2.pStart, lsv2.pEnd),
  new LineSeg(lsv3.pStart, lsv3.pEnd));
console.log(lns.buildHtmlFull());

