
import type {
  IHuatuYmlParsingResult, 
  IHuatuYmlObj, 
  IYmlLineInfo
} from "./IHuatuYml.js";

import { IndentParsingStack } from "./IndentParsingStack.js";

export class HuatuYml {

  static parseYml(yml: string): IHuatuYmlParsingResult {

    // Prepare error handling
    let hasError: boolean = false;
  
    // Prepare the result
    const res: IHuatuYmlParsingResult = {
      succeeded: false,
      errorMessages: []
    };
  
    // The regex to match a "Real" comment, conditions are:
    //  - The Comment part starts with a '#' sign
    //  - The # sign is not followed by a ':', because this will escape the '#' char to be used in label text
    //  - The # sign is not followed by 3/6/8 color (hex) codes(a-z, 0-9), because this will build some color
    const YML_COMMENT_REGEX = /#(?!(:|([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b))(.*)$/ig;
    const REGEX_MATCH_LIST = /^(\s*)-(\s.*|$)/i;
    const REGEX_MATCH_KEY_VALUE = /^(\s*)(\$?[a-z][a-z0-9_]*)\s*:\s?(.*)$/i;

    const parseKeyVal = (line: string): {
      indentLevel: number,
      key: string | undefined,
      value: string,
    } => {
      const match = REGEX_MATCH_KEY_VALUE.exec(line);
      if (match) {
        return {
          indentLevel: Math.floor(match[1].length / 2),
          key: match[2],
          value: match[3].trim(),
        }
      } else {
        let indentLevel = Math.floor(/\s*/.exec(line)![0].length / 2);
        return {
          indentLevel: indentLevel,
          key: undefined,
          value: line.trim(),    // If line is not empty, then prepend a space
        }
      }
    };
    // Process the input
    const ymlLines = yml.replace(/\r/ig, "").split('\n');
    const lines = ymlLines
      .map((l, i) => {
        const lClean = l.replace(/#:/g, "_^;_;^_")        // Backup the '#' char
          .replace(YML_COMMENT_REGEX, "") // Remove comment
          .replace(/_\^;_;\^_/g, "#") // Restore # char
          .trimEnd()                      // Remove trailing spaces
          .replace(/\t/g, "  ")          // Replace tab key to two spaces
        return lClean
          ? {
            value: lClean,
            lineNumber: i + 1
          }
          : undefined;
      })
      .filter(l => !!l)
      .map(l => {
        let lineInfo: IYmlLineInfo | undefined;
        const tryAsList = l!.value.match(REGEX_MATCH_LIST);
        if (tryAsList) {
          const res = parseKeyVal(tryAsList[2].trim());
          lineInfo = {
            lineNumber: l!.lineNumber,
            indentLevel: Math.floor(tryAsList[1].length / 2),
            isListItem: true,
            key: res.key,
            value: res.value.trim(),
            isPureValue: false,
          };
        } else {
          const res = parseKeyVal(l!.value);
          lineInfo = {
            lineNumber: l!.lineNumber,
            indentLevel: res.indentLevel,
            isListItem: false,
            key: res.key,
            value: res.value,
            isPureValue: !res.key
          };
        }
        return lineInfo;
      })
      .filter(l => !!l) as IYmlLineInfo[];
    // If has error, then skip the steps following
    if (hasError) return res;
    if (lines.length < 1) {
      hasError = true;
      res.errorMessages.push({
        lineNumber: 0,
        message: 'No valid line ever input!'
      })
    } else if (lines[0].isPureValue) {
      hasError = true;
      res.errorMessages.push({
        lineNumber: lines[0].lineNumber,
        message: "First line mustn't be pure value line!"
      });
    }
    if (hasError) return res;
    // Append pure-value lines into previous
    const realLines: IYmlLineInfo[] = [lines[0]];     // Initialize with the first line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.isPureValue && !line.isListItem) {
        if (line.value) {
        const lastLine = realLines[realLines.length - 1];
          if (line.indentLevel > lastLine.indentLevel) {
            lastLine.value = lastLine.value ? `${lastLine.value} ${line.value}` : line.value;
          } else {
            hasError = true;
            res.errorMessages.push({
              lineNumber: line.lineNumber,
              message: "Continuing text should have more indent than its parent."
            })
            return res;
          }
        }
      } else {
        realLines.push(line);
      }
    }
    // Parse the YML lines into Object
    const indentLevelMin = Math.min(...realLines.map(l => l.indentLevel));
    const indentLevelMax = Math.max(...realLines.map(l => l.indentLevel));
    const indentLevelCount = indentLevelMax - indentLevelMin + 1 + 1;
    realLines.forEach(l => {
      l.indentLevel -= indentLevelMin;
    })
    const stacks: IndentParsingStack[] = [];
    for (let i = 0; i < indentLevelCount; i++) {
      stacks.push(new IndentParsingStack());
    }
  
    /**
     * This function is used to make the object composed by following sub-stacks
     * for the current stack that is going to close current open item.
     */
    const buildObjOnClose = (indentLevel: number): object | undefined => {
      let objOnClose: object | undefined = undefined;
      for (let j = indentLevelCount - 1; j > indentLevel; j--) {
        if (stacks[j].inUse) {
          stacks[j].close(objOnClose);
          objOnClose = stacks[j].buildObj();
          stacks[j].stop();
        }
      }
      return objOnClose;
    }
  
    for (let i = 0; i < realLines.length; i++) {
      const line = realLines[i];
      const stack = stacks[line.indentLevel];
      // Check if the line has invalid indent, i.e. over-indented, or less-indented
      let indentError = "";
      if (line.indentLevel > 0) {
        for (let j = line.indentLevel - 1; j >= 0; j--) {
          if (stacks[j].inUse && !stacks[j].isOpen) {
            indentError = "Over Indented";
            break;
          }
        }
      }
      if (!stack.inUse) {
        for (let j = line.indentLevel + 1; j < indentLevelCount; j++) {
          if (stacks[j].inUse) {
            indentError = "Less Indented";
            break;
          }
        }
      }
      if (indentError) {
        hasError = true;
        res.errorMessages.push({
          lineNumber: line.lineNumber,
          message: indentError,
        })
        return res;
      }
      if (stack.inUse) {
        // Check if coming item has a different item type, list or not
        if ((stack.isList && !line.isListItem) || (!stack.isList && line.isListItem)) {
          hasError = true;
          res.errorMessages.push({
            lineNumber: line.lineNumber,
            message: "You cannot mix list and/or dictionary definitions."
          })
          return res;
        }
        if (stack.isOpen) {        // Let's close all the sub and sub level stacks
          stack.close(buildObjOnClose(line.indentLevel));
        }
        // Push current item into the stack
        if (line.isListItem) {
          if (line.key) {
            stack.open();         // Make it open
            const stackNext = stacks[line.indentLevel + 1];
            stackNext.start(false, line.key, line.value);      // Make next-level stack in use
          } else {
            if (line.value) stack.add("", line.value);
            else stack.open();
          }
        } else {
          if (line.key) {
            const addRes = stack.add(line.key, line.value);
            if (addRes) {
              hasError = true;
              res.errorMessages.push({
                lineNumber: line.lineNumber,
                message: addRes,
              })
              return res;
            }
          }
        }
      } else {                      // Start the stack
        if (line.isListItem) {
          if (line.key) {
            stack.start(true);
            const stackNext = stacks[line.indentLevel + 1];
            stackNext.start(false, line.key, line.value);      // Leave the key and value to next-level stack
          } else {
            stack.start(true, undefined, line.value);          // If no key, then add into list if value presented
          }
        } else {
          stack.start(false, line.key, line.value);
        }
      }
    }
    // Close the root stack
    stacks[0].close(buildObjOnClose(0))
  
    res.rootObj = stacks[0].buildObj() as unknown as IHuatuYmlObj;
    res.succeeded = true;
  
    return res;
  }
  
  /**
   * A tool function to copy the source object to a new one. With the option of accepted key list and
   * string replacing function.
   * @param srcObj The Object to be processed
   * @param acceptedRootKeys A list of which keys are accepted, if not presented, all keys will be accepted
   * @param replaceFunc A function to replace string occurrences
   * @returns The copied/processed object
   */
  static copyObj(
    srcObj: IHuatuYmlObj, 
    acceptedRootKeys?: string[],
    replaceFunc?: (originalStr: string) => string
  ): IHuatuYmlObj {
    const resObj: IHuatuYmlObj = {};

    for (let k in srcObj) {
      if (acceptedRootKeys && !acceptedRootKeys.includes(k)) continue;
      const v = srcObj[k];
      if (typeof v === "string") {
        resObj[k] = replaceFunc ? replaceFunc(v) : v;
      } else if (Array.isArray(v)) {
        resObj[k] = [
          ...v.filter(x => typeof x === "string")
              .map(x => replaceFunc ? replaceFunc(x) : x)
        ];
      } else if (typeof v === "object") {
        resObj[k] = HuatuYml.copyObj(v, undefined, replaceFunc);
      }
    }

    return resObj;
  }
}
