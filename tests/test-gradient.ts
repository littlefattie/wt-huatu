import Point from "../src/geometry/Point.js";
import Triangle from "../src/geometry/Triangle.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import { AngDeg } from "../src/geometry/AngDeg.js";
import { SvgGradient } from "../src/svg/SvgGradient.js";
import { PathCircle } from "../src/path/PathCircle.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import { PathEllipticalArc } from "../src/path/PathEllipticalArc.js";
import Circle from "../src/geometry/Circle.js";


const grad1 = SvgGradient.newLinear("grad1");
grad1.addStop(5, "red");
grad1.addStop(45, "lime");
grad1.addStop(95, "blue");
grad1.addStop(70, "purple", 0.3);

console.log(grad1.buildHtml());

const grad2 = SvgGradient.newRadial("grad2", 50, 50, 50, 40, 40);
grad2.addStop(5, "red", 0.8);
grad2.addStop(45, "lime");
grad2.addStop(95, "blue", 0.6);
grad2.addStop(70, "purple", 0.3);
console.log(grad2.buildHtml());