
import type {
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuDimMark,
  HuatuDimMarkType,
  HuatuDimMarkArrowType,
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
import { PathLines } from "../path/PathLines.js";
import { type IPoint } from "../geometry/IGeometry.js";
import { Intersection } from "../geometry/Intersection.js";

export interface IHuatuDimMarkParams {
  from?: string;              // The start point of this mark
  to?: string;                // The end Point of this mark
  type?: string;              // This would be 'h'/'hori'/'horizontal'/, 'v'/'vert'/'vertical', 'line',
  dir?: string;               // This would be 'right', or 'left'
  gap?: string;               // The gap between the line and bar
  barWidth?: string;
  lineWidth?: string;
  barLen?: string;            // Length of the limit bar
  linePos?: number;           // Position ratio of the line respect to bar length
  noStartBar?: boolean;       // Whether not drawing the start bar
  noEndBar?: boolean;         // Whether not drawing the end bar
  noStartArrow?: boolean;     // Whether not drawing the start arrow
  noEndArrow?: boolean;       // Whether not drawing the end arrow
  barLenEqual?: boolean;      // Whether not Making the bars same length when H/V dims
  barColor?: string;          // Color of the bars
  lineColor?: string;         // Color of the Dime line
  arrow?: string;             // 'empty', 'solid', or 'simple' arrow to draw
  label?: string;
  labelWidth?: string;
  labelHeight?: string;
  textSize?: string;
  textColor?: string;
  labelOnLine?: boolean;
  labelFill?: string;
  labelBorder?: string;
  rotateLabel?: boolean;      // This will only work when the mark has a type of 'line'
  remotePos?: string;         // This is to make the label some distance to the mark
  showLength?: boolean;       // Where show the Length of Dimension
  lenDigits?: number;         // How many digits of the length of dimension
}

export interface IHuatuDimMarkConfig {
  type: HuatuDimMarkType,
  dir: "right" | "left",
  gap?: number;
  barWidth?: number;
  barLength?: number;
  barLenEqual?: boolean;
  lineWidth?: number;
  linePos?: number;
  barColor?: string;          // Color of the bars
  lineColor?: string;         // Color of the Dime line
  noStartBar?: boolean;
  noEndBar?: boolean;
  noStartArrow?: boolean;
  noEndArrow?: boolean;
  labelText?: string;
  labelFontSize?: number;
  labelWidth?: number;
  labelHeight?: number;
  labelColor?: string;
  labelBackground?: string;
  labelBorderColor?: string;
  rotateLabel?: boolean;
  showLength?: boolean;
  lenDigits?: number;
  labelOnLine?: boolean;
  arrowType?: HuatuDimMarkArrowType;
  remotePos?: ISvgPoint;         // This is to make the label some distance to the mark
}

export class HuatuDimMark implements IHuatuDimMark, IHuatuFinalDraw {
  // Type of the angle marks
  static TYPES: string[] = [
    "h", "hori", "horizontal",
    "v", "vert", "vertical",
    "line",
  ];
  static DIRS: string[] = ["right", "left"];
  static ARROW_TYPES: string[] = ["simple", "empty", "solid", "none"];
  static DEFAULT_BAR_WIDTH = 0.5;
  static DEFAULT_LINE_WIDTH = 0.5;
  static DEFAULT_GAP = 2;
  static DEFAULT_LABEL_WIDTH = 60;       // 3 chars
  static DEFAULT_LABEL_HEIGHT = 20;       // 3 chars
  static DEFAULT_FONT_SIZE = 16;
  static DEFAULT_BAR_LENGTH = 24;
  static DEFAULT_LINE_POS = 0.45;

  type: HuatuDimMarkType = "hori";
  dir: "right" | "left" = "right";

  pStart: ISvgPoint = new SvgPoint(0, 0);
  pEnd: ISvgPoint = new SvgPoint(0, 0);
  gap: number = HuatuDimMark.DEFAULT_GAP;

  isHori: boolean = false;
  isVert: boolean = false;
  isValid: boolean = true;
  isZeroDim: boolean = false;

  barWidth: number = HuatuDimMark.DEFAULT_BAR_WIDTH;
  lineWidth: number = HuatuDimMark.DEFAULT_LINE_WIDTH;
  barLength: number = HuatuDimMark.DEFAULT_BAR_LENGTH;
  linePos: number = HuatuDimMark.DEFAULT_LINE_POS;

  hasStartBar: boolean = true;
  hasEndBar: boolean = true;
  hasStartArrow: boolean = true;
  hasEndArrow: boolean = true;
  barLenEqual: boolean = false;

  cfgBar: IStrokeConfig = {
    color: "currentColor",
    width: this.barWidth,
  };
  cfgLine: IStrokeConfig = {
    color: "currentColor",
    width: this.lineWidth,
  };
  cfgArrowStroke: IStrokeConfig = {
    color: "currentColor",
    width: this.lineWidth,
  };
  cfgArrowFill: IFillConfig = {
    color: "currentColor",
  }
  arrowType: HuatuDimMarkArrowType = "simple";

  label?: HuatuLabel;

  labelText?: string;
  labelWidth: number = HuatuDimMark.DEFAULT_LABEL_WIDTH;
  labelHeight: number = HuatuDimMark.DEFAULT_LABEL_HEIGHT;
  labelFontSize?: number;
  labelTextColor?: string | undefined;
  labelBackground?: string | undefined;
  labelBorderColor?: string | undefined;

  labelOnLine: boolean = false;
  rotateLabel: boolean = false;
  remotePos?: ISvgPoint;
  // The line of "FROM" and "TO"
  dimLine: LineSeg;
  // The limit bars
  barStart?: PathLine;
  barEnd?: PathLine;
  // The line of the "DIM MARK"
  markLines: ISvgPath[] = [];
  // Arrow of start and end
  arrowStart?: ISvgPath;
  arrowEnd?: ISvgPath;

  pathsToDraw: ISvgPath[] = [];

  constructor(
    pStart: ISvgPoint,
    pEnd: ISvgPoint,
  ) {
    this.dimLine = new LineSeg(pStart, pEnd);
    if (WtMath.isZero(this.dimLine.len)) {
      this.isValid = false;
      return;
    }
    this.isHori = WtMath.isZero(pStart.y - pEnd.y);
    this.isVert = WtMath.isZero(pStart.x - pEnd.x);
    this.pStart = SvgPoint.from(pStart);
    this.pEnd = SvgPoint.from(pEnd);
  }

  makeMark(config: IHuatuDimMarkConfig) {
    if (!this.isValid) return;
    // Override default configs
    this.type = config.type;
    this.dir = config.dir;
    if (config.gap !== undefined && config.gap >= 0) this.gap = config.gap;
    if (config.barLength && config.barLength > 0) this.barLength = config.barLength;
    if (config.barWidth && config.barWidth > 0) this.barWidth = config.barWidth;
    if (config.lineWidth && config.lineWidth > 0) this.lineWidth = config.lineWidth;
    if (config.linePos !== undefined && WtMath.isIn0and1(config.linePos)) this.linePos = config.linePos;
    if (config.lineColor) {
      this.cfgLine.color = config.lineColor;
      this.cfgArrowStroke.color = config.lineColor;
      this.cfgArrowFill.color = config.lineColor;
    }
    if (config.barColor) this.cfgBar.color = config.barColor;
    if (!!config.noStartBar) this.hasStartBar = false;
    if (!!config.noEndBar) this.hasEndBar = false;
    if (!!config.noStartArrow) this.hasStartArrow = false;
    if (!!config.noEndArrow) this.hasEndArrow = false;
    if (!!config.barLenEqual) this.barLenEqual = true;
    // If it is already Hori/Vert, then re-assign type accordingly
    if (this.isHori) this.type = "hori";
    else if (this.isVert) this.type = "vert";
    // Build Bars and Mark Line
    let lnBarStart: Line,
        lnBarEnd: Line,
        lsMark: LineSeg,
        pMidMarkLine: IPoint,
        extrudeToSouth: boolean = true,
        extrudeToEast: boolean = true;
    if (this.type === "line") {
      lnBarStart = new Line(this.pStart, this.dimLine.ang + AngDeg.DEG90);
      lnBarEnd = new Line(this.pEnd, lnBarStart.ang);
      const k = this.dir === "right" ? 1 : -1;
      if (this.hasStartBar) {
        this.barStart = PathLine.fromLineSeg(lnBarStart.buildSeg(k * this.gap, k * (this.gap + this.barLength)));
      }
      if (this.hasEndBar) {
        this.barEnd = PathLine.fromLineSeg(lnBarEnd.buildSeg(k * this.gap, k * (this.gap + this.barLength)));
      }
      const markPosLen = this.gap + this.linePos * this.barLength;
      const pMarkStart = lnBarStart.getPointByLen(k * markPosLen);
      const pMarkEnd = lnBarEnd.getPointByLen(k * markPosLen);
      lsMark = new LineSeg(pMarkStart, pMarkEnd);
      pMidMarkLine = lsMark.middle;
    } else if (this.type === "hori") {
      if (this.isVert) {
        this.isZeroDim = true;
        return;
      }
      extrudeToSouth = (this.dimLine.deg > 90 && this.dimLine.deg <= 270 && this.dir === "left") ||
                       ((this.dimLine.deg > 270 || this.dimLine.deg <= 90) && this.dir === "right");
      let k, yFar, yBarEnd, yMarkPos;
      if (extrudeToSouth) {
        k = 1;
        yFar = Math.max(this.pStart.y, this.pEnd.y);
      } else {
        k = -1;
        yFar = Math.min(this.pStart.y, this.pEnd.y);
      }
      yBarEnd = yFar + k * (this.gap + this.barLength);
      yMarkPos = yFar + k * (this.gap + this.barLength * this.linePos);
      if (this.hasStartBar) {
        let yBarStart = (this.barLenEqual ? yFar : this.pStart.y) + k * this.gap;
        this.barStart = PathLine.fromLineSeg(LineSeg.fromXYs(this.pStart.x, yBarStart, this.pStart.x, yBarEnd));
      }
      if (this.hasEndBar) {
        let yBarStart = (this.barLenEqual ? yFar : this.pEnd.y) + k * this.gap;
        this.barEnd = PathLine.fromLineSeg(LineSeg.fromXYs(this.pEnd.x, yBarStart, this.pEnd.x, yBarEnd));
      }
      lsMark = LineSeg.fromXYs(this.pStart.x, yMarkPos, this.pEnd.x, yMarkPos);
      pMidMarkLine = lsMark.middle;
    } else {
      if (this.isHori) {
        this.isZeroDim = true;
        return;
      }
      extrudeToEast = (this.dimLine.deg > 180 && this.dir === "right") ||
                      (this.dimLine.deg <= 180 && this.dir === "left");
      let k, xFar, xBarEnd, xMarkPos;
      if (extrudeToEast) {
        k = 1;
        xFar = Math.max(this.pStart.x, this.pEnd.x);
      } else {
        k = -1;
        xFar = Math.min(this.pStart.x, this.pEnd.x);
      }
      xBarEnd = xFar + k * (this.gap + this.barLength);
      xMarkPos = xFar + k * (this.gap + this.barLength * this.linePos);
      if (this.hasStartBar) {
        let xBarStart = (this.barLenEqual ? xFar : this.pStart.x) + k * this.gap;
        this.barStart = PathLine.fromLineSeg(LineSeg.fromXYs(xBarStart, this.pStart.y, xBarEnd, this.pStart.y));
      }
      if (this.hasEndBar) {
        let xBarStart = (this.barLenEqual ? xFar : this.pEnd.x) + k * this.gap;
        this.barEnd = PathLine.fromLineSeg(LineSeg.fromXYs(xBarStart, this.pEnd.y, xBarEnd, this.pEnd.y));
      }
      lsMark = LineSeg.fromXYs(xMarkPos, this.pStart.y, xMarkPos, this.pEnd.y);
      pMidMarkLine = lsMark.middle;
    }
    // Make Arrow
    const arrowOpenAngHalf = AngDeg.deg2Ang(42/2);
    if (config.arrowType) this.arrowType = config.arrowType;
    if (this.arrowType !== "none") {
      let arrowEdgeLen = this.lineWidth * 8,
          lnEndLeft    = new Line(lsMark.pEnd, lsMark.ang + arrowOpenAngHalf + AngDeg.DEG180),
          lnEndRight   = new Line(lsMark.pEnd, lsMark.ang - arrowOpenAngHalf + AngDeg.DEG180),
          pEndLeft     = lnEndLeft.getPointByLen(arrowEdgeLen),
          pEndRight    = lnEndRight.getPointByLen(arrowEdgeLen),
          lnStartLeft  = new Line(lsMark.pStart, lsMark.ang + arrowOpenAngHalf),
          lnStartRight = new Line(lsMark.pStart, lsMark.ang - arrowOpenAngHalf),
          pStartLeft   = lnStartLeft.getPointByLen(arrowEdgeLen),
          pStartRight  = lnStartRight.getPointByLen(arrowEdgeLen);
      if (this.arrowType === "simple") {
        if (this.hasStartArrow) this.arrowStart = new PathPolyline(pStartLeft, lsMark.pStart, pStartRight);
        if (this.hasEndArrow) this.arrowEnd = new PathPolyline(pEndLeft, lsMark.pEnd, pEndRight);
      } else if (this.arrowType === "solid" || this.arrowType === "empty") {
        if (this.hasStartArrow) this.arrowStart = new PathPolygon(pStartLeft, lsMark.pStart, pStartRight);
        if (this.hasEndArrow) this.arrowEnd = new PathPolygon(pEndLeft, lsMark.pEnd, pEndRight);
      }
    }
    // Make Label
    if (!!config.labelText) {
      this.labelText = config.labelText;
    } else if (!!config.showLength) {
      let len2Show = this.type === "line" ? this.dimLine.len
        : this.type === "hori" ? Math.abs(this.dimLine.pStart.x - this.dimLine.pEnd.x)
        : Math.abs(this.dimLine.pStart.y - this.dimLine.pEnd.y);
      this.labelText = len2Show.toFixed(config.lenDigits || 0);
    }
    if (config.labelWidth && config.labelWidth > 0) this.labelWidth = config.labelWidth;
    if (config.labelHeight && config.labelHeight > 0) this.labelHeight = config.labelHeight;
    if (this.labelText) {
      this.label = new HuatuLabel(this.labelText, this.labelWidth, this.labelHeight);
    }
    if (this.label) {
      if (config.labelColor) {
        this.labelTextColor = config.labelColor;
        this.label.color = this.labelTextColor;
      }
      if (config.labelBackground) {
        this.labelBackground = config.labelBackground;
        this.label.bgColor = this.labelBackground;
      }
      if (config.labelFontSize) {
        this.labelFontSize = config.labelFontSize;
        this.label.fontSize = this.labelFontSize;
      }
      if (config.labelBorderColor) {
        this.labelBorderColor = config.labelBorderColor;
        this.label.borderColor = this.labelBorderColor;
      }
      this.labelOnLine = !!config.labelOnLine;
      if (!!config.rotateLabel) {
        this.rotateLabel = true;
      }
      if (config.remotePos) {
        this.remotePos = config.remotePos;
      }
      if (this.remotePos) {
        this.label.location = this.remotePos;
        let alignLeft = this.remotePos.x >= pMidMarkLine.x;
        let alignTop = this.remotePos.y <= pMidMarkLine.y;
        if (lsMark.len > 16) {
          this.markLines = [PathLine.fromLineSeg(lsMark)];
        } else {
          this.markLines = [];
          this.arrowStart = undefined;
          this.arrowEnd = undefined;
        }
        let pLabelFar: ISvgPoint;
        if (alignLeft) {
          this.label.setAnchor(alignTop ? "bl" : "tl");
          pLabelFar = new SvgPoint(this.label.location.x + this.labelWidth, this.label.location.y);
        } else {
          this.label.setAnchor(alignTop ? "br" : "tr");
          pLabelFar = new SvgPoint(this.label.location.x - this.labelWidth, this.label.location.y);
        }
        this.markLines.push(new PathPolyline(pMidMarkLine, this.label.location, pLabelFar));
      } else if (this.type === "line") {
        this.label.location = pMidMarkLine;
        if (this.labelOnLine) {
          if (this.rotateLabel) {
            this.label.setAnchor("center");
            this.label.rotDeg = (lsMark.deg > 270 || lsMark.deg <= 90) ? lsMark.deg : lsMark.deg - 180;
            if (lsMark.len - this.labelWidth <= 30) {
              // The space is too small, no mark lines
              this.markLines = [];
            } else {
              let lnMarkLine = new Line(lsMark.middle, lsMark.ang);
              let pMkStart = lnMarkLine.getPointByLen(-this.labelWidth / 2),
                  pMkEnd = lnMarkLine.getPointByLen(this.labelWidth / 2);
              this.markLines = [
                PathLine.fromEnds(lsMark.pStart, pMkStart),
                PathLine.fromEnds(pMkEnd, lsMark.pEnd)
              ]
            }
          } else {
            if (lsMark.deg <= 180) {
              this.label.setAnchor(this.dir === "right" ? "mr" : "ml");
              this.label.textAlign = this.dir === "right" ? "right" : "left";
            } else {
              this.label.setAnchor(this.dir === "right" ? "ml" : "mr");
              this.label.textAlign = this.dir === "right" ? "left" : "right";
            }
            let mkV = Math.abs(lsMark.pStart.y - lsMark.pEnd.y);
            if (mkV - this.labelHeight <= 20) {
              // The Vertical space is too small to hold the label, no Mark Lines
              this.markLines = [];
            } else {
              let lnHigh = new Line(new Point(pMidMarkLine.x, pMidMarkLine.y - this.labelHeight / 2), 0),
                  lnLow = new Line(new Point(pMidMarkLine.x, pMidMarkLine.y + this.labelHeight / 2), 0),
                  pxHigh = Intersection.line2LineSeg(lnHigh, lsMark),
                  pxLow = Intersection.line2LineSeg(lnLow, lsMark);
              if (pxHigh && pxHigh.length > 0 && pxLow && pxHigh.length > 0) {
                let pxcHigh = pxHigh[0],
                    pxcLow = pxLow[0],
                    pMkStart = Math.abs(lsMark.pStart.y - pxcHigh.y) < Math.abs(lsMark.pStart.y - pxcLow.y) ? pxcHigh : pxcLow,
                    pMkEnd = Math.abs(lsMark.pEnd.y - pxcHigh.y) < Math.abs(lsMark.pEnd.y - pxcLow.y) ? pxcHigh : pxcLow;
                this.markLines = [
                  PathLine.fromEnds(lsMark.pStart, pMkStart),
                  PathLine.fromEnds(pMkEnd, lsMark.pEnd)
                ]
              }
            }
          }
        } else {
          this.markLines = [PathLine.fromLineSeg(lsMark)];
          if (this.rotateLabel) {
            if (lsMark.deg > 270 || lsMark.deg <= 90) {
              this.label.setAnchor(this.dir === "right" ? "tm" : "bm");
              this.label.rotDeg = lsMark.deg;
            } else {
              this.label.setAnchor(this.dir === "right" ? "bm" : "tm");
              this.label.rotDeg = lsMark.deg - 180;
            }
          } else {
            if (lsMark.deg >= 0 && lsMark.deg < 90) {
              this.label.setAnchor(this.dir === "right" ? "tr" : "bl");
              this.label.textAlign = this.dir === "right" ? "right" : "left";
            } else if (lsMark.deg >= 90 && lsMark.deg < 180) {
              this.label.setAnchor(this.dir === "right" ? "br" : "tl");
              this.label.textAlign = this.dir === "right" ? "right" : "left";
            } else if (lsMark.deg >= 180 && lsMark.deg < 270) {
              this.label.setAnchor(this.dir === "right" ? "bl" : "tr");
              this.label.textAlign = this.dir === "right" ? "left" : "right";
            } else {
              this.label.setAnchor(this.dir === "right" ? "tl" : "br");
              this.label.textAlign = this.dir === "right" ? "left" : "right";
            }
          }
        }
      } else if (this.type === "hori") {
        this.label.location = pMidMarkLine;
        if (this.labelOnLine) {
          this.label.setAnchor("center");
          if (lsMark.len - this.labelWidth <= 30) {
            // Space too small to hold mark lines
            this.markLines = [];
          } else {
            let kx = lsMark.pEnd.x > lsMark.pStart.x ? 1 : -1;
            this.markLines = [
              PathLine.fromEnds(lsMark.pStart, new SvgPoint(pMidMarkLine.x - kx * this.labelWidth / 2, pMidMarkLine.y)),
              PathLine.fromEnds(new SvgPoint(pMidMarkLine.x + kx * this.labelWidth / 2, pMidMarkLine.y), lsMark.pEnd),
            ];
          }
        } else {
          this.markLines = [PathLine.fromLineSeg(lsMark)];
          this.label.setAnchor(extrudeToSouth ? "tm" : "bm");
        }
      } else {
        this.label.location = pMidMarkLine;
        if (this.labelOnLine) {
          if (lsMark.len - this.labelHeight <= 30)  {   // Here, we use Height, please notice that
            // Space to small to hold the mark lines
            this.markLines = [];
          } else {
            let ky = lsMark.pEnd.y > lsMark.pStart.y ? 1 : -1;
            this.markLines = [
              PathLine.fromEnds(lsMark.pStart, new SvgPoint(pMidMarkLine.x, pMidMarkLine.y - ky * this.labelHeight / 2)),
              PathLine.fromEnds(new SvgPoint(pMidMarkLine.x, pMidMarkLine.y + ky * this.labelHeight / 2), lsMark.pEnd),
            ]
          }
          this.label.setAnchor("center");
        } else {
          this.markLines = [PathLine.fromLineSeg(lsMark)];
          this.label.setAnchor(extrudeToEast ? "ml" : "mr");
          this.label.textAlign = extrudeToEast ? "left" : "right";
          this.label.anchorOffset = new SvgPoint(extrudeToEast ? 4 : -4, 0);
        }
      }
    }
    // Set color and styles
    this.setMarkColor();
  }

  setMarkColor(color?: string)  {
    this.cfgBar.color = color || this.cfgBar.color;
    this.cfgBar.width = this.barWidth;
    if (this.barStart) this.barStart.stroke = this.cfgBar;
    if (this.barEnd) this.barEnd.stroke = this.cfgBar;
    this.cfgLine.color = color || this.cfgLine.color;
    this.cfgLine.width = this.lineWidth;
    if (this.markLines.length > 0) {
      this.markLines.forEach(l => {
        l.stroke = this.cfgLine;
      });
    };
    if (this.arrowType === "simple") {
      this.cfgArrowStroke.color = color || this.cfgLine.color;
      this.cfgArrowStroke.width = this.lineWidth;
      this.cfgArrowStroke.lineJoin = "round";
      this.cfgArrowStroke.lineCap = "round";
      if (this.arrowStart) {
        this.arrowStart.stroke = this.cfgArrowStroke;
        this.arrowStart.fill = {
          color: "none"
        };
      }
      if (this.arrowEnd) {
        this.arrowEnd.stroke = this.cfgArrowStroke;
        this.arrowEnd.fill = {
          color: "none"
        };
      }
    }
    else if (this.arrowType === "solid" || this.arrowType === "empty") {
      this.cfgArrowFill.color = color || this.cfgLine.color;
      this.cfgArrowStroke.color = color || this.cfgLine.color;
      this.cfgArrowStroke.width = this.lineWidth;
      this.cfgArrowStroke.lineJoin = "round";
      if (this.arrowStart) {
        this.arrowStart.stroke = this.cfgArrowStroke;
        this.arrowStart.fill = this.arrowType === "empty"
         ? { color: "none" }
         : this.cfgArrowFill;
      }
      if (this.arrowEnd) {
        this.arrowEnd.stroke = this.cfgArrowStroke;
        this.arrowEnd.fill =  this.arrowType === "empty"
         ? { color: "none" }
         : this.cfgArrowFill;
      }
    }
  }

  resolveDrawingElements() {
    this.pathsToDraw = [];
    if (this.markLines) this.pathsToDraw.push(...this.markLines);
    if (this.arrowStart) this.pathsToDraw.push(this.arrowStart);
    if (this.arrowEnd) this.pathsToDraw.push(this.arrowEnd);
    if (this.barStart) this.pathsToDraw.push(this.barStart);
    if (this.barEnd) this.pathsToDraw.push(this.barEnd);
  }

  getBBox(): ISvgBBox {
    // If invalid, then return dummy
    if (!this.isValid || this.isZeroDim) return SvgBBox.DUMMY;
    if (this.pathsToDraw.length < 1) {
      this.resolveDrawingElements();
    }
    if (this.pathsToDraw.length < 1) {
      return this.label ? this.label.getBBox() : SvgBBox.DUMMY;
    }
    let bboxes = this.pathsToDraw.map(x => x.bbox.extendByStroke(x.stroke?.width || 0));
    if (this.label) {
      bboxes.push(this.label.getBBox());
    }
    return SvgBBox.mergeBoxes(bboxes);
  }

  buildHtml(buildType: SvgBuildType): string {
    // If invalid, then return ""
    if (!this.isValid || this.isZeroDim) return "";
    if (this.pathsToDraw.length < 1) {
      this.resolveDrawingElements();
    }
    // Svg of Label
    const svgLabel = this.label?.buildHtml(buildType) || "";
    // Svg of lines
    const svgLines = this.pathsToDraw
      .map(x => x.buildHtml())
      .join("\n");
    const htConfig = globalThis.wtHuatuConfig;
    const bboxSvg = htConfig && htConfig.showBBox
      ? `${this.getBBox().buildRectSvg(true)}`
      : ``;
    return `<g>\n`
      + svgLines + `\n`
      + svgLabel + `\n`
      + bboxSvg + `\n`
      + `</g>`;
  }

  /* ----------------------------- Static methods  -----------------------------  */

  static optsDimMarkDef: IKeyValueOptions = {
    keys: [
      // Ends
      ["from", "start"],
      ["to", "end"],
      // Style keys
      ["type"],
      ["dir", "direction"],
      ["gap"],
      ["barWidth"],
      ["lineWidth"],
      ["barLen"],
      ["linePos"],
      ["noStartBar"],
      ["noEndBar"],
      ["noStartArrow"],
      ["noEndArrow"],
      ["barLenEqual"],
      ["barColor"],
      ["lineColor"],
      ["arrow"],
      ["lenDigits"],
      ["showLength"],
      // Label
      ["label"],
      ["labelWidth", "lw"],
      ["labelHeight", "lh"],
      ["textSize"],
      ["textColor"],
      ["labelOnLine"],
      ["labelFill"],
      ["labelBorder"],
      ["rotateLabel"],
      // Remote position
      ["remotePos"],
    ],
    allowAppend: [],
    booleans: [
      "noStartBar", "noEndBar",
      "noStartArrow", "noEndArrow",
      "barLenEqual",
      "labelOnLine", "rotateLabel",
      "showLength"
    ],
    ints: ["lenDigits"],
    numbers: [
      "linePos",
    ],
    qualifiers: {
      "barColor": isValidColor,
      "lineColor": isValidColor,
      "textColor": isValidColor,
      "labelFill": isValidColor,
      "labelBorder": isValidColor,
      "type": HuatuDimMark.TYPES,
      "dir": HuatuDimMark.DIRS,
      "direction": HuatuDimMark.DIRS,
      "arrow": HuatuDimMark.ARROW_TYPES,
    },
    blindGuess: {
      "from": x => x,
      "to": x => x,
      "type": HuatuDimMark.TYPES,
      "dir": HuatuDimMark.DIRS,
      "arrow": HuatuDimMark.ARROW_TYPES,
    }
  };
}
