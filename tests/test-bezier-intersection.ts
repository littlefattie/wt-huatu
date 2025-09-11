import Point from "../src/geometry/Point.js";
import { Bezier2, Bezier3 } from "../src/geometry/Bezier.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { HuatuPath } from "../src/huatu/HuatuPath.js";
import { HuatuStyle } from "../src/huatu/HuatuStyle.js";
import Circle from "../src/geometry/Circle.js";
import Rect from "../src/geometry/Rect.js";
import { Intersection } from "../src/geometry/Intersection.js";
import { PathCircle } from "../src/path/PathCircle.js";


const ln1 = new Line(new Point(0,0), AngDeg.DEG315);
const ln2 = new Line(new Point(0,0), AngDeg.DEG45);
const ln3 = new Line(new Point(0, 50), AngDeg.DEG0);
const ln4 = new Line(new Point(18, 0), AngDeg.DEG90);

const ls1 = ln1.buildSeg(-150, 150),
      ls2 = ln2.buildSeg(-150, 150);

const rect1 = Rect.fromCenterWH(new Point(0, 0), 120, 80);

const b2 = new Bezier2(
  new Point(-50, 100),
  new Point(-5, -200),
  new Point(50, 100)
);

const b3 = new Bezier3(
  new Point(-60, 110),
  new Point(-160, 0),
  new Point(160, 0),
  new Point(60, 110)
);

const xp11 = Intersection.line2Bezier2(ln1, b2),
      xp12 = Intersection.line2Bezier2(ln2, b2),
      xp21 = Intersection.line2Bezier3(ln1, b3),
      xp22 = Intersection.line2Bezier3(ln2, b3),
      xp31 = Intersection.getXpoints(rect1, b2),
      xp32 = Intersection.getXpoints(rect1, b3),
      xp41 = Intersection.line2Bezier2(ln3, b2),
      xp42 = Intersection.line2Bezier2(ln4, b2),
      xp51 = Intersection.line2Bezier3(ln3, b3),
      xp52 = Intersection.line2Bezier3(ln4, b3);

const printPoints = (xps: Point[], color: string, radius: number) => {
  const circles = xps.map(p => new PathCircle(p.x, p.y, radius))
    .map(c => c.buildHtmlFull(undefined, {color: color}))
    .join("\n");
  console.log(circles);
}

const pathB2 = HuatuPath.fromModel(b2),
      pathB3 = HuatuPath.fromModel(b3),
      pathRect = HuatuPath.fromModel(rect1);

const sty = new HuatuStyle();
sty.strokeColor = "red";
sty.strokeWidth = 0.5;
sty.strokeLineCap = "round";
sty.fillColor="none";
const sty1 = new HuatuStyle();
sty1.strokeColor = "grey";
sty1.strokeWidth = 0.5;
sty1.strokeLineCap = "round";
sty1.strokeDashArray = [3, 3];

console.log(HuatuPath.fromModel(ls1).buildHtml("direct", sty1));
console.log(HuatuPath.fromModel(ls2).buildHtml("direct", sty1));
console.log(HuatuPath.fromModel(ln3.buildSeg(-200, 200)).buildHtml("direct", sty1));
console.log(HuatuPath.fromModel(ln4.buildSeg(-200, 200)).buildHtml("direct", sty1));
console.log(pathB2.buildHtml("direct", sty))
console.log(pathB3.buildHtml("direct", sty))
console.log(pathRect.buildHtml("direct", sty))

printPoints(xp11, "blue", 1);
printPoints(xp12, "blue", 1);
printPoints(xp21, "aqua", 1);
printPoints(xp22, "aqua", 1);
printPoints(xp31, "yellow", 1);
printPoints(xp32, "yellow", 1);

printPoints(xp41, "maroon", 1);
printPoints(xp42, "maroon", 1);
printPoints(xp51, "lime", 1);
printPoints(xp52, "lime", 1);

