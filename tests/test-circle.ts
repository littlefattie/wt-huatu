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
import Ring from "../src/geometry/Ring.js";
import { PathRing } from "../src/path/PathRing.js";

const ck1 = new Circle(0,0,10);
const ck2 = new Circle(10,0,10);
const ck3 = new Circle(20,0,10);
const ck4 = new Circle(20 * Math.sqrt(1/2),20 * Math.sqrt(1/2),10);
const ck5 = new Circle(11, 9,10);

console.log(Circle.intersectionsOf(ck1, ck2));
console.log(Circle.intersectionsOf(ck1, ck3));
console.log(Circle.intersectionsOf(ck1, ck4));
console.log(Circle.intersectionsOf(ck1, ck5));

const c1 = new PathCircle(10, 10, 20);

console.log(c1.buildHtml());
console.log(`<path d="${c1.buildPathData()}" stroke="lime" stroke-width="0.3" fill="none" />`);


const e1 = new PathEllipse(10, 10, 8,16, 30);

console.log(e1.buildHtml())
console.log(`<path d="${e1.buildPathData()}" stroke="lime" stroke-width="0.3" fill="none" />`);

console.log(e1.buildPathHtmlOnly());

const ring1 = new Ring(30, 40, 40, 60);
const pathRing1 = PathRing.fromRing(ring1);
console.log(pathRing1.buildHtmlFull(undefined, undefined, {mid: "arrow"}));
