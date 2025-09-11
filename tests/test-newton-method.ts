
import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

const circle1 = (x: number, y: number) => {
  return x ** 2 + y ** 2 - 1;
}

const circle2 = (x: number, y: number) => {
  return (x - 1) ** 2 + y ** 2 - 1;
}

const f1dx = (x: number, y: number) => {
  return 2 * x + y ** 2;
}

const f1dy = (x: number, y: number) => {
  return x ** 2 + 2 * y;
}

const f2dx = (x: number, y: number) => {
  return 2 * (x - 1) + y ** 2;
}

const f2dy = (x: number, y: number) => {
  return (x - 1) ** 2 + 2 * y;
}

console.log(WtMath.newtonMethodSolve2DUsingMinSquare(circle1, f1dx, f1dy, circle2, f2dx, f2dy, Math.sqrt(2), Math.sqrt(2)));
// console.log(WtMath.newtonMethodSolve2D(circle1, f1dx, f1dy, circle2, f2dx, f2dy, 0, 2));
console.log(WtMath.newtonMethodSolve2DUsingMinSquare(circle1, f1dx, f1dy, circle2, f2dx, f2dy, 0, -2));
console.log(WtMath.newtonMethodSolve2DUsingMinSquare(circle1, f1dx, f1dy, circle2, f2dx, f2dy, 1, 1.1));
// console.log(WtMath.newtonMethodSolve2D(circle1, f1dx, f1dy, circle2, f2dx, f2dy, 0, 0.2));
console.log(WtMath.newtonMethodSolve2DUsingAbs(circle1, f1dx, f1dy, circle2, f2dx, f2dy,5, 0.2));
console.log(WtMath.newtonMethodSolve2DUsingMinSquare(circle1, f1dx, f1dy, circle2, f2dx, f2dy,1, 0.2));
