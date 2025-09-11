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

export class SvgShapeStar extends SvgShapeGeneric {

  static AXIS_COUNT_MIN = 3;
  static AXIS_COUNT_MAX = 16;

  public axisCount: number;

  constructor(width: number, axisCount: number) {
    super();

    const w = Math.abs(width);
    this.bbox = new SvgBBox(-w / 2, -w / 2, w, w);
    this.hasStroke = true;
    this.stroke = {
      color: SvgCsts.CONTEXT_STROKE,
      width: SvgShapeGeneric.STROKE_WIDTH_DEFAULT,
      lineCap: "round",
    }
    this.hasFill = false;
    
    this.primaryColor = "stroke",

    axisCount = Math.floor(axisCount);
    this.axisCount = axisCount > SvgShapeStar.AXIS_COUNT_MAX
      ? SvgShapeStar.AXIS_COUNT_MAX
      : axisCount < SvgShapeStar.AXIS_COUNT_MIN
      ? SvgShapeStar.AXIS_COUNT_MIN
      : axisCount;
    this.paths = [...Array(this.axisCount).keys()]
      .map(i => Math.PI * i / axisCount)
      .map(ang => PathLine.fromEnds(Circle.calcPoint(w/2, ang), Circle.calcPoint(w/2, ang + Math.PI)));
  }

}


export class SvgShapeStar5 extends SvgShapeGeneric {

  constructor(radius: number, centerEmpty?: boolean) {
    super();

    const r = Math.abs(radius);
    const vertices = [...Array(5).keys()]
      .map(i => AngDeg.fitDeg(i * 72 + 270))
      .map(a => Circle.calcPoint(r, a));
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
      rule: centerEmpty ? "evenodd" : "nonzero",
    }
    this.primaryColor = "fill";
    this.secondaryColor = "stroke";

    const path = new PathPolyline(vertices[0], vertices[2], vertices[4], vertices[1], vertices[3]);
    path.makeClose();
    this.bbox = path.bbox;
    this.paths = [path];
  }

}


export class SvgShapeStarUnified extends SvgShapeGeneric {

  static AXIS_COUNT_MAX = 30;
  static AXIS_COUNT_MIN = 2;

  public axisCount: number;
  public rOut: number;
  public rIn: number;

  constructor(axisCount: number, rIn: number, rOut: number, degOffset: number, roundRadius?: number) {
    super();

    rIn = Math.abs(rIn);
    rOut = Math.abs(rOut);
    this.rOut = Math.max(rIn, rOut);
    this.rIn = Math.min(rIn, rOut);
    axisCount = Math.floor(axisCount);
    this.axisCount = axisCount > SvgShapeStarUnified.AXIS_COUNT_MAX
      ? SvgShapeStarUnified.AXIS_COUNT_MAX
      : axisCount < SvgShapeStarUnified.AXIS_COUNT_MIN
      ? SvgShapeStarUnified.AXIS_COUNT_MIN
      : axisCount;
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill";
    this.secondaryColor = "stroke";
    
    const vertices: ISvgPoint[] = [];
    const angDiv = AngDeg.DEG360 / this.axisCount;
    const angOffset = degOffset ? AngDeg.deg2Ang(degOffset) : 0;
    [...Array(this.axisCount).keys()]
      .forEach(i => {
        const angOut = AngDeg.fitAng(AngDeg.DEG270 + i * angDiv);
        const angIn = AngDeg.fitAng(angOut + angDiv / 2 + angOffset);
        const outPoint = Circle.calcPoint(this.rOut, angOut);
        const inPoint = Circle.calcPoint(this.rIn, angIn);        
        vertices.push(outPoint, inPoint);
      })
    const path = new PathPolygon(...vertices);
    if (roundRadius) {
      path.setAngArcRadius(roundRadius);
    }
    this.bbox = path.bbox;
    this.paths = [ path ];
  }

}
