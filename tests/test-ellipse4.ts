

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";

const theta = Ellipse.getThetaByVectorAngle(40, 30, AngDeg.DEG30);
console.log(`Theta is ${AngDeg.ang2Deg(theta).toFixed(2)}`);
const ang = Ellipse.getVectorAngleByTheta(40, 30, theta);
console.log(`Vector angle is ${AngDeg.ang2Deg(ang).toFixed(2)}`);
const tanAng = Ellipse.getTangentAngleByTheta(40, 30, theta);
console.log(`Tangent Angle is ${AngDeg.ang2Deg(tanAng).toFixed(2)}`)
const ang2 = Ellipse.getThetaByTangentAngle(40, 30, tanAng);
console.log(`Theta of Tan is ${AngDeg.ang2Deg(ang2).toFixed(2)}`);

const ell1 = new Ellipse(30, 20, 40, 20, AngDeg.deg2Ang(40));
const p1 = new Point(-20, 5);

const tgLines = ell1.getTangentLineWithPoint(p1);
// console.log(tgLines);

if (tgLines && tgLines.length > 0) {
  const lines = tgLines.map(l => l.buildSeg(-60, 60))
    .map(ls => `<path d="M${ls.pStart.x},${ls.pStart.y} L${ls.pEnd.x},${ls.pEnd.y}" stroke="blue" stroke-width="0.5" fill="none" />`)
    .join('\n');
  console.log(lines);
}

const circle1 = new Ellipse(40, 50, 30, 30, 40);

const cLines = circle1.getTangentLineWithPoint(p1);

if (cLines && cLines.length > 0) {
  console.log(
    cLines.map(l => l.buildSeg(-60, 100))
    .map(ls => `<path d="M${ls.pStart.x},${ls.pStart.y} L${ls.pEnd.x},${ls.pEnd.y}" stroke="aqua" stroke-width="0.5" fill="none" />`)
    .join('\n')
  );
}

const circle2 = new Ellipse(20, 0, 20, 12, 0);
const p2 = new Point(40,0);
const p3 = new Point(20 + 20 * Math.cos(1), 0 + 12 * Math.sin(1));
// console.log(circle2.getTangentLineWithPoint(p2));
const tgL = circle2.getTangentLineWithPoint(p3);
if (tgL && tgL.length > 0) {    
  console.log(
    tgL.map(l => l.buildSeg(-60, 40))
      .map(ls => `<path d="M${ls.pStart.x},${ls.pStart.y} L${ls.pEnd.x},${ls.pEnd.y}" stroke="aqua" stroke-width="0.5" fill="none" />`)
      .join('\n')
  );
}

