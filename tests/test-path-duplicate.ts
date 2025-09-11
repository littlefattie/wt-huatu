import type { IFillConfig } from "../src/svg/ISvg.js";
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
import type { IBezier3CurveRadius } from "../src/geometry/IGeometry.js";
import { PathSegmentedPath } from "../src/path/PathSegmentedPath.js";

const ls1 = new PathLine(0, 0, 100, -100);

const pln1 = PathPolyline.fromPolyLine(new PolyLine(
  new Point(0, 0),
  new Point(15, -10),
  new Point(30, 10),
  new Point(45, -20),
  new Point(60, 20),
  new Point(75, -40),
));

const plg1 = new PathPolygon(
  new Point(0, 0),
  new Point(50, 10),
  new Point(40, -70),
  new Point(-20, -10),
)

const plg2 = new PathPolygon(
  new Point(-100, 0),
  new Point(0, -50),
  new Point(100, 0),
  new Point(0, -300),
)

const tri1 = PathTriangle.fromPoints(
  new Point(-20, 0),
  new Point(20, 0),
  new Point(0, -40)
)

const rect1 = PathRect.fromRect(Rect.fromCenterWH(new Point(0, 0), 200, 180));

const circ1 = new PathCircle(0,0, 100);

const ell1 = new PathEllipse(0, 0, 80, 60, 30);

const ring1 = PathRing.fromRing(new Ring(0, 0, 100, 160));

const arc1 = PathEllipticalArc.fromArc(EllipticalArc.fromCircle(circ1.auxCircle, 100, 260, true));

const b2 = new PathBezier2(
  new Point(0, -100),
  new Point(60, 2),
  new Point(-20, 80),
)

const b3a = new PathBezier3(
  new Point(0, -50),
  new Point(150, -50),
  new Point(-50, 120),
  new Point(60, 120),
);
const b3 = new PathBezier3(
  new Point(-50, 0),
  new Point(-150, -200),
  new Point(150, 200),
  new Point(50, 0),
);
const b3b = new PathBezier3(
  new Point(0, 100),
  new Point(100 * Bezier3.K, 100),
  new Point(100, 100 * (Bezier3.K)),
  new Point(100, 0),
);

const dpLn1 = ls1.duplicateTo(20, "left"),
      dpLn2 = ls1.duplicateTo(30, "right"),
      dpLn3 = ls1.duplicateTo(15, "in"),
      dpLn4 = ls1.duplicateTo(10, "out");

console.log(ls1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpLn1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpLn2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpLn3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpLn4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpPln1 = pln1!.duplicateTo(10, "left");
const dpPln2 = pln1!.duplicateTo(10, "right");
const dpPln3 = pln1!.duplicateTo(20, "in");
const dpPln4 = pln1!.duplicateTo(20, "out");

console.log(pln1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpPln1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPln2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPln3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPln4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpPlg1 = plg1.duplicateTo(10, "left");
const dpPlg2 = plg1.duplicateTo(10, "right");
const dpPlg3 = plg1.duplicateTo(20, "in");
const dpPlg4 = plg1.duplicateTo(20, "out");

console.log(plg1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpPlg1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPlg2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPlg3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpPlg4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

console.log(plg2?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(plg2.duplicateTo(10, "left")?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(plg2.duplicateTo(10, "right")?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(plg2.duplicateTo(20, "in")?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(plg2.duplicateTo(20, "out")?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpTri1 = tri1.duplicateTo(4, "left");
const dpTri2 = tri1.duplicateTo(4, "right");
const dpTri3 = tri1.duplicateTo(8, "in");
const dpTri4 = tri1.duplicateTo(8, "out");

console.log(tri1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpTri1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpTri2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpTri3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpTri4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpRect1 = rect1.duplicateTo(10, "left");
const dpRect2 = rect1.duplicateTo(10, "right");
const dpRect3 = rect1.duplicateTo(20, "in");
const dpRect4 = rect1.duplicateTo(20, "out");

console.log(rect1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpRect1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRect2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRect3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRect4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpCirc1 = circ1.duplicateTo(10, "left");
const dpCirc2 = circ1.duplicateTo(10, "right");
const dpCirc3 = circ1.duplicateTo(20, "in");
const dpCirc4 = circ1.duplicateTo(20, "out");

console.log(circ1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpCirc1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpCirc2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpCirc3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpCirc4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpEll1 = ell1.duplicateTo(10, "left");
const dpEll2 = ell1.duplicateTo(10, "right");
const dpEll3 = ell1.duplicateTo(20, "in");
const dpEll4 = ell1.duplicateTo(20, "out");

console.log(ell1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpEll1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpEll2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpEll3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpEll4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpRing1 = ring1.duplicateTo(10, "left");
const dpRing2 = ring1.duplicateTo(10, "right");
const dpRing3 = ring1.duplicateTo(12, "in");
const dpRing4 = ring1.duplicateTo(12, "out");

console.log(ring1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpRing1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRing2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRing3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpRing4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpb2_1 = b2.duplicateTo(10, "left");
const dpb2_2 = b2.duplicateTo(10, "right");
const dpb2_3 = b2.duplicateTo(20, "in");
const dpb2_4 = b2.duplicateTo(20, "out");

console.log(b2?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpb2_1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb2_2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb2_3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb2_4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

const dpb3_1 = b3.duplicateTo(2, "left");
const dpb3_2 = b3.duplicateTo(4, "right");
const dpb3_3 = b3.duplicateTo(8, "in");
const dpb3_4 = b3.duplicateTo(5.15, "out");

const dp3a = b3.auxModel.duplicateTo(12, "left");
const dp3b = b3.auxModel.duplicateTo(12, "right");
if (dp3a && dp3b) {
  const dp3abTest = new PathSegmentedPath();
  let arrA = (Array.isArray(dp3a) ? dp3a : [dp3a]).map(x => PathBezier3.fromBezier3(x));
  let arrB = (Array.isArray(dp3b) ? dp3b : [dp3b]).map(x => PathBezier3.fromBezier3(x).reverse()!);
  arrB = arrB.reverse();
  dp3abTest.addSeg(...arrA);
  dp3abTest.addSeg(PathLine.fromEnds(arrA[arrA.length - 1].pEnd, arrB[0].pStart));
  dp3abTest.addSeg(...arrB);
  dp3abTest.closePath();
  console.log(dp3abTest.buildHtmlFull({color: "yellow", width: 1}, {color: "grey", opacity: 0.3}));
}

const dpb3a_1 = b3a.duplicateTo(4, "left");
const dpb3a_2 = b3a.duplicateTo(4, "right");
const dpb3a_3 = b3a.duplicateTo(8, "in");
const dpb3a_4 = b3a.duplicateTo(8, "out");

const ptFill: IFillConfig = {color: "yellow"};
const ptFill2: IFillConfig = {color: "orange", opacity: 0.3};

const buildCircleOfMinRadius = (r: IBezier3CurveRadius) => {
  if (r.r > 10000) {
    console.log(`Radius is too large, cannot draw anything!`);
    return undefined;
  }
  let pMinRTangentLine = b3.auxModel.getTangentLine(r.t),
      normalAng = r.dAng >= 0 ? AngDeg.DEG90 : AngDeg.DEG270,
      pMinRNormalLine = new Line(pMinRTangentLine!.anchor, pMinRTangentLine!.ang + normalAng),
      pMinRCircCenter = pMinRNormalLine.getPointByLen(r.r);
  // console.log(`Min R: ${r.r}, dAng: ${r.dAng}, t: ${r.t}`);
  console.log(new PathCircle(pMinRCircCenter!.x, pMinRCircCenter!.y, r.r).buildHtmlFull({color: "red", width: 0.2}, ptFill2));
}

let minR = b3.auxModel.getMinCurveRadius().map(x => buildCircleOfMinRadius(x));

// console.log(`Curve Radius: `, minR);
// console.log(`Radius at 0: `, b3.auxBezier.getCurveRadius(0));
// console.log(`Radius at 0.5: `, b3.auxBezier.getCurveRadius(1/2));
// console.log(`Radius at 1: `, b3.auxBezier.getCurveRadius(1));

const b3TL_1_00 = b3.auxModel.getTangentLine(0)?.getNormalLine().getPointByLen(10);
const b3TL_1_25 = b3.auxModel.getTangentLine(1/4)?.getNormalLine().getPointByLen(10);
const b3TL_1_50 = b3.auxModel.getTangentLine(2/4)?.getNormalLine().getPointByLen(10);
const b3TL_1_75 = b3.auxModel.getTangentLine(3/4)?.getNormalLine().getPointByLen(10);
const b3TL_1_10 = b3.auxModel.getTangentLine(1)?.getNormalLine().getPointByLen(10);
const b3TL_2_00 = b3.auxModel.getTangentLine(0)?.getNormalLine().getPointByLen(-10);
const b3TL_2_25 = b3.auxModel.getTangentLine(1/4)?.getNormalLine().getPointByLen(-10);
const b3TL_2_50 = b3.auxModel.getTangentLine(2/4)?.getNormalLine().getPointByLen(-10);
const b3TL_2_75 = b3.auxModel.getTangentLine(3/4)?.getNormalLine().getPointByLen(-10);
const b3TL_2_10 = b3.auxModel.getTangentLine(1)?.getNormalLine().getPointByLen(-10);
const b3TL_3_00 = b3.auxModel.getTangentLine(0)?.getNormalLine().getPointByLen(20);
const b3TL_3_25 = b3.auxModel.getTangentLine(1/4)?.getNormalLine().getPointByLen(20);
const b3TL_3_50 = b3.auxModel.getTangentLine(2/4)?.getNormalLine().getPointByLen(20);
const b3TL_3_75 = b3.auxModel.getTangentLine(3/4)?.getNormalLine().getPointByLen(20);
const b3TL_3_10 = b3.auxModel.getTangentLine(1)?.getNormalLine().getPointByLen(20);
const b3TL_4_00 = b3.auxModel.getTangentLine(0)?.getNormalLine().getPointByLen(-20);
const b3TL_4_25 = b3.auxModel.getTangentLine(1/4)?.getNormalLine().getPointByLen(-20);
const b3TL_4_50 = b3.auxModel.getTangentLine(2/4)?.getNormalLine().getPointByLen(-20);
const b3TL_4_75 = b3.auxModel.getTangentLine(3/4)?.getNormalLine().getPointByLen(-20);
const b3TL_4_10 = b3.auxModel.getTangentLine(1)?.getNormalLine().getPointByLen(-20);

console.log(new PathCircle(b3TL_1_00!.x, b3TL_1_00!.y, 2).buildHtmlFull(undefined, ptFill));
console.log(new PathCircle(b3TL_1_25!.x, b3TL_1_25!.y, 2).buildHtmlFull(undefined, ptFill));
console.log(new PathCircle(b3TL_1_50!.x, b3TL_1_50!.y, 2).buildHtmlFull(undefined, ptFill));
console.log(new PathCircle(b3TL_1_75!.x, b3TL_1_75!.y, 2).buildHtmlFull(undefined, ptFill));
console.log(new PathCircle(b3TL_1_10!.x, b3TL_1_10!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_2_00!.x, b3TL_2_00!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_2_25!.x, b3TL_2_25!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_2_50!.x, b3TL_2_50!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_2_75!.x, b3TL_2_75!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_2_10!.x, b3TL_2_10!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_3_00!.x, b3TL_3_00!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_3_25!.x, b3TL_3_25!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_3_50!.x, b3TL_3_50!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_3_75!.x, b3TL_3_75!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_3_10!.x, b3TL_3_10!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_4_00!.x, b3TL_4_00!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_4_25!.x, b3TL_4_25!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_4_50!.x, b3TL_4_50!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_4_75!.x, b3TL_4_75!.y, 2).buildHtmlFull(undefined, ptFill));
//console.log(new PathCircle(b3TL_4_10!.x, b3TL_4_10!.y, 2).buildHtmlFull(undefined, ptFill));

//const distToB3_1 = b3.auxBezier.minDistanceToPoint(new Point(-10, 12));


const pB3_1_25 = b3.auxModel.getPoint(1/4),
      pB3_1_50 = b3.auxModel.getPoint(2/4),
      pB3_1_75 = b3.auxModel.getPoint(3/4);
      // pB3_c1_25 = (dpb3_1 as PathBezier3).auxBezier.getPoint(1/4),
      // pB3_c1_50 = (dpb3_1 as PathBezier3).auxBezier.getPoint(2/4),
      // pB3_c1_75 = (dpb3_1 as PathBezier3).auxBezier.getPoint(3/4),
      // pB3_c2_25 = (dpb3_2 as PathBezier3).auxBezier.getPoint(1/4),
      // pB3_c2_50 = (dpb3_2 as PathBezier3).auxBezier.getPoint(2/4),
      // pB3_c2_75 = (dpb3_2 as PathBezier3).auxBezier.getPoint(3/4),
      // pB3_c3_25 = (dpb3_3 as PathBezier3).auxBezier.getPoint(1/4),
      // pB3_c3_50 = (dpb3_3 as PathBezier3).auxBezier.getPoint(2/4),
      // pB3_c3_75 = (dpb3_3 as PathBezier3).auxBezier.getPoint(3/4),
      // pB3_c4_25 = (dpb3_4 as PathBezier3).auxBezier.getPoint(1/4),
      // pB3_c4_50 = (dpb3_4 as PathBezier3).auxBezier.getPoint(2/4),
      // pB3_c4_75 = (dpb3_4 as PathBezier3).auxBezier.getPoint(3/4);
//console.log(new PathCircle(-10, 12, distToB3_1).buildHtmlFull({color: "yellow", width: 1}, undefined));
// console.log(new PathCircle(pB3_c1_25!.x, pB3_c1_25!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c1_50!.x, pB3_c1_50!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c1_75!.x, pB3_c1_75!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c2_25!.x, pB3_c2_25!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c2_50!.x, pB3_c2_50!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c2_75!.x, pB3_c2_75!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c3_25!.x, pB3_c3_25!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c3_50!.x, pB3_c3_50!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c3_75!.x, pB3_c3_75!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c4_25!.x, pB3_c4_25!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c4_50!.x, pB3_c4_50!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_c4_75!.x, pB3_c4_75!.y, 2).buildHtmlFull(undefined, ptFill));
// console.log(new PathCircle(pB3_1_25!.x, pB3_1_25!.y, 2).buildHtmlFull(undefined, ptFill2));
// console.log(new PathCircle(pB3_1_50!.x, pB3_1_50!.y, 2).buildHtmlFull(undefined, ptFill2));
// console.log(new PathCircle(pB3_1_75!.x, pB3_1_75!.y, 2).buildHtmlFull(undefined, ptFill2));
console.log("----- B3 --------")
console.log(b3?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpb3_1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3_2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3_3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3_4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

console.log("----- B3 A --------")
console.log(b3a?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpb3a_1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3a_2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3a_3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpb3a_4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));

console.log("----- ARC --------")
const dpArc1 = arc1.duplicateTo(10, "left");
const dpArc2 = arc1.duplicateTo(10, "right");
const dpArc3 = arc1.duplicateTo(20, "in");
const dpArc4 = arc1.duplicateTo(20, "out");

console.log(arc1?.buildHtmlFull({color: "black", width: 2}, {color: "none"}));
console.log(dpArc1?.buildHtmlFull({color: "red", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpArc2?.buildHtmlFull({color: "blue", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpArc3?.buildHtmlFull({color: "aqua", width: 1}, {color: "grey", opacity: 0.3}));
console.log(dpArc4?.buildHtmlFull({color: "magenta", width: 1}, {color: "grey", opacity: 0.3}));


