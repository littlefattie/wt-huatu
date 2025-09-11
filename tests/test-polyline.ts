import { SvgPoint } from "../src/svg/SvgPoint.js";
import { PathPolyline } from "../src/path/PathPolyline.js";

const kPi = (k: number) => k * Math.PI;

const sinePoints = [
  new SvgPoint(0, 0),
  new SvgPoint(kPi(0.5), 1),
  new SvgPoint(kPi(1.5), -1),
  new SvgPoint(kPi(2), -1),
  new SvgPoint(kPi(2), 1),
  new SvgPoint(kPi(2.5), 1),
  new SvgPoint(kPi(3.5) -1, -1),
  new SvgPoint(kPi(4), 0)
]

const sinePoints2 = [
  new SvgPoint(0, 0),
  new SvgPoint(kPi(0.5), 1),
  new SvgPoint(kPi(1.5), -1),
  new SvgPoint(kPi(2), -1),
  new SvgPoint(kPi(2)-0.1, 1),
  new SvgPoint(kPi(2.5)-0.5, 1),
  new SvgPoint(kPi(3.5) -1, -1),
  new SvgPoint(kPi(4), 0)
]
const pln1 = new PathPolyline(...sinePoints);
const pln2 = new PathPolyline(...sinePoints2);

console.log(pln1.toSmoothed().buildHtmlFull({color: "red", width: 0.02, lineJoin: "round"}));
console.log(pln1.toSmoothed(0.2).buildHtmlFull({color: "yellow", width: 0.02, lineJoin: "round"}));
console.log(pln1.toSmoothed(0.4).buildHtmlFull({color: "blue", width: 0.02, lineJoin: "round"}));
console.log(pln1.toSmoothed(0.2, "xy").buildHtmlFull({color: "yellow", width: 0.02, lineJoin: "round"}));
console.log(pln1.toSmoothed(0.4, "xy").buildHtmlFull({color: "blue", width: 0.02, lineJoin: "round"}));

console.log(pln2.toSmoothed().buildHtmlFull({color: "red", width: 0.02, lineJoin: "round"}));
console.log(pln2.toSmoothed(0.2).buildHtmlFull({color: "aqua", width: 0.02, lineJoin: "round"}));
console.log(pln2.toSmoothed(0.4).buildHtmlFull({color: "brown", width: 0.02, lineJoin: "round"}));
console.log(pln2.toSmoothed(0.2, "xy").buildHtmlFull({color: "aqua", width: 0.02, lineJoin: "round"}));
console.log(pln2.toSmoothed(0.8, "xy").buildHtmlFull({color: "brown", width: 0.02, lineJoin: "round"}));

