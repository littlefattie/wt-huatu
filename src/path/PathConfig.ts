/**
 * The class implementation of SVG Line.
 */

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

export class PathConfig {

  /** Static methods */

  static stroke2Str(stroke?: IStrokeConfig): string {
    if (!stroke) return "";
    if (!stroke.color || stroke.color === "none") return "";
    let attr: string[] = [];
    if (stroke.color) attr.push(`stroke="${stroke.color}"`);
    if (stroke.opacity && stroke.opacity !== 1) attr.push(`stroke-opacity="${stroke.opacity}"`);
    if (stroke.width && stroke.width > 0) attr.push(`stroke-width="${stroke.width}"`);
    if (stroke.lineCap && stroke.lineCap !== "butt") attr.push(`stroke-linecap="${stroke.lineCap}"`);
    if (stroke.lineJoin && stroke.lineJoin !== "miter") attr.push(`stroke-linejoin="${stroke.lineJoin}"`);
    if (stroke.miterLimit) attr.push(`stroke-miterlimit="${stroke.miterLimit}"`);
    if (stroke.dashArray) {
      let da;
      if (Array.isArray(stroke.dashArray)) {
        da = (stroke.dashArray as number[]).map(d => `${d}`).join(",");
      }
      else {
        da = "none";
      }
      attr.push(`stroke-dasharray="${da}"`);
    }
    if (stroke.dashOffset) attr.push(`stroke-dashoffset="${stroke.dashOffset}"`);
    return attr.join(" ");
  }

  static fill2Str(fill?: IFillConfig): string {
    if (!fill || !fill.color || fill.color === "none") return `fill="none"`;
    let attr: string[] = [];
    if (fill.color) attr.push(`fill="${fill.color}"`);
    if (fill.opacity && fill.opacity !== 1) attr.push(`fill-opacity="${fill.opacity}"`);
    if (fill.rule) attr.push(`fill-rule="${fill.rule}"`);
    return attr.join(" ");
  }

  static marker2Str(marker?: IMarkerConfig): string {
    if (!marker) return "";
    let attr: string[] = [];
    if (marker.start) attr.push(`marker-start="url(#${marker.start})"`)
    if (marker.mid) attr.push(`marker-mid="url(#${marker.mid})"`)
    if (marker.end) attr.push(`marker-end="url(#${marker.end})"`)
    return attr.join(" ");
  }

  static clip2Str(clip?: ISvgClipPath | string): string {
    if (!clip) return "";
    if (typeof clip === "string") return `clip-path=url(#${clip})`;
    if (typeof clip === "object" && clip.id) return `clip-path=url(#${clip.id})`;
    return "";
  }

  static buildAll(
    stroke?: IStrokeConfig | undefined,
    fill?: IFillConfig | undefined,
    marker?: IMarkerConfig | undefined,
    clip?: ISvgClipPath | string): string 
  {
    return [
      PathConfig.stroke2Str(stroke),
      PathConfig.fill2Str(fill),
      PathConfig.marker2Str(marker),
      PathConfig.clip2Str(clip),
    ]
    .filter(x => !!x)
    .join(" ");
  }

}



