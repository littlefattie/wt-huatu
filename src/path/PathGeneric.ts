/**
 * The class implementation of SVG Line.
 */

import type { IGeometryModel } from "../geometry/IGeometry.js";
import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgPath,
  ISvgPoint
} from "../svg/ISvg.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { PathConfig } from "./PathConfig.js";

export class PathGeneric implements ISvgPath {
  public stroke?: IStrokeConfig;
  public fill?: IFillConfig;
  public marker?: IMarkerConfig;
  public clip?: string | ISvgClipPath;

  public bbox: ISvgBBox;
  
  public realPoints: SvgPoint[] = [];
  public auxPoints: SvgPoint[] = [];
  public centers: SvgPoint[] = [];

  public pathTag: string = "path";

  public models: IGeometryModel[] = [];

  constructor() {
    this.bbox = SvgBBox.DUMMY;
  }

  getPathAttr(): string[] {
    return [];
  }

  buildPathHtmlOnly(id?: string) {
    const idAttr = id ? `id="${id}"` : ``;
    return `<${this.pathTag} ${idAttr} ${this.getPathAttr().join(" ")} />`
  }
  
  buildHtml(additional?: string | undefined): string {
    const attrs = this.getPathAttr();
    if (attrs.length < 1) return "";
    return `<${this.pathTag} ${attrs.join(" ")} ${additional ?? this.buildCfgStrings()} />`
  }

  buildHtmlFull(
    stroke?: IStrokeConfig | undefined,
    fill?: IFillConfig | undefined,
    marker?: IMarkerConfig | undefined,
    clip?: ISvgClipPath | string): string 
  {
    return this.buildHtml(PathConfig.buildAll(stroke, fill, marker, clip));
  }

  buildPathData(): string {
    return "";
  }

  // Styling
  setStroke(stroke: IStrokeConfig) {
    this.stroke = stroke;
  }

  setFill(fill: IFillConfig) {
    this.fill = fill;
  }

  setMarker(marker: IMarkerConfig) {
    this.marker = marker;
  }

  setClip(clip: string | ISvgClipPath) {
    this.clip = clip;
  }

  buildCfgStrings() {
    return PathConfig.buildAll(this.stroke, this.fill, this.marker, this.clip);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    // If not implemented this method, return undefined defaultly.
    return undefined;
  }
}



