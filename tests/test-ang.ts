import Point from "../src/geometry/Point.js";
import Triangle from "../src/geometry/Triangle.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { SvgPoint } from "../src/svg/SvgPoint.js";

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

const arcPoints = ang.getArcPoints(0.6);
const arcPath =
  arcPoints.hasArc
  ? `<path d="M${SvgPoint.toCoors(ang.pA)} L${SvgPoint.toCoors(arcPoints.pStart)} L${SvgPoint.toCoors(arcPoints.pArcStart)} A${arcPoints.r} ${arcPoints.r} 0 0,${arcPoints.cw ? '1' : '0'} ${SvgPoint.toCoors(arcPoints.pArcEnd)} L${SvgPoint.toCoors(arcPoints.pEnd)} L${SvgPoint.toCoors(ang.pB)}" fill="none" stroke="yellow" stroke-width="0.1" />`
  : ``;
console.log(arcPath);
// console.log(ang);
// console.log(ang.getArcPoints(0.3));
