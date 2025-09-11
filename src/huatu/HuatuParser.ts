
import type {
  IHuatu,
  ISize2D
} from "./IHuatu.js";

import type {
  HuatuYmlNamedFieldType,
  IHuatuYamlFile,
  IHuatuYmlStyle,
  IYmlLineInfo,
  IHuatuYmlObj,
  IHuatuYmlValueType
} from "./IHuatuYml.js";

import { WT_REGEX } from "../tools/regex.js";
import { WtHuatu } from "./Huatu.js";
import { IndentParsingStack } from "./IndentParsingStack.js";
import type { ISvgBBox } from "../svg/ISvg.js";
import { resolvePointLike } from "../tools/utils.js";
import { HuatuYml } from "./HuatuYml.js";
import { HuatuComponentCache } from "../component/HuatuComponentCache.js";

export function resolveHuatuSize(size: string): ISize2D | null {
  const wh = resolvePointLike(size);
  if (wh &&
      WT_REGEX.FLOAT_NUMBER.test(wh.x) &&
      WT_REGEX.FLOAT_NUMBER.test(wh.y)) {
    return {
      width: parseFloat(wh.x),
      height: parseFloat(wh.y)
    }
  }
  return null;
}

export const FORBIDDEN_NAMES = [
  "config",
  "size", "title", "desc",
  "viewbox", "viewarea", "viewbetween",
  "vars",
  "points",  "shapes",  "cpoints",  "xpoints",  "pointseries",  "shapeseries",
  "points2", "shapes2", "cpoints2", "xpoints2", "pointseries2", "shapeseries2",
  "points3", "shapes3", "cpoints3", "xpoints3", "pointseries3", "shapeseries3",
  "points4", "shapes4", "cpoints4", "xpoints4", "pointseries4", "shapeseries4",
  "components", "placements",
  "paths", "markers", "patterns", "clips",
  "styles", "labelstyles",
  "symbols", "blocks", "arrays", "layers",
  "draw", "jobs",
  "inputvars", "ports",
];

export function resolveYmlModelSync(ymlObj?: IHuatuYmlObj): WtHuatu {
  const huatu = new WtHuatu();
  if (!ymlObj) return huatu;
  // Copy the original object
  const yml = HuatuYml.copyObj(ymlObj) as IHuatuYamlFile;
  // Resolve meta data
  if (yml.title) huatu.title = yml.title;
  if (yml.desc) huatu.desc = yml.desc;
  if (yml.size) {
    const size = resolveHuatuSize(yml.size);
    if (size) {
      if (size.width > 0) huatu.width = size.width;
      if (size.height > 0) huatu.height = size.height;
    } else {
      huatu.resolvingErrors.push({
        title: `Size input of [${yml.size}] cannot be resolved!`
      });
    }
  }

  // Resolve Global Config
  if (yml.config) {
    const cfg = WtHuatu.resolveConfig(yml.config);
    // Inject the configuration into Global This
    if (Object.keys(cfg).length > 0) {
      huatu.config = cfg;
    }
  }

  // The unified named fields resolving function
  const resolveNamedFields = (
    field: string,
    moduleName: string,
    resolveCall: (k: string, val: any) => string[],
    acceptedTypes?: ("string" | "list" | "object")[],
    ignoreNames?: string[],
  ) => {
    const fieldVal = yml[field] as {
      [name: string]: IHuatuYmlValueType;
    };
    if (typeof fieldVal === "string") {
      huatu.resolvingErrors.push({
        title: `${moduleName} definition "${field}" is incorrect, please check!`,
      })
      return;
    }
    if (fieldVal) {
      for(const name in fieldVal) {
        // Check Name
        if (!WT_REGEX.VAR_NAME.test(name)) {
          huatu.resolvingErrors.push({
            title: `${moduleName} name '${name}' has incorrect format, please use only alphanumeric and underscore(_)!`
          });
          continue;
        }
        const lcName = name.toLowerCase();
        if (FORBIDDEN_NAMES.includes(lcName) && (!ignoreNames || !ignoreNames.includes(lcName))) {
          huatu.resolvingErrors.push({
            title: `${moduleName} name '${name}' is forbidden, please pick another one!`
          });
          continue;
        }
        // Check if definition empty
        let isEmpty = false;
        let notAccepted = false;
        let val = fieldVal[name];
        let valType = "string";
        if (!val) {
          isEmpty = true;
        } else if (typeof val === "string") {
          valType = "string";
          // Trim spaces
          val = val.trim();
          if (!val) isEmpty = true;
          else if (acceptedTypes && !acceptedTypes.includes("string")) notAccepted = true;
        } else if (Array.isArray(val)) {
          valType = "list";
          // Make sure list items are strings
          val = val.filter((x, idx) => {
            if (typeof x !== "string") {
              huatu.resolvingErrors.push({ title: `${moduleName} '${name}' has some invalid definition in the list (${idx + 1}-th item), please check!`})
              return false;
            } else {
              return x.trim();
            }
          });
          if (val.length < 1) isEmpty = true;
          else if (acceptedTypes && !acceptedTypes.includes("list")) notAccepted = true;
        } else {
          valType = "object";
          if (Object.keys(val).length < 1) {
            isEmpty = true;
          } else if (acceptedTypes && !acceptedTypes.includes("object")) notAccepted = true;
        }
        if (isEmpty) {
          huatu.resolvingErrors.push({
            title: `${moduleName} '${name}' has no definition (it is empty)!`
          });
          continue;
        }
        if (notAccepted) {
          huatu.resolvingErrors.push({
            title: `${moduleName} [${name}] cannot be defined as "${valType}"!`,
          });
          continue;
        }
        // Call the function and evaluate results
        const errMsg = resolveCall.call(huatu, name, val);
        if (errMsg.length > 1) {
          huatu.resolvingErrors.push({
            title: `${moduleName} [${name}] resolving failed`,
            msgs: [...errMsg]
          });
        } else if (errMsg.length === 1) {
          huatu.resolvingErrors.push({
            title: `${moduleName} [${name}] resolving failed: ${errMsg[0]}`,
          })
        }
      }
    }
  }

  // Resolve Var, this is the first step;
  resolveNamedFields("vars", "Var", huatu.resolveVar, ["string"]);

  /** The first round to resolve points, shapes, cpoints, xpoints and series */
  resolveNamedFields("points",        "Point",              huatu.resolvePoint,       ["string"]);
  resolveNamedFields("shapes",        "Shape",              huatu.resolveShape,       ["string"]);
  resolveNamedFields("cpoints",       "Calculated Point",   huatu.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints",       "Intersection Point", huatu.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries",   "Point Series",       huatu.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries",   "Shape Series",       huatu.resolveShapeSeries, ["string"]);

  /**
   * Here add extra 3 round of resolving Shapes/CPoints/Xpoints, This is to make it possible
   * that new shapes created based on the points calculated by intersection or from model.
   */

  // Resolve Shapes, the second Round
  resolveNamedFields("points2",       "Point",              huatu.resolvePoint,       ["string"]);
  resolveNamedFields("shapes2",       "Shape",              huatu.resolveShape,       ["string"]);
  resolveNamedFields("cpoints2",      "Calculated Point",   huatu.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints2",      "Intersection Point", huatu.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries2",  "Point Series",       huatu.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries2",  "Shape Series",       huatu.resolveShapeSeries, ["string"]);

  // Resolve Shapes, the third Round
  resolveNamedFields("points3",       "Point",              huatu.resolvePoint,       ["string"]);
  resolveNamedFields("shapes3",       "Shape",              huatu.resolveShape,       ["string"]);
  resolveNamedFields("cpoints3",      "Calculated Point",   huatu.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints3",      "Intersection Point", huatu.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries3",  "Point Series",       huatu.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries3",  "Shape Series",       huatu.resolveShapeSeries, ["string"]);

  // Resolve Shapes, the fourth Round
  resolveNamedFields("points4",       "Point",              huatu.resolvePoint,       ["string"]);
  resolveNamedFields("shapes4",       "Shape",              huatu.resolveShape,       ["string"]);
  resolveNamedFields("cpoints4",      "Calculated Point",   huatu.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints4",      "Intersection Point", huatu.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries4",  "Point Series",       huatu.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries4",  "Shape Series",       huatu.resolveShapeSeries, ["string"]);

  /** =========   Repeating Rounds ended =========  */

  // Resolve Components
  resolveNamedFields("components", "Component Definitions", huatu.resolveComponentDef, ["string", "object"]);

  // Resolve Component Placement
  resolveNamedFields("placements", "Component Placements", huatu.resolveComponentPlacement, ["string", "object"]);

  // Resolve paths
  resolveNamedFields("paths", "Path", huatu.resolvePath, ["string", 'list']);

  // Resolve marker
  resolveNamedFields("markers", "Marker", huatu.resolveMarker, ["string", "object"]);

  // Resolve Pattern
  resolveNamedFields("patterns", "Pattern", huatu.resolvePattern, ["string", "object"]);

  // Resolve Clips
  resolveNamedFields("clips", "Clip-Path", huatu.resolveClip, ["string", "list"]);

  // Resolve styles
  resolveNamedFields("styles", "Style", huatu.resolveStyle, ["string", "object"]);

  // Resolve Label Styles
  resolveNamedFields("labelStyles", "Label Style", huatu.resolveLabelStyle, ["string", "object"]);

  // Resolve symbols
  resolveNamedFields("symbols", "Symbol", huatu.resolveSymbol, ["string", "list"]);

  // Resolve blocks
  resolveNamedFields("blocks", "Block", huatu.resolveBlock, ["string", "list"]);

  // Resolve arrays
  resolveNamedFields("arrays", "Array", huatu.resolveArray, ["string", "object"]);

  // Resolve Layers
  resolveNamedFields("layers", "Layer", huatu.resolveLayer, ["string", "list"]);

  // Resolve ViewBox
  let vbDef = yml.viewBox || yml.viewArea || yml.viewBetween;
  if (vbDef) {
    let vb = huatu.resolveViewBoxFromDef(vbDef);
    if (typeof vb === "string") huatu.resolvingErrors.push({
      title: `ViewBox Resolving Failed: ${vb}`
    });
    else if (vb) huatu.viewBox = vb;
    else {
      huatu.warnings.push(`'${vbDef}' cannot resolve to a valid View Box!`);
    }
  }

  // Resolve Jobs, Including the global draw
  if (yml.jobs && yml.jobs["draw"]) {
    huatu.resolvingErrors.push({
      title: `You cannot define a job named as 'draw', please place the 'draw' job at root!`
    });
    delete yml.jobs["draw"];     // Delete it
  }
  if (yml.draw) {
    if (yml.jobs) yml.jobs["draw"] = yml.draw;
    else yml.jobs = { draw: yml.draw }
  }
  resolveNamedFields("jobs", "Job", huatu.resolveJob, ["string", "list", "object"], ["draw"]);
  huatu.draw = huatu.jobs.find(j => j.name === "draw");

  // Return after resolving
  return huatu;
}

export async function resolveYmlModel(ymlObj?: IHuatuYmlObj): Promise<WtHuatu> {
  if (!ymlObj) return new WtHuatu();
  // Prepare Components if any
  await HuatuComponentCache.prepareComponents(ymlObj);
  return resolveYmlModelSync(ymlObj);
}

export function resolveYmlModelOfComponent(ymlObj?: IHuatuYmlObj): WtHuatu {
  const comp = new WtHuatu();
  if (!ymlObj) return comp;
  // Copy the original object
  const yml = HuatuYml.copyObj(ymlObj) as IHuatuYamlFile;
  // Resolve meta data
  if (yml.title) comp.title = yml.title;
  if (yml.desc) comp.desc = yml.desc;

  // The unified named fields resolving function
  const resolveNamedFields = (
    field: string,
    moduleName: string,
    resolveCall: (k: string, val: any) => string[],
    acceptedTypes?: ("string" | "list" | "object")[],
    ignoreNames?: string[],
  ) => {
    const fieldVal = yml[field] as {
      [name: string]: IHuatuYmlValueType;
    };
    if (typeof fieldVal === "string") {
      comp.resolvingErrors.push({
        title: `${moduleName} definition "${field}" is incorrect, please check!`,
      })
      return;
    }
    if (fieldVal) {
      for(const name in fieldVal) {
        // Check Name
        if (!WT_REGEX.VAR_NAME.test(name)) {
          comp.resolvingErrors.push({
            title: `${moduleName} name '${name}' has incorrect format, please use only alphanumeric and underscore(_)!`
          });
          continue;
        }
        const lcName = name.toLowerCase();
        if (FORBIDDEN_NAMES.includes(lcName) && (!ignoreNames || !ignoreNames.includes(lcName))) {
          comp.resolvingErrors.push({
            title: `${moduleName} name '${name}' is forbidden, please pick another one!`
          });
          continue;
        }
        // Check if definition empty
        let isEmpty = false;
        let notAccepted = false;
        let val = fieldVal[name];
        let valType = "string";
        if (!val) {
          isEmpty = true;
        } else if (typeof val === "string") {
          valType = "string";
          // Trim spaces
          val = val.trim();
          if (!val) isEmpty = true;
          else if (acceptedTypes && !acceptedTypes.includes("string")) notAccepted = true;
        } else if (Array.isArray(val)) {
          valType = "list";
          // Make sure list items are strings
          val = val.filter((x, idx) => {
            if (typeof x !== "string") {
              comp.resolvingErrors.push({ title: `${moduleName} '${name}' has some invalid definition in the list (${idx + 1}-th item), please check!`})
              return false;
            } else {
              return x.trim();
            }
          });
          if (val.length < 1) isEmpty = true;
          else if (acceptedTypes && !acceptedTypes.includes("list")) notAccepted = true;
        } else {
          valType = "object";
          if (Object.keys(val).length < 1) {
            isEmpty = true;
          } else if (acceptedTypes && !acceptedTypes.includes("object")) notAccepted = true;
        }
        if (isEmpty) {
          comp.resolvingErrors.push({
            title: `${moduleName} '${name}' has no definition (it is empty)!`
          });
          continue;
        }
        if (notAccepted) {
          comp.resolvingErrors.push({
            title: `${moduleName} [${name}] cannot be defined as "${valType}"!`,
          });
          continue;
        }
        // Call the function and evaluate results
        const errMsg = resolveCall.call(comp, name, val);
        if (errMsg.length > 1) {
          comp.resolvingErrors.push({
            title: `${moduleName} [${name}] resolving failed`,
            msgs: [...errMsg]
          });
        } else if (errMsg.length === 1) {
          comp.resolvingErrors.push({
            title: `${moduleName} [${name}] resolving failed: ${errMsg[0]}`,
          })
        }
      }
    }
  }

  // Resolve Var, this is the first step;
  resolveNamedFields("vars", "Var", comp.resolveVar, ["string"]);

  /** The first round to resolve points, shapes, cpoints, xpoints and series */
  resolveNamedFields("points",        "Point",              comp.resolvePoint,       ["string"]);
  resolveNamedFields("shapes",        "Shape",              comp.resolveShape,       ["string"]);
  resolveNamedFields("cpoints",       "Calculated Point",   comp.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints",       "Intersection Point", comp.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries",   "Point Series",       comp.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries",   "Shape Series",       comp.resolveShapeSeries, ["string"]);

  /**
   * Here add extra 3 round of resolving Shapes/CPoints/Xpoints, This is to make it possible
   * that new shapes created based on the points calculated by intersection or from model.
   */

  // Resolve Shapes, the second Round
  resolveNamedFields("points2",       "Point",              comp.resolvePoint,       ["string"]);
  resolveNamedFields("shapes2",       "Shape",              comp.resolveShape,       ["string"]);
  resolveNamedFields("cpoints2",      "Calculated Point",   comp.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints2",      "Intersection Point", comp.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries2",  "Point Series",       comp.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries2",  "Shape Series",       comp.resolveShapeSeries, ["string"]);

  // Resolve Shapes, the third Round
  resolveNamedFields("points3",       "Point",              comp.resolvePoint,       ["string"]);
  resolveNamedFields("shapes3",       "Shape",              comp.resolveShape,       ["string"]);
  resolveNamedFields("cpoints3",      "Calculated Point",   comp.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints3",      "Intersection Point", comp.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries3",  "Point Series",       comp.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries3",  "Shape Series",       comp.resolveShapeSeries, ["string"]);

  // Resolve Shapes, the fourth Round
  resolveNamedFields("points4",       "Point",              comp.resolvePoint,       ["string"]);
  resolveNamedFields("shapes4",       "Shape",              comp.resolveShape,       ["string"]);
  resolveNamedFields("cpoints4",      "Calculated Point",   comp.resolveCPoint,      ["string"]);
  resolveNamedFields("xpoints4",      "Intersection Point", comp.resolveXPoint,      ["string"]);
  resolveNamedFields("pointSeries4",  "Point Series",       comp.resolvePointSeries, ["string"]);
  resolveNamedFields("shapeSeries4",  "Shape Series",       comp.resolveShapeSeries, ["string"]);

  /** =========   Repeating Rounds ended =========  */

  // Resolve paths
  resolveNamedFields("paths", "Path", comp.resolvePath, ["string", 'list']);

  // Resolve marker
  resolveNamedFields("markers", "Marker", comp.resolveMarker, ["string", "object"]);

  // Resolve Pattern
  resolveNamedFields("patterns", "Pattern", comp.resolvePattern, ["string", "object"]);

  // Resolve styles
  resolveNamedFields("styles", "Style", comp.resolveStyle, ["string", "object"]);

  // Resolve Label Styles
  resolveNamedFields("labelStyles", "Label Style", comp.resolveLabelStyle, ["string", "object"]);

  // Resolve ViewBox
  let vbDef = yml.viewBox || yml.viewArea || yml.viewBetween;
  if (vbDef) {
    let vb = comp.resolveViewBoxFromDef(vbDef);
    if (typeof vb === "string") comp.resolvingErrors.push({
      title: `ViewBox Resolving Failed: ${vb}`
    });
    else if (vb) comp.viewBox = vb;
    else {
      comp.warnings.push(`'${vbDef}' cannot resolve to a valid View Box!`);
    }
  }

  if (yml.draw) {
    if (yml.jobs) yml.jobs["draw"] = yml.draw;
    else yml.jobs = { draw: yml.draw }
  }
  resolveNamedFields("jobs", "Job", comp.resolveJob, ["string", "list", "object"], ["draw"]);
  comp.draw = comp.jobs.find(j => j.name === "draw");

  // Return after resolving
  return comp;
}
