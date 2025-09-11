
import type { IPoint } from "../geometry/IGeometry.js";
import Point from "../geometry/Point.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Line from "../geometry/Line.js";
import LineSeg from "../geometry/LineSeg.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgPoint } from "../svg/ISvg.js";

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
  net?: string;
  lineWidth?: string;
  color?: string;
  joint?: string;
  jointSize?: string;
  squareJoint?: boolean;
}

export class HuatuWire implements IHuatuWire {
  magicId: string;
  portFrom?: IHuatuComponentPortSettled;
  pointFrom?: ISvgPoint;
  portTo?: IHuatuComponentPortSettled;
  pointTo?: ISvgPoint;
  type: "auto" | "line" | "hv" | "vh" | "hvh" | "vhv" | "hvhv" | "hvhvh" | "vhvh" | "vhvhv" | string;
  radius?: number | number[];    // Corner radius of the h-to-v/v-to-h lines

  turn?: number;
  turnX?: number;
  turnY?: number;
  turnAt?: ISvgPoint;

  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;

  net?: IHuatuNet;

  strokeColor?: string;
  lineWidth?: number;

  // Is used for the case that, it is from a Point to some Net
  jointColor?: string;
  jointSize?: number;     // The size is diameter
  isSquareJoint?: boolean;

  // A flag to indicate whether this wire is fixed, by conditions specified,
  // i.e. type/turn x/y, etc.
  isFixed: boolean = false;

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

  constructor(
    from: IHuatuComponentPortSettled | IHuatuPoint | ISvgPoint,
    to?: IHuatuComponentPortSettled | IHuatuPoint | ISvgPoint,
    type?: string
  ) {
    this.magicId = genHex(8);
    if (HuatuWire.isComponentPort(from)) {
      this.portFrom = from as IHuatuComponentPortSettled;
    } else {
      this.pointFrom = SvgPoint.from(from as ISvgPoint);
    }
    if (to) {
      if (HuatuWire.isComponentPort(to)) {
        this.portTo = to as IHuatuComponentPortSettled;
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
    //this.tryResolvePoints();
  }

  tryResolvePoints() {
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
    const getXBetween = (t: number, x1: number, x2: number) => {
      t = WtMath.fitTin0and1(t);
      return x1 * (1 - t) + x2 * t;
    }
    const xStart = this.startPoints[this.startPoints.length - 1].x,
          yStart = this.startPoints[this.startPoints.length - 1].y,
          xEnd   = this.endPoints[0].x,
          yEnd   = this.endPoints[0].y;
    // Resolve the middle points
    if (this.net) {
      if (this.portFrom && this.portTo &&
        HuatuComponentPort.isTwoPortsOnSameLine(this.portFrom, this.portTo) &&
        HuatuComponentPort.isTwoPortsFacing(this.portFrom, this.portTo)
      ) {
        // The only case we make it just a simple direct line, which is that
        // the From and To are ports and on the same line, and they face to each other
        this.startPoints = [SvgPoint.from(this.portFrom.anchor)];
        this.midPoints1 = [];
        this.midPoints2 = [];
        this.endPoints = [SvgPoint.from(this.portTo.anchor)];
        // Mark fixed
        this.isFixed = true;
      } else {
        // Hand over the point resolving method to Net
        this.freeStart = SvgPoint.from(this.startPoints[this.startPoints.length - 1]);
        this.freeEnd = SvgPoint.from(this.endPoints[0]);
      }
    } else {
      // There is no net involved, just resolve it as some line connecting two points
      if (this.portFrom && this.portTo && HuatuComponentPort.isTwoPortsParallel(this.portFrom, this.portTo)) {
        // If both ends are Component Ports, then treat them with special consideration
        if (HuatuComponentPort.isTwoPortsOnSameLine(this.portFrom, this.portTo) &&
            HuatuComponentPort.isTwoPortsFacing(this.portFrom, this.portTo))
        {
            // If they are facing to each other, then just connect them
            this.startPoints = [SvgPoint.from(this.portFrom.anchor)];
            this.midPoints1 = [];
            this.midPoints2 = [];
            this.endPoints = [SvgPoint.from(this.portTo.anchor)];
        } else {
          const lineFrom = new Line(this.portFrom.freeStart, this.portFrom.lineAng);
          const lineTo   = new Line(this.portTo.freeStart,   this.portTo.lineAng);
          const lsFromTo = new LineSeg(this.portFrom.anchor, this.portTo.freeStart);
          const isFromToCw = AngDeg.isFromToCw(this.portFrom.lineAng, lsFromTo.ang);
          // lineP here means Line Perpendicular
          const linePAtFrom = new Line(this.portFrom.freeStart, this.portFrom.lineAng + (isFromToCw ? AngDeg.DEG90 : -AngDeg.DEG90));
          const linePAtTo = new Line(this.portTo.freeStart, this.portTo.lineAng + (isFromToCw ? -AngDeg.DEG90 : AngDeg.DEG90));
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
          } else if (HuatuComponentPort.isTwoPortsOnSameLine(this.portFrom, this.portTo)) {
            // Not facing, but on same line
            // 1. Resolve Turn point
            let turnPoint: ISvgPoint | undefined;
            if (this.turnAt) {
              turnPoint = this.turnAt;
            } else if (this.turnX !== undefined && this.turnY !== undefined) {
              turnPoint = new SvgPoint(this.turnX, this.turnY);
            } else if (this.turnX !== undefined) {
              if (this.portFrom.isH) {
                turnPoint = new SvgPoint(this.turnX, this.portFrom.freeStart.y);
              } else {
                const lineV = Line.makeVLine(this.turnX);
                turnPoint = Line.getXPoint(lineV, linePAtFrom);
              }
            } else if (this.turnY !== undefined) {
              if (this.portFrom.isV) {
                turnPoint = new SvgPoint(this.portFrom.freeStart.x, this.turnY);
              } else {
                const lineH = Line.makeHLine(this.turnY);
                turnPoint = Line.getXPoint(lineH, linePAtFrom);
              }
            }
            if (!turnPoint) {
              turnPoint = linePAtFrom.getPointByLen(WtMath.isZero(this.portFrom.minHoldLen) ? 40 : 3 * this.portFrom.minHoldLen);
            }
            // 2. Make Lines and resolve middle points
            const lineM = new Line(turnPoint, this.portFrom.lineAng);
            const px1 = Line.getXPoint(lineM, linePAtFrom)!;
            const px2 = Line.getXPoint(lineM, linePAtTo)!;
            this.midPoints1.push(px1, px2);
          } else {
            // Not facing, and not on same line
            const angToCheck = new Angle(lineTo.anchor, lineFrom.anchor, lineFrom.getPointByLen(4));
            // If point To is in advance, then it is acute angle, otherwise not
            const pFurther = angToCheck.ang >= AngDeg.DEG90 ? lineFrom.anchor : lineTo.anchor;
            let pCross: ISvgPoint;
            // If they are face-to-back, and not on same line
            if (this.turnAt || (this.turnX !== undefined && this.turnY !== undefined)) {
              pCross = this.turnAt ? this.turnAt : new SvgPoint(this.turnX!, this.turnY!);
            } else if (this.turnX !== undefined) {
              pCross = new SvgPoint(this.turnX, pFurther.y);
            } else if (this.turnY !== undefined) {
              pCross = new SvgPoint(pFurther.x, this.turnY);
            } else {
              pCross = pFurther;
            }
            const lCross = new Line(pCross, this.portFrom.lineAng + AngDeg.DEG90);
            this.midPoints1.push(Line.getXPoint(lineFrom, lCross)!, Line.getXPoint(lineTo, lCross)!);
          }
        }
      } else if (this.type === "auto" || this.type === "line") {
        let turnPoint: ISvgPoint | undefined;
        if (this.turnAt) {
          turnPoint = SvgPoint.from(this.turnAt);
        } else if (this.turnX !== undefined && this.turnY !== undefined) {
          turnPoint = new SvgPoint(this.turnX, this.turnY);
        } else if (this.type === "auto") {
          if (this.portFrom && this.portTo) {
            // If both are ports and perpendicular to each other, then get the crossing point
            if (HuatuComponentPort.isTwoPortsPerpendicular(this.portFrom, this.portTo)) {
              turnPoint = Line.getXPoint(
                new Line(this.portFrom.anchor, this.portFrom.lineAng),
                new Line(this.portTo.anchor, this.portTo.lineAng)
              )
            }
          } else if (this.portFrom) {
            // If From is Port, then make it like "hv" or "vh"
            if (this.portFrom.isH) {
              turnPoint = new SvgPoint(this.pointTo!.x, this.portFrom.anchor.y);
            } else if (this.portFrom.isV) {
              turnPoint = new SvgPoint(this.portFrom.anchor.x, this.pointTo!.y);
            }
          } else if (this.portTo) {
            // If To is Port, then make it like "hv" or "vh"
            if (this.portTo.isH) {
              turnPoint = new SvgPoint(this.pointFrom!.x, this.portTo.anchor.y);
            } else if (this.portTo.isV) {
              turnPoint = new SvgPoint(this.portTo.anchor.x, this.pointFrom!.y);
            }
          }
        }
        // If turn point given, then add it, we don't miss anything given
        if (turnPoint) {
          this.midPoints1.push(SvgPoint.from(turnPoint));
        }
      } else if (this.type === "hv") {
        this.midPoints1.push(new SvgPoint(xEnd, yStart));
      } else if (this.type === "vh") {
        this.midPoints1.push(new SvgPoint(xStart, yEnd));
      } else if (this.type === "hvh") {
        const turnX = this.turnX !== undefined ? this.turnX
          : this.turnAt !== undefined ? this.turnAt.x
          : getXBetween(this.turn !== undefined ? this.turn : 0.5, xStart, xEnd);
        this.midPoints1.push(
          new SvgPoint(turnX, yStart),
          new SvgPoint(turnX, yEnd),
        );
      } else if (this.type === "vhv") {
        const turnY = this.turnY !== undefined ? this.turnY
          : this.turnAt !== undefined ? this.turnAt.y
          : getXBetween(this.turn !== undefined ? this.turn : 0.5, yStart, yEnd);
        this.midPoints1.push(
          new SvgPoint(xStart, turnY),
          new SvgPoint(xEnd, turnY),
        );
      } else if (this.type === "hvhv" || this.type === "vhvh") {
        const turnX = this.turnX !== undefined ? this.turnX
          : this.turnAt !== undefined ? this.turnAt.x
          : getXBetween(this.turn !== undefined ? this.turn : 0.5, xStart, xEnd);
        const turnY = this.turnY !== undefined ? this.turnY
          : this.turnAt !== undefined ? this.turnAt.y
          : getXBetween(this.turn !== undefined ? this.turn : 0.5, yStart, yEnd);
        if (this.type === "hvhv") {
          this.midPoints1.push(
            new SvgPoint(turnX, yStart),
            new SvgPoint(turnX, turnY),
            new SvgPoint(xEnd, turnY)
          );
        } else {
          this.midPoints1.push(
            new SvgPoint(xStart, turnY),
            new SvgPoint(turnX, turnY),
            new SvgPoint(turnX, yEnd)
          );
        }
      } else if (this.type === "hvhvh" || this.type === "vhvhv") {
        let turnX1, turnY1, turnX2, turnY2;
        if (this.turnAt) {
          turnX2 = this.turnAt.x;
          turnY2 = this.turnAt.y;
        } else {
          turnX2 = getXBetween(2/3, xStart, xEnd);
          turnY2 = getXBetween(2/3, yStart, yEnd);
        }
        turnX1 = this.turnX !== undefined ? this.turnX : getXBetween(1/2, xStart, turnX2);
        turnY1 = this.turnY !== undefined ? this.turnY : getXBetween(1/2, yStart, turnY2);
        if (this.type === "hvhvh") {
          this.midPoints1.push(
            new SvgPoint(turnX1, yStart),
            new SvgPoint(turnX1, turnY1),
            new SvgPoint(turnX2, turnY1),
            new SvgPoint(turnX2, yEnd),
          );
        } else {
          this.midPoints1.push(
            new SvgPoint(xStart, turnY1),
            new SvgPoint(turnX1, turnY1),
            new SvgPoint(turnX1, turnY2),
            new SvgPoint(xEnd,   turnY2),
          );
        }
      }
      // Whatever it is, it is resolved and fixed here
      this.isFixed = true;
    }
  }

  resolveJointLocation(): ISvgPoint {
    // TODO: resolve the location point, if required, check net
    // !NOTE: This should be changed, use the array to hold locations, there might be two points
    return new SvgPoint(0, 0);
  }

  getDrawings(): HuatuDrawing[] {
    const drawings: HuatuDrawing[] = [];
    // Resolve Line
    const stroke = new HuatuStyle();
    stroke.strokeColor = this.strokeColor || "currentColor";
    stroke.strokeWidth = this.lineWidth || HuatuWire.DEFAULT_LINE_WIDTH;
    stroke.strokeLineCap = "round";
    stroke.strokeLineJoin = "round";
    stroke.fillColor = "none";
    if (this.midPoints2.length < 1) {
      let pathLine = new PathPolyline(...this.startPoints, ...this.midPoints1, ...this.endPoints);
      if (this.radius) pathLine.toAngleArced(this.radius);
      drawings.push(new HuatuDrawing(new HuatuPath(pathLine), stroke));
    } else {
      let pathLine1 = new PathPolyline(...this.startPoints, ...this.midPoints1);
      let pathLine2 = new PathPolyline(...this.midPoints2,  ...this.endPoints);
      if (this.radius) {
        pathLine1.toAngleArced(this.radius);
        pathLine2.toAngleArced(this.radius);
      }
      drawings.push(
        new HuatuDrawing(new HuatuPath(pathLine1), stroke),
        new HuatuDrawing(new HuatuPath(pathLine2), stroke)
      )
    }
    // Resolve the joint point/square
    if (this.jointColor && this.jointColor !== "none" && this.net) {
      const loc = this.resolveJointLocation();
      const jointRadius = (this.jointSize || HuatuWire.DEFAULT_JOINT_SIZE) / 2;
      const jointPath = this.isSquareJoint
        ? PathRect.fromXYWH(loc.x - jointRadius, loc.y - jointRadius, jointRadius * 2, jointRadius * 2)
        : new PathCircle(loc.x, loc.y, jointRadius);
      const fill = new HuatuStyle();
      fill.fillColor = this.jointColor;
      drawings.push(new HuatuDrawing(new HuatuPath(jointPath), fill));
    }
    return drawings;
  }

  addToNet(net: IHuatuNet): boolean {
    if (!this.net) {
      this.net = net;
      net.addWire(this);
      return true;
    }
    if (net === this.net || (this.net.name === net.name)) {
      return true;
    } else {
      // We cannot Add the wire to another net
      return false;
    }
  }

  //*------------ STATIC VARs / METHODs --------------------------------------------------*/

  static isComponentPort = (port: IHuatuComponentPortSettled | IHuatuPoint | ISvgPoint): boolean => {
    return !!(port as IHuatuComponentPortSettled).anchor;
  }

  static DEFAULT_JOINT_SIZE = 6;
  static DEFAULT_LINE_WIDTH = 4;

  static TYPES: string[] = [
    "auto","line",
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
      ["net"],
      ["lineWidth", "width"],
      ["color", "stroke"],
      ["joint"],
      ["jointSize"],
      ["squareJoint"]
    ],
    allowAppend: [],
    numbers: [],
    ints: [],
    booleans: ["squareJoint"],
    qualifiers: {
      "color": isValidColor,
      "stroke": isValidColor,
      "joint": isValidColor,
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
