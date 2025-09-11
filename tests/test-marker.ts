
import { SvgMarker as mkr } from "../src/svg/SvgMarker.js";

const mkrCirc1 = mkr.buildMarkerCircle(3, "red", 0.6);
const mkrCirc2 = mkr.buildMarkerCircle(2, "red", 1, "blue", 0.4);
console.log(mkrCirc1.buildMarkerSvg("mkr-c1"));
console.log(mkrCirc2.buildMarkerSvg("mkr-c2"));
console.log(mkrCirc2.buildMarkerSvg("mkr-c2a", "yellow", "lime"));

const arrow1 = mkr.buildArrowHead("solid-angle", 3, 25);
console.log(arrow1.buildMarkerSvg("ah1"));

const arrow2 = mkr.buildArrowHead("solid-angle", 5, 30, undefined, true, false, "red");
console.log(arrow2.buildMarkerSvg("ah2"));

const arrow3 = mkr.buildArrowHead("solid-angle",5, 30, undefined, true, undefined, "green");
console.log(arrow3.buildMarkerSvg("ah3"));

const arrow4 = mkr.buildArrowHead("solid-two-angle",8, 24, 0.3, true, undefined, "lime");
console.log(arrow4.buildMarkerSvg("ah4"));
console.log(arrow4.buildMarkerSvg("ah4a", "blue"));
const arrow41 = mkr.buildArrowHead("solid-two-angle", 6, 36, 0.25, true, undefined, "aqua");
console.log(arrow41.buildMarkerSvg("ah4b"));
console.log(arrow41.buildMarkerSvg("ah4c", "black"));

const arrow5 = mkr.buildArrowHead("simple",5, 24, 0.3, true, true, "aqua");
console.log(arrow5.buildMarkerSvg("ah5"));
const arrow51 = mkr.buildArrowHead("simple",4, 40, 0, false, true, "aqua");
const arrow52 = mkr.buildArrowHead("simple",4, 40, 0, false, false, "yellow");
const arrow53 = mkr.buildArrowHead("simple",5, 40, 0, true, false, "pink");
console.log(arrow51.buildMarkerSvg("ah51"));
console.log(arrow51.buildMarkerSvg("ah51a", "", "lime"));
console.log(arrow52.buildMarkerSvg("ah52"));
console.log(arrow52.buildMarkerSvg("ah52a", undefined, "green"));
console.log(arrow53.buildMarkerSvg("ah53"));
console.log(arrow53.buildMarkerSvg("ah53a", undefined, "yellow"));

const arrowStd = mkr.preDefines["arrow1"];
console.log(arrowStd.buildMarkerSvg("ah-std", "yellow"));


const cross1  = mkr.buildMarkerCross(5, "blue", 0.2);
console.log(cross1.buildMarkerSvg("cross1"));


const cross2  = mkr.buildMarkerCross(4, "red", 0.1);
console.log(cross2.buildMarkerSvg("cross2"));

const plus1  = mkr.buildMarkerPlus(3, "red", 0.4);
const plus2  = mkr.buildMarkerPlus(3.2, "red", 0.6);
const plus3  = mkr.buildMarkerPlus(3.2, "red", 0.2);
console.log(plus1.buildMarkerSvg("plus1"));
console.log(plus2.buildMarkerSvg("plus2"));
console.log(plus3.buildMarkerSvg("plus3"));

const star1 = mkr.buildMarkerStar(5, 3, "red", 0.2);
const star2 = mkr.buildMarkerStar(6, 4, "red", 0.2);
const star3 = mkr.buildMarkerStar(7, 5, "red", 0.2);
const star4 = mkr.buildMarkerStar(8, 6, "red", 0.2);
const star5 = mkr.buildMarkerStar(9, 7, "red", 0.2);
const star6 = mkr.buildMarkerStar(10, 8, "red", 0.2);
console.log(star1.buildMarkerSvg("star1"));
console.log(star2.buildMarkerSvg("star2"));
console.log(star3.buildMarkerSvg("star3"));
console.log(star4.buildMarkerSvg("star4"));
console.log(star5.buildMarkerSvg("star5"));
console.log(star6.buildMarkerSvg("star6"));

const star51 = mkr.buildMarkerStar5(5,  true, "red");
const star52 = mkr.buildMarkerStar5(6,  false, "red", 1, "blue", 0.2);
console.log(star51.buildMarkerSvg("star51"));
console.log(star52.buildMarkerSvg("star52"));

const h1 = mkr.buildMarkerHeart(
  3, 6, 40,
  10, -1, -12, 7, 4,
  13, 15, 4,
  "red", 1,
  "blue", 0.3
);
console.log(h1.buildMarkerSvg("h1"));
console.log(h1.buildMarkerSvg("h1a", "yellow", "red"));

const su1 = mkr.buildMarkerStarUnified(2, 4, 5, -15, "red", 1, "yellow", 0.4);
const su2 = mkr.buildMarkerStarUnified(3, 4, 6,   0, "aqua", 0.6, "lime", 0.2);
const su3 = mkr.buildMarkerStarUnified(3, 2, 6,   0, "pink", 1, "blue", 0.3);
const su4 = mkr.buildMarkerStarUnified(3, 3, 6,  25, "aqua", 1, "red", 0.4);
const su5 = mkr.buildMarkerStarUnified(4, 3, 6,   0, "red", 1, "yellow", 0.4);
const su6 = mkr.buildMarkerStarUnified(5, 3, 6,   0, "red", 1, "yellow", 0.4);
const su6a = mkr.buildMarkerStarUnified(5, 3, 6,   0, "red", 1, "yellow", 0.4, 0.6);
const su7 = mkr.buildMarkerStarUnified(6, 2.88675134, 5, -15, "red", 0.6, "blue", 0.4);
const su7a = mkr.buildMarkerStarUnified(6, 2.88675134, 5, -15, "red", 0.6, "blue", 0.4, 0.3);
const su8 = mkr.buildMarkerStarUnified(7, 3.6, 5, -15, "red", 1, "yellow", 0.4);
const su9 = mkr.buildMarkerStarUnified(7, 3.6, 5, -15, "red", 1, "yellow", 0.4);
const suSaw = mkr.buildMarkerStarUnified(16, 5, 6, 10, "grey", 1, "blue", 0.2);
const suSun = mkr.buildMarkerStarUnified(14, 3.6, 6, 0, "red", 1, "yellow", 0.4);

console.log(su1.buildMarkerSvg("su1"));
console.log(su2.buildMarkerSvg("su2"));
console.log(su3.buildMarkerSvg("su3"));
console.log(su4.buildMarkerSvg("su4"));
console.log(su5.buildMarkerSvg("su5"));
console.log(su6.buildMarkerSvg("su6"));
console.log(su6a.buildMarkerSvg("su6a"));
console.log(su7.buildMarkerSvg("su7"));
console.log(su7a.buildMarkerSvg("su7a"));
console.log(su8.buildMarkerSvg("su8"));
console.log(su9.buildMarkerSvg("su9"));
console.log(suSaw.buildMarkerSvg("suSaw"));
console.log(suSun.buildMarkerSvg("suSun"));

const tri1 = mkr.buildMarkerIsoscelesTriangle(4, 8, "up", "green");
const tri2 = mkr.buildMarkerIsoscelesTriangle(4, 6, "right", "lime");
const tri3 = mkr.buildMarkerIsoscelesTriangle(4, 3, "down", "aqua");
const tri4 = mkr.buildMarkerIsoscelesTriangle(4, 10, "left", "pink");
const tri4a = mkr.buildMarkerIsoscelesTriangle(4, 10, "left", "pink", 0.8, "gold");
const tri4b = mkr.buildMarkerIsoscelesTriangle(4, 10, "left", "pink", 0.8, "gold", 0.4);
console.log(tri1.buildMarkerSvg("tri1", "red", "aqua"));
console.log(tri2.buildMarkerSvg("tri2"));
console.log(tri3.buildMarkerSvg("tri3", "blue"));
console.log(tri4.buildMarkerSvg("tri4", "red", "yellow"));
console.log(tri4a.buildMarkerSvg("tri4a", "red", "yellow"));
console.log(tri4a.buildMarkerSvg("tri4a1"));
console.log(tri4b.buildMarkerSvg("tri4b", "red", "yellow"));
console.log(tri4b.buildMarkerSvg("tri4b1"));


const plg1 = mkr.buildMarkerPolygon(5, 3, "lime", 0.4);
const plg2 = mkr.buildMarkerPolygon(5, 4, "aqua", 0.4, "red", 0.4);
const plg3 = mkr.buildMarkerPolygon(5, 5, "white", 0.4);
const plg4 = mkr.buildMarkerPolygon(5, 6, "yellow", 0.4, "red", 0.5);
const plg5 = mkr.buildMarkerPolygon(5, 7, "aqua", 0.4);
const plg6 = mkr.buildMarkerPolygon(5, 8, "white", 0.4, "red", 0.2);
const plg7 = mkr.buildMarkerPolygon(5, 9, "grey", 0.4);
const plg8 = mkr.buildMarkerPolygon(5, 10, "yellow", 0.4, "red", 0.6);
const plg9 = mkr.buildMarkerPolygon(5, 4, "pink", 0.4);
console.log(plg1.buildMarkerSvg("plg1"));
console.log(plg1.buildMarkerSvg("plg1a", "white", "blue"));
console.log(plg2.buildMarkerSvg("plg2"));
console.log(plg2.buildMarkerSvg("plg2a", "white", "blue"));
console.log(plg3.buildMarkerSvg("plg3"));
console.log(plg3.buildMarkerSvg("plg3a", "white", "blue"));
console.log(plg4.buildMarkerSvg("plg4"));
console.log(plg4.buildMarkerSvg("plg4a", "white", "blue"));
console.log(plg5.buildMarkerSvg("plg5"));
console.log(plg5.buildMarkerSvg("plg5a", "white", "blue"));
console.log(plg6.buildMarkerSvg("plg6"));
console.log(plg6.buildMarkerSvg("plg6a", "white", "blue"));
console.log(plg7.buildMarkerSvg("plg7"));
console.log(plg7.buildMarkerSvg("plg7a", "white", "blue"));
console.log(plg8.buildMarkerSvg("plg8"));
console.log(plg8.buildMarkerSvg("plg8a", "white", "blue"));
console.log(plg9.buildMarkerSvg("plg9"));
console.log(plg9.buildMarkerSvg("plg9a", "white", "blue"));


const rhb1 = mkr.buildMarkerRhombus(5, 5, "lime", 1, "yellow", 0.5);
const rhb2 = mkr.buildMarkerRhombus(5, 3, "red");
const rhb3 = mkr.buildMarkerRhombus(5, 8, "yellow");
const rhb4 = mkr.buildMarkerRhombus(8, 5, "aqua", 1, "lime", 0.2);
const rhb5 = mkr.buildMarkerRhombus(4, 8, "red");

console.log(rhb1.buildMarkerSvg("rhb1"));
console.log(rhb1.buildMarkerSvg("rhb1a", "yellow", "black"));
console.log(rhb2.buildMarkerSvg("rhb2"));
console.log(rhb2.buildMarkerSvg("rhb2a", "aqua", "green"));
console.log(rhb3.buildMarkerSvg("rhb3"));
console.log(rhb3.buildMarkerSvg("rhb3a", "brown", "lime"));
console.log(rhb4.buildMarkerSvg("rhb4"));
console.log(rhb4.buildMarkerSvg("rhb4a", "aqua", "pink"));
console.log(rhb5.buildMarkerSvg("rhb5"));
console.log(rhb5.buildMarkerSvg("rhb5a", "black", "green"));
