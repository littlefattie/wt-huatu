
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
} from "./IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { HuatuComponentDef } from "./HuatuComponentDef.js";
import { WtHuatu } from "../huatu/Huatu.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import { WtMath } from "../math/WtMath.js";
import { AngDeg } from "../geometry/AngDeg.js";
import Line from "../geometry/Line.js";

export interface IHuatuComponentPortParams {
  name?: string;
  anchor?: string;
  rayDeg?: string;
  minHoldLen?: string;
  attr?: string;
}

export class HuatuComponentPort implements IHuatuComponentPort {
  anchor: ISvgPoint;      // The anchor point where the port will be placed
  name: string;           // Name given to the port, e.g. d/s/g, b/c/e, etc, this must be set
  idx?: number;           // Optional sequential index of the port
  rayDeg: number = 0;         // The radiation angle from anchor point TO external
  attr?: "in" | "out" | "inout" | "unset" | "hiz" | "pu" | "pd";
  minHoldLen: number = 0;     // The minimal length that should be hold if drawing wire out from this port

  constructor(name: string, anchor: ISvgPoint) {
    this.name = name;
    this.anchor = anchor;
  }

  static optsComponentPort: IKeyValueOptions = {
    keys: [
      ["name"],
      ["anchor", "at"],
      ["rayDeg", "ray", "deg"],
      ["minHoldLen", "holdLen", "hold"],
      ["attr", "dir", "type"],
    ],
    allowAppend: [],
    numbers: [],
    ints: [],
    booleans: [],
    qualifiers: {
      "attr": ["in", "out", "inout", "unset", "hiz", "pu", "pd"],
    },
    blindGuess: {
      "attr": ["in", "out", "inout", "unset", "hiz", "pu", "pd"],
      "name": x => x,
      "anchor": x => x,
      "rayDeg": x => x,
      "minHoldLen": x => x,
    },
  }

  static isTwoPortsParallel = (p1: IHuatuComponentPortSettled, p2: IHuatuComponentPortSettled) => {
    return (p1.isH && p2.isH) || (p1.isV && p2.isV) ||
      WtMath.isEqual(p1.lineAng, p2.lineAng) || 
      WtMath.isEqual(p1.lineAng, AngDeg.fitAng(p2.lineAng + AngDeg.DEG180));
  }

  static isTwoPortsPerpendicular = (p1: IHuatuComponentPortSettled, p2: IHuatuComponentPortSettled) => {
    return (p1.isH && p2.isV) || (p1.isV && p2.isH) ||
      WtMath.isEqual(p1.lineAng, AngDeg.fitAng(p2.lineAng + AngDeg.DEG90)) ||
      WtMath.isEqual(p1.lineAng, AngDeg.fitAng(p2.lineAng - AngDeg.DEG90)) ||
      WtMath.isEqual(AngDeg.fitAng(p1.lineAng + AngDeg.DEG90), p2.lineAng) ||
      WtMath.isEqual(AngDeg.fitAng(p1.lineAng - AngDeg.DEG90), p2.lineAng);
  }

  static isTwoPortsOnSameLine = (p1: IHuatuComponentPortSettled, p2: IHuatuComponentPortSettled) => {
    return this.isTwoPortsParallel(p1, p2) && (new Line(p1.anchor, p1.lineAng).hasPointOn(p2.anchor));
  }

  // Some indicator to know whether the two ports (two arrows of the two holding lines) are facing to each other
  static isTwoPortsFacing = (p1: IHuatuComponentPortSettled, p2: IHuatuComponentPortSettled) => {
    const p1f = new Line(p1.anchor, p1.lineAng).getPointByLen(2),
          d1 = Point.getDistance(p1.anchor, p2.anchor),
          d2 = Point.getDistance(p1f, p2.anchor);
    const angDiff = AngDeg.fitAng(p1.lineAng - p2.lineAng);
    return (d1 > d2) && (angDiff >= AngDeg.DEG90 && angDiff <= AngDeg.DEG270);
  }

  static isTowPortsParallelBacking = (p1: IHuatuComponentPortSettled, p2: IHuatuComponentPortSettled) => {
    return WtMath.isEqual(AngDeg.DEG180, AngDeg.fitAng(p1.lineAng - p2.lineAng));
  }
  
}
