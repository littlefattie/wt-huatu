import { buildDotPattern, buildGridPattern, buildLinePattern, buildSquarePattern } from "../src/svg/SvgPattern.js";
import { 
  predefinedPatterns
} from "../src/presets/pattern.js";

// console.log(predefinedPatterns["slash1"]!.buildHtml());
// console.log(predefinedPatterns["slash2"]!.buildHtml());
// console.log(predefinedPatterns["slash3"]!.buildHtml());
// console.log(predefinedPatterns["slash4"]!.buildHtml());
// console.log(predefinedPatterns["slash5"]!.buildHtml());

const ptn1 = buildLinePattern("lnPtn1", 1, 0, 4, "solid", 0, "grey", "yellow", 0.2);
const ptn2 = buildLinePattern("lnPtn2", 2, 30, 10, "solid", 0, "grey");
const ptn3 = buildLinePattern("lnPtn3", 3, 45, 10, "dashed", 5, "grey");
const ptn4 = buildLinePattern("lnPtn4", 5, 0, 10, "solid", 0, "aqua", "maroon", 0.4);
const ptn5 = buildLinePattern("lnPtn5", 6, 90, 10, "solid", 0, "grey");
console.log(ptn1.buildHtml());
console.log(ptn2.buildHtml());
console.log(ptn3.buildHtml());
console.log(ptn4.buildHtml());
console.log(ptn5.buildHtml());

const ptnDot1 = buildLinePattern("ptnDot1", 2, 40, 20, "dotted", 2, "grey", "yellow", 0.2);
const ptnDot2 = buildLinePattern("ptnDot2", 3, 30, 2, "dotted", 5, "grey");
const ptnDot3 = buildLinePattern("ptnDot3", 4, 40, 2, "dotted", 5, "blue");
const ptnDot4 = buildLinePattern("ptnDot4", 7, -70, 2, "dotted", 10, "maroon");
const ptnDot5 = buildLinePattern("ptnDot4", 10, 90, 2, "dotted", 10, "lime");

console.log(ptnDot1.buildHtml());
console.log(ptnDot2.buildHtml());
console.log(ptnDot3.buildHtml());
console.log(ptnDot4.buildHtml());
console.log(ptnDot5.buildHtml());

const ptnDash1 = buildLinePattern("ptnDash1", 30, -40, 20, "dashed", 70, "grey", "yellow", 0.2);
const ptnDash2 = buildLinePattern("ptnDash2", 20, 90, 10, "dashed", 90, "lime");
const ptnDash3 = buildLinePattern("ptnDash3", 1, 45, 4, "dashed", 10, "aqua");

console.log(ptnDash1.buildHtml());
console.log(ptnDash2.buildHtml());
console.log(ptnDash3.buildHtml());

const ptnDots1 = buildDotPattern("ptnDots1", 30, 2, "red");
const ptnDots2 = buildDotPattern("ptnDots2", 20, 62, "blue");
const ptnDots3 = buildDotPattern("ptnDots3", 20, 42, "yellow");
const ptnDots4 = buildDotPattern("ptnDots4", 50, 15, "maroon");
const ptnDots5 = buildDotPattern("ptnDots5", 100, 20, "white");
const ptnDots6 = buildDotPattern("ptnDots6", 1, 2, "white");

console.log(ptnDots1.buildHtml());
console.log(ptnDots2.buildHtml());
console.log(ptnDots3.buildHtml());
console.log(ptnDots4.buildHtml());
console.log(ptnDots5.buildHtml());
console.log(ptnDots6.buildHtml());

const ptnSqr1 = buildSquarePattern("ptnSqr1", 30, 2, "red");
const ptnSqr2 = buildSquarePattern("ptnSqr2", 20, 62, "blue");
const ptnSqr3 = buildSquarePattern("ptnSqr3", 30, 20, "yellow");
const ptnSqr4 = buildSquarePattern("ptnSqr4", 50, 15, "maroon");
const ptnSqr5 = buildSquarePattern("ptnSqr5", 100, 20, "white");

console.log(ptnSqr1.buildHtml());
console.log(ptnSqr2.buildHtml());
console.log(ptnSqr3.buildHtml());
console.log(ptnSqr4.buildHtml());
console.log(ptnSqr5.buildHtml());

const ptnGrd1 = buildGridPattern("ptnGrd1", 1, 1, "white");
const ptnGrd2 = buildGridPattern("ptnGrd2", 20, 8, "lime");
const ptnGrd3 = buildGridPattern("ptnGrd3", 50, 43, "red");
const ptnGrd4 = buildGridPattern("ptnGrd4", 7, 1, "yellow");
const ptnGrd5 = buildGridPattern("ptnGrd5", 9, 1, "aqua", "grey");
const ptnGrd6 = buildGridPattern("ptnGrd6", 90, 1, "blue", "yellow", 0.3);

console.log(ptnGrd1.buildHtml());
console.log(ptnGrd2.buildHtml());
console.log(ptnGrd3.buildHtml());
console.log(ptnGrd4.buildHtml());
console.log(ptnGrd5.buildHtml());
console.log(ptnGrd6.buildHtml());
