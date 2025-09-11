
import type {
  IHuatuDefinable,
  IHuatuMarker,
  IMarkerParams,
} from "./IHuatu.js";

import type {
  IFillConfig,
  IStrokeConfig,
  ISvgMarker,
  ISvgShape
} from "../svg/ISvg.js";
import { SvgMarker } from "../svg/SvgMarker.js";
import {
  SvgShapeArrowHeadSimpleAngle,
  SvgShapeArrowHeadSolidTriangle,
  SvgShapeArrowHeadSolidTwoTriangle
} from "../shape/SvgShapeArrowHead.js";
import { fitNumInRange } from "../tools/utils.js";
import { WtMath } from "../math/WtMath.js";
import { SvgShapeCircle } from "../shape/SvgShapeCircle.js";
import { SvgShapeEllipse } from "../shape/SvgShapeEllipse.js";
import { SvgShapeRect } from "../shape/SvgShapeRect.js";
import { SvgShapeCross, SvgShapePlus } from "../shape/SvgShapeCross.js";
import { SvgShapeRhombus } from "../shape/SvgShapeRhombus.js";
import { SvgShapeIsoscelesTriangle } from "../shape/SvgShapeIsoscelesTriangle.js";
import { SvgShapeStar5, SvgShapeStarUnified } from "../shape/SvgShapeStar.js";
import { SvgShapePolygon } from "../shape/SvgShapePolygon.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuMarker implements IHuatuMarker, IHuatuDefinable {
  // The possible marker types that user could use when designing the marker
  static TYPES: { [key: string]: string[] } = {
    arrowSolid: ["arrow-solid", "arrowsolid", "solidarrow", "arrow"],
    arrowDouble: ["arrow-double","arrowdouble", "doublearrow"],
    arrowSimple: ["arrow-simple", "arrowsimple", "simple-arrow", "simplearrow"],
    circle: ["circle", "circ", "dot"],
    triangle: ["triangle", "tri"],
    ellipse: ["ellipse", "ell"],
    rhombus: ["rhombus", "rhom"],
    square: ["square", "sqr"],
    rectangle: ["rectangle", "rect"],
    star5: ["star", "star5", "5-star", "5star", "wujiaoxing"],
    starU: ["staru", "star-u", "star-unified", "unifiedstar", "unified-star"],
    plus: ["plus", "jiahao"],
    cross: ["cross", "chacha", "cha"],
    polygon: ["polygon", "plg", "duobianxing", "dbx"]
  };

  name: string;
  marker: ISvgMarker;

  primaryColor?: string;
  secondaryColor?: string;

  refCount: number = 0;
  alwaysInDef: boolean = true;
  magicId: string;

  constructor(name: string, marker: ISvgMarker) {
    this.name = name;
    this.marker = marker;
    this.magicId = genHex(8);
  }

  buildHtmlForDef(): string {
    return this.marker.buildMarkerSvg(this.buildId(), this.primaryColor, this.secondaryColor);
  }

  buildId(): string {
    return `mkr-${this.magicId}`;
  }

  static getAllMarkerTypeWords() {
    const res: string[] = [];
    for (const key in HuatuMarker.TYPES) {
      res.push(...HuatuMarker.TYPES[key]);
    }
    return res;
  }

  static buildMarkerFromParams(name: string, params: IMarkerParams): SvgMarker | string {
    if (!params.type) return `Marker Type not specified!`;
    const type = params.type.toLowerCase();
    let shape: ISvgShape;
    let orient: number | "auto" | "auto-start-reverse" = 0;
    let refX = 0,
        refY = 0;
    let hasStroke = false,
        hasFill = false;
    let fill: IFillConfig = {};
    let stroke: IStrokeConfig = {};
    let openDeg = params.degOpen ?? 46;
    let len = params.len ? params.len
      : params.size ? params.size
      : params.width ? params.width
      : 5;
    let radius = params.r ? params.r
      : params.size ? params.size / 2
      : params.width ? params.width / 2
      : params.height ? params.height / 2
      : 6;
    let w = params.width ? params.width
      : params.size ? params.size
      : params.len ? params.len
      : 6;
    let h = params.height ? params.height
      : params.size ? params.size
      : params.len ? params.len
      : 6;
    let rx = params.rx ? params.rx
      : params.r ? params.r
      : params.width ? params.width / 2
      : params.height ? params.height / 2
      : 6;
    let ry = params.ry ? params.ry
      : params.r ? params.r
      : params.height ? params.height / 2
      : params.width ? params.width / 2
      : 6;
    let size = params.size ? params.size
      : params.width ? params.width
      : params.height ? params.height
      : 6;
    if (HuatuMarker.TYPES.arrowSolid.includes(type)) {
      orient = "auto-start-reverse";
      shape = new SvgShapeArrowHeadSolidTriangle(fitNumInRange(len, 1, 200), fitNumInRange(openDeg, 10, 160), params.makeSmooth ? 0.1 : undefined);
      refX = -0.5 / Math.tan((shape as SvgShapeArrowHeadSolidTriangle).angHalf);
      hasFill = true;
    } else if (HuatuMarker.TYPES.arrowDouble.includes(type)) {
      orient = "auto-start-reverse";
      let len2Ratio: number | undefined;
      if (params.k && WtMath.isIn0and1(params.k)) len2Ratio = fitNumInRange(params.k, 0, 1);
      shape = new SvgShapeArrowHeadSolidTwoTriangle(fitNumInRange(len, 1, 200), fitNumInRange(openDeg, 10, 160), len2Ratio, params.makeSmooth ? 0.1 : undefined);
      refX = -0.5 / Math.tan((shape as SvgShapeArrowHeadSolidTwoTriangle).angHalf);
      hasFill = true;
    } else if (HuatuMarker.TYPES.arrowSimple.includes(type)) {
      orient = "auto-start-reverse";
      shape = new SvgShapeArrowHeadSimpleAngle(fitNumInRange(len, 1, 200), fitNumInRange(openDeg, 10, 160), params.closeArrow, params.makeSmooth);
      refX = -0.5 / Math.tan((shape as SvgShapeArrowHeadSimpleAngle).angHalf) + 0.5 / Math.sin((shape as SvgShapeArrowHeadSimpleAngle).angHalf);
      hasStroke = true;
    } else if (HuatuMarker.TYPES.circle.includes(type)) {
      shape = new SvgShapeCircle(fitNumInRange(radius, 0.2, 100));
      hasStroke = true;
      hasFill = true;
    } else if (HuatuMarker.TYPES.triangle.includes(type)) {
      const dir = params.direction && ["up", "down", "left", "right"].includes(params.direction) ? params.direction : "up";
      shape = new SvgShapeIsoscelesTriangle(fitNumInRange(w, 2, 100), fitNumInRange(h, 2, 100), (dir as "up" | "down" | "left" | "right"));
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.ellipse.includes(type)) {
      orient = "auto";
      shape = new SvgShapeEllipse(fitNumInRange(rx, 0.2, 100), fitNumInRange(ry, 0.2, 100));
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.rhombus.includes(type)) {
      shape = new SvgShapeRhombus(fitNumInRange(w, 0.2, 100), fitNumInRange(h, 0.2, 100));
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.square.includes(type)) {
      w = fitNumInRange(w, 0.2, 100);
      shape = new SvgShapeRect(w, w);
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.rectangle.includes(type)) {
      shape = new SvgShapeRect(fitNumInRange(w, 0.2, 100), fitNumInRange(h, 0.2, 100));
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.star5.includes(type)) {
      shape = new SvgShapeStar5(fitNumInRange(size, 0.4, 100) / 2, params.centerEmpty);
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.starU.includes(type)) {
      if (!params.n) return `Star angle count N must be presented!`;
      let rIn = params.rIn ? params.rIn : params.r ? params.r : 10;
      let rOut = params.rOut ? params.rOut : rIn * 1.2;
      if (rOut < rIn) {
        let x = rIn;
        rIn = rOut;
        rOut = x;
      } else if (rOut === rIn) {
        rOut = rIn * 1.2;
      }
      let degOffset = params.degOffset ?? 0;
      let rCorner = params.rx ? params.rx : params.ry ? params.ry : undefined;
      shape = new SvgShapeStarUnified(fitNumInRange(params.n, 3, 30), rIn, rOut, degOffset, rCorner);
      hasFill = true;
      hasStroke = true;
    } else if (HuatuMarker.TYPES.plus.includes(type)) {
      shape = new SvgShapePlus(fitNumInRange(w, 0.2, 100));
      hasStroke = true;
    } else if (HuatuMarker.TYPES.cross.includes(type)) {
      shape = new SvgShapeCross(fitNumInRange(w, 0.2, 100));
      hasStroke = true;
    } else if (HuatuMarker.TYPES.polygon.includes(type)) {
      if (!params.n) return `Polygon side count N must be presented!`;
      shape = new SvgShapePolygon(size, fitNumInRange(params.n, 3, 30));
      hasFill = true;
      hasStroke = true;
    } else {
      return `Marker type '${type}' is not defined!`;
    }
    if (hasStroke) {
      if (params.strokeColor) stroke.color = params.strokeColor;
      if (params.strokeWidth) stroke.width = params.strokeWidth;
    }
    if (hasFill) {
      if (params.fillColor) fill.color = params.fillColor;
      if (params.fillOpacity) fill.opacity = params.fillOpacity;
    }
    return new SvgMarker(`mkr-${name}`, shape, orient, refX, refY, stroke, fill)
  }
}
