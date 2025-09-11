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
  ISvgPathSegment,
} from "../svg/ISvg.js";

import { WtMath } from "../math/WtMath.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import Rect from "../geometry/Rect.js";
import { Bezier3 } from "../geometry/Bezier.js";
import { PathGeneric } from "./PathGeneric.js";
import { PathSegmentedPath } from "./PathSegmentedPath.js";
import { PathBezier3 } from "./PathBezier3.js";
import { PathLine } from "./PathLine.js";
import { PathPolygon } from "./PathPolygon.js";

export class PathRect extends PathGeneric {
  public width: number = 0;
  public height: number = 0;
  public anchor: SvgPoint = new SvgPoint(0, 0);
  public radius: number = 0;
  public auxRect?: Rect;

  constructor() {
    // Please Note that the constructor will not be used directly, please use the static fromXXXX methods
    super();
    this.pathTag = "rect";
  }

  getPathAttr(): string[] {
    const attrs = [
      `x="${this.anchor.x.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `y="${this.anchor.y.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `width="${this.width.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `height="${this.height.toFixed(SvgCsts.COORS_DIGITS)}"`
    ];
    const r = this.fitRadius();
    if (!WtMath.isZero(r)) attrs.push(`rx="${r.toFixed(SvgCsts.COORS_DIGITS)}" ry="${r.toFixed(SvgCsts.COORS_DIGITS)}"`);
    return attrs;
  }

  fitRadius(): number {
    if (this.radius > 0) {
      const rMax = Math.min(this.width / 2, this.height / 2);
      return this.radius >= rMax ? rMax : this.radius;
    }
    return 0;
  }

  buildPathData(): string {
    if (!this.auxRect) return "";
    if (!this.radius) return `M${SvgPoint.toCoors(this.auxRect.pNW)}`
      + ` L${SvgPoint.toCoors(this.auxRect.pNE)}`
      + ` L${SvgPoint.toCoors(this.auxRect.pSE)}`
      + ` L${SvgPoint.toCoors(this.auxRect.pSW)} z`;
    const r = this.fitRadius();
    const pathWithR = new PathSegmentedPath();
    let pNW = this.auxRect.pNW,
        pSW = this.auxRect.pSW,
        pSE = this.auxRect.pSE,
        pNE = this.auxRect.pNE;
    let e = r * (1 - Bezier3.K);
    const pArcNW = new PathBezier3(
      new SvgPoint(pNW.x + r, pNW.y),
      new SvgPoint(pNW.x + e, pNW.y),
      new SvgPoint(pNW.x, pNW.y + e),
      new SvgPoint(pNW.x, pNW.y + r)
    );
    const lW = new PathLine(pNW.x, pNW.y + r, pSW.x, pSW.y - r);
    const pArcSW = new PathBezier3(
      new SvgPoint(pSW.x, pSW.y - r),
      new SvgPoint(pSW.x, pSW.y - e),
      new SvgPoint(pSW.x + e, pSW.y),
      new SvgPoint(pSW.x + r, pSW.y),
    )
    const lS = new PathLine(pSW.x + r, pSW.y, pSE.x - r, pSE.y);
    const pArcSE = new PathBezier3(
      new SvgPoint(pSE.x - r, pSE.y),
      new SvgPoint(pSE.x - e, pSE.y),
      new SvgPoint(pSE.x, pSE.y - e),
      new SvgPoint(pSE.x, pSE.y - r)
    );
    const lE = new PathLine(pSE.x, pSE.y - r, pNE.x, pNE.y + r)
    const pArcNE = new PathBezier3(
      new SvgPoint(pNE.x, pNE.y + r),
      new SvgPoint(pNE.x, pNE.y + e),
      new SvgPoint(pNE.x - e, pNE.y),
      new SvgPoint(pNE.x - r, pNE.y)
    );
    const lN = new PathLine(pNE.x - r, pNE.y, pNW.x + r, pNW.y);
    pathWithR.addSeg(pArcNW, lW, pArcSW, lS, pArcSE, lE, pArcNE, lN);
    pathWithR.closePath();
    return pathWithR.buildPathData();
  }

  getLength(): number {
    return 2 * (this.width + this.height);
  }

  toAngleArced(radius?: number | number[]) {
    if (!radius) return this;
    // Copy the polygon to make a new Path
    const path = PathPolygon.fromPolygon(this.auxRect!.toPolygon())!;
    path.setAngArcRadius(radius);
    return path;
  }

  toPathSegments(radius?: number | number[], cw?: "cw" | "ccw"): ISvgPathSegment[] {
    if (!this.auxRect) return [];
    return PathPolygon.fromPolygon(this.auxRect.toPolygon(cw))!.toPathSegs(radius);
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    if (!this.auxRect) return undefined;
    dir = dir === "right" ? "in"
      : dir === "left" ? "out"
      : dir;
    let rect = this.auxRect.duplicateTo(distance, dir);
    return rect ? PathRect.fromRect(rect) : undefined;
  }
  
  // Static Methods

  static fromXYWH(x: number, y: number, width: number, height: number, radius?: number): PathRect {
    const path = new PathRect();
    const rect = new Rect(x, y, width, height);
    path.auxRect = rect;
    path.models = [rect];
    path.width = rect.width;
    path.height = rect.height;
    path.anchor = SvgPoint.from(rect.pNW);
    // Here, the order is important, it will be used to build the path data, please note
    path.realPoints.push(
      SvgPoint.from(rect.pNW),
      SvgPoint.from(rect.pNE),
      SvgPoint.from(rect.pSE),
      SvgPoint.from(rect.pSW)
    );
    path.centers.push(SvgPoint.from(rect.center));
    path.bbox = SvgBBox.fromMaxMins(rect.xMin, rect.xMax, rect.yMin, rect.yMax);
    path.radius = radius ?? 0;
    return path;
  }

  static fromRect(rect: Rect, radius?: number): PathRect {
    const path = new PathRect();
    path.auxRect = rect;
    path.models = [rect];
    path.width = rect.width;
    path.height = rect.height;
    // path.center = SvgPoint.from(rect.center);
    path.anchor = SvgPoint.from(rect.pNW);
    // Here, the order is important, it will be used to build the path data, please note
    path.realPoints.push(
      SvgPoint.from(rect.pNW),
      SvgPoint.from(rect.pNE),
      SvgPoint.from(rect.pSE),
      SvgPoint.from(rect.pSW)
    );
    path.centers.push(SvgPoint.from(rect.center));
    path.bbox = SvgBBox.fromMaxMins(rect.xMin, rect.xMax, rect.yMin, rect.yMax);
    path.radius = radius ?? 0;
    return path;
  }

}


