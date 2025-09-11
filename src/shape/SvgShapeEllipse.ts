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


export class SvgShapeEllipse extends SvgShapeGeneric {
  
  public rx: number;
  public ry: number;

  constructor(rx: number, ry: number) {
    super();

    this.rx = Math.abs(rx);
    this.ry = Math.abs(ry);
    this.bbox = new SvgBBox(-rx, -ry, 2 * rx, 2 * ry);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    this.paths = [
      new PathEllipse(0, 0, this.rx, this.ry, 0)
    ];
  }

}


