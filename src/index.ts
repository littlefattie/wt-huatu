import { AngDeg } from "./geometry/AngDeg.js";
import LineSeg from "./geometry/LineSeg.js";
import Vector from "./geometry/Vector.js";
import { PathCircle } from "./path/PathCircle.js";
import { PathLine } from "./path/PathLine.js";
import { PathLines } from "./path/PathLines.js";
import { SvgPoint } from "./svg/SvgPoint.js";
import { WtMath } from "./math/WtMath.js";
import { WtHuatu } from "./huatu/Huatu.js";
import { HuatuCompDrawing } from "./huatu/HuatuCompDrawing.js";
import { HuatuDrawing } from "./huatu/HuatuDrawing.js";
import { HuatuJob } from "./huatu/HuatuJob.js";
import { HuatuLabel } from "./huatu/HuatuLabel.js";
import { HuatuComponentDef } from "./component/HuatuComponentDef.js";
import { HuatuComponentPlacement } from "./component/HuatuComponentPlacement.js";
import type { HuatuComponentPlacementMirrorType, HuatuComponentPlacementRefPointType } from "./component/IHuatuComponent.js";
import { resolveYmlModel } from "./huatu/HuatuParser.js";
import { HuatuPath } from "./huatu/HuatuPath.js";
import { HuatuStyle } from "./huatu/HuatuStyle.js";
import { HuatuYml } from "./huatu/HuatuYml.js";
import type { IHuatuResolvingError } from "./huatu/IHuatu.js";
import type { IHuatuYmlObj } from "./huatu/IHuatuYml.js";
import type { ISvgPoint } from "./svg/ISvg.js";
import { booleanCheck } from "./tools/utils.js";

export { WtHuatu } from "./huatu/Huatu.js";

export const renderWtHuatuYml = async (yml: string) => {
  const ymlModel = HuatuYml.parseYml(yml);
  if (ymlModel.succeeded) {
    const ht = await resolveYmlModel(ymlModel.rootObj);
    return ht.buildSvgAsHtml("direct", "draw", true);
  }
  return `<div class="huatu-msg-error">Error Happened when resolving YML:\n<ul>`
    + ymlModel.errorMessages.map(x => `<li>Ln ${x.lineNumber}, ${x.message}</li>`).join("\n")
    + `\n</ul>\n</div>`;
}

export interface IWtHuatuComponentPreviewOptions {
  // Flag to mark if the component is mirrored, either x or y axis, or both x and y axis
  mirror?: HuatuComponentPlacementMirrorType;

  // Some rotation supported when placing the component
  rotDeg?: number;

  // Whether rotate the label(s) when rotating the component
  rotateLabel?: boolean;

  // Show Center/Origin Marks or not
  showMarks?: boolean;

  // Ignore Configs
  ignoreConfig?: boolean;
}

export interface IWtHuatuRenderOptions {
  // Which Job(s) are specified to render
  job?: string | string[];

  // Scale ratio
  scale?: number;

  // Output Format
  outputFormat?: "html" | "svg";

  // Component preview options
  componentPreview?: IWtHuatuComponentPreviewOptions;
}

export interface IWtHuatuResolvingResult {
  // The overall Huatu Object
  huatu?: WtHuatu;

  // Errors/warnings/infos
  errors: IHuatuResolvingError[];
  warnings: string[];
  infos: string[];
}

export interface IWtHuatuRenderedJob {
  jobName: string;
  html: string;
  width?: number;
  height?: number;
  scale?: number;
}

export interface IWtHuatuRenderResult extends IWtHuatuResolvingResult {
  // A copy of the input YML string
  inputYml: string;

  // Whether the YML parsing successful
  ymlParseSucceeded: boolean;

  // The parsed root obj of YML input
  ymlParsedObj?: IHuatuYmlObj;

  // The type of the input, it could be component, or Huatu, or unknown if YML parsing failed
  type: "huatu" | "component" | "unknown";

  // The rendered HTML as a single string, incase only one job or no job specified, it would be the job "draw"
  rendered: IWtHuatuRenderedJob[];
}

export interface ICompPreviewParams extends IHuatuYmlObj {
  mirror?: string;
  rotDeg?: string;
  refCenter?: string;
  rotateLabel?: string;
  scale?: string;
}

export interface ICompPreviewParamsReal {
  mirror?: HuatuComponentPlacementMirrorType;
  rotDeg?: number;
  refCenter?: HuatuComponentPlacementRefPointType;
  rotateLabel?: boolean;
  scale?: number;
}


export const renderAComponent = (compObj: IHuatuYmlObj, opts?: IWtHuatuComponentPreviewOptions): IWtHuatuResolvingResult => {
  const res: IWtHuatuResolvingResult = {
    errors: [],
    warnings: [],
    infos: [],
  };
  // Resolve Definition
  const compDef = new HuatuComponentDef("COMP_DEF", compObj);
  res.errors.push(...compDef.errors);
  if (!compDef.isValid)  {
    res.errors.push({title: `Component Definition resolving Failed!`})
    return res;
  }
  // Make Placement
  const plc = new HuatuComponentPlacement(
    "COMP_PLACEMENT",
    new SvgPoint(0, 0),
    compDef,
    {},
    opts?.mirror,
    opts?.rotDeg,
    undefined,
    opts?.rotateLabel
  );
  if (!plc.isValid || !plc.huatu?.draw) {
    res.errors.push({title: `There is no draw defined in Component Design!`});
    return res;
  }

  const draw = plc.huatu.draw;
  const pCenter = draw.getViewBoxWithoutLabels().getCenter();
  // Add port indicators
  const PORT_MARK_WIDTH = 10;
  if (plc.ports.length > 0) {
    const styPort = new HuatuStyle();
    styPort.strokeColor = "maroon";
    styPort.strokeWidth = PORT_MARK_WIDTH;
    styPort.strokeOpacity = 0.5;
    styPort.strokeLineCap = "round";
    const styPortPos = new HuatuStyle();
    styPortPos.fillColor = "cc";
    for (let i = 0; i < plc.ports.length; i++) {
      const port = plc.ports[i];
      const pEnd = Vector.fromPoint(port.anchor).addVector(Vector.fromLenAng(port.minHoldLen, AngDeg.deg2Ang(port.rayDeg)));
      const lsPort = new PathLine(port.anchor.x, port.anchor.y, pEnd.x, pEnd.y);
      draw.drawings.push(new HuatuDrawing(new HuatuPath(lsPort), styPort));
      const portPos = new PathCircle(port.anchor.x, port.anchor.y, 1);
      draw.drawings.push(new HuatuDrawing(new HuatuPath(portPos), styPortPos));
    }
  }
  // Add the cross sign at center
  if (opts?.showMarks) {
    const CROSS_PLUS_MARK_LENGTH = 5;
    const cross = new PathLines();
    cross.addLine(
      {x: pCenter.x + CROSS_PLUS_MARK_LENGTH, y: pCenter.y + CROSS_PLUS_MARK_LENGTH },
      {x: pCenter.x - CROSS_PLUS_MARK_LENGTH, y: pCenter.y - CROSS_PLUS_MARK_LENGTH });
    cross.addLine(
      {x: pCenter.x - CROSS_PLUS_MARK_LENGTH, y: pCenter.y + CROSS_PLUS_MARK_LENGTH },
      {x: pCenter.x + CROSS_PLUS_MARK_LENGTH, y: pCenter.y - CROSS_PLUS_MARK_LENGTH });
    const styCross = new HuatuStyle();
    styCross.strokeColor = "magenta";
    styCross.strokeWidth = 0.1;
    draw.drawings.push(new HuatuDrawing(new HuatuPath(cross), styCross));
    // Add the plus sign at origin
    const plus = new PathLines();
    plus.addLine({x: -CROSS_PLUS_MARK_LENGTH, y:   0}, {x: CROSS_PLUS_MARK_LENGTH, y:  0});
    plus.addLine({x:   0, y: -CROSS_PLUS_MARK_LENGTH}, {x:  0, y: CROSS_PLUS_MARK_LENGTH});
    const styPlus = new HuatuStyle();
    styPlus.strokeColor = "aqua";
    styPlus.strokeWidth = 0.1;
    draw.drawings.push(new HuatuDrawing(new HuatuPath(plus), styPlus));
  }

  // Make a Huatu to show the placement
  const ht = new WtHuatu();
  if (opts?.ignoreConfig) {
    ht.config = undefined;
    plc.huatu.config = undefined;
  } else {
    if (plc.huatu.config) {
      ht.config = plc.huatu.config;
    }
  }
  const htDraw = new HuatuJob(ht, "draw");
  htDraw.drawings.push(new HuatuDrawing(new HuatuCompDrawing(plc)));
  // Attach Port Names to Port Indicators
  plc.portsSettled.forEach(port => {
    const lsPort = LineSeg.fromXYs(
      port.anchor.x    + plc.location.x, port.anchor.y    + plc.location.y,
      port.freeStart.x + plc.location.x, port.freeStart.y + plc.location.y
    );
    const lblWidth = WtMath.isZero(lsPort.len) ? 25 : lsPort.len;
    const lblFontSize = PORT_MARK_WIDTH * 0.6;
    const lbl = new HuatuLabel(port.name, lblWidth, lblFontSize * 1.2);
    lbl.location = lsPort.middle;
    lbl.setAnchor("center");
    // Adjust the label's rotate angle if the port indicator is rotated
    let rotAng = AngDeg.fitAng(port.lineAng);
    if (rotAng > AngDeg.DEG90 && rotAng <= AngDeg.DEG180) rotAng = rotAng + AngDeg.DEG180;
    else if (rotAng > AngDeg.DEG180 && rotAng < AngDeg.DEG270) rotAng = rotAng - AngDeg.DEG180;
    lbl.rotDeg = AngDeg.ang2Deg(rotAng);
    lbl.textAlign = "center";
    lbl.fontSize = lblFontSize;
    lbl.color = "yellow";
    htDraw.drawings.push(lbl);
  })
  // Update Top-Level Job viewbox
  htDraw.viewBox = htDraw.calcViewBox();
  ht.jobs.push(htDraw);
  ht.draw = ht.jobs[0];
  // Collect errors/warnings/infos
  res.errors.push(...ht.resolvingErrors);
  res.warnings.push(...ht.warnings);
  res.infos.push(...ht.infos);

  // Assign the top level Huatu and return
  res.huatu = ht;
  return res;
}

export const renderYmlInput = async (yml: string, opts: IWtHuatuRenderOptions): Promise<IWtHuatuRenderResult> => {
  const ymlParsed = HuatuYml.parseYml(yml);
  const result: IWtHuatuRenderResult = {
    inputYml: yml,
    ymlParseSucceeded: ymlParsed.succeeded,
    errors: [],
    warnings: [],
    infos: [],
    type: "unknown",
    rendered: [],
  }
  if (!result.ymlParseSucceeded) {
    result.errors.push({
      title: `Error Happened when resolving input YML:`,
      msgs: ymlParsed.errorMessages.map(x => `Ln ${x.lineNumber}, ${x.message}`)
    });
    return result;
  } else if (!ymlParsed.rootObj){
    result.errors.push({
      title: `Nothing valid resolved from your Input YML`,
    })
    return result;
  } else {
    result.ymlParsedObj = ymlParsed.rootObj;
  }
  // Rename to simple calling
  const ymlObj = result.ymlParsedObj;
  // Resolve Type
  const objType = ymlObj["type"];
  if (objType && typeof objType === "string" && objType.toLowerCase() === "component") {
    result.type = "component";
  } else if ((ymlObj["inputVars"] && Object.keys(ymlObj["inputVars"]).length > 0) ||
             (ymlObj["ports"]     && Object.keys(ymlObj["ports"]).length > 0)) {
    result.type = "component";
  } else {
    result.type = "huatu";
  }
  // Render if it is Component
  if (result.type === "component") {
    const resComp = renderAComponent(ymlObj, opts.componentPreview);
    if (resComp.huatu) {
      result.huatu = resComp.huatu;
      const job2render = result.huatu.jobs[0];  // The only one job
      result.rendered.push({
        jobName: "draw",
        html: opts.outputFormat === "html" ? job2render.buildHtml("direct") : job2render.buildSvg("direct"),
        width:  job2render.width  || job2render.viewBox?.w,
        height: job2render.height || job2render.viewBox?.h,
      });
    };
    result.errors.push(...resComp.errors);
    result.warnings.push(...resComp.warnings);
    result.infos.push(...resComp.infos);
    return result;
  }
  // Render if it is a Huatu
  const ht = await resolveYmlModel(ymlObj);
  result.huatu = ht;
  result.errors.push(...ht.resolvingErrors);
  result.warnings.push(...ht.warnings);
  result.infos.push(...ht.infos);

  let jobs: HuatuJob[] = [];
  if (opts.job) {
    if (typeof opts.job === "string") {
      let job = ht.jobs.find(x => x.name === opts.job);
      if (!job) {
        if (opts.job.toLowerCase() === "all") {
          jobs = ht.jobs;
        }
      } else {
        jobs.push(job);
      }
    } else if (Array.isArray(opts.job)) {
      jobs = ht.jobs.filter(x => opts.job?.includes(x.name));
    }
  } else {
    // If no job option specified, then return all the jobs
    jobs = ht.jobs;
  }

  const buildJobSvg = (job: HuatuJob) => {
    let withSize = false;
    let width: number | undefined;
    let height: number | undefined;
    if (opts.scale) {
      const scale = opts.scale <= 0 ? 1 : opts.scale;
      width = job.width || job.viewBox?.w;
      height = job.height || job.viewBox?.h;
      if (width || height) {
        withSize = true;
        if (width) width *= scale;
        if (height) height *= scale;
      }
    }
    return withSize ? job.buildSvg("direct", withSize, width, height) : job.buildSvg("direct");
  }
  result.rendered = jobs.map(j => ({
    jobName: j.name,
    html: opts.outputFormat === "html" ? j.buildHtml("direct") : buildJobSvg(j),
    width: j.width || j.viewBox?.w,
    height: j.height || j.viewBox?.h,
  }))
  return result;
}

export const renderCompPreviewSvg = (def: IHuatuYmlObj, previewParams?: ICompPreviewParams) => {
  // The function to translate parameters
  const parseCompPreviewParams = (params: ICompPreviewParams) => {
    const realParams: ICompPreviewParamsReal = {};
    if (params.mirror) {
      params.mirror = params.mirror.toLowerCase();
      if (params.mirror === "x") realParams.mirror = 'x';
      else if (params.mirror === "y") realParams.mirror = 'y';
      else if (params.mirror === "xy") realParams.mirror = "xy";
    }
    if (params.rotDeg) {
      let deg = parseFloat(params.rotDeg);
      if (deg) {
        deg = AngDeg.roundDeg(deg);
        realParams.rotDeg = deg;
      }
    }
    if (params.scale) {
      realParams.scale = WtMath.makeInRange(parseFloat(params.scale), 0.2, 200);
    }
    if (booleanCheck(params.refCenter)) realParams.refCenter = "center";
    if (booleanCheck(params.rotateLabel)) realParams.rotateLabel = true;
    return realParams;
  }

  const CROSS_PLUS_MARK_LENGTH = 5;
  const compDef = new HuatuComponentDef("COMP_DEF", def);
  if (!compDef.isValid) {
    return compDef.errors
      .map(e => e.msgs ? e.msgs.map(m => e.title + ' > ' + m) : [e.title])
      .flat();
  }
  let params: ICompPreviewParamsReal | undefined;
  if (previewParams) {
    params = parseCompPreviewParams(previewParams);
  }
  const plc = new HuatuComponentPlacement(
    "COMP_PLACEMENT",
    new SvgPoint(0, 0),
    compDef,
    {},
    params?.mirror,
    params?.rotDeg,
    params?.refCenter,
    params?.rotateLabel
  );
  if (!plc.isValid || !plc.huatu?.draw) return ["Component Definition invalid!"];
  const draw = plc.huatu.draw;
  const pCenter = draw.getViewBoxWithoutLabels().getCenter();
  
  // Make a Huatu to show the placement
  const ht = new WtHuatu();
  if (plc.huatu.config) {
    ht.config = plc.huatu.config;
  }
  const htDraw = new HuatuJob(ht, "draw");
  htDraw.drawings.push(new HuatuDrawing(new HuatuCompDrawing(plc)));

  // Add port indicators
  const PORT_MARK_WIDTH = 10;
  if (plc.ports.length > 0) {
    // Prepare styles
    const styPort = new HuatuStyle();
    styPort.strokeColor = "maroon";
    styPort.strokeWidth = PORT_MARK_WIDTH;
    styPort.strokeOpacity = 0.5;
    styPort.strokeLineCap = "round";
    const styPortPos = new HuatuStyle();
    styPortPos.fillColor = "yellow";
    // Add indicators
    for (let i = 0; i < plc.ports.length; i++) {
      const port = plc.portsSettled[i];
      const pEnd = Vector.fromPoint(port.anchor).addVector(Vector.fromLenAng(port.minHoldLen, AngDeg.deg2Ang(port.lineDeg)));
      const lsPort = new PathLine(port.anchor.x, port.anchor.y, pEnd.x, pEnd.y);
      htDraw.drawings.push(new HuatuDrawing(new HuatuPath(lsPort), styPort));
      const portPos = new PathCircle(port.anchor.x, port.anchor.y, 1);
      htDraw.drawings.push(new HuatuDrawing(new HuatuPath(portPos), styPortPos));
    }
  }
  let pmCenter: ISvgPoint = params?.refCenter ? SvgPoint.ORIGIN : new SvgPoint(pCenter.x, pCenter.y);
  let pmOrigin: ISvgPoint = params?.refCenter ? new SvgPoint(-pCenter.x, -pCenter.y) : SvgPoint.ORIGIN;
  if (params?.mirror){
    if (params.mirror.includes("x")) {
      pmCenter.x = -pmCenter.x;
      pmOrigin.x = -pmOrigin.x;
    }
    if (params.mirror.includes("y")) {
      pmCenter.y = -pmCenter.y;
      pmOrigin.y = -pmOrigin.y;
    }
  } 
  if (params?.rotDeg) {
    pmCenter = new Vector(pmCenter.x, pmCenter.y).rotateByDeg(params.rotDeg).toPoint();
    pmOrigin = new Vector(pmOrigin.x, pmOrigin.y).rotateByDeg(params.rotDeg).toPoint();
  }
  // Add the cross sign at center
  const cross = new PathLines();  
  cross.addLine(
    {x: pmCenter.x + CROSS_PLUS_MARK_LENGTH, y: pmCenter.y + CROSS_PLUS_MARK_LENGTH },
    {x: pmCenter.x - CROSS_PLUS_MARK_LENGTH, y: pmCenter.y - CROSS_PLUS_MARK_LENGTH });
  cross.addLine(
    {x: pmCenter.x - CROSS_PLUS_MARK_LENGTH, y: pmCenter.y + CROSS_PLUS_MARK_LENGTH },
    {x: pmCenter.x + CROSS_PLUS_MARK_LENGTH, y: pmCenter.y - CROSS_PLUS_MARK_LENGTH });
  const styCross = new HuatuStyle();
  styCross.strokeColor = "magenta";
  styCross.strokeWidth = 0.1;
  htDraw.drawings.push(new HuatuDrawing(new HuatuPath(cross), styCross));
  // Add the plus sign at origin
  const plus = new PathLines();
  plus.addLine({x: pmOrigin.x - CROSS_PLUS_MARK_LENGTH, y: pmOrigin.y}, {x: pmOrigin.x + CROSS_PLUS_MARK_LENGTH, y: pmOrigin.y});
  plus.addLine({x: pmOrigin.x, y: pmOrigin.y - CROSS_PLUS_MARK_LENGTH}, {x: pmOrigin.x, y: pmOrigin.y + CROSS_PLUS_MARK_LENGTH});
  const styPlus = new HuatuStyle();
  styPlus.strokeColor = "aqua";
  styPlus.strokeWidth = 0.1;
  htDraw.drawings.push(new HuatuDrawing(new HuatuPath(plus), styPlus));
  // Attach Port Names to Port Indicators
  plc.portsSettled.forEach(port => {
    const lsPort = LineSeg.fromXYs(
      port.anchor.x    + plc.location.x, port.anchor.y    + plc.location.y,
      port.freeStart.x + plc.location.x, port.freeStart.y + plc.location.y
    );
    const lblWidth = WtMath.isZero(lsPort.len) ? 25 : lsPort.len;
    const lblFontSize = PORT_MARK_WIDTH * 0.6;
    const lbl = new HuatuLabel(port.name, lblWidth, lblFontSize * 1.2);
    lbl.location = lsPort.middle;
    lbl.setAnchor("center");
    // Adjust the label's rotate angle if the port indicator is rotated
    let rotAng = AngDeg.fitAng(port.lineAng);
    if (rotAng > AngDeg.DEG90 && rotAng <= AngDeg.DEG180) rotAng = rotAng + AngDeg.DEG180;
    else if (rotAng > AngDeg.DEG180 && rotAng < AngDeg.DEG270) rotAng = rotAng - AngDeg.DEG180;
    lbl.rotDeg = AngDeg.ang2Deg(rotAng);
    lbl.textAlign = "center";
    lbl.fontSize = lblFontSize;
    lbl.color = "yellow";
    htDraw.drawings.push(lbl);
  })
  // Update Top-Level Job viewbox
  htDraw.viewBox = htDraw.calcViewBox();
  ht.jobs.push(htDraw);
  ht.draw = ht.jobs[0];
  return params?.scale ? htDraw.buildSvgOfScale("direct", params.scale) : htDraw.buildSvg("direct", true);
}
