

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";

const ell1 = new Ellipse(40, 0, 20, 15, AngDeg.deg2Ang(40));
// console.log(`<ellipse rx="${ell1.rx}" ry="${ell1.ry}" stroke-width="1" stroke="yellow" transform="translate(${ell1.cx},${ell1.cy}) rotate(40)" fill="none" />`)

const angles = [
  AngDeg.DEG0,
  AngDeg.DEG15,
  AngDeg.DEG45,
  AngDeg.DEG60,
  AngDeg.DEG90,
  AngDeg.DEG120,
  AngDeg.DEG150,
  AngDeg.DEG180,
  AngDeg.deg2Ang(212),
  AngDeg.DEG225,
  AngDeg.DEG270,
  AngDeg.DEG315,
  AngDeg.deg2Ang(345),
];

const tangentAngles = angles.map(a => Ellipse.getTangentAngleByTheta(ell1.rx, ell1.ry, a));
const angles2 = tangentAngles.map(a => Ellipse.getThetaByTangentAngle(ell1.rx, ell1.ry, a))
  .map(a => AngDeg.ang2Deg(a));

// console.log(angles.map(a => AngDeg.ang2Deg(a)));
// console.log(angles2);

const vectorDegs = angles
  .map(a => Ellipse.getVectorAngleByTheta(ell1.rx, ell1.ry, a))
  .map(a => AngDeg.ang2Deg(a));

// console.log(vectorDegs);

const lines = angles
  .map(a => {
    const line = ell1.getTangentLine(a);
    // console.log(line.deg.toFixed(3));
    return line;
  })
  .map(l => l.buildSeg(10))

const dots = lines.map(ls => `<circle cx="${ls.pStart.x}" cy="${ls.pStart.y}" r="1" fill="white" />`);
const tgLines = lines.map(ls => `<path d="M${ls.pStart.x},${ls.pStart.y} L${ls.pEnd.x},${ls.pEnd.y}" stroke="blue" stroke-width="0.5" fill="none" />`);

// console.log(dots.join("\n"));
console.log(tgLines.join("\n"));
