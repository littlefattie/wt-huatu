
import type { IPoint } from "../geometry/IGeometry.js";
import type { IHuatuPoint } from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgPoint } from "../svg/ISvg.js";

export class HuatuPoint implements IHuatuPoint {
  name: string;
  howGet: "direct" | "derived" | "calculated" | "intersection";
  x: number;
  y: number;

  constructor(x: number, y: number, name: string, howGet?: "direct" | "derived" | "calculated" | "intersection") {
    this.x = x;
    this.y = y;
    this.name = name;
    this.howGet = howGet ?? "direct";
  }

  toPoint(): IPoint {
    return new Point(this.x, this.y);
  }

  toSvgPoint(): ISvgPoint {
    return new SvgPoint(this.x, this.y);
  }
}
