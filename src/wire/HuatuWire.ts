
import type { IPoint } from "../geometry/IGeometry.js";
import Point from "../geometry/Point.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Line from "../geometry/Line.js";
import LineSeg from "../geometry/LineSeg.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";

import type {
  IHuatuClipPath,
  IHuatuDrawingGroup,
  IHuatuLabelStyle,
  IHuatuMarker,
  IHuatuPath,
  IHuatuPathSeries,
  IHuatuPattern,
  IHuatuPoint,
  IHuatuPointSeries,
  IHuatuStyle,
  IHuatuVar
} from "../huatu/IHuatu.js";

import type {
  IHuatuComponentPlacement,
  IHuatuComponentInputVars,
  IHuatuComponentPort,
  IHuatuInputVar,
  IHuatuComponentPortSettled,
} from "../component/IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { HuatuComponentDef } from "../component/HuatuComponentDef.js";
import { WtHuatu } from "../huatu/Huatu.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import type { IHuatuNet, IHuatuWire } from "./IHuatuWire.js";
import { HuatuComponentPort } from "../component/HuatuComponentPort.js";
import { HuatuPath } from "../huatu/HuatuPath.js";
import { HuatuNet } from "./HuatuNet.js";
import { isValidColor } from "../tools/webColor.js";
import { HuatuDrawing } from "../huatu/HuatuDrawing.js";
import { HuatuStyle } from "../huatu/HuatuStyle.js";
import { PathPolyline } from "../path/PathPolyline.js";
import { PathCircle } from "../path/PathCircle.js";
import { PathRect } from "../path/PathRect.js";
import { genHex } from "../tools/gen-id.js";
import { WtMath } from "../math/WtMath.js";
import Angle from "../geometry/Angle.js";
import { HuatuNetTrunk } from "./HuatuNetTrunk.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuMarker } from "../huatu/HuatuMarker.js";

export interface IHuatuWireDefParams {
  name?: string;
  from?: string;
  to?: string;
  type?: string;
  radius?: number[];
  turn?: string;
  turnX?: string;
  turnY?: string;
  turnAt?: string;
  turnLen?: string;
  net?: string;
  netColor?: string;
  netLineWidth?: string;
  lineWidth?: string;
  color?: string;
  joint?: string;
  jointSize?: string;
  squareJoint?: boolean;
  endArrow?: string;
  startArrow?: string;
}

export class HuatuWire implements IHuatuWire {
  wireDef: string;
  magicId: string;
  portFrom?: IHuatuComponentPortSettled;
  pointFrom?: ISvgPoint;
  portTo?: IHuatuComponentPortSettled;
  pointTo?: ISvgPoint;
  xyTo?: number;
  type: "auto" | "line" | "tox" | "tov" | "toy" | "toh" | "hv" | "vh" | "hvh" | "vhv" | "hvhv" | "hvhvh" | "vhvh" | "vhvhv" | string;
  radius?: number | number[];    // Corner radius of the h-to-v/v-to-h lines

  turn?: number;
  turnX?: number;
  turnY?: number;
  turnAt?: ISvgPoint;
  turnLen?: number;

  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;

  net?: IHuatuNet;

  strokeColor?: string;
  lineWidth?: number;

  markerStart?: HuatuMarker;
  markerEnd?: HuatuMarker;

  // Is used for the case that, it is from a Point to some Net
  jointLocation?: ISvgPoint;
  jointColor: string = "currentColor";
  jointSize?: number;     // The size is diameter
  isSquareJoint?: boolean;

  // A flag to indicate whether this wire is fixed, by conditions specified,
  // i.e. type/turn x/y, etc.
  isFixed: boolean = false;

  // A flag to indicate that this wire will have no drawing element, say we don't need to draw it
  // e.g. the two ends of the wire are same points, we can just omit it
  noDraw: boolean = false;

  startPoints: ISvgPoint[] = [];
  endPoints: ISvgPoint[] = [];
  // Mid 1 and Mid 2 are designed in a way that there might be a case that the wire from pFrom to pTo
  // would be splitted to two parts, one is from pFrom to Net, and the other is from Net to pTo
  // If this happens, Mid 1 will hold the point(s) from pFrom to Net, and Mid 2 will hold points from Net
  // to pTo. If there is no such split, then Mid 2 will be empty, and the wire is a single line
  midPoints1: ISvgPoint[] = [];
  midPoints2: ISvgPoint[] = [];

  // These two free ends are for Net's usage to judge the middle points
  // Their values will only be defined when the wire is not fixed after the first trying resolve
  freeStart?: ISvgPoint;
  freeEnd?: ISvgPoint;

  // Linked wire
  linkedWire?: HuatuWire;

  // Trunks and Joints
  trunkFrom?: HuatuNetTrunk;
  trunkTo?: HuatuNetTrunk;
  jointFrom?: ISvgPoint;
  jointTo?: ISvgPoint;
  jointMid?: ISvgPoint;
  // These indicator give mandatory drawing for Joints
  drawJointFrom?: boolean;
  drawJointTo?: boolean;

  errored?: boolean;
  isExtra?: boolean;
  trunkOnly?: boolean;

  constructor(
    wireDef: string,
    from: IHuatuComponentPortSettled | ISvgPoint,
    to?:  IHuatuComponentPortSettled | ISvgPoint | number,
    type?: string
  ) {
    this.magicId = genHex(8);
    this.wireDef = wireDef;
    if (HuatuWire.isComponentPort(from)) {
      this.portFrom = from as IHuatuComponentPortSettled;
    } else {
      this.pointFrom = SvgPoint.from(from as ISvgPoint);
    }
    if (to !== undefined) {
      if (HuatuWire.isComponentPort(to)) {
        this.portTo = to as IHuatuComponentPortSettled;
      } else if (typeof to === "number") {
        this.xyTo = to;
      } else {
        this.pointTo = SvgPoint.from(to as ISvgPoint);
      }
    }
    if (type) {
      const typeLc = type.toLowerCase();
      this.type = HuatuWire.TYPES.includes(typeLc) ? typeLc : "auto";
    } else {
      this.type = "auto";
    }
    // Try Resolve points
    // NOTE: This step will not be executed here, because other additional info has not been resolved
    // It will be called by Huatu body after other parameters parsed and ready
    // The line here is just a reminder to tell that this function will handle the real points
    // that compose the wire.
    //this.tryResolvePoints();
  }

  prepareEnds() {
    // Resolve Start Points, it will always done this way
    if (this.portFrom) {
      this.startPoints.push(
        SvgPoint.from(this.portFrom.anchor),
        SvgPoint.from(this.portFrom.freeStart)
      );
    } else if (this.pointFrom) {
      this.startPoints.push(this.pointFrom);
    }
    // Resolve End points, the end points will be removed if the wire connects to a Net,
    // while the pTo is already in the points collection of that Net
    if (this.portTo) {
      this.endPoints.push(
        SvgPoint.from(this.portTo.freeStart),
        SvgPoint.from(this.portTo.anchor),
      )
    } else if (this.pointTo) {
      this.endPoints.push(this.pointTo);
    }
  }

  tryResolvePoints() {
    // Prepare end points
    this.prepareEnds();
    // Deal with Net
    if (this.net) {
      this.net.addWire(this);
      return;
    }
    // Deal with standalone wire
    const getXBetween = (t: number, x1: number, x2: number) => {
      t = WtMath.fitTin0and1(t);
      return x1 * (1 - t) + x2 * t;
    }
    const xStart = this.startPoints[this.startPoints.length - 1].x,
          yStart = this.startPoints[this.startPoints.length - 1].y,
          xEnd   = this.endPoints[0]?.x,
          yEnd   = this.endPoints[0]?.y;
    let turnX, turnY;
    let turnX1, turnY1, turnX2, turnY2;
    if (this.portTo || this.pointTo || this.xyTo !== undefined) {
      switch (this.type) {
        case "auto":
          // Make the TurnAt (point) the highest priority
          if (this.turnAt) {
            this.midPoints1 = [this.turnAt];
          }
          // If both turnX and turnY presented, treat as a point
          else if (this.turnX !== undefined && this.turnY !== undefined) {
            this.midPoints1 = [new SvgPoint(this.turnX, this.turnY)];
          }
          // If both from and to are ports, treat it specially
          else if (this.portFrom && this.portTo) {
            const lineFrom = new Line(this.portFrom.freeStart, this.portFrom.lineAng);
            const lineTo   = new Line(this.portTo.freeStart,   this.portTo.lineAng);
            const lsFromTo = new LineSeg(this.portFrom.anchor, this.portTo.freeStart);
            const isFromToCw = AngDeg.isFromToCw(this.portFrom.lineAng, lsFromTo.ang);
            // lineP here means Line Perpendicular
            const linePAtFrom = new Line(this.portFrom.freeStart, this.portFrom.lineAng + (isFromToCw ? AngDeg.DEG90 : -AngDeg.DEG90));
            const linePAtTo = new Line(this.portTo.freeStart, this.portTo.lineAng + (isFromToCw ? -AngDeg.DEG90 : AngDeg.DEG90));
            // From and To are on the same line
            if (HuatuComponentPort.isTwoPortsOnSameLine(this.portFrom, this.portTo)) {
              // If two ports are facing, simplify it as just a line seg
              if (HuatuComponentPort.isTwoPortsFacing(this.portFrom, this.portTo)) {
                this.startPoints = [SvgPoint.from(this.portFrom.anchor)];
                this.midPoints1 = [];
                this.midPoints2 = [];
                this.endPoints = [SvgPoint.from(this.portTo.anchor)];
              }
              // Not facing, then judge turnX/turnY, or go from sideway
              else {
                const turnLen = this.turnLen
                      ? this.turnLen
                      : WtMath.isZero(this.portFrom.minHoldLen)
                      ? 40
                      : 5 * this.portFrom.minHoldLen;
                let refTurnPoint: ISvgPoint | undefined;
                let sidePoint1: ISvgPoint | undefined,
                    sidePoint2: ISvgPoint | undefined;
                if (this.turnX !== undefined) {
                  if (this.portFrom.isV) {
                    sidePoint1 = new SvgPoint(this.turnX, this.portFrom.freeStart.y);
                    sidePoint2 = new SvgPoint(this.turnX, this.portTo.freeStart.y);
                  } else {
                    const lineV = Line.makeVLine(this.turnX);
                    refTurnPoint = Line.getXPoint(lineV, lineFrom)!;
                    const linePAtFrom2 = new Line(refTurnPoint, linePAtFrom.ang);
                    sidePoint1 = linePAtFrom2.getPointByLen(turnLen);
                    const lineFrom2 = new Line(sidePoint1, lineFrom.ang);
                    sidePoint2 = Line.getXPoint(lineFrom2, linePAtTo)!;
                  }
                }
                else if (this.turnY !== undefined) {
                  if (this.portFrom.isH) {
                    sidePoint1 = new SvgPoint(this.portFrom.freeStart.x, this.turnY);
                    sidePoint2 = new SvgPoint(this.portTo.freeStart.x, this.turnY);
                  } else {
                    const lineH = Line.makeHLine(this.turnY);
                    refTurnPoint = Line.getXPoint(lineH, lineFrom)!;
                    const linePAtFrom2 = new Line(refTurnPoint, linePAtFrom.ang);
                    sidePoint1 = linePAtFrom2.getPointByLen(turnLen);
                    const lineFrom2 = new Line(sidePoint1, lineFrom.ang);
                    sidePoint2 = Line.getXPoint(lineFrom2, linePAtTo)!;
                  }
                }
                else {
                  sidePoint1 = linePAtFrom.getPointByLen(turnLen);
                  const lineSide = new Line(sidePoint1, this.portFrom.lineAng);
                  sidePoint2 = Line.getXPoint(lineSide, linePAtTo)!;
                }
                if (refTurnPoint) this.midPoints1.push(refTurnPoint);
                this.midPoints1.push(sidePoint1, sidePoint2);
              }
            }
            // From and To are parallel
            else if (HuatuComponentPort.isTwoPortsParallel(this.portFrom, this.portTo)) {
              // ports facing
              if (HuatuComponentPort.isTwoPortsFacing(this.portFrom, this.portTo)) {
                // Facing but not on same line
                const px = Line.getXPoint(linePAtTo, lineFrom)!;
                const len = new LineSeg(this.portFrom.freeStart, px).len;
                const lenTaken = getXBetween(this.turn !== undefined ? this.turn : 1/2, 0, len);
                const pFrom = lineFrom.getPointByLen(lenTaken);
                const pTo = lineTo.getPointByLen(len - lenTaken);
                this.startPoints = [SvgPoint.from(this.portFrom.anchor)];
                this.midPoints1 = [pFrom, pTo];
                this.midPoints2 = [];
                this.endPoints = [SvgPoint.from(this.portTo.anchor)];
              }
              // ports not facing
              else {
                const lsFreeStarts = new LineSeg(this.portFrom.freeStart, this.portTo.freeStart),
                      pMiddle = lsFreeStarts.getPoint(this.turn !== undefined ? this.turn : 0.5)!,
                      lineMid = new Line(pMiddle, this.portFrom.lineAng);
                let   pxStart = Line.getXPoint(lineMid, linePAtFrom)!,
                      pxEnd = Line.getXPoint(lineMid, linePAtTo)!;
                if (this.turnX !== undefined) {
                  if (!this.portFrom.isV) {
                    let pTurn = lineFrom.getPointByX(this.turnX)!;
                    let lnPxStart = new Line(pTurn, linePAtFrom.ang);
                    if (HuatuComponentPort.isTowPortsParallelBacking(this.portFrom, this.portTo)) {
                      const pTo2 = lineTo.getPointByLen(-10);
                      const angFrom = new Angle(pTurn, this.portTo.freeStart, pTo2);
                      const lineAux = angFrom.ang >= AngDeg.DEG90
                        ? lineTo
                        : this.turnLen === undefined
                        ? lineMid
                        : new Line(lnPxStart.getPointByLen(this.turnLen), this.portFrom.lineAng);
                      pxStart = Line.getXPoint(lineAux, lnPxStart)!;
                      pxEnd = Line.getXPoint(lineAux, linePAtTo)!;
                      this.midPoints1 = [pTurn, pxStart, pxEnd];
                    } else {
                      pxStart = pTurn;
                      pxEnd = Line.getXPoint(lineTo, lnPxStart)!;
                      this.midPoints1 = [pxStart, pxEnd];
                    }
                  } else {
                    this.midPoints1 = [pxStart, pxEnd];
                  }
                }
                else if (this.turnY !== undefined) {
                  if (!this.portFrom.isH) {
                    let pTurn = lineFrom.getPointByY(this.turnY)!;
                    let lnPxStart = new Line(pTurn, linePAtFrom.ang);
                    if (HuatuComponentPort.isTowPortsParallelBacking(this.portFrom, this.portTo)) {
                      const pTo2 = lineTo.getPointByLen(-10);
                      const angFrom = new Angle(pTurn, this.portTo.freeStart, pTo2);
                      const lineAux = angFrom.ang >= AngDeg.DEG90
                        ? lineTo
                        : this.turnLen === undefined
                        ? lineMid
                        : new Line(lnPxStart.getPointByLen(this.turnLen), this.portFrom.lineAng);
                      pxStart = Line.getXPoint(lineAux, lnPxStart)!;
                      pxEnd = Line.getXPoint(lineAux, linePAtTo)!;
                      this.midPoints1 = [pTurn, pxStart, pxEnd];
                    } else {
                      pxStart = pTurn;
                      pxEnd = Line.getXPoint(lineTo, lnPxStart)!;
                      this.midPoints1 = [pxStart, pxEnd];
                    }
                  } else {
                    this.midPoints1 = [pxStart, pxEnd];
                  }
                }
                else {
                  this.midPoints1 = [pxStart, pxEnd];
                }
              }
            }
            // If only turnY specified
            else if (this.turnY !== undefined) {
              let lnH = Line.makeHLine(this.turnY),
                  px1 = Line.getXPoint(lnH, lineFrom),
                  px2 = Line.getXPoint(lnH, lineTo);
              this.midPoints1.push(px1 || new SvgPoint(this.portFrom.freeStart.x, this.turnY));
              this.midPoints1.push(px2 || new SvgPoint(this.portTo.freeStart.x, this.turnY));
            }
            // If only turnX specified
            else if (this.turnX !== undefined) {
              let lnV = Line.makeVLine(this.turnX),
                  px1 = Line.getXPoint(lnV, lineFrom),
                  px2 = Line.getXPoint(lnV, lineTo);
              this.midPoints1.push(px1 || new SvgPoint(this.turnX, this.portFrom.freeStart.y));
              this.midPoints1.push(px2 || new SvgPoint(this.turnX, this.portTo.freeStart.y));
            }
            // The two ports are perpendicular
            else if (HuatuComponentPort.isTwoPortsPerpendicular(this.portFrom, this.portTo)) {
              let pTurn = Line.getXPoint(lineFrom, lineTo)!;
              this.midPoints1=[pTurn];
            }
          }
          else if (this.portFrom && this.pointTo) {
            if (this.portFrom.isH) {
              this.midPoints1 = [new SvgPoint(this.pointTo.x, this.portFrom.anchor.y)];
            }
            else if (this.portFrom.isV) {
              this.midPoints1 = [new SvgPoint(this.portFrom.anchor.x, this.pointTo.y)];
            }
          }
          else if (this.pointFrom && this.portTo) {
            if (this.portTo.isH) {
              this.midPoints1 = [new SvgPoint(this.pointFrom.x, this.portTo.anchor.y)];
            }
            else if (this.portTo.isV) {
              this.midPoints1 = [new SvgPoint(this.portTo.anchor.x, this.pointFrom.y)];
            }
          }
          // Generic, just connect the free-start points, no middle points
          else {
            this.midPoints1 = [];
          }

          break;
        case "line":
          // Make the TurnAt (point) the highest priority
          if (this.turnAt) {
            this.midPoints1 = [this.turnAt];
          }
          // If both turnX and turnY presented, treat as a point
          else if (this.turnX !== undefined && this.turnY !== undefined) {
            this.midPoints1 = [new SvgPoint(this.turnX, this.turnY)];
          }
          // Other case make no middle points
          else {
            this.midPoints1 = [];
          }
          break;

        case "tox":
        case "tov":
          if (this.xyTo === undefined) {
            if (this.portTo) this.xyTo = this.portTo.freeStart.x;
            else if (this.pointTo) this.xyTo = this.pointTo.x;
            else break;
          }
          if (this.portFrom) {
            if (this.portFrom.isH) {
              this.endPoints = [new SvgPoint(this.xyTo, this.portFrom.anchor.y)];
              this.midPoints1 = [];
            }
            else if (this.turnY) {
              this.endPoints = [new SvgPoint(this.xyTo, this.turnY)];
              this.midPoints1 = [Line.getXPoint(
                new Line(this.portFrom.freeStart, this.portFrom.lineAng),
                Line.makeHLine(this.turnY)
              )!];
            }
            else {
              this.endPoints = [new SvgPoint(this.xyTo, this.portFrom.freeStart.y)];
              this.midPoints1 = [];
            }
          }
          else if (this.pointFrom) {
            if (this.turnY) {
              this.endPoints  = [new SvgPoint(this.xyTo, this.turnY)];
              this.midPoints1 = [new SvgPoint(this.pointFrom.x, this.turnY)];
            }
            else {
              this.endPoints = [new SvgPoint(this.xyTo, this.pointFrom.y)];
            }
          }
          break;

        case "toy":
        case "toh":
          if (this.xyTo === undefined) {
            if (this.portTo) this.xyTo = this.portTo.freeStart.y;
            else if (this.pointTo) this.xyTo = this.pointTo.y;
            else break;
          }
          if (this.portFrom) {
            if (this.portFrom.isV) {
              this.endPoints = [new SvgPoint(this.portFrom.anchor.x, this.xyTo)];
              this.midPoints1 = [];
            }
            else if (this.turnX) {
              this.endPoints = [new SvgPoint(this.turnX, this.xyTo)];
              this.midPoints1 = [Line.getXPoint(
                new Line(this.portFrom.freeStart, this.portFrom.lineAng),
                Line.makeVLine(this.turnX)
              )!];
            }
            else {
              this.endPoints = [new SvgPoint(this.portFrom.freeStart.x, this.xyTo)];
              this.midPoints1 = [];
            }
          }
          else if (this.pointFrom) {
            if (this.turnX) {
              this.endPoints  = [new SvgPoint(this.turnX, this.xyTo)];
              this.midPoints1 = [new SvgPoint(this.turnX, this.pointFrom.y)];
            }
            else {
              this.endPoints = [new SvgPoint(this.pointFrom.x, this.xyTo)];
            }
          }
          break;

        case "hv":
          this.midPoints1.push(new SvgPoint(xEnd, yStart));
          break;

        case "vh":
          this.midPoints1.push(new SvgPoint(xStart, yEnd));
          break;

        case "hvh":
          turnX = this.turnX !== undefined ? this.turnX
            : this.turnAt !== undefined ? this.turnAt.x
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, xStart, xEnd);
          this.midPoints1.push(
            new SvgPoint(turnX, yStart),
            new SvgPoint(turnX, yEnd),
          );
          break;

        case "vhv":
          turnY = this.turnY !== undefined ? this.turnY
            : this.turnAt !== undefined ? this.turnAt.y
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, yStart, yEnd);
          this.midPoints1.push(
            new SvgPoint(xStart, turnY),
            new SvgPoint(xEnd, turnY),
          );
          break;

        case "hvhv":
          turnX = this.turnX !== undefined ? this.turnX
            : this.turnAt !== undefined ? this.turnAt.x
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, xStart, xEnd);
          turnY = this.turnY !== undefined ? this.turnY
            : this.turnAt !== undefined ? this.turnAt.y
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, yStart, yEnd);
            this.midPoints1.push(
              new SvgPoint(turnX, yStart),
              new SvgPoint(turnX, turnY),
              new SvgPoint(xEnd, turnY)
            );
          break;

        case "vhvh":
          turnX = this.turnX !== undefined ? this.turnX
            : this.turnAt !== undefined ? this.turnAt.x
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, xStart, xEnd);
          turnY = this.turnY !== undefined ? this.turnY
            : this.turnAt !== undefined ? this.turnAt.y
            : getXBetween(this.turn !== undefined ? this.turn : 0.5, yStart, yEnd);
          this.midPoints1.push(
            new SvgPoint(xStart, turnY),
            new SvgPoint(turnX, turnY),
            new SvgPoint(turnX, yEnd)
          );
          break;

        case "hvhvh":
          if (this.turnAt) {
            turnX2 = this.turnAt.x;
          } else {
            turnX2 = getXBetween(2/3, xStart, xEnd);
          }
          turnX1 = this.turnX !== undefined ? this.turnX : getXBetween(1/2, xStart, turnX2);
          turnY1 = this.turnY !== undefined ? this.turnY : getXBetween(1/2, yStart, yEnd);
          this.midPoints1.push(
            new SvgPoint(turnX1, yStart),
            new SvgPoint(turnX1, turnY1),
            new SvgPoint(turnX2, turnY1),
            new SvgPoint(turnX2, yEnd),
          );
          break;

        case "vhvhv":
           if (this.turnAt) {
            turnY2 = this.turnAt.y;
          } else {
            turnY2 = getXBetween(2/3, yStart, yEnd);
          }
          turnX1 = this.turnX !== undefined ? this.turnX : getXBetween(1/2, xStart, xEnd);
          turnY1 = this.turnY !== undefined ? this.turnY : getXBetween(1/2, yStart, turnY2);
          this.midPoints1.push(
            new SvgPoint(xStart, turnY1),
            new SvgPoint(turnX1, turnY1),
            new SvgPoint(turnX1, turnY2),
            new SvgPoint(xEnd,   turnY2),
          );
          break;

        default:
          break;
      }

      // Whatever it is, it is resolved and fixed here
      this.isFixed = true;
    }
  }

  getDrawings(): HuatuDrawing[] {
    const drawings: HuatuDrawing[] = [];
    // Return empty collection if no need to draw
    if (this.noDraw) return drawings;
    // Resolve Line
    const stroke = new HuatuStyle();
    stroke.strokeColor = this.strokeColor || (this.net?.color) || "currentColor";
    stroke.strokeWidth = this.lineWidth || (this.net?.lineWidth) || HuatuWire.DEFAULT_LINE_WIDTH;
    stroke.strokeLineCap = "round";
    stroke.strokeLineJoin = "round";
    stroke.fillColor = "none";
    if (!this.net) {
      if (this.markerStart) stroke.markerStart = this.markerStart;
      if (this.markerEnd) stroke.markerEnd = this.markerEnd;
    }
    // Draw normal part
    if (this.trunkOnly) {
      // If trunk only, we just draw the lines in starting/ending points
      if (this.startPoints.length > 0) {
        drawings.push(new HuatuDrawing(new HuatuPath(new PathPolyline(...this.startPoints)), stroke));
      }
      if (this.endPoints.length > 0) {
        drawings.push(new HuatuDrawing(new HuatuPath(new PathPolyline(...this.endPoints)), stroke));
      }
    }
    else {
      // Draw the starting/ending and middle points
      if (this.midPoints2.length < 1) {
        let pathLine = new PathPolyline(...this.startPoints, ...this.midPoints1, ...this.endPoints);
        if (this.radius) pathLine = pathLine.toAngleArced(this.radius);
        drawings.push(new HuatuDrawing(new HuatuPath(pathLine), stroke));
      } else {
        let pathLine1 = new PathPolyline(...this.startPoints, ...this.midPoints1);
        let pathLine2 = new PathPolyline(...this.midPoints2,  ...this.endPoints);
        if (this.radius && !this.net) {     // Disable line radius if net involved
          pathLine1 = pathLine1.toAngleArced(this.radius);
          pathLine2 = pathLine2.toAngleArced(this.radius);
        }
        drawings.push(
          new HuatuDrawing(new HuatuPath(pathLine1), stroke),
          new HuatuDrawing(new HuatuPath(pathLine2), stroke)
        )
      }
    }
    // Add trunks and joints if in net
    if (this.net) {
      const makeJoint = (loc: ISvgPoint, jColor: string) => {
        const fill = new HuatuStyle();
        fill.fillColor = jColor;
        const jointRadius = (this.jointSize || HuatuWire.DEFAULT_JOINT_SIZE) / 2;
        const jointPath = this.isSquareJoint
          ? PathRect.fromXYWH(loc.x - jointRadius, loc.y - jointRadius, jointRadius * 2, jointRadius * 2)
          : new PathCircle(loc.x, loc.y, jointRadius);
        return new HuatuDrawing(new HuatuPath(jointPath), fill);
      }
      // Linked Extra wire
      if (this.linkedWire && !this.linkedWire.noDraw) {
        drawings.push(...this.linkedWire.getDrawings());
        // Add the start point as Joint
        if (this.jointColor !== "none") {
          drawings.push(makeJoint(this.linkedWire.pointFrom!, this.jointColor));
        }
      }
      // Draw Trunks
      if (this.trunkFrom && !this.trunkFrom.isDrawn && !this.trunkFrom.isZeroLength()) {
        drawings.push(this.trunkFrom.draw(stroke));
      }
      if (this.trunkTo && !this.trunkTo.isDrawn && !this.trunkTo.isZeroLength()) {
        drawings.push(this.trunkTo.draw(stroke));
      }
      // Draw Joints
      if (this.jointColor !== "none") {
        // If trunk is zero-length, then remove the joint
        if (this.trunkFrom && this.trunkFrom.isZeroLength())  {
          this.jointFrom = undefined;
        }
        if (this.trunkTo && this.trunkTo.isZeroLength()) {
          this.jointTo = undefined;
        }
        // Draw joints
        if (this.jointFrom && 
           (!this.linkedWire || !this.linkedWire.noDraw) &&   // This line is for the extra linked wire
           (this.drawJointFrom || (this.trunkFrom && !this.trunkFrom.isPointTerminal(this.jointFrom))))
        {
          drawings.push(makeJoint(this.jointFrom, this.jointColor));
        }
        if (this.jointTo &&
           (this.drawJointTo || (this.trunkTo && !this.trunkTo.isPointTerminal(this.jointTo))))
        {
          drawings.push(makeJoint(this.jointTo, this.jointColor));
        }
        // Check to draw joint Mid
        if (this.jointMid) {
          if ((this.trunkFrom && this.trunkFrom.hasPointOn(this.jointMid) && !this.trunkFrom.isZeroLength() && !this.trunkFrom.isPointTerminal(this.jointMid)) || 
              (this.trunkTo && this.trunkTo.hasPointOn(this.jointMid) && !this.trunkTo.isZeroLength() && !this.trunkTo.isPointTerminal(this.jointMid))) {
            drawings.push(makeJoint(this.jointMid, this.jointColor));
          }
        }
      }
    }
    return drawings;
  }

  getBBox(): ISvgBBox {
    let points: ISvgPoint[] = [];
    // collect Starts/Ends
    if (this.pointFrom) points.push(this.pointFrom);
    if (this.portFrom) points.push(this.portFrom.anchor, this.portFrom.freeStart);
    if (this.pointTo) points.push(this.pointTo);
    if (this.portTo) points.push(this.portTo.anchor, this.portTo.freeStart);
    // Collect resolved points after being fixed
    if (this.isFixed) {
      if (this.jointFrom) points.push(this.jointFrom);
      if (this.jointTo) points.push(this.jointTo);
      if (this.jointMid) points.push(this.jointMid);
      points.push(...this.midPoints1);
      points.push(...this.midPoints2);
      points.push(...this.startPoints);
      points.push(...this.endPoints);
    }
    // Find Min/Max
    let xs = points.map(p => p.x),
        ys = points.map(p => p.y),
        xMin = Math.min(...xs),
        xMax = Math.max(...xs),
        yMin = Math.min(...ys),
        yMax = Math.max(...ys);
    // Extend by PROTRUDE and JOINT SIZE
    let extendSize = this.net
      ? HuatuNet.PROTRUDE + (HuatuWire.DEFAULT_LINE_WIDTH * 0.6) + (this.jointSize || HuatuWire.DEFAULT_JOINT_SIZE * 0.6)
      : ((this.lineWidth || HuatuWire.DEFAULT_LINE_WIDTH) * 0.6);
    xMin -= extendSize;
    xMax += extendSize;
    yMin -= extendSize;
    yMax += extendSize;
    return SvgBBox.fromMaxMins(xMin, xMax, yMin, yMax);
  }

  //*------------ STATIC VARs / METHODs --------------------------------------------------*/

  static isComponentPort = (port: IHuatuComponentPortSettled | IHuatuPoint | ISvgPoint | number): boolean => {
    return !!(port as IHuatuComponentPortSettled).anchor;
  }

  static DEFAULT_JOINT_SIZE = 10;
  static DEFAULT_LINE_WIDTH = 4;

  static TO_HV_TYPES: string[] = [
    "tox", "tov", "toy", "toh"
  ];

  static TYPES: string[] = [
    "auto","line",
    "tox", "tov", "toy", "toh",
    "hv","vh",
    "hvh","vhv",
    "hvhv","hvhvh",
    "vhvh","vhvhv"
  ];

  static optsHuatuWire: IKeyValueOptions = {
    keys: [
      ["name"],
      ["from"],
      ["to"],
      ["type"],
      ["radius"],
      ["turn"],
      ["turnX"],
      ["turnY"],
      ["turnAt"],
      ["turnLen"],
      ["net"],
      ["netColor"],
      ["netLineWidth", "netlw"],
      ["lineWidth", "width"],
      ["color", "stroke"],
      ["joint"],
      ["jointSize"],
      ["squareJoint"],
      ["startArrow"],
      ["endArrow"],
    ],
    allowAppend: [],
    numbers: [],
    ints: [],
    booleans: ["squareJoint"],
    qualifiers: {
      "color": isValidColor,
      "stroke": isValidColor,
      "joint": isValidColor,
      "netColor": isValidColor,
      "type": HuatuWire.TYPES,
      "radius": "number[]",
    },
    blindGuess: {
      "type": HuatuWire.TYPES,
      "from": x => x,
      "to": x => x,
      "color": isValidColor,
      "joint": isValidColor,
      "lineWidth": x => x,
    },
  }
}
