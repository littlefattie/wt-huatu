
import type {
  IHuatuStyle,
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuDrawingElement,
  IHuatuTransform,
} from "../huatu/IHuatu.js";

import { HuatuStyle } from "../huatu/HuatuStyle.js";
import { HuatuComponentPlacement } from "../component/HuatuComponentPlacement.js";
import type { ISvgBBox } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { genHex } from "../tools/gen-id.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { WtMath } from "../math/WtMath.js";
import { HuatuWire } from "./HuatuWire.js";
import type { IHuatuWire } from "./IHuatuWire.js";
import { WtHuatu } from "../huatu/Huatu.js";

export class HuatuWireDrawing implements IHuatuFinalDraw {
  wire: HuatuWire;
  huatu: WtHuatu;

  constructor(wire: HuatuWire, huatu: WtHuatu) {
    this.wire = wire;
    this.huatu = huatu;
  }

  getBBox(): ISvgBBox {    
    return this.wire.getBBox();
  }

  // Two functions for Drawing Html building, Direct and Linking way
  buildHtml(buildType: SvgBuildType): string {
    return this.wire.errored
      ? ""
      : this.wire.getDrawings().map(d => d.buildHtml(buildType)).join("\n");
  }

}
