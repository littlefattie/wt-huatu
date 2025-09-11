
import type {
  IHuatuPoint,
  IHuatuSymbol,
  IHuatuDrawing,
  IHuatuLabel,
  IHuatuStyle,
  IHuatuTransform,
  IHuatuConfig,
  IHuatuFinalDraw,
  SvgBuildType,
  IHuatuLabelStyle,
  IHuatuLabelStylePure,
} from "./IHuatu.js";

import Point from "../geometry/Point.js";
import { SvgPoint } from "../svg/SvgPoint.js";
import type { ISvgBBox, ISvgPoint } from "../svg/ISvg.js";
import { SvgBBox } from "../svg/SvgBBox.js";
import { renderKatexMixedText } from "../tools/katex.js";
import { HuatuTransform } from "./HuatuTransform.js";
import Vector from "../geometry/Vector.js";
import { WtMath } from "../math/WtMath.js";
import {
  HuatuLabelStyle,
  type IHuatuLabelStyleParams
} from "./HuatuLabelStyle.js";
import type { IHuatuComponentPlacement } from "../component/IHuatuComponent.js";
import { AngDeg } from "../geometry/AngDeg.js";
import { genHex } from "../tools/gen-id.js";

export interface IHuatuLabelParams extends IHuatuLabelStyleParams {
  location?: string;
  offset?: string;
  anchor?: string;
  width?: string;
  height?: string;
  rotDeg?: number;
  bgColor?: string;
  borderColor?: string;
}

export class HuatuLabel implements IHuatuLabel, IHuatuFinalDraw {
  static ANCHOR_POSITIONS: string[] = [
    "tl", "topleft",
    "tm", "topmiddle",
    "tr", "topright",
    "ml", "middleleft",
    "mm", "center", "c", "middlemiddle",
    "mr", "middleright",
    "bl", "bottomleft",
    "bm", "bottommiddle",
    "br", "bottomright"
  ];
  static DEFAULT_WIDTH = 320;       // 20 Chars, 16 each
  static DEFAULT_FONT_SIZE = 16;

  text: string;
  width: number = 0;
  height: number = 0;

  location: ISvgPoint = new SvgPoint(0, 0);
  rotDeg: number = 0;
  anchorPos: string = "tl";
  anchorX = 1;
  anchorY = 1;
  anchorOffset: ISvgPoint = new SvgPoint(0, 0);
  compRotDeg?: number = 0;
  compRefPoint?: ISvgPoint;

  styles: HuatuLabelStyle[] = [];

  color?: string;
  font?: string;
  fontSize?: number;
  textAlign?: string;
  bold?: boolean;
  italic?: boolean;
  addLine?: string;
  lineHeight?: number;

  bgColor?: string;

  // TODO: In the future, please make it possible to use stylish borders, i.e. dashed, and settable width
  borderColor?: string;

  constructor(text: string, width?: number, height?: number) {
    this.text = text;
    // If no width or height specified, it will use the default one
    if (width) this.width = Math.abs(width);
    else this.width = HuatuLabel.DEFAULT_WIDTH;      // Default value
    if (height) this.height = Math.abs(height);
    else this.height = Math.ceil(text.length / 20) * HuatuLabel.DEFAULT_FONT_SIZE;
  }

  // Calculate the real position of the label, offset added
  getRealLocation(): ISvgPoint {
    const locNoRotate = new SvgPoint(this.location.x + this.anchorOffset.x,this.location.y + this.anchorOffset.y);
    if (!this.compRotDeg) return locNoRotate;
    if (!this.compRefPoint) return locNoRotate;
    return new Vector(locNoRotate.x - this.compRefPoint.x, locNoRotate.y - this.compRefPoint.y)
      .rotateByDeg(this.compRotDeg)
      .addVector(new Vector(this.compRefPoint.x, this.compRefPoint.y))
      .toPoint();
  }

  // Get the BBOX
  getBBox(): ISvgBBox {
    // If no text specified, then return empty
    if (!this.text) return SvgBBox.DUMMY;
    const move = this.makeAnchoringMove() ?? new SvgPoint(0, 0);
    const realLoc = this.getRealLocation();
    return new SvgBBox(realLoc.x, realLoc.y, this.width, this.height)
      .moveBy(move.x, move.y)
      .rotateAt(new SvgPoint(realLoc.x, realLoc.y), this.rotDeg);
  }

  setAnchor(anchorPos: string) {
    anchorPos = anchorPos.toLowerCase();
    if (anchorPos === "tl" || anchorPos === "topleft") {
      this.anchorX = 1;
      this.anchorY = 1;
    } else if (anchorPos === "tm" || anchorPos === "topmiddle") {
      this.anchorX = 0;
      this.anchorY = 1;
    } else if (anchorPos === "tr" || anchorPos === "topright") {
      this.anchorX = -1;
      this.anchorY = 1;
    } else if (anchorPos === "ml" || anchorPos === "middleleft") {
      this.anchorX = 1;
      this.anchorY = 0;
    } else if (["c", "mm", "center","middlemiddle"].includes(anchorPos)) {
      this.anchorX = 0;
      this.anchorY = 0;
    } else if (anchorPos === "mr" || anchorPos === "middleleft") {
      this.anchorX = -1;
      this.anchorY = 0;
    } else if (anchorPos === "bl" || anchorPos === "bottomleft") {
      this.anchorX = 1;
      this.anchorY = -1;
    } else if (anchorPos === "bm" || anchorPos === "bottommiddle") {
      this.anchorX = 0;
      this.anchorY = -1;
    } else if (anchorPos === "br" || anchorPos === "bottomright") {
      this.anchorX = -1;
      this.anchorY = -1;
    }
  };

  // Determine the moving offset based on where (relative position) the label is anchored at
  makeAnchoringMove(): ISvgPoint | undefined {
    return new SvgPoint(
      this.anchorX * this.width  / 2 - this.width / 2,
      this.anchorY * this.height / 2 - this.height / 2
    );
  }

  buildEmbeddedStyle() {
    const styles: string[][] = [];
    if (this.color) styles.push([`color`, this.color]);
    if (this.font) styles.push([`font-family`, HuatuLabelStyle.resolveFontName(this.font)]);
    if (this.fontSize) styles.push([`font-size`, `${this.fontSize}px`]);
    if (this.lineHeight) styles.push([`line-height`, `${this.lineHeight}`]);
    if (this.bold) styles.push([`font-weight`, `bold`]);
    if (this.italic) styles.push([`font-style`, `italic`]);
    if (this.textAlign) styles.push([`text-align`, this.textAlign]);
    if (this.addLine) {
      const decorLine = HuatuLabelStyle.getDecorationLine(this.addLine);
      if (decorLine) styles.push([`text-decoration`, decorLine]);
    }
    if (styles.length > 0) {
      const styleInAll = styles.map(x => `${x[0]}:${x[1]};`).join("");
      return `style="${styleInAll}"`;
    } else {
      return ``;
    }
  }

  buildHtml(buildType: SvgBuildType): string {
    if (WtMath.isZero(this.width) || WtMath.isZero(this.height)) return "";        // Return nothing if text is not presented
    if (!globalThis.wthtJobBuildId) {
      globalThis.wthtJobBuildId = genHex(8);
    }
    const htConfig = globalThis.wtHuatuConfig;
    const realLoc = this.getRealLocation();
    const labelBorderBox = htConfig && (htConfig.labelBorder || htConfig.labelBackground)
      ? `<rect x="${realLoc.x}" y="${realLoc.y}" width="${this.width}" height="${this.height}" class="wthuatu-label-box-${globalThis.wthtJobBuildId}" />`
      : ""
    const styleClasses = this.styles.map(x => HuatuLabelStyle.buildStyleClassName(x));
    const bgOrBdr = this.bgColor || this.borderColor
      ? `style="` + (this.bgColor ? `background-color:${this.bgColor};` : ``) + (this.borderColor ? `border:1px solid ${this.borderColor};` : ``) + `"`
      : ``;
    const foHtml = !this.text ? `` : `<foreignObject x="${realLoc.x}" y="${realLoc.y}" width="${this.width}" height="${this.height}">\n`
      + `<body xmlns="http://www.w3.org/1999/xhtml">\n`
      + `<div class="huatu-label-container-${globalThis.wthtJobBuildId}" `+ bgOrBdr +`>\n`
      + `<div class="${["huatu-label-text-"+globalThis.wthtJobBuildId, ...styleClasses].join(" ")}" ${this.buildEmbeddedStyle()}>\n`
      + renderKatexMixedText(this.text)
      + `\n</div>\n`
      + `</div>\n`
      + `</body>\n`
      + `</foreignObject>`;
    const gTransformAttrs: string[] = [];
    if (!WtMath.isZero(this.rotDeg)) {
      const vecLoc = new Vector(realLoc.x, realLoc.y);
      const move = vecLoc.subtractVector(vecLoc.rotateByDeg(this.rotDeg)).toPoint();
      HuatuTransform.addMove(gTransformAttrs, move);
      HuatuTransform.addRotate(gTransformAttrs, this.rotDeg);
    }
    const anchorMove = this.makeAnchoringMove();
    if (anchorMove) {
      HuatuTransform.addMove(gTransformAttrs, anchorMove);
    }
    const gTransformStr = gTransformAttrs.length > 0
      ? `transform="${gTransformAttrs.join(" ")}"`
      : "";
    const labelGroup = `<g ${gTransformStr} >\n`
      + labelBorderBox + `\n`
      + foHtml + `\n`
      + `</g>`;
    const anchorMark = htConfig && htConfig.markPositions
      ? `<circle cx="${realLoc.x}" cy="${realLoc.y}" r="1" class="wthuatu-mark-position-${globalThis.wthtJobBuildId}" />`
      : ``;
    const bboxSvg = globalThis.wtHuatuConfig && globalThis.wtHuatuConfig.showBBox
      ? `${this.getBBox().buildRectSvg(true)}`
      : ``;
    if (anchorMark || bboxSvg) {
      return `<g>\n`
        + labelGroup + `\n`
        + anchorMark + `\n`
        + bboxSvg + `\n`
        + `</g>`;
    } else {
      return !this.text ? `` : labelGroup;
    }
  }

  /* ------------------------------ For component -----------------------------  */

  getStylePure(): IHuatuLabelStylePure {
    let styPure = HuatuLabelStyle.makePureStyle(this);
    if (this.styles.length > 0) {
      for (let i = this.styles.length - 1; i >= 0; i--) {
        styPure = HuatuLabelStyle.copyRefStyle(styPure, this.styles[i].getStylePure());
      }
    }
    return styPure;
  }

  adjustForComponent(placement: IHuatuComponentPlacement) {
    if (!placement.isValid || !placement.huatu || placement.huatu.jobs.length < 1) return;
    // when not mirroring or rotating, nothing need to do
    if (!placement.mirror && !placement.rotDeg) return;
    const refPoint = placement.getRefPoint();
    // Handling Mirroring
    if (placement.mirror === "x") {
      this.location.x = refPoint.x * 2 - this.location.x;
      this.anchorOffset.x = -this.anchorOffset.x
      this.anchorX = -1 * this.anchorX;
      if (this.textAlign === "left") this.textAlign = "right";
      else if (this.textAlign === "right") this.textAlign = "left";
    } else if (placement.mirror === "y") {
      this.location.y = refPoint.y * 2 - this.location.y;
      this.anchorOffset.y = -this.anchorOffset.y
      this.anchorY = -1 * this.anchorY;
    } else if (placement.mirror === "xy") {
      this.location.x = refPoint.x * 2 - this.location.x;
      this.location.y = refPoint.y * 2 - this.location.y;
      this.anchorOffset.x = -this.anchorOffset.x;
      this.anchorOffset.y = -this.anchorOffset.y;
      this.anchorX = -1 * this.anchorX;
      this.anchorY = -1 * this.anchorY;
      if (this.textAlign === "left") this.textAlign = "right";
      else if (this.textAlign === "right") this.textAlign = "left";
    }
    // Handling Rotating
    if (placement.rotDeg) {
      this.compRotDeg = placement.rotDeg;
      this.compRefPoint = refPoint;
      if (placement.rotateLabel) {
        // If rotation degree specified, then add the rotation to original label
        this.rotDeg += placement.rotDeg;
      } else if (this.compRotDeg) {
        let rd = AngDeg.fitDeg(this.compRotDeg);
        if (rd >= 0 && rd <= AngDeg.DEG45 || rd >= (AngDeg.DEG315)) {
          rd = AngDeg.DEG0;     // No Rotate
        } else if (rd > (AngDeg.DEG45) && rd < (AngDeg.DEG135)) {
          rd = AngDeg.DEG90;
        } else if (rd >= (AngDeg.DEG135) && rd <= (AngDeg.DEG225)) {
          rd = AngDeg.DEG180;
        } else if (rd > (AngDeg.DEG225) && rd < (AngDeg.DEG315)) {
          rd = AngDeg.DEG270;
        }
        if (!WtMath.isZero(rd)) {
          const ax = this.anchorX,
                ay = this.anchorY;
          // It is like point rotating
          this.anchorX = Math.cos(rd) * ax - Math.sin(rd) * ay;
          this.anchorY = Math.sin(rd) * ax + Math.cos(rd) * ay;
          if (this.textAlign === "center" && ax === 0) {
            // Note: this adjustment is to make sure that the originally centered text would align to
            //       anchoring side
            if (WtMath.isEqual(this.anchorX, 1)) {
              this.textAlign = "left";
            } else if (WtMath.isEqual(this.anchorX, -1)) {
              this.textAlign = "right";
            }
          } else if (ax * this.anchorX < -0.5) {    // Actually it should be -1 only
            if (this.textAlign === "left") {
              this.textAlign = "right";
            } else if (this.textAlign === "right") {
              this.textAlign = "left";
            }
          } else {
            if (WtMath.isZero(this.anchorX)) this.textAlign = "center";
          }
        }
      }
    }
  }


  /* ----------------------------- Static methods  -----------------------------  */

}
