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
import { PathCircle } from "../path/PathCircle.js";
import { PathEllipse } from "../path/PathEllipse.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgShapeGeneric } from "./SvgShapeGeneric.js";
import { SvgCsts } from "../svg/SvgConstants.js";


export class SvgShapeCircle extends SvgShapeGeneric {

  public r: number;

  constructor(radius: number) {
    super();

    this.r = Math.abs(radius);
    this.bbox = new SvgBBox(-this.r, -this.r, 2 * this.r, 2 * this.r);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    this.paths = [
      new PathCircle(0, 0, this.r)
    ];
  }

}
