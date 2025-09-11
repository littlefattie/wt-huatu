

import { WtMath } from "../src/math/WtMath.js";
import { AngDeg } from "../src/geometry/AngDeg.js";

import Point from "../src/geometry/Point.js";
import Angle from "../src/geometry/Angle.js";
import Line from "../src/geometry/Line.js";
import Polygon from "../src/geometry/Polygon.js";
import Ellipse from "../src/geometry/Ellipse.js";

const ell1 = new Ellipse(40, 0, 20, 15, 0);
const ell2 = new Ellipse(20, 0, 20, 12, 0);
// const xPoints = Ellipse.getXPoints(ell1, ell2);
// console.log(xPoints);

const ell3 = new Ellipse(40, 12, 20, 15, 0);
// console.log(Ellipse.getXPoints(ell3, ell2));


const ell4 = new Ellipse(12, 0, 20, 32, AngDeg.deg2Ang(40));
// console.log(Ellipse.getXPoints(ell2, ell4)
//   ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="green" />`).join("\n"));
// console.log(Ellipse.getXPoints(ell4, ell2)
//   ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="green" />`).join("\n")
// );
// console.log(`<ellipse rx="${ell1.rx}" ry="${ell1.ry}" stroke-width="1" stroke="yellow" transform="translate(${ell1.cx},${ell1.cy}) rotate(40)" fill="none" />`)

const ell5 = new Ellipse(0, 0, 40, 20, 0);
const ell6 = new Ellipse(60, 0, 20, 40, 0);
const ell7 = new Ellipse(100, 0, 20, 40, 0);
console.log(Ellipse.getXPoints(ell5, ell6)
  ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="red" />`).join("\n")
);

console.log(Ellipse.getXPoints(ell6, ell5)
  ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="green" />`).join("\n")
);

console.log(Ellipse.getXPoints(ell6, ell7)
  ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="blue" />`).join("\n")
);


console.log(Ellipse.getXPoints(ell7, ell6)
  ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="yellow" />`).join("\n")
);


const ell9 = new Ellipse(60, 10, 20, 40, AngDeg.deg2Ang(-40));
const ell8 = new Ellipse(100, -10, 20, 40, AngDeg.deg2Ang(45));

console.log(Ellipse.getXPoints(ell8, ell9)
  ?.map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="aqua" />`).join("\n")
);

// Test if the two ellipse are identical
const ell10 = new Ellipse(0, 0, 20, 40, 0);
const ell11 = new Ellipse(0, 0, 40, 20, AngDeg.deg2Ang(90));
const ell12 = new Ellipse(0, 0, 20, 40, 0);
const ell13 = new Ellipse(0, 0.1, 20, 40, 0);

console.log(Ellipse.getXPoints(ell10, ell11));
console.log(Ellipse.getXPoints(ell10, ell12));
console.log(Ellipse.getXPoints(ell10, ell13)
  .map(p => `<circle cx="${p.x}" cy="${p.y}" r="1" fill="aqua" />`).join("\n"));
