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
  IGeometryModel,
  IAngle
} from "../geometry/IGeometry.js";

import type {
  IFillConfig,
  IStrokeConfig,
  ISvgBBox,
  ISvgClipPath,
  ISvgMarker,
  ISvgPath,
  ISvgPattern,
  ISvgPoint,
  TSvgLineCap,
  TSvgLineJoin
} from "../svg/ISvg.js";

import type {
  IHuatuComponentPlacement,
  IHuatuComponentDef
} from "../component/IHuatuComponent.js";


/* ----------------------   EXPORTS START HERE   ----------------------------------- */

export interface IHuatuConfig {
  labelBackground?: string;
  labelBorder?: string;               // It is border color, width will be default
  markCenters?: boolean;              // A yes/no switch to mark Centers
  markBezierAuxLines?: boolean;       // A yes/no switch to Mark Bezier Aux Lines
  markNamedPoints?: string;           // It is the color, to mark the points
  markPathPoints?: string;            // It is the color of the path points
  markSize?: number;                  // This is the size when configuring
  markPositions?: string;             // It is the color of dots which indicate location/position/anchor
  printUnusedModule?: boolean;        // A yes/no switch to print the unused modules in <defs /> tag
  showBBox?: string;                  // It is the border color of the BBOX to show
  noRefStyle?: boolean;               // No class="sty" line presentation in svg, using attributes instead
                                      // Used in Component svg rendering

  // TODO: If new configurations required, please add accordingly
}

declare global {
  var wtHuatuConfig: IHuatuConfig | undefined;
  var buildType: SvgBuildType;
  var huatuKatexCss: string;
  var wthtJobBuildId: string;
}

export interface IPointString {
  x: string;
  y: string;
}

export interface ISize2D {
  width: number;
  height: number;
}

export interface IWtImage {
  /** Format of the image, it could be some plain SVG code, some IMAGE URL, or unified URL, or WT-HUATU yml */
  format: "wt-huatu" | "url" | "svg";

  /** The source of the image, it is the value of the SOURCE, URL or "source code" of WTHT yml */
  source?: string;

  title?: string;
  desc?: string;

  imgNumber?: string;         // Like Fig 1
  imgSubNumber?: string;      // Like Fig 1(a)

}

export interface IHuatuVar {
  howGet: "direct" | "derived";
  name: string;
  value: number;
  def?: string;               // The string that defines the InputVar, This is used to re-calculate var's value
}

export interface IExprElement {
  type: "num" | "plus" | "minus" | "power" | "mult" | "div" | "func" | "op" | "cp";
  text: string;
  value: number;
  prev?: IExprElement;
  next?: IExprElement;
}

export interface IHuatuPoint {
  name: string;
  howGet: "direct" | "derived" | "calculated" | "intersection";
  x: number;
  y: number;

  toSvgPoint(): ISvgPoint;
  toPoint(): IPoint;
}

export interface IHuatuPointSeries {
  name: string;
  points: ISvgPoint[];

  getPoint(idx: number): ISvgPoint | undefined;
  count(): number;
}

export interface ISolvedXPoints {
  path1: string;
  path2: string;
  points: ISvgPoint[];
}

export interface IResultResolveXPoints {
  result: "Error" | "Invalid" | "Success";
  errors: string[];
  points: ISvgPoint[];
}

export interface IHuatuPath {
  name?: string;
  path?: ISvgPath;
  model?: IGeometryModel;
}

export interface IHuatuPathSeries {
  name?: string;
  paths: ISvgPath[];
  models: IGeometryModel[];
}

export interface IHuatuLabelStylePure {
  color?: string;
  font?: string;
  fontSize?: number;
  textAlign?: string;
  bold?: boolean;
  italic?: boolean;
  addLine?: string;
  lineHeight?: number;
}

export interface IHuatuLabelStyle extends IHuatuLabelStylePure {
  name: string;

  // This fields hold all the defined styles that new styles can inherit
  refStyles: IHuatuLabelStyle[];
}

export interface IHuatuLabel extends IHuatuLabelStylePure {
  text: string;
  width: number;
  height: number;
  location?: ISvgPoint;
  anchorOffset?: ISvgPoint;
  rotDeg?: number;
  /**
   * The possible anchoring positions for a label are:
      "tl" | "topleft"
    | "tm" | "topmiddle"
    | "tr" | "topright"
    | "ml" | "middleleft"
    | "mm" | "center" | "c" | "middlemiddle"
    | "mr" | "middleright"
    | "bl" | "bottomleft"
    | "bm" | "bottommiddle"
    | "br" | "bottomright";
   */
  anchorPos?: string;
  // Styles
  styles: IHuatuLabelStyle[];
}

export interface IHuatuAngleMark {
  angle: IAngle;
  label?: IHuatuLabel;
  labelLoc: ISvgPoint;
  arcs: ISvgPath[];
  arrow?: ISvgPath;
  fillArea?: ISvgPath;
  cfgFill?: IFillConfig;
  cfgStroke?: IStrokeConfig;

  pA: ISvgPoint;
  pB: ISvgPoint;
  pC: ISvgPoint;
  angStart: number;
  angEnd: number;
  angSmall: number;
  angLarge: number;
  type: string;
  lineWidth: number;
  size: number;
  large: boolean;
  labelText?: string;
  labelWidth: number;
  labelHeight: number;
  labelFontSize?: number;
  anchor?: string;      // Same as Label's anchor
  isPerp: boolean;
}

export type HuatuDimMarkType = "hori" | "vert" | "line";
export type HuatuDimMarkArrowType = "solid" | "simple" | "empty" | "none";

export interface IHuatuDimMark {
  pStart: ISvgPoint;
  pEnd: ISvgPoint;

  type: HuatuDimMarkType;
  dir: "right" | "left";

  gap: number;

  isHori: boolean;
  isVert: boolean;
  isValid: boolean;
  isZeroDim: boolean;

  barWidth: number;
  lineWidth: number;
  barLength: number;
  barLenEqual: boolean;
  linePos: number;

  hasStartBar: boolean;
  hasEndBar: boolean;
  cfgBar: IStrokeConfig;
  cfgLine: IStrokeConfig;

  arrowType: HuatuDimMarkArrowType;

  label?: IHuatuLabel;

  labelText?: string;
  labelTextColor?: string;
  labelBackground?: string;
  labelBorderColor?: string;
  labelWidth: number;
  labelHeight: number;
  labelFontSize?: number;
}

export interface IHuatuStyle {
  // This fields hold all the reference styles that the ad hoc drawing will call
  refStyles: IHuatuStyle[];

  name?: string;

  fillColor?: string;
  fillOpacity?: number;
  fillPattern?: string | IHuatuPattern;
  fillRule?: "nonzero" | "evenodd";
  fillGradient?: string;

  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeLineCap?: TSvgLineCap;
  strokeLineJoin?: TSvgLineJoin;
  strokeMiterLimit?: number;
  strokeDashArray?: number[] | "none" ;
  strokeDashOffset?: number;

  markerStart?: string | IHuatuMarker;
  markerMid?: string | IHuatuMarker;
  markerEnd?: string | IHuatuMarker;

  clipPath?: string | IHuatuClipPath;

  buildCss(): string;
  buildSvgAttr(direct?: boolean): string;
}

export interface IHuatuTransform {
  x?: number;
  y?: number;
  rotCx?: number;
  rotCy?: number;
  rotDeg?: number;
  scale?: number;
}

export type SvgBuildType = "direct" | "linking";

export interface IHuatuFinalDraw {
  // Get the bbox of the drawing item after applying styles and transform
  getBBox(): ISvgBBox;

  /**
   * The functions used to build SVG HTML in the final draw, It is designed for
   *  - HuatuDrawing, which has its own styles and transformations, and
   *  - Label, which is defined in just one line
   */
  buildHtml(buildType: SvgBuildType): string;
}

export interface IHuatuDrawing {
  /**
   * Shared style if applicable
   */
  style?: IHuatuStyle;

  /**
   * The Transform control is used to place symbol/Symbol Array/block, if it is required.
   * x, y are used for all the possible type of elements
   * rotCx, rotCy, rotDeg and scale will only be used by Symbol.
   * Block could be moved by x/y, scale, and rotated
   * Array and Layer will not accepted any transform
   */
  transform?: IHuatuTransform;

  /**
   * This switch will be only used for Symbol and Symbol Array.
   * Since there is some case that one Symbol needs to be located/aligned
   * at the top-left corner or center of the symbol.
   * So here provide a switch, if the chart designer wants to specify this.
   */
  alignCenter?: boolean;

  /** The Element going to draw */
  element?: IHuatuDrawingElement;
}

export interface IHuatuDrawingElement {
  // Get the BBOX
  getBBox(style?: IHuatuStyle): ISvgBBox;

  // Two functions for Drawing Html building, Direct and Linking way
  buildHtml(buildType: SvgBuildType, style?: IHuatuStyle, transform?: IHuatuTransform): string;
}

export interface IHuatuDefinable {
  magicId: string;
  buildId(): string;
  buildHtmlForDef(): string;
  refCount: number;
  alwaysInDef: boolean;
  // This might be not required, since the modules that refer to this is not concerned
  // If this is required in the future, please uncomment this and implement code for it
  // linkers: Object[];
}

export interface IHuatuCss {
  magicId: string;
  buildCss(): string;
  refCount: number;
}

/**
 * The interface for the modules that could having multiple Drawings/labels
 */
export interface IHuatuDrawingGroup {
  name: string;     // If it is a group, then it should be named to be re-used/referred later
  desc?: string;    // Optional Description
  bbox: ISvgBBox;

  elements: IHuatuFinalDraw[];
  addElement(element: IHuatuFinalDraw): void;
}

/**
 * A symbol defined by composing multiple paths. It will show as
 */
export interface IHuatuSymbol {
  // The real viewBox if specified by designer
  viewBox?: ISvgBBox;
}

export interface IHuatuSymbolArray {
  name: string;

  symbol: IHuatuSymbol;
  arrayMethod: "polar" | "line" | "2d";

  startPoint?: ISvgPoint;
  deltaX: number;
  deltaY: number;
  /**
   * This count will be shared when Array specified as Polar or Line type
   * If specified as 2D, then countX and countY will work.
   */
  count: number;
  countX: number;
  countY: number;

  center?: ISvgPoint;
  startDeg?: number;
  deltaDeg?: number;

  alignCenter?: boolean;
}
export interface IHuatuClipPath {
  name: string;
  paths: ISvgPath[];
  clipRule?: "evenodd" | "nonzero";
}

export interface IPatternParams {
  type?: string;
  lineDensity?: number;
  rotDeg?: number;
  lineWeight?: number;
  lineStyle?: string;
  dashDensity?: number;
  size?: number;
  color?: string;
  opacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  sparseK?: number;
}
export interface IHuatuPattern {
  name: string;
  pattern: ISvgPattern;
  params?: IPatternParams;
}

export interface IMarkerParams {
  type?: string;
  size?: number;
  width?: number;
  height?: number;
  r?: number;
  rx?: number;
  ry?: number;
  n?: number;     // This is for Polygon marker building
  direction?: string;
  centerEmpty?: boolean;
  rIn?: number;
  rOut?: number;
  degOffset?: number;
  degOpen?: number;
  len?: number;
  k?: number;
  closeArrow?: boolean;
  makeSmooth?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface IHuatuMarker {
  name: string;
  marker: ISvgMarker;
  params?: IMarkerParams;
}

export interface IHuatuJob {
  huatu: IHuatu;      // This is the back reference
  name: string;
  desc?: string;
  viewBox?: ISvgBBox;
  width?: number;
  height?: number;
  drawings: IHuatuFinalDraw[];
  defines: IHuatuDefinable[];
  styles: IHuatuCss[];
  config?: IHuatuConfig;

  buildSvg(buildType: SvgBuildType, withSize?: boolean, width?: number, height?: number): string;
  buildSvgOfScale(buildType: SvgBuildType, scale?: number): string;
  buildHtml(buildType: SvgBuildType, indent?: boolean, withSize?: boolean): string;
  buildSvgStandalone(buildType: SvgBuildType, indent?: boolean, withSize?: boolean): string;
  getViewBoxWithoutLabels(): ISvgBBox;
}

export interface IHuatuResolvingError {
  title: string;
  msgs?: string[];
}

export interface IHuatu {
  title?: string;
  desc?: string;

  config?: IHuatuConfig;

  width?: number;
  height?: number;

  viewBox?: ISvgBBox;

  vars: IHuatuVar[];

  clips: IHuatuClipPath[];
  patterns: IHuatuPattern[];
  markers: IHuatuMarker[];

  styles: IHuatuStyle[];
  labelStyles: IHuatuLabelStyle[];

  points: IHuatuPoint[];
  pointSeries: IHuatuPointSeries[];
  paths: IHuatuPath[];
  pathSeries: IHuatuPathSeries[];

  defines: IHuatuDefinable[];
  blocks: IHuatuDrawingGroup[];
  symbols: IHuatuSymbol[];
  arrays: IHuatuSymbolArray[];

  layers: IHuatuDrawingGroup[];       // Its type is Group, because it has no individual parameters

  compDefs: IHuatuComponentDef[];
  compPlacements: IHuatuComponentPlacement[];

  draw?: IHuatuJob;
  // The jobs, 'draw' is actually one specific job, and normally used for previewing
  // And jobs used for printing, the jobName here should not be 'draw', because what
  // is going to be included in a job named as 'draw' should be supposed to placed under
  // the item 'draw'
  jobs: IHuatuJob[];

  infos: string[];
  warnings: string[];
  resolvingErrors: IHuatuResolvingError[];

  /**
   * The final printer
   */
  buildSvg(buildType: SvgBuildType, jobName?: string): string;
  buildSvgAsHtml(buildType: SvgBuildType, jobName?: string, indent?: boolean): string;
  buildSvgStandalone(buildType: SvgBuildType, jobName?: string, indent?: boolean): string;

}
