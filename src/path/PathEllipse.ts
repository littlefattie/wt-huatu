/**
 * The class implementation of SVG Basic Shape of Ellipse.
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

import { PathGeneric } from "./PathGeneric.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import Ellipse from "../geometry/Ellipse.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { PathSegmentedPath } from "./PathSegmentedPath.js";
import { PathEllipticalArc } from "./PathEllipticalArc.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { WtMath } from "../math/WtMath.js";

export class PathEllipse extends PathGeneric {
  rx: number;
  ry: number;
  cx: number;
  cy: number;
  rotDeg: number;
  center: SvgPoint;
  auxEllipse: Ellipse;

  constructor(cx: number, cy: number, rx: number, ry: number, rotDeg?: number) {
    super();
    this.pathTag = "ellipse";
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
    this.center = new SvgPoint(cx, cy);
    this.centers.push(this.center);
    this.auxEllipse = new Ellipse(cx, cy, rx, ry, AngDeg.fitDeg(rotDeg ?? 0));
    this.models = [this.auxEllipse];
    this.rotDeg = AngDeg.ang2Deg(this.auxEllipse.rot);
    const boundingPoints = [this.auxEllipse.pE, this.auxEllipse.pN, this.auxEllipse.pW, this.auxEllipse.pS];
    const xs = boundingPoints.map(p => p.x);
    const ys = boundingPoints.map(p => p.y);
    this.bbox = SvgBBox.fromMaxMins(Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys));
  }

  getPathAttr(): string[] {
    const transforms: string[] = [];
    if (!WtMath.isZero(this.cx) || !WtMath.isZero(this.cy)) {
      transforms.push(`translate(${this.cx.toFixed(SvgCsts.COORS_DIGITS)},${this.cy.toFixed(SvgCsts.COORS_DIGITS)})`);
    }
    if (!WtMath.isZero(this.rotDeg)) {
      transforms.push(`rotate(${this.rotDeg.toFixed(SvgCsts.COORS_DIGITS_MIN)})`);
    }
    const attrs = [
      `rx="${this.rx.toFixed(SvgCsts.COORS_DIGITS)}"`,
      `ry="${this.ry.toFixed(SvgCsts.COORS_DIGITS)}"`
    ];
    if (transforms.length > 0) attrs.push(`transform="${transforms.join(" ")}"`);
    return attrs;
  }

  buildPathData(): string {
    const path = new PathSegmentedPath();
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 0,    90, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 90,  180, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 180, 270, true)));
    path.addSeg(PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 270,   0, true)));
    path.closePath();
    return path.buildPathData();
  }

  buildSegmentedPathData(cw?: "cw" | "ccw") {
    const path = new PathSegmentedPath();
    path.addSeg(...this.toPathSegments(undefined, cw));
    path.closePath();
    return path.buildPathData();
  }

  toPathSegments(radius?: number | number[], cw?: "cw" | "ccw"): ISvgPathSegment[] {
    const segs = cw && cw === "cw" ? [
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 0,    90, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 90,  180, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 180, 270, true)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 270,   0, true))
    ] : [
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 0,   270, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 270, 180, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 180,  90, false)),
      PathEllipticalArc.fromArc(EllipticalArc.fromEllipse(this.auxEllipse, 90,    0, false))
    ]
    segs[segs.length - 1].closePath = true;
    return segs;
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out"): ISvgPath | undefined {
    dir = dir === "right" ? "in"
      : dir === "left" ? "out"
      : dir;
    let ell = this.auxEllipse.duplicateTo(distance, dir);
    return ell ? PathEllipse.fromEllipse(ell) : undefined;
  }

  getLength(): number {
    return this.auxEllipse.circum;
  }


  // Static Methods

  static fromEllipse(ell: Ellipse): PathEllipse {
    return new PathEllipse(ell.cx, ell.cy, ell.rx, ell.ry, AngDeg.ang2Deg(ell.rot));
  }

}

