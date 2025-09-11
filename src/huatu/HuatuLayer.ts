
import type {
  IHuatuStyle,
  IHuatuFinalDraw,
} from "./IHuatu.js";

import { HuatuDrawingGroup } from "./HuatuDrawingGroup.js";
import { HuatuStyle } from "./HuatuStyle.js";

export class HuatuLayer extends HuatuDrawingGroup {

  constructor(name: string, desc?: string) {
    super(name, desc);
    // Layer will not accept transforms
    this.acceptTransform = false;
    // Layer is not definable, so linkable is false
    this.linkable = false;
  }

}
