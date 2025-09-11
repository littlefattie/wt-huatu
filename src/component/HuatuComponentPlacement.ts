
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
  IHuatuComponentPlacement,
  IHuatuComponentInputVars,
  IHuatuComponentPort,
  IHuatuInputVar,
  HuatuComponentPlacementRefPointType,
  HuatuComponentPlacementMirrorType,
  IHuatuComponentPortSettled,
} from "./IHuatuComponent.js";

import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";
import { HuatuDrawingGroup } from "../huatu/HuatuDrawingGroup.js";
import { HuatuComponentDef } from "./HuatuComponentDef.js";
import { WtHuatu } from "../huatu/Huatu.js";
import { resolveYmlModelOfComponent } from "../huatu/HuatuParser.js";
import { type IKeyValueOptions } from "../tools/utils.js";
import { HuatuLabel } from "../huatu/HuatuLabel.js";
import LineSeg from "../geometry/LineSeg.js";
import Vector from "../geometry/Vector.js";
import Line from "../geometry/Line.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { WtMath } from "../math/WtMath.js";

export class HuatuComponentPlacement implements IHuatuComponentPlacement {
  isValid: boolean = false;
  name: string = "NONAME";
  location: ISvgPoint = new SvgPoint(0, 0);
  def: HuatuComponentDef;
  huatuDef?: IHuatuYmlObj;
  huatu?: WtHuatu;
  givenInputVars: IHuatuComponentInputVars = {};
  ports: IHuatuComponentPort[] = [];
  mirror?: HuatuComponentPlacementMirrorType;
  rotDeg?: number;
  errors: IHuatuResolvingError[] = [];
  refPointType: HuatuComponentPlacementRefPointType = "origin";
  rotateLabel?: boolean | undefined;
  portsSettled: IHuatuComponentPortSettled[] = [];

  constructor(
    name: string,
    location: ISvgPoint,
    def: HuatuComponentDef,
    inputVars?: IHuatuComponentInputVars,
    mirror?: HuatuComponentPlacementMirrorType,
    rotateDeg?: number,
    refPointType?: HuatuComponentPlacementRefPointType,
    rotateLabel?: boolean,
  ) {
    this.def = def;
    if (!def.isValid) {
      this.errors.push({
        title: `Component Definition [${def.name}] is invalid, you cannot place it!`
      })
    } else {
      this.name = name;
      this.location = location;
      if (inputVars) this.givenInputVars = {...inputVars};
      const defObj = def.replaceInputVars(this.givenInputVars);
      if (!Array.isArray(defObj)) {
        this.huatuDef = defObj;
        this.huatu = resolveYmlModelOfComponent(this.huatuDef);
        if (this.huatu.resolvingErrors.length > 0) {
          this.errors.push({
            title: `Error when placing Component "${name}" [Def Component: ${def.name}]!`
          },
          ...this.huatu.resolvingErrors);
        } else {
          const portErrors = this.huatu.parseComponentPorts(this.huatuDef);
          if (portErrors.length > 0) {
            this.errors.push({
              title: `Port resolving errors when placing component "${name}"`,
              msgs: portErrors,
            })
          } else {
            // binding Huatu Resolved ports to ports
            this.ports = this.huatu.compPorts;
            // Finally when no errors, mark the placement as valid
            this.isValid = true;
            // Set other parameters
            if (mirror && HuatuComponentPlacement.MIRROR_TYPES.includes(mirror)) {
              this.setMirror(mirror);
            }
            if (rotateDeg) {
              this.rotate(rotateDeg);
            }
            if (refPointType && HuatuComponentPlacement.REF_POINT_TYPES.includes(refPointType)) {
              this.refPointType = refPointType;
            }
            if (rotateLabel) {
              this.rotateLabel = true;
            }
          }
        }
      } else {
        this.errors.push({
          title: `Component Placing Error!`,
          msgs: defObj
        })
      }
    }
    // Adjust labels
    this.adjustLabels();
    // Settle Ports
    this.settlePorts();
  }

  setMirror(mirrorType: HuatuComponentPlacementMirrorType) {
    this.mirror = mirrorType;
  }

  rotate(deg: number) {
    this.rotDeg = deg;
  }

  getRefPoint() {
    if (this.refPointType === "origin") return SvgPoint.ORIGIN;
    if (!this.huatu || !this.huatuDef || !this.isValid || !this.huatu.draw) return SvgPoint.ORIGIN;
    let vb = this.huatu.draw.vbExplicit ? this.huatu.draw.viewBox! : this.huatu.draw.getViewBoxWithoutLabels();
    return this.refPointType === "center" ? vb.getCenter() : SvgPoint.ORIGIN;
  }

  adjustLabels() {
    if (!this.isValid || !this.huatu || !this.huatu!.draw) return;
    this.huatu.draw.drawings.filter(x => x instanceof HuatuLabel)
        .forEach(x => (x as HuatuLabel).adjustForComponent(this));
  }

  settlePorts() {
    const rp = this.getRefPoint();
    this.portsSettled = this.ports.map(p => {
      let pos: ISvgPoint = SvgPoint.from(p.anchor);
      let rayDeg = p.rayDeg;
      if (this.mirror === "x") {
        pos.x = 2 * rp.x - pos.x;
        rayDeg = 180 - rayDeg;
      } else if (this.mirror === "y") {
        pos.y = 2 * rp.y - pos.y;
        rayDeg = - rayDeg;
      } else if (this.mirror === "xy") {
        pos.x = 2 * rp.x - pos.x;
        pos.y = 2 * rp.y - pos.y;
        rayDeg = rayDeg + 180;
      };
      if (this.rotDeg) {
        rayDeg += this.rotDeg;
        pos = new Vector(pos.x - rp.x, pos.y - rp.y)
          .rotateByDeg(this.rotDeg)
          .addVector(new Vector(rp.x, rp.y))
          .toPoint();
      }
      let lsAng = AngDeg.fitDeg(rayDeg);
      let anchorPoint = new SvgPoint(pos.x - rp.x + this.location.x, pos.y - rp.y + this.location.y);
      const settled: IHuatuComponentPortSettled = {
        name: p.name,
        anchor: anchorPoint,
        minHoldLen: p.minHoldLen,
        lineAng: lsAng,
        lineDeg: AngDeg.ang2Deg(lsAng),
        freeStart: new Line(anchorPoint, lsAng).getPointByLen(p.minHoldLen),
        isH: WtMath.isEqual(AngDeg.DEG0,  lsAng) || WtMath.isEqual(AngDeg.DEG180, lsAng) || WtMath.isEqual(AngDeg.DEG360, lsAng),
        isV: WtMath.isEqual(AngDeg.DEG90, lsAng) || WtMath.isEqual(AngDeg.DEG270, lsAng),
      }
      return settled;
    });
  }

  static REF_POINT_TYPES = ["center", "origin"];
  static MIRROR_TYPES = ["x", "y", "xy"];
  static optsComponentPlacement: IKeyValueOptions = {
    keys: [
      ["component", "comp", "def"],
      ["location", "at"],
      ["rotDeg", "rotate", "rotateDeg"],
      ["mirror"],
      ["refPoint", "ref"],
      ["rotateLabel"],
    ],
    allowAppend: [],
    numbers: [],
    ints: [],
    booleans: ["rotateLabel"],
    qualifiers: {
      "mirror": HuatuComponentPlacement.MIRROR_TYPES,
      "refPoint": HuatuComponentPlacement.REF_POINT_TYPES,
    },
    blindGuess: {
      "component": x => x,
      "location": x => x,
      "mirror": HuatuComponentPlacement.MIRROR_TYPES,
      "refPoint": HuatuComponentPlacement.REF_POINT_TYPES,
    },
  }
}

export interface IHuatuComponentPlacementParams {
  component?: string;
  location?: string;
  rotDeg?: string;
  mirror?: HuatuComponentPlacementMirrorType;
  refPoint?: HuatuComponentPlacementRefPointType;
  rotateLabel?: boolean;
}
