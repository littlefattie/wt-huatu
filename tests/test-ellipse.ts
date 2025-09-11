

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";


const p = new Point(30, 40);
console.log(p.rotate(AngDeg.deg2Ang(30)));

const ell1 = Ellipse.calcEllipseByTwoPoints(
  new Point(3 * Math.cos(AngDeg.DEG30), 3 * Math.sin(AngDeg.DEG30)),
  new Point(3 * Math.cos(AngDeg.DEG30), -3 * Math.sin(AngDeg.DEG30)),
  3,
  3,
  false, false, 0
);

// console.log(ell1);

const ell2 = Ellipse.calcEllipseByTwoPoints(
  new Point(3 * Math.cos(AngDeg.DEG30), 3 * Math.sin(AngDeg.DEG30)),
  new Point(3 * Math.cos(AngDeg.DEG30), -3 * Math.sin(AngDeg.DEG30)),
  3,
  3,
  true, false, 0
);

// console.log(ell2);

const ell3 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(40, 0),
  30,
  60,
  true, false, 0
);


console.log(`CX: ${ell3!.cx}, CY: ${ell3!.cy}`);

const ell4 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(40, 0),
  30,
  60,
  false, false, 0
);

console.log(`CX: ${ell4!.cx}, CY: ${ell4!.cy}`);

const ell5 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(40, 0),
  30,
  60,
  true, false, 30
);

console.log(`CX: ${ell5!.cx}, CY: ${ell5!.cy}`);

const ell6 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(40, 0),
  30,
  60,
  false, false, 30
);

console.log(`CX: ${ell6!.cx}, CY: ${ell6!.cy}`);

const ell7 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(40, 0),
  30,
  60,
  false, false, -30
);

console.log(`CX: ${ell7!.cx}, CY: ${ell7!.cy}`);


const ell8 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(0, 60),
  60,
  40,
  false, false, 0
);

console.log(`CX: ${ell8!.cx}, CY: ${ell8!.cy}`);

const ell9 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 60),
  new Point(0, 30),
  60,
  40,
  false, false, 0
);

console.log(`CX: ${ell9!.cx}, CY: ${ell9!.cy}`);

const ell10 = Ellipse.calcEllipseByTwoPoints(
  new Point(0, 30),
  new Point(0, 60),
  60,
  40,
  false, true, 0
);

console.log(`CX: ${ell10!.cx}, CY: ${ell10!.cy}`);

const ell11 = Ellipse.calcEllipseByTwoPoints(
  new Point(20, 0),
  new Point(60, 0),
  60,
  40,
  false, false, 0
);

console.log(`CX: ${ell11!.cx}, CY: ${ell11!.cy}`);

const ell12 = Ellipse.calcEllipseByTwoPoints(
  new Point(20, 0),
  new Point(60, 0),
  60,
  40,
  false, false, 40
);

console.log(`CX: ${ell12!.cx}, CY: ${ell12!.cy}`);

const ell13 = Ellipse.calcEllipseByTwoPoints(
  new Point(20, 0),
  new Point(60, 0),
  20 + WtMath.EPSILON,
  15,
  false, false, 0
);

console.log(ell13);
