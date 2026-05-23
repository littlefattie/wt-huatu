
import type {
  IHuatu,
  IHuatuVar,
  IHuatuPoint,
  IHuatuPath,
  IHuatuStyle,
  IHuatuDrawing,
  IHuatuSymbol,
  IHuatuSymbolArray,
  IHuatuLabel,
  IHuatuPointSeries,
  IHuatuPathSeries,
  IHuatuClipPath,
  IHuatuPattern,
  IHuatuDrawingGroup,
  IHuatuConfig,
  IHuatuFinalDraw,
  IHuatuDefinable,
  IHuatuDrawingElement,
  IHuatuTransform,
  SvgBuildType,
  IHuatuJob,
  IHuatuLabelStyle,
  IPatternParams,
  IMarkerParams,
  IHuatuResolvingError,
  HuatuDimMarkType,
  HuatuDimMarkArrowType,
  ISolvedXPoints,
  IResultResolveXPoints,
  IExprElement,
} from "./IHuatu.js"

import type {
  IHuatuYmlStyle,
  IHuatuYmlPattern,
  IHuatuConfigInYml,
  IHuatuYmlSymbolArray,
  IHuatuYmlJob,
  IHuatuYmlLabelStyle,
  IHuatuYmlMarker,
  IHuatuYmlObj,
} from "./IHuatuYml.js";

import type {
  ICircle,
  IPoint,
  IGeometryModel,
  ILine,
  ILineSeg
} from "../geometry/IGeometry.js";

import type {
  ISvgBBox,
  ISvgPath,
  ISvgPathSegment,
  ISvgPoint,
  TSvgLineJoin
} from "../svg/ISvg.js";

import { WT_REGEX } from "../tools/regex.js";
import {
  type IKeyValueOptions,
  type IKeyValueParsingResult,
  booleanCheck,
  ensurePositiveInt,
  indentHtmlLines,
  parseStrIntoKeyValuePair,
  resolvePointLike,
  assignOnlyDefined,
  fitNumInRange
} from "../tools/utils.js";

import { HuatuPoint } from "./HuatuPoint.js";
import { HuatuVar } from "./HuatuVar.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import { SvgCsts } from "../svg/SvgConstants.js";
import { WtMath } from "../math/WtMath.js";
import { NumberRange } from "../math/NumberRange.js";

import { AngDeg } from "../geometry/AngDeg.js";
import Point from "../geometry/Point.js";
import Circle from "../geometry/Circle.js";
import Rect from "../geometry/Rect.js";
import Triangle from "../geometry/Triangle.js";
import Line from "../geometry/Line.js";
import LineSeg from "../geometry/LineSeg.js";
import Polygon from "../geometry/Polygon.js";
import Ellipse from "../geometry/Ellipse.js";
import { Intersection } from "../geometry/Intersection.js";
import { Bezier2, Bezier3 } from "../geometry/Bezier.js";
import { EllipticalArc } from "../geometry/EllipticalArc.js";

import { HuatuPath } from "./HuatuPath.js";
import { PathLine } from "../path/PathLine.js";
import { PathEllipticalArc } from "../path/PathEllipticalArc.js";
import { PathBezier2 } from "../path/PathBezier2.js";
import { PathBezier3 } from "../path/PathBezier3.js";
import { type TPathSeg, type TPathSegDuplicated,  PathSegmentedPath } from "../path/PathSegmentedPath.js";
import PolyLine from "../geometry/PolyLine.js";
import { isValidColor } from "../tools/webColor.js";
import { HuatuPathSeries } from "./HuatuPathSeries.js";
import { HuatuSymbol } from "./HuatuSymbol.js";
import {
  HuatuStyle,
  type IHuatuStyleParams,
  type IHuatuStyleFillParams,
  type IHuatuStyleMarkerParams,
  type IHuatuStyleStrokeParams
} from "./HuatuStyle.js";
import {
  HuatuSymbolArray,
  type IHuatuSymbolArrayParams
} from "./HuatuSymbolArray.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import {
  HuatuLabel,
  type IHuatuLabelParams
} from "./HuatuLabel.js";
import {
  HuatuDrawing,
  type IHuatuDrawingSmoothParams,
  type IHuatuDrawingParams
} from "./HuatuDrawing.js";
import { HuatuBlock } from "./HuatuBlock.js";
import { HuatuLayer } from "./HuatuLayer.js";
import { HuatuTransform } from "./HuatuTransform.js";
import { predefinedPatterns } from "../presets/pattern.js";
import { predefinedMarkers } from "../presets/marker.js";
import { HuatuPointSeries, type IHuatuPointSeriesDrawParams } from "./HuatuPointSeries.js";
import { HuatuClipPath } from "./HuatuClipPath.js";
import { HuatuPattern } from "./HuatuPattern.js";
import { HuatuMarker } from "./HuatuMarker.js";
import { HuatuJob } from "./HuatuJob.js";
import {
  HuatuLabelStyle,
  type IHuatuLabelStyleParams
} from "./HuatuLabelStyle.js";
import { SvgPattern } from "../svg/SvgPattern.js";
import Ring from "../geometry/Ring.js";
import { PathPolyline } from "../path/PathPolyline.js";
import { PathPolygon } from "../path/PathPolygon.js";
import { varFuncCall } from "../math/VarFuncs.js";
import { PathRect } from "../path/PathRect.js";
import { PathTriangle } from "../path/PathTriangle.js";
import { PathCircle } from "../path/PathCircle.js";
import { PathEllipse } from "../path/PathEllipse.js";
import { HuatuComponentDef } from "../component/HuatuComponentDef.js";
import {
  HuatuComponentPlacement,
  type IHuatuComponentPlacementParams
} from "../component/HuatuComponentPlacement.js";
import {
  HuatuComponentPort,
  type IHuatuComponentPortParams
} from "../component/HuatuComponentPort.js";
import type {
  IHuatuComponentInputVars,
  IHuatuComponentPort,
  IHuatuComponentPortSettled
} from "../component/IHuatuComponent.js";
import { HuatuCompDrawing } from "./HuatuCompDrawing.js";
import { HuatuWire, type IHuatuWireDefParams } from "../wire/HuatuWire.js";
import { HuatuWireDrawing } from "../wire/HuatuWireDrawing.js";
import { HuatuNet } from "../wire/HuatuNet.js";
import {
  HuatuAngleMark,
  type IHuatuAngleMarkParams
} from "./HuatuAngleMark.js";
import {
  HuatuDimMark,
  type IHuatuDimMarkConfig,
  type IHuatuDimMarkParams
} from "./HuatuDimMark.js";
import { genHex } from "../tools/gen-id.js";
import { HuatuUserFunc, type IUserFuncResult } from "./HuatuUserFunc.js";

export class WtHuatu implements IHuatu {
  title?: string;
  desc?: string;

  config?: IHuatuConfig;

  width?: number;
  height?: number;
  viewBox?: ISvgBBox;

  vars: IHuatuVar[] = [];
  points: IHuatuPoint[] = [];
  pointSeries: IHuatuPointSeries[] = [];
  paths: HuatuPath[] = [];
  pathSeries: HuatuPathSeries[] = [];
  clips: HuatuClipPath[] = [];
  patterns: HuatuPattern[] = [];
  markers: HuatuMarker[] = [];
  styles: HuatuStyle[] = [];
  labelStyles: HuatuLabelStyle[] = [];
  arrays: HuatuSymbolArray[] = [];
  defines: IHuatuDefinable[] = [];
  symbols: HuatuSymbol[] = [];
  blocks: HuatuBlock[] = [];
  labels: IHuatuLabel[] = [];
  layers: HuatuLayer[] = [];
  compDefs: HuatuComponentDef[] = [];
  compPlacements: HuatuComponentPlacement[] = [];
  // This is for Component placement's use
  compPorts: HuatuComponentPort[] = [];

  // Reserve Solved X-Points to avoid re-computing
  solvedXPoints: ISolvedXPoints[] = [];

  // This is for Resolving wires
  nets: HuatuNet[] = [];

  // Jobs
  draw?: HuatuJob;
  jobs: HuatuJob[] = [];

  infos: string[] = [];
  warnings: string[] = [];
  resolvingErrors: IHuatuResolvingError[] = [];

  varErrors: string[] = [];
  pointErrors: string[] = [];

  constructor() {
    // TODO: If something else need to be added, please append here
  }

  static REGEX_LABEL_DEF = /^label\s*[,;\s](.*)\|\|\|(.*)$/i;
  static REGEX_WIRE_DEF = /^wire\s*[,;\s](.*)$/i;
  static REGEX_ANGLE_MARK_DEF = /^angleMark\s*[,;\s](.*)$/i;
  static REGEX_DIM_MARK_DEF = /^dimMark\s*[,;\s](.*)$/i;
  static REGEX_SHAPE_AND_DRAWING_DEF = /^([^\|]*)\|\|\|(.*)$/i;


  /**
   * A shortcut function to replace all the occurred point coordinates in a point composing expression
   * @param expr The point coordinate consisting of something like `pA.x`
   * @returns The expression with `pA.x` replaced with 3 and `pA.y` with 4,
   * if `pA = (3, 4)`
   */
  replaceCoors(expr: string) {
    let exprCopy = expr;
    const reGetCoors = /\b([a-z][a-z0-9_]*)[.](x|y)\b/ig;
    const notFoundPoints: string[] = [];
    let reExec = reGetCoors.exec(expr);
    while(reExec) {
      let pointName = reExec[1];
      let point = this.points.find(x => x.name === pointName);
      if (point) {
        exprCopy = exprCopy.replace(new RegExp(`\\b${point.name}[.]x\\b`), `(${point.x})`)
                           .replace(new RegExp(`\\b${point.name}[.]y\\b`), `(${point.y})`);
      } else {
        if (!notFoundPoints.includes(pointName)) notFoundPoints.push(pointName);
      }
      // Search For Next
      reExec = exprCopy ? reGetCoors.exec(expr) : null;
    }
    if (notFoundPoints.length > 0) {
      notFoundPoints.forEach(x => this.pointErrors.push(`Point "${x}" has not been defined!`));
      exprCopy = "";
    }
    return exprCopy;
  }


  /**
   * The function to resolve a user input VAR
   * @param expr The user input of a VAR
   * @returns the resolved result of the VAR
   */
  resolveVarExpr(expr: string): number | undefined {
    // If the expression has some comma or semicolon, then stop resolving
    if (expr.match(/[,;]/)) {
      this.varErrors.push(`Var Definition mustn't have comma(,) or semi-colon(,)!`);
      return undefined;
    }
    const reMath = /^\s*(sin|cos|tan|atan|asin|acos|dsin|dcos|dtan|datan|dasin|dacos|exp|log|log10|sqrt)\b/i;
    const reModelParam = /^\s*([a-z][a-z0-9_]*)[.](r|rx|ry|rin|rout|rotdeg|rotang|angs|ange|angrange|w|h|len|deg|degr|degs|degsr|dege|deger|clens|clene)\b/i;
    const reNdN = /^\s*([a-z][a-z0-9_]*[.][\w0-9]+)\b/i;      // NdN == name dot name
    const reVar = /^\s*([a-z][a-z0-9_]*)\b/i;
    const reFloat = /^\s*([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/;
    const reOp = /^\s*\(/;
    const reCp = /^\s*\)/;
    const rePlus = /^\s*[+]/;
    const reMinus = /^\s*[-]/;
    const reMult = /^\s*[*]/;
    const rePower = /^\s*[*][*](?![*])/;
    const reDiv = /^\s*[/]/;
    const reUnrecognized = /^\s*[\S]+/;
    let headEle: IExprElement | undefined = undefined;
    let tailEle: IExprElement | undefined = undefined;
    const notFoundModels: string[] = [];
    const notFoundScalars: string[] = [];
    const unknownNdNs: string[] = [];
    const unknownVars: string[] = [];
    const unrecognized: string[] = [];
    let opCount = 0,
        cpCount = 0,
        cpInAdvance = false;

    // Split the expression to elements
    let exprCopy = expr.substring(0);
    const addElement = (ele: IExprElement) => {
      if (!headEle) {
        headEle = ele;
        tailEle = ele;
      }
      else {
        tailEle!.next = ele;
        ele.prev = tailEle
        tailEle = ele;
      }
    }
    while (exprCopy) {
      // Check if PI
      let res = /^\s*pi\b/i.exec(exprCopy);
      if (res) {
        addElement({
          type: "num",
          text: res[0].trim().toLowerCase(),
          value: Math.PI,
        })
        exprCopy = exprCopy.substring(res[0].length);
        continue;
      }
      // Math functions
      res =  reMath.exec(exprCopy);
      if (res) {
        addElement({
          type: "func",
          text: res[0].trim().toLowerCase(),
          value: 0,
        })
        exprCopy = exprCopy.substring(res[0].length);
        continue;
      }
      // Model parameters
      res = reModelParam.exec(exprCopy);
      if (res) {
        let modelName = res[1],
            paramName = res[2],
            path = this.paths.find(x => x.name === modelName);
        if (path && path.model) {
          let param = path.model.getParam(paramName);
          if (param !== undefined) {
            addElement({
              type: "num",
              text: res[0].trim(),
              value: param
            });
            exprCopy  = exprCopy.substring(res[0].length);
            continue;
          } else {
            let nfScalar = `${modelName}.${paramName}`;
            if (!notFoundScalars.includes(nfScalar)) notFoundScalars.push(nfScalar);
          }
        }
        else {
          if (!notFoundModels.includes(modelName)) notFoundModels.push(modelName);
        }
      }
      // Check if Bad Name.Name def
      res = reNdN.exec(exprCopy);
      if (res) {
        let ndn = res[0].trim();
        if (!unknownNdNs.includes(ndn)) unknownNdNs.push(ndn);
        exprCopy = exprCopy.substring(res[0].length);
        continue;
      }
      // VarNames
      res = reVar.exec(exprCopy);
      if (res) {
        let vName = res[0].trim(),
            vDef = this.vars.find(x => x.name === vName);
        if (vDef) {
          addElement({
            type: "num",
            text: vName,
            value: vDef.value,
          });
        }
        else {
          unknownVars.push(vName);
        }
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Float numbers
      res = reFloat.exec(exprCopy);
      if (res) {
        addElement({
          type: "num",
          text: res[0].trim(),
          value: parseFloat(res[0].trim()),
        })
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Open Parenthesis
      res = reOp.exec(exprCopy);
      if (res) {
        addElement({
          type: "op",
          text: '(',
          value: 0,
        })
        opCount++;
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Close Parenthesis
      res = reCp.exec(exprCopy);
      if (res) {
        addElement({
          type: "cp",
          text: ')',
          value: 0,
        })
        cpCount++;
        if (opCount < cpCount) cpInAdvance = true;
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Plus
      res = rePlus.exec(exprCopy);
      if (res) {
        addElement({
          type: "plus",
          text: '+',
          value: 0,
        })
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Minus
      res = reMinus.exec(exprCopy);
      if (res) {
        addElement({
          type: "minus",
          text: '-',
          value: 0,
        })
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Power operator (**)
      res = rePower.exec(exprCopy);
      if (res) {
        addElement({
          type: "power",
          text: '**',
          value: 0,
        });
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Mult
      res = reMult.exec(exprCopy);
      if (res) {
        addElement({
          type: "mult",
          text: '*',
          value: 0,
        })
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Divide
      res = reDiv.exec(exprCopy);
      if (res) {
        addElement({
          type: "div",
          text: '/',
          value: 0,
        })
        exprCopy =  exprCopy.substring(res[0].length);
        continue;
      }
      // Unrecognized parts
      res = reUnrecognized.exec(exprCopy);
      if (res) {
        let portion = res[0].trim();
        if (!unrecognized.includes(portion)) unrecognized.push(portion);
        exprCopy = exprCopy.substring(res[0].length);
        continue;
      }
      // If no match, make it finished
      exprCopy = "";
    }
    if (!headEle || !tailEle) {
      this.varErrors.push(`Invalid var definition: ${expr}`);
      return undefined;
    }
    // Check Error
    if (unknownVars.length > 0 || unknownNdNs.length > 0 || notFoundModels.length > 0 || notFoundScalars.length  > 0 || unrecognized.length > 0 || cpCount !== opCount || cpInAdvance) {
      unknownVars.forEach(x => this.varErrors.push(`Var [${x}] has not been defined! !`));
      unknownNdNs.forEach(x => this.varErrors.push(`Var Definition contains unresolvable elements: [${x}] !`));
      notFoundModels.forEach(x => this.varErrors.push(`"${x}" has not been defined as a shape!`));
      notFoundScalars.forEach(x => this.varErrors.push(`"${x}" cannot to be resolved to any scalar!`));
      unrecognized.forEach(x => this.varErrors.push(`Unrecognizable "${x}"`));
      if (cpInAdvance) this.varErrors.push(`Var Definition has unpaired parenthesis (close parenthesis coming first) !`);
      else if (cpCount !== opCount) this.varErrors.push(`Var Definition has unpaired parenthesis!`);
      return undefined;
    }

    const calcSingleParenthesis = (head: IExprElement, tail: IExprElement): {
      text: string;
      value: number;
      errorMsg?: string;
    } => {
      let ptr = head;
      // Functions Check
      while (ptr !== tail) {
        if (ptr.type === "func") {
          let param = ptr.next!;
          let funcText = `${ptr.text}${param.text}`;
          if (param.type === "num") {
            let val = varFuncCall(ptr.text, param.value);
            if (val === undefined) {
              return {
                errorMsg: `'${funcText}' resolves to no value`,
                text: funcText,
                value: 0,
              }
            }
            else if (isNaN(val)) {
              let msg = ptr.text === "sqrt"
                ? `, Maybe Minus(-) value for Sqrt?`
                : ptr.text === "log" || ptr.text === "log10"
                ? `, Maybe Minus(-) value for Log?`
                : ``;
              return {
                errorMsg: `'${funcText}' resolves to NaN (not a value)${msg}`,
                text: funcText,
                value: 0,
              }
            }
            else {
              // Change current element to a num
              ptr.value = val;
              ptr.text = funcText;
              ptr.type = "num";
              ptr.next = param.next!;
              param.next!.prev = ptr;
              ptr = ptr.next;
            }
          } else {
            return {
              errorMsg: `function use '${funcText}' is incorrect`,
              text: `${funcText}`,
              value: 0,
            }
          }
        }
        else {
          ptr = ptr.next!;
        }
      }
      // Power check
      ptr = head;
      while (ptr !== tail) {
        if (ptr.type === "power") {
          let pLeft = ptr.prev,
              pRight = ptr.next;
          if (!pLeft || pLeft.type !== "num" || !pRight || pRight.type !== "num") {
            return {
              errorMsg: `Error to power calculation: ${ptr.prev!.text} ** ${ptr.next?.text || ''}`,
              text: `${ptr.prev!.text} ** ${ptr.next?.text || ''}`,
              value: 0,
            }
          }
          pLeft.text = `${pLeft.text} ** ${pRight.text}`;
          pLeft.value = Math.pow(pLeft.value, pRight.value);
          pLeft.next = pRight.next;
          pRight.next!.prev = pLeft;
          ptr = pRight.next!;
        }
        else {
          // Move Next
          ptr = ptr.next!;
        }
      }
      // Multiply / divide check
      ptr = head;
      while (ptr !== tail) {
        if (ptr.type === "mult") {
          let pLeft = ptr.prev,
              pRight = ptr.next;
          if (!pLeft || pLeft.type !== "num" || !pRight || pRight.type !== "num") {
            return {
              errorMsg: `Error to multiply: ${ptr.prev!.text} * ${ptr.next?.text || ''}`,
              text: `${ptr.prev!.text} * ${ptr.next?.text || ''}`,
              value: 0,
            }
          }
          pLeft.text = `${pLeft.text} * ${pRight.text}`;
          pLeft.value = pLeft.value * pRight.value;
          pLeft.next = pRight.next;
          pRight.next!.prev = pLeft;
          ptr = pRight.next!;
        }
        else if (ptr.type === "div") {
          let pLeft = ptr.prev,
              pRight = ptr.next;
          if (!pLeft || pLeft.type !== "num" || !pRight || pRight.type !== "num") {
            return {
              errorMsg: `Error to divide: ${ptr.prev!.text} / ${ptr.next?.text || ''}`,
              text: `${ptr.prev!.text} / ${ptr.next?.text || ''}`,
              value: 0,
            }
          }
          if (WtMath.isZero(pRight.value)) {
            return {
              errorMsg: `Cannot divide zero (/0): ${ptr.prev!.text} / ${ptr.next?.text || ''}`,
              text: `${ptr.prev!.text} / ${ptr.next?.text || ''}`,
              value: 0,
            }
          }
          pLeft.text = `${pLeft.text} / ${pRight.text}`;
          pLeft.value = pLeft.value / pRight.value;
          pLeft.next = pRight.next;
          pRight.next!.prev = pLeft;
          ptr = pRight.next!;
        }
        else {
          // Move Next
          ptr = ptr.next!;
        }
      }
      // Plus and Minus
      head.prev = undefined;
      ptr = head;
      while (ptr !== tail) {
        if (ptr.type === 'plus') {
          let pLeft = ptr.prev,
              pRight = ptr.next;
          if (!pRight || pRight.type !== "num") {
            return {
              errorMsg: `Right operand of (+) is empty`,
              text: '',
              value: 0,
            }
          }
          if (!pLeft) {
            ptr.value = pRight.value;
            ptr.type = "num";
            ptr.text = `${pRight.text}`;
            ptr.next = pRight.next;
            pRight.next!.prev = ptr;
            ptr = pRight.next!;
          }
          else if (pLeft.type !== "num") {
            return {
              errorMsg: `Left operand of (+) is incorrect: ${pLeft.text}`,
              text: `${pLeft.text}`,
              value: 0
            }
          }
          else {
            pLeft.value = pLeft.value + pRight.value;
            pLeft.text = `${pLeft.text} + ${pRight.text}`;
            pLeft.next = pRight.next;
            pRight.next!.prev = pLeft;
            ptr = pRight.next!;
          }
        }
        else if (ptr.type === "minus") {
          let pLeft = ptr.prev,
              pRight = ptr.next;
          if (!pRight || pRight.type !== "num") {
            return {
              errorMsg: `Right operand of (-) is empty`,
              text: '',
              value: 0,
            }
          }
          if (!pLeft) {
            ptr.value = 0 - pRight.value;
            ptr.type = "num";
            ptr.text = `-${pRight.text}`;
            ptr.next = pRight.next;
            pRight.next!.prev = ptr;
            ptr = pRight.next!;
          }
          else if (pLeft.type !== "num") {
            return {
              errorMsg: `Left operand of (-) is incorrect: ${pLeft.text}`,
              text: `${pLeft.text}`,
              value: 0
            }
          }
          else {
            pLeft.value = pLeft.value - pRight.value;
            pLeft.text = `${pLeft.text} - ${pRight.text}`;
            pLeft.next = pRight.next;
            pRight.next!.prev = pLeft;
            ptr = pRight.next!;
          }
        }
        else {
          // Move Next
          ptr = ptr.next!;
        }
      }
      // Check if anything wrong
      if (head.next != tail) {
        return {
          errorMsg: `Parenthesis Calculation error`,
          text: `${head.text}`,
          value: 0
        }
      }
      // Return the head element which holds the calculation result
      return {
        text: head.text,
        value: head.value,
      }
    }

    // The function to Resolve Parenthesis content
    // The parameter `head` is the opening parenthesis
    const resolveParenthesis = (head: IExprElement): {
      end?: IExprElement;
      result: "value" | "unmatched" | "empty" | "error",
      value:  number;
      text?: string;
    } => {
      // let pText = head.text;
      let pN = head.next;
      if (!pN) return {
        result: "unmatched",
        value: 0,
      };
      if (pN.type === "cp") return {
        result: "empty",
        value: 0,
      }
      let contentHead = pN,
          contentTail: IExprElement,
          closed = false,
          ptr = contentHead;
      while (!closed) {
        if (ptr.type === "op") {
          // It is another cascading parenthesis
          let parenIn = resolveParenthesis(ptr);
          if (parenIn.result === "value") {
            ptr.next = parenIn.end,
            ptr.type = "num",
            ptr.value = parenIn.value;
            ptr.text = parenIn.text || "";
            if (parenIn.end) {
              // After resolved, shrink it
              parenIn.end.prev = ptr;
            }
          } else {
            return parenIn;
          }
        }
        else if (ptr.type === "cp") {
          contentTail = ptr;
          // Close Here
          closed = true;
        }
        else {
          if (!ptr.next) {
            return {
              result: "unmatched",
              value: 0,
            }
          } else {
            ptr = ptr.next;
          }
        }
      }
      let resCalc = calcSingleParenthesis(contentHead, contentTail!);
      return resCalc.errorMsg
        ? {
          result: "error",
          value: 0,
          text: resCalc.errorMsg
        }
        : {
          result: "value",
          value: resCalc.value,
          text: `(${resCalc.text})`,
          end: contentTail!.next
        }
    }
    
    // Add start and end parenthesis to re-use the iterative tooling function
    let eleStart: IExprElement = {
      type: "op",
      text: "(",
      value: 0,
      next: headEle,
    };
    (headEle as IExprElement).prev = eleStart;
    (tailEle as IExprElement).next = {
      type: "cp",
      text: ")",
      value: 0,
      prev: (tailEle as IExprElement),
    };
    let res = resolveParenthesis(eleStart);
    if (res.result === "value") {
      if (isNaN(res.value)) {
        this.varErrors.push(`var definition '${expr}' resolved to NaN (not a value)!`);
      } else {
        return res.value;
      }
    }
    else if (res.result === "empty") {
      this.varErrors.push(`var definition '${expr}' has empty parenthesis!`);
    }
    else if (res.result ===  "unmatched") {
      this.varErrors.push(`var definition '${expr}' has unpaired parenthesis!`);
    }
    else if (res.result === "error") {
      this.varErrors.push(res.text || "");
    }
    return undefined;
  }

  /**
   * Resolve the var provided, and add it into var list.
   * If some error encountered, then some error message will be returned.
   * @param name Name of the var
   * @param value Presentation of the var
   */
  resolveVar(name: string, value: string): string[] {
    if (WtHuatu.RESERVED_NAMES.includes(name.toLowerCase())) {
      return [`Function Names (here you input "${name}") cannot be used as Var Name!`];
    }
    if (this.vars.find(v => v.name === name)) {
      return [`There has already been a var named as ${name}`];
    }
    if (WT_REGEX.FLOAT_NUMBER.test(value)) {
      this.vars.push(new HuatuVar(name, parseFloat(value), "direct"));
      return [];
    }
    this.varErrors = [];
    const varRes = this.resolveVarExpr(value);
    if (varRes !== undefined) {
      this.vars.push(new HuatuVar(name, varRes, "derived"));
      return [];
    } else {
      return [...this.varErrors];
    }
  }

  addPoint(point: IHuatuPoint) {
    this.points.push(point);
    // Sort the points by which having longest name be the first
    this.points.sort((p1, p2) => p2.name.length - p1.name.length);
  }

  /**
   * The unified method to resolve/calculate the X/Y coordinate of a Point.
   * It can resolve some thing like `pA.x + sin(b) * (5 + r) + pB.y`
   * It will replace the coors of other point(s) and replace functions and vars
   * Then finally evaluate the result.
   * @param expr The expression of X/Y coordinate of a Point
   * @returns The resolved coordinate, a number
   */
  resolvePointCoorsExpr(expr: string): number | undefined {
    if (WT_REGEX.FLOAT_NUMBER.test(expr.trim())) {
      return parseFloat(expr.trim());
    }
    // Replace p.X and p.Y to numbers
    expr = this.replaceCoors(expr);
    if (!expr) return undefined;
    // Resolve as Var Expression
    return this.resolveVarExpr(expr);
  }

  /**
   * Resolve a point from some PointSeries(with index) or Some Point (by name), or
   * from the definition of XY coordinates.
   * @param expr The string to query of build a point
   * @returns The identified point or undefined
   */
  resolvePointFromExpr(expr: string): ISvgPoint | undefined {
    // Check if it is referring some defined Point
    const definedPoint = this.points.find(p => p.name === expr);
    if (definedPoint) {
      return definedPoint.toPoint();
    }
    // Check if the expr is like pathCirc.cin or rect.ne, etc
    const cpTry = /^([a-z][a-z0-9_]*)[.](n|e|s|w|ne|nw|se|sw|a|b|c|o|m|cin|cout|cg|[0-9]+)$/i.exec(expr);
    if (cpTry) {
      const shapeName = cpTry[1];
      const pathTry = this.paths.find(x => x.name === shapeName);
      if (pathTry && pathTry.model) {
        let pTag: string | number = cpTry[2];
        if (/[0-9]+/.exec(pTag)) {
          pTag = parseInt(pTag);
        }
        return pathTry.model.getPoint(pTag);
      } else if (pathTry?.path instanceof PathSegmentedPath) {
        return pathTry.path.getPoint(cpTry[2].toLowerCase());
      } else {
        return undefined;
      }
    }
    // Check if it is referring some point in a Point Series
    const match = expr.match(WT_REGEX.VAR_WITH_INDEXING);
    if (match) {
      const vName = match[1];
      const vIndex = parseInt(match[3] || match[4]);
      const ps = this.pointSeries.find(s => s.name === vName);
      if (ps) {
        return ps.getPoint(vIndex - 1);
      } else {
        let path = this.paths.find(p => p.name === vName);
        if (path && (
          path.path instanceof PathPolygon ||
          path.path instanceof PathPolyline
        )) {
          return vIndex >=1 && vIndex <= path.path.points.length
            ? path.path.points[vIndex - 1]
            : undefined;
        }
      }
    }
    // Check if it defined as form of a point XY pair
    const pXY = resolvePointLike(expr);
    if (pXY) {
      const pX = this.resolvePointCoorsExpr(pXY.x);
      const pY = this.resolvePointCoorsExpr(pXY.y);
      if (pX !== undefined && pY !== undefined) {
        return new SvgPoint(pX, pY);
      }
    }
    return undefined;
  }

  /**
   * Resolve the point directly defined, by supplying name and definition
   * @param name name of the point
   * @param value Presented form to calculate the point
   */
  resolvePoint(name: string, value: string): string[] {
    if (this.points.find(p => p.name === name)) {
      return [`There has already been a point named as ${name}`];
    }
    const pXY = resolvePointLike(value);
    if (!pXY) {
      return [`Format [${value}] of the definition is incorrect!`];
    };
    if (WT_REGEX.FLOAT_NUMBER.test(pXY.x) && WT_REGEX.FLOAT_NUMBER.test(pXY.y)) {
      this.addPoint(new HuatuPoint(parseFloat(pXY.x), parseFloat(pXY.y), name, "direct"));
      return [];
    }

    this.varErrors = [];
    this.pointErrors = [];
    const pX = this.resolvePointCoorsExpr(pXY.x);
    if (pX === undefined) {
      this.pointErrors.push(`X part [${pXY.x}] is incorrect!`);
      this.pointErrors.push(...this.varErrors);
      this.varErrors = [];
    }
    const pY = this.resolvePointCoorsExpr(pXY.y);
    if (pY === undefined) {
      this.pointErrors.push(`Y part [${pXY.y}] is incorrect!`);
      this.pointErrors.push(...this.varErrors);
      this.varErrors = [];
    }
    if (pX !== undefined && pY !== undefined) {
      this.addPoint(new HuatuPoint(pX, pY, name, "derived"));
    }
    return [...this.pointErrors];
  }

  resolveSeparatedNumbers(def: string): number[] {
    return def.split(/[,]/).map(x => x.trim()).filter(x => !!x)
      .map(x => this.resolveVarExpr(x))
      .filter(x => x !== undefined) as number[];
  }

  /**
   * This function is some unified method to resolve the (Geometry) Model of the shape defined by user.
   * This function is normally only be used under this module.
   * @param def The Definition string to build/specify one Shape, e.g. "circle;p0;5" means making some circle
   *            centered at point p0 and having radius of 5
   * @returns Error Message if errored or the resolved Model of the shape
   */
  resolveShapeDef(def: string): IGeometryModel | string {
    const params = def.split(";").map(p => p.trim()).filter(p => !!p);
    if (params.length < 2) return `Parameters are too less to build a shape/path!`;
    const shapeType = params[0].toLowerCase();
    let p1, p2, p3, p4, rx, ry;
    let line, deg, l1, l2, ln;
    let x1, y1, width, height;
    let ps, pts;
    let pathReferred, pathDerived;
    let dx, dy, pMoveOrAt, rotDeg;
    switch (shapeType) {
      case "ln":        // Line, LineSeg, and PolyLine, Unified definition
      case "line":        // Line, LineSeg, and PolyLine, Unified definition
        if (params.length < 3) return `Parameters are too less to build a Line/LineSeg!`;
        // Try first param, to see it if is defined Line
        line = this.paths.find(s => s.name === params[1]);
        if (line) {       // The def is like: line; ln1; l1; l2;
          if (!(line.model instanceof Line)) return `"${params[1]}" is not a Line!`;
          const l1 = this.resolveVarExpr(params[2]);
          if (l1 === undefined) return `Length from Line (${params[2]}) is invalid`;
          const l2 = params.length > 3 ? this.resolveVarExpr(params[3]) : undefined;
          return line.model.buildSeg(l1, l2);
        }
        // Now the first param should be a point
        p1 = this.resolvePointFromExpr(params[1]);
        if (!p1) return `The first parameter should be a Point to define a Line/LineSeg/PolyLine!`;
        p2 = this.resolvePointFromExpr(params[2]);
        if (p2) {         // In this case, the def is like: line; p1; p2; p3; ... (only valid points picked)
          if (params.length < 4) return new LineSeg(p1, p2);
          const pts = [p1, p2];
          for (let idx = 3; idx < params.length; idx++) {
            const p = this.resolvePointFromExpr(params[idx]);
            if (p) pts.push(p);
          }
          return new PolyLine(...pts);
        }
        deg = this.resolveVarExpr(params[2]);
        if (deg === undefined) return `Slope Angle (${params[2]}) is incorrect!`;
        // The def is like: line; p; deg; l1 (optional); l2 (optional); ... (the rest discarded)
        ln = new Line(p1, AngDeg.fitDeg(deg));
        if (params.length < 4) {    // It is just a line
          return ln;
        }
        l1 = this.resolveVarExpr(params[3]);
        if (l1 === undefined) return ln;   // If the length definition is invalid, then just return the Line
        l2 = params.length > 4 ? this.resolveVarExpr(params[4]) : undefined;
        return ln.buildSeg(l1, l2);

      case "ls":
      case "lineseg":
        if (params.length < 3) return `Parameters are too less to build a Line/LineSeg!`;
        // Format of Line Segment:
        //  - lineseg; lineName; l1; l2;
        //  - lineseg; (x1, y1); (x2, y2);
        //  - lineseg; (x, y); deg; l1; l2;
        line = this.paths.find(s => s.name === params[1]);
        if (line) {
          if (!(line.model instanceof Line)) return `The Shape you picked (${params[1]}) to derive a Line Seg is not a Line!`;
          const l1 = this.resolveVarExpr(params[2]);
          if (l1 === undefined) return `Length from Line (${params[2]}) is invalid`;
          const l2 = params.length > 3 ? this.resolveVarExpr(params[3]) : undefined;
          return line.model.buildSeg(l1, l2);
        }
        const pStart = this.resolvePointFromExpr(params[1]);
        const pEnd = this.resolvePointFromExpr(params[2]);
        if (!pStart) return `Start Point (${params[1]}) of the Line Seg is invalid!`;
        if (pEnd) return new LineSeg(pStart, pEnd);
        deg = this.resolveVarExpr(params[2]);
        if (deg === undefined) return `Line Slope degree (${params[2]}) is incorrect!`;
        ln = new Line(pStart, AngDeg.fitDeg(deg));
        if (params.length < 4) {
          return "Length definition from Line is incorrect, no length specified!";
        }
        l1 = this.resolveVarExpr(params[3]);
        if (l1 === undefined) return `Line Length (${params[3]}) is incorrect!`;
        l2 = params.length > 4 ? this.resolveVarExpr(params[4]) : undefined;
        return ln.buildSeg(l1, l2);

      case "pln":
      case "pline":
      case "polyline":
        // Check if the first param is point series
        ps = this.pointSeries.find(x  => x.name === params[1]);
        if (ps) {
          if (ps.points.length < 2) return `Point Series [${params[1]}] has only one point!`;
          else pts = ps.points;
        } else {
          pts = params.filter((p, i) => i > 0)
            .map(p => this.resolvePointFromExpr(p))
            .filter(p => !!p) as ISvgPoint[];
        }
        if (pts.length < 2) return `Points provided are too less, need to be 2 (valid) points at least!`;
        return new PolyLine(...pts);

      case "circ":
      case "circle":
        if (params.length < 3) return `Parameters are too less to build a Circle!`;
        // Format of a circle define: circle; (x, y); r
        p1 = this.resolvePointFromExpr(params[1]);
        if (!p1) return `Circle center (${params[1]}) is invalid!`;
        let radius = this.resolveVarExpr(params[2]);
        if (radius === undefined) return `Circle radius (${params[2]}) is invalid!`;
        if (WtMath.isZero(radius)) return `Circle radius (${params[2]}) resolved is zero, which is invalid!`;
        if (radius < 0) this.warnings.push(`Circle radius used some negative value('${radius}' calculated from '${params[2]}'), its absolute will be used!`);
        return new Circle(p1.x, p1.y, radius);

      case "ring":
        if (params.length < 4) return `Parameters are too less to build a Ring!`;
        p1 = this.resolvePointFromExpr(params[1])
        let r1 = this.resolveVarExpr(params[2]);
        let r2 = this.resolveVarExpr(params[3]);
        if (!p1) return `Center (${params[1]}) is invalid to build a Ring!`;
        if (!r1 || !r2) return `Inner/Outer radius for a ring must both be set (and positive)!`;
        return new Ring(p1.x, p1.y, r1, r2);

      case "rect":
      case "rectangle":
        if (params.length < 3) return `Parameters are too less to build a Rectangle!`;
        // Format of Rectangle:
        // - rect; bycenter; (x, y); w; h
        // - rect; (x1, y1); (x2, y2)
        // - rect; (x1, y1); w; h
        if (params[1].toLowerCase() === "bycenter" && params.length >= 5) {
          const pCenter = this.resolvePointFromExpr(params[2]);
          if (!pCenter) return `Center definition (${params[2]}) is invalid.`
          const w = this.resolveVarExpr(params[3]);
          if (!w || w <= 0) return `Width must be greater than Zero, it is now '${w}' (resolved from '${params[3]}')`;
          const h = this.resolveVarExpr(params[4]);
          if (!h || h <= 0) return `Height must be greater than Zero, it is now '${h}' (resolved from '${params[4]}')`;
          x1 = pCenter.x - w / 2;
          y1 = pCenter.y - h / 2;
          width = w;
          height = h;
        } else {
          p1 = this.resolvePointFromExpr(params[1]);
          if (!p1) return `The start point (${params[1]}) of the rectangle is invalid`;
          p2 = this.resolvePointFromExpr(params[2]);
          const w = this.resolveVarExpr(params[2]);
          if (p2) {
            width = Math.abs(p1.x - p2.x);
            height = Math.abs(p1.y - p2.y);
            if (WtMath.isZero(width)) return "Rectangle Width is zero!";
            if (WtMath.isZero(height)) return "Rectangle Height is zero!";
            x1 = Math.min(p1.x, p2.x);
            y1 = Math.min(p1.y, p2.y);
          } else {
            if (!w || w <= 0) return `Width must be greater than Zero, it is now '${w}' (resolved from '${params[3]}')`;
            width = w;
            if (params.length >= 4) {
              const h = this.resolveVarExpr(params[3]);
              if (!h || h <= 0) return `Height must be greater than Zero, it is now '${h}' (resolved from '${params[4]}')`;
              height = h;
            } else {
              height = w;     // If Height is not given, then it is a square, height = width
              return `Rectangle Height might be undefined!`;
            }
            x1 = p1.x;
            y1 = p1.y;
          }
        }
        return new Rect(x1, y1, width, height);

      case "tri":
      case "triangle":
        // Format of Triangle: triangle; (x1, y1); (x2, y2); (x3, y3)
        if (params.length < 4) return `Parameters to build a triangle are not sufficient!`;
        p1 = this.resolvePointFromExpr(params[1]);
        p2 = this.resolvePointFromExpr(params[2]);
        p3 = this.resolvePointFromExpr(params[3]);
        if (!p1) return `The first point (${params[1]}) is invalid!`;
        if (!p2) return `The second point (${params[2]}) is invalid!`;
        if (!p3) return `The third point (${params[3]}) is invalid!`;
        return new Triangle(p1, p2, p3);

      case "plg":
      case "polygon":
        // Check if the first param is point series
        ps = this.pointSeries.find(x  => x.name === params[1]);
        if (ps) {
          if (ps.points.length < 2) return `Point Series [${params[1]}] has only one point!`;
          else pts = ps.points;
        } else {
          // Format of the polygons: plg; (x1, y1); (x2, y2); (x3, y3); ...;(xn, yn)
          if (params.length < 4) return `Parameters for the Polygon is insufficient!`;
          pts = params.filter((p, i) => i > 0)
            .map(p => {
              const tryPoint = this.resolvePointFromExpr(p);
              if (!tryPoint) this.warnings.push(`When building a Polygon, '${p}' resolved to no Point!`)
              return tryPoint;
            })
            .filter(p => !!p) as ISvgPoint[];
        }
        if (pts.length < 3) return `The valid points are less than 3, no polygon is defined!`;
        return new Polygon(...pts);

      case "plgn":
      case "npolygon":
        // Format of the regular polygon N: plgn; N; (cx, cy); radius; start_deg;
        if (params.length < 5) return `Parameters for Regular N-Polygon is insufficient`;
        const N = parseInt(params[1]);
        if (!N || N < 0) return `Please give a integer for N, [${params[1]}] is invalid!`;
        p1 = this.resolvePointFromExpr(params[2]);
        if (!p1) return `Center for the Regular N-Polygon is invalid!`;
        rx = this.resolveVarExpr(params[3]);
        if (rx === undefined) return `Radius for the regular N-Polygon is invalid!`;
        deg = this.resolveVarExpr(params[4]) ?? 0;
        return Polygon.buildRegularPolygon(N, p1, rx, deg);

      case "ell":
      case "ellipse":
        // Format of the Ellipse; ellipse; (x, y); rx; ry; deg
        if (params.length < 4) return `Parameters for the Ellipse is insufficient!`;
        p1 = this.resolvePointFromExpr(params[1]);
        rx = this.resolveVarExpr(params[2]);
        ry = this.resolveVarExpr(params[3]);
        deg = params.length > 4 ? this.resolveVarExpr(params[4]) : 0;
        if (!p1) return `Ellipse Center (${params[1]}) is invalid!`;
        if (!rx || rx <= 0) return `Ellipse RX (${params[2]}, resolved as '${rx}') is invalid!`;
        if (!ry || ry <= 0) return `Ellipse RY (${params[3]}, resolved as '${ry}') is invalid!`;
        if (deg === undefined) return `Ellipse Rotating Degree (${params[4]}) cannot be resolved!`;
        return new Ellipse(p1.x, p1.y, rx, ry, AngDeg.fitDeg(deg));

      case "b2":
      case "bezier2":
        // Format of Bezier2: bezier2; (xStart, yStart); (xCtrl, yCtrl); (xEnd, yEnd)
        if (params.length < 4) return `Parameters to build Bezier2 are not sufficient!`;
        p1 = this.resolvePointFromExpr(params[1]);
        p2 = this.resolvePointFromExpr(params[2]);
        p3 = this.resolvePointFromExpr(params[3]);
        if (!p1) return `The Start point (${params[1]}) is invalid!`;
        if (!p2) return `The Control point (${params[2]}) is invalid!`;
        if (!p3) return `The End point (${params[3]}) is invalid!`;
        return new Bezier2(p1, p2, p3);

      case "b3":
      case "bezier3":
        // Format of Bezier3: bezier3; (xStart, yStart); (xCtrl1, yCtrl1); (xCtrl2, yCtrl2); (xEnd, yEnd)
        if (params.length < 5) return `Parameters to build Bezier3 are not sufficient!`;
        p1 = this.resolvePointFromExpr(params[1]);
        p2 = this.resolvePointFromExpr(params[2]);
        p3 = this.resolvePointFromExpr(params[3]);
        p4 = this.resolvePointFromExpr(params[4]);
        if (!p1) return `The Start point (${params[1]}) is invalid!`;
        if (!p2) return `The Control Point 1 (${params[2]}) is invalid!`;
        if (!p3) return `The Control Point 2 (${params[3]}) is invalid!`;
        if (!p4) return `The End point (${params[4]}) is invalid!`;
        return new Bezier3(p1, p2, p3, p4);

      case "arc":
        // Possible formats:
        //  - arc; circ1; start_deg; end_deg; ccw | cw
        //  - arc; ell1; start_deg; end_deg; ccw | cw
        //  - arc; pStart; rx; ry; rot_deg; ccw | cw; small | large; pEnd (the cw-mark or largeArc-mark could be interchanged in position)
        //  - arc; pCenter; rx; ry; rot_deg; start_deg, end_deg, ccw | cw;
        if (params.length < 5) return `Parameters to build an Arc are not sufficient!`;
        // Make a function to build arc from Circle/Ellipse
        const buildArcFromEllipse = (
          model: IGeometryModel,
          paramDegStart: string,
          paramDegEnd: string,
          markCW: string,
          ellName: string): EllipticalArc | string =>
        {
          const degStart = this.resolveVarExpr(paramDegStart);
          if (degStart === undefined) return `Start Degree (${paramDegStart}) is invalid!`;
          const degEnd = this.resolveVarExpr(paramDegEnd);
          if (degEnd === undefined) return `End Degree (${paramDegEnd}) is invalid!`;
          const dirMark = markCW.toLowerCase();
          if (dirMark !== "cw" && dirMark !== "ccw") return `The Direction must be specified, either cw or ccw!`;
          const isCW = dirMark === "cw";
          if (model instanceof Circle) {
            return EllipticalArc.fromCircle(model, degStart, degEnd, isCW);
          }
          if (model instanceof Ellipse) {
            return EllipticalArc.fromEllipse(model, degStart, degEnd, isCW);
          }
          return `The Shape (${ellName}) is not a Circle/Ellipse!`;
        }

        // Check if Arc derived from some Circle/Ellipse
        const shape = this.paths.find(s => s.name === params[1]);
        if (shape) {
          if (shape.model &&
              ((shape.model instanceof Circle) || (shape.model instanceof Ellipse))) {
            return buildArcFromEllipse(shape.model, params[2], params[3], params[4], params[1]);
          } else {
            return `Shape [${params[1]}] is not a Circle or an Ellipse!`;
          }
        }
        if (params.length < 8) return `Parameters are insufficient to build an Arc!`;
        // Arc built in parametric way
        p1 = this.resolvePointFromExpr(params[1]);
        rx = this.resolveVarExpr(params[2]);
        ry = this.resolveVarExpr(params[3]);
        deg = this.resolveVarExpr(params[4]);
        if (!p1) return `The Ellipse/Circle Center or Arc Start point must be valid!`;
        if (!rx || rx <= 0) return `RX (${params[2]}) is invalid!`;
        if (!ry || ry <= 0) return `RY (${params[3]}) is invalid!`;
        if (deg === undefined) return `Ellipse/Circle Rotating Degree (${params[3]}) is invalid!`;
        let cwMark: boolean | undefined = undefined;
        let largeArcMark: boolean | undefined = undefined;
        const mark1 = params[5].toLowerCase();
        const mark2 = params[6].toLowerCase();
        if (mark1 === "cw" || mark1 === "ccw") cwMark = mark1 === "cw";
        if (mark2 === "cw" || mark2 === "ccw") cwMark = mark2 === "cw";
        if (mark1 === "large" || mark1 === "small") largeArcMark = mark1 === "large";
        if (mark2 === "large" || mark2 === "small") largeArcMark = mark2 === "large";
        if (cwMark !== undefined && largeArcMark !== undefined) {   // This the parametric design from start/end points
          p2 = this.resolvePointFromExpr(params[7]);
          if (!p2) return `The Arc End point (${params[7]}) is invalid!`;
          if (Point.areIdentical(p1, p2, 4e-3)) return `Arc Point Start (${params[1]}) and End(${params[7]}) are identical, thus cannot make any arc!`;
          const arc = EllipticalArc.fromStartEndPoints(p1, p2, rx, ry, largeArcMark, cwMark, deg);
          if (!arc.auxEllipse) this.warnings.push(`Arc definition '${def}' resolved to no valid Ellipse, thus no arc is resolved!`);
          if (arc.isEnlarged) this.warnings.push(`Arc is enlarged to (Rx:${arc.rx.toFixed(3)}, Ry:${arc.ry.toFixed(3)}), because with the given values(Rx:${rx}, Ry:${ry}) no arc could be solved out.`);
          return arc;
        }
        if (cwMark === undefined && largeArcMark === undefined) {   // In this case, this two parameters should be start/end degrees
          const ell = new Ellipse(p1.x, p1.y, rx, ry, AngDeg.fitDeg(deg));
          return buildArcFromEllipse(ell, params[5], params[6], params[7], params.filter((p, i) => i > 0 && i < 5).join(", "));
        }
        return `Bad configuration to build an Arc!`;

      case "movex":
        // Format is: moveX; pathDefined; dx
        if (params.length < 3) return `Parameters too less to make Path MoveX derivation!`;
        pathReferred = this.paths.find(x => x.name === params[1]);
        if (!pathReferred) return `Shape You referred(${params[1]}) doesn't exist!`;
        dx = this.resolveVarExpr(params[2]);
        if (dx === undefined) return `DX definition '${params[2]}' cannot resolve to a valid number!`;
        pathDerived = pathReferred.model?.moveBy(dx, 0);
        if (!pathDerived) return `'${def}' cannot resolve to valid model/shape/path!`;
        return pathDerived;

      case "movey":
        // Format is: moveY; pathDefined; dy
        if (params.length < 3) return `Parameters too less to make Path MoveY derivation!`;
        pathReferred = this.paths.find(x => x.name === params[1]);
        if (!pathReferred) return `Shape You referred(${params[1]}) doesn't exist!`;
        dy = this.resolveVarExpr(params[2]);
        if (dy === undefined) return `DY definition '${params[2]}' cannot resolve to a valid number!`;
        pathDerived = pathReferred.model?.moveBy(0, dy);
        if (!pathDerived) return `'${def}' cannot resolve to valid model/shape/path!`;
        return pathDerived;

      case "move":
      case "moveby":
        // Format is: moveBy; pathDefined; dx,dy
        if (params.length < 3) return `Parameters too less to make Path MoveBy derivation!`;
        pathReferred = this.paths.find(x => x.name === params[1]);
        if (!pathReferred) return `Shape You referred(${params[1]}) doesn't exist!`;
        pMoveOrAt = this.resolvePointFromExpr(params[2]);
        if (pMoveOrAt === undefined) return `MoveBy definition '${params[2]}' cannot resolve to a valid Point/Offset (dx, dy) like!`;
        pathDerived = pathReferred.model?.moveBy(pMoveOrAt.x, pMoveOrAt.y);
        if (!pathDerived) return `'${def}' cannot resolve to valid model/shape/path!`;
        return pathDerived;

      case "rotate":
      case "rotateby":
        // Format is: rotateBy; pathDefined; rotDeg; at
        if (params.length < 3) return `Parameters too less to make Path Rotate By derivation!`;
        pathReferred = this.paths.find(x => x.name === params[1]);
        if (!pathReferred) return `Shape You referred(${params[1]}) doesn't exist!`;
        rotDeg = this.resolveVarExpr(params[2]);
        if (rotDeg === undefined) return `Rotation Deg (${params[2]}) cannot resolve to a number to make Path-Rotate-By transform!`;
        pMoveOrAt = params[3] ? this.resolvePointFromExpr(params[3]) : undefined;
        if (pMoveOrAt === undefined) this.warnings.push(`When Resolve '${def}': Path Rotate-by will rotate at the center of ORIGIN since no center point specified!`)
        pathDerived = pathReferred.model?.rotateBy(rotDeg, pMoveOrAt);
        if (!pathDerived) return `'${def}' cannot resolve to valid model/shape/path!`;
        return pathDerived;

      case "subof":
        // Format is: subof; pathDefined; pointStart; pointEnd
        if (params.length < 4) return `Parameters too less to make Sub-Shape/Path!`;
        pathReferred = this.paths.find(x => x.name === params[1]);
        if (!pathReferred) return `Shape You referred(${params[1]}) doesn't exist!`;
        if (!pathReferred.path || !PathSegmentedPath.isSegment(pathReferred.path)) return `Only LineSeg/Bezier2/Bezier3/Arc could make sub-shape, '${params[1]}' is not!`;
        p1 = this.resolvePointFromExpr(params[2]);
        p2 = this.resolvePointFromExpr(params[3]);
        if (!p1) return `Start Point (${params[2]}) resolved failed for making Sub-Shape/Path!`;
        if (!p2) return `End Point (${params[3]}) resolved failed for making Sub-Shape/Path!`;
        pathDerived = (pathReferred.path as TPathSeg).makeSubPath(p1, p2);
        if (!pathDerived) return `Make sub path/shape of '${params[1]}' from '${params[2]}' to '${params[3]}' failed!`;
        return pathDerived.auxModel!;

      default:
        return `Shape type ${params[0]} is invalid!`;
    }

  }

  /**
   * The sub function to resolve the input of duplication-to defines
   * @param def The definition string for the duplication
   * @param withLineJoin A switch to determine whether introducing Line Join features, this is specialized for Segged-Path
   *                     Because for basic types, there will be no such issue, it will always be smooth and consistent
   * @returns
   */
  tryAsPathDuplication(def: string, withLineJoin?: boolean): ISvgPath | string | undefined {
    // Format is: dupTo; pathDefined; in/out/right/left; distance
    const params = def.split(";").map(p => p.trim()).filter(p => !!p);
    // If not dupTo, do nothing
    if (params[0].toLowerCase() !== "dupto") return undefined;
    // Continue as dupTo
    if (params.length < 4) return `Parameters too less to make Path Rotate By derivation!`;
    let pathReferred = this.paths.find(x => x.name === params[1]);
    if (!pathReferred) return `The shape You referred(${params[1]}) doesn't exist (when duplicating a shape)!`;
    let dir = params[2].toLowerCase();
    if (!["in", "out", "right", "left"].includes(dir)) return `Direction Keyword (${params[2]}) to duplicate a shape is invalid.`;
    let distance = this.resolveVarExpr(params[3]);
    if (!distance) return `Distance '${params[3]}' is invalid to duplicate a shape, it should be greater than zero!`;
    let lineJoin: string | undefined = undefined;
    if (withLineJoin) {
      lineJoin = params[4];
      if (lineJoin) lineJoin = lineJoin.toLowerCase();
      lineJoin = SvgCsts.LINE_JOINS.includes(lineJoin) ? lineJoin : undefined;
    }
    let pathDuped = pathReferred.path?.duplicateTo(distance, dir as "in" | "out" | "right" | "left", lineJoin as (TSvgLineJoin | undefined));
    if (!pathDuped) return `Failed to duplicate '${pathReferred.name}' with parameters '${dir}' and '${params[3]}'`;
    return pathDuped;
  }

  /**
   * Resolve the shape definitions
   * @param name Name of the shape
   * @param value Presentation to define the shape
   * @returns Error message
   */
  resolveShape(name: string, value: string): string[] {
    // Check Names
    if (this.paths.find(s => s.name === name)) return [`There has already been a shape named as ${name}!`];
    if (this.pathSeries.find(s => s.name === name)) return [`There is some Shape Series which is named as ${name}!`];

    // Try to see if it is duplication of existing shapes
    const dupTo = this.tryAsPathDuplication(value);
    if (typeof dupTo === "string") return [dupTo];
    if (dupTo) {
      const duppedPath = new HuatuPath(dupTo, name);
      // If the duplicated path is singled modelled, then assign the model to path
      if (dupTo.models.length === 1) {
        duppedPath.model = dupTo.models[0];
      }
      this.paths.push(duppedPath);
      this.defines.push(duppedPath);
      return [];
    }

    const model = this.resolveShapeDef(value);
    if (typeof model === "string") return [model];
    const path = HuatuPath.fromModel(model, name);
    this.paths.push(path);
    // Add to Definable
    this.defines.push(path);
    return [];
  }

  tryPointOrPointSeries(def?: string): IPoint[] | undefined {
    if (!def) return undefined;
    const ps = this.pointSeries.find(s => s.name === def);
    if (ps) return ps.points;
    const p = this.resolvePointFromExpr(def);
    if (p) return [p];
    return undefined;
  }

  tryNumberSeries(def?: string): number[] {
    if (!def) return [];
    const range = this.resolveRange(def);
    if (range) return range.numbers;
    else return this.resolveSeparatedNumbers(def);
  }

  resolveShapesFromDef(def: string): IGeometryModel[] | string {
    const params = def.split(";").map(p => p.trim()).filter(p => !!p);
    if (params.length < 3) return `Parameters are too less to build ShapeSeries!`;
    if (this.pathSeries.find(x => x.name ===  params[0])) return `'${params[0]}' is a ShapeSeries, ShapeSeries can only be derived from simple models!`;
    const shapeType = params[0].toLowerCase();

    function extendArray<M>(arr: M[] | M, len: number): M[] {
      if (Array.isArray(arr)) {
        if (arr.length >= len) {
          return arr.filter((x, i) => i < len);
        }
        else {
          for (let i = arr.length; i < len; i++) {
            arr.push(arr[0]);     // Always add with the first element;
          }
          return arr;
        }
      } else {
        return [...Array(len).keys()].map(x => arr);
      }
    }

    function alignParams<T>(...pms: (T[] | T | undefined)[]): {
      arr: T[][]
      len: number
    } | undefined {
      // 1. pick out the undefined the undefined elements in the array and return undefined if array is empty
      let array = pms
        .map(x => {
          if (Array.isArray(x)) {
            const arrDefined = x.filter(y => y !== undefined);
            if (arrDefined.length > 0) return arrDefined;
            else return undefined;
          } else {
            return x;
          }
        });
      // 2. If some of the elements is undefined, then no necessity to continue
      if (array.filter(x => x === undefined).length > 0) return undefined;
      const arrayDefined = array as (T[] | T)[];
      let lens = arrayDefined.map(x => Array.isArray(x) ? x.length : 1).filter(x => x > 1);
      let minArrayLen = lens.length > 0 ? Math.min(...lens) : 1;
      return {
        arr: arrayDefined.map(x =>  extendArray<T>(x, minArrayLen)),
        len: minArrayLen
      };
    }

    const getLineSegMethod = (method?: string) => {
      if (!method || method === "zip" || method === "pair") return "zip";
      if (method === "interleave" || method === "cross")  return "cross";
      return undefined;
    }

    switch (shapeType) {
      case "ln":        // Line, LineSeg
      case "line":        // Line, LineSeg
      case "ls":
      case "lineseg":        // Try first param, to see it if is defined Line
        // Possible Formats of the define string, this can only build LineSegs
        //  - ln/line; lineName; l1(1 to N); l2(1 to N)
        const line = this.paths.find(s => s.name === params[1]);
        if (line) {       // The def is like: line; ln1; l1; l2;
          if (!(line.model instanceof Line)) return `"${params[1]}" is not a Line!`;
          // Guess param2/param3 as range or var number
          let l1s = this.tryNumberSeries(params[2]);
          if (l1s.length < 1) {
            this.warnings.push(`No shape resolved from '${def}'! Length1 is empty!`);
          }
          let l2s = this.tryNumberSeries(params[3]);
          const lens = alignParams<number>(l1s, l2s);
          if (lens) {
            return lens.arr[0].map((x, i) => (line.model as Line).buildSeg(x, lens.arr[1][i]));
          } else {
            return l1s.map(x => (line.model as Line).buildSeg(x));
          }
        }
        // Now we guess the first param is a point series or a single point
        // It might be defining Lines first. Possible formats:
        //  - line;  pointSeries (N points); deg (1 or N) ; l1, l2
        //  - line;  point(1 points); deg (1 or N) ; l1, l2
        //  - line/ls/lineseg;  point(1 points); deg (1 or N)
        //  point and deg will compose line(s), witch  each pair  (l1, l2) to build multiple LineSegs
        //  If no (l1, l2) present, then return lines
        const anchors = this.tryPointOrPointSeries(params[1]);
        if  (anchors) {
          // Check if still point(s) followed, then it is defining line segs
          const lsp2 = this.tryPointOrPointSeries(params[2]);
          if (lsp2) {
            const method = getLineSegMethod(params[3]);
            let segs: LineSeg[];
            if (method === "cross") {
              segs = anchors.map(x => lsp2.map(y => new LineSeg(x, y))).flat();
            } else {
              const lsAligned = alignParams<IPoint>(anchors, lsp2);
              segs = lsAligned
                ? [...Array(lsAligned.len).keys()]
                    .map(i => new LineSeg(lsAligned.arr[0][i], lsAligned.arr[1][i]))
                : [];
            }
            if (segs.length < 1) return `No shaped resolved from '${def}'!`;
            this.infos.push(`${segs.length} lines resolved from '${params.filter((x, i) => i > 0).join("; ")}'`);
            return segs;
          }

          // Check if Line definition(s) followed
          const degs = this.tryNumberSeries(params[2]);
          const lnDegAligned = alignParams<IPoint | number>(anchors, degs);
          const lines = lnDegAligned?.arr[0]
            .map((a, i) => new Line(
              a as IPoint,
              AngDeg.fitDeg((lnDegAligned?.arr[1][i] as number)))
            );
          if (!lines || lines.length < 1) return `No Shape resolved from '${def}'!`;
          const l1s = this.tryNumberSeries(params[3]);
          const l2s = this.tryNumberSeries(params[4]);
          if (l1s.length < 1) {            // l1 is empty
            if (shapeType === "ls" || shapeType === "lineseg") {
              return `By define LineSeg Series, you need to specify lengths after a line!`;
            }
            return `You cannot define Line Series(from '${def}'), which is infinite in length thus cannot be drawn, Please define as LineSeg Series instead!`;
          }
          const linesAligned = l2s.length > 0
            ? alignParams<Line | number>(lines, l1s, l2s)
            : alignParams<Line | number>(lines, l1s);
          if (linesAligned) {
            const segs = (linesAligned.arr[0] as Line[])
              .map((l, i) => l.buildSeg(
                (linesAligned.arr[1] as number[])[i],
                l2s.length > 0 ? (linesAligned.arr[2] as number[])[i] : undefined));
            if (segs.length > 0) {
              this.infos.push(`${segs.length} lines resolved from '${params.filter((x, i) => i > 0).join("; ")}'`);
              return segs;
            }
          } else {
            return `No Shape resolved from '${def}'!`;
          }
        } else {
          return `To define Line(Seg)s, first parameter should be point(s)`;
        }

      case "circ":
      case "circle":
        // Format of a circle define: circle; (x, y); r
        const cs = this.tryPointOrPointSeries(params[1]);
        if (!cs) return `'${params[1]}' cannot resolve to be some point (series)!`;
        let rs = this.tryNumberSeries(params[2]);
        if (rs.length < 1) return `'${params[2]}' cannot resolve to be some radius!`
        const crs = alignParams<IPoint | number>(cs, rs);
        if (!crs) return `Parameters '${params[1]}; ${params[2]}' invalid to resolve Circle Series!`;
        return [...Array(crs.len).keys()]
          .map(i => new Circle(
            (crs.arr[0] as IPoint[])[i].x,
            (crs.arr[0] as IPoint[])[i].y,
            (crs.arr[1] as number[])[i]));

      case "ell":
      case "ellipse":
        // Format of the Ellipse; ellipse; (x, y); rx; ry; deg
        if (params.length < 4) return `Parameters for the Ellipse is insufficient!`;
        const ecs = this.tryPointOrPointSeries(params[1]);
        if (!ecs) `Center Definition '${params[1]}' for Ellipse Series is incorrect!`;
        let rxs = this.tryNumberSeries(params[2]);
        if (rxs.length < 1) `RX definition '${params[2]}' resolved to no values!`;
        let rys = this.tryNumberSeries(params[3]);
        if (rys.length < 1) `RY definition '${params[3]}' resolved to no values!`;
        let degs = params[4] ? this.tryNumberSeries(params[4]) : 0;
        if (Array.isArray(degs) && degs.length < 1) return `Degree Definition '${params[4]}' to build Ellipse Series is incorrect!`;
        const ellParams = alignParams<IPoint | number>(ecs, rxs, rys, degs);
        if (!ellParams) return `Definition '${def}' resolved to no Ellipse Series!`;
        return [...Array(ellParams.len).keys()]
          .map(i => new Ellipse(
            (ellParams.arr[0] as IPoint[])[i].x,
            (ellParams.arr[0] as IPoint[])[i].y,
            (ellParams.arr[1] as number[])[i],
            (ellParams.arr[2] as number[])[i],
            AngDeg.fitDeg((ellParams.arr[3] as number[])[i]))
          );

      case "rect":
      case "rectangle":
        // Format of Rectangle:
        // - rect; bycenter; (x, y); w; h
        // - rect; (x1, y1); (x2, y2)
        // - rect; (x1, y1); w; h
        if (params[1].toLowerCase() === "bycenter" && params.length >= 5) {
          const rcs = this.tryPointOrPointSeries(params[2]);
          if (!rcs || rcs.length < 1) return `No Centers resolved for rects!`;
          const ws = this.tryNumberSeries(params[3]);
          if (ws.length < 1) return `No width resolved from '${params[3]}'!`;
          const hs = this.tryNumberSeries(params[4]);
          if (hs.length < 1) return `No Height resolved from '${params[4]}'!`;
          const rectParams = alignParams<IPoint | number>(rcs, ws, hs);
          if (rectParams) {
            return [...Array(rectParams.len).keys()]
              .map(i => Rect.fromCenterWH(
                (rectParams.arr[0] as IPoint[])[i],
                (rectParams.arr[1] as number[])[i],
                (rectParams.arr[2] as number[])[i])
              );
          }
        } else {
          const p1s = this.tryPointOrPointSeries(params[1]);
          if (!p1s || p1s.length < 1) return `No Point resolved from '${params[1]}'`;
          const p2s = this.tryPointOrPointSeries(params[2]);
          if (p2s) {  // It is made by two points
            const rectParams = alignParams<IPoint>(p1s, p2s);
            if (rectParams) {
              return [...Array(rectParams.len).keys()]
                .map(i => Rect.fromTwoPoints(rectParams.arr[0][i], rectParams.arr[1][i]))
                .filter(x => {
                  if (x) return true;
                  else {
                    this.warnings.push(`Zero-Width/Height Rectangle resolved and discarded!`);
                    return false;
                  }
                }) as Rect[];
            }
          }
          // Now guess it is made by anchor/w/h
          const ws = this.tryNumberSeries(params[2]);
          if (ws.length < 1) return `No width resolved from '${params[2]}'!`;
          const hs = this.tryNumberSeries(params[3]);
          if (hs.length < 1) return `No Height resolved from '${params[3]}'!`;
          const rectParams = alignParams<IPoint | number>(p1s, ws, hs);
          if (rectParams) {
            return [...Array(rectParams.len).keys()]
              .map(i => {
                const pTL = rectParams.arr[0][i] as IPoint;
                const w   = rectParams.arr[1][i] as number;
                const h   = rectParams.arr[2][i] as number;
                return new Rect(pTL.x, pTL.y, w, h);
              });
          }
        }
        // Default return error message
        return `No Rectangle resolved from '${def}'!`;

      case "pln":
      case "pline":
      case "polyline":
        const defPoints = params.filter((p, i) => i > 0)
          .map(p => this.tryPointOrPointSeries(p))
          .filter((p, i) => {
            if (p) return true;
            else {
              this.warnings.push(`${params[i + 1]} resolved to no point(s)!`);
              return false;
            }
          });
        if (defPoints.length < 2) return `Insufficient point(group/series)s to build polyline!`;
        const plnAligned = alignParams<IPoint>(...defPoints);
        if (plnAligned) {
          return [...Array(plnAligned.len).keys()]
            .map(i => new PolyLine(...plnAligned.arr.map(p => p[i])));
        }
        return `No Polyline resolved from given string!`;

      case "tri":
      case "triangle":
        const pA = this.tryPointOrPointSeries(params[1]);
        const pB = this.tryPointOrPointSeries(params[2]);
        const pC = this.tryPointOrPointSeries(params[3]);
        if (!pA) return `Point A definition '${params[1]}' is invalid!`;
        if (!pB) return `Point A definition '${params[2]}' is invalid!`;
        if (!pC) return `Point A definition '${params[3]}' is invalid!`;
        const triAligned = alignParams(pA, pB, pC);
        if (triAligned) {
          const tris = [...Array(triAligned.len).keys()]
            .map(i => new Triangle(
              triAligned.arr[0][i],
              triAligned.arr[1][i],
              triAligned.arr[2][i]))
            .filter(t => t.isValid);
          if (tris.length > 0) return tris;
        }
        return `No triangles resolved from '${def}'!`;

      case "plg":
      case "polygon":
        const plgPoints = params.filter((p, i) => i > 0)
          .map(p => this.tryPointOrPointSeries(p))
          .filter((p, i) => {
            if (p) return true;
            {
              this.warnings.push(`${params[i + 1]} resolved to no point(s)!`);
              return false;
            }
          });
        if (plgPoints.length < 2) return `Insufficient point(group/series)s to build polygon!`;
        const plgAligned = alignParams<IPoint>(...plgPoints);
        if (plgAligned) {
          return [...Array(plgAligned.len).keys()]
            .map(i => new Polygon(...plgAligned.arr.map(p => p[i])));
        }
        return `No Polygon resolved from given string!`;

      case "plgn":
      case "npolygon":
        const Ns = this.tryNumberSeries(params[1])
          .filter(x => Number.isInteger(x) && x >= 3);
        if (Ns.length < 1) return `Please give a integer for N (N >= 3), [${params[1]}] is invalid!`;
        const plgnCs = this.tryPointOrPointSeries(params[2]);
        if (!plgnCs) return `The center(s) specified for Regular Polygon '${params[2]}' is invalid!`;
        const plgnRs = this.tryNumberSeries(params[3]);
        if (plgnRs.length < 1) return `Please specify Radius for Regular Polygon design!`;
        let plgnDegs;
        if (params[4]) {
          plgnDegs = this.tryNumberSeries(params[4]);
          if (plgnDegs.length < 1) return `Start Degrees '${params[4]}' is invalid!`;
        } else {
          plgnDegs = [0];
        }
        const plgnAligned = alignParams<IPoint | number>(Ns, plgnCs, plgnRs, plgnDegs);
        if (plgnAligned) {
          return [...Array(plgnAligned.len).keys()]
            .map(i => Polygon.buildRegularPolygon(
              plgnAligned.arr[0][i] as number,
              plgnAligned.arr[1][i] as IPoint,
              plgnAligned.arr[2][i] as number,
              plgnAligned.arr[3][i] as number,
            ));
        }
        return `No Regular Polygon resolved from '${def}'!`;

      case "b2":
      case "bezier2":
        // Format of Bezier2: bezier2; (xStart, yStart); (xCtrl, yCtrl); (xEnd, yEnd)
        if (params.length < 4) return `Parameters to build Bezier2 are not sufficient!`;
        const b2p1 = this.tryPointOrPointSeries(params[1]);
        const b2p2 = this.tryPointOrPointSeries(params[2]);
        const b2p3 = this.tryPointOrPointSeries(params[3]);
        if (!b2p1) return `The Start point (${params[1]}) is invalid!`;
        if (!b2p2) return `The Control point (${params[2]}) is invalid!`;
        if (!b2p3) return `The End point (${params[3]}) is invalid!`;

        const b2Aligned = alignParams<IPoint>(b2p1, b2p2, b2p3);
        if (b2Aligned) {
          return [...Array(b2Aligned.len).keys()]
            .map(i => new Bezier2(
              b2Aligned.arr[0][i] as IPoint,
              b2Aligned.arr[1][i] as IPoint,
              b2Aligned.arr[2][i] as IPoint,
            ));
        }
        return `No Quadratic Bezier Curve resolved from '${def}'!`;

      case "b3":
      case "bezier3":
        // Format of Bezier3: bezier3; (xStart, yStart); (xCtrl1, yCtrl1); (xCtrl2, yCtrl2); (xEnd, yEnd)
        if (params.length < 5) return `Parameters to build Bezier2 are not sufficient!`;
        const b3p1 = this.tryPointOrPointSeries(params[1]);
        const b3p2 = this.tryPointOrPointSeries(params[2]);
        const b3p3 = this.tryPointOrPointSeries(params[3]);
        const b3p4 = this.tryPointOrPointSeries(params[4]);
        if (!b3p1) return `The Start point (${params[1]}) is invalid!`;
        if (!b3p2) return `The Control point 1 (${params[2]}) is invalid!`;
        if (!b3p3) return `The Control point 2 (${params[3]}) is invalid!`;
        if (!b3p4) return `The End point (${params[4]}) is invalid!`;

        const b3Aligned = alignParams<IPoint>(b3p1, b3p2, b3p3, b3p4);
        if (b3Aligned) {
          return [...Array(b3Aligned.len).keys()]
            .map(i => new Bezier3(
              b3Aligned.arr[0][i] as IPoint,
              b3Aligned.arr[1][i] as IPoint,
              b3Aligned.arr[2][i] as IPoint,
              b3Aligned.arr[3][i] as IPoint,
            ));
        }
        return `No Cubic Bezier Curve resolved from '${def}'!`;

      case "arc":
        // Possible formats:
        //  - arc; circ1; start_deg; end_deg; ccw | cw
        //  - arc; ell1; start_deg; end_deg; ccw | cw
        if (params.length < 5) return `Parameters to build an Arc are not sufficient!`;
        const dirMark = params[4].toLowerCase();
        if (dirMark !== "cw" && dirMark !== "ccw") return `CW/CCW mark not specified!`;
        let arcModels: IGeometryModel[] | undefined;
        let ells = this.pathSeries.find(p => p.name === params[1]);
        if (ells) {
          if (ells.models.length > 0 &&
             (ells.models[0] instanceof Circle || ells.models[0] instanceof Ellipse)) {
            arcModels = ells.models;
          }
        } else {
          let ell = this.paths.find(p => p.name === params[1]);
          if (ell && ell.model &&
              (ell.model instanceof Circle || ell.model instanceof Ellipse)) {
            arcModels = [ell.model];
          }
        }
        if (!ells) return `No Circle/Ellipse (series) by '${params[1]}'`;
        const startDegs = this.tryNumberSeries(params[2]);
        const endDegs = this.tryNumberSeries(params[3]);
        if (startDegs.length < 1) return `Start Degs (${params[2]}) for Arcs are invalid!`;
        if (endDegs.length < 1) return `End Degs (${params[3]}) for Arcs are invalid!`;
        const arcAligned = alignParams<IGeometryModel | number>(arcModels, startDegs, endDegs);
        if (arcAligned) {
          return [...Array(arcAligned.len).keys()]
            .map(i => {
              const model = arcAligned.arr[0][i];
              if (model instanceof Circle) {
                return EllipticalArc.fromCircle(model, arcAligned.arr[1][i] as number, arcAligned.arr[2][i] as number, dirMark === "cw");
              } else if (model instanceof Ellipse) {
                return EllipticalArc.fromEllipse(model, arcAligned.arr[1][i] as number, arcAligned.arr[2][i] as number, dirMark === "cw");
              } else return undefined;
            })
            .filter(x => !!x) as EllipticalArc[];
        }
        return `No Arc(s) resolved from '${def}'!`;

      default:
        return `Shape type ${params[0]} is invalid!`;
    }
  }

  /**
   * Resolve the Shape Series defined
   * @param name Name of the shape series
   * @param value The definition of the series
   * @returns Error message if any
   */
  resolveShapeSeries(name: string, value: string): string[] {
    // Check Names
    if (this.paths.find(s => s.name === name)) return [`There is some shape named as ${name}!`];
    if (this.pathSeries.find(s => s.name === name)) return [`There is already some Shape Series named as ${name}!`];

    const models = this.resolveShapesFromDef(value);
    if (typeof models === "string") return [models];
    if (models.length < 1)  return [`No shape resolved from '${value}' for '${name}'!`];
    const series = HuatuPathSeries.fromModels(models, name);
    this.pathSeries.push(series);
    // Add to Definable
    this.defines.push(series);
    return [];
  }

  getResolvedXPoints(id1: string, id2: string): ISvgPoint[] | undefined {
    const solved = this.solvedXPoints.find(p => (p.path1 === id1 && p.path2 === id2) || (p.path1 === id2 && p.path2 === id1))
    return solved?.points;
  }

  makeXPoints(id1: string, id2: string): IResultResolveXPoints {
    const ifResolved = this.getResolvedXPoints(id1, id2);
    if (ifResolved) return {
      result: "Success",
      errors: [],
      points: ifResolved
    }
    const errors: string[] = [];
    const md1 = this.paths.find(s => s.name === id1),
          md2 = this.paths.find(s => s.name === id2);
    if (!md1) errors.push(`Shape "${id1}" has not been defined!`);
    if (!md2) errors.push(`Shape "${id2}" has not been defined!`);
    if (!md1 || !md2) return {
      result: "Error",
      errors,
      points: []
    }
    if (!md1.path && !md1.model) errors.push(`Shape ${id1} is not well defined!`);
    if (!md2.path && !md2.model) errors.push(`Shape ${id2} is not well defined!`);
    if (errors.length > 0) return {
      result: "Invalid",
      errors: errors,
      points: []
    };

    let xps = (md1.path && md2.path) ? md1.path.models.map(x1 => md2.path!.models.map(x2 => Intersection.getXpoints(x1, x2)).flat()).flat()
      : (md1.path  && md2.model) ? md1.path.models.map(x1 => Intersection.getXpoints(x1, md2.model!)).flat()
      : (md1.model && md2.path ) ? md2.path.models.map(x2 => Intersection.getXpoints(md1.model!, x2)).flat()
      : Intersection.getXpoints(md1.model!, md2.model!);
    xps = Point.deDupPoints(xps);
    // Push to reserve
    this.solvedXPoints.push({
      path1: id1,
      path2: id2,
      points: xps
    });
    // Return the successful result
    return {
      result: "Success",
      errors: [],
      points: xps,
    }
  }

  /**
   * Resolve the Intersection point
   * @param name Name of the intersection point
   * @param value Presentation to resolve the point
   * @returns Error message
   */
  resolveXPoint(name: string, value: string): string[] {
    // Check Name
    if (this.points.find(s => s.name === name)) return [`There has already been a point named as ${name}!`];
    if (this.pointSeries.find(s => s.name === name)) return [`There is some Point Series which is named as ${name}!`];
    const params = value.split(";").map(p => p.trim()).filter(p => !!p);
    if (params.length < 2) return [`To calculate Intersection, you need give two shapes!`];
    const xpRes = this.makeXPoints(params[0], params[1]);
    if (xpRes.result === "Error" || xpRes.result === "Invalid") return xpRes.errors;
    const xp = Intersection.pickPoint(xpRes.points, params[2]);
    if (!xp) return [`No intersection resolved for ${name}!`];
    this.addPoint(new HuatuPoint(xp.x, xp.y, name, "intersection"));
    return [];
  }

  /**
   * Resolve Calculated Point, this normally will get e.g. some point on a circle,
   * center(s) of a triangle, middle point of some line-segment, etc.
   * @param name Name of the Calculated point
   * @param value Presentation to resolve the point, the possible format of the CPoint:
   *  - circle; deg             deg running along the circle, e.g. 'c1;30'
   *  - ellipse; deg            deg running along the ellipse e.g. 'ell1; -90'
   *  - line; l,                l could be any value
   *  - lineseg; t              t in [0, 1]
   *  - bezier2; t              t in [0, 1]
   *  - bezier3; t              t in [0, 1]
   *  - polygon; N; [t]         t-th point on the N-th side, t has the same meaning of lineseg, if t is not present, then N is the N-th vertex
   *  - polyline; N; [t]        t- th point on the N-th seg, t has the same meaning of Lineseg, if t is not  present, then N is the N-th point
   *  - arc; t                  t-th point on the arc, from start angle to end ang, i.e. t=0 means start, and t=1 means end
   *  - triangle; 1/2/3; [t]    t-th point on the 1/2/3-th side, t has the same meaning of lineseg, is t is not present, then it means vertex
   *  - triangle; cIn/cOut      Center of the inner/outer circle
   *  - triangle; cG            Center of gravity
   *  - triangle; A/B/C         1/2/3-th vertex of the triangle
   *  - rectangle; nw/sw/se/ne        nw/sw/se/ne vertex point of the rect
   *  - rectangle; n/w/s/e; t         t-th point on the N/W/S/E side, t has the same meaning of lineseg
   *  - rectangle; nm/wm/sm/em        middle point on N/W/S/E side, easy to see that 'nm' means 'n; 0.5'
   * @returns Error message
   */
  resolveCPoint(name: string, value: string): string[] {
    // Check Name
    if (this.points.find(s => s.name === name)) return [`There has already been a point named as ${name}!`];
    if (this.pointSeries.find(s => s.name === name)) return [`There is some Point Series which is named as ${name}!`];

    const params = value.split(";").map(p => p.trim()).filter(p => !!p);
    if (params.length < 2) return [`To Get a point from model, you need at least two parameters!`];
    const md = this.paths.find(s => s.name === params[0]);
    if (!md || !md.model) return [`Shape "${params[0]}" has not been defined!`];
    const p1num = this.resolveVarExpr(params[1]);       // This is the first parameter, and in most cases, it is enough
    const p2num = params[2] ? this.resolveVarExpr(params[2]) : undefined;
    const p1str = params[1].toLowerCase();              // It is some  dedicated string to specify points, like p1, ne, sw, etc. then use it, in lower case
    const point = p1num === undefined ? md.model.getPoint(p1str, p2num) : md.model.getPoint(p1num, p2num);
    if (point) {
      this.addPoint(new HuatuPoint(point.x, point.y, name, "calculated"));
      return [];
    }
    // Check if find normal point
    if (p1str === "np" && md.path && PathSegmentedPath.isSegment(md.path)) {
      let npT = this.resolveVarExpr(params[2]);
      let npDir = params[3].toLowerCase();
      let npDist = this.resolveVarExpr(params[4]);
      if ( npT !== undefined && WtMath.isIn0and1(npT) &&
          (npDir === "left" || npDir === "right") &&
           npDist !== undefined)
      {
        let np = (md.path as TPathSeg).auxModel?.getNormalPoint(npT, npDist, npDir);
        if (np) {
          this.addPoint(new HuatuPoint(np.x, np.y, name, "calculated"));
          return []
        } else {
          return [`Failed to calculate Normal Point from path '${params[0]}'`]
        }
      } else {
        return [`Parameters incorrect to Calculate Normal Point from path '${params[0]}'`]
      }
    }
    // Default return of error message
    return [`No valid result to calculate CPoint '${name}' from '${value}'`];
  }

  /**
   * A small function to resolve the Range definition input by use
   * @param def The definition string for a range, it should be like 'start|step|end'
   * @returns The resolved range, or undefined if resolve failed
   */
  resolveRange(def?: string): NumberRange | undefined {
    if (!def) return undefined;
    const match = def.match(WT_REGEX.RANGE);
    if (!match) return undefined;
    const valStart = this.resolveVarExpr(match[1].trim()),
          valStep = this.resolveVarExpr(match[2].trim()),
          valEnd = this.resolveVarExpr(match[3].trim());
    if (valStart === undefined) {
      this.warnings.push(`'${match[1]}' is not a valid Range Start!`);
      return undefined;
    }
    if (valStep === undefined) {
      this.warnings.push(`'${match[2]}' is not a valid Range Step!`);
      return undefined;
    }
    if (valEnd === undefined) {
      this.warnings.push(`'${match[3]}' is not a valid Range End!`);
      return undefined;
    }
    const range = new NumberRange(valStart, valStep, valEnd);
    if (WtMath.isZero(range.step)) {
      this.warnings.push(`Range step is zero ([${def}], step is zero, or start == end), will use the only number of [Range Start]!`);
    }
    return range;
  }

  /**
   * Resolve the Point Series definitions
   * @param name Name of the Point Series
   * @param value The definition string of the Point Series, e.g. "circ1; 0 | 15 | 60", which means get the points on
   *              Circle "circ1", with the degrees starting from 0 to 60(not included) with interval of 15.
   *              And we can the format of "0 | 15 | 60" a range
   * The possible formats that could produce point series are:
   *  - p1; p2; p3; p4; ...     Just simple list of defined points
   *  - circle; deg[] or deg_range    Discrete degs or deg range running along the circle, e.g. 'c1;0 | 5 | 50' or 'c1; 0, 23, 33, 44'
   *  - ellipse; deg[] or deg_range   Discrete degs or deg range running along the Ellipse, e.g. 'ell1; 20 | 5 | 180' or 'ell1; 3, 4, 8, 90'
   *  - line; l[] or l_range,         Discrete length collection or a range of length
   *  - lineseg; t[] or t_range       Discrete t's or range of t, t need to be in [0, 1];
   *  - bezier2; t[] or t_range       Discrete t's or range of t, t need to be in [0, 1];
   *  - bezier3; t[] or t_range       Discrete t's or range of t, t need to be in [0, 1];
   *  - polygon; N; t[]               Discrete t's or range of t, on the N-th side of Polygon
   *  - polygon; n1, n2, n3,...       The n-th vertex of the polygon, n1, n2, n3... need to be in [1, N]
   *  - polyline; N; [t]              Discrete t's or range of t, on the N-th segment of Polyline, N needs to be in [1, N-1]
   *  - polyline; n1, n2, n3,...      The n-th point of Polyline, n1, n2, n3... needs to be in [1, N]
   *  - arc; t[] or t_range           Discrete t's or range of t, t need to be in [0, 1];
   *  - triangle; [1/2/3/A/B/C/cIn/cOut/cG]     The 1/2/3/A/B/C/cIn/cOut/cG point of the triangle, in collection
   *  - rectangle; [nw/sw/se/ne/nm/wm/sm/em/n/e/s/w]    nw/sw/se/ne/nm/wm/sm/em/n/e/s/w point of the rect, in collection, same meaning as in CPoint resolving
   *  - rectangle; north/west/south/east; t[] or t_range      t's or range of t points on the N/W/S/E side, t is in [0, 1]
   * @returns Error Message if any
   */
  resolvePointSeries(name: string, value: string): string[] {
    // Check Name
    if (this.points.find(s => s.name === name)) return [`There is a point named as ${name}!`];
    if (this.pointSeries.find(s => s.name === name)) return [`There is already some Point Series named as ${name}!`];

    const makeT = (t: string): string | number => {
      const num = this.resolveVarExpr(t);
      if (num !== undefined) return num;
      return t.toLowerCase();
    }

    const params = value.split(";").map(p => p.trim()).filter(p => !!p);
    if (params.length < 2) return [`To make point series from Model, you need at least two parameters!`];
    // Guess the first param is some Shape series
    const guessShapeSeries =  this.pathSeries.find(ps => ps.name === params[0]);
    if (guessShapeSeries) {
      const posRange = this.resolveRange(params[1]);
      let posVals = posRange ? posRange.numbers : params[1].split(/[,\s]/).map(x => makeT(x));
      const tVals = this.tryNumberSeries(params[2]);
      const pts: ISvgPoint[] = [];
      // Iterate and push to array
      for (let i = 0; i < guessShapeSeries.models.length; i++) {
        const model = guessShapeSeries.models[i];
        for (let j = 0; j < posVals.length; j++) {
          if (tVals.length > 0) {
            for (let k = 0; k < tVals.length; k++) {
              const p = model.getPoint(posVals[j], tVals[k]);
              if (p) pts.push(p);
              else this.warnings.push(`Point not found by specifying '${params[0]}; ${posVals[j]}; ${tVals[k]}' !`)
            }
          } else {
            const p = model.getPoint(posVals[j]);
            if (p) pts.push(p);
            else this.warnings.push(`Point not found by specifying '${params[0]}; ${posVals[j]}' !`)
          }
        }
      }
      if (pts.length < 1) {
        this.warnings.push(`No points Resolved based on Shape Series '${params[0]}'`);
      } else {
        this.pointSeries.push(new HuatuPointSeries(name, ...pts));
      }
      return [];
    }
    // Guess the first parameter is a point, then the whole list should be points
    const p0Point = this.resolvePointFromExpr(params[0]);
    const validPoints: ISvgPoint[] = [];
    if (p0Point) { // The first is a point, so assume the def string is a list of points
      params.forEach((param, i) => {
        const p = this.resolvePointFromExpr(param);
        if (!p) {
          this.warnings.push(`'${param}' cannot be resolved to a point!`);
        } else {
          validPoints.push(p);
        }
      });
    } else {
      // Guess the first param is a model/shape
      const md = this.paths.find(s => s.name === params[0]);
      if (!md) return [`Shape "${params[0]}" has not been defined!`];
      // Check if the pointSeries is calculating intersections
      if (params[1].toLocaleLowerCase() === 'x') {
        if (!params[2]) return [`Model 2 is not presented when resolving intersections!`];
        const xpRes = this.makeXPoints(params[0], params[2]);
        if (xpRes.result === "Error" || xpRes.result === "Invalid") return xpRes.errors;
        if (xpRes.points.length < 1) {
          this.warnings.push(`No points found for Intersections of '${params[0]}' and '${params[2]}'!`);
        } else {
          this.pointSeries.push(new HuatuPointSeries(name, ...xpRes.points));
        }
        return [];
      }
      if (!md.model) return [`Shape "${params[0]}" is not a BASIC SHAPE, cannot make point series from it!`];
      let pointsGot: IPoint[];
      const p1Range = this.resolveRange(params[1]);           // Guess the first parameter as a range
      if (p1Range && p1Range.count() > 0) {
        pointsGot = p1Range.numbers
          .map(t => md.model!.getPoint(t))
          .filter(p => !!p) as IPoint[];
      } else {
        const p1Array = params[1].split(/[,\s/]/).map(x => x.trim()).filter(x => !!x).map(x => makeT(x));
        let ts = this.tryNumberSeries(params[2]);
        if (ts.length > 0) {
          pointsGot = p1Array.map(p1 => ts.map(t => md.model!.getPoint(p1, t)))
            .flat()
            .filter(x => !!x) as IPoint[];
        } else {
          // In this case, all the parameters are not splitted in to two parts, and they should be treated as a flat list of parameter 1
          pointsGot = params.filter((p, i) => i > 0)
            .map(p => p.split(/[,\s]/)
              .map(x => x.trim())
              .filter(x => !!x)
              .map(x => makeT(x)))
            .flat()
            .map(t => md.model!.getPoint(t))
            .filter(x => !!x) as IPoint[];
        }
      }
      validPoints.push(...pointsGot);
    }
    if (validPoints.length < 1) return [`No Point resolved with '${value}'for '${name}' as PointSeries!`];

    this.pointSeries.push(new HuatuPointSeries(name, ...validPoints));
    this.infos.push(`${validPoints.length} points resolved for Point Series '${name}'!`);
    return [];
  }

  /**
   * A shortcut function to resolve a single segment which is one of the compound path.
   * Only the Valid segment types, i.e. LineSeg, Arc, Bezier2 and Bezier3 are accepted
   * as segments
   * @param def The input of the segment
   * @returns The resolved segmented path, or close mark
   */
  resolveSegmentedPath(def: string): ISvgPathSegment | ISvgPathSegment[] | "CLOSE_MARK" | undefined {
    // If the segment definition starts with three dots, it will be parsed as expanded segments from defined models
    if (def.startsWith("...")) {
      def = def.substring(3).trim();
      const posSemiColon = def.indexOf(";");
      const modelName = posSemiColon > 0 ? def.substring(0, posSemiColon).trim() : def;
      const htPath = this.paths.find(x => x.name === modelName);
      if (!htPath) {
        this.warnings.push(`Path Segment [${def}] Failure: "${modelName}" not found!`)
        return undefined;
      } else {
        const params = parseStrIntoKeyValuePair<{radius?: number[], cwOrCcw?: string, reverse?: boolean}>(
          def.substring(posSemiColon),
          {
            keys: [
              ["radius"],
              ["cwOrCcw"],
              ["reverse"]
            ],
            ints: [],
            numbers: [],
            booleans: ["reverse"],
            allowAppend: [],
            qualifiers: {
              "radius": "number[]",
            },
            blindGuess: {
              "cwOrCcw": (x: string) => {
                let xLc = x.toLowerCase();
                if (xLc === "cw" || xLc === "ccw") return xLc;
                else return undefined;
              }
            }
          }
        );
        if (htPath.path instanceof PathTriangle ||
            htPath.path instanceof PathRect ||
            htPath.path instanceof PathPolygon ||
            htPath.path instanceof PathPolyline ||
            htPath.path instanceof PathCircle ||
            htPath.path instanceof PathEllipse)
        {
          return htPath.path.toPathSegments(params.body.radius, params.body.cwOrCcw as any);
        } else if (htPath.path instanceof PathSegmentedPath) {
          return htPath.path.getSegs(params.body.reverse, params.body.radius);
        } else {
          this.warnings.push(`Path Segment [${def}] Failure: "${modelName}" is a type that not allowed to be expanded!`);
          return undefined;
        }
      }
    }

    // Check if duplicating operation
    if (/\s*(dupTo)\s*;.*/i.test(def)) {
      let dupped = this.tryAsPathDuplication(def, true);
      if (typeof dupped === "string") {
        this.warnings.push(dupped);
        return undefined;
      }
      if (dupped) {
        if (PathSegmentedPath.isSegment(dupped)) return dupped as TPathSeg;
        if (dupped instanceof PathSegmentedPath) return dupped.segments;
      }
      this.warnings.push(`Cannot make duplicated path(seg)s by '${def}'!`);
      return undefined;
    }

    // Treat as Segment Definitions
    const params = def.split(";").map(x => x.trim()).filter(x => !!x);
    if (params[0].toLowerCase() === "close") return "CLOSE_MARK";
    const definedModel = this.paths.find(s => s.name === params[0]);
    const isReverse = !!definedModel && !!params[1] && params[1].toLowerCase() === "reverse";
    const model = definedModel ? definedModel.model : this.resolveShapeDef(def);
    if (typeof model === "string" || !model) {
      this.warnings.push(`Path Segment [${def}] Failure: "${model}"!`);
      return undefined;
    };
    const path = PathSegmentedPath.fromModel(model);
    return isReverse ? path?.reverse() : path;
  }

  tryPathTransform(def: string, name?: string): HuatuPath | undefined {
    const params = def.split(";").map(x => x.trim()).filter(x => !!x);
    if (params.length < 3) return undefined;
    const path = this.paths.find(x => x.name === params[1]);
    if (!path) return undefined;
    const transType = params[0].toLowerCase();
    if (transType === "movex") {
      const dx = this.resolveVarExpr(params[2]);
      return dx !== undefined ? path.moveBy(dx, 0, name) : undefined;
    } else if (transType === "movey") {
      const dy = this.resolveVarExpr(params[2]);
      return dy !== undefined ? path.moveBy(0, dy, name) : undefined;
    } else if (transType === "moveby" || transType === "move") {
      const pt = this.resolvePointFromExpr(params[2]);
      return pt !== undefined ? path.moveBy(pt.x, pt.y, name) : undefined;
    } else if (transType === "rotate" || transType === "rotateby") {
      const deg = this.resolveVarExpr(params[2]);
      const at = params[3] ? this.resolvePointFromExpr(params[3]) : undefined;
      return deg === undefined ? undefined : path.rotateBy(deg, at, name);
    } else {
      return undefined;
    }
  }

  /**
   * Resolve Path definition, the input might be a string, or string array
   * @param name Name of the Calculated point
   * @param value Presentation to resolve the path
   * @returns Error message
   */
  resolvePath(name: string, value: string | string[]): string[] {
    // Check Name
    if (this.paths.find(s => s.name === name)) return [`There has already been a Path named as ${name}!`];
    if (this.pathSeries.find(s => s.name === name)) return [`There is some Path Series named as ${name}!`];
    // Check if modeled path, the value is the model name if true
    if (typeof value === "string") {
      let path: HuatuPath | undefined = this.tryPathTransform(value, name);
      if (!path) {
        const tryAsSegPath = this.resolveSegmentedPath(value);
        if (!tryAsSegPath) {
          const model = this.resolveShapeDef(value);
          if (typeof model === "string") return [`Shape (${value}) resolving failed: ${model}`];
          path = HuatuPath.fromModel(model, name);
        } else {
          if (tryAsSegPath === "CLOSE_MARK") return [`You cannot define a path by just a 'close' mark!`];
          const segPath = new PathSegmentedPath();
          if (Array.isArray(tryAsSegPath)) {
            segPath.addSeg(...tryAsSegPath);
          } else {
            segPath.addSeg(tryAsSegPath);
          }
          path = new HuatuPath(segPath, name);
        }
      }
      this.paths.push(path);
      // Add to Definable
      this.defines.push(path);
      return [];        // Resolved if model matched
    }

    // It should be treated as Segmented path with each list item as one segment
    // If some path consisting of multiple Line(seg)s, then please organize it in the way of
    // Segmented Path, i.e. write it in a list
    const path = new PathSegmentedPath();
    const models = value.map(s => this.resolveSegmentedPath(s))
      .filter(m => !!m) as (ISvgPathSegment | ISvgPathSegment[] | "CLOSE_MARK")[];
    for (let idx = 0; idx < models.length; idx++) {
      const seg = models[idx];
      if (typeof seg === "string") {
        if (seg === "CLOSE_MARK" && path.segments.length > 0) {
          path.segments[path.segments.length - 1].closePath = true;
        }
      } else {
        if (Array.isArray(seg)) {
          path.addSeg(...seg);
        } else {
          path.addSeg(seg);
        }
      }
    }
    if (path.segments.length < 1) return [`No path segment(s) resolved for (${name})!`];
    const segPath = new HuatuPath(path, name);
    this.paths.push(segPath);
    // Add to Definable
    this.defines.push(segPath);
    return [];
  }

  /**
   * Check if the user has given a valid string to specify the pattern, if it is a name for "predefined"
   * pattern, then the pattern will be copied into the in-use collection with the same name. Or it
   * needs to be some pattern defined by user manually.
   * @param ptn The defined name or pre-defined name for the Pattern user wants to use
   * @returns The Pattern or undefined if not found
   */
  checkPattern(ptn: string): HuatuPattern | undefined {
    if (!ptn) return undefined;
    const tryPattern = this.patterns.find(p => p.name === ptn);
    if (tryPattern) {
      tryPattern.refCount++;
      return tryPattern;
    }
    const sysPattern = predefinedPatterns[ptn];
    if (sysPattern) {
      const pattern = new HuatuPattern(ptn, sysPattern);
      this.patterns.push(pattern);
      pattern.refCount++;
      this.defines.push(pattern);
      return pattern;
    }
    return undefined;
  }

  /**
   * Check if the user has given a valid string to specify the marker, if it is a name for "predefined"
   * marker, then the marker will be copied into the in-use collection with the same name. Or it
   * needs to be some marker defined by user manually.
   * @param mkr The defined name or pre-defined name for the Marker user wants to use
   * @returns The Marker or undefined if not found
   */
  checkMarker(mkr: string): HuatuMarker | undefined {
    if (!mkr) return undefined;
    const tryMarker = this.markers.find(p => p.name === mkr);
    if (tryMarker) {
      tryMarker.refCount++;
      return tryMarker;
    }
    const sysMarker = predefinedMarkers[mkr];
    if (sysMarker) {
      const marker = new HuatuMarker(mkr, sysMarker);
      this.markers.push(marker);
      marker.refCount++;
      this.defines.push(marker);
      return marker;
    }
    return undefined;
  }

  parseStyleFromKeyValueResults(parseRes: IKeyValueParsingResult<IHuatuDrawingParams>): HuatuStyle {
    const params = parseRes.body;
    // Handle Orphans
    const realOrphans: string[] = [];
    parseRes.orphans.forEach(orphan => {
      const sty = this.styles.find(x => x.name === orphan);
      if (sty) {
        if (params.styles) params.styles += `,${orphan}`;
        else params.styles = orphan;
      } else {
        realOrphans.push(orphan);
      }
    })
    realOrphans.push(...parseRes.unluckyOrphans);
    if (realOrphans.length > 0) {
      this.warnings.push(`Options [${realOrphans.map(x => `"${x}"`).join(",")}] cannot be resolved to make a drawing style!`)
    }
    const failedPairs = [...parseRes.failedPairs];
    // Handle Sub Keys
    let paramFill: IHuatuStyleFillParams = {},
        paramStroke: IHuatuStyleStrokeParams = {},
        paramMarker: IHuatuStyleMarkerParams = {};
    if (parseRes.subKeys && parseRes.subKeys["fill"]) {
      let subRes = parseRes.subKeys["fill"];
      assignOnlyDefined(paramFill, subRes.body);
      if (subRes.orphans.length > 0) {
        this.warnings.push(`Options [${subRes.orphans.map(x => `"${x}"`).join(",")}] cannot be resolved to make 'Fill' attributes!`);
      }
      failedPairs.push(...subRes.failedPairs);
    }
    if (parseRes.subKeys && parseRes.subKeys["stroke"]) {
      let subRes = parseRes.subKeys["stroke"];
      assignOnlyDefined(paramStroke, subRes.body);
      if (subRes.unluckyOrphans.length > 0) {
        subRes.unluckyOrphans.forEach(x => {
          if (x === "round" && !paramStroke.lineJoin) {
            paramStroke.lineJoin = "round";
          } else {
            subRes.orphans.push(x);
          }
        })
      }
      if (subRes.orphans.length > 0) {
        const realStrokeOrphans: string[] = [];
        for (let i = 0; i < subRes.orphans.length; i++) {
          if (!paramStroke.width) {
            let tryWidth = this.resolveVarExpr(subRes.orphans[i]);
            if (tryWidth !== undefined && tryWidth > 0) {
              paramStroke.width = tryWidth;
            }
          } else {
            realStrokeOrphans.push(subRes.orphans[i]);
          }
        }
        if (realStrokeOrphans.length > 0) {
          this.warnings.push(`Options [${realStrokeOrphans.map(x => `"${x}"`).join(",")}] cannot be resolved to make 'Stroke' attributes!`);
        }
      }
      failedPairs.push(...subRes.failedPairs);
    }
    if (parseRes.subKeys && parseRes.subKeys["marker"]) {
      let subRes = parseRes.subKeys["marker"];
      assignOnlyDefined(paramMarker, subRes.body);
      let i = 0;
      while (subRes.orphans.length > 0 && i < 3) {
        if (!paramMarker.end) {
          paramMarker.end = subRes.orphans.shift();
        }
        else if (!paramMarker.start) {
          paramMarker.start = subRes.orphans.shift();
        }
        else if (!paramMarker.mid) {
          paramMarker.mid = subRes.orphans.shift();
        }
        i++;
      }
      if (subRes.orphans.length > 0) {
        this.warnings.push(`Options [${subRes.orphans.map(x => `"${x}"`).join(",")}] cannot be resolved to make 'Marker' attributes!`);
      }
      failedPairs.push(...subRes.failedPairs);
    }
    failedPairs.forEach(x => this.warnings.push(`['${x.key}': '${x.value}'] are not valid for Style Design!`));

    // Now pick the attributes in the results to build a style
    const style = new HuatuStyle();
    if (params.styles) {
      const styles = params.styles
        .split(/[,\s]/)
        .map(x => x.trim())
        .filter(x => !!x)
        .map(x => {
          const sty = this.styles.find(s => s.name === x);
          if (!sty) this.warnings.push(`Style '${x}' is not defined, or it is not a style!`);
          return sty;
        })
        .filter(x => !!x);
      if (styles.length > 0) style.refStyles.push(...styles as HuatuStyle[]);
    }
    if (params.fillColor) style.fillColor = params.fillColor;
    else if (paramFill.color) style.fillColor = paramFill.color;
    if (params.fillOpacity) style.fillOpacity = fitNumInRange(params.fillOpacity, 0, 1);
    else if (paramFill.opacity) style.fillOpacity = fitNumInRange(paramFill.opacity, 0, 1);
    if (params.pattern) {
      const ptn = this.checkPattern(params.pattern);
      if (ptn) style.fillPattern = ptn;
      else this.warnings.push(`'${params.pattern}' is not a pattern!`);
    } else if (paramFill.pattern) {
      const ptn = this.checkPattern(paramFill.pattern);
      if (ptn) style.fillPattern = ptn;
      else this.warnings.push(`'${paramFill.pattern}' is not a pattern!`);
    }
    if (params.fillRule) style.fillRule = params.fillRule as any;
    else if (paramFill.rule) style.fillRule = paramFill.rule as any;
    if (params.gradient) {
      style.fillGradient = params.gradient;
      // TODO: add when Gradient implemented
    } else if (paramFill.gradient) {
      style.fillGradient = paramFill.gradient;
      // TODO: add when gradient implemented
    }

    if (params.strokeColor) style.strokeColor = params.strokeColor;
    else if (paramStroke.color) style.strokeColor = paramStroke.color;
    if (params.strokeWidth) style.strokeWidth = params.strokeWidth;
    else if (paramStroke.width) style.strokeWidth = paramStroke.width;
    if (params.strokeOpacity) style.strokeOpacity = params.strokeOpacity;
    else if (paramStroke.opacity) style.strokeOpacity = paramStroke.opacity;
    if (params.lineCap) style.strokeLineCap = params.lineCap as any;
    else if (paramStroke.lineCap) style.strokeLineCap = paramStroke.lineCap as any;
    if (params.lineJoin) style.strokeLineJoin = params.lineJoin as any;
    else if (paramStroke.lineJoin) style.strokeLineJoin = paramStroke.lineJoin as any;
    if (params.dashArray && params.dashArray.length > 0) style.strokeDashArray = params.dashArray;
    else if (paramStroke.dashArray && paramStroke.dashArray.length > 0) style.strokeDashArray = paramStroke.dashArray;
    if (params.dashOffset) style.strokeDashOffset = params.dashOffset;
    else if (paramStroke.dashOffset) style.strokeDashOffset = paramStroke.dashOffset;
    let mkrId: string | undefined;
    mkrId = paramMarker.start ? paramMarker.start
      : params.markerStart ? params.markerStart
      : undefined;
    if (mkrId) {
      const mkr = this.checkMarker(mkrId);
      if (mkr) style.markerStart = mkr;
      else this.warnings.push(`Marker '${mkrId}' is not a marker!`)
    }
    mkrId = paramMarker.mid ? paramMarker.mid
      : params.markerMid ? params.markerMid
      : undefined;
    if (mkrId) {
      const mkr = this.checkMarker(mkrId);
      if (mkr) style.markerMid = mkr;
      else this.warnings.push(`Marker '${mkrId}' is not a marker!`)
    }
    mkrId = paramMarker.end ? paramMarker.end
      : params.markerEnd ? params.markerEnd
      : undefined;
    if (mkrId) {
      const mkr = this.checkMarker(mkrId);
      if (mkr) style.markerEnd = mkr;
      else this.warnings.push(`Marker '${mkrId}' is not a marker!`)
    }

    if (params.clip) {
      let clip = this.clips.find(c => c.name === params.clip);
      if (clip) {
        style.clipPath = clip;
        clip.refCount++;
      }
    }
    // Handle global opacity var `opaque`
    if (params.opaque && WtMath.isIn0and1(params.opaque)) {
      if (style.fillOpacity === undefined) style.fillOpacity = params.opaque;
      if (style.strokeOpacity === undefined) style.strokeOpacity = params.opaque;
    }

    return style;
  }

  /**
   * Resolve Style definition, the input might be a string, or a style object
   * @param name Name of the style
   * @param value Presentation to resolve the style
   * @returns Error message
   */
  resolveStyle(name: string, value: string | IHuatuYmlStyle): string[] {
    const parseRes = parseStrIntoKeyValuePair<IHuatuStyleParams>(value, HuatuStyle.optsStyle);
    const style = this.parseStyleFromKeyValueResults(parseRes);
    style.name = name;
    style.copyRefAttrs();
    // TODO: Mask will not be included
    this.styles.push(style);
    return [];
  }

  /**
   * The entry function to resolve a LabelStyle defined
   * @param name Name of the LabelStyle defined
   * @param value The definition string/object for the LabelStyle
   * @returns Error message if any
   */
  resolveLabelStyle(name: string, value: string | IHuatuYmlLabelStyle): string[] {
    const optsLabelStyle: IKeyValueOptions = {
      keys: [
        ["refs", "styles", "style", "ref"],
        ["textAlign", "align"],
        ["bold"],
        ["italic"],
        ["addLine", "line"],
        ["fontName", "font"],
        ["color", "fontColor"],
        ["fontSize", "size", "fs"],
      ],
      booleans: ["bold", "italic"],
      ints: [],
      numbers: [
        "fontSize", "size", "fs",
      ],
      allowAppend: ["refs", "styles", "style", "ref"],     // In the case that the user might split the ref styles in separate parameters
      qualifiers: {
        "color": isValidColor,
        "fontColor": isValidColor,
        "textAlign": HuatuLabelStyle.TEXT_ALIGNS,
        "align": HuatuLabelStyle.TEXT_ALIGNS,
        "addLine": HuatuLabelStyle.DECORATION_LINES,
        "line": HuatuLabelStyle.DECORATION_LINES,
      },
      blindGuess: {
        "textAlign": HuatuLabelStyle.TEXT_ALIGNS,
        "addLine": [
          "over", "overline",
          "under", "underline",
          "middleline", "through", "strike-through", "strikethrough"
        ],
        "fontName": HuatuLabelStyle.PREDEFINED_FONT_NAMES,
        "color": isValidColor,
      }
    }
    let res: IKeyValueParsingResult<IHuatuLabelParams>;
    let lsParams: IHuatuLabelStyleParams;
    if (typeof value === "string") {
      res = parseStrIntoKeyValuePair<IHuatuLabelParams>(value, optsLabelStyle);
      lsParams = res.body;
      const realOrphans: string[] = [];
      res.orphans.forEach(orphan => {
        let orphanAdopted = false;
        if (this.labelStyles.find(x => x.name === orphan)) {
          lsParams.refs = lsParams.refs ? orphan : (lsParams.refs + `, ${orphan}`);
          orphanAdopted = true;
        }
        if (!orphanAdopted) {
          let fsStr = /^([1-9]\d*)p[xt]$/i.exec(orphan);
          if (fsStr && !lsParams.fontSize) {
            lsParams.fontSize = parseFloat(fsStr[1]);
            orphanAdopted = true;
          }
        }
        if (!orphanAdopted) {
          realOrphans.push(orphan);
        }
      });
      if (realOrphans.length > 0) {
        const orphans = realOrphans.map(x => `'${x}'`).join(", ");
        this.warnings.push(`[Resolving Label Style '${name}']: ${orphans} could not be resolved!`);
      }
    } else {
      res = parseStrIntoKeyValuePair(value, optsLabelStyle);
      lsParams = res.body;
      res.failedPairs.forEach(p => {
        this.warnings.push(`[Resolving Label Style '${name}']: {'${p.key}': '${p.value}'} could not be understood!`);
      })
    }

    const lblStyle = new HuatuLabelStyle(name);
    if (lsParams.refs) {
      lsParams.refs.split(/[,\s]/i)
        .map(x => x.trim())
        .filter(x => !!x)
        .forEach(x => {
          const sty = this.labelStyles.find(s => s.name === x);
          if (sty) {
            if (!lblStyle.refStyles.find(s => s === sty)) {
              lblStyle.refStyles.push(sty);
            } else {
              this.warnings.push(`[Resolving Label Style]: Style '${x}' has been already added to the label!`);
            }
          } else {
            this.warnings.push(`[Resolving Label Style]: '${x}' is not a valid defined Label Style!`);
          }
        });
    }
    if (lsParams.textAlign) lblStyle.textAlign = lsParams.textAlign;
    if (lsParams.color) lblStyle.color = lsParams.color;
    if (lsParams.fontName) lblStyle.font = lsParams.fontName;
    if (lsParams.bold !== undefined) lblStyle.bold = lsParams.bold;
    if (lsParams.italic !== undefined) lblStyle.italic = lsParams.italic;
    if (lsParams.addLine) lblStyle.addLine = lsParams.addLine;
    if (lsParams.fontSize) lblStyle.fontSize = lsParams.fontSize;
    if (lsParams.lineHeight) lblStyle.lineHeight = lsParams.lineHeight;
    this.labelStyles.push(lblStyle);
    return [];
  }

  /**
   * Resolve Symbol definition, the input might be a string, or a string list
   * @param name Name of the Symbol
   * @param value Presentation to resolve the symbol
   * @returns Error message
   */
  resolveSymbol(name: string, value: string | string[]): string[] {
    // Check Name
    const nameError = this.isDrawingNameValid(name, "Symbol");
    if (nameError) return [nameError];
    // A symbol will accept path/pathSeries and symbol
    const allowedTypes = ["path", "pathSeries", "symbol"];
    // If it is only one line, i.d. the symbol has only one definition, We assume that it is the shape it contains
    if (typeof value === "string") {
      const item = this.resolveAsDrawingItem(value, allowedTypes);
      if (typeof item === "string") return [item];      // Return the error message
      const symbol = new HuatuSymbol(name);
      symbol.addElement(item);
      this.defines.push(symbol);     // Add to Definable
      this.symbols.push(symbol);
      return [];
    }
    // If the definition is a list, we assume that it contains multiple drawing definitions for the Symbol
    const errs: string[] = [];
    const symbol = new HuatuSymbol(name);
    for (let i = 0; i < value.length; i++) {
      const def = value[i];
      // Check if Desc
      const tryDesc = WtHuatu.tryDesc(def);
      if (tryDesc) {
        symbol.desc = tryDesc;
        continue;
      }
      // Check if ViewBox
      const tryViewBox = this.tryViewBox(def);
      if (typeof tryViewBox === "string") errs.push(tryViewBox);
      else if (tryViewBox instanceof SvgBBox) {
        symbol.viewBox = tryViewBox;
      } else {
        // Assume it is some drawing item
        const item = this.resolveAsDrawingItem(def, allowedTypes);
        if (typeof item === "string") errs.push(item);
        else symbol.addElement(item);
      }
    }
    this.defines.push(symbol);     // Add to Definable
    this.symbols.push(symbol);
    // Return the errors when resolving
    return errs;
  }

  /**
   * A tool function to convert the user-defined radius-/scale-function into Function
   * and check if the function could produce valid result, which should be positive number.
   * @param funcDef The definition of the function, e.g. 'x => (x + 2)*1.5
   * @param paramCount How many inputs the function will take, normally, 1 or 2
   * @returns The function or undefined
   */
  testUserFunc(funcDef: string, paramCount: number): IUserFuncResult | undefined {
    let userFunc = HuatuUserFunc.testFunc(funcDef);
    if (userFunc && userFunc.paramCount === paramCount) return userFunc;
    return undefined;
  }

  /**
   * Resolve Array definition, the input might be a string, or the object describing the array
   * @param name Name of the Array
   * @param value Presentation to resolve the array, shortcut string, or the object
   * @returns Error message
   */
  resolveArray(name: string, value: string | IHuatuYmlSymbolArray): string[] {
    // Check Name
    const nameError = this.isDrawingNameValid(name, "Block");   // Symbol array actually some group/block
    if (nameError) return [nameError];
    const parseRes = parseStrIntoKeyValuePair<IHuatuSymbolArrayParams>(value, HuatuSymbolArray.optsSymbolArray);
    const param = parseRes.body;
    let symbol: HuatuSymbol | undefined;
    const realOrphans: string[] = [];
    if (parseRes.failedPairs.length > 0) {
      const pairs = parseRes.failedPairs.map(x => `[${x.key}: ${x.value}]`).join(",");
      this.warnings.push(`${pairs} are not valid to design a Symbol Array!`);
    }
    if (parseRes.unluckyOrphans.length > 0) {
      this.warnings.push(`${parseRes.unluckyOrphans.map(x => `'${x}`).join(",")} might be repeating to build a Symbol Array!`);
    }
    parseRes.orphans.forEach(orphan => {
      const lcOrphan = orphan.toLowerCase();
      // Try if a symbol
      const sym = this.symbols.find(x => x.name === orphan);
      if (sym) {
        if (!symbol) symbol = sym;
        else this.warnings.push(`[Symbol Array resolving]: Symbol already set, '${orphan}' will be discarded!`);
      }
      // Try if a Point
      else if (this.resolvePointFromExpr(orphan)) {
        if (!param.startPoint) param.startPoint = orphan;
        else if (!param.center) param.center = orphan;
        else realOrphans.push(orphan);
      }
      // Try if method in Upcase
      else if (!param.method && HuatuSymbolArray.METHODS.includes(lcOrphan)) {
        param.method = lcOrphan;
      } else {
        realOrphans.push(orphan);
      }
    });
    if (!param.method) return [`Arraying Method should be specified to build a Symbol Array!`];
    if (!param.symbol && !symbol) return [`Symbol should be specified when building a Symbol Array!`];
    if (param.symbol) {
      const sym = this.symbols.find(x => x.name === param.symbol);
      if (sym) symbol = sym;
      else if (!symbol) return [`'${param.symbol}' is not a valid Symbol!`];
    }
    if (realOrphans.length > 0) {
      this.warnings.push(`${realOrphans.map(x => `'${x}'`).join(",")} are not valid to build a Symbol Array!`);
    }
    // Now assign the params to build an array
    const pStr = param.startPoint || param.center
    if (!pStr) return [`For Symbol Array, Start/Center Point must be specified!`];
    const point = this.resolvePointFromExpr(pStr);
    if (!point) return [`Start Point '${pStr}' could not be resolved into a point!`];
    let array = new HuatuSymbolArray(name, symbol!, param.desc);
    if (param.alignCenter) array.alignCenter = param.alignCenter;
    let count = 1;
    if (param.count) count = param.count;
    if (param.method === "line" || param.method === "2d") {
      let dx: number | undefined,
          dy: number | undefined,
          rotDeg: number | undefined;
      if (param.deltaX) {
        let tryVar = this.resolveVarExpr(param.deltaX);
        if (tryVar) dx = tryVar;
      }
      if (param.deltaY) {
        let tryVar = this.resolveVarExpr(param.deltaY);
        if (tryVar) dy = tryVar;
      }
      if (param.rotDeg) {
        let deg = this.resolveVarExpr(param.rotDeg);
        if (deg) rotDeg = deg;
      }
      if(param.method === "line") {
        let scale: number | IUserFuncResult | undefined;
        if (param.scale) {
          const scaleFunc = this.testUserFunc(param.scale, 1);
          if (scaleFunc) scale = scaleFunc;
          else {
            const tryNum = this.resolveVarExpr(param.scale);
            if (tryNum) scale = tryNum;
            else return [`The Scale '${param.scale}' cannot be resolved!`];
          }
        }
        array.configLine(point, count, dx, dy, scale, rotDeg);
      } else {
        let countX = 1,
            countY = 1;
        if (param.countX) countX = param.countX;
        if (param.countY) countY = param.countY;
        let scale: number | IUserFuncResult | undefined;
        if (param.scale) {
          const scaleFunc = this.testUserFunc(param.scale, 2);
          if (scaleFunc) scale = scaleFunc;
          else {
            const tryNum = this.resolveVarExpr(param.scale);
            if (tryNum) scale = tryNum;
            else return [`The Scale '${param.scale}' cannot be resolved!`];
          }
        }
        array.config2D(point, countX, countY, dx, dy, scale, rotDeg);
      }
    } else {      // This is polar
      let radius: number | IUserFuncResult | undefined,
          scale: number | IUserFuncResult | undefined,
          startDeg: number | undefined,
          deltaDeg: number | undefined;
      if (param.radius) {
        const radiusFunc = this.testUserFunc(param.radius, 1);
        if (radiusFunc) radius = radiusFunc;
        else {
          const tryNum = this.resolveVarExpr(param.radius);
          if (tryNum) radius = tryNum;
          else return [`The Radius '${param.radius}' cannot be resolved!`];
        }
      } else {
        radius = symbol!.bbox.h * 10;      // Make the default radius if not specified
        this.warnings.push(`No Radius specified for Symbol Array, will use default, which is 10x Symbol BBOX height!`);
      }
      if (param.scale) {
        const scaleFunc = this.testUserFunc(param.scale, 1);
        if (scaleFunc) scale = scaleFunc;
        else {
          const tryNum = this.resolveVarExpr(param.scale);
          if (tryNum && tryNum > 0) scale = tryNum;
          else return [`Scale definition '${param.scale}' resolves to no result!`];
        }
      }
      if (param.startDeg) {
        let tryDeg = this.resolveVarExpr(param.startDeg);
        if (tryDeg) startDeg = tryDeg;
      }
      if (param.deltaDeg) {
        let tryDeg = this.resolveVarExpr(param.deltaDeg);
        if (tryDeg) deltaDeg = tryDeg;
      }
      array.configPolar(count, point, radius, scale, startDeg, deltaDeg, param.notRotate);
    }
    this.arrays.push(array);
    return [];
  }

  /**
   * Resolve Clip Path definition, the input might be a string, or a string list
   * @param name Name of the Clip Path
   * @param value Presentation to resolve the clip path
   * @returns Error message
   */
  resolveClip(name: string, value: string | string[]): string[] {
    // Check Name
    if (this.clips.find(c => c.name === name)) return [`Clip '${name}' has already been defined, please choose another name!`];
    const resolveClipPath = (def: string): IGeometryModel[] | string => {
      const matchClipRule = def.match(/^(clip-)?rule[\s]*[,;\s][\s]*(nonzero|evenodd)$/i);
      if (matchClipRule) return matchClipRule[2];
      const tryPath = this.paths.find(p => p.name === def);
      if (tryPath && tryPath.model) return [tryPath.model];
      const tryPathSeries = this.pathSeries.find(ps => ps.name === def);
      if (tryPathSeries && tryPathSeries.models.length > 0) return tryPathSeries.models;
      const resolvedShape = this.resolveShapeDef(def);
      if (typeof resolvedShape === "string") return resolvedShape;
      else return [resolvedShape];
    }
    const defs = typeof value === "string"
      ? [value]
      : value;
    const errs: string[] = [];
    const models: IGeometryModel[] = [];
    let clipRule: "nonzero" | "evenodd" | undefined;
    defs.map(d => resolveClipPath(d.trim()))
      .forEach(x => {
        if (typeof x === "string") {
          let xlc = x.toLowerCase();
          if (xlc === "nonzero" || xlc === "evenodd") {
            clipRule = xlc;
          } else errs.push(x)
        }
        else models.push(...x);
      });
    if (models.length > 0) {
      const paths = models.map(m => HuatuPath.model2Path(m))
        .filter(p => p !== undefined) as ISvgPath[];
      if (paths.length !== models.length) this.warnings.push(`Some Model to path conversion failed when resolving clip path '${name}'!`);
      if (paths.length < 1) errs.push(`No Path resolved for clip '${name}'!`);
      const clip = new HuatuClipPath(name, paths);
      if (clipRule) clip.clipRule = clipRule;
      this.defines.push(clip);
      this.clips.push(clip);
    }
    // Return the errors when resolving
    return errs;
  }

  /**
   * Resolve Pattern definition, the input might be an object, describe how the pattern is designed
   * @param name Name of the Pattern
   * @param value Presentation to resolve the pattern
   * @returns Error message
   */
  resolvePattern(name: string, value: string | IHuatuYmlPattern): string[] {
    // Check name duplicating
    if (this.patterns.find(p => p.name === name)) return [`Pattern '${name}' has already been defined!`];
    const opts: IKeyValueOptions = {
      keys: [
        ["type"],
        ["lineDensity", "density", "dotsDensity", "squareDensity"],
        ["rotDeg", "deg", "lineDeg"],
        ["lineWeight", "lineWidth"],
        ["lineStyle", "style"],
        ["dashDensity", "dashedDensity", "dottedDensity"],
        ["size"],
        ["color"],
        ["opacity"],
        ["bgColor", "background"],
        ["bgOpacity"],
        ["sparseK"]
      ],
      allowAppend: [],
      booleans: [],
      numbers: [
        "lineDensity", "density", "dotsDensity", "squareDensity",
        "rotDeg", "deg", "lineDeg",
        "lineWeight", "lineWidth",
        "dashDensity", "dashedDensity", "dottedDensity",
        "size",
        "opacity",
        "bgOpacity",
        "sparseK",
      ],
      ints: [],
      qualifiers: {
        "color": isValidColor,
        "bgColor": isValidColor,
        "background": isValidColor,
      },
      blindGuess: {
        "lineStyle": ["solid", "dashed", "dotted"],
        "color": isValidColor,
        "type": HuatuPattern.getAllPatternTypes(),
      }
    }
    const ptnParams: IPatternParams = {};
    if (typeof value === "string") {
      // If the definition is presented in a string
      const res = parseStrIntoKeyValuePair<IPatternParams>(value, opts);
      assignOnlyDefined(ptnParams, res.body);
      if (res.orphans.length > 0) {
        this.warnings.push(`Segments [${res.orphans.map(x => `'${x}'`).join(",")}] were not able to be resolved when making a Pattern!`);
      }
      if (res.unluckyOrphans.length > 0) {
        this.warnings.push(`[${res.unluckyOrphans.map(x => `'${x}'`).join(",")}] were failed to set to it's owner key in default, maybe repeated assigning!`);
      }
    } else {
      // If the definition is in object form
      const res = parseStrIntoKeyValuePair(value as {[key: string]: string}, opts)
      Object.assign(ptnParams, res.body);
      if (res.failedPairs.length > 0) {
        const warnings = res.failedPairs.map((x, i) => `${i+1}) '${x.key}: ${x.value}'`).join("\n");
        this.warnings.push(`Parameters failed when making a pattern: \n${warnings}`);
      }
    }
    const ptn = HuatuPattern.buildPatternFromParams(ptnParams);
    if (typeof ptn === "string") return [ptn];
    this.patterns.push(new HuatuPattern(name, ptn));
    return [];
  }

  /**
   * Resolve Marker definition, the input might be an object, describe how the marker is designed
   * @param name Name of the Marker
   * @param value Presentation to resolve the Marker
   * @returns Error message
   */
  resolveMarker(name: string, value: string | IHuatuYmlMarker): string[] {
    // Check name duplicating
    if (this.markers.find(p => p.name === name)) return [`Marker '${name}' has already been defined!`];
    const opts: IKeyValueOptions = {
      keys: [
        ["type"],
        ["size"],
        ["width", "w"],
        ["height", "h"],
        ["r"],
        ["rx"],
        ["ry"],
        ["n"],
        ["direction"],
        ["centerEmpty"],
        ["rIn"],
        ["rOut"],
        ["degOffset", "offset"],
        ["degOpen", "angOpen"],
        ["len", "length"],
        ["k"],
        ["closeArrow"],
        ["makeSmooth", "smooth"],
        ["primaryColor", "priColor", "primeColor", "color"],
        ["secondaryColor", "secColor"],
        ["fillColor", "fill"],
        ["fillOpacity", "opacity"],
        ["strokeColor", "stroke"],
        ["strokeWidth"],
      ],
      allowAppend: [],
      booleans: ["centerEmpty", "closeArrow", "makeSmooth", "smooth"],
      numbers: [
        "fillOpacity", "opacity",
        "r", "rx", "ry", "rIn", "rOut",
        "width", "height", "size",
        "degOffset", "offset",
        "degOpen", "angOpen",
        "len","length",
        "k",
        "fillOpacity", "strokeWidth",
      ],
      ints: ["n"],
      qualifiers: {
        "direction": ["up", "down", "left", "right"],
        "color": isValidColor,
        "fillColor": isValidColor,
        "stroke": isValidColor,
        "strokeColor": isValidColor,
        "primaryColor": isValidColor,
        "priColor": isValidColor,
        "primeColor": isValidColor,
        "secondaryColor": isValidColor,
        "secColor": isValidColor,
      },
      blindGuess: {
        "direction": ["up", "down", "left", "right"],
        "type": HuatuMarker.getAllMarkerTypeWords(),
        "primaryColor": isValidColor,
      }
    }
    const mkrParams: IMarkerParams = {};
    if (typeof value === "string") {
      // If the definition is presented in a string
      const res = parseStrIntoKeyValuePair(value, opts);
      Object.assign(mkrParams, res.body);
      if (res.orphans.length > 0) {
        this.warnings.push(`Segments [${res.orphans.map(x => `'${x}'`).join(",")}] were not able to be resolved when making a Marker!`);
      }
      if (res.unluckyOrphans.length > 0) {
        this.warnings.push(`[${res.unluckyOrphans.map(x => `'${x}'`).join(",")}] were failed to set to it's owner key in default, maybe repeated assigning!`);
      }
    } else {
      // If the definition is in object form
      const res = parseStrIntoKeyValuePair(value as {[key: string]: string}, opts)
      Object.assign(mkrParams, res.body);
      if (res.failedPairs.length > 0) {
        const warnings = res.failedPairs.map((x, i) => `${i+1}) '${x.key}: ${x.value}'`).join("\n");
        this.warnings.push(`Parameters failed when making a marker: \n${warnings}`);
      }
    }
    const mkr = HuatuMarker.buildMarkerFromParams(name, mkrParams);
    if (typeof mkr === "string") return [mkr];
    const huatuMkr = new HuatuMarker(name, mkr);
    huatuMkr.primaryColor = mkrParams.primaryColor;
    huatuMkr.secondaryColor = mkrParams.secondaryColor;
    this.markers.push(huatuMkr);
    return [];
  }

  parseLabelDef(format: string, text: string): HuatuLabel | string {
    // Label Format should be: label; [format] ||| [text]
    // For the format part, it should be like
    // (location | w); w | h; at; (location); rot; 35; (anchor)pos; center; align; center; [anchor]offset; font; lishu; bold; italic; addline; overline;
    const optsLabel: IKeyValueOptions = {
      keys: [
        ["refs", "styles", "style", "ref"],
        ["location", "at", "position", "pos", "loc"],
        ["offset"],
        ["anchor"],
        ["width", "w"],
        ["height", "h"],
        ["textAlign", "align"],
        ["bold"],
        ["italic"],
        ["addLine", "line"],
        ["lineHeight", "lnh"],
        ["fontName", "font"],
        ["color", "fontColor"],
        ["fontSize", "size", "fs"],
        ["rotDeg", "deg"],
        ["bgColor", "background", "bg"],
        ["borderColor", "bdrColor", "bdr"],
      ],
      booleans: ["bold", "italic"],
      ints: [],
      numbers: [
        "fontSize", "size", "fs",
        "rotDeg", "deg",
        "lineHeight", "lnh"
      ],
      allowAppend: ["refs", "styles", "style", "ref"],     // In the case that the user might split the ref styles in separate parameters
      qualifiers: {
        "color": isValidColor,
        "fontColor": isValidColor,
        "anchor": HuatuLabel.ANCHOR_POSITIONS,
        "textAlign": HuatuLabelStyle.TEXT_ALIGNS,
        "align": HuatuLabelStyle.TEXT_ALIGNS,
        "addLine": HuatuLabelStyle.DECORATION_LINES,
        "bgColor": isValidColor,
        "background": isValidColor,
        "bg": isValidColor,
        "borderColor": isValidColor,
        "bdrColor": isValidColor,
        "bdr": isValidColor,
      },
      blindGuess: {
        "textAlign": HuatuLabelStyle.TEXT_ALIGNS,
        "anchor": HuatuLabel.ANCHOR_POSITIONS,
        "addLine": [
          "over", "overline",
          "under", "underline",
          "middleline", "through", "strike-through", "strikethrough"
        ],
        "fontName": HuatuLabelStyle.PREDEFINED_FONT_NAMES,
        "color": isValidColor,
        "bgColor": isValidColor,
      }
    }
    const res = parseStrIntoKeyValuePair(format, optsLabel);
    const resBody = res.body as IHuatuLabelParams;

    // Handle Unlucky orphans
    res.unluckyOrphans.forEach(orphan => {
      // To see if it is the keyword 'Center'
      if (orphan === "center") {
        if (resBody.textAlign === "center" && !resBody.anchor) {
          resBody.anchor = "center";
        } else {
          this.warnings.push(`[Label Resolving]: '${orphan}' could not be used, maybe repeating.`);
        }
      } else {
        // Throw to orphans to reprocess
        res.orphans.push(orphan);
      }
    });

    // Re-check Orphans
    const realOrphans: string[] = [];
    res.orphans.forEach(orphan => {
      let orphanProcessed = false;
      // To see if it font size definition
      let fsStr = /^([1-9]\d*)p[xt]$/i.exec(orphan);
      if (fsStr && !resBody.fontSize) {
        resBody.fontSize = parseFloat(fsStr[1]);
        orphanProcessed = true;
      }
      // To see if it is some label style
      if (!orphanProcessed) {
        let sty = this.labelStyles.find(s => s.name === orphan);
        if (sty) {
          if (resBody.refs) resBody.refs += `, ${orphan}`;
          else resBody.refs = orphan;
          orphanProcessed = true;
        }
      }
      // To see if it is some Point-Like
      if (!orphanProcessed) {
        let p = this.resolvePointFromExpr(orphan);
        if (p) {
          if (!resBody.location) resBody.location = orphan;
          else if (!resBody.offset) resBody.offset = orphan;
          else this.warnings.push(`[Label Resolving]: Too many point assigning '${orphan}'!`);
          orphanProcessed = true;
        }
      }
      // Throw to Orphan if it is not processed
      if (!orphanProcessed) {
        realOrphans.push(orphan);
      }
    })

    // Add warning about Orphans
    if (realOrphans.length > 0) {
      const orphans = realOrphans.map(x => `'${x}'`).join(", ");
      this.warnings.push(`[Label Resolving]: segments ${orphans} could not be resolved!`);
    }
    let width = resBody.width ? this.resolveVarExpr(resBody.width) : undefined;
    let height = resBody.height ? this.resolveVarExpr(resBody.height) : undefined;
    const label = new HuatuLabel(text, width, height);
    if (resBody.location) {
      let p = this.resolvePointFromExpr(resBody.location);
      if (p) label.location = p;
      else {
        this.warnings.push(`Label Location '${resBody.location}' cannot resolve to some point, Will use (0, 0)`)
      }
    }
    if (resBody.offset) {
      let p = this.resolvePointFromExpr(resBody.offset);
      if (p) label.anchorOffset = p;
    }
    if (resBody.refs) {
      resBody.refs.split(/[,\s]/)
        .map(x => x.trim())
        .filter(x => !!x)
        .forEach(x => {
          const sty = this.labelStyles.find(s => s.name === x);
          if (sty) {
            if (!label.styles.find(s => s === sty)) {
              label.styles.push(sty);
            } else {
              this.warnings.push(`Style '${x}' has been already added to the label!`);
            }
          } else {
            this.warnings.push(`'${x}' is not valid defined Label Style!`);
          }
        });
    }
    if (resBody.anchor)  label.setAnchor(resBody.anchor);
    if (resBody.textAlign) label.textAlign = resBody.textAlign;
    if (resBody.bold) label.bold = resBody.bold;
    if (resBody.italic) label.italic = resBody.italic;
    if (resBody.addLine) label.addLine = resBody.addLine;
    if (resBody.fontName) label.font = resBody.fontName;
    if (resBody.color) label.color = resBody.color;
    if (resBody.fontSize) label.fontSize = resBody.fontSize;
    if (resBody.lineHeight) label.lineHeight = resBody.lineHeight;
    if (resBody.rotDeg) label.rotDeg = resBody.rotDeg;
    if (resBody.bgColor) label.bgColor = resBody.bgColor;
    if (resBody.borderColor) label.borderColor = resBody.borderColor;
    return label;
  }

  parseStyleAndTransformString(def: string): {
    style?: IHuatuStyle;
    transform?: IHuatuTransform;
    alignCenter?: boolean;
    smooth?: IHuatuDrawingSmoothParams;
    radius?: number[];
  } {
    const parseRes = parseStrIntoKeyValuePair<IHuatuDrawingParams>(def, HuatuDrawing.optsDrawingStyleAndTransform);
    const params = parseRes.body;
    // Transform
    const transform = new HuatuTransform();
    if (params.at) {
      const p = this.resolvePointFromExpr(params.at);
      if (p) {
        transform.rotCx = p.x;
        transform.rotCy = p.y;
      } else {
        this.warnings.push(`'${params.at}' cannot be resolved to a point!`);
      }
    }
    if (params.move) {
      const p = this.resolvePointFromExpr(params.move);
      if (p) {
        transform.x = p.x;
        transform.y = p.y;
      } else {
        this.warnings.push(`'${params.move}' cannot be resolved to a point!`);
      }
    }
    if (params.rotDeg) transform.rotDeg = this.resolveVarExpr(params.rotDeg);
    if (params.scale) {
      if (params.scale > 0) transform.scale = params.scale;
      else this.warnings.push(`Value of Scale could not be negative!`);
    }
    const style = this.parseStyleFromKeyValueResults(parseRes);
    let smooth: IHuatuDrawingSmoothParams | undefined;
    if (parseRes.subKeys && parseRes.subKeys["smooth"]) {
      let smoothVar = (parseRes.subKeys["smooth"] as IKeyValueParsingResult<IHuatuDrawingSmoothParams>).body;
      smooth = {
        mode: smoothVar.mode,
        factor: smoothVar.factor,
      }
      // Make lineJoin round if not set
      if (!style.strokeLineJoin) {
        style.strokeLineJoin = "round";
      }
    }

    return {
      style,
      transform,
      alignCenter: params.alignCenter,
      smooth,
      radius: params.radius,
    };
  }

  /**
   * Resolve the "modelled" drawing by definition
   * @param def The definition of the drawing of a shape, It might have two formats:
   *             - Ad-Hoc Shape definitions and style/transform settings
   *             - Referring a defined (named) module, and specifying style/transform
   * @param allowedTypes The allowed sets of module that this function call will search, it is designed in the way that
   *                     Different Drawing Group will accept different types of modules   *
   * @returns The resolved Drawing or error message
   */
  resolveDrawingOfShapes(def: string, allowedTypes: string[]): IHuatuFinalDraw | string {
    // let format, style, transform, alignCenter;
    const tryShapeAndDrawing = WtHuatu.REGEX_SHAPE_AND_DRAWING_DEF.exec(def)
    if (tryShapeAndDrawing) {
      const shape = this.resolveShapeDef(tryShapeAndDrawing[1]);
      if (typeof shape === "string") return shape;
      const fmtRes = this.parseStyleAndTransformString(tryShapeAndDrawing[2]);
      let path = HuatuPath.model2Path(shape);
      if (path instanceof PathPolyline && fmtRes.smooth) {
        path = path.toSmoothed(fmtRes.smooth.factor, fmtRes.smooth.mode as any);
      } else if (fmtRes.radius &&
                 (path instanceof PathPolyline ||
                  path instanceof PathPolygon ||
                  path instanceof PathTriangle ||
                  path instanceof PathRect)) {
        path = path.toAngleArced(fmtRes.radius);
      }
      const htPath = new HuatuPath(path);
      htPath.setModel(shape);
      return new HuatuDrawing(htPath, fmtRes.style, fmtRes.transform);
    }
    // If it is not a ad-hoc shape (and thus path) define, then it should refer some other defined modules
    // And the first parameter is the name
    let name: string,
        nameIdx: number | undefined = undefined,
        fmtStr: string | undefined;
    const scPos = def.indexOf(";");
    if (scPos < 0) {
      name = def.trim();
      fmtStr = undefined;
    } else {
      name = def.substring(0, scPos).trim();
      fmtStr = def.substring(scPos + 1);
    }
    if (!name) {
      return `A module (name) to draw needs to be specified!`;
    }
    // Check if it is referring some point in a Point Series
    let originalName = name;
    const match = name.match(WT_REGEX.VAR_WITH_INDEXING);
    if (match) {
      name = match[1];
      nameIdx = parseInt(match[3] || match[4]);
    }

    // Check if the item is PointSeries, if so, it will be converted to PathSeries of circles
    const ps = this.pointSeries.find(x => x.name === name);
    if (ps) {
      let psR: number | undefined;
      const psSty = new HuatuStyle();
      if (fmtStr) {
        const parseRes = parseStrIntoKeyValuePair<IHuatuPointSeriesDrawParams>(fmtStr, HuatuPointSeries.optsPointSeriesDrawing);
        const params = parseRes.body;
        if (params.size) {
          let rEval = this.resolveVarExpr(params.size);
          if (!rEval || rEval < 0) {
            this.warnings.push(`Size/Radius (${params.size}) when drawing Point Series not valid, will use default (1)!`);
          } else {
            psR = rEval;
          }
        }
        const subFill = parseRes.subKeys ? parseRes.subKeys["fill"] : undefined;
        const subStroke = parseRes.subKeys ? parseRes.subKeys["stroke"] : undefined;
        if (params.fillColor) psSty.fillColor = params.fillColor;
        else if (subFill && subFill.body["color"]) psSty.fillColor = subFill.body["color"];
        if (params.fillOpacity !== undefined && WtMath.isIn0and1(params.fillOpacity)) psSty.fillOpacity = params.fillOpacity;
        else if (subFill &&
                 subFill.body["opacity"] !== undefined &&
                 WtMath.isIn0and1(subFill.body["opacity"])) psSty.fillOpacity = subFill.body["opacity"];
        if (params.strokeColor) psSty.strokeColor = params.strokeColor;
        else if (subStroke && subStroke.body["color"]) psSty.strokeColor = subStroke.body["color"];
        if (params.strokeWidth) psSty.strokeWidth = params.strokeWidth;
        else if (subStroke && subStroke.body["width"]) psSty.strokeWidth = subStroke.body["width"];
        if (params.strokeOpacity !== undefined && WtMath.isIn0and1(params.strokeOpacity)) psSty.fillOpacity = params.fillOpacity;
        else if (subStroke &&
                 subStroke.body["opacity"] !== undefined &&
                 WtMath.isIn0and1(subStroke.body["opacity"])) psSty.strokeOpacity = subStroke.body["opacity"];
        if (params.dashArray) psSty.strokeDashArray = params.dashArray;
        else if (subStroke && subStroke.body["dashArray"]) psSty.strokeDashArray = subStroke.body["dashArray"];
        let notUsed: string[] = [];
        if (parseRes.orphans.length > 0) {
          notUsed = parseRes.orphans.map(x => `"${x}"`);
        }
        if (parseRes.failedPairs.length > 0) {
          notUsed.push(...parseRes.failedPairs.map(x => `"[${x.key}]:${x.value}"`));
        }
        if (subFill && subFill.orphans) {
          notUsed.push(...subFill.orphans.map(x => `"fill:${x}"`));
        }
        if (subStroke && subStroke.orphans) {
          notUsed.push(...subStroke.orphans.map(x => `"fill:${x}"`));
        }
        if (notUsed.length > 0) {
          this.warnings.push(`Parameters [${notUsed.join(",")}] not used for PointSeries drawing`);
        }
      }
      if (nameIdx !== undefined && (nameIdx < 1 || nameIdx > ps.points.length)) return `Index out of range when drawing one point from PointSeries (${originalName})`;
      const circles = (nameIdx ? [ps.points[nameIdx - 1]] : ps.points).map(p => new Circle(p.x, p.y, psR || 1))
      const psDrawing = HuatuPathSeries.fromModels(circles);
      if (!psSty.fillColor) psSty.fillColor = "currentColor";
      return new HuatuDrawing(psDrawing, psSty);
    }
    // Shape/Path referring
    let fmtRes = fmtStr ? this.parseStyleAndTransformString(fmtStr) : undefined;
    let elemSources: { name?: string, refCount?: number }[] = [];
    if (allowedTypes.includes("shape") || allowedTypes.includes("path")) {
      elemSources.push(...this.paths);
    }
    if (allowedTypes.includes("shapeSeries") || allowedTypes.includes("pathSeries")) {
      elemSources.push(...this.pathSeries);
    }
    if (allowedTypes.includes("symbol")) {
      elemSources.push(...this.symbols);
    }
    if (allowedTypes.includes("array")) {
      elemSources.push(...this.arrays);
    }
    if (allowedTypes.includes("block")) {
      elemSources.push(...this.blocks);
    }
    if (allowedTypes.includes("layer")) {
      elemSources.push(...this.layers);
    }
    if (allowedTypes.includes("component")) {
      elemSources.push(...this.compPlacements);
    }
    const element = elemSources.find(x => x.name === name);
    if (element) {
      if (element.refCount) element.refCount++;
      let eleFound = element as IHuatuDrawingElement;
      if (nameIdx!== undefined) {
        if (!(element instanceof HuatuPathSeries)) return `Draw (${originalName}) failed, because ${name} is not ShapeSeries`;
        if (nameIdx < 1 || nameIdx > element.paths.length) return `Index out of range when drawing one path from PathSeries (${originalName})`;
        eleFound = new HuatuPath(element.paths[nameIdx - 1]);
      }
      if (fmtRes && element instanceof HuatuPath && element.path) {
        if (fmtRes.smooth && element.path instanceof PathPolyline) {
          // If Polyline and smooth, then reset the path to smoothed path
          eleFound = new HuatuPath(element.path.toSmoothed(fmtRes.smooth.factor, fmtRes.smooth.mode as any));
        } else if (fmtRes.radius &&
                   (element.path instanceof PathPolygon ||
                    element.path instanceof PathPolyline ||
                    element.path instanceof PathRect ||
                    element.path instanceof PathTriangle)) {
          // If radius specified, then make radius at angles
          eleFound = new HuatuPath(element.path.toAngleArced(fmtRes.radius));
        }
      }
      // Make component placement some drawing
      if (element instanceof HuatuComponentPlacement) {
        eleFound = new HuatuCompDrawing(element);
        // Remove Transform and AlignCenter settings for Component placement
        if (fmtRes) {
          const msgs: string[] = [];
          if (fmtRes.transform) {
            if (fmtRes.transform.rotCx || fmtRes.transform.rotCy || fmtRes.transform.rotDeg) {
              let msgDeg = fmtRes.transform.rotDeg ? ` ${fmtRes.transform.rotDeg.toFixed(2)} deg` : ``;
              let msgLoc = fmtRes.transform.rotCx || fmtRes.transform.rotCy
                ? ` at (${fmtRes.transform.rotCx ? fmtRes.transform.rotCx.toFixed(2) : 0}, ${fmtRes.transform.rotCy ? fmtRes.transform.rotCy.toFixed(2) : 0})`
                : ``;
              msgs.push(`Rotate${msgDeg}${msgLoc}`);
            }
            if (fmtRes.transform.scale) {
              msgs.push(`Scale(${fmtRes.transform.scale})`);
            }
            if (fmtRes.transform.x || fmtRes.transform.y) {
              msgs.push(`Move to (${fmtRes.transform.x ? fmtRes.transform.x.toFixed(2) : 0}, ${fmtRes.transform.y ? fmtRes.transform.y.toFixed(2) : 0})`);
            }
            fmtRes.transform = undefined;
          }
          if (fmtRes.alignCenter) {
            msgs.push("alignCenter");
            fmtRes.alignCenter = undefined;
          }
          if (msgs.length > 0) {
            this.warnings.push(`No Transform(scale/move/rotate) and alignCenter supported for a component placement, what you specified (${msgs.join(';')}) will be ignored!`);
          }
        }
      }
      return new HuatuDrawing(eleFound, fmtRes?.style, fmtRes?.transform, fmtRes?.alignCenter);
    } else {
      return `[${name}] is not found in defined modules!`;
    }
  }

  resolveWireTerminal(def?: string): IHuatuComponentPortSettled | ISvgPoint | undefined {
    if (!def) return undefined;
    // 1. Check if Component (placement) 's port
    const tryPlacementCall = /^([a-z][a-z0-9_]*)[.]([0-9a-zA-Z]+)$/i.exec(def);
    if (tryPlacementCall) {
      const plcName = tryPlacementCall[1];
      const portName = tryPlacementCall[2];
      const plc = this.compPlacements.find(x => x.name === plcName);
      if (plc) {
        const port = plc.portsSettled.find(p => p.name === portName);
        if (port) {
          return port;
        }
        else {
          this.warnings.push(`Port '${portName}' cannot found in Component Placement '${plcName}'`);
        }
      }
    }
    // 2. Check if it is a point referencing some shape/path, etc, or purely some point definition
    const tryPointExpr = this.resolvePointFromExpr(def);
    if (tryPointExpr) return tryPointExpr;

    // Return none if no hit
    return undefined;
  }

  parseWireDef(def: string): IHuatuFinalDraw | string {
    const res = parseStrIntoKeyValuePair<IHuatuWireDefParams>(def, HuatuWire.optsHuatuWire);
    const params = res.body;
    if (!params.from) {
      return `You must provide 'From' terminal to define a wire. '${def}' lacks some!`
    }
    if (!params.to) {
      if (!params.net) {
        return `No 'To' terminal and no net defined for the wire '${def}'`;
      }
    }
    let errMsg: string[] = [];
    const termFrom = this.resolveWireTerminal(params.from);
    if (!termFrom) {
      errMsg.push(`Wire terminal 'From' (${params.from}) cannot resolve to a valid point!`);
    }
    let termTo;
    if (params.to) {
      termTo = this.resolveWireTerminal(params.to);
      if (!termTo) {
        if (HuatuWire.TO_HV_TYPES.includes((params.type || "auto").toLowerCase())) {
          const tryXorY = this.resolvePointCoorsExpr(params.to);
          if (tryXorY === undefined) {
            errMsg.push(`Please specify X/Y values when you draw a toX or toY wire!`);
          } else {
            termTo = tryXorY;
          }
        } else {
          errMsg.push(`Wire terminal 'To' (${params.to}) cannot resolve to a valid point!`);
        }
      }
    }
    if (errMsg.length > 0) return errMsg.join("\n");
    const wire = new HuatuWire(def, termFrom!, termTo, params.type);

    // Check other parameters of that wire
    if (params.color) wire.strokeColor = params.color;
    if (params.radius) wire.radius = params.radius;
    if (params.turn) {
      const turn = this.resolveVarExpr(params.turn);
      if (turn === undefined) {
        this.warnings.push(`Turn parameter '${params.turn}' of wire def is invalid, it cannot resolve to a number!`);
      } else {
        if (turn < 0 || turn > 1) {
          this.warnings.push(`Turn parameter should be in [0, 1], what you specified '${params.turn}' resolved to '${turn}'`);
        }
        wire.turn = turn;
      }
    }
    if (params.turnX) {
      const turnX = this.resolvePointCoorsExpr(params.turnX);
      if (turnX === undefined) {
        this.warnings.push(`TurnX parameter '${params.turnX}' of wire def is invalid, it cannot resolve to a number!`);
      } else {
        wire.turnX = turnX;
      }
    }
    if (params.turnY) {
      const turnY = this.resolvePointCoorsExpr(params.turnY);
      if (turnY === undefined) {
        this.warnings.push(`TurnY parameter '${params.turnY}' of wire def is invalid, it cannot resolve to a number!`);
      } else {
        wire.turnY = turnY;
      }
    }
    if (params.turnAt) {
      const turnAt = this.resolvePointFromExpr(params.turnAt);
      if (turnAt === undefined) {
        this.warnings.push(`TurnAt parameter '${params.turnY}' of wire def is invalid, it cannot resolve to a Point!`);
      } else {
        wire.turnAt = turnAt;
      }
    }
    if (params.turnLen) {
      const turnLen = this.resolveVarExpr(params.turnLen);
      if (turnLen === undefined) {
        this.warnings.push(`turnLen parameter '${params.turnLen}' of wire def is invalid, it cannot resolve to a number!`);
      } else {
        wire.turnLen = turnLen;
      }
    }
    if (params.net) {
      let tryNet = this.nets.find(x => x.name === params.net);
      if (!tryNet) {
        tryNet = new HuatuNet(this, params.net);
        this.nets.push(tryNet);
      }
      wire.net = tryNet;
      if (params.netColor && isValidColor(params.netColor)) {
        wire.net.color = params.netColor;
      }
      if (params.netLineWidth) {
        const netlw = this.resolveVarExpr(params.netLineWidth);
        if (netlw === undefined || netlw < 0) {
          this.warnings.push(`net linewidth parameter '${params.netLineWidth}' of wire def is invalid, it cannot resolve to a positive number!`);
        } else {
          wire.net.lineWidth = netlw;
        }
      }
    }
    if (params.lineWidth) {
      const lw = this.resolveVarExpr(params.lineWidth);
      if (lw === undefined || lw < 0) {
        this.warnings.push(`lineWidth parameter '${params.lineWidth}' of wire def is invalid, it cannot resolve to a positive number!`);
      } else {
        wire.lineWidth = lw;
      }
    }
    if (params.joint) {
      wire.jointColor = params.joint;
    }
    if (params.jointSize) {
      const size = parseFloat(params.jointSize);
      if (size > 0) {
        wire.jointSize = size;
      } else {
        this.warnings.push(`Wire joint size should be positive, '${[params.jointSize]}' is not!`);
      }
    }
    if (params.squareJoint) {
      wire.isSquareJoint = true;
    }
    if (params.endArrow) {
      let mkr = this.checkMarker(params.endArrow);
      if (mkr) wire.markerEnd = mkr;
    }
    if (params.startArrow) {
      let mkr = this.checkMarker(params.startArrow);
      if (mkr) wire.markerStart = mkr;
    }
    // Resolve Points
    wire.tryResolvePoints();
    return new HuatuWireDrawing(wire, this);
  }

  parseAngleMarkDef(def: string): IHuatuFinalDraw | string {
    const res = parseStrIntoKeyValuePair<IHuatuAngleMarkParams>(def, HuatuAngleMark.optsAngleMarkDef);
    const params = res.body;
    if (!params.pA) return `First Point (pA) not found when making Angle Mark: '${def}'`;
    if (!params.pB) return `Second Point (pB) not found when making Angle Mark: '${def}'`;
    if (!params.pC) return `Third Point (pC) not found when making Angle Mark: '${def}'`;
    const pA = this.resolvePointFromExpr(params.pA);
    if (!pA) return `First Point (pA, def: '${params.pA}') Cannot resolve to a Point`;
    const pB = this.resolvePointFromExpr(params.pB);
    if (!pB) return `Second Point (pB, def: '${params.pB}') Cannot resolve to a Point`;
    const pC = this.resolvePointFromExpr(params.pC);
    if (!pC) return `Third Point (pC, def: '${params.pC}') Cannot resolve to a Point`;
    const am = new HuatuAngleMark(pA, pB, pC);
    // Handle Stroke
    if (params.lineWidth) {
      const lw = this.resolveVarExpr(params.lineWidth);
      if (lw) {
        am.setStroke(lw, params.strokeColor);
      }
    } else if (params.strokeColor) {
      am.setStroke(HuatuAngleMark.DEFAULT_ARC_LINE_WIDTH, params.strokeColor);
    }
    // Handle Fill
    if (res.subKeys && res.subKeys["fill"]) {
      const fillVals = res.subKeys["fill"].body;
      if (!params.fillColor && fillVals["color"]) {
        params.fillColor = fillVals["color"];
      }
      if (params.fillOpacity === undefined && fillVals["opacity"] !== undefined && WtMath.isIn0and1(fillVals["opacity"])) {
        params.fillOpacity = fillVals["opacity"];
      }
    }
    if (params.fillColor && params.fillColor.toLowerCase() !== "none") {
      am.setFill(params.fillColor, params.fillOpacity);
    }
    // Make mark
    const size = params.size ? this.resolveVarExpr(params.size) : undefined;
    am.makeMark(params.type || "line1", size || HuatuAngleMark.DEFAULT_ARC_SIZE, params.large, params.showPerp, params.startArrow, params.labelPos);
    // Handle Label
    am.setLabelText(params.label, params.showDeg, params.degDigits);
    const lw = params.labelWidth ? this.resolveVarExpr(params.labelWidth) : undefined;
    const lh = params.labelHeight ? this.resolveVarExpr(params.labelHeight) : undefined;
    const ts = params.textSize ? this.resolveVarExpr(params.textSize) : undefined;
    const offset = params.labelOffset ? this.resolvePointFromExpr(params.labelOffset) : undefined;
    am.makeLabel(params.anchor, lw, lh, ts, params.textColor, offset);
    // Make failed pairs to warnings
    const failed = res.failedPairs.map(x => `${x.key}: '${x.value}'`);
    failed.push(...res.orphans);
    if (failed.length > 0) {
      this.warnings.push(`Attributes not valid to make Angle Mark: [${failed.join(", ")}]`);
    }
    return am;
  }

  parseDimMarkDef(def: string): IHuatuFinalDraw | string {
    const res = parseStrIntoKeyValuePair<IHuatuDimMarkParams>(def, HuatuDimMark.optsDimMarkDef);
    const params = res.body;
    if (!params.from) return `Start Point of the Dimension Mark not found in '${def}'`;
    if (!params.to) return `End Point of the Dimension Mark not found in '${def}'`;
    const pStart = this.resolvePointFromExpr(params.from);
    if (!pStart) return `Start Point (def: '${params.from}') Cannot resolve to a Point`;
    const pEnd = this.resolvePointFromExpr(params.to);
    if (!pEnd) return `End Point (def: '${params.to}') Cannot resolve to a Point`;
    const dimMark = new HuatuDimMark(pStart, pEnd);
    if (!dimMark.isValid) return `Dimension Mark '${def}' Cannot resolve to a valid mark, start/end points are possibly identical!`;
    if (dimMark.isZeroDim) return `Dimension Mark '${def}' has zero Length to mark!`;
    let type = (params.type || "line").toLowerCase();
    type = type.startsWith("h") ? "hori"
      : type.startsWith("v") ? "vert"
      : "line";
    const conf: IHuatuDimMarkConfig = {
      type: type as HuatuDimMarkType,
      dir: (params.dir as ("right" | "left")) || "right",
    };
    // Judge and assign configs
    if (params.gap) {
      let gap = this.resolveVarExpr(params.gap);
      if (gap !== undefined && gap >= 0) {
        conf.gap = gap;
      } else {
        this.warnings.push(`Gap def '${params.gap}' cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.barWidth) {
      let width = this.resolveVarExpr(params.barWidth);
      if (width && width > 0) {
        conf.barWidth = width;
      } else {
        this.warnings.push(`Bar Width def '${params.barWidth}' cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.lineWidth) {
      let width = this.resolveVarExpr(params.lineWidth);
      if (width && width > 0) {
        conf.lineWidth = width;
      } else {
        this.warnings.push(`Line Width def '${params.lineWidth}' cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.barLen) {
      let len = this.resolveVarExpr(params.barLen);
      if (len && len > 0) {
        conf.barLength = len;
      } else {
        this.warnings.push(`Bar Length def '${params.barLen}' cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.linePos !== undefined && WtMath.isIn0and1(params.linePos)) {
      conf.linePos = params.linePos;
    } else if (params.linePos) {
      this.warnings.push(`Dimension Mark Line Position should be in [0,1], your input '${params.linePos}' is invalid`);
    }
    if (!!params.noStartBar) conf.noStartBar = true;
    if (!!params.noEndBar) conf.noEndBar = true;
    if (!!params.noStartArrow) conf.noStartArrow = true;
    if (!!params.noEndArrow) conf.noEndArrow = true;
    if (!!params.barLenEqual) conf.barLenEqual = true;
    if (params.barColor) conf.barColor = params.barColor;
    if (params.lineColor) conf.lineColor = params.lineColor;
    if (params.arrow) conf.arrowType = params.arrow as HuatuDimMarkArrowType;
    if (params.label) conf.labelText = params.label;
    if (params.labelWidth) {
      let width = this.resolveVarExpr(params.labelWidth);
      if (width && width > 0) {
        conf.labelWidth = width;
      } else {
        this.warnings.push(`Label Width ('${params.labelWidth}') of DimMark cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.labelHeight) {
      let height = this.resolveVarExpr(params.labelHeight);
      if (height && height > 0) {
        conf.labelHeight = height;
      } else {
        this.warnings.push(`Label Height ('${params.labelHeight}') of DimMark cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.textSize) {
      let size = this.resolveVarExpr(params.textSize);
      if (size && size > 0) {
        conf.labelFontSize = size;
      } else {
        this.warnings.push(`Label Text Size ('${params.textSize}') of DimMark cannot resolve to some number, will be ignored!`);
      }
    }
    if (params.textColor) conf.labelColor = params.textColor;
    if (!!params.labelOnLine) conf.labelOnLine = true;
    if (params.labelFill) conf.labelBackground = params.labelFill;
    if (params.labelBorder) conf.labelBorderColor = params.labelBorder;
    if (!!params.rotateLabel) conf.rotateLabel = true;
    if (params.remotePos) {
      let pos = this.resolvePointFromExpr(params.remotePos);
      if (pos) {
        conf.remotePos = pos;
      } else {
        this.warnings.push(`Remote Position ('${params.remotePos}') of DimMark cannot resolve to some Point, will be ignored!`);
      }
    }
    if (!!params.showLength) conf.showLength = true;
    if (params.lenDigits !== undefined) conf.lenDigits = params.lenDigits;
    // Make mark
    dimMark.makeMark(conf);
    if (!dimMark.label) {
      this.warnings.push(`Label or showLength should be specified for a DimMark to make it display something, but the def '${def}' didn't`);
      // Make it invalid
      dimMark.isValid = false;
    }
    // Make failed pairs to warnings
    const failed = res.failedPairs.map(x => `${x.key}: '${x.value}'`);
    failed.push(...res.orphans);
    if (failed.length > 0) {
      this.warnings.push(`Attributes not valid to make Dimension Mark: [${failed.join(", ")}]`);
    }
    return dimMark;
  }

  /**
   * Unified function to resolve drawing definition
   * @param def The unified definition of a "drawing", including a label, or named modules
   * @param allowedTypes See the explanation in function `resolveDrawingOfShapes`
   * @returns The final draw or error message
   */
  resolveAsDrawingItem(def: string, allowedTypes: string[]): IHuatuFinalDraw | string {
    if (typeof def !== "string") return `The Drawing define might be incorrect, it is [${JSON.stringify(def)}], please note the colon(:) sign which might be semi-colon(;)!`;
    // To see if it is a label presented
    const tryLabel = WtHuatu.REGEX_LABEL_DEF.exec(def);
    if (tryLabel) {
      const lblFormat = tryLabel[1];
      if (!lblFormat) return `Label Location/Format should be present!`;
      // Replace the ever escaped colon (:) in the form of "\:" if the user want to input multiple line text
      // with some colon contained
      const lblText = tryLabel[2].trim().replace(/\\:/g, ":");
      // For empty labels, will not return error, just leave it as empty
      // if (!lblText) return `Label Text could not be empty!`;
      return this.parseLabelDef(lblFormat, lblText);
    }
    // To see if it is an angle mark
    const tryAngleMark = WtHuatu.REGEX_ANGLE_MARK_DEF.exec(def);
    if (tryAngleMark) {
      return this.parseAngleMarkDef(tryAngleMark[1].trim());
    }
    // To see if it is an Dimension Mark
    const tryDimMark = WtHuatu.REGEX_DIM_MARK_DEF.exec(def);
    if (tryDimMark) {
      return this.parseDimMarkDef(tryDimMark[1].trim());
    }
    // To See if it is a WIRE
    const tryWire = WtHuatu.REGEX_WIRE_DEF.exec(def);
    if (tryWire) {
      if (!allowedTypes.includes("wire")) {
        return `Wire definition only allowed under Block/Layer/Job, others not!`;
      }
      return this.parseWireDef(tryWire[1].trim());
    }
    // If not label, then treat it as some shape drawing
    return this.resolveDrawingOfShapes(def, allowedTypes);
  }

  isDrawingNameValid(name: string, level: "Symbol" | "Block" | "Layer"): string | undefined {
    if (this.paths.find(s => s.name === name)) return `There has been a Path named as ${name}!`;
    if (this.pathSeries.find(s => s.name === name)) return `There is some Path Series named as ${name}!`;
    if (this.symbols.find(s => s.name === name)) return `There is some Symbol named as ${name}!`;
    if (level === "Block" || level === "Layer") {
      if (this.arrays.find(s => s.name === name)) return `There is some Symbol Array named as ${name}!`;
      if (this.blocks.find(s => s.name === name)) return `There is Block named as ${name}!`;
      if (level === "Layer") {
        if (this.layers.find(s => s.name === name)) return `There is some Layer named as ${name}!`;
      }
    }
  }

  /**
   * Resolve Block definition, the input might be a string, or a string list
   * @param name Name of the Block
   * @param value Presentation to resolve the Block
   * @returns Error message
   */
  resolveBlock(name: string, value: string | string[]): string[] {
    // Check Name
    const nameError = this.isDrawingNameValid(name, "Block");
    if (nameError) return [nameError];
    const allowedTypes = [
      "shape", "shapeSeries",
      "path", "pathSeries",
      "symbol", "array", "block",
      "component", "wire"
    ];
    // If it is only one line, i.d. the block has only one definition, We assume that it is the shape it contains
    if (typeof value === "string") {
      const item = this.resolveAsDrawingItem(value, allowedTypes);
      if (typeof item === "string") return [item];      // Return the error message
      const block = new HuatuBlock(name);
      block.addElement(item);
      this.defines.push(block);     // Add to Definable
      this.blocks.push(block);
      return [];
    }
    // If the definition is a list, we assume that it contains multiple drawing definitions for the Block
    const errs: string[] = [];
    const block = new HuatuBlock(name);
    for (let i = 0; i < value.length; i++) {
      const def = value[i];
      const tryDesc = WtHuatu.tryDesc(def);
      if (tryDesc) {
        block.desc = tryDesc;
      } else {
        const item = this.resolveAsDrawingItem(def, allowedTypes);
        if (typeof item === "string") errs.push(item);
        else block.addElement(item);
      }
    }
    this.defines.push(block);     // Add to Definable
    this.blocks.push(block);
    // Return the errors when resolving
    return errs;
  }

  settleNetWires() {
    // Settle Wires of all the nets
    this.nets.forEach(n => n.settleWires());
  }

  resetNetTrunkDrawStatus() {
    this.nets.forEach(n => n.resetTrunkDrawnStatus());
  }

  /**
   * Resolve Layer definition, the input might be a string, or a string list
   * @param name Name of the Layer
   * @param value Presentation to resolve the Layer
   * @returns Error message
   */
  resolveLayer(name: string, value: string | string[]): string[] {
    // Check Name
    const nameError = this.isDrawingNameValid(name, "Layer");
    if (nameError) return [nameError];
    const allowedTypes = [
      "shape", "shapeSeries",
      "path", "pathSeries",
      "symbol", "array", "block",
      "component", "wire"
    ];
    // If it is only one line, i.d. the layer has only one definition, We assume that it is the shape it contains
    if (typeof value === "string") {
      const item = this.resolveAsDrawingItem(value, allowedTypes);
      if (typeof item === "string") return [item];      // Return the error message
      const layer = new HuatuLayer(name);
      layer.addElement(item);
      this.layers.push(layer);
      return [];
    }
    // If the definition is a list, we assume that it contains multiple drawing definitions for the Layer
    const errs: string[] = [];
    const layer = new HuatuLayer(name);
    for (let i = 0; i < value.length; i++) {
      const def = value[i];
      const tryDesc = WtHuatu.tryDesc(def);
      if (tryDesc) {
        layer.desc = tryDesc;
      } else {
        const item = this.resolveAsDrawingItem(def, allowedTypes);
        if (typeof item === "string") errs.push(item);
        else layer.addElement(item);
      }
    }
    this.layers.push(layer);
    // Return the errors when resolving
    return errs;
  }

  resolveViewBoxFromDef(def: string): ISvgBBox | string | undefined {
    const vbDefs = def.trim().split(";").map(x => x.trim()).filter(x => !!x);
    if (vbDefs.length < 2) {
      // Try to see if the def is organized in x,y,w,h form
      const numStrs = def.split(",").map(x => x.trim()).filter(x => !!x);
      const nums =  numStrs
        .map(x => this.resolveVarExpr(x))
        .filter(x => x !== undefined) as number[];
      if (nums.length < 4) return `Parameters '${def}' insufficient/invalid to build a ViewBox!`;
      if (nums[2] > 0 && nums[3] > 0) return new SvgBBox(nums[0], nums[1], nums[2], nums[3]);
      else return `'${numStrs[2]}' or '${numStrs[3]}' resolves to non-positive value!`;
    }
    const p1 = this.resolvePointFromExpr(vbDefs[0]);
    if (!p1) return `Parameter '${vbDefs[0]}' is not a point!`;
    const p2 = this.resolvePointFromExpr(vbDefs[1]);
    if (p2) return SvgBBox.parseFromTwoPoints(p1, p2);
    if (vbDefs.length >= 3) {
      let w = this.resolveVarExpr(vbDefs[1]);
      let h = this.resolveVarExpr(vbDefs[2]);
      if (w && w > 0 && h && h > 0) {
        return new SvgBBox(p1.x, p1.y, w, h);
      } else {
        return `Width '${vbDefs[1]}' or Height '${vbDefs[2]}' resolved to no valid length!`
      }
    }
    return `Parameters insufficient to build a ViewBox!`;
  }

  tryViewBox(def: string): ISvgBBox | string | undefined {
    const match = /^(viewbox|viewarea|viewbetween)\s*;(.*)$/i.exec(def);
    if (!match) return undefined;
    return this.resolveViewBoxFromDef(match[2])
      || `'${def}' failed resolving to a valid view box!`;
  }

  trySize(def: string): ISvgPoint | string | undefined {
    const match = /^(size)\s*;(.*)$/i.exec(def);
    if (!match) return undefined;
    const size = match[2].trim().split(";").map(x => x.trim()).filter(x => !!x);
    if (size.length < 1) return `'${match[2]}' has no size data presented!`;
    if (size.length >= 1) {
      const p = this.resolvePointFromExpr(size[0]);
      if (p) {
        if (p.x > 0 && p.y > 0) return p;
        else return `'${size[0]}' resolves to no valid(positive) Width/Height combination!`
      }
    }
    const w = this.resolveVarExpr(size[0]);
    if (!w || w <= 0) return `'${size[0]}' resolves to no valid positive length for width!`;
    if (size.length >= 2) {
      const h = this.resolveVarExpr(size[1]);
      if (h && h > 0) return new SvgPoint(w, h);
      else return `'${size[1]}' resolves to no valid positive length for Height!`;
    }
    return new SvgPoint(w, 0);
  }

  resolveJobDrawingItem(draw: string, allowedTypes: string[]): IHuatuFinalDraw | ISvgBBox | ISvgPoint | string | undefined {
    // Try Description
    const tryDesc = WtHuatu.tryDesc(draw);
    if (tryDesc) return `desc: ${tryDesc}`;
    // TO see if it is ViewBox define
    const tryViewBox = this.tryViewBox(draw);
    if (tryViewBox !== undefined) return tryViewBox;
    // Try Width or Height
    const trySize = this.trySize(draw);
    if (trySize !== undefined) return trySize;
    // If not special meaning, then try drawing
    return this.resolveAsDrawingItem(draw, allowedTypes);
  }

  /**
   * Resolve the defined job(s) from YML design file, 'draw' is one of the jobs
   * @param jobName Name of the job, if it is 'draw', then the default global draw
   * @param def The drawing design string to compose the final draw/job
   * @returns Errors if any
   */
  resolveJob(jobName: string, def: string | string[] | IHuatuYmlJob | undefined): string[] {
    if (!def) return [`Job '${jobName}' has no Definition!`];
    if (this.jobs.find(j => j.name === jobName)) return [`Job '${jobName}' has already been defined!`];
    const errs: string[] = [];
    const job = new HuatuJob(this, jobName);
    const drawItems: string[] = [];
    if (typeof def === "object" && !Array.isArray(def)) {   // Assume it is the IHuatuYmlJob data
      if (def.desc) job.desc = def.desc;
      if (def.config) job.config = WtHuatu.resolveConfig(def.config);
      if (def.size) {
        const size = this.resolvePointFromExpr(def.size);
        if (size) {
          if (size.x > 0) job.width = size.x;
          if (size.y > 0) job.height = size.y;
        }
      }
      if (def.height) {
        const height = this.resolveVarExpr(def.height);
        if (height && height > 0) job.height = height;
      }
      if (def.width) {
        const width = this.resolveVarExpr(def.width);
        if (width && width > 0) job.width = width;
      }
      let vbDef = def.viewBox || def.viewArea || def.viewBetween;
      if (vbDef) {
        const vb = this.resolveViewBoxFromDef(vbDef);
        if (typeof vb === "string") errs.push(vb);
        else if (vb) job.viewBox = vb;
        else {
          this.warnings.push(`'${vbDef}' cannot resolve to a valid View Box!`);
        }
      }
      if (def.drawings) {
        if (Array.isArray(def.drawings)) drawItems.push(...def.drawings.filter(x => !!x));
        else if (typeof def.drawings === "string") drawItems.push(def.drawings);
      }
    } else if (typeof def === "string") {
      drawItems.push(def);
    } else if (Array.isArray(def)) {
      drawItems.push(...def);
    }
    if (drawItems.length < 1) return [`Job '${jobName}' has no valid items presented!`];
    const allowedTypes = [
      "shape", "shapeSeries",
      "path", "pathSeries",
      "symbol", "array",
      "block", "layer",
      "component", "wire",
    ];

    // Resolve drawings
    drawItems.forEach(d => {
      const draw = this.resolveJobDrawingItem(d, allowedTypes);
      if (typeof draw === "string") {
        if (draw.startsWith("desc")) job.desc = draw.substring(6);
        else errs.push(draw);
      }
      else if (draw instanceof SvgPoint) {
        job.width = draw.x;
        if (draw.y > 0) job.height = draw.y;
      } else if (draw instanceof SvgBBox) {
        job.viewBox = draw;
        job.vbExplicit = true;
      } else if (draw) {
        job.drawings.push(draw as IHuatuFinalDraw);
      }
    });

    // Settle Net wires
    this.settleNetWires();

    // Re-Check ViewBox
    if (!job.viewBox) {
      if (job.huatu.viewBox) {
        job.viewBox = job.huatu.viewBox;
        job.vbExplicit = true;
      } else {
        job.viewBox = job.calcViewBox();
      }
    }
    if (!job.desc) job.desc = job.huatu.desc;

    this.jobs.push(job);
    return errs;
  }

  buildSvg(buildType: SvgBuildType, jobName?: string | undefined, withSize?: boolean): string {
    const job = this.jobs.find(j => j.name === (jobName ?? "draw"));
    if (job) return job.buildSvg(buildType, withSize);
    else return ""
  }

  buildSvgAsHtml(buildType: SvgBuildType, jobName?: string, indent?: boolean | undefined, withSize?: boolean): string {
    const job = this.jobs.find(j => j.name === (jobName ?? "draw"));
    if (job) return job.buildHtml(buildType, indent, withSize);
    else return ""
  }

  buildSvgStandalone(buildType: SvgBuildType, jobName?: string | undefined, indent?: boolean | undefined, withSize?: boolean): string {
    const job = this.jobs.find(j => j.name === (jobName ?? "draw"));
    if (job) return job.buildSvgStandalone(buildType, indent, withSize);
    else return ""
  }

  /** --------------- Component part ------------------------------------------------------------------------------ */

  resolveComponentDef(name: string, def: string | IHuatuYmlObj): string[] {
    const compDef = new HuatuComponentDef(name, def);
    if (!compDef.isValid) {
      return compDef.errors
        .map(x => x.msgs ? x.msgs.map(msg => `${x.title}: ${msg}`) : [x.title])
        .flat();
    } else {
      // Convert Errors to warnings if any
      if (compDef.errors.length > 0) {
        compDef.errors.forEach(e => {
          this.warnings.push(`Errors Found When resolving component "${name}" => ${e.title}: `
            + (e.msgs && e.msgs.length > 0 ? e.msgs.map((m, idx) => `${idx+1})${m}`).join("; ") : ""));
        });
      }
      // Add the definition
      this.compDefs.push(compDef);
      return [];
    }
  }

  resolveComponentPlacement(name: string, def: string | IHuatuYmlObj): string[] {
    const errors: string[] = [];
    let ivObj: IHuatuYmlObj = {};
    let defToParse: string | IHuatuYmlObj;
    const isIvKey = (key: string) => !!/\$[a-zA-Z][a-zA-Z0-9_]*$/i.exec(key);
    if (typeof def === "string") {
      // Filter out the segments of input vars
      const src = def.split(";")
        .map(x => x.trim())
        .filter(x => !!x);
      const filtered: string[] = [];
      let i = 0;
      while(i < src.length) {
        if (isIvKey(src[i])) {
          if ((i + 1) < src.length && !isIvKey(src[i + 1])) {
            ivObj[src[i]] = src[i + 1];
            i += 2;
          } else {
            i += 1;
          }
        } else {
          filtered.push(src[i]);
          i++;
        }
      }
      defToParse = filtered.join(";");
    } else {
      defToParse = {};
      Object.keys(def).forEach(x => {
        if (x.startsWith("$")) {
          ivObj[x] = def[x];
        } else {
          (defToParse as IHuatuYmlObj)[x] = def[x];
        }
      });
    }
    // Parse it
    const parseRes = parseStrIntoKeyValuePair<IHuatuComponentPlacementParams>(defToParse, HuatuComponentPlacement.optsComponentPlacement);
    const params: IHuatuComponentPlacementParams = parseRes.body;
    if (!params.component) {
      return [`Placement "${name}" Failed, no component definition specified!`];
    }
    const compDef = this.compDefs.find(x => x.name === params.component);
    if (!compDef) {
      return [`Component Definition "${params.component}" not found!`];
    }
    if (!params.location) {
      return [`Location is not provided for Placement "${name}"`];
    }
    const loc = this.resolvePointFromExpr(params.location);
    if (!loc) {
      return [`Component Placement location "${params.location}" cannot be resolved`];
    }
    // Report unhandled params to warnings
    if (parseRes.failedPairs.length > 0) {
      const pairs = parseRes.failedPairs.map((x, i) => `${i+1}) "${x.key}": "${x.value}"`).join(", ");
      this.warnings.push(`Parameters unhandled when making component placement "${name}": ${pairs}`);
    }
    // Handle Input Vars
    const givenIvs: IHuatuComponentInputVars = {};
    const ivNames = Object.keys(ivObj)
      .filter(x => x.startsWith("$"))
      .map(x => x.substring(1))
      .filter(x => !!x);
    ivNames.forEach(ivName => {
      const iv = compDef.inputVars.find(x => x.name === ivName);
      if (iv) {
        let ivVal = ivObj[`$${ivName}`];
        if (!ivVal || typeof ivVal !== "string" || !ivVal.trim()) {
          errors.push(`Input Var [$${ivName}] takes some empty/invalid value!`)
        } else {
          ivVal = ivVal.trim();
          let ivValAsColor = isValidColor(ivVal);
          if (iv.type === "color") {
            if (ivValAsColor) {
              givenIvs[ivName] = ivValAsColor;
            } else {
              errors.push(`"${ivVal}" is not some valid color for Input Var "${ivName}" which is defined as some color`)
            }
          } else if (iv.type === "number") {
            const ivNumber = this.resolveVarExpr(ivVal);
            if (ivNumber !== undefined) {
              givenIvs[ivName] = ivNumber;
            } else {
              errors.push(`"${ivVal}" cannot resolve to be a number for Input Var "${ivName}"`);
            }
          } else {
            // For Text vars, just copy it, no conversion needed
            givenIvs[ivName] = ivVal;
          }
        }
      } else {
        errors.push(`Input Var [$${ivName}] doesn't exist in Component Definition!`);
      }
    })
    let rotDeg: number | undefined;
    if (params.rotDeg) {
      rotDeg = this.resolveVarExpr(params.rotDeg);
      if (rotDeg === undefined) {
        errors.push(`Component Placement Rotate Deg "${params.rotDeg}" cannot be resolved!`);
      }
    }
    // Create the placement
    const placement = new HuatuComponentPlacement(name, loc, compDef, givenIvs, params.mirror, rotDeg, params.refPoint, params.rotateLabel);
    // Adjust mirroring and rotation
    if (!placement.isValid || !placement.huatu!.draw) {
      errors.push(`Placement [${name}] cannot be resolved, there is no drawing body!`);
    } else {
      // Add the placement
      this.compPlacements.push(placement);
    }
    return errors;
  }

  // This function is to resolve the Component Port definitions after the component is defined/placed
  parseComponentPorts(obj: IHuatuYmlObj): string[] {
    if (!obj.ports) return [];
    if (!Array.isArray(obj.ports) || obj.ports.length < 1) return ["The Ports definition must be presented as a list!"];
    const errors: string[] = [];
    const portDefs: string[] = obj.ports;
    portDefs.forEach(p => {
      const parseRes = parseStrIntoKeyValuePair<IHuatuComponentPortParams>(p, HuatuComponentPort.optsComponentPort);
      if (!parseRes.body.name) {
        errors.push(`No Name resolved in port definition: "${p}"`);
      }
      else if (!/^[0-9a-zA-Z]+$/.test(parseRes.body.name)) {
        errors.push(`Port Name can only be combination of a to z, A to Z, and 0 -9, [${parseRes.body.name}] is not qualified, please pick another one!`);
      }
      else if (!parseRes.body.anchor) {
        errors.push(`No Anchor Point resolved in Port Definition "${p}"`);
      }
      else {
        const anchor = this.resolvePointFromExpr(parseRes.body.anchor);
        if (!anchor) {
          errors.push(`Anchor Point Definition "${parseRes.body.anchor}" cannot be resolved!`);
        } else if (this.compPorts.find(x => x.name === parseRes.body.name)) {
          errors.push(`Port "${parseRes.body.name}" has already been defined!`);
        } else {
          const newPort = new HuatuComponentPort(parseRes.body.name, anchor);
          if (parseRes.body.attr) newPort.attr = parseRes.body.attr as any;
          if (parseRes.body.rayDeg) {
            let deg = this.resolveVarExpr(parseRes.body.rayDeg);
            if (deg === undefined) {
              errors.push(`[comp port] Ray Deg expression '${parseRes.body.rayDeg}' cannot be resolved!`);
            } else {
              newPort.rayDeg = AngDeg.roundDeg(deg);
            }
          }
          if (parseRes.body.minHoldLen) {
            let len = this.resolveVarExpr(parseRes.body.minHoldLen);
            if (len === undefined) {
              errors.push(`[comp port] Hold length expression '${parseRes.body.minHoldLen}' cannot be resolved!`)
            } else {
              newPort.minHoldLen = len;
            }
          }
          this.compPorts.push(newPort);
        }
      }
    })
    return errors;
  }


  /** --------------- Static Methods ------------------------------------------------------------------------------ */

  static tryDesc(def: string): string | undefined {
    const match = /^desc\s*;(.*)$/i.exec(def);
    if (match) return match[1].trim();
    else return undefined;
  }

  static resolveConfig(cfg: IHuatuConfigInYml) {
    const config: IHuatuConfig = {};
    config.labelBackground = isValidColor(
         cfg.labelBackground
      || cfg.labelBackgroundColor
      || cfg.labelBg
      || cfg.labelBgColor);
    config.labelBorder = isValidColor(cfg.labelBorder || cfg.labelBorderColor);
    config.markCenters = booleanCheck(cfg.markCenters);
    config.markBezierAuxLines = booleanCheck(cfg.markBezierAuxLines);
    config.markNamedPoints = isValidColor(cfg.markNamedPoints);
    config.markPathPoints = isValidColor(cfg.markPathPoints);
    if (cfg.markSize) config.markSize = parseFloat(cfg.markSize) ?? 2;  // Default Size of Marking Point
    config.markPositions = isValidColor(cfg.markPositions || cfg.markAnchors);
    config.printUnusedModule = booleanCheck(cfg.printUnusedModule);
    config.showBBox = isValidColor(cfg.showBBox);

    // TODO: For more configurations in the future, please append here
    return config;
  }

  static buildEmbeddedStyles(): string {
    if (!globalThis.wthtJobBuildId) {
      globalThis.wthtJobBuildId = genHex(8);
    }
    const styles: string[] = [];
    // Class label-border/box
    let attrs: string[][] = [];
    const htConfig = globalThis.wtHuatuConfig;
    if (htConfig) {
      if (htConfig.labelBackground) attrs.push(["fill", htConfig.labelBackground]);
      else attrs.push(["fill", "none"]);
      if (htConfig.labelBorder) attrs.push(
        ["stroke", htConfig.labelBorder],
        ["stroke-width", "0.2"]       // Here, the label box border could only be 0.2
      );
    } else {
      attrs.push(["fill", "none"]);
    }
    const buildStyle = (clsName: string) => `.${clsName}-${globalThis.wthtJobBuildId} { ${attrs.map(a => `${a[0]}: ${a[1]};`).join(" ")} }`;

    styles.push(buildStyle("wthuatu-label-box"));

    // Label Container
    attrs = [
      ["width", "100%"],
      ["height", "100%"],
      ["padding", "0"],
      ["display", "flex"],
    ];
    styles.push(buildStyle("huatu-label-container"));

    // Label Text
    attrs = [
      ["margin", "auto 0"],
      ["text-align", "center"],
      ["max-height", "100%"],
      ["width", "100%"],
      ["line-height", "1.0"],
    ];
    styles.push(buildStyle("huatu-label-text"));

    // Class of Position/Anchor Marks
    attrs = [];
    if (htConfig && htConfig.markPositions) {
      attrs.push(["fill", htConfig.markPositions])
      styles.push(buildStyle("wthuatu-mark-position"));
    }

    // Class of Centers
    attrs = [];
    if (htConfig && htConfig.markCenters) {
      attrs.push(
        ["stroke", "grey"],
        ["stroke-width", "0.1"]
        );
      styles.push(buildStyle("wthuatu-mark-centers"));
    }

    // Class of Bezier Control Lines and Points
    attrs = [];
    if (htConfig && htConfig.markBezierAuxLines) {
      attrs.push(
        ["fill", "aqua"],
        ["stroke", "aqua"],
        ["stroke-width", "0.1"]
      );
      styles.push(buildStyle("wthuatu-mark-bezier-control"));
    }

    // Class of Named Points
    attrs = [];
    if (htConfig && htConfig.markNamedPoints) {
      attrs.push(["fill", htConfig.markNamedPoints]);
      styles.push(buildStyle("wthuatu-mark-named-points"));
    }

    // Class of Path Points
    attrs = [];
    if (htConfig && htConfig.markPathPoints) {
      attrs.push(["fill", htConfig.markPathPoints]);
      styles.push(buildStyle("wthuatu-mark-path-points"));
    }

    // Class of BBOX
    attrs = [];
    if (htConfig && htConfig.showBBox) {
      attrs.push(["fill", "none"], ["stroke", htConfig.showBBox], ["stroke-width", "0.05"]);
      styles.push(buildStyle("wthuatu-bbox-ref"));
    }

    // TODO: make more if required

    return styles.join("\n") ;
  }

  static RESERVED_NAMES = [
    "sin", "cos", "tan", "atan", "asin", "acos",
    "dsin","dcos","dtan","datan","dasin","dacos",
    "exp", "log", "log10","sqrt",
    "pi", "math",
    "this", "globalthis",
  ];

}
