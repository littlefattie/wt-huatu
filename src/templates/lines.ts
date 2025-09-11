import type { ISvgBBox } from "../svg/ISvg.js";
import type { IPoint } from "../geometry/IGeometry.js";
import Point from "../geometry/Point.js";
import { SvgBBox } from "../svg/SvgBBox.js";

export interface IHuatuDataSeries {
  name?: string;
  data: number[];
}

export interface IHuatuDataXY {
  name?: string;
  data: {
    x: number;
    y: number;
  }[];
}

export interface IHuatuTemplate {
  name: string;

  buildHuatuYml(): string;
}

export interface IHuatuTemplateLines {
  chartWidth: number;
  chartHeight: number;
  title?: string;
  data: (IHuatuDataSeries | IHuatuDataXY)[];
}

export class HuatuTemplateLines implements IHuatuTemplate, IHuatuTemplateLines {
  name: string = "lines";
  chartHeight: number = 600;
  chartWidth: number = 1000;
  data: (IHuatuDataSeries | IHuatuDataXY)[] = [];

  constructor() {

  }

  buildHuatuYml(): string {
    return "";
  }
}

export interface IAxisRange {
  min: number,
  max: number,
}

export const data2Points = (data: {x: number, y: number}[], vbChart: ISvgBBox, xRange?: IAxisRange, yRange?: IAxisRange): IPoint[] => {
  const xs = data.map(x => x.x);
  const ys = data.map(x => x.y);
  const xr = xRange ?? {min: Math.min(...xs), max: Math.max(...xs)};
  const yr = yRange ?? {min: Math.min(...ys), max: Math.max(...ys)};
  return data.map((d, i) => {
    let dx = d.x >= xr.max ? xr.max : d.x <= xr.min ? xr.min : d.x,
        dy = d.y >= yr.max ? yr.max : d.y <= yr.min ? yr.min : d.y,
        x = vbChart.x + vbChart.w * (dx - xr.min) / (xr.max - xr.min),
        y = vbChart.y + vbChart.h - vbChart.h  * (dy - yr.min) / (yr.max - yr.min);
    return new Point(x, y);
  });
}

const dat = [...Array(30).keys()].map(i => {
  const theta = i * Math.PI / 12;
  const r = 6 * theta;
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  }
})

const points = data2Points(dat, new SvgBBox(0, -800, 1000, 800), undefined, undefined)
  .map(p => `${p.x.toFixed(6)},${p.y.toFixed(6)}`)
  .join(";");
console.log(points);