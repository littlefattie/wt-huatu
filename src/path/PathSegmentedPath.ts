/**
 * The class implementation of Segmented Path, A collection (list) of segments (Line, Elliptical Arc, Bezier, etc.)
 */

import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgContinuousSegmentedPath,
  ISvgPath,
  ISvgPathSegment,
  ISvgPoint,
  ISvgSegmentedPath,
  TSvgLineJoin,
} from "../svg/ISvg.js";

import { PathGeneric } from "./PathGeneric.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import type { IGeometryModel } from "../geometry/IGeometry.js";
import { SegmentModel } from "../geometry/SegmentModel.js";
import { PathLine } from "./PathLine.js";
import { PathBezier2 } from "./PathBezier2.js";
import { PathBezier3 } from "./PathBezier3.js";
import { PathEllipticalArc } from "./PathEllipticalArc.js";
import { PathContinuousSegmentedPath } from "./PathContinuousSegmentedPath.js";
import Point from "../geometry/Point.js";
import { Bezier2, Bezier3 } from "../geometry/Bezier.js";
import LineSeg from "../geometry/LineSeg.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";

export type TPathSeg = PathLine | PathBezier2 | PathBezier3 | PathEllipticalArc;
export type TPathSegDuplicated = TPathSeg | PathSegmentedPath;

export class PathSegmentedPath extends PathGeneric implements ISvgSegmentedPath {
  public segments: ISvgPathSegment[] = [];
  public bboxes: ISvgBBox[] =[];

  constructor() {
    super();
  }

  getPathAttr(): string[] {
    return [`d="${this.buildPathData()}"`];
  }

  addSeg(...segs: ISvgPathSegment[]) {
    if (segs.length < 1) return;
    for (let i = 0; i < segs.length; i++) {
      const seg = PathSegmentedPath.copy(segs[i]);
      if (this.segments.length < 1) {     // The first segment
        seg.isStartSeg = true;
        this.bbox = seg.bbox;
      } else {
        let lastSeg = this.segments[this.segments.length - 1];
        if (lastSeg.closePath) seg.isStartSeg = true;
        else if (!Point.areIdentical(lastSeg.pEnd, seg.pStart, SegmentModel.DE_DUP_THRESHOLD)) seg.isStartSeg = true;
        this.bbox = this.bbox.mergeAnother(seg.bbox);
      }
      // Push the start point into Real points if is the start Seg
      if (seg.isStartSeg) this.realPoints.push(SvgPoint.from(seg.pStart));
      this.realPoints.push(SvgPoint.from(seg.pEnd));
      // Push to List
      this.segments.push(seg);
      this.bboxes.push(seg.bbox);
      this.auxPoints.push(...(seg.auxPoints ? seg.auxPoints.map(p => new SvgPoint(p.x, p.y)) : []));
      this.centers.push(...(seg.centers ? seg.centers.map(p => new SvgPoint(p.x, p.y)) : []));
      this.models.push(seg.auxModel as (Bezier2 | Bezier3 | LineSeg | EllipticalArc));
    }
  }

  closePath() {
    if (this.segments.length < 1) return;
    this.segments[this.segments.length - 1].closePath = true;
  }

  getPoint(loc: string): ISvgPoint | undefined {
    if (this.segments.length < 1) return undefined;
    if (loc === "s") return this.segments[0].pStart;
    if (loc === "e") return this.segments[this.segments.length - 1].pEnd;
    return undefined;
  }

  buildPathData(): string {
    return this.segments.map(s => s.buildSegPathData()).join(" ");
  }

  buildBBoxesSvg(): string {
    return `<g class="aux-bbox">\n`
      + `  <rect x="${this.bbox.x.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` y="${this.bbox.y.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` width="${this.bbox.w.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` height="${this.bbox.h.toFixed(SvgCsts.COORS_DIGITS)}" />\n`
      + this.bboxes.map(b => `  <rect x="${b.x.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` y="${b.y.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` width="${b.w.toFixed(SvgCsts.COORS_DIGITS)}"`
            + ` height="${b.h.toFixed(SvgCsts.COORS_DIGITS)}" />`)
            .join("\n")
      + `</g>`
  }

  moveBy(dx: number, dy: number): PathSegmentedPath | undefined {
    const newPath = new PathSegmentedPath();
    const newSegs = this.segments.map(s => {
      const seg = s.moveBy(dx, dy);
      if (seg) {
        seg.closePath = s.closePath;
      }
      return seg;
    });
    if (newSegs.filter(x => x === undefined).length > 0) return undefined;
    newPath.addSeg(...(newSegs as ISvgPathSegment[]));
    return newPath;
  }

  rotateBy(rotDeg: number, at?: ISvgPoint): PathSegmentedPath | undefined {
    const newPath = new PathSegmentedPath();
    const newSegs = this.segments.map(s => {
      const seg = s.rotateBy(rotDeg, at);
      if (seg) {
        seg.closePath = s.closePath;
      }
      return seg;
    });
    if (newSegs.filter(x => x === undefined).length > 0) return undefined;
    newPath.addSeg(...(newSegs as ISvgPathSegment[]));
    return newPath;
  }

  toContinuousSubs(): PathContinuousSegmentedPath[] {
    const subs: PathContinuousSegmentedPath[] = [];
    let subCont = new PathContinuousSegmentedPath();
    for (let i = 0; i < this.segments.length; i++) {
      if (i === 0) {
        subCont.addOneSeg(this.segments[i]);
      }  else {
        let segPrev = this.segments[i - 1],
            segCurr = this.segments[i];
        if (segPrev.closePath || (!Point.areIdentical(segPrev.pEnd, segCurr.pStart, SegmentModel.DE_DUP_THRESHOLD))) {
          subs.push(subCont);
          subCont = new PathContinuousSegmentedPath();
          subCont.addOneSeg(segCurr);
        } else {
          subCont.addOneSeg(segCurr);
        }
      }
    }
    if (subCont.segments.length > 0) subs.push(subCont);
    return subs;
  }

  reverse(): ISvgSegmentedPath {
    const path = new PathSegmentedPath();
    if (this.segments.length < 1) return path;
    const reversedSegs = this.toContinuousSubs()
      .map(g => g.reverse())
      .reverse()
      .map(g => g.segments)
      .flat()
    path.addSeg(...reversedSegs);
    return path;
  }
  
  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out", lineJoin?: TSvgLineJoin): ISvgPath | undefined {
    if (this.segments.length < 1) return undefined;
    const segGroups = this.toContinuousSubs();
    const newPath = new PathSegmentedPath();
    const dupSegs = segGroups.map(grp => grp.duplicateTo(distance, dir, lineJoin));
    if (dupSegs.filter(s => s === undefined).length > 0) return undefined;
    dupSegs.forEach(s => newPath.addSeg(...s!.segments));
    return newPath;
  }

  getSegs(reverse?: boolean, radius?: number | number[]): ISvgPathSegment[] {
    const segs = reverse ? this.reverse().segments : this.segments;
    if (!radius) return segs;
    return this.toContinuousSubs()
      .map(g => g.makeArcedSegs(radius))
      .flat();
  }

  /*--=================================== Static methods ===============================================--*/

  static getSegmentIntersection(seg1: ISvgPathSegment, t01: number, seg2: ISvgPathSegment, t02: number): SvgPoint | undefined {
    if (!seg1.auxModel || !seg2.auxModel) return undefined;
    const xp = SegmentModel.getIntersection(seg1.auxModel, t01, seg2.auxModel, t02);
    return xp ? new SvgPoint(xp.px, xp.py) : undefined;
  }

  static isSegment(path: ISvgPath): boolean {
    return (path instanceof PathLine ||
            path instanceof PathBezier2 ||
            path instanceof PathBezier3 ||
            path instanceof PathEllipticalArc
    );
  }

  static copy(seg: ISvgPathSegment): ISvgPathSegment {
    const segCopy = (seg instanceof PathBezier2) ? PathBezier2.fromBezier2(seg.auxModel)
      : (seg instanceof PathBezier3) ? PathBezier3.fromBezier3(seg.auxModel)
      : (seg instanceof PathEllipticalArc) ? (seg.auxModel ? PathEllipticalArc.fromArc(seg.auxModel) : new PathEllipticalArc())
      : PathLine.fromEnds(seg.pStart, seg.pEnd);
    segCopy.closePath = seg.closePath;
    return segCopy;
  }

  static fromModel(model: IGeometryModel): TPathSeg | undefined {
    if (model instanceof LineSeg) return PathLine.fromLineSeg(model);
    if (model instanceof EllipticalArc) return PathEllipticalArc.fromArc(model);
    if (model instanceof Bezier2) return PathBezier2.fromBezier2(model);
    if (model instanceof Bezier3) return PathBezier3.fromBezier3(model);
    return undefined;
  }
  
}
