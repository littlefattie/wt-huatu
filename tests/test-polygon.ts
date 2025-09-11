import Point from "../src/geometry/Point.js";
import Triangle from "../src/geometry/Triangle.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import { PathPolygon } from "../src/path/PathPolygon.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { SvgPoint } from "../src/svg/SvgPoint.js";
import { bbox2rect } from "./tools.js";
import { PathRect } from "../src/path/PathRect.js";
import Rect from "../src/geometry/Rect.js";
import { HuatuPath } from "../src/huatu/HuatuPath.js";

const plg = new Polygon(
  new Point(0, 5),
  new Point(4, 5),
  new Point(6, 3),
  new Point(4, 0),
  new Point(0, 0),
);


console.log(plg);

const plg2 = new Polygon(
  new Point(0, 5),
  new Point(4, 5),
  new Point(6, 4),
  new Point(3, 3),
  new Point(6, 2),
  new Point(4, 0),
  new Point(0, 0),
);


console.log(plg2);

const plg3 = new Polygon(
  new Point(3, 3),
  new Point(4, 3),
);

console.log(plg3);

const plg4 = new Polygon(
  new Point(3, 3),
  new Point(4, 4),
  new Point(8, 8),
);
console.log(plg4);

const plgPoints = [0, 1, 2, 3, 4, 5]
  .map(i => Math.PI * 2 * i / 6)
  .map(a => new SvgPoint(20 * Math.cos(a), 20 * Math.sin(a)));

const plgP1 = new PathPolygon(...plgPoints);
// console.log(plgP1.polygon);
console.log(plgP1.buildPathData());
console.log(plgP1.buildPathData(14));


const plgPoints2 = [0, 1, 2, 3]
  .map(i => Math.PI * 2 * i / 6)
  .map(a => new SvgPoint(20 * Math.cos(a), 20 * Math.sin(a)));

const plgP2 = new PathPolygon(...plgPoints2);
// console.log(plgP1.polygon);
console.log(plgP2.buildPathData());
console.log(plgP2.buildPathData(14));
console.log(plgP2.buildPathData(0));

plgP2.setAngArcRadius(4);
console.log(plgP2.buildHtml());
console.log(bbox2rect(plgP2.bbox));
plgP2.removeAngArcRadius();
console.log(plgP2.buildHtml());


const rect1 = PathRect.fromXYWH(3,3, 10, 20, 1);
console.log(rect1.buildHtmlFull({color: "red", width: 0.2}));
console.log(rect1.buildPathData());

const rect2 = new Rect(3,3,10,20);
const rect22 = PathRect.fromRect(rect2, 1.5);
console.log(rect22.buildHtmlFull({color: "yellow", width: 0.1}));
console.log(rect22.buildPathData());

const plgn3_1 = Polygon.buildRegularPolygon(3, new Point(3, 3), 10, 0);
const plgn3_2 = Polygon.buildRegularPolygon(3, new Point(3, 3), 20, 120);
const plgn4_1 = Polygon.buildRegularPolygon(4, new Point(3, 3), 30);
const plgn4_2 = Polygon.buildRegularPolygon(4, new Point(3, 3), 30, 90);
const plgn5_1 = Polygon.buildRegularPolygon(5, new Point(10, 0), 30);
const plgn5_2 = Polygon.buildRegularPolygon(5, new Point(10, 0), 30, 36);
const plgn6_1 = Polygon.buildRegularPolygon(6, new Point(-10, -10), 40, 0);
const plgn6_2 = Polygon.buildRegularPolygon(6, new Point(-10, -10), 40, 30);
const plgn12_2 = Polygon.buildRegularPolygon(12, new Point(-10, -10), 50, 30);
const plgn16_2 = Polygon.buildRegularPolygon(16, new Point(-10, -10), 60, 30);
const plgs = [
  plgn3_1,
  plgn3_2,
  plgn4_1,
  plgn4_2,
  plgn5_1,
  plgn5_2,
  plgn6_1,
  plgn6_2,
  plgn12_2,
  plgn16_2,
].map(p => HuatuPath.fromModel(p).buildHtml("direct")).join("\n");

console.log(`
<g stroke="blue" stroke-width="0.2">
${plgs}
</g>`);
