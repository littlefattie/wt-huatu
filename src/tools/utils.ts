import type { IHuatuYmlObj, IHuatuYmlValueType } from "../huatu/IHuatuYml.js";
import { WT_REGEX } from "./regex.js";

export const replaceMathPiAndFuncs = (expr: string): string => {
  // Replace PI and Math functions, like, sin, cos, exp, pi, etc.
  const rePi = /\b(pi)\b/gi;
  const reMathFunc = /\b(sin|cos|tan|atan|asin|acos|dsin|dcos|dtan|datan|dasin|dacos|exp|log|log10|sqrt)\s*(\()/gi;
  const replacerMathFunc = (match: string, g1: string, g2: string) => {
    return `globalThis.wtVarFuncs.${g1.toLowerCase()}${g2}`;
  };
  return expr
    .replace(rePi, "Math.PI")
    .replace(reMathFunc, replacerMathFunc);
}

export const evalExpr2Number = (expr: string): number | undefined => {
  try {
    const num = eval(expr);
    return typeof num === "number" ? num : undefined;
  } catch (error) {
    return undefined;
  }
}

export const assignOnlyDefined =  <T extends {}>(target: T, ...sources: T[]): T => {
  sources.forEach(src => {
    for (const key in src) {
      if (src[key] !== undefined) target[key] = src[key];
    }
  });
  return target;
}

export function resolvePointLike(expr: string): {
  x: string,
  y: string
} | null {
  let exprCleaned = expr.trim().split(";").filter(x => !!x);
  if (exprCleaned.length > 0) {
    expr = exprCleaned[0];
  } else {
    return null;
  }
  const match = WT_REGEX.POINT_LIKE.exec(expr.trim());
  if (match) {
    return {
      x: match[1],
      y: match[2]
    };
  }
  const parts = expr.split(",")
    .map(x => x.trim())
    .filter(x => !!x);
  if (parts.length > 1) {
    return {
      x: parts[0],
      y: parts[1]
    }
  }
  return null;
}

export function booleanCheck(expr?: string): boolean | undefined {
  if (!expr) return undefined;
  const yesNo = expr.toLowerCase();
  return yesNo === "yes" || yesNo === "true";
}

export const ensurePositiveInt = (expr: string): number | undefined => {
  const match = /^[0-9]+$/.exec(expr.trim());
  if (!match) return undefined;
  const res = parseInt(expr);
  return res > 0 ? res : undefined;
}

export const fitNumInRange = (val: number, min: number, max: number) => {
  return val < min ? min : val > max ? max : val;
}

/**
 * A simple function to get the HTML/SVG lines indented
 * @param lines The input lines
 * @param indentSize Indent Size, default is 2 if not given
 * @returns dented lines
 */
export const indentHtmlLines = (html: string | string[], indentSize?: number): string[] => {
  const indSize = Math.floor(Math.abs(indentSize ?? 2));
  const linesUsed = (typeof html === "string") ? html.split("\n") : html;
  const xmlLines = linesUsed.map(x => x.replace(/\s+/g, " ").trim()).filter(x => !!x);
  if (indSize === 0) return xmlLines;     // No indent
  let curIndent = "";
  let indentLevel = 0;
  const newLines: string[] = [];
  const ilStatus: ("open" | "close")[] = [...Array(200).keys()].map(x => "close");    // 200 is probably enough, default to "close"
  const indentIncrement = [...Array(indSize).keys()].map(x => " ").join("");

  const outdent = () => {
    ilStatus[indentLevel] = "close";
    if (indentLevel > 0) indentLevel--;
    curIndent = curIndent.substring(indSize);
  }

  const indent = () => {
    if (ilStatus[indentLevel] === "open")      {
      indentLevel++;
    }
    ilStatus[indentLevel] = "open";
    curIndent += indentIncrement;
  }

  for (let i = 0; i < xmlLines.length; i++) {
    const line = xmlLines[i];
    let newLine;

    if (line.match(/^<\w+/)) {       // Stat like <div ...
      newLine = curIndent + line;
      indent();
      // Check if ends with </div>, or  />, outdent (for following lines) if true
      if (line.match(/\/>$/) || line.match(/\/\w+>$/)) {
        outdent();
      }
    } else if (line.match(/^[.]?(.*)\{$/i)) {      // This for css, it starts with like `body {` or `.style {`
      newLine = curIndent + line;
      indent();
    } else if (line.match(/^<\/\w+>/) || line.match(/^\}$/)) {      // If it starts with ending tags, or just css ending curly
      outdent();
      newLine = curIndent + line;
    } else {
      newLine = curIndent + line;
    }
    newLines.push(newLine);
  }
  // Return the dented lines
  return newLines;
}

export interface IKeyValueOptions {
  // Each item in the array form will hold the main key (the very first) and its aliases
  keys: string[][],
  // Some qualifiers to validate the value, if not qualified, then it will be returned to re-processed
  qualifiers: {
    [key: string]:
      | "int[]"
      | "number[]"
      | string[]
      | ((input: string) => string | undefined);
  },
  // The keys held in this array will accept the following "orphan" param to be concatenated to the previous key's value
  allowAppend: string[];
  // The char to add before the appended orphan string
  splitCharWhenAppending?: string;
  booleans: string[],
  ints: string[],
  numbers: string[],
  blindGuess: {
    [key: string]: string[] | ((input: string) => string | number | boolean | undefined);
  };
  subKeys?: {
    [subKey: string]: IKeyValueOptions;
  }
}

export interface IResolvedKeyValueObject {
  [key: string]: string | number | string[] | number[] | boolean | undefined;
}

export interface IKeyValueParsingResult<T> {
  body: T;
  orphans: string[];
  unluckyOrphans: string[];       // This will hold the orphans that was tried to set to some key, but the key's value is already set previously!
  failedPairs: {key: string; value: string}[];
  subKeys?: {
    [subKey: string]: IKeyValueParsingResult<any>;
  }
}

export const parseStrIntoKeyValuePair = <T>(
  def: IHuatuYmlValueType,
  opts: IKeyValueOptions,
  sepChar?: string | RegExp
): IKeyValueParsingResult<T> => {
  const res: IResolvedKeyValueObject = {};
  const orphans: string[] = [];
  const unluckyOrphans: string[] = [];
  const failedPairs: {key: string; value: string}[] = [];
  let subKeys: {
    [subKey: string]: IKeyValueParsingResult<any>;
  } | undefined;

  const keys = opts.keys.flat().filter(x => !!x);
  const lcKeys = keys.map(x => x.toLowerCase());
  const kQual = Object.keys(opts.qualifiers);
  const lcKQual = kQual.map(x => x.toLowerCase());
  const lcBooleans = opts.booleans.filter(x => !!x).map(x => x.toLowerCase());
  const lcInts = opts.ints.filter(x => !!x).map(x => x.toLowerCase());
  const lcNumbers = opts.numbers.filter(x => !!x).map(x => x.toLowerCase());
  const lcAllowAppend = opts.allowAppend.filter(x => !!x).map(x => x.toLowerCase());

  const isKeyBoolean = (key: string): boolean => lcBooleans.includes(key.toLowerCase());
  const isKeyInt = (key: string): boolean => lcInts.includes(key.toLowerCase());
  const isKeyNumber = (key: string): boolean => lcNumbers.includes(key.toLowerCase());
  const isAppendAllowed = (key: string) => lcAllowAppend.includes(key.toLowerCase());
  const getKKey = (key: string): string => keys[lcKeys.indexOf(key.toLowerCase())];
  const getQKey = (key: string): string => kQual[lcKQual.indexOf(key.toLowerCase())];
  const isBooleanStr = (val: string) => ["yes", "no", "true", "false"].includes(val.toLowerCase());

  // Get the value of some key by returning the most-in-front key's value in the key group
  const getValOfGroup = (key: string) => {
    const keyGroup = opts.keys.find(x => x.includes(key))
    if (!keyGroup || keyGroup.length < 1) return undefined;
    for (let k of keyGroup) {
      if (res[k] !== undefined) return res[k];
    }
    return undefined;
  }

  const intArrays: string[] = [];
  const numberArrays: string[] = [];
  // A function to assign the value to result, qualify them if they have qualifier defined
  // If successfully assigned, then return nothing, otherwise, return the original value
  const assignValue = (key: string, value: string): string | null => {
    const kk = getKKey(key);
    // If key not found then return the inputs to indicate that it cannot be assigned,
    // This is for the Object input. For the string input, the key will always been found
    if (!kk) return `${key}, ${value}`;
    const kq = getQKey(key);
    const qualifier = opts.qualifiers[kq];
    if (isKeyBoolean(key)) {
      if (isBooleanStr(value)) res[kk] = booleanCheck(value);
      else {
        res[kk] = true;       // Set the boolean var to true before returning the value to be reprocessed
        return value;
      }
    }
    else if (isKeyInt(key)) {
      const num = parseInt(value);
      if (!Number.isNaN(num)) {
        res[kk] = num;
      }
    }
    else if (isKeyNumber(key)) {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) res[kk] = num;
      else return value;
    }
    else if (!qualifier) {         // If no qualifier defined, just assign the value to key, this is bypass
      res[kk] = value;
    }
    else if (qualifier === "int[]") {
      if (!isAppendAllowed(key)) {
        const nums = value.split(/[,\s]/).map(x => parseInt(x)).filter(x => !Number.isNaN(x));
        if (nums.length > 0) res[kk] = nums;
        else return value;
      } else {
        if (!res[kk]) {
          res[kk] = value;
          intArrays.push(kk);
        } else {
          res[kk] += `,${value}`;
        }
      }
    }
    else if (qualifier === "number[]") {
      if (!isAppendAllowed(key)) {
        const nums = value.split(/[,\s]/).map(x => parseFloat(x)).filter(x => !Number.isNaN(x));
        if (nums.length > 0) res[kk] = nums;
        else return value;
      } else {
        // Append it for later handle
        if (!res[kk]) {
          res[kk] = value;
          numberArrays.push(kk);
        }
        else res[kk] += `,${value}`;
      }
    }
    else if (Array.isArray(qualifier)) {      // string[]
      if (qualifier.includes(value)) res[kk] = value;
      else return value;
    }
    else if (typeof qualifier === "function") {
      const qRes = qualifier(value);
      if (qRes) res[kk] = qRes;
      else return value;
    }
    // When the value is successfully assigned, return null
    return null;
  }

  if (typeof def === "string") {
    const keysAll = lcKeys.join("|");
    // Split the input with ";"
    const paramsOriginal = def.split(sepChar ? sepChar : ";").map(x => x.trim()).filter(x => !!x);
    // For individual params, to see if there is some key word is presented in it
    const params: string[] = [];
    const reSplitByKeywords = new RegExp(`(.*[^,\\s])?(\\s*[,\\s]\\s*)(${keysAll})(\\s*[,\\s]\\s*(.*))?$`, "i");
    paramsOriginal.forEach(p => {
      let seg = p;
      let match = reSplitByKeywords.exec(seg);
      if (!match) params.push(seg);
      else {
        while(match) {
          if (match[1]) params.push(match[1]);
          params.push(match[3]);
          seg = match[5];
          match = reSplitByKeywords.exec(seg);
          if (!match && seg) params.push(seg);
        }
      }
    })

    const NO_KEY = "noKey";
    let i = 0;
    let key = NO_KEY;
    let reProcess: string | null = null;
    let lastKey = NO_KEY;
    while(i < params.length || reProcess) {
      const param = reProcess ? reProcess : params[i++];
      reProcess = null;   // Reset the reProcess param
      const reKeyAndValue = new RegExp(`^(${keysAll})(\\s*[,\\s]\\s*(.*))?$`, 'i');
      const match = reKeyAndValue.exec(param);
      if (match) {
        key = match[1];
        lastKey = key;      // Backup this key for appending use
        if (match[3]) {
          reProcess = assignValue(key, match[3].trim());
          key = NO_KEY;
        } else {
          if (isKeyBoolean(key)) res[getKKey(key)] = true;
        }
      } else {
        if (key !== NO_KEY) {
          reProcess = assignValue(key, param);
          key = NO_KEY;
        } else {
          let paramAssigned = false;
          if (isKeyBoolean(param)) {
            res[getKKey(param)] = true;
            paramAssigned = true;
          }
          else {
            // Try blind guessing which is defined in defaults
            for (const k in opts.blindGuess) {
              const method = opts.blindGuess[k];
              const kk = getKKey(k);
              if (!kk || getValOfGroup(kk) !== undefined) {
                continue;
              }
              let valToAssign: string | number | undefined = undefined;
              // TODO: consider to make the includes true without case concern
              if (Array.isArray(method) && method.includes(param)) {
                valToAssign = param;
              }
              else if (typeof method === "function") {
                const mRes = method(param);
                valToAssign = typeof mRes === "string"
                  ? (mRes ? mRes : undefined)
                  : (typeof mRes === "number" && !Number.isNaN(mRes))
                  ? mRes
                  : (mRes ? param : undefined);
              }
              if (valToAssign !== undefined) {
                if (res[kk] === undefined) {
                  res[kk] = valToAssign;
                  paramAssigned = true;
                } 
                else if (!isAppendAllowed(lastKey)) {   // If it is allowed to append, then keep it to append later
                  unluckyOrphans.push(param);
                  paramAssigned = true;
                }
                break;
              }
            }
          }
          // If no way to assign, then drop it into orphans
          if (!paramAssigned) {
            if (isAppendAllowed(lastKey)){               // Last key is allowed to append string
              const kk = getKKey(lastKey);
              if (typeof res[kk] === "string") {         // The value of last key has been assigned and it is "string" type
                res[kk] += `${opts.splitCharWhenAppending ? opts.splitCharWhenAppending : ","} ${param}`;     // Append
              }
            } else {
              orphans.push(param);
            }
          }
        }
      }
    }
    // Now handle Sub-Keys
    if (opts.subKeys) {
      for (const sk in opts.subKeys) {
        if (opts.subKeys[sk] && res[sk] && (typeof res[sk] === "string")) {
          const subParse = parseStrIntoKeyValuePair(res[sk] as string, opts.subKeys[sk], /[;,\s]/);
          if (subKeys) subKeys[sk] = subParse;
          else subKeys = { [sk]: subParse };
        }
      }
    }
  } else if (!Array.isArray(def) && def) {
    for (const key in def) {
      let val = def[key];
      if (val && !Array.isArray(val)) {     // skip undefined key-values and Arrays
        if (opts.subKeys && opts.subKeys[key]) {
          const subParse = parseStrIntoKeyValuePair(val, opts.subKeys[key], /[;,\s]/);
          if (subKeys) subKeys[key] = subParse;
          else subKeys = { [key]: subParse };
        } else {
          if (typeof val === "string") {
            const assignResult = assignValue(key, val.replace(/;/g, ""));   // Remove all the possible semi-colon (;)
            // If failed to assign, then push it and return to the caller
            if (assignResult) {
              failedPairs.push({key: key, value: val});
            }
          } else {
            const kVal = getKKey(key)
              ? `'${key}' should not have sub keys!`
              : `'${key}' not defined!`;
            failedPairs.push({key: key, value: kVal});
          }
        }
      }
    }
  }
  // Handle Arrays
  intArrays.forEach(k => {
    const ints = (res[k] as string).split(/[,;\s]/)
      .map(s => s.trim())
      .filter(s => !!s)
      .map(s => parseInt(s))
      .filter(s => !Number.isNaN(s));
      res[k] = ints.length > 0 ? ints : undefined;
  });
  numberArrays.forEach(k => {
    const numbers = (res[k] as string).split(/[,;\s]/)
      .map(s => s.trim())
      .filter(s => !!s)
      .map(s => parseFloat(s))
      .filter(s => !Number.isNaN(s));
      res[k] = numbers.length > 0 ? numbers : undefined;
  });

  // Deduplicate and output
  return {
    body: dedupObj(res, opts.keys) as T,
    orphans,
    unluckyOrphans,
    failedPairs,
    subKeys
  };

}

export const dedupObj = (obj: IResolvedKeyValueObject, keys: string[][]) => {
  const res: IResolvedKeyValueObject = { };
  keys.forEach(ks => {
    if (ks.length > 0) {
      const mainK = ks[0];      // Take the first element in the array as main Key
      for (let i = 0; i < ks.length; i++) {
        if (obj[ks[i]] !== undefined) {
          res[mainK] = obj[ks[i]];
          break;        // There is some priority, if found, then will skip whatever following
        }
      }
    }
  });
  return res;
}
