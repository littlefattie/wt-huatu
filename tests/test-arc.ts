

import Line from "../src/geometry/Line.js";
import Point from "../src/geometry/Point.js";
import LineSeg from "../src/geometry/LineSeg.js";
import Ellipse from "../src/geometry/Ellipse.js";
import Circle from "../src/geometry/Circle.js";
import Polygon from "../src/geometry/Polygon.js";
import { EllipticalArc } from "../src/geometry/EllipticalArc.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { Intersection } from "../src/geometry/Intersection.js";

import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";

import { buildPoint2Svg, printPoints} from "./tools.js";
import { PathLine } from "../src/path/PathLine.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import type { IStrokeConfig } from "../src/svg/ISvg.js";


const cir1 = new Circle(5, 5, 10);
const p1 = cir1.getPoint(30)!;
const p2 = cir1.getPoint(120)!;
const p3 = new Point(5, 5);
const p4 = new Point(11, 15);
const line1 = new Line(p3, AngDeg.DEG45);
const ls1 = new LineSeg(p3, p4);
const ls2 = line1.buildSeg(-5, 20);
const arc1 = EllipticalArc.fromStartEndPoints(p1, p2, 10, 10, false, true, 0);
const arc2 = EllipticalArc.fromStartEndPoints(p3, p4, 20, 30, false, true, 0);
const pathLs1 = PathLine.fromEnds(p3, p4);
const pathLs2 = PathLine.fromEnds(ls2.pStart, ls2.pEnd);
const pathArc1 = PathEllipticalArc.fromStartEndPoints(p1, p2, 10, 10, false, true, 0);
const pathArc2 = PathEllipticalArc.fromStartEndPoints(p3, p4, 20, 30, false, true, 0);
const arc2Ell = pathArc2.auxModel?.auxEllipse as Ellipse;
const arc2EllPath = new PathEllipse(arc2Ell.cx, arc2Ell.cy, arc2Ell.rx, arc2Ell.ry, 0);

const xps1 = Intersection.line2EllArc(line1, arc1);
const xps2 = Intersection.line2EllArc(line1, arc2);
const xps3 = Intersection.lineSeg2EllArc(ls1, arc1);
const xps4 = Intersection.lineSeg2EllArc(ls1, arc2);
const xps5 = Intersection.ellArc2EllArc(arc1, arc2);
const xps6 = Intersection.circle2Ellipse(cir1, arc2Ell);

console.log(arc2EllPath.buildHtmlFull({color: "grey", width:0.1}));
console.log(pathLs1.buildHtmlFull({color: "yellow", width:0.1}));
console.log(pathLs2.buildHtmlFull({color: "lime", width:0.1}));
console.log(pathArc1.buildHtmlFull({color: "yellow", width:0.1}));
console.log(pathArc2.buildHtmlFull({color: "yellow", width:0.1}));

printPoints([p1,p2, p3, p4], 0.6, "red");

printPoints(xps1, 0.4, "black", 0.5);
printPoints(xps2, 0.4, "purple", 0.5);
printPoints(xps3, 0.4, "yellow", 0.5);
printPoints(xps4, 0.4, "grey", 0.5);
printPoints(xps5, 0.4, "red", 0.5);
printPoints(xps6, 0.4, "white", 0.5);


const cx = 20,
      cy=20;
const r1 = 2;
const rDelta = 1.4;
const deg = 62;
const degR = 270 + deg/2;
const degL = 270 - deg/2;
const wfCir1 = new Circle(cx,cy, r1);
const wfCir2 = new Circle(cx,cy, r1 + rDelta);
const wfCir3 = new Circle(cx,cy, r1 + rDelta + rDelta);
const wifiArc1 = PathEllipticalArc.fromArc(EllipticalArc.fromCircle(wfCir1, degR, degL,false));
const wifiArc2 = PathEllipticalArc.fromArc(EllipticalArc.fromCircle(wfCir2, degR, degL,false));
const wifiArc3 = PathEllipticalArc.fromArc(EllipticalArc.fromCircle(wfCir3, degR, degL,false));
const stroke1: IStrokeConfig = {
  color: "silver",
  width: 1.1,
  lineCap: "round",
}

console.log(wifiArc1.buildHtmlFull(stroke1));
console.log(wifiArc2.buildHtmlFull(stroke1));
console.log(wifiArc3.buildHtmlFull(stroke1));
const pCenter = new Point(20, 20);
const circWifi3 = new Circle(20, 20, 10);
const pbL = wfCir3.getPoint(degL)!;
const pbR = wfCir3.getPoint(degR)!;
const lineL = PathLine.fromEnds(pbL, pCenter);
const lineR = PathLine.fromEnds(pbR, pCenter);
printPoints([new Point(20, 20)], 1, "aqua");
const stroke2: IStrokeConfig = {
  color: "lime",
  width: 0.1
};
console.log(lineL.buildHtmlFull(stroke2));
console.log(lineR.buildHtmlFull(stroke2));
