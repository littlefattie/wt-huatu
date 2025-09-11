/**
 * The class implementation of SVG Line.
 */

import type {
  IFillConfig,
  IMarkerConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgShape,
  ISvgPath,
  ISvgPoint
} from "../svg/ISvg.js";
import { PathRect } from "../path/PathRect.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { SvgShapeGeneric } from "./SvgShapeGeneric.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Point from "../geometry/Point.js";
import { PathSegmentedPath } from "../path/PathSegmentedPath.js";
import { PathBezier3 } from "../path/PathBezier3.js";


export class SvgShapeHeart extends SvgShapeGeneric {

  constructor(
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
    ctrlLen4: number)
  {
    super();

    const ang1 = AngDeg.ensureUnder90(deg1);
    const ang2 = AngDeg.ensureUnder90(deg2);
    const ang3 = AngDeg.ensureUnder90(deg3);

    /** It can be stroked, but at default it has no stroke, you can stroke it by specifying some color */
    this.hasStroke = true;
    this.hasFill = true;
    this.fill = {
      color: SvgCsts.CONTEXT_STROKE,
    }

    this.primaryColor = "fill",
    this.secondaryColor = "stroke";
    
    const pUp = new Point(0, -h1);
    const pFar = new Point(-farPointX, -farPointY);
    const pDown = new Point(0, h2);

    const cpUp = pUp.moveByLenAndAng(ctrlLen1, AngDeg.fitAng(AngDeg.DEG270 - ang1));
    const cpFarPointUp = pFar.moveByLenAndAng(ctrlLen2, AngDeg.fitAng(AngDeg.DEG270 + ang2));
    const cpFarPointDown = pFar.moveByLenAndAng(ctrlLen3, AngDeg.fitAng(AngDeg.DEG90 + ang2));
    const cpDown = pDown.moveByLenAndAng(ctrlLen4, AngDeg.fitAng(AngDeg.DEG270 - ang3));

    const path = new PathSegmentedPath();
    path.addSeg(new PathBezier3(pUp, cpUp, cpFarPointUp, pFar));
    path.addSeg(new PathBezier3(pFar, cpFarPointDown, cpDown, pDown));
    path.addSeg(new PathBezier3(pDown, cpDown.mirrorX(), cpFarPointDown.mirrorX(), pFar.mirrorX()));
    path.addSeg(new PathBezier3(pFar.mirrorX(), cpFarPointUp.mirrorX(), cpUp.mirrorX(), pUp));
    path.closePath();

    this.bbox = path.bbox;

    this.paths = [ path ];
  }

}
