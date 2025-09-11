
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
import { PathLine } from "../src/path/PathLine.js";
import { PathBezier2 } from "../src/path/PathBezier2.js";
import { PathBezier3 } from "../src/path/PathBezier3.js";
import Ellipse from "../src/geometry/Ellipse.js";
import { EllipticalArc } from "../src/geometry/EllipticalArc.js";
import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import { PathSegmentedPath } from "../src/path/PathSegmentedPath.js";
import { printPoints } from "./tools.js";


const ln1 = new PathLine(-100, -100, 100, 100);
const ln2 = new PathLine(-80, 80, 30, -50);

const b2 = PathBezier2.fromBezier2(new Bezier2(
    new Point(-20, 10),
    new Point(-5, -40),
    new Point(20, 20)
));

const b3 = new PathBezier3(
    new Point(-45, 25),
    new Point(-20, -70),
    new Point(30, 72),
    new Point(45, -10)
).moveBy(-10, 30)!;

const b3a = new PathBezier3(
    new Point(-70, -60),
    new Point(0, -130),
    new Point(-20, 70),
    new Point(70, -20)
);

const b3c = new PathBezier3(
    new Point(-50, -50),
    new Point(30, -50),
    new Point(30, 50),
    new Point(-50, 50)
)

const b3d = new PathBezier3(
    new Point(50, -50),
    new Point(-30, -50),
    new Point(-30, 50),
    new Point(50, 50)
)


const ellipse1 = new Ellipse(-40, 12, 40, 60, AngDeg.DEG30);
const ell1 = PathEllipse.fromEllipse(ellipse1);
const arc1 = PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(ellipse1, -170, 30, true));

console.log(ln1.buildHtmlFull({color: "yellow", width: 1}));
console.log(ln2.buildHtmlFull({color: "red", width: 1}));

console.log(b2.buildHtmlFull({color: "blue", width: 1}, {color: "none"}));
console.log(b3.buildHtmlFull({color: "blue", width: 1}, {color: "none"}));
console.log(b3a.buildHtmlFull({color: "cyan", width: 2}, {color: "none"}));
console.log(b3c.buildHtmlFull({color: "cyan", width: 2}, {color: "none"}));
console.log(b3d.buildHtmlFull({color: "cyan", width: 2}, {color: "none"}));

console.log(ell1.buildHtmlFull({color: "cyan", width: 0.5, dashArray: [3,3]}, {color: "none"}));
console.log(arc1.buildHtmlFull({color: "white", width: 2}, {color: "none"}));


let xpLn1_2 = PathSegmentedPath.getSegmentIntersection(ln1, 1, ln2, 0);
let xpLn1_b2 = PathSegmentedPath.getSegmentIntersection(ln1, 1, b2, 0);

let xpLn1_2_2 = PathSegmentedPath.getSegmentIntersection(ln1, 1, ln2, 1);
let xpLn1_b2_2 = PathSegmentedPath.getSegmentIntersection(ln1, 1, b2, 1);

let xpB2_ln1 = PathSegmentedPath.getSegmentIntersection(b2, 1, ln1, 0);
let xpB2_ln1_2 = PathSegmentedPath.getSegmentIntersection(b2, 1, ln1, 1);
let xpB2_ln2 = PathSegmentedPath.getSegmentIntersection(b2, 1, ln2, 0);
let xpB2_ln2_2 = PathSegmentedPath.getSegmentIntersection(b2, 0, ln2, 0);

let xpB3_ln1 = PathSegmentedPath.getSegmentIntersection(b3, 1, ln1, 0);
let xpB3_ln2 = PathSegmentedPath.getSegmentIntersection(b3, 1, ln2, 0);
let xpB3_ln2_2 = PathSegmentedPath.getSegmentIntersection(b3, 0, ln2, 0);

let xpArc_ln1 = PathSegmentedPath.getSegmentIntersection(arc1, 1, ln1, 0);
let xpArc_ln1_2 = PathSegmentedPath.getSegmentIntersection(arc1, 1, ln1, 1);
let xpArc_ln1_3 = PathSegmentedPath.getSegmentIntersection(arc1, 0, ln1, 0);

let xpArc_ln2 = PathSegmentedPath.getSegmentIntersection(arc1, 1, ln2, 0);
let xpArc_ln2_2 = PathSegmentedPath.getSegmentIntersection(arc1, 1, ln2, 1);

let xpLn1_Arc = PathSegmentedPath.getSegmentIntersection(ln1, 1, arc1, 0);
let xpLn2_Arc = PathSegmentedPath.getSegmentIntersection(ln2, 1, arc1, 0);

let xpB2_Arc = PathSegmentedPath.getSegmentIntersection(b2, 1, arc1, 0);
let xpB2_Arc2 = PathSegmentedPath.getSegmentIntersection(b2, 0, arc1, 1);
let xpB2_Arc2_2 = PathSegmentedPath.getSegmentIntersection(b2, 0, arc1, 0);

let xpArc_B3 = PathSegmentedPath.getSegmentIntersection(arc1, 1, b3, 0);
let xpArc_B3_1 = PathSegmentedPath.getSegmentIntersection(arc1, 1, b3, 1);
let xpArc_B3_2 = PathSegmentedPath.getSegmentIntersection(arc1, 0, b3, 1);
let xpArc_B3_4 = PathSegmentedPath.getSegmentIntersection(arc1, 0.5, b3, 0.5);

printPoints(Intersection.lineSeg2Bezier3(ln1.auxModel, b3a.auxModel), 2, "pink");

printPoints(Intersection.getXpoints(b3a.auxModel, arc1.auxModel!), 2, "green");
printPoints(Intersection.getXpoints(b3c.auxModel, b3d.auxModel!), 2, "yellow");

printPoints(
    [xpLn1_2, xpLn1_b2, xpB2_ln1,xpB2_ln1_2, xpB2_ln2_2, xpB2_ln2, xpB3_ln2_2, xpB3_ln1, xpB3_ln2],
    3,
    "magenta"
)


printPoints(
    [xpArc_ln1, xpArc_ln1_2, xpArc_ln1_3, xpArc_ln2, xpArc_ln2_2, xpLn1_Arc, xpLn2_Arc],
    3,
    "lime"
)

printPoints(
    [xpB2_Arc, xpB2_Arc2, xpB2_Arc2_2,  xpArc_B3, xpArc_B3_1, xpArc_B3_2, xpArc_B3_4],
    3,
    "yellow"
)
