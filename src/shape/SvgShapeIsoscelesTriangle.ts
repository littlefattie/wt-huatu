/**
 * The class implementation of SVG Line.
 */

import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgShape,
  ISvgPath,
  ISvgPoint
} from "../svg/ISvg.js";

import { PathRect } from "../path/PathRect.js";
import { PathPolygon } from "../path/PathPolygon.js";
import { PathTriangle } from "../path/PathTriangle.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgCsts } from "../svg/SvgConstants.js";

import { SvgShapeGeneric } from "./SvgShapeGeneric.js";


export class SvgShapeIsoscelesTriangle extends SvgShapeGeneric {

  constructor(width: number, height: number, direction: "up" | "right" | "down" | "left") {
    super();

    const w = Math.abs(width);
    const h = Math.abs(height);
    const angHalf = Math.atan(w/2/h);
    const rIn = h / (1 + 1 / Math.sin(angHalf));

    this.bbox = new SvgBBox(-w / 2, -h + rIn, w, h);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    
    let pTop: SvgPoint;
    let pLeft: SvgPoint;
    let pRight: SvgPoint;
    if (direction === "left"){
      pTop = new SvgPoint(-h + rIn, 0);
      pLeft = new SvgPoint(rIn, w / 2);
      pRight = new SvgPoint(rIn, -w / 2);
    } else if (direction === "down") {
      pTop = new SvgPoint(0, h - rIn);
      pLeft = new SvgPoint(-w / 2, -rIn);
      pRight = new SvgPoint(w / 2, -rIn);
    } else if (direction === "right") {
      pTop = new SvgPoint(h - rIn, 0);
      pLeft = new SvgPoint(-rIn, w / 2);
      pRight = new SvgPoint(-rIn, -w / 2);
    } else {
      pTop = new SvgPoint(0, -h + rIn);
      pLeft = new SvgPoint(-w / 2, rIn);
      pRight = new SvgPoint(w / 2, rIn);
    }
    this.paths = [
      PathTriangle.fromPoints(pLeft, pTop, pRight)
    ];
  }

}
