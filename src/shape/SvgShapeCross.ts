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
import { PathLine } from "../path/PathLine.js";
import { PathRect } from "../path/PathRect.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgShapeGeneric } from "./SvgShapeGeneric.js";
import { SvgCsts } from "../svg/SvgConstants.js";


export class SvgShapePlus extends SvgShapeGeneric {
  
  constructor(width: number) {
    super();

    const w = Math.abs(width);
    this.bbox = new SvgBBox(-w / 2, -w / 2, w, w);
    this.hasStroke = true;
    this.stroke = {
      color: SvgCsts.CONTEXT_STROKE,
      width: SvgShapeGeneric.STROKE_WIDTH_DEFAULT,
    }
    this.hasFill = false;
    this.primaryColor = "stroke";
    this.paths = [
      new PathLine(-w/2, 0, w/2, 0),
      new PathLine(0, -w/2, 0, w/2)
    ];
  }
}


export class SvgShapeCross extends SvgShapeGeneric {
  
  constructor(width: number) {
    super();

    const w = Math.abs(width);
    this.bbox = new SvgBBox(-w / 2, -w / 2, w, w);
    this.hasStroke = true;
    this.stroke = {
      color: SvgCsts.CONTEXT_STROKE,
      width: SvgShapeGeneric.STROKE_WIDTH_DEFAULT,
    }
    this.primaryColor = "stroke";
    this.hasFill = false;
    this.paths = [
      new PathLine(-w/2, -w/2, w/2, w/2),
      new PathLine(w/2, -w/2, -w/2, w/2)
    ];
  }

}


