

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";

import {
  PathBezier3
} from "../src/path/PathBezier3.js";
import { SvgPoint } from "../src/svg/SvgPoint.js";
import { SvgBBox } from "../src/svg/SvgBBox.js";
import { bbox2rect } from "./tools.js";
import { PathRect } from "../src/path/PathRect.js";


const b1 = new PathBezier3(
  new SvgPoint(0, -2),
  new SvgPoint(-2, -4),
  new SvgPoint(-4, -3),
  new SvgPoint(-4, -1)
);
const b2 = new PathBezier3(
  new SvgPoint(-4, -1),
  new SvgPoint(-4, 1),
  new SvgPoint(-0.5, 2),
  new SvgPoint(0, 4)
)


console.log(bbox2rect(b1.bbox));
console.log(bbox2rect(b2.bbox));

console.log(b1.buildHtmlFull({color: "red", width:0.031}))
console.log(b2.buildHtmlFull({color: "red", width:0.031}))

const rect1 = PathRect.fromXYWH(5, 5, 20, 40, 12);
console.log(
  `<path d="${rect1.buildPathData()}" stroke="yellow" stroke-width="0.8" />`
);
console.log(rect1.buildHtmlFull({color: "aqua", width: 0.2}, {color: "none"}));

