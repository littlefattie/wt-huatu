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
import { AngDeg } from "../geometry/AngDeg.js";
import { PathPolyline } from "../path/PathPolyline.js";


export class SvgShapeArrowHeadSolidTriangle extends SvgShapeGeneric {
  public angHalf: number;

  constructor(length: number, angleInDeg: number, roundCornerRadius?: number) {
    super();

    const len = Math.abs(length);
    this.angHalf = Math.abs(AngDeg.ensureUnder90(angleInDeg)) / 2;
    const h = len * Math.tan(this.angHalf);
    this.bbox = new SvgBBox(-len, -h , len, 2 * h);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = false;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill";
    const path = new PathPolygon(
      new SvgPoint(-len, h),
      new SvgPoint(0, 0),
      new SvgPoint(-len, -h)
    );
    if (roundCornerRadius) {
      path.setAngArcRadius(roundCornerRadius);
    }
    this.paths = [ path ];
  }

}


export class SvgShapeArrowHeadSolidTwoTriangle extends SvgShapeGeneric {
  public angHalf: number;

  constructor(length: number, angleInDeg: number, len2Ratio?: number, roundCornerRadius?: number) {
    super();

    const len = Math.abs(length);
    this.angHalf = Math.abs(AngDeg.ensureUnder90(angleInDeg)) / 2;
    const h = len * Math.tan(this.angHalf);
    this.bbox = new SvgBBox(-len, -h , len, 2 * h);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = false;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }
    this.primaryColor = "fill";
    let path;
    if (len2Ratio) {
      const len2 = len2Ratio > 0.9
        ? len * 0.9
        : len2Ratio < 0
        ? 0
        : len2Ratio * len;
      path = new PathPolygon(
        new SvgPoint(-len, h),
        new SvgPoint(0, 0),
        new SvgPoint(-len, -h),
        new SvgPoint(-len + len2, 0)
      );
    } else {
      path = new PathPolygon(
        new SvgPoint(-len, h),
        new SvgPoint(0, 0),
        new SvgPoint(-len, -h)
      );
    }
    if (roundCornerRadius) {
      path.setAngArcRadius(roundCornerRadius);
    }
    this.paths = [ path ];
  }

}


export class SvgShapeArrowHeadSimpleAngle extends SvgShapeGeneric {
  public angHalf: number;

  constructor(length: number, angleInDeg: number, makeTriangle?: boolean, smooth?: boolean) {
    super();

    const len = Math.abs(length);
    this.angHalf = Math.abs(AngDeg.ensureUnder90(angleInDeg)) / 2;
    const h = len * Math.tan(this.angHalf);
    this.bbox = new SvgBBox(-len, -h , len, 2 * h);
    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.stroke = {
      color: SvgCsts.CONTEXT_STROKE,
      width: 1,
    }
    this.primaryColor = "stroke";
    if (smooth) {
      this.stroke.lineJoin = "round";
      this.stroke.lineCap = "round";
    }
    this.hasFill = false;
    const path = new PathPolyline(
        new SvgPoint(-len, h),
        new SvgPoint(0, 0),
        new SvgPoint(-len, -h)
    );
    if (makeTriangle) {
      path.makeClose();
    }
    this.paths = [ path ];
  }

}


