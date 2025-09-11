
import type {
  IHuatuPoint,
  IHuatuSymbol,
  IHuatuDrawing,
  IHuatuLabel,
  IHuatuTransform,
  IHuatuStyle,
  IHuatuDefinable,
  IHuatuDrawingGroup,
  IHuatuFinalDraw,
} from "./IHuatu.js";

import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { genHex } from "../tools/gen-id.js";

export class HuatuBlock extends HuatuDrawingGroup  implements IHuatuDefinable {
  alwaysInDef: boolean = false;
  refCount: number = 0;
  magicId: string;

  constructor(name: string, desc?: string) {
    super(name, desc);
    // For blocks, it accepts transform, and it is definable, thus linkable
    this.acceptTransform =true;
    this.linkable = true;
    this.magicId = genHex(8);
  }

  buildId(): string {
    return `blk-${this.magicId}`;
  }
  
  buildHtmlForDef(): string {
    return `<g id="${this.buildId()}">\n`
      + (this.desc? `<desc>${this.desc}</desc>\n` : ``)
      + this.elements.map(e => e.buildHtml(globalThis.buildType)).join("\n")
      + `\n</g>`;
  }

  getLinkId(): string {
    return this.buildId();
  }

}
