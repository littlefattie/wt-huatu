
import type {
  IGeometryModel,
  IPoint
} from "../geometry/IGeometry.js";

import type {
  IHuatuDefinable,
  IHuatuDrawingElement,
  IHuatuPath,
  IHuatuPoint,
  IHuatuStyle,
  IHuatuTransform,
  SvgBuildType
} from "./IHuatu.js";

import type { ISvgBBox, ISvgPath, ISvgPoint } from "../svg/ISvg.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import LineSeg from "../geometry/LineSeg.js";
import Circle from "../geometry/Circle.js";
import Ellipse from "../geometry/Ellipse.js";
import Triangle from "../geometry/Triangle.js";
import Rect from "../geometry/Rect.js";
import Polygon from "../geometry/Polygon.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";
import { Bezier2, Bezier3 } from "../geometry/Bezier.js";
import PolyLine from "../geometry/PolyLine.js";
import Line from "../geometry/Line.js";
import Ring from "../geometry/Ring.js";

import { PathLine } from "../path/PathLine.js";
import { PathTriangle } from "../path/PathTriangle.js";
import { PathCircle } from "../path/PathCircle.js";
import { PathEllipse } from "../path/PathEllipse.js";
import { PathPolygon } from "../path/PathPolygon.js";
import { PathBezier2 } from "../path/PathBezier2.js";
import { PathRect } from "../path/PathRect.js";
import { PathRing } from "../path/PathRing.js";
import { PathBezier3 } from "../path/PathBezier3.js";
import { PathSegmentedPath } from "../path/PathSegmentedPath.js";
import { PathPolyline } from "../path/PathPolyline.js";
import { PathEllipticalArc } from "../path/PathEllipticalArc.js";

import { SvgBBox } from "../svg/SvgBBox.js";
import { HuatuTransform } from "./HuatuTransform.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuPath implements IHuatuPath, IHuatuDrawingElement, IHuatuDefinable {
  name?: string;
  path?: ISvgPath;
  model?: IGeometryModel;

  refCount: number = 0;
  alwaysInDef: boolean = false;
  magicId: string;

  constructor(path?: ISvgPath,name?: string) {
    this.name = name;
    this.path = path;
    this.magicId = genHex(8);
  }

  setModel(model: IGeometryModel) {
    this.model = model;
  }

  buildId(): string {
    if (!this.name) return "";
    if (!this.path) return "";
    if (this.model && (this.model instanceof Line)) return "";      // Line is not a valid model, please use LineSeg
    return `path-${this.magicId}`;
  }

  buildHtmlForDef(): string {
    if (!this.name) return "";
    if (!this.path) return "";
    if (this.model && (this.model instanceof Line)) return "";
    return this.path.buildPathHtmlOnly(this.buildId());
  }

  buildHtml(buildType: SvgBuildType, style?: IHuatuStyle, transform?: IHuatuTransform): string {
    if (!this.path) return "";
    const attrs: string[] = [];
    if (style) attrs.push(style.buildSvgAttr());
    if (transform) attrs.push(HuatuTransform.buildTransformStrForBlockAndPath(transform));
    if (buildType === "linking" && this.name) {
      return `<use xlink:href="#${this.buildId()}" href="#${this.buildId()}" ${attrs.join(" ")} />`
    }
    return this.path.buildHtml(attrs.join(" "));
  }

  getBBox(): ISvgBBox {
    if (!this.path) return SvgBBox.DUMMY;
    return this.path.bbox;
  }

  moveBy(dx: number, dy: number, name?: string): HuatuPath | undefined {
    if (this.path && this.path instanceof PathSegmentedPath) {
      return new HuatuPath(this.path.moveBy(dx, dy), name);
    }
    if (!this.model) return undefined;
    const newModel = this.model.moveBy(dx, dy);
    if (!newModel) return undefined;
    return HuatuPath.fromModel(newModel, name);
  }

  rotateBy(rotDeg: number, at?: ISvgPoint, name?: string): HuatuPath | undefined {
    if (this.path && this.path instanceof PathSegmentedPath) {
      return new HuatuPath(this.path.rotateBy(rotDeg, at), name);
    }
    if (!this.model) return undefined;
    const newModel = this.model.rotateBy(rotDeg, at);
    if (!newModel) return undefined;
    return HuatuPath.fromModel(newModel, name);
  }

  // Static Methods

  static model2Path(model: IGeometryModel): ISvgPath | undefined{
    if (model instanceof LineSeg) return PathLine.fromLineSeg(model);
    if (model instanceof PolyLine) return PathPolyline.fromPolyLine(model);
    if (model instanceof Triangle) return PathTriangle.fromTriangle(model);
    if (model instanceof Rect) return PathRect.fromRect(model);
    if (model instanceof Circle) return PathCircle.fromCircle(model);
    if (model instanceof Ellipse) return PathEllipse.fromEllipse(model);
    if (model instanceof EllipticalArc) return PathEllipticalArc.fromArc(model);
    if (model instanceof Polygon) return model.isValid ? PathPolygon.fromPolygon(model) : undefined;
    if (model instanceof Bezier2) return PathBezier2.fromBezier2(model);
    if (model instanceof Bezier3) return PathBezier3.fromBezier3(model);
    if (model instanceof Ring) return PathRing.fromRing(model);
    return undefined;
  }

  static fromModel(model: IGeometryModel, name?: string): HuatuPath {
    const path = new HuatuPath(HuatuPath.model2Path(model), name);
    path.setModel(model);
    return path;
  }

}
