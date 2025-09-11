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

import Circle from "../geometry/Circle.js";
import { PathLine } from "../path/PathLine.js";
import { PathRect } from "../path/PathRect.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgShapeGeneric } from "./SvgShapeGeneric.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { PathPolyline } from "../path/PathPolyline.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { PathPolygon } from "../path/PathPolygon.js";


export class SvgShapePolygon extends SvgShapeGeneric {

  static EDGE_COUNT_MAX = 30;
  static EDGE_COUNT_MIN = 3;

  public edgeCount: number;
  public r: number;

  constructor(radius: number, edgeCount: number) {
    super();
    
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }

    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    
    this.r = Math.abs(radius);
    this.edgeCount = edgeCount > SvgShapePolygon.EDGE_COUNT_MAX
      ? SvgShapePolygon.EDGE_COUNT_MAX
      : edgeCount < SvgShapePolygon.EDGE_COUNT_MIN
      ? SvgShapePolygon.EDGE_COUNT_MIN
      : Math.floor(edgeCount);
    const angDiv = AngDeg.DEG360 / this.edgeCount;
    const angStart = this.edgeCount % 2 === 0
      ? AngDeg.DEG270 - (angDiv / 2)
      : AngDeg.DEG270;
    const vertices: ISvgPoint[] = [...Array(this.edgeCount).keys()]
      .map(i => Circle.calcPoint(this.r, AngDeg.fitAng(i * angDiv + angStart)))
    const path = new PathPolygon(...vertices);
    this.bbox = path.bbox;
    this.paths = [ path ];
  }

}
