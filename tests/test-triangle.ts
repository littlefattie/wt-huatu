import Point from "../src/geometry/Point.js";
import Triangle from "../src/geometry/Triangle.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import { AngDeg } from "../src/geometry/AngDeg.js";


const tri = new Triangle(
  new Point(0, 4),
  new Point(0, 0),
  new Point(3, 0),
)

console.log(tri);

const ang = new Angle(
  new Point(0, 1.7320508075688772),
  new Point(-1, 0),
  new Point(1, 0)
)

console.log(ang);
console.log(ang.getArcPoints(0.3));

const ang2 = new Triangle(
  new Point(0, 1.7320508075688772),
  new Point(-1, 0),
  new Point(1, 0)
)

console.log(ang2);

console.log(Line.getXPoint(Line.LINE_YXp, Line.makeHLine(5)));

const l1 = new Line(new Point(0, 3), AngDeg.DEG135);
console.log(Line.getXPoint(Line.LINE_YXp, l1));
console.log(Line.getXPoint(l1, Line.LINE_YXm));

const tri2 = new Triangle(
  new Point(-4, 0),
  new Point(5, 0),
  new Point(8, 0),
);

console.log(tri2);

