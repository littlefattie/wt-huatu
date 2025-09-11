import { WtMath } from "../math/WtMath.js";
import { AngDeg } from "./AngDeg.js";
import Angle from "./Angle.js";
import type {
  IPoint,
  ISegmentModel,
  ICurveFuncsByT,
  ISegmentIntersection,
  ISegmentJointRadiusResult
} from "./IGeometry.js";

import LineSeg from "./LineSeg.js";
import Point from "./Point.js";
import Vector from "./Vector.js";

export class SegmentModel {

  static DE_DUP_THRESHOLD = 3e-3;
  static ITER_CRITERIA = 3e-7;

  static ITER_COUNT_STEPS = [
    3000,
    5000,
    8000,
    9000,
    10000,
    12000,
    33000,      // A maximum of 80000 iterations will be made
  ]

  static ITER_STEP_ERRORS = [
    12,
    3e-1,
    1e-2,
    1e-3,
    1e-4,
    1e-5,
    1e-6,
  ]

  static calcInterSection(fxn1: ICurveFuncsByT, t01: number, fxn2: ICurveFuncsByT, t02: number, xCriteria: number, iterMax: number): ISegmentIntersection & {iterCount: number} {
    const fxn = (t1: number, t2: number) => (fxn1.px(t1) - fxn2.px(t2)) ** 2 + (fxn1.py(t1) - fxn2.py(t2)) ** 2;
    const dft1 = (t1: number, t2: number) =>  2 * (fxn1.px(t1) - fxn2.px(t2)) * fxn1.dpx(t1) + 2 * (fxn1.py(t1) - fxn2.py(t2)) * fxn1.dpy(t1);
    const dft2 = (t1: number, t2: number) => -2 * (fxn1.px(t1) - fxn2.px(t2)) * fxn2.dpx(t2) - 2 * (fxn1.py(t1) - fxn2.py(t2)) * fxn2.dpy(t2);
    let t1 = t01,
        t2 = t02,
        iterCount = 0,
        peakReached = false,
        fxnPrev = fxn(t1, t2);
    const alpha = 5e-7,
          dLimitMax = 5e-3 / alpha; // delta limit max
    let   dLimit1 = dLimitMax,
          dLimit2 = dLimitMax;
    while (fxnPrev > xCriteria && iterCount < iterMax) {
        let ft1 = dft1(t1, t2),
            ft1Abs = Math.abs(ft1),
            ft2 = dft2(t1, t2),
            ft2Abs = Math.abs(ft2);
        if (ft1Abs < dLimitMax && ft2Abs < dLimitMax) {
          if (ft1Abs > dLimit1) ft1 = Math.sign(ft1) * dLimit1;
          else if (peakReached) dLimit1 = ft1Abs;       // Narrow down the increments only when the distance starts turning larger
          if (ft2Abs > dLimit2) ft2 = Math.sign(ft2) * dLimit2;
          else if (peakReached) dLimit2 = ft2Abs;       // Narrow down the increments only when the distance starts turning larger
        } else {
          if (ft1Abs > dLimit1) ft1 = Math.sign(ft1) * dLimit1;
          if (ft2Abs > dLimit2) ft2 = Math.sign(ft2) * dLimit2;
        }
        t1 = t1 - alpha * ft1;
        t2 = t2 - alpha * ft2;
        t1 = WtMath.fitTin0and1(t1);
        t2 = WtMath.fitTin0and1(t2);
        const fxnVal = fxn(t1, t2);
        if (fxnVal > fxnPrev && !peakReached) {
          peakReached = true; 
        }
        fxnPrev = fxnVal;
        if (fxnPrev < xCriteria) {
          break;
        }
        iterCount++;
    }
    return {
        px: fxn1.px(t1),
        py: fxn1.py(t1),
        t1: t1,
        t2: t2,
        error: fxnPrev,
        iterCount: iterCount
    }
  }

  static getIntersection(model1: ISegmentModel, t01: number, model2: ISegmentModel, t02: number, knowns?: IPoint[], thDeDup?: number): ISegmentIntersection | undefined {
    if (model1 instanceof LineSeg && model2 instanceof LineSeg) {
      const xp = LineSeg.xPointOfTwo(model1, model2);
      return xp ? {
        px: xp.x,
        py: xp.y,
        t1: model1.getTofPoint(xp)!,
        t2: model2.getTofPoint(xp)!,
        error: 0,
      } : undefined;
    }

    const fxn1 = model1.getCurveFuncs(),
          fxn2 = model2.getCurveFuncs();
    if (!fxn1 || !fxn2) return undefined;

    const isPointKnown = (px: number, py: number) => {
      if (!knowns || knowns.length < 1) return false;
      const pt = new Point(px, py);
      for (let i = 0; i < knowns.length; i++) {
        if (Point.areIdentical(pt, knowns[i], thDeDup ?? SegmentModel.DE_DUP_THRESHOLD)) {
          return true;
        }
      }
      return false;
    }

    let sumIterCount = 0;
    for (let i = 0; i < SegmentModel.ITER_COUNT_STEPS.length; i++) {
      const stepTry = SegmentModel.calcInterSection(fxn1, t01, fxn2, t02, SegmentModel.ITER_CRITERIA, SegmentModel.ITER_COUNT_STEPS[i]);
      sumIterCount += stepTry.iterCount;
      if (stepTry.iterCount < SegmentModel.ITER_COUNT_STEPS[i]) {
        return {
          px: stepTry.px,
          py: stepTry.py,
          t1: stepTry.t1,
          t2: stepTry.t2,
          error: stepTry.error
        }
      }
      // Error too large, decide not trying any more
      if (stepTry.error > SegmentModel.ITER_STEP_ERRORS[i]) return undefined;
      // If ever resolved, skip further steps
      if (isPointKnown(stepTry.px, stepTry.py)) {
        return undefined;
      }
      // Set parameter to next step
      t01 = stepTry.t1;
      t02 = stepTry.t2;
    }
    return undefined;
  }

  static fitRadius(modelLeft: ISegmentModel, modelRight: ISegmentModel, rTarget: number): ISegmentJointRadiusResult | string {
    let errorMsg: string = "Radius resolving Failed!";
    // Make sure the two segments are connected
    if (!Point.areIdentical(modelLeft.pEnd, modelRight.pStart, 1e-3)) return `Segments are not connected thus cannot resolve radius!`;
    rTarget = Math.abs(rTarget);
    if (WtMath.isEqualOnTol(rTarget, 0, 1e-3)) return `No action will do for making 0-radius corners!`;
    // If they are both LineSegs
    if (modelLeft instanceof LineSeg && modelRight instanceof LineSeg) {
      let angDiff = AngDeg.fitAng(modelLeft.ang - modelRight.ang);
      if (WtMath.isEqualOnTol(angDiff, AngDeg.DEG0,   5e-4) ||
          WtMath.isEqualOnTol(angDiff, AngDeg.DEG180, 5e-4) ||
          WtMath.isEqualOnTol(angDiff, AngDeg.DEG360, 5e-4)) {
        return `Two LineSegs are identical/parallel, thus cannot resolve radius!`;
      }
      let mdAng = new Angle(modelLeft.pStart, modelLeft.pEnd, modelRight.pEnd),
          angDat = mdAng.getArcPoints(rTarget);
      if (!angDat.hasArc) return `No arc resolved for the two LineSegs!`;
      return {
        rResolved: angDat.r,
        cw: angDat.cw,
        pStart: angDat.pArcStart,
        pEnd: angDat.pArcEnd,
        arcCenter: angDat.arcCenter,
      }
    }

    // Normal method
    const fxnLeft  = modelLeft.getCurveFuncs(),
          fxnRight = modelRight.getCurveFuncs();
    if (!fxnLeft || !fxnRight) return `The two adjacent segments are not all valid, thus cannot resolve radius!`;
    let vec1 = new Vector(fxnLeft.dpx(1), fxnLeft.dpy(1)),
        vec2 = new Vector(fxnRight.dpx(0), fxnRight.dpy(0)),
        angDiff = AngDeg.fitAng(vec1.ang - vec2.ang);
    if (WtMath.isEqualOnTol(angDiff, AngDeg.DEG0, 5e-4) ||
        WtMath.isEqualOnTol(angDiff, AngDeg.DEG360, 5e-4)) {
      // The two segments are tangent, thus no need to return any error message
      // But Please know that, if the angle turns 180 degrees, it is not tangent or parallel
      return ``;
    }
    const arcSide = AngDeg.isFromToCw(vec1.ang, vec2.ang) ? "right" : "left";
    const fxnR2 = (t1: number, t2: number) => {
      const p1 = modelLeft.getNormalPoint(t1, rTarget, arcSide)!,
            p2 = modelRight.getNormalPoint(t2, rTarget, arcSide)!;
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }
    const dR2dt1 = (t1: number, t2: number) => {
      let delta = 1.2e-6;
      let dt1 = t1 < 1 - delta ? delta : -delta;
      return (fxnR2(t1 + dt1, t2) - fxnR2(t1, t2)) / dt1;
    }
    const dR2dt2 = (t1: number, t2: number) => {
      let delta = 1.1e-6;
      let dt2 = t2 < 1 - delta ? delta : -delta;
      return (fxnR2(t1, t2 + dt2) - fxnR2(t1, t2)) / dt2;
    }
    let t1 = 1,
        t2 = 0,
        p2p = fxnR2(t1, t2),
        xCriteria = 2e-3,
        iterMax = 30000,
        iterCount = 0;
    while (p2p > xCriteria && iterCount < iterMax) {
      let alpha = p2p > 4 ? 1e-5 : p2p > 0.1 ? 1e-6 : 1e-8;
      let t1n = t1 - dR2dt1(t1, t2) * alpha,
          t2n = t2 - dR2dt2(t1, t2) * alpha;
      t1 = WtMath.fitTin0and1(t1n);
      t2 = WtMath.fitTin0and1(t2n);
      p2p = fxnR2(t1, t2);
      iterCount++;
    }

    if (iterCount < iterMax) {
      let pStart = new Point(fxnLeft.px(t1), fxnLeft.py(t1)),
          pEnd = new Point(fxnRight.px(t2), fxnRight.py(t2)),
          tanLine1 = modelLeft.getTangentLineOfPoint(pStart),
          tanLine2 = modelRight.getTangentLineOfPoint(pEnd);
      if (!tanLine1 || !tanLine2) return errorMsg;
      return {
        t1: t1,
        t2: t2,
        pStart,
        pEnd,
        rResolved: rTarget,
        cw: AngDeg.isFromToCw(tanLine1.ang, tanLine2.ang),
        arcCenter: modelLeft.getNormalPoint(t1, rTarget, arcSide),
        iterCount
      }
    }
    
    return errorMsg;
  }

}

