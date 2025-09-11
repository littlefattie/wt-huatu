

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse, { type IEllipseTouchingPoint } from "../src/geometry/Ellipse.js";

import fs from "fs"

// const f1 = (x: number, y: number) => x ** 2 + y** 2 - 1;
// const f2 = (x: number, y: number) => (x - 1) ** 2 + y**2 -1;
// const f1dx = (x: number, y: number) => 2 * x;
// const f1dy = (x: number, y: number) => 2 * y;
// const f2dx = (x: number, y: number) => 2 * (x - 1);
// const f2dy = (x: number, y: number) => 2 * y;

// const cres = WtMath.newtonMethodSolveXY(f1, f1dx, f1dy, f2, f2dx, f2dy, 1, 1, 200000);
// console.log(cres);

const ell1 = new Ellipse(0, 0, 20, 40, 0);

const ell2 = new Ellipse(46, 0, 20, 30, AngDeg.deg2Ang(40));

const printSvgExampleToSvgFile = (ell1: Ellipse, ell2: Ellipse,  results: IEllipseTouchingPoint[], fileName: string) => {
  const touchingEllipse = results.map(r => {
    return `<ellipse rx="${ell2.rx}" ry="${ell2.ry}" stroke="lime" stroke-width="0.1" fill="none" transform="translate(${ell2.cx},${ell2.cy}),rotate(${AngDeg.ang2Deg(r.rot)})" />
  <circle cx="${r.point.x}" cy="${r.point.y}" r="0.4" fill="red" />`;
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="-100 -100 500 500">
  <ellipse rx="${ell1.rx}" ry="${ell1.ry}" stroke="red" stroke-width="0.1" fill="none" transform="translate(${ell1.cx},${ell1.cy}),rotate(${AngDeg.ang2Deg(ell1.rot)})" />
  ${touchingEllipse.join("\n  ")}
  <circle cx="${ell1.cx}" cy="${ell1.cy}" r="3" fill="red" />
  <circle cx="${ell2.cx}" cy="${ell2.cy}" r="3" fill="lime" />
</svg>
  `;
  const tarDir = process.cwd() + '/temp/';
  const fName = `${tarDir}${fileName} - ${(new Date()).getTime()}.svg`;
  fs.writeFileSync(fName, svg, {encoding: 'utf-8'});
  console.log(`SVG Written to ${fName}`);
};

let res = Ellipse.getRotateAngleOnTouch(ell1, ell2);
// console.log(res.map(r => ang2ObjPrint(r)));

printSvgExampleToSvgFile(ell1, ell2, res, "test1");


ell1.rot = AngDeg.deg2Ang(30);
res = Ellipse.getRotateAngleOnTouch(ell1, ell2);

printSvgExampleToSvgFile(ell1, ell2, res, "test2");



ell1.rot = AngDeg.deg2Ang(0);
ell1.rx = 20;
ell1.ry = 30;
ell2.cy += 30;
ell2.ry = 100
res = Ellipse.getRotateAngleOnTouch(ell1,ell2);
// console.log(res.map(r => ang2ObjPrint(r)));
printSvgExampleToSvgFile(ell1, ell2, res, "test3");
printSvgExampleToSvgFile(ell1, ell2, Ellipse.getRotateAngleOnTouch(ell1,ell2, true), "test3-ex");


ell1.rot = AngDeg.deg2Ang(40);
ell1.rx = 20;
ell1.ry = 40;
ell2.cx += 40;
ell2.cy += 20;
res = Ellipse.getRotateAngleOnTouch(ell1,ell2);
// console.log(res.map(r => ang2ObjPrint(r)));
printSvgExampleToSvgFile(ell1, ell2, res, "test4");


ell1.cx += 10;
ell2.cy -= 20;
res = Ellipse.getRotateAngleOnTouch(ell1,ell2, true);
// console.log(res.map(r => ang2ObjPrint(r)));
printSvgExampleToSvgFile(ell1, ell2, res, "test5-ex");

const ell3 = new Ellipse(0, 0, 50, 80, AngDeg.deg2Ang(20));
const ell4 = new Ellipse(-10, 20, 30, 52, AngDeg.deg2Ang(10));

printSvgExampleToSvgFile(ell3, ell4, Ellipse.getRotateAngleOnTouch(ell3, ell4), "test6");
printSvgExampleToSvgFile(ell3, ell4, Ellipse.getRotateAngleOnTouch(ell3, ell4, true), "test6-ex");

