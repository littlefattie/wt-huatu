
import { WtHuatu } from "./Huatu.js";
import type { IHuatuVar } from "./IHuatu.js";

export interface IUserFuncResult {
  paramCount: number;
  varNames: string[];
  funcDef: string;
}

export class HuatuUserFunc {
  static testFunc(def: string): IUserFuncResult | undefined {
    const vNames: string[] = [];
    const funcParts = def.split("=>");
    if (funcParts.length != 2) return undefined;
    let funcDef = funcParts[1];
    let params = funcParts[0].split(/[\s]+|[,()]/).filter(x => !!x);
    if (params.length < 1) return undefined;
    params.forEach(p => {
      if (/^[a-z][a-z0-9_]*$/i.exec(p) && !vNames.includes(p)) {
        vNames.push(p);
      }
    });
    if (vNames.length < 1) return undefined;
    let ht = new WtHuatu();
    vNames.forEach(v => {
      ht.vars.push({
        name: v,
        value: 1,
        howGet: "direct",
      })
    });
    let testVal = ht.resolveVarExpr(funcDef);
    if (testVal !== undefined && !isNaN(testVal)) {
      return {
        paramCount: vNames.length,
        varNames: vNames,
        funcDef: funcDef,
      }
    }
    return undefined;
  }

  static calcFunc(func: IUserFuncResult, params: number[]): number | undefined {
    if (params.length !== func.paramCount) return undefined;
    let ht = new WtHuatu();
    func.varNames.forEach((v, i) => {
      ht.vars.push({
        name: v,
        value: params[i],
        howGet: "direct",
      })
    });
    let res = ht.resolveVarExpr(func.funcDef);
    if (res !== undefined && !isNaN(res)) return res;
    return undefined;
  }
}

