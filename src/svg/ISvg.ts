import type { IGeometryModel, ISegmentModel } from "../geometry/IGeometry";

export type TSvgLineJoin = "miter" | "round" | "bevel";
export type TSvgLineCap = "butt" | "round" | "square";

export interface ISvgBBoxMaxMin {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ISvgBBox {
  x: number;
  y: number;
  w: number;
  h: number;
  isDummy: boolean;

  buildString(): string;
  toMaxMins(): ISvgBBoxMaxMin;
  getAnchor(): ISvgPoint;
  getCenter(): ISvgPoint;
  extendByStroke(strokeWidth: number): ISvgBBox;
  copy(): ISvgBBox;
  mergeAnother(box: ISvgBBox): ISvgBBox;
  moveBy(dx: number, dy: number): ISvgBBox;
  rotateAt(rotCenter: ISvgPoint, rotDeg: number): ISvgBBox;
  scale(t: number): ISvgBBox;
  buildRectSvg(withClass?: boolean): string;
  mirrorAt(mirrorX?: boolean, mirrorY?: boolean, at?: ISvgPoint): ISvgBBox;
}

export interface ISvgPoint {
  x: number;
  y: number;
}

export interface ISvgPath {
  realPoints: ISvgPoint[];
  auxPoints: ISvgPoint[];
  centers: ISvgPoint[];
  bbox: ISvgBBox;
  stroke?: IStrokeConfig;
  fill?: IFillConfig;
  marker?: IMarkerConfig;
  clip?: string | ISvgClipPath;
  pathTag: string;
  models: IGeometryModel[];

  getPathAttr(): string[];
  buildPathData(): string;

  /* This function will build html of certain path without "styles" (fill, stroke, etc.) */
  buildPathHtmlOnly(id?: string): string;
  buildHtml(additional?: string): string;
  buildHtmlFull(stroke?: IStrokeConfig, fill?: IFillConfig, marker?: IMarkerConfig, clip?: ISvgClipPath | string): string;

  /* The methods to duplicate to right or left */
  duplicateTo(distance: number, dir: "right" | "left" | "in" | "out", lineJoin?: TSvgLineJoin): ISvgPath | undefined;
}

export interface ISvgPathSegment extends ISvgPath {
  isStartSeg: boolean;
  closePath: boolean;
  pStart: ISvgPoint;
  pEnd: ISvgPoint;
  auxModel: ISegmentModel | undefined;

  buildSegPathData(): string;
  moveBy(dx: number, dy: number): ISvgPathSegment | undefined;
  rotateBy(rotDeg: number, at?: ISvgPoint): ISvgPathSegment | undefined;
  reverse(): ISvgPathSegment | undefined;
  makeSubPath(pStart: ISvgPoint, pEnd: ISvgPoint): ISvgPathSegment | undefined;
}

export interface ISvgContinuousSegmentedPath {
  segments: ISvgPathSegment[];
  isClosed: boolean;

  pStart: ISvgPoint | undefined;
  pEnd: ISvgPoint | undefined;
  reverse(): ISvgContinuousSegmentedPath;
}

export interface ISvgSegmentedPath extends ISvgPath {
  segments: ISvgPathSegment[];

  reverse(): ISvgSegmentedPath;
}


export interface IFillConfig {
  color?: string;
  opacity?: number;
  rule?: "nonzero" | "evenodd";
}

export interface IStrokeConfig {
  color?: string;
  width?: number;
  opacity?: number;
  lineCap?: TSvgLineCap;
  lineJoin?: TSvgLineJoin;
  miterLimit?: number;
  dashArray?: number[] | "none" ;
  dashOffset?: number;
}

export interface IPathConfigs {
  stroke?: IStrokeConfig;
  fill?: IFillConfig;
  marker?: IMarkerConfig;
  clip?: string | ISvgClipPath;
}

export interface ISvgShape {
  hasStroke: boolean;
  hasFill: boolean;

  stroke?: IStrokeConfig;
  fill?: IFillConfig;

  primaryColor: "fill" | "stroke";
  secondaryColor?: "fill" | "stroke";

  paths: ISvgPath[];
  bbox: ISvgBBox;

  setStroke(stroke: IStrokeConfig): void;
  setFill(fill: IFillConfig): void;
  getBBox(strokeWidth?: number): ISvgBBox;
  buildHtml(fillColor?: string, fillOpacity?: number, strokeColor?: string, strokeWidth?: number): string;
}

export type SvgUnitsType = "userSpaceOnUse" | "objectBoundingBox";
export type SvgFillGradientSpreadMethod = "pad" | "reflect" | "repeat";

export interface ISvgGradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

export interface ISvgGradient {
  id: string;
  units: SvgUnitsType;
  spreadMethod: SvgFillGradientSpreadMethod;
  stops: ISvgGradientStop[];

  buildHtml(): string;
}

export interface ISvgGradientLinear extends ISvgGradient {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface ISvgGradientRadial extends ISvgGradient {
  cx?: number;
  cy?: number;
  r?: number;
  fx?: number;
  fy?: number;
}

export interface ISvgPattern {
  x: number;
  y: number;
  width: number;
  height: number;

  units: SvgUnitsType;
  contentUnits?: SvgUnitsType;
  viewBox?: ISvgBBox;
  paths: ISvgPath[];

  buildHtml(id?: string): string;
}

export interface ISvgMarker {
  id: string;
  units: "strokeWidth" | "userSpaceOnUse";
  refX: number;
  refY: number;
  orient: number | "auto" | "auto-start-reverse";   // If use number, it means degrees
  viewBox: ISvgBBox;
  preserveAspectRatio?: boolean;
  stroke?: IStrokeConfig;
  fill?: IFillConfig;
  shape: ISvgShape;

  buildMarkerSvg(id?: string, primaryColor?: string, secondaryColor?: string): string;
}

export interface ISvgClipPath {
  id?: string;
  path?: ISvgPath;
  paths?: ISvgPath[];
  group?: ISvgGroup;
}

export interface IMarkerConfig {
  start?: string;
  mid?: string;
  end?: string;
}

export type ISvgElement = ISvgPath | ISvgGroup | ISvgLayer;

export interface ISvgGroup {
  bbox: ISvgBBox;
  clipPath?: ISvgPath | string;
  elements?: ISvgElement[];
  stroke?: IStrokeConfig;
  fill?: IFillConfig;
  clip?: string | ISvgClipPath;

  add(element: ISvgElement): void;
  getBBox(): ISvgBBox;      // Get the BBOX of this group, it returns the calculated result of this elements
}

export interface ISvgLayer extends ISvgGroup {
  name: string;             // Name of the layer
  desc?: string;            // Description
  visible: boolean;         // Is Visible, i.e. layer could be disabled, either not to render, or not display
  zIndex: number;
  indicator: string;        // This is some color indicating certain layer

  renderHtml(): string;     // The renderer used in final Figure generating

  //TODO: Add more if new attributes required to be added
}

export interface ISvgFigure {
  nameSpace?: string;
  viewBox?: ISvgBBox;
  desc?: string;
  title?: string;

  /**
   * Markers and Clip-Paths are dictionaries used for other paths/groups to refer
   */
  markers?: ISvgMarker[];
  clipPaths?: ISvgClipPath;

  /**
   * The Figure is abstracted as layers in the perspective of Figure Root, if there is nor layer,
   * then they all will be placed under "Root layer".
   */
  layers?: ISvgLayer[];


  /**
   * The final renderer
   */
  buildFigureHtml(): string;
}
