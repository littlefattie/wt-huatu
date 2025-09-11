import Point from "../src/geometry/Point.js";
import { Bezier2, Bezier3 } from "../src/geometry/Bezier.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { HuatuPath } from "../src/huatu/HuatuPath.js";
import { HuatuStyle } from "../src/huatu/HuatuStyle.js";
import Circle from "../src/geometry/Circle.js";

const b2 = new Bezier2(
  new Point(-50, 0),
  new Point(10, 40),
  new Point(50, 0),
)
console.log(b2);
console.log(b2.getPoint(0.5));
console.log(b2.getPoint(0.4));
console.log(b2.getPoint(0.6));
console.log(b2.getPoint(0.1));
console.log(b2.getTangentLine(0.5));


const style0 = new HuatuStyle();
style0.strokeColor = "grey";
style0.strokeWidth = 1;
style0.fillColor = "none";

const style1 = new HuatuStyle();
style1.strokeColor = "red";
style1.strokeWidth = 0.2;
style1.fillColor = "none";

const style2 = new HuatuStyle();
style2.strokeColor = "blue";
style2.strokeWidth = 0.2;
style2.fillColor = "none";

const line1  = b2.getTangentLine(0.5)
const ls1 = line1?.buildSeg(5)!;
const path1 = HuatuPath.fromModel(ls1);

const b2sub1 = b2.getSubCurve(0.2, 0.6);
const b2sub2 = b2.getSubCurve(0.9, 0.7);

const htmlB20 = HuatuPath.fromModel(b2).buildHtml("direct", style0);
const htmlTL1 = path1.buildHtml("direct", style1);
const htmlB2S1 = HuatuPath.fromModel(b2sub1).buildHtml("direct", style1);
const htmlB2S2 = HuatuPath.fromModel(b2sub2).buildHtml("direct", style2);
console.log(htmlB20);
console.log(htmlTL1);
console.log(htmlB2S1);
console.log(htmlB2S2);

const b22 = new Bezier2(
  new Point(-5, 0),
  new Point(0, 5),
  new Point(5, 0),
)

// console.log(b22.getTangentLine(0.4));
// console.log(b22.getTangentLine(0.5));
// console.log(b22.getTangentLine(0.6));
// console.log(b22.getTangentLine(0));
// console.log(b22.getTangentLine(1));

const b3 = new Bezier3(
  new Point(0, 50),
  new Point(60, 50),
  new Point(-60, -50),
  new Point(0, -50)
);

const ls31 = b3.getTangentLine(0.04)?.buildSeg(12)!;
const htmlb3 = HuatuPath.fromModel(b3).buildHtml("direct", style0);
const htmlb3ls1 = HuatuPath.fromModel(ls31).buildHtml("direct", style1);
const b3sub1 = b3.getSubCurve(0.02, 0.6);
const htmlb3Sub1 = HuatuPath.fromModel(b3sub1).buildHtml("direct", style1);
const b3sub2 = b3.getSubCurve(0.62, 0.93);
//console.log(HuatuPath.fromModel(new Circle(b3sub2.ctrlPoint1.x, b3sub2.ctrlPoint1.y, 1)).buildHtml("direct", style1))
//console.log(HuatuPath.fromModel(new Circle(b3sub2.ctrlPoint2.x, b3sub2.ctrlPoint2.y, 1)).buildHtml("direct", style1))
const htmlb3Sub2 = HuatuPath.fromModel(b3sub2).buildHtml("direct", style2);

console.log(htmlb3);
console.log(htmlb3ls1);
console.log(htmlb3Sub1);
console.log(htmlb3Sub2);