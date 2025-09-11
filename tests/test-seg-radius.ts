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
import { SegmentModel } from "../src/geometry/SegmentModel.js";
import type { ISegmentJointRadiusResult, ISegmentModel } from "../src/geometry/IGeometry.js";

const b3a = new PathBezier3(
  new Point(-100, 0),
  new Point(20, -150),
  new Point(-20, 140),
  new Point(50,10)
);
// shapes:
//   b3a: b3; -100, 0; 20, -150; -20, 140; 50, 10;
//   b3b: b3; b3a.e; 70, 150; 140, -90; 220, 10;

const b3b = new PathBezier3(
  b3a.pEnd,
  new Point(70, 150),
  new Point(140, -90),
  new Point(220, 10),
);

const ln3 = PathLine.fromEnds(b3b.pEnd, new Point(150, 70));
const arcE1 = PathEllipticalArc.fromStartEndPoints(
  new Point(-40, 120),
  b3a.pStart,
  30, 20,
  false, false, 30
);

const ln4 = PathLine.fromEnds(
  new Point(arcE1.pStart.x, arcE1.pStart.y - 80),
  arcE1.pStart
);

const b2a = new PathBezier2(b3a.pStart, new Point(-90, 120), ln4.pStart);

const ln5 = PathLine.fromEnds(
  new Point(ln3.pEnd.x - 50, ln3.pEnd.y - 80),
  ln3.pEnd
)
const printArc = (arc: ISegmentJointRadiusResult, arcName: string, centerName: string, centerRadius: number) => {
  return `
  ${arcName}: arc; ${arc.pStart.x},${arc.pStart.y}; ${arc.rResolved}; ${arc.rResolved}; 0; ${arc.cw ? 'cw' : 'ccw'}; small; ${arc.pEnd.x},${arc.pEnd.y};
  ${centerName}: circ; ${arc.arcCenter?.x}, ${arc.arcCenter?.y}; ${centerRadius};`
}

const printArcDraw = (arcName: string, arcColor: string, centerName: string, centerColor: string) => {
  return `
  - ${arcName}; fill, none; stroke, 1, ${arcColor};
  - ${centerName}; fill, ${centerColor};`
}

const arcDefs: string[] = [];
const arcDraws: string[] = [];


const tryArc = (mdLeft: ISegmentModel, mdRight: ISegmentModel, r: number, id: string) => {
  const res = SegmentModel.fitRadius(mdLeft, mdRight, r);
  if (typeof res === "string") {
    console.error(res);
  } else {
    //console.log(`${id}:${r} -> Iter Count: ${res.iterCount} Done!`)
    let arcName = `arc${id}`,
        ctrName = `ctr${id}`;
    arcDefs.push(printArc(res,arcName, ctrName , r));
    arcDraws.push(printArcDraw(arcName, "red", ctrName, "aqua"));
    
  }
}

tryArc(b3a.auxModel, b3b.auxModel, 5, "b3ab5");
tryArc(b3a.auxModel, b3b.auxModel, 10, "b3ab10");
tryArc(b3a.auxModel, b3b.auxModel, 20, "b3ab20");
tryArc(b3a.auxModel, b3b.auxModel, 28, "b3ab28");

tryArc(b3b.auxModel, ln3.auxModel, 5, "b3aLn35");
tryArc(b3b.auxModel, ln3.auxModel, 10, "b3aLn310");
tryArc(b3b.auxModel, ln3.auxModel, 20, "b3aLn320");
tryArc(b3b.auxModel, ln3.auxModel, 28, "b3aLn328");

tryArc(arcE1.auxModel!, b3a.auxModel, 5, "arcE1b3a5");
tryArc(arcE1.auxModel!, b3a.auxModel, 10, "arcE1b3a10");
tryArc(arcE1.auxModel!, b3a.auxModel, 20, "arcE1b3a20");
tryArc(arcE1.auxModel!, b3a.auxModel, 28, "arcE1b3a28");

tryArc(ln4.auxModel, arcE1.auxModel!, 5,  "ln4ArcE15");
tryArc(ln4.auxModel, arcE1.auxModel!, 10, "ln4ArcE110");
tryArc(ln4.auxModel, arcE1.auxModel!, 20, "ln4ArcE120");
tryArc(ln4.auxModel, arcE1.auxModel!, 28, "ln4ArcE128");

tryArc(b2a.auxModel, ln4.auxModel, 5,  "b2aLn45");
tryArc(b2a.auxModel, ln4.auxModel, 10, "b2aLn410");
tryArc(b2a.auxModel, ln4.auxModel, 20, "b2aLn420");
tryArc(b2a.auxModel, ln4.auxModel, 28, "b2aLn428");

const b2aR = b2a.reverse()!.auxModel!;
tryArc(b2aR, b3a.auxModel, 5,  "b2aB3a5");
tryArc(b2aR, b3a.auxModel, 10, "b2aB3a10");
tryArc(b2aR, b3a.auxModel, 20, "b2aB3a20");
tryArc(b2aR, b3a.auxModel, 28, "b2aB3a28");

const ln3R = ln3.reverse()!.auxModel!;
tryArc(ln5.auxModel, ln3R, 5,  "ln5Ln3R5");
tryArc(ln5.auxModel, ln3R, 10, "ln5Ln3R10");
tryArc(ln5.auxModel, ln3R, 20, "ln5Ln3R20");
tryArc(ln5.auxModel, ln3R, 28, "ln5Ln3R28");

console.log(arcDefs.join(""));
console.log(arcDraws.join(""));
