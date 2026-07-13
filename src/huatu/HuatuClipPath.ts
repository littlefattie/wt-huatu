

import type {
  IHuatuDefinable,
  IHuatuClipPath,
} from "./IHuatu.js";

import type { ISvgPath } from "../svg/ISvg.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuClipPath implements IHuatuClipPath, IHuatuDefinable {

  name: string;
  paths: ISvgPath[] = [];
  magicId: string;
  refCount: number = 0;
  alwaysInDef: boolean = true;
  clipRule?: "evenodd" | "nonzero";

  constructor(name: string, paths?: ISvgPath[]) {
    this.name = name;
    if (paths) {
      this.paths = paths;
    }
    this.magicId = genHex(8);
  }

  buildHtmlForDef(): string {
    const attrs: string[] = [
      `id="${this.buildId()}"`
    ];
    let pathSvgs = this.paths.map(p => p.buildPathHtmlOnly())
      .map(s => this.clipRule === "evenodd" && s.startsWith("<path") ? s.replace(/^<path/, `<path clip-rule="evenodd"`) : s)
      .join("\n");
    return `<clipPath ${attrs.join(" ")} >\n`
      + pathSvgs
      + `\n</clipPath>`;
  }

  buildId(): string {
    return `clip-${this.magicId}`;
  }

}
