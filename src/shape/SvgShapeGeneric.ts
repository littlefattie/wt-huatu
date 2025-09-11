/**
 * The class implementation of SVG Line.
 */

import { assignOnlyDefined } from "../tools/utils.js";
import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgShape,
  ISvgPath,
  ISvgPoint
} from "../svg/ISvg.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgPoint } from "../svg/SvgPoint.js";

export class SvgShapeGeneric implements ISvgShape {

  static STROKE_WIDTH_DEFAULT = 0.2;

  public hasStroke: boolean = false;
  public hasFill: boolean = false;
  public bbox: ISvgBBox;
  public paths: ISvgPath[] = [];

  public stroke?: IStrokeConfig;
  public fill?: IFillConfig;

  public primaryColor: "fill" | "stroke" = "fill";
  public secondaryColor?: "fill" | "stroke";

  constructor() {
    this.bbox = SvgBBox.DUMMY;
  }

  setStroke(stroke: IStrokeConfig) {
    this.stroke = this.stroke ? assignOnlyDefined(this.stroke, stroke): {...stroke};
    if (this.stroke.color && !this.stroke.width) {
      this.stroke.width = SvgShapeGeneric.STROKE_WIDTH_DEFAULT;
    }
  }

  setFill(fill: IFillConfig) {
    this.fill = this.fill ? assignOnlyDefined(this.fill, fill) : {...fill};
  }

  buildHtml(
    fillColor?: string | undefined,
    fillOpacity?: number | undefined,
    strokeColor?: string | undefined,
    strokeWidth?: number | undefined
  ): string {
    let fill: IFillConfig;
    let stroke: IStrokeConfig;
    if (this.hasFill) {
      fill = {...this.fill};
      fill.color = fillColor ?? fill.color;
      fill.opacity = fillOpacity ?? fill.opacity;
    }
    if (this.hasStroke && (this.stroke?.width || strokeWidth)) {
      stroke = {...this.stroke};
      stroke.color = strokeColor ?? stroke.color;
      stroke.width = strokeWidth ?? stroke.width;
    }
    return this.paths
      .map(p => p.buildHtmlFull(stroke, fill))
      .join("\n");
  }

  getBBox(strokeWidth?: number): ISvgBBox {
    const bboxes = this.paths
      .map(p => this.hasStroke ? p.bbox.extendByStroke(strokeWidth ?? (this.stroke?.width ?? 0)) : p.bbox);
    return SvgBBox.mergeBoxes(bboxes);
  }

  /** Static methods */


}



