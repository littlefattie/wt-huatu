
import type { IHuatuVar } from "./IHuatu.js";

export class HuatuVar implements IHuatuVar {
  name: string;
  value: number;
  howGet: "direct" | "derived";

  constructor(name: string, value: number, howGet?: "direct" | "derived") {
    this.howGet = howGet ?? "direct";
    this.name = name;
    this.value = value;
  }

  /**
   * Return the value of the variable, return 0 if not set.
   * @returns the value of this variable
   */
  getValue(): number {
    return this.value ?? 0;
  }
  
}

