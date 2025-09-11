
import type { IHuatuPoint, IHuatuPointSeries } from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgPoint } from "../svg/ISvg.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import { isValidColor } from "../tools/webColor.js";
import { HuatuStyle } from "./HuatuStyle.js";

export class HuatuPointSeries implements IHuatuPointSeries {
  name: string;
  points: ISvgPoint[] = [];

  constructor(name: string, ...points: ISvgPoint[]) {
    this.name = name;
    if (points.length > 0) {
      this.points.push(...points);
    }
  }

  getPoint(idx: number): ISvgPoint | undefined {
    return (idx >= this.points.length || idx < 0)
      ? undefined
      : this.points[idx];
  }

  count(): number {
    return this.points.length;
  }

  static optsPointSeriesDrawing: IKeyValueOptions = {
    keys: [
      ["size", "radius"],
      // Style keys
      ["fill"],
      ["fillColor"],
      ["fillOpacity"],
      ["stroke"],
      ["strokeOpacity"],
      ["strokeColor"],
      ["strokeWidth"],
      ["dashArray", "array", "dash", "strokeDashArray"],
    ],
    allowAppend: ["fill", "stroke"],
    booleans: [],
    ints: [],
    numbers: [
      "fillOpacity",
      "strokeWidth",
      "strokeOpacity",
    ],
    qualifiers: {
      "dashArray": "number[]",
      "array": "number[]",
      "dash": "number[]",
      "strokeDashArray": "number[]",
      "fillColor": isValidColor,
      "strokeColor": isValidColor,
    },
    blindGuess: {
      "size": x => x,
      "fillColor": isValidColor,
      "fillOpacity": (op: string) => {
        let x = parseFloat(op);
        return Number.isNaN(x) ? undefined : x;
      },
      "strokeColor": isValidColor,
      "strokeWidth": (op: string) => {
        let x = parseFloat(op);
        return Number.isNaN(x) ? undefined : x;
      },
    },
    subKeys: {
      "fill": HuatuStyle.optsFill,
      "stroke": HuatuStyle.optsStroke,
    }
  }
}

export interface IHuatuPointSeriesDrawParams {
  size?: string;
  fill?: string;
  fillColor?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  dashArray?: number[];
}
