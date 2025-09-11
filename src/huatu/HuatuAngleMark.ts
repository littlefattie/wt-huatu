
import type {
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuAngleMark,
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type {
  IFillConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgPath,
  ISvgPathSegment,
  ISvgPoint
} from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { WtMath } from "../math/WtMath.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { HuatuLabel } from "./HuatuLabel.js";
import LineSeg from "../geometry/LineSeg.js";
import Angle from "../geometry/Angle.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import { isValidColor } from "../tools/webColor.js";
import { HuatuStyle } from "./HuatuStyle.js";
import Circle from "../geometry/Circle.js";
import PolyLine from "../geometry/PolyLine.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";
import { PathPolyline } from "../path/PathPolyline.js";
import { PathPolygon } from "../path/PathPolygon.js";
import { PathEllipticalArc } from "../path/PathEllipticalArc.js";
import Line from "../geometry/Line.js";
import { PathSegmentedPath } from "../path/PathSegmentedPath.js";
import { PathLine } from "../path/PathLine.js";

export interface IHuatuAngleMarkParams {
  pA?: string;
  pB?: string;
  pC?: string;
  type?: string;
  lineWidth?: string;
  size?: string;
  large?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  showDeg?: boolean;
  degDigits?: number;
  showPerp?: boolean;       // Show as perpendicular
  label?: string;
  labelWidth?: string;
  labelHeight?: string;
  textSize?: string;
  textColor?: string;
  anchor?: string;
  startArrow?: boolean;
  labelPos?: number;
  labelOffset?: string;
}

export class HuatuAngleMark implements IHuatuAngleMark, IHuatuFinalDraw {
  // Type of the angle marks
  static TYPES: string[] = [
    "line1", "line2", "line3", "line4",
    "arrow-solid", "arrow-simple", "arrow-empty"
  ];
  static DEFAULT_ARC_LINE_WIDTH = 0.5;
  static DEFAULT_ARC_SIZE = 20;
  static DEFAULT_LABEL_WIDTH = 60;       // 3 chars
  static DEFAULT_LABEL_HEIGHT = 20;       // 3 chars
  static DEFAULT_FONT_SIZE = 16;

  static ARROW_OPEN_DEG = 42;
  static ARROW_LEN_TO_LINE_WIDTH = 4;

  angle: Angle;
  label?: HuatuLabel;
  labelLoc: SvgPoint;
  arcs: ISvgPath[] = [];
  arrow?: ISvgPath;
  arrowStart?: ISvgPath;
  fillArea?: ISvgPath;
  cfgFill?: IFillConfig;
  cfgStroke?: IStrokeConfig;

  pA: ISvgPoint;
  pB: ISvgPoint;
  pC: ISvgPoint;

  angStart: number;
  angEnd: number;
  angSmall: number;
  angLarge: number;

  type: string = "line1";
  lineWidth: number = HuatuAngleMark.DEFAULT_ARC_LINE_WIDTH;
  size: number = HuatuAngleMark.DEFAULT_ARC_SIZE;
  large: boolean = false;
  labelText?: string;
  labelWidth: number = HuatuAngleMark.DEFAULT_LABEL_WIDTH;
  labelHeight: number = HuatuAngleMark.DEFAULT_LABEL_HEIGHT;
  labelFontSize?: number;
  anchor?: string;
  isPerp: boolean = false;

  constructor(
    pA: ISvgPoint,
    pB: ISvgPoint,
    pC: ISvgPoint,
  ) {
    this.pA = pA;
    this.pB = pB;
    this.pC = pC;
    this.labelLoc = SvgPoint.from(pB);
    const lsStart = new LineSeg(pB, pA);
    const lsEnd = new LineSeg(pB, pC);
    this.angStart = lsStart.ang;
    this.angEnd = lsEnd.ang;
    this.angle = new Angle(pA, pB, pC);
    this.angSmall = this.angle.ang;
    this.angLarge = AngDeg.DEG360 - this.angSmall;
  }

  makeMark(type: string, size: number, large?: boolean, showPerp?: boolean, startArrow?: boolean, labelPos?: number) {
    this.size = size;
    const circ1 = new Circle(this.pB.x, this.pB.y, size);
    const p1Start = circ1.getPointAng(this.angStart),
          p1End = circ1.getPointAng(this.angEnd);
    // Handle Perpendicular mark
    if (WtMath.isEqual(this.angSmall, AngDeg.DEG90) && !large && showPerp) {
      let pMiddle: ISvgPoint = new SvgPoint(
        p1Start.x + p1End.x - this.pB.x,
        p1Start.y + p1End.y - this.pB.y
      );
      this.arcs = [
        new PathPolyline(p1Start, pMiddle, p1End),
      ];
      this.fillArea = new PathPolygon(this.pB, p1Start, pMiddle, p1End);
      this.isPerp = true;
      return;
    }
    if (large) {
      this.large = true;
    }
    const cwReal = (this.angle.cw && !large) || (!this.angle.cw && !!large);
    const kArrowLen = Math.min(HuatuAngleMark.ARROW_LEN_TO_LINE_WIDTH, this.size / this.lineWidth * 0.4);
    const arrowLen = this.lineWidth * kArrowLen;
    const arrowWidthHalf = arrowLen * Math.tan(AngDeg.deg2Ang(HuatuAngleMark.ARROW_OPEN_DEG / 2));
    const angBackOff = (arrowLen - this.lineWidth / 2) / circ1.r;
    let aroStartLineEnd: Line;
    let aroStartLineStart: Line;
    let r1 = circ1.r,
        r2 = r1 + 3 * this.lineWidth,
        r3 = r2 + 3 * this.lineWidth,
        r4 = r3 + 3 * this.lineWidth;
    let arc1,
        arc2,
        arc3,
        arc4;
    // Handle if the angle has zero degree, and build arcs
    if (WtMath.isZero(this.angSmall)) {
      const buildArc = (r: number) => {
        const arc = new PathSegmentedPath();
        const circArc = new Circle(circ1.cx, circ1.cy, r);
        const pm1 = circArc.getPointAng(this.angStart + AngDeg.DEG120),
              pm2 = circArc.getPointAng(this.angStart + AngDeg.DEG120 + AngDeg.DEG120);
        arc.addSeg(PathEllipticalArc.fromStartEndPoints(circArc.getPointAng(this.angStart), pm1, r, r, false, true, 0));
        arc.addSeg(PathEllipticalArc.fromStartEndPoints(pm1, pm2, r, r, false, true, 0));
        arc.addSeg(PathEllipticalArc.fromStartEndPoints(pm2, circArc.getPointAng(this.angEnd), r, r, false, true, 0));
        return arc;
      }
      if (this.large) {
        arc1 = buildArc(r1);
        arc2 = buildArc(r2);
        arc3 = buildArc(r3);
        arc4 = buildArc(r4);
        const angArrowStart = AngDeg.fitAng(this.angEnd - angBackOff);
        aroStartLineEnd = new Line(circ1.getPointAng(angArrowStart), angArrowStart);
        const angArrowStart2 = AngDeg.fitAng(this.angEnd + angBackOff);
        aroStartLineStart = new Line(circ1.getPointAng(angArrowStart2), angArrowStart2);
      } else {
        // Nothing to do when the angle is zero
        return;
      }
    } else {
      let circ = new Circle(circ1.cx, circ1.cy, r1);
      arc1 = PathEllipticalArc.fromStartEndPoints(circ.getPointAng(this.angStart), circ.getPointAng(this.angEnd), r1, r1, !!large, cwReal, 0);      
      const angArrowStart = AngDeg.fitAng(this.angEnd + (cwReal ? -angBackOff : angBackOff));
      aroStartLineEnd = new Line(circ.getPointAng(angArrowStart), angArrowStart);
      const angArrowStart2 = AngDeg.fitAng(this.angStart + (cwReal ? angBackOff : -angBackOff));
      aroStartLineStart = new Line(circ.getPointAng(angArrowStart2), angArrowStart2);

      circ = new Circle(circ1.cx, circ1.cy, r2);
      arc2 = PathEllipticalArc.fromStartEndPoints(circ.getPointAng(this.angStart), circ.getPointAng(this.angEnd), r2, r2, !!large, cwReal, 0);
      circ = new Circle(circ1.cx, circ1.cy, r3);
      arc3 = PathEllipticalArc.fromStartEndPoints(circ.getPointAng(this.angStart), circ.getPointAng(this.angEnd), r3, r3, !!large, cwReal, 0);
      circ = new Circle(circ1.cx, circ1.cy, r4);
      arc4 = PathEllipticalArc.fromStartEndPoints(circ.getPointAng(this.angStart), circ.getPointAng(this.angEnd), r4, r4, !!large, cwReal, 0);
    }
    const findArcPointAtT = (arc: PathEllipticalArc | PathSegmentedPath, t?: number) => {
      t = t === undefined ? 0.5
        : WtMath.isIn0and1(t) ? t
        : 0.5;
      if (arc instanceof PathEllipticalArc) {
        return SvgPoint.from(arc.auxModel!.getPoint(t)!);
      } else {
        return SvgPoint.from((arc.segments[1] as PathEllipticalArc).auxModel!.getPoint(t)!);
      }
    }
    const buildArcFillArea = (arc: PathEllipticalArc | PathSegmentedPath) => {
      let arcSegs: ISvgPathSegment[];
      let pStart, pEnd;
      if (arc instanceof PathEllipticalArc) {
        pStart = arc.pStart;
        pEnd = arc.pEnd;
        arcSegs = [arc];
      } else {
        arcSegs = arc.segments;
        pStart = arc.segments[0].pStart;
        pEnd = arc.segments[arc.segments.length - 1].pEnd;
      }
      const fillArea = new PathSegmentedPath();
      fillArea.addSeg(PathLine.fromEnds(this.pB, pStart))
      fillArea.addSeg(...arcSegs);
      fillArea.addSeg(PathLine.fromEnds(pEnd, this.pB));
      fillArea.closePath();
      return fillArea;
    }
    // Add arrows
    if (type.startsWith("arrow")) {
      // Only One arc
      this.arcs = [ arc1 ];
      const pArrow1 = aroStartLineEnd.getPointByLen(arrowWidthHalf);
      const pArrow2 = circ1.getPointAng(this.angEnd);
      const pArrow3 = aroStartLineEnd.getPointByLen(-arrowWidthHalf);
      if (type === "arrow-solid") {
        this.arrow = new PathPolygon(pArrow1, pArrow2, pArrow3);
      } else if (type === "arrow-simple") {
        this.arrow = new PathPolyline(pArrow1, pArrow2, pArrow3);
      } else if (type === "arrow-empty") {
        this.arrow = new PathPolygon(pArrow1, pArrow2, pArrow3);
      }
      // Check if Start Arrow needed
      if (!!startArrow) {
        const pAro1 = aroStartLineStart.getPointByLen(arrowWidthHalf);
        const pAro2 = circ1.getPointAng(this.angStart);
        const pAro3 = aroStartLineStart.getPointByLen(-arrowWidthHalf);
        if (type === "arrow-solid") {
          this.arrowStart = new PathPolygon(pAro1, pAro2, pAro3);
        } else if (type === "arrow-simple") {
          this.arrowStart = new PathPolyline(pAro1, pAro2, pAro3);
        } else if (type === "arrow-empty") {
          this.arrowStart = new PathPolygon(pAro1, pAro2, pAro3);
        }
      }
      this.labelLoc = findArcPointAtT(arc1, labelPos);
      this.fillArea = buildArcFillArea(arc1);
    } else {
      if (type === "line1") {
        this.arcs = [arc1];
        this.labelLoc = findArcPointAtT(arc1, labelPos);
        this.fillArea = buildArcFillArea(arc1);
      } else if (type === "line2") {
        this.arcs = [arc1, arc2];
        this.labelLoc = findArcPointAtT(arc2, labelPos);
        this.fillArea = buildArcFillArea(arc2);
      } else if (type === "line3") {
        this.arcs = [arc1, arc2, arc3];
        this.labelLoc = findArcPointAtT(arc3, labelPos);
        this.fillArea = buildArcFillArea(arc3);
      } else if (type === "line4") {
        this.arcs = [arc1, arc2, arc3, arc4];
        this.labelLoc = findArcPointAtT(arc4, labelPos);
        this.fillArea = buildArcFillArea(arc4);
      }
    }
    this.type = type;
  }

  setLabelText(text?: string, showDeg?: boolean, degDigits?: number) {
    if (showDeg) {
      this.labelText = `$${AngDeg.ang2Deg(this.large ? this.angLarge : this.angSmall).toFixed(degDigits ?? 0)}\\degree$`;
    } else {
      this.labelText = text ?? "";
    }
  }

  makeLabel(anchor?: string, labelWidth?: number, labelHeight?: number, textSize?: number, textColor?: string, labelOffset?: ISvgPoint) {
    if (!this.labelText) return;
    if (anchor && HuatuLabel.ANCHOR_POSITIONS.includes(anchor)) {
      this.anchor = anchor;
    }
    if (labelWidth) {
      this.labelWidth = labelWidth;
    }
    if (labelHeight) {
      this.labelHeight = labelHeight;
    }
    this.label = new HuatuLabel(this.labelText, this.labelWidth, this.labelHeight);
    this.label.location = this.labelLoc;
    if (textSize) {
      this.label.fontSize = textSize;
    }
    this.label.setAnchor(this.anchor || "bl");
    if (this.label.anchorX === 1) {
      this.label.textAlign = "left";
    } else if (this.label.anchorX === -1) {
      this.label.textAlign = "right";
    } else {
      this.label.textAlign = "center";
    }
    if (textColor) {
      this.label.color = textColor;
    }
    if (labelOffset) {
      this.label.anchorOffset = labelOffset;
    }
  }

  setStroke(lineWidth: number, color?: string) {
    if (lineWidth > 0 && lineWidth < 50) this.lineWidth = lineWidth;
    this.cfgStroke = {
      width: this.lineWidth,
      color: color || "currentColor",
    };
  }

  setFill(fillColor: string, fillOpacity?: number) {
    this.cfgFill = {
      color: fillColor,
    };
    if (fillOpacity && WtMath.isIn0and1(fillOpacity)) {
      this.cfgFill.opacity = fillOpacity;
    }
  }

  // Get the BBOX
  getBBox(): ISvgBBox {
    // If no arc need to draw
    if (this.arcs.length < 1) return SvgBBox.DUMMY;
    let bboxArc: ISvgBBox;
    if (this.cfgFill && this.fillArea) {
      bboxArc = this.fillArea.bbox;
    } else {
      bboxArc = SvgBBox.mergeBoxes(this.arcs.map(x => x.bbox));
    }
    if (!this.isPerp && this.label) {
      return bboxArc.mergeAnother(this.label.getBBox());
    } else {
      return bboxArc;
    }
  }

  buildHtml(buildType: SvgBuildType): string {
    if (this.arcs.length < 1) return "";        // Return nothing if text is not presented
    if (!this.cfgStroke) {
      this.cfgStroke = {
        color: "currentColor",
        width: this.lineWidth
      }
    }
    const htConfig = globalThis.wtHuatuConfig;
    const svgFill = this.cfgFill && this.fillArea ? this.fillArea.buildHtmlFull(undefined, this.cfgFill) : "";
    const svgArcs = this.arcs.map(a => a.buildHtmlFull(this.cfgStroke)).join("\n");
    const cfgArrowStroke: IStrokeConfig = {
      color: this.cfgStroke.color,
      lineJoin: "round",
      lineCap: "round",
      width: this.cfgStroke.width,
    }
    const cfgArrowFill: IFillConfig | undefined
      = this.cfgStroke && this.cfgStroke.color
        ? { color: this.cfgStroke.color }
        : undefined;
    const svgArrow = this.arrow
      ? this.arrow.buildHtmlFull(
          cfgArrowStroke,
          this.type === "arrow-solid" ? cfgArrowFill : undefined)
      : "";
    const svgArrowStart = this.arrowStart
      ? this.arrowStart.buildHtmlFull(
          cfgArrowStroke,
          this.type === "arrow-solid" ? cfgArrowFill : undefined)
      : "";
    const svgLabel = !this.isPerp && this.label
      ? this.label.buildHtml(buildType)
      : "";
    const anchorMark = htConfig && htConfig.markPositions
      ? `<circle cx="${this.labelLoc.x}" cy="${this.labelLoc.y}" r="0.5" class="wthuatu-mark-position-${globalThis.wthtJobBuildId}" />`
      : ``;
    const bboxSvg = globalThis.wtHuatuConfig && globalThis.wtHuatuConfig.showBBox
      ? `${this.getBBox().buildRectSvg(true)}`
      : ``;
    return `<g>\n`
      + svgFill + `\n`
      + svgArcs + `\n`
      + svgArrow + svgArrowStart + `\n`
      + svgLabel + `\n`
      + anchorMark + `\n`
      + bboxSvg + `\n`
      + `</g>`;
  }

  /* ----------------------------- Static methods  -----------------------------  */

  static optsAngleMarkDef: IKeyValueOptions = {
    keys: [
      // Points
      ["pA"],
      ["pB"],
      ["pC"],
      // Style keys
      ["type"],
      ["lineWidth", "strokeWidth"],
      ["size"],
      ["large"],
      ["fill"],
      ["fillOpacity"],
      ["fillColor"],
      ["strokeColor"],
      ["showDeg"],
      ["degDigits"],
      ["showPerp"],
      ["label"],
      ["labelWidth", "lw"],
      ["labelHeight", "lh"],
      ["textSize"],
      ["textColor"],
      ["anchor"],
      ["startArrow"],
      ["labelPos"],
      ["labelOffset", "offset"],
    ],
    allowAppend: ["fill"],
    booleans: ["large", "showDeg", "showPerp", "startArrow"],
    ints: ["degDigits"],
    numbers: [
      "fillOpacity",
      "labelPos",
    ],
    qualifiers: {
      "fillColor": isValidColor,
      "strokeColor": isValidColor,
      "textColor": isValidColor,
      "type": HuatuAngleMark.TYPES,
    },
    blindGuess: {
      "pA": x => x,
      "pB": x => x,
      "pC": x => x,
      "strokeColor": isValidColor,
      "type": HuatuAngleMark.TYPES,
      "anchor": HuatuLabel.ANCHOR_POSITIONS,
    },
    subKeys: {
      "fill": HuatuStyle.optsFillColorAndOpacity,
    }
  };

}
