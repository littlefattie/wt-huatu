
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
} from "../component/IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { HuatuComponentDef } from "../component/HuatuComponentDef.js";
import { WtHuatu } from "../huatu/Huatu.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import type { IHuatuNet, IHuatuWire } from "./IHuatuWire.js";
import { genHex } from "../tools/gen-id.js";
import { HuatuWire } from "./HuatuWire.js";

export class HuatuNet implements IHuatuNet {
  name?: string;
  magicId: string;
  
  constructor(name?: string, ) {
    this.name = name;
    this.magicId = genHex(8);
  }
  
  wires: IHuatuWire[] = [];

  addWire(wire: IHuatuWire): void {
    // Will not add duplicated wires
    if (this.wires.find(x => x === wire)) return;
    this.wires.push(wire);
  }

  getWires(): IHuatuWire[] {
    return this.wires;
  }

  resolveWirePoints(): void {
    //TODO: implement it, This will be done, just before the HTML building
  }

  // Static members and methods



}
