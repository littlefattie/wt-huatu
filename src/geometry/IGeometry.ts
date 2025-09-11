export interface IPoint {
  x: number;
  y: number;
}

export interface ICircle {
  cx: number;
  cy: number;
  r: number;
}
export interface IRing {
  cx: number;
  cy: number;
  rShort: number;
  rLong: number;
}

export interface IEllipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
}

export interface IEllipticalArc extends IEllipse {
  angStart: number;
  angEnd: number;
  pStart: IPoint;
  pEnd: IPoint;
}

export interface ILine {
  anchor: IPoint;
  ang: number;
  slope: number;
}

export interface ILineSeg {
  pStart: IPoint;
  pEnd: IPoint;
  middle: IPoint;
  slope: number;
  ang: number;
  deg: number;
}

export interface IAngle {
  ang: number;
  pA: IPoint;
  pO: IPoint;
  pB: IPoint;
  rMax: number;
}

export interface ITriangle {
  pA: IPoint;
  pB: IPoint;
  pC: IPoint;

  angA: number;
  angB: number;
  angC: number;

  mAB: IPoint;
  mBC: IPoint;
  mCA: IPoint;

  lAB: number;
  lBC: number;
  lCA: number;

  rInner: number;
  rOuter: number;

  isValid: boolean;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
  center: IPoint;
  anchor: IPoint;
}

export interface IAngleArcPoints {
  hasArc: boolean;
  r: number;
  pStart: IPoint;
  pArcStart: IPoint;
  pArcEnd: IPoint;
  pEnd: IPoint;
  cw: boolean;
  arcCenter?: IPoint;
}

export interface IPolyLine {
  isValid: boolean;
  points: IPoint[];
}

export interface IPolygon {
  isValid: boolean;
  vertices: number;
  points: IPoint[];
  isConvex: boolean;
}

export interface IBezier2 {
  pStart: IPoint;
  pEnd: IPoint;
  ctrlPoint: IPoint;
}

export interface IBezier3 {
  pStart: IPoint;
  pEnd: IPoint;
  ctrlPoint1: IPoint;
  ctrlPoint2: IPoint;
}

export interface IBezier3CurveRadius {
  t: number;
  r: number;
  dAng: number;
}

export interface IGeometryModel {
  getPoint(pos: string | number, t?: number): IPoint | undefined;
  getParam(name: string): number | undefined;
  moveBy(dx: number, dy: number): IGeometryModel | undefined;
  rotateBy(rotDeg: number, at?: IPoint): IGeometryModel | undefined;
}

export interface ILineSegments {
  toLineSegs(): ILineSeg[];
}

export interface ISegmentIntersection {
  px: number,
  py: number,
  t1: number,
  t2: number,
  error: number
}

export interface ICurveFuncsByT {
  px: (t: number) => number,
  py: (t: number) => number,
  dpx: (t: number) => number,
  dpy: (t: number) => number,
}

export interface ISegmentModel {
  pStart: IPoint;
  pEnd: IPoint;

  getCurveFuncs(): ICurveFuncsByT;
  getTofPoint(p: IPoint): number | undefined;
  makeSubSeg(pStart: IPoint, pEnd: IPoint): ISegmentModel | undefined;
  getTangentLineOfPoint(p: IPoint): ILine | undefined;
  getNormalPoint(t: number, dist: number, dir: "right" | "left"): IPoint | undefined
}

export interface ISegmentJointRadiusResult {
  rResolved: number;
  cw: boolean;
  pStart: IPoint;
  pEnd: IPoint;
  iterCount?: number;
  arcCenter?: IPoint;
  t1?: number;
  t2?: number;
}