
import type { IPoint } from "../geometry/IGeometry.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgPoint } from "../svg/ISvg.js";

import type {
  IHuatuClipPath,
  IHuatuDrawingGroup,
  IHuatuLabelStyle,
  IHuatuMarker,
  IHuatuPath,
  IHuatuPathSeries,
  IHuatuPattern,
  IHuatuPoint,
  IHuatuPointSeries,
  IHuatuResolvingError,
  IHuatuStyle,
  IHuatuVar
} from "../huatu/IHuatu.js";

import type {
  IHuatuInputVarType,
  IHuatuInputVar,
  IHuatuComponentPlacement,
  IHuatuComponentDef,
  IHuatuComponentInputVars,
  IHuatuComponentPort,
  IHuatuYmlComponentDef
} from "./IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { FORBIDDEN_NAMES, resolveYmlModelOfComponent } from "../huatu/HuatuParser.js";
import { HuatuYml } from "../huatu/HuatuYml.js";
import { WT_REGEX } from "../tools/regex.js";
import { isValidColor } from "../tools/webColor.js";
import { HuatuComponentCache } from "./HuatuComponentCache.js";

export class HuatuComponentDef implements IHuatuComponentDef {
  static REGEX_INPUT_VAR_USE_MATCH = /[$]([a-z][a-z0-9_]*)(?=([^$0-9a-z_]|$))/i;
  name: string;
  desc?: string;
  def: IHuatuYmlObj = {};
  inputVars: IHuatuInputVar[] = [];
  isValid: boolean = false;

  errors: IHuatuResolvingError[] = [];

  constructor(name: string, def?: string | IHuatuYmlObj) {
    this.name = name;
    if (def) {
      if (typeof def === "string") {
        this.defineFromString(def);
      } else {
        this.defineFromObj(def);
      }
    }
  }

  defineFromString(url: string) {
    // Check if used in CLI, i.e. read relative path
    if (globalThis.wthtCli) {
      const ymlFile = globalThis.wthtCli.getFileContent(url);
      if (ymlFile) {
        const parsed = HuatuYml.parseYml(ymlFile);
        if (parsed.succeeded) {
          this.defineFromObj(parsed.rootObj!);
        } else {
          this.errors.push({title: `Component Definition Parsing Failed: ${parsed.errorMessages.map(parsed => parsed.message).join("\n")}`})
        }
        return;
      }
    }
    let ymlCached = HuatuComponentCache.getCachedYml(url);
    if (ymlCached) {
      let ymlObj = HuatuYml.parseYml(ymlCached);
      if (ymlObj.succeeded) {
        this.defineFromObj(ymlObj.rootObj!);
      } else {
        this.errors.push({ title: `Component Definition Parsing Failed: ${ymlObj.errorMessages.map(m => m.message).join("\n")}`})
      }
    } else {
      let error = HuatuComponentCache.getFetchError(url);
      this.errors.push({ title: error || `'${url}' cannot resolve to some component!`});
      return;
    }
  }

  defineFromObj(obj: IHuatuYmlObj) {
    const ivError = this.parseInputVars(obj);
    if (ivError) {
      this.errors.push(ivError);
    }
    // Here, use the cleaned version, because it will be used to replace IVs when placed
    this.def = this.cleanDefObj(obj);
    const ivReplaced = this.replaceInputVars({});
    if (Array.isArray(ivReplaced)) {
      this.errors.push({
        title: `Some Input Vars not defined!`,
        msgs: ivReplaced
      })
    } else {
      // The IV replacing is successful, now test to make it a Huatu
      const comp = resolveYmlModelOfComponent(ivReplaced);
      if (comp.resolvingErrors.length > 0) {
        this.errors.push(...comp.resolvingErrors);
      } else if (!comp.draw) {
        this.errors.push({
          title: `There is no 'draw' under root, you at least need to draw something!`
        })
      } else {
        // Now it is confirmed to a valid design of component
        this.isValid = true;
        // Try parsing Ports to see if any errors
        const portErrors = comp.parseComponentPorts(ivReplaced);
        if (portErrors.length > 0) {
          this.errors.push({
            title: `Port Definitions have some error`,
            msgs: portErrors
          })
        }
      }
    }
  }

  replaceInputVars(vars: IHuatuComponentInputVars): IHuatuYmlObj | string[] {
    const notReplacedIvs: string[] = [];
    const replaceTable = this.inputVars.map(x => [x.name, `${x.value}`]);
    // Update the replacing table by newly given Input Vars
    for (let k in vars) {
      let idx = replaceTable.findIndex(x => x[0] === k);
      if (idx >= 0) replaceTable[idx][1] = `${vars[k]}`;
    }
    const replaceFunc = (originalStr: string): string => {
      let replacedStr = "";
      let toBeReplaced = originalStr;
      while(toBeReplaced) {
        let rp = HuatuComponentDef.REGEX_INPUT_VAR_USE_MATCH.exec(toBeReplaced);
        if (rp) {
          const ivName = rp[1];
          const idx = replaceTable.findIndex(x => x[0] === ivName);
          if (idx >= 0) {   // Found
            const strToReplace = replaceTable[idx][1].toLowerCase() === "[[empty]]" ? "" : replaceTable[idx][1];
            // Make replacement
            replacedStr += toBeReplaced.substring(0, rp.index) + strToReplace;
          } else {          // Not Found
            notReplacedIvs.push(rp[0]);
            // Just copy and not replace
            replacedStr += toBeReplaced.substring(0, rp.index) + rp[0];
          }
          // Move forward
          toBeReplaced = toBeReplaced.substring(rp.index + rp[0].length);
        } else {
          replacedStr += toBeReplaced;
          toBeReplaced = "";
        }
      }
      return replacedStr;
    }

    const objCopied = HuatuYml.copyObj(this.def, undefined, replaceFunc);
    return notReplacedIvs.length > 0
      ? notReplacedIvs.map(x => `Input Var [${x}] cannot be understood!`)
      : objCopied;
  }

  parseInputVars(obj: IHuatuYmlObj): IHuatuResolvingError | undefined {
    const ivs = obj.inputVars;
    if (!ivs || Array.isArray(ivs) || typeof ivs !== "object") return undefined;
    const errors: string[] = [];
    for (let ivName in ivs) {
      const iv = this.inputVars.find(x => x.name === ivName);
      if (iv) {
        errors.push(`Input Var [${ivName}] has already been defined, with value "${iv.value}"`);
      }
      else if (FORBIDDEN_NAMES.includes(ivName.toLowerCase())) {
        errors.push(`Input Var name [${ivName}] cannot be used, please pick another one!`);
      }
      else {
        const ivVal = ivs[ivName];
        if (typeof ivVal !== "string") {
          errors.push(`Input Var Definition can only be a single line (string)!`);
        } else {
          const ivMatch = /^((num|number|text|color)\s*;)?(.*)$/i.exec(ivVal)!;
          ivMatch[2] = ivMatch[2] ? ivMatch[2].toLowerCase() : ivMatch[2];
          const ivType:IHuatuInputVarType = !ivMatch[2] ? "text"
            : (ivMatch[2] === "num" || ivMatch[2] === "number") ? "number"
            : (ivMatch[2] === "color") ? "color"
            : "text";
          const explicitText = ivMatch[2] === "text";
          const valPart = ivMatch[3].trim();
          const tryColor = isValidColor(valPart);
          if (!valPart) {
            errors.push(`Definition for input Var [${ivName}] is empty!`);
          } else if (ivType === "number") {
            if (WT_REGEX.FLOAT_NUMBER.test(valPart)) {
              this.inputVars.push({
                name: ivName,
                type: "number",
                value: parseFloat(valPart),
              })
            } else {
              errors.push(`"${valPart}" cannot resolve to be a NUMBER`);
            }
          } else if (ivType === "color") {
            if (tryColor) {
              this.inputVars.push({
                name: ivName,
                type: "color",
                value: tryColor
              });
            } else {
              errors.push(`"${valPart}" cannot resolve to be some COLOR!`);
            }
          } else {
            if (explicitText) {
              this.inputVars.push({
                name: ivName,
                type: "text",
                value: valPart,
              });
            } else if (WT_REGEX.FLOAT_NUMBER.test(valPart)) {
              this.inputVars.push({
                name: ivName,
                type: "number",
                value: parseFloat(valPart)
              });
            } else if (tryColor) {
              this.inputVars.push({
                name: ivName,
                type: "color",
                value: tryColor
              });
            } else {
              this.inputVars.push({
                name: ivName,
                type: "text",
                value: valPart
              });
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return {
        title: `Input Vars resolving failed`,
        msgs: errors
      }
    }
    return undefined;
  }

  cleanDefObj(obj: IHuatuYmlObj) {
    const acceptedFields = [
      "config",
      "viewBox", "viewArea", "viewBetween",
      "vars",
      "points",  "shapes",  "cpoints",  "xpoints",  "pointSeries",  "shapeSeries",
      "points2", "shapes2", "cpoints2", "xpoints2", "pointSeries2", "shapeSeries2",
      "points3", "shapes3", "cpoints3", "xpoints3", "pointSeries3", "shapeSeries3",
      "points4", "shapes4", "cpoints4", "xpoints4", "pointSeries4", "shapeSeries4",
      "paths", "markers", "patterns",
      "styles", "labelStyles",
      "draw",
      "ports",
    ];
    return HuatuYml.copyObj(obj, acceptedFields);
  }

}
