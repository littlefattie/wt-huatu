/**
 * The class implementation of Segmented Path, A collection (list) of segments (Line, Elliptical Arc, Bezier, etc.)
 */

import type {
  ISvgBBox,
  ISvgContinuousSegmentedPath,
  ISvgPath,
  ISvgPathSegment,
  ISvgPoint,
  ISvgSegmentedPath,
  TSvgLineJoin,
} from "../svg/ISvg.js";

import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { PathLine } from "./PathLine.js";
import { PathBezier2 } from "./PathBezier2.js";
import { PathBezier3 } from "./PathBezier3.js";
import { PathEllipticalArc } from "./PathEllipticalArc.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { type TPathSeg, type TPathSegDuplicated,  PathSegmentedPath } from "./PathSegmentedPath.js";
import { SegmentModel } from "../geometry/SegmentModel.js";
import Point from "../geometry/Point.js";
import Line from "../geometry/Line.js";
import { WtMath } from "../math/WtMath.js";


export class PathContinuousSegmentedPath implements ISvgContinuousSegmentedPath {
  public segments: ISvgPathSegment[] = [];
  public isClosed: boolean = false;
  public pStart: ISvgPoint | undefined = undefined;
  public pEnd: ISvgPoint | undefined = undefined;

  public bbox: ISvgBBox;
  public bboxes: ISvgBBox[] =[];

  constructor() {
    this.bbox = SvgBBox.DUMMY;
  }

  addOneSeg(seg: ISvgPathSegment) {
    // If it is already closed, nothing will be added
    if (this.isClosed) return;
    if (this.segments.length < 1) {     // The first segment
      this.bbox = seg.bbox;
      this.pStart = seg.pStart;
    } else {
      this.bbox = this.bbox.mergeAnother(seg.bbox);
    }
    this.segments.push(seg);
    this.bboxes.push(seg.bbox);
    if (seg.closePath) {
      this.pEnd = this.pStart;
      this.isClosed = true;
    } else {
      this.pEnd = seg.pEnd;
    }
  }

  reverse(): ISvgContinuousSegmentedPath {
    const path = new PathContinuousSegmentedPath();
    const reversedSegs = this.segments
      .map(seg => seg.reverse())
      .filter(x => x !== undefined)
      .reverse() as ISvgPathSegment[];
    if (reversedSegs.length < 1) return path;
    if (this.isClosed) {
      reversedSegs[reversedSegs.length - 1].closePath = true;
    }
    reversedSegs.forEach(s => path.addOneSeg(s));
    return path;
  }

  makeArcedSegs(radius?: number | number[]): ISvgPathSegment[] {
    if (this.segments.length < 2) return this.segments;
    const segsArced: ISvgPathSegment[] = [];
    let N = this.isClosed ? this.segments.length : this.segments.length - 1,
        rs = WtMath.expandRadius(N, radius),
        segs = this.segments.map(s => PathSegmentedPath.copy(s));
    let rIdx = 0;
    // Dealing with closed path
    if (this.isClosed) {
      // Add the closing seg if required
      if (!Point.areIdentical(segs[segs.length - 1].pEnd, segs[0].pStart, SegmentModel.DE_DUP_THRESHOLD)) {
        segs.push(PathLine.fromEnds(segs[segs.length - 1].pEnd, segs[0].pStart));
      }
      // Deal with the first corner
      const segL = segs[segs.length - 1],
            segR = segs[0];
      if (segL.auxModel && segR.auxModel) {
        const rRes = SegmentModel.fitRadius(segL.auxModel, segR.auxModel, rs[0]);
        if (typeof rRes !== "string") {
          const subL = segL.makeSubPath(segL.pStart, rRes.pStart),
                arc  = PathEllipticalArc.fromStartEndPoints(rRes.pStart, rRes.pEnd, rs[0], rs[0], false, rRes.cw),
                subR = segR.makeSubPath(rRes.pEnd, segR.pEnd)!;
          segs[segs.length - 1] = subL!;
          segsArced.push(arc);
          segs[0] = subR;
        }
      }
      rIdx = 1;
    }
    for (let i = 0; i < segs.length - 1; i++) {
      const rUsed = rs[rIdx],
            segL = segs[i],
            segR = segs[i + 1];
      if (segL.auxModel && segR.auxModel) {
        const rRes = SegmentModel.fitRadius(segL.auxModel, segR.auxModel, rUsed);
        if (typeof rRes !== "string") {
          const subL = segL.makeSubPath(segL.pStart, rRes.pStart),
                arc  = PathEllipticalArc.fromStartEndPoints(rRes.pStart, rRes.pEnd, rUsed, rUsed, false, rRes.cw),
                subR = segR.makeSubPath(rRes.pEnd, segR.pEnd)!;
          segsArced.push(subL!, arc);
          segs[i + 1] = subR;
        } else {
          segsArced.push(segL);
        }
      } else {
        segsArced.push(segL);
      }
      rIdx++;
    }
    // Add the tail/last seg
    segsArced.push(segs[segs.length - 1]);
    // Add the pathClose flag
    if (this.isClosed) {
      segsArced[segsArced.length - 1].closePath = true;
    }
    return segsArced;
  }

  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out", lineJoin?: TSvgLineJoin): PathContinuousSegmentedPath | undefined {
    if (this.segments.length < 1) return undefined;
    let isCw = this.isCw();
    dir = dir === "in"  ? (isCw ? "right" : "left")
        : dir === "out" ? (isCw ? "left"  : "right")
        : dir;
    const segs = [...this.segments];
    // If closed path, append the last direct line segment
    if (this.isClosed) {
      if (!Point.areIdentical(segs[segs.length - 1].pEnd, segs[0].pStart, SegmentModel.DE_DUP_THRESHOLD)) {
        segs.push(PathLine.fromEnds(segs[segs.length - 1].pEnd, segs[0].pStart));
      }
    }
    const dupSegs = segs.map(x => x.duplicateTo(distance, dir));
    if (dupSegs.filter(s => s === undefined).length > 0) return undefined;

    const getSegType = (seg: ISvgPath) => {
      if (seg instanceof PathSegmentedPath) return "segs";
      if (seg instanceof PathLine ||
          seg instanceof PathBezier2 ||
          seg instanceof PathBezier3 ||
          seg instanceof PathEllipticalArc) return "seg";
      return "other";
    }
    const getStartPoint = (seg: TPathSegDuplicated) => {
      if (seg instanceof PathSegmentedPath) return seg.segments[0].pStart;
      else return seg.pStart;
    }
    const getEndPoint = (seg: TPathSegDuplicated) => {
      if (seg instanceof PathSegmentedPath) return seg.segments[seg.segments.length - 1].pEnd;
      else return seg.pEnd;
    }
    const resolveJoint = (segLeft: TPathSegDuplicated, segRight: TPathSegDuplicated): {
      left: TPathSegDuplicated;
      right: TPathSegDuplicated;
    } | undefined => {
      const pLeftEnd = getEndPoint(segLeft),
            pRightStart = getStartPoint(segRight);
      if (Point.areIdentical(pLeftEnd, pRightStart, SegmentModel.DE_DUP_THRESHOLD)) return {
        left: segLeft,
        right: segRight
      }
      const stLeft  = getSegType(segLeft),
            stRight = getSegType(segRight);
      if (stLeft === "segs") {
        const segsLeft = (segLeft as PathSegmentedPath).segments;
        const pnLeft = new PathSegmentedPath();
        if (stRight === "segs") {
          const segsRight = (segRight as PathSegmentedPath).segments;
          const pnRight = new PathSegmentedPath();
          for (let i = 0; i < segsLeft.length; i++) {
            const mdLeft  = segsLeft[i].auxModel;
            if (!mdLeft) return undefined;
            for (let j = 0; j < segsRight.length; j++) {
              const mdRight = segsRight[i].auxModel;
              if (!mdRight) return undefined;
              const xp = SegmentModel.getIntersection(mdLeft, 1, mdRight, 0);
              if (xp) {
                const pJoint = new SvgPoint(xp.px, xp.py),
                      sliceLeft = segsLeft[i].makeSubPath(segsLeft[i].pStart, pJoint),
                      sliceRight = segsRight[j].makeSubPath(pJoint, segsRight[i].pEnd);
                if (!sliceLeft || !sliceRight) return undefined;
                segsLeft.forEach((s, idx) => {
                  if (idx < i) pnLeft.addSeg(s);
                });
                pnLeft.addSeg(sliceLeft);
                pnRight.addSeg(sliceRight);
                segsRight.forEach((s, idx) => {
                  if (idx > j) pnRight.addSeg(s);
                });
                return {
                  left: pnLeft,
                  right: pnRight
                }
              }
            }
          }
        }
        else if (stRight === "seg") {
          const mdRight = (segRight as TPathSeg).auxModel;
          if (!mdRight) return undefined;
          for (let i = 0; i < segsLeft.length; i++) {
            const mdLeft = segsLeft[i].auxModel;
            if (!mdLeft) return undefined;
            const xp = SegmentModel.getIntersection(mdLeft, 1, mdRight, 0);
            if (xp) {
              const pJoint = new SvgPoint(xp.px, xp.py);
              const sliceLeft  = segsLeft[i].makeSubPath(segsLeft[i].pStart, pJoint),
                    sliceRight = (segRight as TPathSeg).makeSubPath(pJoint, (segRight as TPathSeg).pEnd);
              if (!sliceLeft || !sliceRight) return undefined;
              segsLeft.forEach((s, idx) => {
                if (idx < i) pnLeft.addSeg(s);
              });
              pnLeft.addSeg(sliceLeft);
              return {
                left: pnLeft,
                right: sliceRight
              }
            }
          }
        }
      }
      else if (stLeft === "seg") {
        const mdLeft  = (segLeft as TPathSeg).auxModel;
        if (!mdLeft) return undefined;
        if (stRight === "segs") {
          const segsRight = (segRight as PathSegmentedPath).segments;
          const pnRight = new PathSegmentedPath();
          for(let i = 0; i < segsRight.length; i++) {
            const mdRight = segsRight[i].auxModel;
            if (!mdRight) return undefined;
            const xp = SegmentModel.getIntersection(mdLeft, 1, mdRight, 0);
            if (xp) {
              const pJoint = new SvgPoint(xp.px, xp.py);
              const sliceLeft = (segLeft as TPathSeg).makeSubPath((segLeft as TPathSeg).pStart, pJoint),
                    sliceRight = segsRight[i].makeSubPath(pJoint, segsRight[i].pEnd);
              if (!sliceLeft || !sliceRight) return undefined;
              pnRight.addSeg(sliceRight);
              segsRight.forEach((s, idx) => {
                if (idx > i) pnRight.addSeg(s);
              });
              return {
                left: sliceLeft,
                right: pnRight,
              }
            }
          }
        }
        else if (stRight === "seg") {
          const mdRight = (segRight as TPathSeg).auxModel;
          if (!mdRight) return undefined;
          const xp = SegmentModel.getIntersection(mdLeft, 1, mdRight, 0);
          if (xp) {
            const pJoint = new SvgPoint(xp.px, xp.py);
            const sliceLeft  = (segLeft as TPathSeg).makeSubPath((segLeft as TPathSeg).pStart, pJoint),
                  sliceRight = (segRight as TPathSeg).makeSubPath(pJoint, (segRight as TPathSeg).pEnd);
            if (!sliceLeft || !sliceRight) return undefined;
            return {
              left: sliceLeft,
              right: sliceRight
            }
          }
        }
      }
      return undefined;
    }
    const getSegTanLine = (seg: TPathSegDuplicated, startOrEnd: "start" | "end") => {
      if (seg instanceof PathSegmentedPath) {
        let s = startOrEnd === "start" ? seg.segments[0] : seg.segments[seg.segments.length - 1];
        return s.auxModel?.getTangentLineOfPoint(startOrEnd === "start" ? s.pStart : s.pEnd);
      } else {
        return seg.auxModel?.getTangentLineOfPoint(startOrEnd === "start" ? seg.pStart : seg.pEnd)
      }
    }
    const buildLineJoinSegs = (segLeft: TPathSegDuplicated, segRight: TPathSegDuplicated): TPathSegDuplicated[] => {
      const ljSegs: TPathSegDuplicated[] = [];
      const pLeftEnd = getEndPoint(segLeft),
            pRightStart = getStartPoint(segRight),
            lnDirect = PathLine.fromEnds(pLeftEnd, pRightStart),
            lnLeft = getSegTanLine(segLeft, "end"),
            lnRight = getSegTanLine(segRight, "start");
      if (lineJoin === "round" && lnLeft && lnRight) {
        let isTurnCw = AngDeg.isFromToCw(lnLeft.ang, lnRight.ang),
            rArc = Math.abs(distance) * 1.025;
        ljSegs.push(PathEllipticalArc.fromStartEndPoints(pLeftEnd, pRightStart, rArc, rArc, false, isTurnCw));
      }
      else if (lineJoin === "miter" && lnLeft && lnRight) {
        let lnXp = Line.getXPoint(lnLeft, lnRight);
        if (lnXp) {
          let d1 = Point.getDistance(pLeftEnd, lnXp),
              d2 = Point.getDistance(pRightStart, lnXp),
              dMax = 5 * Math.abs(distance);
          if (d1 > dMax || d2 > dMax) {
            let pS = (lnLeft as Line).getPointByLen(Math.min(d1, dMax)),
                pE = (lnRight as Line).getPointByLen(-Math.min(d2, dMax));
            ljSegs.push(
              PathLine.fromEnds(pLeftEnd, pS),
              PathLine.fromEnds(pS,       pE),
              PathLine.fromEnds(pE,       pRightStart)
            );
          } else {
            ljSegs.push(
              PathLine.fromEnds(pLeftEnd, lnXp),
              PathLine.fromEnds(lnXp,     pRightStart)
            );
          }
        } else {
          ljSegs.push(lnDirect);
        }
      }
      else {
        ljSegs.push(lnDirect);
      }
      return ljSegs;
    }

    const resolvedSegs: TPathSegDuplicated[] = [];
    let sgLeft: null | TPathSegDuplicated = null,
        sgRight = dupSegs[dupSegs.length - 1] as TPathSegDuplicated;
    for(let i = 0; i < dupSegs.length - 1; i++) {
      const segLeft = sgLeft || (dupSegs[i] as TPathSegDuplicated),
            segRight = dupSegs[i + 1] as TPathSegDuplicated,
            joint = resolveJoint(segLeft, segRight);
      if (joint) {
        sgLeft = joint.right;
        sgRight = joint.right;
        resolvedSegs.push(joint.left);
      } else {
        // Push the original Left seg and Line Join Segs
        resolvedSegs.push(segLeft, ...buildLineJoinSegs(segLeft, segRight));
        // Update the Left Seg
        sgLeft = segRight;
        sgRight = segRight;
      }
    }
    // Deal with the first joint
    if (this.isClosed) {
      const segLeft = sgLeft || (dupSegs[dupSegs.length - 1] as TPathSegDuplicated),
            segRight = resolvedSegs[0],
            joint = resolveJoint(segLeft, segRight);
      if (joint) {
        resolvedSegs.push(joint.left);
        // update the first seg if crossed by last segment
        resolvedSegs[0] = joint.right;
      } else {
        // Push the original Left seg and Line Join Segs
        resolvedSegs.push(segLeft, ...buildLineJoinSegs(segLeft, segRight));
      }
    } else {
      resolvedSegs.push(sgRight);
    }

    const dupPath = new PathContinuousSegmentedPath();
    for (let i = 0; i < resolvedSegs.length; i++) {
      let seg = resolvedSegs[i];
      if (seg instanceof PathSegmentedPath) {
        seg.segments.forEach(s => dupPath.addOneSeg(s));
      } else {
        dupPath.addOneSeg(seg);
      }
    }
    if (this.isClosed) {
      dupPath.pEnd = dupPath.pStart;
      dupPath.isClosed = true;
      dupPath.segments[dupPath.segments.length - 1].closePath = true;
    }
    return dupPath;
  }

  isCw(): boolean | undefined {
    if (this.segments.length < 1) return undefined;
    const getSegCw = (seg: ISvgPathSegment): number | boolean | undefined => {
      if (seg instanceof PathLine) return seg.auxModel.ang;
      if (seg instanceof PathBezier2 || seg instanceof PathBezier3) return seg.auxModel.isCw();
      if (seg instanceof PathEllipticalArc) return seg.auxModel?.cw;
    }
    const judgeLineCw = (ang: number) => {
      return (ang >= AngDeg.DEG270 || (ang >= AngDeg.DEG0 && ang <= AngDeg.DEG90))
    }
    const seg1cw = getSegCw(this.segments[0]);
    if (typeof seg1cw !== "number") return seg1cw;
    const ang1 = seg1cw;
    if (this.segments.length < 2) return judgeLineCw(ang1);
    let idx = 1;
    while(idx < this.segments.length) {
      let segCw = getSegCw(this.segments[idx]);
      if (typeof segCw !== "number") return segCw;
      let ang2 = segCw;
      if (ang2 !== ang1) {
        return AngDeg.isFromToCw(ang1, ang2);
      }
    }
    return undefined;
  }

}
