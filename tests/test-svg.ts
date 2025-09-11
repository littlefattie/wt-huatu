import { SvgPoint } from "../src/svg/SvgPoint.js";
import { Complex } from "../src/math/Complex.js";
import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";
import type { ISvgBBox, ISvgPoint } from "../src/svg/ISvg.js";
import Point from "../src/geometry/Point.js";
import { SegmentModel } from "../src/geometry/SegmentModel.js";

const pts: ISvgPoint[] = [
  {x: 1,y:2},
  {x: 1,y:2},
  {x: 3,y:2},
  {x: 3,y:4},
  {x: 5,y:2},
  {x: 5,y:2},
  {x: 1,y:2},
  {x: 5,y:2},
];
console.log(Point.deDupRepeated(pts, SegmentModel.DE_DUP_THRESHOLD));

const c1 = new Complex(64, 0);
// console.log(c1.rootN(4));

const bbox2rect = (bbox: ISvgBBox) => {
  return `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.w}" height="${bbox.h}" stroke="aqua" stroke-width="0.2" fill="pink" fill-opacity="0.3" />`;
}

const e1 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-2, 40), 10, 20, false, false, 20);
console.log(e1.buildHtml());
console.log(bbox2rect(e1.bbox));

const e2 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-2, 40), 10, 20, true, true, 20);
console.log(e2.buildHtml());
console.log(bbox2rect(e2.bbox));


const e3 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-10, 40), 10, 20, false, false, 20);
console.log(e3.buildHtml());
console.log(bbox2rect(e3.bbox));

const e4 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-10, 40), 10, 20, true, true, 20);
console.log(e4.buildHtml());
console.log(bbox2rect(e4.bbox));

const e5 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-10, 40), 10, 20, true, false, 20);
console.log(e5.buildHtml());
console.log(bbox2rect(e5.bbox));

const e6 = PathEllipticalArc.fromStartEndPoints(new SvgPoint(20, 30), new SvgPoint(-10, 40), 10, 20, true, false, 20);
console.log(e6.buildHtml());
console.log(bbox2rect(e6.bbox));