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

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgShapeGeneric } from "./SvgShapeGeneric.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { PathPolygon } from "../path/PathPolygon.js";
import { SvgPoint } from "../svg/SvgPoint.js";


export class SvgShapeRhombus extends SvgShapeGeneric {

  constructor(width: number, height: number) {
    super();

    const w = Math.abs(width);
    const h = Math.abs(height);
    this.bbox = new SvgBBox(-w / 2, -h / 2, w, h);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    
    this.paths = [
      new PathPolygon(
        new SvgPoint(-w / 2, 0),
        new SvgPoint(0, -h / 2),
        new SvgPoint(w / 2, 0),
        new SvgPoint(0 , h / 2),
      )
    ];
  }

}
