
import type {
  IHuatuCss,
  IHuatuLabelStyle,
  IHuatuLabelStylePure,
} from "./IHuatu.js";

import { genHex } from "../tools/gen-id.js";

export interface IHuatuLabelStyleParams {
  refs?: string;
  textAlign?: string;
  bold?: boolean;
  italic?: boolean;
  addLine?: string;
  fontName?: string;
  color?: string;
  fontSize?: number;
  lineHeight?: number;
}

export class HuatuLabelStyle implements IHuatuLabelStyle, IHuatuCss {
  static PREDEFINED_FONT_NAMES = [
    "lishu", "lisu",
    "kai", "kaishu", "kaiti",
    "fangsong",
    "song", "songti", "simsun", "xinsongti", "xst",
    "times",
    "heiti",
    "yahei", "msyahei", "weiruanyahei",
    "wenquanyi", "wqy",
    "youyuan",
    "mingti", "ximingti", "xinximingti", "xxmt",
    "helvetica", "consolas"
  ];
  static DECORATION_LINES = [
    "over", "overline",
    "under", "underline",
    "middle", "middleline", "through", "strike-through", "strikethrough"
  ];
  static TEXT_ALIGNS = ["left", "right", "center"];


  refStyles: HuatuLabelStyle[] = [];
  name: string;

  color?: string;
  font?: string;
  fontSize?: number;
  textAlign?: string;
  bold?: boolean;
  italic?: boolean;
  addLine?: string;
  lineHeight?: number;

  refCount: number = 0;
  magicId: string;

  constructor(name: string) {
    this.name = name;
    this.magicId = genHex(8);
  }


  buildAttrArray(): string[][] {
    const attrs: string[][]= [];
    if (this.color) {
      attrs.push([`color`, `${this.color}`]);
    }
    if (this.font) {
      attrs.push([`font-family`, `${HuatuLabelStyle.resolveFontName(this.font)}`]);
    }
    if (this.fontSize) {
      attrs.push([`font-size`, `${this.fontSize}px`]);
    }
    if (this.bold) {
      attrs.push([`font-weight`, `bold`]);
    }
    if (this.italic) {
      attrs.push([`font-style`, `italic`]);
    }
    if (this.addLine) {
      const decorLine = HuatuLabelStyle.getDecorationLine(this.addLine);
      if (decorLine) attrs.push([`text-decoration`, decorLine]);
    }
    if (this.textAlign) {
      attrs.push([`text-align`, this.textAlign]);
    }
    if (this.lineHeight) {
      attrs.push([`line-height`, `${this.lineHeight}`]);
    }
    return attrs;
  }

  buildCss(): string {
    if (!this.name) return ""
    const attrs = this.buildAttrArray();
    if (attrs.length < 1) return "";
    return `.${HuatuLabelStyle.buildStyleClassName(this)} {\n${attrs.map(a => `${a[0]}: ${a[1]};`).join("\n")}\n}`;
  }

  getStylePure(): IHuatuLabelStylePure {
    let styPure = HuatuLabelStyle.makePureStyle(this);
    if (this.refStyles.length > 0) {
      for (let i = this.refStyles.length - 1; i >= 0; i--) {
        styPure = HuatuLabelStyle.copyRefStyle(styPure, this.refStyles[i].getStylePure());
      }
    }
    return styPure;
  }

  // Static methods

  static makePureStyle(srcStyle: IHuatuLabelStylePure) {
    let styPure: IHuatuLabelStylePure = {};
    if (srcStyle.color)     styPure.color     = srcStyle.color;
    if (srcStyle.font)      styPure.font      = srcStyle.font;
    if (srcStyle.fontSize)  styPure.fontSize  = srcStyle.fontSize;
    if (srcStyle.textAlign) styPure.textAlign = srcStyle.textAlign;
    if (srcStyle.bold)      styPure.bold      = true;
    if (srcStyle.italic)    styPure.italic    = true;
    if (srcStyle.addLine)   styPure.addLine   = srcStyle.addLine;
    return styPure;
  }

  static copyRefStyle(sty: IHuatuLabelStylePure, srcStyle: IHuatuLabelStylePure) {
    if (!sty.color     && srcStyle.color)     sty.color     = srcStyle.color;
    if (!sty.font      && srcStyle.font)      sty.font      = srcStyle.font;
    if (!sty.fontSize  && srcStyle.fontSize)  sty.fontSize  = srcStyle.fontSize;
    if (!sty.textAlign && srcStyle.textAlign) sty.textAlign = srcStyle.textAlign;
    if (!sty.bold      && srcStyle.bold)      sty.bold      = true;
    if (!sty.italic    && srcStyle.italic)    sty.italic    = true;
    if (!sty.addLine   && srcStyle.addLine)   sty.addLine   = srcStyle.addLine;
    return sty;
  }

  static buildStyleClassName(style: HuatuLabelStyle): string {
    if (!style.name) return "";
    return `lbl-sty-${style.magicId}`;
  }

  static resolveFontName(font: string): string {
    font = font.trim();
    const lcFont = font.toLowerCase();
    if (!lcFont) return "";
    if (lcFont === "songti" || lcFont === "simsun" || lcFont === "song") {
      return `'Times New Roman', Times, Georgia, 'Source Han Serif', 'Source Han Serif SC', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif CJK SC', NSimsun, Simsun`;
    }
    else if (lcFont === "lishu" || lcFont === "lisu") {
      return `'Segoe UI', Tahoma, Geneva, Verdana, LiSu, 'Microsoft YaHei'`;
    }
    else if (lcFont === "kaiti" || lcFont === "kaishu" || lcFont === "kai") {
      return `Arial, Helvetica, sans-serif, STKaiti`;
    }
    else if (lcFont === "fangsong") {
      return `'Times New Roman', Times, serif, STFangsong`;
    }
    else if (lcFont === "mingti" || lcFont === "ximingti" || lcFont === "xinximingti" || lcFont === "xxmt") {
      return `'Times New Roman', Times, serif, PMingLiU`;
    }
    else if (lcFont === "xinsongti" || lcFont === "xst") {
      return `'Times New Roman', Times, serif, NSimsun, Simsun`;
    }
    else if (lcFont === "yahei" || lcFont === "msyahei" || lcFont === "weiruanyahei") {
      return `'Microsoft YaHei'`;
    }
    else if (lcFont === "heiti") {
      return `'Source Han Sans CN', SimHei, STXihei, 'Microsoft Yahei'`;
    }
    else if (lcFont === "youyuan") {
      return `Arial, Helvetica, sans-serif, YouYuan, 'Microsoft Yahei'`;
    }
    else if (lcFont === "wenquanyi" || lcFont === "wqy") {
      return `'WenQuanYi Zen Hei', 'WenQuanYi Zen Hei Mono', 'WenQuanYi Micro Hei', 'WenQuanYi Micro Hei Mono', 'Microsoft Yahei'`;
    }
    else if (lcFont === "helvetica") {
      return `Helvetica, 'Helvetica Now Text', 'Helvetica Neue', Arial`;
    }
    else if (lcFont === "consolas") {
      return `Consolas, 'Source Code Pro', 'Fira Code Medium', 'Courier New'`;
    } 
    else if (false) {
      // TODO: add more in the future if more font alias need to be introduced
    }
    else {
      // Return default font family which is times, and prepend the given font Name
      return `${font}, 'Times New Roman', Times, Georgia, 'Source Han Serif', 'Source Han Serif SC', 'Source Han Serif CN'`;
    }
  }

  static getDecorationLine(decorLine: string): string | undefined {
    if (decorLine === "middle" ||
        decorLine === "middleline" ||
        decorLine === "through"  ||
        decorLine === "strike-through" ||
        decorLine === "strikethrough") return `line-through`;
    else if (
        decorLine === "over" ||
        decorLine === "overline") return `overline`;
    else if (
        decorLine === "under" ||
        decorLine === "underline") return `underline`;
    return undefined;
  }

}
