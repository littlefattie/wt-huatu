

import type {
  IHuatuStyle,
  IHuatuFinalDraw,
  IHuatuPattern,
  IHuatuDefinable,
  IPatternParams,
} from "./IHuatu.js";

import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { HuatuStyle } from "./HuatuStyle.js";
import type { ISvgPattern } from "../svg/ISvg.js";
import { 
  SvgPattern,
  buildDotPattern, 
  buildGridPattern, 
  buildLinePattern, 
  buildSquarePattern
} from "../svg/SvgPattern.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuPattern implements IHuatuPattern, IHuatuDefinable {
  static TYPES: { [key: string]: string[] } = {
    lines:  ["lines", "line"],
    dots:   ["dots", "dot", "circle", "circ"],
    square: ["square", "sqr", "sq"],
    grid:   ["grids", "grid"],
  }

  name: string;
  pattern: ISvgPattern;
  params?: IPatternParams;

  refCount: number = 0;
  alwaysInDef: boolean = true;
  magicId: string;

  constructor(name: string, pattern: ISvgPattern) {
    this.name = name;
    this.pattern = pattern;
    this.magicId = genHex(8);
  }

  buildHtmlForDef(): string {
    return this.pattern.buildHtml(this.buildId());
  }

  buildId(): string {
    return `ptn-${this.magicId}`;
  }

  static getAllPatternTypes(): string[] {
    const res: string[] = [];
    for (const key in HuatuPattern.TYPES) {
      res.push(...HuatuPattern.TYPES[key]);
    }
    return res;
  }

  static buildPatternFromParams(params: IPatternParams): SvgPattern | string {
    if (!params.type) return `Pattern Type not specified!`;
    const type = params.type.toLowerCase();
    if (HuatuPattern.TYPES.lines.includes(type)) {
      return buildLinePattern(
        "linePattern", 
        params.lineDensity ?? 10, 
        params.rotDeg ?? -45, 
        params.lineWeight ?? 20,
        params.lineStyle ?? "solid",
        params.dashDensity ?? 60,
        params.color ?? "grey",
        params.bgColor,
        params.bgOpacity,
        params.opacity
        );
    } 
    else if (HuatuPattern.TYPES.square.includes(type)) {
      return buildSquarePattern(
        "squarePattern",
        params.lineDensity ?? 30,
        params.size ?? 10,
        params.color ?? "grey",
        params.opacity,
        params.bgColor,
        params.bgOpacity
      );
    } 
    else if (HuatuPattern.TYPES.dots.includes(type)) {
      return buildDotPattern(
        "dotsPattern",
        params.lineDensity ?? 40,
        params.size ?? 10,
        params.color ?? "grey",
        params.opacity,
        params.bgColor,
        params.bgOpacity
      );
    } 
    else if (HuatuPattern.TYPES.grid.includes(type)) {
      return buildGridPattern(
        "GridPattern",
        params.size ?? 40,
        params.lineWeight ?? 10,
        params.color ?? "grey",
        params.bgColor,
        params.bgOpacity,
        params.opacity,
        params.sparseK
      );
    } 
    else {
      return `Pattern type '${type}' has not been defined!`;
    }
  }
}
