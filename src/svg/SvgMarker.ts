/**
 * The class implementation of SVG Line.
 */

import { AngDeg } from "../geometry/AngDeg.js";
import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgShape,
  ISvgPath,
  ISvgPoint,
  ISvgMarker
} from "./ISvg.js";

import { SvgBBox } from "./SvgBBox.js";
import { SvgPoint } from "./SvgPoint.js";

import {
  SvgShapeArrowHeadSimpleAngle,
  SvgShapeArrowHeadSolidTriangle,
  SvgShapeArrowHeadSolidTwoTriangle
} from "../shape/SvgShapeArrowHead.js";
import {
  SvgShapeCross,
  SvgShapePlus
} from "../shape/SvgShapeCross.js";
import {
  SvgShapeStar,
  SvgShapeStar5,
  SvgShapeStarUnified
} from "../shape/SvgShapeStar.js";
import { SvgShapeCircle } from "../shape/SvgShapeCircle.js";
import { SvgShapeEllipse } from "../shape/SvgShapeEllipse.js";
import { SvgShapeHeart } from "../shape/SvgShapeHeart.js";
import { SvgShapeIsoscelesTriangle } from "../shape/SvgShapeIsoscelesTriangle.js";
import { SvgShapePolygon } from "../shape/SvgShapePolygon.js";
import { SvgShapeRect } from "../shape/SvgShapeRect.js";
import { SvgShapeRhombus } from "../shape/SvgShapeRhombus.js";
import { SvgShapeGeneric } from "../shape/SvgShapeGeneric.js";
import { SvgCsts } from "./SvgConstants.js";

export class SvgMarker implements ISvgMarker {
  public id: string;
  public units: "strokeWidth" | "userSpaceOnUse" = "strokeWidth";
  public refX: number;
  public refY: number;
  public orient: number | "auto" | "auto-start-reverse";   // If use number, it means degrees
  public viewBox: ISvgBBox;
  public preserveAspectRatio?: boolean;

  public stroke?: IStrokeConfig;
  public fill?: IFillConfig;

  public shape: ISvgShape;

  constructor(
    id: string,
    shape: ISvgShape,
    orient: number | "auto" | "auto-start-reverse",
    refX?: number,
    refY?: number,
    stroke?: IStrokeConfig,
    fill?: IFillConfig
  ) {
    this.id = `svg-mkr-${id}`;
    this.orient = orient;
    this.shape = shape;
    this.refX = refX ?? 0;
    this.refY = refY ?? 0;
    if (stroke && this.shape.hasStroke) {
      this.shape.setStroke(stroke);
      this.stroke = {...this.shape.stroke};
    }
    if (fill && this.shape.hasFill) {
      this.shape.setFill(fill);
      this.fill = {...this.shape.fill};
    }
    this.viewBox = this.shape.getBBox(this.stroke?.width);
  }

  buildMarkerSvg(
    id?: string,
    primaryColor?: string,
    secondaryColor?: string,
  ): string {
    id = id ?? this.id;
    const fillColor = (this.shape.primaryColor === "fill" ? primaryColor : secondaryColor) ?? this.fill?.color;
    const strokeColor = (this.shape.primaryColor === "stroke" ? primaryColor  : secondaryColor) ?? this.stroke?.color;
    const attrs: string[] = [
      `id="${id}"`,
      `viewBox="${this.viewBox.buildString()}"`,
      `refX="${this.refX}"`,
      `refY="${this.refY}"`,
      `markerWidth="${this.viewBox.w}"`,
      `markerHeight="${this.viewBox.h}"`,
      `orient="${this.orient}"`,
    ];
    return `<marker ${attrs.join(" ")} >\n`
      /** Here, the fill opacity and stoke width are not able to be set while building SVG  */
      + this.shape.buildHtml(fillColor, undefined , strokeColor, undefined)
      + `\n</marker>`;
  }

  /** Static methods, and shortcut methods of build different markers, the only variant is the
   * shape which is determined by different input parameters such as size, etc.
   */

  /** --- Circle --- */
  static buildMarkerCircle(
    radius: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeCircle(radius);
    return new SvgMarker("circ", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Ellipse --- */
  static buildMarkerEllipse(
    rx: number,
    ry: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeEllipse(rx, ry);
    return new SvgMarker("ell", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Rectangle --- */
  static buildMarkerRect(
    w: number,
    h: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeRect(w,h);
    return new SvgMarker("rect", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Square --- */
  static buildMarkerSquare(
    w: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeRect(w, w);
    return new SvgMarker("square", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Cross --- */
  static buildMarkerCross(
    w: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeCross(w);
    return new SvgMarker("cross", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    });
  }

  /** --- Plus --- */
  static buildMarkerPlus(
    w: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapePlus(w);
    return new SvgMarker("plus", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    });
  }

  /** --- Polygon --- */
  static buildMarkerPolygon(
    radius: number,
    edgeCount: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapePolygon(radius, edgeCount);
    return new SvgMarker("plg", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Rhombus --- */
  static buildMarkerRhombus(
    width: number,
    height: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeRhombus(width, height);
    return new SvgMarker("rhombus", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Isosceles Triangle --- */
  static buildMarkerIsoscelesTriangle(
    width: number,
    height: number,
    direction: "up" | "right" | "down" | "left",
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeIsoscelesTriangle(width, height, direction);
    return new SvgMarker("isotriang", shape, 0, 0, 0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    });
  }

  /** --- Star made by simple axises --- */
  static buildMarkerStar(
    size: number,
    axisCount: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeStar(size / 2, axisCount);
    return new SvgMarker("star", shape, 0,0,0, {
      color: strokeColor,
      width: strokeWidth,
    })
  }

  /** --- Standard 5-angle star --- */
  static buildMarkerStar5(
    size: number,
    centerEmpty?: boolean,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeStar5(size / 2, centerEmpty);
    return new SvgMarker("star5", shape, 0,0,0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    })
  }

  /** --- Unified Star-Like Markers --- */
  static buildMarkerStarUnified(
    axisCount: number,
    rIn: number,
    rOut: number,
    degOffset: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number,
    roundRadius?: number
  ): ISvgMarker {
    const shape = new SvgShapeStarUnified(axisCount, rIn, rOut, degOffset, roundRadius);
    return new SvgMarker("staru", shape, 0,0,0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    })
  }

  /** --- Heart --- */
  static buildMarkerHeart(
    h1: number,
    ctrlLen1: number,
    deg1: number,
    farPointX: number,
    farPointY: number,
    deg2: number,
    ctrlLen2: number,
    ctrlLen3: number,
    h2: number,
    deg3: number,
    ctrlLen4: number,
    fillColor?: string,
    fillOpacity?: number,
    strokeColor?: string,
    strokeWidth?: number
  ): ISvgMarker {
    const shape = new SvgShapeHeart(
      h1, ctrlLen1, deg1,
      farPointX, farPointY,
      deg2, ctrlLen2, ctrlLen3,
      h2, deg3, ctrlLen4);
    return new SvgMarker("heart", shape, 0,0,0, {
      color: strokeColor,
      width: strokeWidth,
    },
    {
      color: fillColor,
      opacity: fillOpacity
    })
  }

  /** --- Arrow Head --- */
  static buildArrowHead(
    type: "solid-angle" | "solid-two-angle" | "simple",
    length: number,
    openDeg: number,
    len2Ratio?: number,
    makeSmooth?: boolean,
    makeTriangle?: boolean,
    color?: string,
  ): ISvgMarker {
    if (type === "solid-angle") {
      const shape = new SvgShapeArrowHeadSolidTriangle(length, openDeg, makeSmooth ? 0.4 : undefined);
      return new SvgMarker("arrow-solid", shape, "auto-start-reverse",
        -0.5 / Math.tan(shape.angHalf), 0,
        undefined,
        color ? {color} : undefined      /** Fill Color */
        );
    } else if (type === "solid-two-angle") {
      const shape = new SvgShapeArrowHeadSolidTwoTriangle(length, openDeg, len2Ratio, makeSmooth ? 0.4 : undefined);
      return new SvgMarker("arrow-solid-2", shape, "auto-start-reverse",
        -0.5 / Math.tan(shape.angHalf), 0,
        undefined,
        color ? {color} : undefined     /** Fill Color */
        );
    } else {
      const shape = new SvgShapeArrowHeadSimpleAngle(length, openDeg, makeTriangle, makeSmooth);
      /** Here, the second 0.5 (half of 1) is derived from the fact that the default (and should always be)
       *  stroke width is 1 (same as line stroke) */
      const refX = -0.5 / Math.tan(shape.angHalf) + 0.5 / Math.sin(shape.angHalf);
      return new SvgMarker("arrow-simple", shape, "auto-start-reverse",
        refX, 0,
        color ? {color} : undefined,     /** Stroke Color, The stroke width will never be specified, it will always be 1 */
        );
    }
  }

  /** The predefined markers */
  static preDefines: {
    [id: string]: ISvgMarker;
  } = {
    "arrow-std": SvgMarker.buildArrowHead("solid-angle", 5.2, 42),
    "arrow1": SvgMarker.buildArrowHead("solid-angle", 7, 38),
    "arrow2": SvgMarker.buildArrowHead("solid-angle", 5, 30),


    // TODO: add more as required
  }

}
