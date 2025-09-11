import { SvgPointSet } from "../src/svg/SvgPointSet.js";

const set1 = SvgPointSet.from([
  {x: 3, y: 4},
  {x: 4, y: -4},
  {x: 6, y: 24},
  {x: -3, y: -7},
]);

const set2 = SvgPointSet.from([
  {x: 1, y: 1},
  {x: 2, y: 2},
  {x: -2, y: -2},
  {x: -1, y: -1},
]);

console.log(SvgPointSet.zipTwo(set1, set2));
console.log(SvgPointSet.concatTwo(set1, set2));
console.log(set1.concat(set2));
console.log(set1);


