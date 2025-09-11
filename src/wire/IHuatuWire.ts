
import type {
  ISvgBBox,
  ISvgClipPath,
  ISvgMarker,
  ISvgPath,
  ISvgPattern,
  ISvgPoint
} from "../svg/ISvg.js";

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
import type { IHuatuComponentPortSettled } from "../component/IHuatuComponent.js";

export interface IHuatuNet {
  name?: string;      // Name of the net if specified
  magicId: string;

  addWire(wire: IHuatuWire): void;
  getWires(): IHuatuWire[];

}

export interface IHuatuWire {
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
}
