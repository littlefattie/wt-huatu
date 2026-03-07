
import type { ILine, IPoint } from "../geometry/IGeometry.js";

import Point from "../geometry/Point.js";
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
  IHuatuInputVar,
  IHuatuComponentPortSettled,
} from "../component/IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { HuatuComponentDef } from "../component/HuatuComponentDef.js";
import { WtHuatu } from "../huatu/Huatu.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import type { IHuatuNet, IHuatuWire } from "./IHuatuWire.js";
import { genHex } from "../tools/gen-id.js";
import { HuatuWire } from "./HuatuWire.js";
import LineSeg from "../geometry/LineSeg.js";
import Line from "../geometry/Line.js";
import { WtMath } from "../math/WtMath.js";
import { HuatuNet } from "./HuatuNet.js";
import { HuatuDrawing } from "../huatu/HuatuDrawing.js";
import { HuatuStyle } from "../huatu/HuatuStyle.js";
import { HuatuPath } from "../huatu/HuatuPath.js";
import { PathLine } from "../path/PathLine.js";

export class HuatuNetTrunk {
  net: HuatuNet;
  hOrV: "H" | "V";
  xOrY: number;
  xMin: number = 0;
  xMax: number = 0;
  yMin: number = 0;
  yMax: number = 0;

  // This is a flag to indicate whether this trunk has been added to the final drawing,
  // And will be reset just before the rendering process starts
  isDrawn: boolean = false;

  // This is a flag to indicate whether this trunk can be extended, because in some cases,
  // We want the trunk as the main trunk and not be extended at all, thus some end points
  // will not be able to connect to it if set to not extensible
  // TODO: this variable is not used, consider to remove it later on
  extensible: boolean = true;

  constructor(net: HuatuNet, xOrY: number, vStart: number, vEnd: number, hOrV: "H" | "V") {
    this.net = net;
    this.hOrV = hOrV;
    this.xOrY = xOrY;
    if (this.hOrV === "H") {
      // this.line = Line.makeHLine(xOrY);
      // this.seg = LineSeg.fromXYs(vStart, xOrY, vEnd, xOrY);
      this.xMin = Math.min(vStart, vEnd);
      this.xMax = Math.max(vStart, vEnd);
    }
    else {
      // this.line = Line.makeVLine(xOrY);
      // this.seg = LineSeg.fromXYs(xOrY, vStart, xOrY, vEnd);
      this.yMin = Math.min(vStart, vEnd);
      this.yMax = Math.max(vStart, vEnd);
    }
  }

  line(): Line {
    if (this.hOrV === "H") {
      return Line.makeHLine(this.xOrY);
    } else {
      return Line.makeVLine(this.xOrY);
    }
  }

  seg(): LineSeg {
    if (this.hOrV === "H") {
      return LineSeg.fromXYs(this.xMin, this.xOrY, this.xMax, this.xOrY);
    } else {
      return LineSeg.fromXYs(this.xOrY, this.yMin, this.xOrY, this.yMax);
    }
  }

  // The distance between a single point and the trunk
  // If the trunk is not extensible, it will return undefined if x/y is not in trunk's range
  distanceToPoint(p: IPoint): number | undefined {
    if (this.hOrV === "H") {
      if (!this.extensible && (p.x < this.xMin || p.x > this.xMax)) return undefined;
      return Math.abs(this.xOrY - p.y);
    }
    else {
      if (!this.extensible && (p.y < this.yMin || p.y > this.yMax)) return undefined;
      return Math.abs(this.xOrY - p.x);
    }
  }

  extendToPoint(p: ISvgPoint) {
    if (!this.extensible) return;
    if (this.hOrV === "H") {
      if (p.x > this.xMax) this.xMax = p.x;
      if (p.x < this.xMin) this.xMin = p.x;
    } else {
      if (p.y > this.yMax) this.yMax = p.y;
      if (p.y < this.yMin) this.yMin = p.y;
    }
  }

  isZeroLength(): boolean {
    if (this.hOrV === "H") return Math.abs(this.xMax - this.xMin) <= HuatuNet.EQU_TOL * 2;
    else return Math.abs(this.yMax - this.yMin) <= HuatuNet.EQU_TOL  * 2;
  }

  hasPointOn(p: ISvgPoint): boolean {
    let eqTol = 1e-4;
    if (this.hOrV === "H") {
      if (!WtMath.isEqualOnTol(p.y, this.xOrY, eqTol)) return false;
      if (p.x < this.xMin || p.x > this.xMax) return false;
      return true;
    } else {
      if (!WtMath.isEqualOnTol(p.x, this.xOrY, eqTol)) return false;
      if (p.y < this.yMin || p.y > this.yMax) return false;
      return true;
    }
  }

  isPointTerminal(p: ISvgPoint): boolean {
    if (this.hOrV === "H") {
      return (WtMath.isEqualOnTol(p.y, this.xOrY, HuatuNet.EQU_TOL)
          && (WtMath.isEqualOnTol(p.x, this.xMin, HuatuNet.EQU_TOL) || WtMath.isEqualOnTol(p.x, this.xMax, HuatuNet.EQU_TOL)));
    } else {
      return (WtMath.isEqualOnTol(p.x, this.xOrY, HuatuNet.EQU_TOL)
          && (WtMath.isEqualOnTol(p.y, this.yMin, HuatuNet.EQU_TOL) || WtMath.isEqualOnTol(p.y, this.yMax, HuatuNet.EQU_TOL)));
    }
  }

  intersectsSeg(hOrV: "H" | "V", pStart: ISvgPoint, pEnd: ISvgPoint): boolean {
    if (this.hOrV !== hOrV) return false;
    if (this.hOrV === "H") {
      let yMin = Math.min(pStart.y, pEnd.y),
          yMax = Math.max(pStart.y, pEnd.y);
      return this.xOrY <= (yMax + HuatuNet.EQU_TOL) && this.xOrY >= (yMin - HuatuNet.EQU_TOL);
    } else {
      let xMin = Math.min(pStart.x, pEnd.x),
          xMax = Math.min(pStart.x, pEnd.x);
      return this.xOrY <= (xMax + HuatuNet.EQU_TOL) && this.xOrY <= (xMin - HuatuNet.EQU_TOL);
    }
  }

  draw(stroke?: IHuatuStyle): HuatuDrawing {
    const style = new HuatuStyle();
    // The net's color and linewidth will dominate
    style.strokeColor = this.net.color || (stroke?.strokeColor || "currentColor");
    style.strokeWidth = this.net.lineWidth || (stroke?.strokeWidth || HuatuWire.DEFAULT_LINE_WIDTH);
    style.strokeLineCap = "round";
    style.strokeLineJoin = "round";
    style.fillColor = "none";
    let path = this.hOrV === "H"
      ? new PathLine(this.xMin, this.xOrY, this.xMax, this.xOrY)
      : new PathLine(this.xOrY, this.yMin, this.xOrY, this.yMax);
    this.isDrawn = true;
    return new HuatuDrawing(new HuatuPath(path), style);
  }

  static portHvDir(port: IHuatuComponentPortSettled): "N" | "S" | "W" | "E" {
    let deg = port.lineDeg;
    return deg >= 45 && deg <= 135
      ? "S"
      : deg > 135 && deg < 225
      ? "W"
      : deg >= 225 && deg <= 315
      ? "N"
      : "E";
  }

  static resolveJointOnTrunk(port: IHuatuComponentPortSettled, trunk: HuatuNetTrunk): {
    turn: ISvgPoint | undefined;
    joint: ISvgPoint;
  } {
    let hvPort = HuatuNetTrunk.portHvDir(port),
        hvTrunk = trunk.hOrV,
        pPort = port.freeStart,
        turn: ISvgPoint | undefined = undefined,
        joint: ISvgPoint;
    if (hvTrunk === "H") {
      // Trunk horizontal
      if (hvPort === "N" || hvPort === "S") {
        // Cross
        if ((hvPort === "N" && pPort.y >= trunk.xOrY) || (hvPort === "S" && pPort.y <= trunk.xOrY)) {
          joint = new SvgPoint(pPort.x, trunk.xOrY);
        } else {
          let xProtrude = pPort.x + HuatuNet.PROTRUDE * (hvPort === "S" ? -1 : 1);
          turn = new SvgPoint(xProtrude, pPort.y);
          joint = new SvgPoint(xProtrude, trunk.xOrY);
        }
      }
      else {
        // Parallel
        joint = new SvgPoint(pPort.x, trunk.xOrY);
      }
    } else {
      // Trunk vertical
      if (hvPort === "E" || hvPort === "W") {
        // Cross
        if ((hvPort === "E" && pPort.x <= trunk.xOrY) || (hvPort === "W" && pPort.x >= trunk.xOrY)) {
          joint = new SvgPoint(trunk.xOrY, pPort.y);
        } else {
          let yProtrude = pPort.y + HuatuNet.PROTRUDE * (hvPort === "E" ? 1 : -1);
          turn = new SvgPoint(pPort.x, yProtrude);
          joint = new SvgPoint(trunk.xOrY, yProtrude);
        }
      } else {
        // Parallel
        joint = new SvgPoint(trunk.xOrY, pPort.y);
      }
    }
    return {
      turn,
      joint
    };
  }

}
