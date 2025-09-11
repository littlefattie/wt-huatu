import { type IKeyValueOptions, parseStrIntoKeyValuePair } from "../src/tools/utils.js";
import { isValidColor } from "../src/tools/webColor.js";


const testStr = `center;fs,33;bold;italic,;w, 33; h;22; pos; x, y; overline`;
const testStr2 = `cOLor; #ccc; left; position; 3,3; offset, 4,5; font;lishu; size; xx;`;
const testStr3 = `align, left; center;fs,33;bold,italic,deg,rotdeg;22;w, 33; h;22; pos; x, y; overline; lisHu; aNChor; t, h`;
const opts: IKeyValueOptions = {
  keys: [
    ["at", "position", "pos", "location", "loc"],
    ["offset"],
    ["anchor"],
    ["w", "width"],
    ["h", "height"],
    [ "textAlign", "align"],
    ["bold"],
    ["italic"],
    ["line", "addLine"],
    ["font"],
    ["color", "fontColor"],
    ["size", "fontSize", "fs"],
    ["rot", "rotDeg", "deg"],
  ],
  allowAppend: [],
  booleans: ["bold", "italic"],
  qualifiers: {
    "color": isValidColor,
  },
  numbers: ["fontsize", "size", "deg", "fs"],
  ints: [],
  blindGuess: {
    "color": isValidColor,
    "textAlign": ["left", "right", "center"],
    "addLine": ["over", "overline", "under", "underline", "through", "through-line", "throughline"],
    "font": ["lishu", "kaiti", "kaishu", "helvetica", "arial"],
  }
}

console.log(parseStrIntoKeyValuePair(testStr, opts));
console.log(parseStrIntoKeyValuePair(testStr2, opts));
console.log(parseStrIntoKeyValuePair(testStr3, opts));

const optsPattern: IKeyValueOptions = {
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
  ints: [],
  numbers: [
    "lineDensity", "density", "dotsDensity", "squareDensity",
    "dashDensity", "dashedDensity", "dottedDensity",
    "sparseK", "size",
    "rotDeg", "deg", "lineDeg",
    "lineWeight", "lineWidth",
    "opacity","bgOpacity"
  ],
  qualifiers: {
    "bgColor": isValidColor,
    "background": isValidColor,
  },
  blindGuess: {
    "lineStyle": ["solid", "dashed", "dotted"],
  }
}

const test4 = {
  type: "line",

  density: "33",
  lineDensity: "22",
  dotsDensity: "33",
  squareDensity: "44",

  color: "red",
  opacity: "0.2",

  rotDeg: "-45",
  deg: "22",
  lineDeg: "34",

  lineWeight: "5",
  lineWidth: "44",

  lineStyle: "dotted",

  dashDensity: "x22",
  dashedDensity: "33",
  dottedDensity: "44",

  size: "5",
  bgColor: "yellow",
  background: "black",
  bgOpacity: "0.7",

  sparseK: "0..42",
}

console.log(parseStrIntoKeyValuePair(test4, optsPattern));

const optsDrawingFormat: IKeyValueOptions = {
  keys: [
    ["fill"],
    ["stroke"],
    ["array"],
    ["marker"],
    ["pattern"],
    ["gradient"],
    ["clip"],
    ["move"], ["at"],
    ["rotate", "rotDeg", "deg"],
    ["scale"],
    ["fillRule"],
    ["lineCap"],
    ["lineJoin"],
  ],
  allowAppend: ["fill", "stroke", "marker"],
  booleans: [
    "alignCenter",
  ],
  ints: [],
  numbers: [],
  qualifiers: {

  },
  blindGuess: {
    "fillRule": ["nonzero", "evenodd"],
    "lineCap": ["butt", "round", "square"],
    "lineJoin": ["miter", "round", "bevel"],
  }
}

console.log(parseStrIntoKeyValuePair(
  "fill, red, 0.2;stroke; 1, black, ; 0.3, butt; ; array, 33; nonzero;marker; start, mid, arrow1; end, arrow2;move; x, y; at, u,v;deg, 34;scale;45678; round; round;",
  optsDrawingFormat));

const optsMarker: IKeyValueOptions = {
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
    ["makeSmooth"],
    ["primaryColor", "priColor", "primeColor", "color"],
    ["secondaryColor", "secColor"],
    ["fillColor", "fill"],
    ["fillOpacity", "opacity"],
    ["strokeColor", "stroke"],
    ["strokeWidth"],
  ],
  allowAppend: [],
  booleans: ["centerEmpty", "closeArrow", "makeSmooth"],
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
    "strokeColor": isValidColor,
  },
  blindGuess: {
    "direction": ["up", "down", "left", "right"],
    "type": [
      "arrow-solid", "arrowsolid", "solidarrow", "arrow",
      "arrow-double","arrowdouble", "doublearrow",
      "simple-arrow", "simple-arrow", "arrowsimple",
      "circle", "circ", "dot",
      "triangle", "tri",
      "ellipse", "ell",
      "rhombus", "rhom",
      "square", "sqr",
      "rectangle", "rect",
      "star", "star5", "5-star", "5star", "wujiaoxing",
      "staru", "star-u", "star-unified", "unifiedstar", "unified-star",
      "plus", "jiahao",
      "cross", "chacha", "cha",
      "polygon", "plg", "duobianxing", "dbx"
    ],
    "primaryColor": isValidColor,
  }
}

console.log(parseStrIntoKeyValuePair(
  "arrow;size, 12;fill, red;",
  optsMarker
));

console.log(parseStrIntoKeyValuePair(
  "type;square;size, 5;red;n;12.334",
  optsMarker
));