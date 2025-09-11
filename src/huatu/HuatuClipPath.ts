

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
    if (this.clipRule === "evenodd") attrs.push(`clip-rule="${this.clipRule}"`);
    return `<clipPath ${attrs.join(" ")} >\n`
      + this.paths.map(p => p.buildPathHtmlOnly()).join("\n")
      + `\n</clipPath>`;
  }

  buildId(): string {
    return `clip-${this.magicId}`;
  }

}
