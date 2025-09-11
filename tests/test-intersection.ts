
import type { IPoint } from "../src/geometry/IGeometry.js";

import Line from "../src/geometry/Line.js";
import Point from "../src/geometry/Point.js";
import Ellipse from "../src/geometry/Ellipse.js";
import Circle from "../src/geometry/Circle.js";
import Polygon from "../src/geometry/Polygon.js";

import { AngDeg } from "../src/geometry/AngDeg.js";
import { Intersection } from "../src/geometry/Intersection.js";

import { buildPoint2Svg, printPoints} from "./tools.js";

const line1 = new Line(new Point(0, 0), AngDeg.deg2Ang(42));
console.log(line1.getPointByLen(-10));
console.log(line1.getPointByLen(20));
console.log(line1.getPointByLen(120));
const ell1 = new Ellipse(30, 0, 20, 40, AngDeg.deg2Ang(-10));

const pArray2Svg = (pArr: IPoint[]) => {
  return pArr.map(p => `<circle cx="${p.x.toFixed(5)}" cy="${p.y.toFixed(5)}" r="1.5" fill="aqua" />`);
}

const printIntersections = (xps: IPoint[] | undefined | null, testName?: string) => {
  if (xps) {
    printPoints(xps, 3, "aqua", 0.5);
  } else {
    console.log(`${testName} failed!`);
  }
}

const line2 = new Line(new Point(5, 10), 0);
const p1 = Intersection.line2Ellipse(line1, ell1);
const p2 = Intersection.line2Ellipse(line2, ell1);
const line3 = ell1.getTangentLineWithPoint(line1.anchor);

if (line3 && line3.length > 0) {
  line3.map(l => Intersection.line2Ellipse(l, ell1))
  .filter(xps => xps && xps.length > 0)
  .forEach(xps => {
    printIntersections(xps, "Nonsense!");
  });
}

const line4 = new Line(line1.anchor, AngDeg.deg2Ang(62));
const p4 = Intersection.line2Ellipse(line4, ell1);
printIntersections(p1, "P1");
printIntersections(p2, "P2");

printIntersections(p4, "No Touch!");


const circ1 = new Circle(11, 20, 19);
const circ2 = new Circle(ell1.cx, ell1.cy, 22);
printIntersections(Intersection.circle2Ellipse(circ1, ell1), "Circle to Ellipse");
printIntersections(Intersection.circle2Ellipse(circ2, ell1), "Bigger Circle");

const plg1Points = [...Array(6).keys()].map(i => {
  const ang = i * Math.PI / 3;
  return new Point(25 * Math.cos(ang), 25 * Math.sin(ang));
})
const plg1 = new Polygon(...plg1Points);
const circ3 = new Circle(0, 0, 25);

const plg1Circ3Points = Intersection.getXpoints(circ3, plg1);
printIntersections(plg1Circ3Points, "Circle 2 Polygon");


const xps = [
  {x: -3, y: -2},
  {x: -3, y: 2},
  {x: 0, y: 0.1},
  {x: -0.2, y: 0.1},
  {x: 3, y: -4},
  {x: 2, y: 4},
  {x: 4, y: -2},
].map(p => new Point(p.x, p.y));

const xp1 = Intersection.pickPoint(xps);
const xp2 = Intersection.pickPoint(xps, "2");
const xp3 = Intersection.pickPoint(xps, "N");
const xp4 = Intersection.pickPoint(xps, "S");
const xp5 = Intersection.pickPoint(xps, "E");
const xp6 = Intersection.pickPoint(xps, "W");
const xp7 = Intersection.pickPoint(xps, "NE");
const xp8 = Intersection.pickPoint(xps, "NW");
const xp9 = Intersection.pickPoint(xps, "SE");
const xp10 = Intersection.pickPoint(xps, "SW");
const xp11 = Intersection.pickPoint(xps, "xMiddle");
const xp12 = Intersection.pickPoint(xps, "yMiddle");
const xp13 = Intersection.pickPoint(xps, "xyMiddle");

// console.log(xp1, xp2, xp3, xp4, xp5, xp6, xp7, xp8, xp9, xp10, xp11, xp12, xp13);

const circ4 = new Circle(0,0, 20);
const pOnCircle = [
  circ4.getPointAng(AngDeg.DEG0)!,
  circ4.getPointAng(AngDeg.DEG45)!,
  circ4.getPointAng(AngDeg.DEG90)!,
  circ4.getPointAng(AngDeg.DEG135)!,
  circ4.getPointAng(AngDeg.DEG180)!,
  circ4.getPointAng(AngDeg.DEG225)!,
  circ4.getPointAng(AngDeg.DEG270)!,
  circ4.getPointAng(AngDeg.DEG315)!,
  circ4.center,
];
console.log("N", Intersection.pickPoint(pOnCircle, "N"));
console.log("S", Intersection.pickPoint(pOnCircle, "S"));
console.log("W", Intersection.pickPoint(pOnCircle, "W"));
console.log("E", Intersection.pickPoint(pOnCircle, "E"));
console.log("NE", Intersection.pickPoint(pOnCircle, "NE"));
console.log("NW", Intersection.pickPoint(pOnCircle, "NW"));
console.log("SE", Intersection.pickPoint(pOnCircle, "SE"));
console.log("SW", Intersection.pickPoint(pOnCircle, "SW"));
console.log("X MiDDLE", Intersection.pickPoint(pOnCircle, "xMiddle"));
console.log("Y Middle", Intersection.pickPoint(pOnCircle, "yMiddle"));
console.log("Center", Intersection.pickPoint(pOnCircle, "center"));
