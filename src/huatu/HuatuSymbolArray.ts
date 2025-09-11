

import type { IPoint } from "../geometry/IGeometry.js";
import type {
  IHuatuPath,
  IHuatuPathSeries,
  IHuatuSymbol,
  IHuatuSymbolArray,
  IHuatuDrawing,
  IHuatuStyle,
  IHuatuPoint,
  IHuatuTransform,
  IHuatuDrawingElement,
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";
import { HuatuPoint } from "./HuatuPoint.js";
import { HuatuDrawing } from "./HuatuDrawing.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import Vector from "../geometry/Vector.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { HuatuStyle } from "./HuatuStyle.js";
import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { HuatuSymbol } from "./HuatuSymbol.js";
import { type IKeyValueOptions } from "../tools/utils.js";

export interface IHuatuSymbolArrayParams {
  symbol?: string;
  startPoint?: string;
  desc?: string;
  method?: string;
  deltaX?: string;
  deltaY?: string;
  count?: number;
  countX?: number;
  countY?: number;
  center?: string;
  rotDeg?: string;
  alignCenter?: boolean;
  radius?: string;
  scale?: string;
  notRotate?: boolean;
  startDeg?: string;
  deltaDeg?: string;
}

export class HuatuSymbolArray extends HuatuDrawingGroup implements IHuatuSymbolArray {
  static METHODS = ["line", "2d", "polar"];

  symbol: HuatuSymbol;
  arrayMethod: "polar" | "line" | "2d" = "line";

  startPoint?: ISvgPoint;   // Start point will not be used by Polar arraying method
  deltaX: number = 0;
  deltaY: number = 0;

  /**
   * This count will be shared when Array specified as Polar or Line type
   * If specified as 2D, then countX and countY will work.
   */
  count: number = 1;
  countX: number = 1;
  countY: number = 1;

  center?: ISvgPoint;
  startDeg?: number;
  deltaDeg?: number;

  alignCenter?: boolean;

  transforms: IHuatuTransform[] = [];

  constructor(
    name: string,
    symbol: HuatuSymbol,
    desc?: string,
  ) {
    super(name, desc)
    // Symbol array will not accept any transforming
    this.acceptTransform = false;
    this.symbol = symbol;
  }

  /**
   * Resolve the Linear generation of the Symbol Array
   * @param count The Count to place the symbol
   * @param dx Interval in X-axis
   * @param dy Interval in Y-axis
   * @param scale Scale factor of the Symbol, could be a number, or a func like Si = f(i) where i is the growing index
   */
  configLine(
    startPoint: ISvgPoint,
    count: number,
    dx?: number,
    dy?: number,
    scale?: number | ((n: number) => number),
    rotDeg?: number
  ) {
    this.startPoint = startPoint;
    // Clear element buffer at first
    this.elements = [];
    this.arrayMethod = "line";
    count = Math.floor(count);
    this.count = count >= 1 ? count : 1;
    this.deltaX = dx ?? 0;
    this.deltaY = dy ?? 0;
    if (scale && typeof scale === "number") {
      scale = scale > 0 ? scale : undefined;      // non-positive scale will be discarded
    }
    for (let i = 0; i < this.count; i++) {
      const transform: IHuatuTransform = {
        x: this.startPoint.x + i * this.deltaX,
        y: this.startPoint.y + i * this.deltaY
      };
      if (scale) {
        if (typeof scale === "function") {
          try {
            let newScale = scale(i);
            if (newScale && newScale > 0) transform.scale = newScale;
          } catch (error) {
            // Nothing to do
          }
        } else {
          transform.scale = scale;
        }
      }
      if (rotDeg) transform.rotDeg = rotDeg;
      this.transforms.push(transform);
      this.addElement(new HuatuDrawing(this.symbol, undefined, transform, this.alignCenter));
    }
  }

  /**
   * Resolve the 2D generation of the Symbol Array
   * @param countX The count in X-axis
   * @param countY The Count in Y-axis
   * @param dx Interval in X-axis
   * @param dy Interval in Y-axis
   * @param scale Scale factor of the symbol, it could be a number or a func like Sxy = f(ix, iy), where ix and iy
   *              is the growing index in X- and Y-axis
   */
  config2D(
    startPoint: ISvgPoint,
    countX: number,
    countY: number,
    dx?: number,
    dy?: number,
    scale?: number | ((nx: number, ny: number) => number),
    rotDeg?: number
  ) {
    this.startPoint = startPoint;
    // Clear element buffer at first
    this.elements = [];
    this.arrayMethod = "2d";
    countX = Math.floor(countX);
    countY = Math.floor(countY);
    this.countX = countX >= 1 ? countX : 1;
    this.countY = countY >= 1 ? countY : 1;
    this.deltaX = dx ?? 0;
    this.deltaY = dy ?? 0;
    this.count = this.countX *  this.countY;
    if (scale && typeof scale === "number") {
      scale = scale > 0 ? scale : undefined;     // non-positive scale will be discarded
    }
    for (let iX = 0; iX < this.countX; iX++) {
      for (let iY = 0; iY < this.countY; iY++) {
        const transform: IHuatuTransform = {
          x: this.startPoint.x + iX * this.deltaX,
          y: this.startPoint.y + iY * this.deltaY,
        };
        if (scale) {
          if (typeof scale === "function") {
            try {
              let newScale = scale(iX, iY);
              if (newScale && newScale > 0) transform.scale = newScale;
            } catch (error) {
              // Nothing to do
            }
          } else {
            transform.scale = scale;
          }
        }
        if (rotDeg) transform.rotDeg = rotDeg;
        this.transforms.push(transform);
        this.addElement(new HuatuDrawing(this.symbol, undefined, transform, this.alignCenter));
      }
    }
  }

  /**
   * Resolve the polar method of arraying
   * @param count How many symbols should be arrayed
   * @param center The center to make the Array, i.e. the center of rotating
   * @param radius How far should be the symbol located from the center, it could be a function of rotating of Angle,
   *               e.g. R = f(theta), here, the unit of theta is Radian(not degree), to make it convenient to import
   *               existing math curves which does this way
   * @param scale How large will the symbol be scaled to, it could be a function of radius
   * @param startDeg The start rotating angle, in degree
   * @param deltaDeg The Interval of the rotating angle
   * @param symbolNotRotate A switch to make sure if the symbol should stay not rotated
   */
  configPolar(
    count: number,
    center: ISvgPoint,
    radius: number | ((theta: number) => number),
    scale?: number | ((radius: number) => number),      // The Scale parameter, if could be the function of Radius
    startDeg?: number,
    deltaDeg?: number,
    symbolNotRotate?: boolean
  ) {
    // Clear element buffer at first
    this.elements = [];
    count = Math.floor(count);
    this.count = count >= 1 ? count : 1;
    this.center = center;

    this.startDeg = startDeg ?? 0;
    this.deltaDeg = deltaDeg ?? 30;
    let constantRadius: number | undefined;
    if (typeof radius === "number") {
      constantRadius = Math.abs(radius);
    }
    if (scale && typeof scale === "number") {
      scale = scale > 0 ? scale : undefined;         // non-positive scale will be discarded
    }
    for (let i = 0; i < this.count; i++) {
      const deg = this.startDeg + i * this.deltaDeg;
      const ang = AngDeg.deg2Ang(deg);                // Here is the conversion, please notice
      // Default radius will be zero, i.e. if no radius specified, all the symbols will be placed at 'Center'
      let r = 0;
      if (constantRadius) r = constantRadius;
      else if (typeof radius === "function") {
        try {
          r = radius(ang);                            // Use the angle in Radian
        } catch (error) {
          // Nothing to do
        }
      }
      const loc = Vector.fromPoint(this.center).moveByLenAndAng(r, ang);
      const transform: IHuatuTransform = {
        x: loc.x,
        y: loc.y
      }
      if (!symbolNotRotate) {
        transform.rotDeg = deg;
      }
      if (scale) {
        if (typeof scale === "function") {
          try {
            let newScale = scale(r);                  // Scale is a func of Radius, please note
            if (newScale && newScale > 0) transform.scale = newScale;
          } catch (error) {
            // Nothing to do
          }
        } else {
          transform.scale = scale;
        }
      }
      this.transforms.push(transform);
      this.addElement(new HuatuDrawing(this.symbol, undefined, transform, this.alignCenter));
    }
  }

  static optsSymbolArray: IKeyValueOptions = {
    keys: [
      ["symbol", "sym"],
      ["startPoint", "start", "from"],
      ["desc"],
      ["method", "arrayMethod"],
      ["deltaX", "dx"],
      ["deltaY", "dy"],
      ["count"],
      ["countX"],
      ["countY"],
      ["center", "centerPoint", "at"],
      ["rotDeg", "rot", "rotate"],
      ["alignCenter"],
      ["radius", "r"],
      ["scale"],
      ["notRotate", "noRotate", "noRot"],
      ["startDeg", "initialDeg", "iniDeg"],
      ["deltaDeg", "degDelta", "degD", "dDeg"],
    ],
    ints: [
      "count",
      "countX",
      "countY",
    ],
    numbers: [],
    booleans: [
      "alignCenter",
      "notRotate", "noRotate", "noRot"
    ],
    allowAppend: [],
    qualifiers: {
      "method": HuatuSymbolArray.METHODS,
    },
    blindGuess: {
      "method": HuatuSymbolArray.METHODS,
    }
  }

}
