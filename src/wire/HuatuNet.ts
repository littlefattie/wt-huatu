
import type { IPoint } from "../geometry/IGeometry.js";

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
import { genHex } from "../tools/gen-id.js";
import { HuatuWire } from "./HuatuWire.js";
import { HuatuNetTrunk } from "./HuatuNetTrunk.js";
import LineSeg from "../geometry/LineSeg.js";
import { WtMath } from "../math/WtMath.js";

export class HuatuNet implements IHuatuNet {
  name?: string;
  magicId: string;
  joints: ISvgPoint[] = [];
  commonPoint?: ISvgPoint;
  color?: string;
  lineWidth?: number;
  huatu: WtHuatu;

  constructor(huatu: WtHuatu, name?: string, ) {
    this.huatu = huatu;
    this.name = name;
    this.magicId = genHex(8);
  }

  wires: HuatuWire[] = [];
  trunks: HuatuNetTrunk[] = [];

  pushJoints(...joints: ISvgPoint[]) {
    joints.forEach(j => {
      if (!this.jointExists(j)) this.joints.push(j);
    });
  }

  jointExists(joint: ISvgPoint, add?: boolean): boolean {
    let pts = this.joints.filter(p => Math.abs(joint.x - p.x) <= HuatuNet.EQU_TOL && Math.abs(joint.y - p.y) <= HuatuNet.EQU_TOL);
    if (add && pts.length < 1) this.joints.push(joint);
    return pts.length > 0;
  }

  retryFixWires(isSettling?: boolean): void {
    this.wires.forEach(w => {
      if (!w.isFixed) this.tryFixWire(w, isSettling);
    })
  }

  findNearestTrunkForPoint = (p: ISvgPoint): HuatuNetTrunk | undefined => {
    let iTrunk: number | undefined = undefined;
    let dITrunk: number | undefined = undefined;
    for (let i = 0; i < this.trunks.length; i++) {
      let dI = this.trunks[i].distanceToPoint(p);
      if (dI !== undefined) {
        if (iTrunk === undefined) {
          iTrunk = i;
          dITrunk = dI;
        } else {
          if (dI < dITrunk!) {
            iTrunk = i;
            dITrunk = dI;
          }
        }
      }
    }
    return iTrunk === undefined ? undefined : this.trunks[iTrunk];
  }

  findNearestTrunkForPort = (p: IHuatuComponentPortSettled, isSettling?: boolean): HuatuNetTrunk | undefined => {
    let hvDir = HuatuNetTrunk.portHvDir(p);
    let pPort = p.freeStart;
    let trunkHV = hvDir === "N" || hvDir === "S" ? "H" : "V";
    // find Horizontal Trunks
    let trunks = this.trunks.filter(x => x.hOrV === trunkHV);
    if (trunks.length < 1 && isSettling) {
      // If in final settling phase, just present all the trunks incase the H/V trunks are insufficient
      trunks = this.trunks;
    }
    return trunks.find(x => x.distanceToPoint(pPort) !== undefined);
  }

  tryFixWire(wire: HuatuWire, isSettling?: boolean): void {

    const isPointOnTrunk = (p: ISvgPoint): boolean => {
      for (let i = 0; i < this.trunks.length; i++) {
        if (this.trunks[i].hasPointOn(p)) return true;
      }
      return false;
    }

    let trunkAdded = false;
    // 1. Single point/port connecting to net
    if (!wire.portTo && !wire.pointTo) {
      // No trunk defined, do nothing and leave it un-fixed
      if (this.trunks.length < 1) {
        wire.isFixed = false;
        return;
      }
      // Connect it to a trunk
      if (wire.pointFrom) {
        let pFrom = new SvgPoint(wire.pointFrom.x, wire.pointFrom.y);
        // Check if the point is on some trunk
        if (isPointOnTrunk(pFrom)) {
          wire.isFixed = true;
          wire.noDraw = true;
          return;
        }
        let trunk = this.findNearestTrunkForPoint(pFrom);
        if (trunk) {
          let joint =  trunk.hOrV === "H"
            ? new SvgPoint(pFrom.x, trunk.xOrY)
            : new SvgPoint(trunk.xOrY, pFrom.y);
          wire.endPoints = [joint];
          wire.isFixed = true;
          // Extend the trunk to new point boundary
          trunk.extendToPoint(pFrom);
          wire.trunkFrom = trunk;
          wire.jointFrom = joint;
          wire.drawJointFrom = this.jointExists(joint, true);
        }
        // Leave to final resolve
        else {
          wire.isFixed = false;
        }
      }
      else if (wire.portFrom) {
        let trunk = this.findNearestTrunkForPort(wire.portFrom, isSettling);
        if (trunk) {
          let taj = HuatuNetTrunk.resolveJointOnTrunk(wire.portFrom, trunk);
          wire.midPoints1 = taj.turn ? [taj.turn, taj.joint] : [taj.joint];
          wire.isFixed = true;
          trunk.extendToPoint(taj.joint);
          wire.trunkFrom = trunk;
          wire.jointFrom = taj.joint;
          wire.drawJointFrom = this.jointExists(taj.joint, true);
        }
        // Leave to final resolve
        else {
          wire.isFixed = false;
        }
      }
    }
    // 2. Point to Point
    else if (wire.pointFrom && wire.pointTo) {
      if (this.trunks.length < 1) {
        // Check if the two points are on the same H/V line
        let trunk: HuatuNetTrunk | undefined;
        if (WtMath.isEqualOnTol(wire.pointFrom.x, wire.pointTo.x, HuatuNet.EQU_TOL)) {
          trunk = new HuatuNetTrunk(this, wire.pointFrom.x, wire.pointFrom.y, wire.pointTo.y, "V");
        }
        else if (WtMath.isEqualOnTol(wire.pointFrom.y, wire.pointTo.y, HuatuNet.EQU_TOL))
        {
          trunk = new HuatuNetTrunk(this, wire.pointFrom.y, wire.pointFrom.x, wire.pointTo.x, "H");
        }
        if (trunk) {
          wire.trunkFrom = trunk;
          wire.jointFrom = wire.pointFrom;
          wire.trunkTo = trunk;
          wire.jointTo = wire.pointTo;
          this.trunks.push(trunk);
          trunkAdded = true;
          wire.trunkOnly = true;
          wire.isFixed = true;
        }
      }
      else {
        // Split it to two parts, From point and TO point, connect them to trunk seperately
        let trunkFrom = this.findNearestTrunkForPoint(wire.pointFrom);
        let trunkTo = this.findNearestTrunkForPoint(wire.pointTo);
        if (trunkFrom && trunkTo) {
          // From
          let jointFrom = trunkFrom.hOrV === "H"
            ? new SvgPoint(wire.pointFrom.x, trunkFrom.xOrY)
            : new SvgPoint(trunkFrom.xOrY, wire.pointFrom.y);
          wire.midPoints1 = [jointFrom];
          trunkFrom.extendToPoint(wire.pointFrom);
          wire.trunkFrom = trunkFrom;
          wire.jointFrom = jointFrom;
          wire.drawJointFrom = this.jointExists(jointFrom, true);
          // From
          let jointTo =  trunkTo.hOrV === "H"
            ? new SvgPoint(wire.pointTo.x, trunkTo.xOrY)
            : new SvgPoint(trunkTo.xOrY, wire.pointTo.y);
          wire.midPoints2 = [jointTo];
          trunkTo.extendToPoint(wire.pointTo);
          wire.trunkTo = trunkTo;
          wire.jointTo = jointTo;
          wire.drawJointTo = this.jointExists(jointTo, true);
          wire.isFixed = true;
        }
        // Leave to final resolve
        else {
          wire.isFixed = false;
        }
      }
    }
    // 3. Point to Port
    else if (wire.pointFrom && wire.portTo) {
      if (this.trunks.length < 1) {
        // Try to make some trunk, taj = trunks and joint
        let taj = HuatuNet.makeTrunkFromPointAndPort(this, wire.portTo, wire.pointFrom);
        wire.trunkFrom = taj.trunkPoint;
        wire.trunkTo = taj.trunkPort;
        wire.jointFrom = taj.jointPoint;
        wire.jointTo = taj.jointPort;
        wire.jointMid = taj.jointMid;
        if (taj.jointMid) this.pushJoints(taj.jointMid);
        this.trunks.push(...taj.trunks);
        trunkAdded = true;
        wire.midPoints1 = [wire.jointFrom];
        wire.midPoints2 = [wire.jointTo];
        wire.isFixed = true;
      }
      else {
        let trunkFrom = this.findNearestTrunkForPoint(wire.pointFrom);
        let trunkTo = this.findNearestTrunkForPort(wire.portTo, isSettling);
        if (trunkFrom && trunkTo) {
          // From
          let jointFrom = trunkFrom.hOrV === "H"
            ? new SvgPoint(wire.pointFrom.x, trunkFrom.xOrY)
            : new SvgPoint(trunkFrom.xOrY, wire.pointFrom.y);
          wire.midPoints1 = [jointFrom];
          trunkFrom.extendToPoint(wire.pointFrom);
          wire.trunkFrom = trunkFrom;
          wire.jointFrom = jointFrom;
          wire.drawJointFrom = this.jointExists(jointFrom, true);
          // To
          let tajTo = HuatuNetTrunk.resolveJointOnTrunk(wire.portTo, trunkTo);
          wire.midPoints2 = [tajTo.joint];
          if (tajTo.turn) wire.midPoints2.push(tajTo.turn);
          trunkTo.extendToPoint(tajTo.joint);
          wire.trunkTo = trunkTo;
          wire.jointTo = tajTo.joint;
          wire.drawJointTo = this.jointExists(tajTo.joint, true);
          wire.isFixed = true;
        }
        // Leave to final resolve
        else {
          wire.isFixed = false;
        }
      }
    }
    else if (wire.portFrom && wire.pointTo) {
      if (this.trunks.length < 1) {
        // Try to make some trunk, taj = trunks and joint
        let taj = HuatuNet.makeTrunkFromPointAndPort(this, wire.portFrom, wire.pointTo);
        wire.trunkFrom = taj.trunkPort;
        wire.trunkTo = taj.trunkPoint;
        wire.jointFrom = taj.jointPort;
        wire.jointTo = taj.jointPoint;
        wire.jointMid = taj.jointMid;
        if (taj.jointMid) this.pushJoints(taj.jointMid);
        this.trunks.push(...taj.trunks);
        trunkAdded = true;
        wire.midPoints1 = [];
        wire.midPoints2 = [wire.jointTo];
        wire.isFixed = true;
      }
      else {
        let trunkFrom = this.findNearestTrunkForPort(wire.portFrom, isSettling);
        let trunkTo = this.findNearestTrunkForPoint(wire.pointTo);
        if (trunkFrom && trunkTo) {
          // From
          let tajFrom = HuatuNetTrunk.resolveJointOnTrunk(wire.portFrom, trunkFrom);
          wire.midPoints1 = tajFrom.turn ?  [tajFrom.turn, tajFrom.joint] : [tajFrom.joint];
          trunkFrom.extendToPoint(tajFrom.joint);
          wire.trunkFrom = trunkFrom;
          wire.jointFrom = tajFrom.joint;
          wire.drawJointFrom = this.jointExists(tajFrom.joint, true);
          // To
          let jointTo =  trunkTo.hOrV === "H"
            ? new SvgPoint(wire.pointTo.x, trunkTo.xOrY)
            : new SvgPoint(trunkTo.xOrY, wire.pointTo.y);
          wire.midPoints2 = [jointTo];
          trunkTo.extendToPoint(wire.pointTo);
          wire.trunkTo = trunkTo;
          wire.jointTo = jointTo;
          wire.drawJointTo = this.jointExists(jointTo, true);
          wire.isFixed = true;
        }
        // Leave to final resolve
        else {
          wire.isFixed = false;
        }
      }
    }
    // 4. Port to Port
    else if (wire.portFrom && wire.portTo) {
      let hvdirFrom = HuatuNetTrunk.portHvDir(wire.portFrom),
          hvdirTo = HuatuNetTrunk.portHvDir(wire.portTo),
          psFrom = wire.portFrom.freeStart,
          psTo = wire.portTo.freeStart;

      const connectToTrunk = (pFrom: IHuatuComponentPortSettled, pTo: IHuatuComponentPortSettled): boolean => {
        let trunkFrom = this.findNearestTrunkForPort(pFrom, isSettling),
            trunkTo = this.findNearestTrunkForPort(pTo, isSettling);
        if (trunkFrom && trunkTo) {
          // From
          let tajFrom = HuatuNetTrunk.resolveJointOnTrunk(pFrom, trunkFrom);
          wire.midPoints1 = tajFrom.turn ? [tajFrom.turn, tajFrom.joint] : [tajFrom.joint];
          trunkFrom.extendToPoint(tajFrom.joint);
          wire.trunkFrom = trunkFrom;
          wire.jointFrom = tajFrom.joint;
          wire.drawJointFrom = this.jointExists(tajFrom.joint, true);
          // To
          let tajTo = HuatuNetTrunk.resolveJointOnTrunk(pTo, trunkTo);
          wire.midPoints2 = [tajTo.joint];
          if (tajTo.turn) wire.midPoints2.push(tajTo.turn);
          trunkTo.extendToPoint(tajTo.joint);
          wire.trunkTo = trunkTo;
          wire.jointTo = tajTo.joint;
          wire.drawJointTo = this.jointExists(tajTo.joint, true);
          return true;
        }
        return false;
      }

      let fetw = hvdirFrom === "E" && hvdirTo === "W",
          fwte = hvdirFrom === "W" && hvdirTo === "E",
          fstn = hvdirFrom === "S" && hvdirTo === "N",
          fnts = hvdirFrom === "N" && hvdirTo === "S",
          fwtw = hvdirFrom === "W" && hvdirTo === "W",
          fete = hvdirFrom === "E" && hvdirTo === "E",
          fsts = hvdirFrom === "S" && hvdirTo === "S",
          fntn = hvdirFrom === "N" && hvdirTo === "N",
          fromH = hvdirFrom === "E" || hvdirFrom === "W",
          fromV = hvdirFrom === "N" || hvdirFrom === "S";
      if (fetw || fwte) {
        if ((psFrom.x <= psTo.x && fetw) || (psFrom.x >= psTo.x && fwte)) {
          // facing
          if (WtMath.isEqualOnTol(psFrom.y, psTo.y, HuatuNet.EQU_TOL)) {
            // Make direct connect, and make new trunk
            wire.midPoints1 = [];
            wire.midPoints2 = [];
            wire.isFixed = true;
            let pMiddle = new SvgPoint((psFrom.x + psTo.x) / 2, (psFrom.y + psTo.y) / 2);
            if (this.trunks.length < 1) {
              // Make a new trunk at the middle point
              let trunk = new HuatuNetTrunk(this, pMiddle.x, psFrom.y, psTo.y, "V");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.jointFrom = pMiddle;
              wire.drawJointFrom = true;
            }
            else {
              let trunk = this.trunks.find(x => x.intersectsSeg("V", psFrom, psTo));
              if (trunk) {
                // If trunk intersects, then add joint
                wire.trunkFrom = trunk;
                wire.jointFrom = new SvgPoint(trunk.xOrY, pMiddle.y);
                wire.drawJointFrom = true;
                // Extend trunk in case it is out of range
                trunk.extendToPoint(wire.jointFrom);
              } else {
                // Add a new wire to connect to some trunk as linked Wire
                let extraWire = new HuatuWire("Auxiliary Wire", pMiddle);
                extraWire.isExtra = true;
                extraWire.net = this;
                extraWire.strokeColor = wire.strokeColor;
                extraWire.lineWidth = wire.lineWidth;
                extraWire.jointFrom = pMiddle;
                extraWire.drawJointFrom = true;
                wire.linkedWire = extraWire;
              }
            }
          }
          else if (this.trunks.length < 1) {
            // Try make trunks
            let trunkX = (psFrom.x + psTo.x) / 2;
            let trunk = new HuatuNetTrunk(this, trunkX, psFrom.y, psTo.y, "V");
            this.trunks.push(trunk);
            trunkAdded = true;
            wire.trunkFrom = trunk;
            wire.trunkTo = trunk;
            wire.jointFrom = new SvgPoint(trunkX, psFrom.y);
            wire.jointTo = new SvgPoint(trunkX, psTo.y);
            wire.midPoints1 = [wire.jointFrom];
            wire.midPoints2 = [wire.jointTo];
            wire.isFixed = true;
            this.pushJoints(wire.jointFrom, wire.jointTo);
          }
          else {
            wire.isFixed = connectToTrunk(wire.portFrom, wire.portTo);
          }
        } else if (this.trunks.length < 1) {
          let dY = psFrom.y - psTo.y;
          let trunkY = Math.abs(dY) > HuatuNet.PROTRUDE
            ? (psFrom.y + psTo.y) / 2
            : psFrom.y + HuatuNet.PROTRUDE * (hvdirFrom === "E" ? 1 : -1);
          let trunk: HuatuNetTrunk = new HuatuNetTrunk(this, trunkY, psFrom.x, psTo.x, "H");
          this.trunks.push(trunk);
          trunkAdded = true;
          wire.trunkFrom = trunk;
          wire.trunkTo = trunk;
          wire.jointFrom = new SvgPoint(psFrom.x, trunkY);
          wire.jointTo = new SvgPoint(psTo.x, trunkY);
          wire.midPoints1 = [wire.jointFrom];
          wire.midPoints2 = [wire.jointTo];
          wire.isFixed = true;
          this.pushJoints(wire.jointFrom, wire.jointTo);
        }
        else {
          wire.isFixed = connectToTrunk(wire.portFrom, wire.portTo);
        }
      }
      else if (fstn || fnts) {
        if ((psFrom.y <= psTo.y && fstn) || (psFrom.y >= psTo.y && fnts)) {
          // facing
          if (WtMath.isEqualOnTol(psFrom.x, psTo.x, HuatuNet.EQU_TOL)) {
            // Make direct connect, and make new trunk
            wire.midPoints1 = [];
            wire.midPoints2 = [];
            wire.isFixed = true;
            let pMiddle = new SvgPoint((psFrom.x + psTo.x) / 2, (psFrom.y + psTo.y) / 2);
            if (this.trunks.length < 1) {
              // Make a new trunk at the middle point
              let trunk = new HuatuNetTrunk(this, pMiddle.y, psFrom.x, psTo.x, "H");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.jointFrom = pMiddle;
              wire.drawJointFrom = true;
            }
            else {
              let trunk = this.trunks.find(x => x.intersectsSeg("H", psFrom, psTo));
              if (trunk) {
                // If trunk intersects, then add joint
                wire.trunkFrom = trunk;
                wire.jointFrom = new SvgPoint(pMiddle.x, trunk.xOrY);
                wire.drawJointFrom = true;
                // Extend trunk in case it is out of range
                trunk.extendToPoint(wire.jointFrom);
              } else {
                // Add a new wire to connect to some trunk as linked Wire
                let extraWire = new HuatuWire("Auxiliary Wire", pMiddle);
                extraWire.isExtra = true;
                extraWire.net = this;
                extraWire.strokeColor = wire.strokeColor;
                extraWire.lineWidth = wire.lineWidth;
                extraWire.jointFrom = pMiddle;
                extraWire.drawJointFrom = true;
                wire.linkedWire = extraWire;
              }
            }
          }
          else if (this.trunks.length < 1) {
            // Try make trunks
            let trunkY = (psFrom.y + psTo.y) / 2;
            let trunk = new HuatuNetTrunk(this, trunkY, psFrom.x, psTo.x, "H");
            this.trunks.push(trunk);
            trunkAdded = true;
            wire.trunkFrom = trunk;
            wire.trunkTo = trunk;
            wire.jointFrom = new SvgPoint(psFrom.x, trunkY);
            wire.jointTo = new SvgPoint(psTo.x, trunkY);
            wire.midPoints1 = [wire.jointFrom];
            wire.midPoints2 = [wire.jointTo];
            wire.isFixed = true;
            this.pushJoints(wire.jointFrom, wire.jointTo);
          }
          else {
            wire.isFixed = connectToTrunk(wire.portFrom, wire.portTo);
          }
        } else if (this.trunks.length < 1) {
          let dX = psFrom.x - psTo.x;
          let trunkX = Math.abs(dX) > HuatuNet.PROTRUDE
            ? (psFrom.x + psTo.x) / 2
            : psFrom.x + HuatuNet.PROTRUDE * (hvdirFrom === "N" ? 1 : -1);
          let trunk: HuatuNetTrunk = new HuatuNetTrunk(this, trunkX, psFrom.y, psTo.y, "V");
          this.trunks.push(trunk);
          trunkAdded = true;
          wire.trunkFrom = trunk;
          wire.trunkTo = trunk;
          wire.jointFrom = new SvgPoint(trunkX, psFrom.y);
          wire.jointTo = new SvgPoint(trunkX, psTo.y);
          wire.midPoints1 = [wire.jointFrom];
          wire.midPoints2 = [wire.jointTo];
          wire.isFixed = true;
          this.pushJoints(wire.jointFrom, wire.jointTo);
        }
        else {
          wire.isFixed = connectToTrunk(wire.portFrom, wire.portTo);
        }
      }
      else if (this.trunks.length < 1) {
        if (fwtw || fete) {
          let trunkX = fwtw
            ? Math.min(psFrom.x, psTo.x) - HuatuNet.PROTRUDE / 2
            : Math.max(psFrom.x, psTo.x) + HuatuNet.PROTRUDE / 2;
          let trunk = new HuatuNetTrunk(this, trunkX, psFrom.y, psTo.y, "V");
          this.trunks.push(trunk);
          trunkAdded = true;
          wire.trunkFrom = trunk;
          wire.trunkTo = trunk;
          wire.jointFrom = new SvgPoint(trunkX, psFrom.y);
          wire.jointTo = new SvgPoint(trunkX, psTo.y);
          wire.midPoints1 = [wire.jointFrom];
          wire.midPoints2 = [wire.jointTo];
          wire.isFixed = true;
          this.pushJoints(wire.jointFrom, wire.jointTo);
        }
        else if (fsts || fntn) {
          let trunkY = fntn
            ? Math.min(psFrom.y, psTo.y) - HuatuNet.PROTRUDE / 2
            : Math.max(psFrom.y, psTo.y) + HuatuNet.PROTRUDE / 2;
          let trunk = new HuatuNetTrunk(this, trunkY, psFrom.x, psTo.x, "H");
          this.trunks.push(trunk);
          trunkAdded = true;
          wire.trunkFrom = trunk;
          wire.trunkTo = trunk;
          wire.jointFrom = new SvgPoint(psFrom.x, trunkY);
          wire.jointTo = new SvgPoint(psTo.x, trunkY);
          wire.midPoints1 = [wire.jointFrom];
          wire.midPoints2 = [wire.jointTo];
          wire.isFixed = true;
          this.pushJoints(wire.jointFrom, wire.jointTo);
        }
        // Try to make some trunk if there is no trunk
        else if (fromH) {
          if ((psTo.x >= psFrom.x && hvdirFrom === "E") || (psTo.x <= psFrom.x && hvdirFrom === "W")) {
            if ((psTo.y >= psFrom.y && hvdirTo === "N") || (psTo.y <= psFrom.y && hvdirTo === "S")) {
              let trunkH = new HuatuNetTrunk(this, psFrom.y, psTo.x, psFrom.x, "H"),
                  trunkV = new HuatuNetTrunk(this, psTo.x, psFrom.y, psTo.y, "V");
              this.trunks.push(trunkH, trunkV);
              wire.trunkFrom = trunkH;
              wire.jointFrom = psFrom;
              wire.trunkTo = trunkV;
              wire.jointTo = psTo;
              trunkAdded = true;
              wire.midPoints1 = [];
              wire.midPoints2 = [];
              wire.trunkOnly = true;
              wire.jointMid = new SvgPoint(psTo.x, psFrom.y);
              wire.isFixed = true;
              this.pushJoints(psFrom, psTo, wire.jointMid);
            }
            else {
              let dx = psTo.x - psFrom.x,
                  xTurn = Math.abs(dx) < HuatuNet.PROTRUDE * 1.6
                    ? psTo.x + HuatuNet.PROTRUDE * (hvdirFrom === "E" ? 1 : -1)
                    : (psFrom.x + psTo.x) / 2;
              let trunk = new HuatuNetTrunk(this, xTurn, psFrom.y, psTo.y, "V");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.trunkTo = trunk;
              wire.jointFrom = new SvgPoint(xTurn, psFrom.y);
              wire.jointTo = new SvgPoint(xTurn, psTo.y);
              wire.midPoints1 = [wire.jointFrom];
              wire.midPoints2 = [wire.jointTo];
              wire.isFixed = true;
              this.pushJoints(wire.jointFrom, wire.jointTo);
            }
          }
          else {
            if (((psTo.y >= psFrom.y && hvdirTo === "N") || (psTo.y <= psFrom.y && hvdirTo === "S"))) {
              let dy = psTo.y - psFrom.y,
                  yTurn = Math.abs(dy) < HuatuNet.PROTRUDE * 1.6
                    ? psFrom.y + HuatuNet.PROTRUDE * (hvdirTo === "N" ? -1 : 1)
                    : (psFrom.y + psTo.y) / 2;
              let trunk = new HuatuNetTrunk(this, yTurn, psFrom.x, psTo.x, "H");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.trunkTo = trunk;
              wire.jointFrom = new SvgPoint(psFrom.x, yTurn);
              wire.jointTo = new SvgPoint(psTo.x, yTurn);
              wire.midPoints1 = [wire.jointFrom];
              wire.midPoints2 = [wire.jointTo];
              wire.isFixed = true;
              this.pushJoints(wire.jointFrom, wire.jointTo);
            }
            else {
              let trunkH = new HuatuNetTrunk(this, psTo.y, psTo.x, psFrom.x, "H"),
                  trunkV = new HuatuNetTrunk(this, psFrom.x, psFrom.y, psTo.y, "V");
              this.trunks.push(trunkH, trunkV);
              wire.trunkFrom = trunkV;
              wire.jointFrom = psFrom;
              wire.trunkTo = trunkH;
              wire.jointTo = psTo;
              trunkAdded = true;
              wire.midPoints1 = [];
              wire.midPoints2 = [];
              wire.trunkOnly = true;
              wire.jointMid = new SvgPoint(psFrom.x, psTo.y);
              wire.isFixed = true;
              this.pushJoints(psFrom, psTo, wire.jointMid);
            }
          }
        }
        else if (fromV) {
          if ((psTo.y <= psFrom.y && hvdirFrom === "N") || (psTo.y >= psFrom.y && hvdirFrom === "S")) {
            if ((psTo.x >= psFrom.x && hvdirTo === "W") || (psTo.x <= psFrom.x && hvdirTo === "E")) {
              let trunkH = new HuatuNetTrunk(this, psTo.y, psTo.x, psFrom.x, "H"),
                  trunkV = new HuatuNetTrunk(this, psFrom.x, psFrom.y, psTo.y, "V");
              this.trunks.push(trunkH, trunkV);
              wire.trunkFrom = trunkV;
              wire.jointFrom = psFrom;
              wire.trunkTo = trunkH;
              wire.jointTo = psTo;
              trunkAdded = true;
              wire.midPoints1 = [];
              wire.midPoints2 = [];
              wire.trunkOnly = true;
              wire.jointMid = new SvgPoint(psFrom.x, psTo.y);
              wire.isFixed = true;
              this.pushJoints(psFrom, psTo, wire.jointMid);
            }
            else {
              let dy = psTo.y - psFrom.y,
                  yTurn = Math.abs(dy) < HuatuNet.PROTRUDE * 1.6
                    ? psTo.y + HuatuNet.PROTRUDE * (hvdirFrom === "N" ? -1 : 1)
                    : (psFrom.y + psTo.y) / 2;
              let trunk = new HuatuNetTrunk(this, yTurn, psFrom.x, psTo.x, "H");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.trunkTo = trunk;
              wire.jointFrom = new SvgPoint(psFrom.x, yTurn);
              wire.jointTo = new SvgPoint(psTo.x, yTurn);
              wire.midPoints1 = [wire.jointFrom];
              wire.midPoints2 = [wire.jointTo];
              wire.isFixed = true;
              this.pushJoints(wire.jointFrom, wire.jointTo);
            }
          }
          else {
            if ((psTo.x >= psFrom.x && hvdirTo === "W") || (psTo.x <= psFrom.x && hvdirTo === "E")) {
              let dx = psTo.x - psFrom.x,
                  xTurn = Math.abs(dx) < HuatuNet.PROTRUDE * 1.6
                    ? psFrom.x + HuatuNet.PROTRUDE * (hvdirTo === "W" ? -1 : 1)
                    : (psFrom.x + psTo.x) / 2;
              let trunk = new HuatuNetTrunk(this, xTurn, psFrom.y, psTo.y, "V");
              this.trunks.push(trunk);
              trunkAdded = true;
              wire.trunkFrom = trunk;
              wire.trunkTo = trunk;
              wire.jointFrom = new SvgPoint(xTurn, psFrom.y);
              wire.jointTo = new SvgPoint(xTurn, psTo.y);
              wire.midPoints1 = [wire.jointFrom];
              wire.midPoints2 = [wire.jointTo];
              wire.isFixed = true;
              this.pushJoints(wire.jointFrom, wire.jointTo);
            }
            else {
              let trunkH = new HuatuNetTrunk(this, psFrom.y, psFrom.x, psTo.x, "H"),
                  trunkV = new HuatuNetTrunk(this, psTo.x, psTo.y, psFrom.y, "V");
              this.trunks.push(trunkH, trunkV);
              wire.trunkFrom = trunkH;
              wire.jointFrom = psFrom;
              wire.trunkTo = trunkV;
              wire.jointTo = psTo;
              trunkAdded = true;
              wire.midPoints1 = [];
              wire.midPoints2 = [];
              wire.trunkOnly = true;
              wire.jointMid = new SvgPoint(psTo.x, psFrom.y);
              wire.isFixed = true;
              this.pushJoints(psFrom, psTo, wire.jointMid);
            }
          }
        }
        else {
          // Do nothing, actually all the cases are covered above
        }
      }
      else {
        // other not facing, not backing cases, make trunks or connect to trunks
        wire.isFixed = connectToTrunk(wire.portFrom, wire.portTo);
      }
    }

    // 5. Re-check previous wires to see if there is a chance to fix the un-fixed or not
    if (trunkAdded) {
      this.retryFixWires();
    }
  }

  addWire(wire: HuatuWire): void {
    // Will not add duplicated wires
    if (this.wires.find(x => x === wire)) return;

    // Do nothing when From terminal is missing
    if (!wire.pointFrom && !wire.portFrom) return;

    // Try fixing
    this.tryFixWire(wire);

    // Add current wire
    this.wires.push(wire);

    // Add Linked Wire if any
    if (wire.linkedWire) {
      wire.linkedWire.prepareEnds();
      this.addWire(wire.linkedWire);
    }
  }

  getWires(): IHuatuWire[] {
    return this.wires;
  }

  // This function is called After all the Huatu is parsed, in case there is some wire that is not fixed
  // this function call will handle that, to just ignore the wire, or make dummy connections and "fix" it
  settleWires(): void {
    let unfixed = this.wires.filter(w => !w.isFixed);
    while(unfixed.length > 0) {
      if (this.trunks.length > 0) {
        this.retryFixWires(true);
      }
      else {
        // Find the Point to Point wire, this is actually the only case when FROM and TO are both present, but not fixed
        let wire = unfixed.find(w => w.pointFrom && w.pointTo);
        if (wire) {
          let taj = HuatuNet.makeTrunkFromTwoPoints(this, wire.pointFrom!, wire.pointTo!);
          this.trunks.push(taj.trunk);
          wire.trunkFrom = taj.trunk;
          wire.trunkTo = taj.trunk;
          wire.jointFrom = taj.jointFrom;
          wire.jointTo = taj.jointTo;
          wire.midPoints1 = [wire.jointFrom];
          wire.midPoints2 = [wire.jointTo];
          wire.isFixed = true;
          this.pushJoints(taj.jointFrom, taj.jointTo);
          this.retryFixWires();
        }
        else {
          // Find the no TO end wires and check
          let wires = unfixed.filter(w => !w.pointTo && !w.portTo);
          if (wires.length >= 2) {
            let w1 = wires[0],
                w2 = wires[1];
            if (w1.portFrom && w2.portFrom) {
              // Two ports
              // Tie w2's FROM port to w1's TO, and don't draw w2
              w2.isFixed = true;
              w2.noDraw = true;
              w1.portTo = w2.portFrom;
              w1.prepareEnds();
              this.tryFixWire(w1);
            }
            else if (w1.pointFrom && w2.portFrom) {
              let taj = HuatuNet.makeTrunkFromPointAndPort(this, w2.portFrom, w1.pointFrom);
              w1.trunkFrom = taj.trunkPoint;
              w2.trunkFrom = taj.trunkPort;
              w1.jointFrom = taj.jointPoint;
              w2.jointFrom = taj.jointPort;
              w1.jointMid = taj.jointMid;
              this.trunks.push(...taj.trunks);
              this.pushJoints(taj.jointPoint, taj.jointPort);
              if (taj.jointMid) this.pushJoints(taj.jointMid);
              w1.midPoints1 = [w1.jointFrom];
              w2.midPoints1 = [];     // For the Port terminal, it is always the free-start point
              w1.isFixed = true;
              w2.isFixed = true;
            }
            else if (w1.portFrom && w2.pointFrom) {
              let taj = HuatuNet.makeTrunkFromPointAndPort(this, w1.portFrom, w2.pointFrom);
              w1.trunkFrom = taj.trunkPort;
              w2.trunkFrom = taj.trunkPoint;
              w1.jointFrom = taj.jointPort;
              w2.jointFrom = taj.jointPoint;
              w1.jointMid = taj.jointMid;
              this.trunks.push(...taj.trunks);
              this.pushJoints(taj.jointPoint, taj.jointPort);
              if (taj.jointMid) this.pushJoints(taj.jointMid);
              w1.midPoints1 = [];     // For the Port terminal, it is always the free-start point
              w2.midPoints1 = [w2.jointFrom];
              w1.isFixed = true;
              w2.isFixed = true;
            }
            else if (w1.pointFrom && w2.pointFrom) {
              let taj = HuatuNet.makeTrunkFromTwoPoints(this, w1.pointFrom, w2.pointFrom);
              w1.midPoints1 = [taj.jointFrom];
              w1.trunkFrom = taj.trunk;
              w1.jointFrom = taj.jointFrom;
              w1.isFixed = true;
              w2.midPoints1 = [taj.jointTo];
              w2.trunkFrom = taj.trunk;
              w2.jointFrom = taj.jointTo;
              w2.isFixed = true;
              this.trunks.push(taj.trunk);
              this.pushJoints(taj.jointFrom, taj.jointTo);
              this.retryFixWires();
            }
          }
          else {
            // Mark error and break
            if (wires.length == 1) {
              if (wires[0].isExtra) {
                wires[0].noDraw = true;
                wires[0].isFixed = true;
              } else {
                wires[0].errored = true;
                this.huatu.warnings.push(`Wire "${wires[0].wireDef}" failed to be resolved: Wire has no TO end and no other wire in the same NET.`);
                // Mark it as fixed anyway
                wires[0].isFixed = true;
              }
            }
            break;
          }
        }
      }
      // Recheck
      unfixed = this.wires.filter(w => !w.isFixed);
    }
  }

  resetTrunkDrawnStatus() {
    this.trunks.forEach(x => x.isDrawn = false);
  }

  // Static members and methods

  static EQU_TOL: number = 1e-4;
  static PROTRUDE: number = 80;

  static makeTrunkFromPointAndPort = (net: HuatuNet, port: IHuatuComponentPortSettled, point: ISvgPoint) => {
    let hvDir = HuatuNetTrunk.portHvDir(port),
        pFree = port.freeStart,
        trunkPort: HuatuNetTrunk,
        trunkPoint: HuatuNetTrunk,
        trunks: HuatuNetTrunk[] = [],
        jointPort: ISvgPoint | undefined,
        jointPoint: ISvgPoint | undefined,
        jointMid: ISvgPoint | undefined;
    if (hvDir === "E" || hvDir === "W") {
      if ((point.x >= pFree.x && hvDir === "E") || (point.x <= pFree.x && hvDir === "W")) {
        trunkPort = new HuatuNetTrunk(net, pFree.y, pFree.x, point.x, "H");
        trunkPoint = trunkPort;
        jointPort = pFree;
        jointPoint = new SvgPoint(point.x, pFree.y);
        trunks = [trunkPort];
      }
      else {
        let dy = point.y - pFree.y;
        if (dy >= HuatuNet.PROTRUDE || dy <= -HuatuNet.PROTRUDE) {
          trunkPort = new HuatuNetTrunk(net, pFree.x, pFree.y, point.y, "V");
          trunkPoint = trunkPort;
          jointPort = pFree;
          jointPoint = new SvgPoint(pFree.x, point.y);
          trunks = [trunkPort];
        }
        else {
          let y2 = dy >= 0 ? pFree.y + HuatuNet.PROTRUDE : pFree.y - HuatuNet.PROTRUDE;
          trunkPort = new HuatuNetTrunk(net, pFree.x, pFree.y, y2, "V");
          trunkPoint = new HuatuNetTrunk(net, y2, pFree.x, point.x, "H");
          jointPort = pFree;
          jointPoint = new SvgPoint(point.x, y2);
          trunks = [trunkPort, trunkPoint];
          jointMid = new SvgPoint(pFree.x, y2);
        }
      }
    }
    else {
      if ((point.y <= pFree.y && hvDir === "N") || (point.y >= pFree.y && hvDir === "S")) {
        trunkPort = new HuatuNetTrunk(net, pFree.x, pFree.y, point.y, "V");
        trunkPoint = trunkPort;
        jointPort = pFree;
        jointPoint = new SvgPoint(pFree.x, point.y);
        trunks = [trunkPort];
      }
      else {
        let dx = point.x - pFree.x;
        if (dx >= HuatuNet.PROTRUDE || dx < -HuatuNet.PROTRUDE) {
          trunkPort = new HuatuNetTrunk(net, pFree.y, pFree.x, point.x, "H");
          trunkPoint = trunkPort;
          jointPort = pFree;
          jointPoint = new SvgPoint(point.x, pFree.y);
          trunks = [trunkPort];
        }
        else {
          let x2 = dx >= 0 ? pFree.x + HuatuNet.PROTRUDE : pFree.x - HuatuNet.PROTRUDE;
          trunkPort = new HuatuNetTrunk(net, pFree.y, pFree.x, x2, "H");
          trunkPoint = new HuatuNetTrunk(net, x2, pFree.y, point.y, "V");
          jointPort = pFree;
          jointPoint = new SvgPoint(x2, point.y);
          trunks = [trunkPort, trunkPoint];
          jointMid = new SvgPoint(x2, pFree.y);
        }
      }
    }
    // Return the resolved results
    return {
      trunkPort,
      trunkPoint,
      jointPort,
      jointPoint,
      trunks,
      jointMid,
    }
  }

  static makeTrunkFromTwoPoints = (net: HuatuNet, pFrom: ISvgPoint, pTo: ISvgPoint) => {
    let dx = pTo.x - pFrom.x,
        dy = pTo.y - pFrom.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      let xOrY = (pFrom.y + pTo.y) / 2,
          trunk = new HuatuNetTrunk(net, xOrY, pFrom.x, pTo.x, "H"),
          jointFrom = new SvgPoint(pFrom.x, xOrY),
          jointTo = new SvgPoint(pTo.x, xOrY);
      return {
        trunk,
        jointFrom,
        jointTo
      }
    } else {
      let xOrY = (pFrom.x + pTo.x) / 2,
          trunk = new HuatuNetTrunk(net, xOrY, pFrom.y, pTo.y, "V"),
          jointFrom = new SvgPoint(xOrY, pFrom.y),
          jointTo = new SvgPoint(xOrY, pTo.y);
      return {
        trunk, jointFrom, jointTo
      }
    }
  }

}
