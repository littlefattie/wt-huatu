import { EllipticalArc } from "../src/geometry/EllipticalArc.js";
import Point from "../src/geometry/Point.js";
import PolyLine from "../src/geometry/PolyLine.js";
import Rect from "../src/geometry/Rect.js";
import Ring from "../src/geometry/Ring.js";
import { PathBezier2 } from "../src/path/PathBezier2.js";
import { PathBezier3 } from "../src/path/PathBezier3.js";
import { PathCircle } from "../src/path/PathCircle.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";
import { PathLine } from "../src/path/PathLine.js";
import { PathPolygon } from "../src/path/PathPolygon.js";
import { PathPolyline } from "../src/path/PathPolyline.js";
import { PathRect } from "../src/path/PathRect.js";
import { PathRing } from "../src/path/PathRing.js";
import { PathTriangle } from "../src/path/PathTriangle.js";
import Line from "../src/geometry/Line.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { Bezier3 } from "../src/geometry/Bezier.js";
import { PathSegmentedPath } from "../src/path/PathSegmentedPath.js";

const b3a = new PathBezier3(
  new Point(-50, 0),
  new Point(-20, -20),
  new Point(20, -20),
  new Point(50,0)
);

const b3b = new PathBezier3(
  new Point(50, 0),
  new Point(80, -30),
  new Point(-80, -30),
  new Point(-50, 0),
);

const b3c = new PathBezier3(
  new Point(-50, 0),
  new Point(-50, -50),
  new Point(50, -50),
  new Point(50, 0),
);

const b3d = new PathBezier3(
  new Point(-50, 0),
  new Point(-80, -30),
  new Point(80, 30),
  new Point(50, 0),
);

const b3e = new PathBezier3(
  new Point(-100, 0),
  new Point(0, -100),
  new Point(0, -100),
  new Point(100, 0),
)

const b3f = new PathBezier3(
  new Point(0, 0),
  new Point(-200, -200),
  new Point(200, -200),
  new Point(0, 0),
)

const b3f2 = new PathBezier3(
  new Point(50, 0),
  new Point(-200, -200),
  new Point(200, -200),
  new Point(-50, 0),
)

console.log(b3f2.auxModel.selfIntersection());
console.log('B3 F', b3f.auxModel.selfIntersection());
console.log('B3 D', b3d.auxModel.selfIntersection());

console.log(b3f2.auxModel.getIntersectionToHline(-80));
console.log(b3f2.auxModel.getIntersectionToVline(14));

console.log(`T of t(0.3)`, b3f2.auxModel.getTofPoint(b3f2.auxModel.getPoint(0.3)!));

console.log(`Is Point On Curve: 0`, b3f2.auxModel.isPointOn(b3f2.auxModel.pStart));
console.log(`Is Point On Curve: 0.443`, b3f2.auxModel.isPointOn(b3f2.auxModel.getPoint(0.443)!));
console.log(`Is Point On Curve: 1`, b3f2.auxModel.isPointOn(b3f2.auxModel.pEnd));

const b3g = new PathBezier3(
  new Point(-100, 0),
  new Point(-200, -100),
  new Point(200, -100),
  new Point(100, 0),
)

console.log("---<   B3 A  >---")
console.log(b3a?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3a.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3a.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3a.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3a.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));


console.log("---<   B3 B  >---")
console.log(b3b?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3b.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3b.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3b.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3b.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));


console.log("---<   B3 C  >---")
console.log(b3c?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3c.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3c.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3c.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3c.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));


console.log("---<   B3 D  >---")
console.log(b3d?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3d.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3d.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3d.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3d.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3d.duplicateTo(6, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));


console.log("---<   B3 E  >---")
console.log(b3e?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3e.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3e.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3e.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3e.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));

console.log("---<   B3 F  >---")
console.log(b3f?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3f.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));

console.log("---<   B3 F 2 >---")
console.log(b3f2.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3f2.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f2.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f2.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3f2.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));

console.log("---<   B3 G  >---")
console.log(b3g?.buildHtmlFull({color: "yellow", width: 0.5}, {color: "none"}));
console.log(b3g.duplicateTo(2, "left")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3g.duplicateTo(2, "right")?.buildHtmlFull({color: "red", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3g.duplicateTo(4, "left")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
console.log(b3g.duplicateTo(4, "right")?.buildHtmlFull({color: "blue", width: 0.2}, {color: "none", opacity: 0.3}));
