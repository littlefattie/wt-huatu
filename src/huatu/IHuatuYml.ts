
export interface IHuatuYmlObj {
  [key: string]: IHuatuYmlValueType;
}

export type IHuatuYmlValueType = string | string[] | IHuatuYmlObj | undefined;

export interface IHuatuYmlLabelStyle extends IHuatuYmlObj {
  ref?: string;
  refs?: string;
  style?: string;
  styles?: string;

  color?: string;
  font?: string;

  size?: string;        // alias of fontSize
  fontSize?: string;

  align?: string;      // alias of textAlign
  textAlign?: string;

  bold?: string;
  italic?: string;

  line?: string;     // alias of addLine
  addLine?: string;
}

export interface IHuatuYmlStyle extends IHuatuYmlObj {
  ref: string;

  fillColor?: string;
  fillOpacity?: string;
  fillPattern?: string;
  fillGradient?: string;
  fillRule?: string;
  fill?: string | {
    color?: string;
    opacity?: string;
    pattern?: string;
    gradient?: string;
    rule?: string;
  }

  strokeColor?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
  strokeLineCap?: string
  strokeLineJoin?: string
  strokeMiterLimit?: string;
  strokeDashArray?: string;
  strokeDashOffset?: string;
  stroke?: string | {
    color?: string;
    width?: string;
    opacity?: string;
    lineCap?: string;
    lineJoin?: string;
    miterLimit?: string;
    dashArray?: string;
    dashOffset?: string;
  }

  markerStart?: string;
  markerMid?: string;
  markerEnd?: string;
  marker?: string | {
    start?: string;
    mid?: string;
    end?: string;
  }

  clip?: string;
  mask?: string;
}

export interface IHuatuYmlMarker extends IHuatuYmlObj  {
  type?: string;
  size?: string;
  len?: string;
  length?: string;
  len2?: string;
  length2?: string;
  r?: string;
  r1?: string;
  r2?: string;
  degStart?: string;
  roundCorner?: string;
  color1?: string;
  priColor?: string;
  primaryColor?: string;
  color2?: string;
  secColor?: string;
  secondaryColor?: string;
  close?: string;
  fillOpacity?: string;
}

export interface IHuatuYmlPattern extends IHuatuYmlObj  {
  type?: string;          // The different types of pattern, e.g. Slash, or dots, or squares, etc.

  density?: string;       // How dense the Pattern is organized. This is lineDensity, dot/square/grid density
  lineDensity?: string;
  dotsDensity?: string;
  squareDensity?: string;

  color?: string;         // LineColor, dot color, square color, etc
  opacity?: string;       // Opacity of the pattern, dot/square's fill opacity, for lines, the line-stroke-opacity

  rotDeg?: string;
  deg?: string;
  lineDeg?: string;       // This is specially for line-like pattern, to make the slope to tan(deg).

  lineWeight?: string;    // How thick of the line
  lineWidth?: string;

  lineStyle?: string;     // this is "solid", "dashed", "dotted", etc.

  dashDensity?: string;   // How dense the dash is presented
  dashedDensity?: string;
  dottedDensity?: string;

  size?: string;          // Size of the
  bgColor?: string;       // Background
  background?: string;
  bgOpacity?: string;     // Background Opacity

  sparseK?: string;       // The factor to make unequal grid lines
}

export interface IHuatuYmlSymbolArray extends IHuatuYmlObj {
  symbol?: string;
  sym?: string;

  startPoint?: string;
  start?: string;
  from?: string;
  
  desc?: string;  
  method?: string;
  arrayMethod?: string;
  
  deltaX?: string;
  dx?: string;
  
  deltaY?: string;
  dy?: string;
  
  count?: string;
  countX?: string;
  countY?: string;
  
  center?: string;
  centerPoint?: string;
  at?: string;
  
  rotDeg?: string;
  rot?: string;
  rotate?: string;
  
  alignCenter?: string;
  // A number of a function of (theta) => radius
  radius?: string;
  r?: string;
  // A number of scale or a function of (nx, ny) => scale, or (radius) => scale
  scale?: string;
  // A flag to notify that symbol shall not rotate when configuring polar array
  notRotate?: string;
  noRotate?: string;
  noRot?: string;
  
  startDeg?: string;
  initialDeg?: string;
  iniDeg?: string;
  
  deltaDeg?: string;
  degDelta?: string;
  degD?: string;
  dDeg?: string;
}

export interface IHuatuYmlJob extends IHuatuYmlObj{
  desc?: string;
  viewBox?: string;
  viewArea?: string;        // The alias of ViewBox
  viewBetween?: string;     // It is possible to resolve viewBox from two points
  width?: string;
  height?: string;
  size?: string;
  drawings?: string | string[];
  config?: IHuatuConfigInYml;
}

export interface IHuatuConfigInYml extends IHuatuYmlObj {
  // Label Background Color, and aliases
  labelBackground?: string;
  labelBackgroundColor?: string;
  labelBg?: string;
  labelBgColor?: string;

  // Label Border Color and  aliases
  labelBorder?: string;
  labelBorderColor?: string;

  markCenters?: string;               // It is a Yes/No True/False switch
  markBezierAuxLines?: string;        // It is a Yes/No True/False switch
  markNamedPoints?: string;           // It is the color, to mark the points
  markPathPoints?: string;            // It is the color of the path points
  markSize?: string;                  // This is the size when configuring

  // Mark the Anchors and positions
  markPositions?: string;             // It is the color of dots which indicate location/position/anchor
  markAnchors?: string;               // It is the color of dots which indicate location/position/anchor

  // Whether print in Defs the modules that are not ever referred (refCount == 0)
  printUnusedModule?: string          // It is a Yes/No True/False switch

  // Show The bounding box
  showBBox?: string;                  // It is the border of the BBOX to show

  // The unified attributes
  [key: string]: string | undefined;
}

export type HuatuYmlNamedFieldType =
  | string
  | string[]
  | IHuatuYmlStyle
  | IHuatuYmlLabelStyle
  | IHuatuYmlMarker
  | IHuatuYmlPattern
  | IHuatuYmlSymbolArray
  | IHuatuYmlJob
  | undefined;

export interface IHuatuYamlFile extends IHuatuYmlObj {
  title?: string;
  desc?: string;

  viewBox?: string;
  viewArea?: string;        // The alias of ViewBox
  viewBetween?: string;     // It is possible to resolve viewBox from two points

  size?: string;

  config?: IHuatuConfigInYml;

  vars?:         { [name: string]: string | undefined; };
  points?:       { [name: string]: string | undefined; };

  shapes?:       { [name: string]: string | undefined; };
  cpoints?:      { [name: string]: string | undefined; };
  xpoints?:      { [name: string]: string | undefined; };
  pointSeries?:  { [name: string]: string | undefined; };
  shapeSeries?:  { [name: string]: string | undefined; };

  shapes2?:      { [name: string]: string | undefined; };
  cpoints2?:     { [name: string]: string | undefined; };
  xpoints2?:     { [name: string]: string | undefined; };
  pointSeries2?: { [name: string]: string | undefined; };
  shapeSeries2?: { [name: string]: string | undefined; };

  shapes3?:      { [name: string]: string | undefined; };
  cpoints3?:     { [name: string]: string | undefined; };
  xpoints3?:     { [name: string]: string | undefined; };
  pointSeries3?: { [name: string]: string | undefined; };
  shapeSeries3?: { [name: string]: string | undefined; };

  shapes4?:      { [name: string]: string | undefined; };
  cpoints4?:     { [name: string]: string | undefined; };
  xpoints4?:     { [name: string]: string | undefined; };
  pointSeries4?: { [name: string]: string | undefined; };
  shapeSeries4?: { [name: string]: string | undefined; };

  patterns?:     { [name: string]: string | IHuatuYmlPattern    | undefined; };
  markers?:      { [name: string]: string | IHuatuYmlMarker     | undefined; };

  styles?:       { [name: string]: string | IHuatuYmlStyle      | undefined; };
  labelStyles?:  { [name: string]: string | IHuatuYmlLabelStyle | undefined; }

  paths?:        { [name: string]: string | string[] | undefined; };
  pathSeries?:   { [name: string]: string | string[] | undefined; };

  clips?:        { [name: string]: string | string[] | undefined; };
  symbols?:      { [name: string]: string | string[] | undefined; };
  blocks?:       { [name: string]: string | string[] | undefined; };
  layers?:       { [name: string]: string | string[] | undefined; };

  arrays?:       { [name: string]: string | IHuatuYmlSymbolArray | undefined; };

  /**
   * Draw is the final selected output elements, even though it was defined, it will
   * not be printed to final output if it is not listed under draw command.
   * When editing the yml input file, please list the wanted-to-be-printed elements.
   * Either separated by semi-colon (;) or in list form. The acceptable named entry/element(s)
   * are:
   *  - Path (with/without style)
   *  - Path Series (with/without style)
   *  - Array (of path, with/without style)
   *  - Symbol (with/without style, transform)
   *  - Block (with/without style, transform)
   *  - Layer (with/without style)
   *  - Label, Labels listed here will be placed in the global layer, and in sequential z-order
   */
  draw?: string | string[] | IHuatuYmlJob;

  // Independent jobs if the file used to build png/pdf on server
  jobs: { [name:string]: string | string[] | IHuatuYmlJob | undefined; };

}

export interface IYmlLineInfo {
  lineNumber: number;
  indentLevel: number;    // The indent divided by 2, i.e. one indent should have 2 spaces
  isListItem: boolean;
  key?: string;
  value?: string;
  isPureValue: boolean;
}

export interface IHuatuYmlParsingResult {
  succeeded: boolean;
  errorMessages: {
    lineNumber: number,
    message: string
  }[];
  rootObj?: IHuatuYmlObj;
}
