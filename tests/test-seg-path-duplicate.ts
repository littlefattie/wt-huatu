import Ellipse from "../src/geometry/Ellipse.js";
import Circle from "../src/geometry/Circle.js";
import Triangle from "../src/geometry/Triangle.js";
import Point from "../src/geometry/Point.js";
import { PathCircle } from "../src/path/PathCircle.js";
import { PathEllipse } from "../src/path/PathEllipse.js";
import { PathSegmentedPath } from "../src/path/PathSegmentedPath.js";
import { PathPolygon } from "../src/path/PathPolygon.js";
import { PathTriangle } from "../src/path/PathTriangle.js";

const cOut = new Circle(0,0, 100);
const c1 = new Circle(20, -20, 15),
      c2 = new Circle(40, 20, 15),
      c3 = new Circle(0, -60, 15),
      e1 = new Ellipse(-40, 0,16, 24, -30),
      tri1 = new Triangle(
        new Point(0, 30),
        new Point(15, 70),
        new Point(-20, 60),
      );

const segPath = new PathSegmentedPath();

segPath.addSeg(...PathCircle.fromCircle(cOut).toPathSegments(undefined, "cw"));
segPath.closePath();
segPath.addSeg(...PathCircle.fromCircle(c1).toPathSegments(undefined, "ccw"));
segPath.closePath();
segPath.addSeg(...PathCircle.fromCircle(c2).toPathSegments(undefined, "ccw"));
segPath.closePath();
segPath.addSeg(...PathCircle.fromCircle(c3).toPathSegments(undefined, "ccw"));
segPath.closePath();
segPath.addSeg(...PathEllipse.fromEllipse(e1).toPathSegments(undefined, "ccw"));
segPath.closePath();
segPath.addSeg(...PathTriangle.fromTriangle(tri1).toPathSegments(undefined, "ccw"));
segPath.closePath();

const dup1 = segPath.duplicateTo(5, "in");
const dup2 = segPath.duplicateTo(5, "out");

console.log(segPath.buildHtmlFull({
  color: "red",
  width: 1
},
{
  color: "white",
  opacity: 0.3
}));

if (dup1) {
  console.log(dup1.buildHtmlFull({
    color: "lime",
    width: 1
  },
  {
    color: "white",
    opacity: 0.3
  }));
}

if (dup2) {
  console.log(dup2.buildHtmlFull({
    color: "yellow",
    width: 1
  },
  {
    color: "white",
    opacity: 0.3
  }));
}
