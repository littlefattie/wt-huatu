

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";

const ell1 = new Ellipse(30, 20, 40, 20, AngDeg.deg2Ang(40));
const p1 = new Point(-20, 5);
const p2 = new Point(20, 5);

const tPoints = Ellipse.getTouchingPointsOfCircle(ell1, p1);

console.log(tPoints);

const touchPoints = Ellipse.getTouchingPointsOfCircle(ell1, p2);
console.log(touchPoints.map(p => `<circle cx="20" cy="5" r="${Math.sqrt((p.x - 20)**2 + (p.y - 5)**2).toFixed(6)}" fill="none" stroke-width="0.1" stroke="orange" />`).join("\n"))
console.log(touchPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="blue" />`).join("\n"));
