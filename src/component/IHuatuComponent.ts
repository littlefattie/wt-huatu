/** This file holds all the data structures designed for WT Huatu, all the modelling will be placed here. */

import type {
  IBezier2,
  IBezier3,
  ICircle,
  IEllipse,
  IEllipticalArc,
  ILine,
  ILineSeg,
  IPoint,
  IPolyLine,
  IPolygon,
  IRect,
  ITriangle,
  IGeometryModel
} from "../geometry/IGeometry.js";

import type {
  ISvgBBox,
  ISvgClipPath,
  ISvgMarker,
  ISvgPath,
  ISvgPattern,
  ISvgPoint
} from "../svg/ISvg.js";

import type {
  IHuatu,
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
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";

export type IHuatuInputVarType = "number" | "text" | "color";

export interface IHuatuInputVar {
  name: string;        // Name of the InputVar
  type: IHuatuInputVarType;
  value: number | string;
}

export interface IHuatuComponentInputVars  {
  [name: string]: string | number;
}

/* ----------------------   EXPORTS START HERE   ----------------------------------- */

export interface IHuatuYmlComponentDef extends IHuatuYmlObj {
  // TODO: write the definition fields
}

export interface IHuatuComponentPort {
  anchor: ISvgPoint;      // The anchor point where the port will be placed
  name: string;           // Name given to the port, e.g. d/s/g, b/c/e, etc, this must be set
  idx?: number;           // Optional sequential index of the port
  rayDeg: number;         // The radiation angle from anchor point TO external
  attr?: "in" | "out" | "inout" | "unset" | "hiz" | "pu" | "pd";
  minHoldLen: number;     // The minimal length that should be hold if drawing wire out from this port
}

export interface IHuatuComponentPortSettled {
  name: string;
  anchor: ISvgPoint;
  freeStart: ISvgPoint;
  lineAng: number;
  lineDeg: number;
  isH: boolean;
  isV: boolean;
  minHoldLen: number;
}

/**
 * Model of the definition of the Component
 */
export interface IHuatuComponentDef {
  // Name of the Component definition
  name: string;
  // Description If any
  desc?: string;
  // The Raw details of the definition, i.e. what the user input for this component as-is
  def: IHuatuYmlObj;
  // Input Vars in definition and default values
  inputVars: IHuatuInputVar[];
  // An indicator to show whether the definition can successfully make a ComponentDef
  isValid: boolean;
}

export type HuatuComponentPlacementRefPointType = "center" | "origin";
export type HuatuComponentPlacementMirrorType = "x" | "y" | "xy";

/**
 * Model of the instantiated component
 */
export interface IHuatuComponentPlacement {
  // An indicator to show  whether the placement is valid
  isValid: boolean;

  // Name of the placement, it is used to identify this placement and possibly make wire connections
  name: string;

  // Where will be the component placed
  location: ISvgPoint;

  // The referenced Huatu ComponentDef
  def?: IHuatuComponentDef;

  // The Input Var substituted Huatu Definition Object, will be resolved to a component, sub-huatu
  huatuDef?: IHuatuYmlObj;

  // The resolved huatu model
  huatu?: IHuatu;

  // The given (thus replacing) Input vars to instantiate components
  givenInputVars: IHuatuComponentInputVars;

  // The ports specifically designed for components
  // These are the real ports which might be re-designed by Input Vars
  ports: IHuatuComponentPort[];

  // Flag to mark if the component is mirrored, either x or y axis, or both x and y axis
  mirror?: HuatuComponentPlacementMirrorType;

  // Some rotation supported when placing the component
  rotDeg?: number;

  // Flag to mark what point is used as reference point when the component is transformed when placed
  // - origin means point (0, 0)
  // - center means the center of the ViewBox of the component drawings (only graph)
  refPointType: HuatuComponentPlacementRefPointType;

  // Whether rotate the label(s) when rotating the component
  rotateLabel?: boolean;

  getRefPoint(): ISvgPoint;

}
