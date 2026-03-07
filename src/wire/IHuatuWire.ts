
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
  color?: string;
  lineWidth?: number;

  addWire(wire: IHuatuWire): void;
  getWires(): IHuatuWire[];

}

export interface IHuatuWire {
  wireDef: string;
  portFrom?: IHuatuComponentPortSettled;
  pointFrom?: ISvgPoint;
  portTo?: IHuatuComponentPortSettled;
  pointTo?: ISvgPoint;
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
  isFixed: boolean;
  noDraw: boolean;

  startPoints: ISvgPoint[];
  endPoints: ISvgPoint[]; 
  midPoints1: ISvgPoint[];
  midPoints2: ISvgPoint[];
  
  // Linked wire
  linkedWire?: IHuatuWire;

}
