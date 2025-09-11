import { PathRect } from "../src/path/PathRect.js";
import { HuatuLabel } from "../src/huatu/HuatuLabel.js";
import { SvgBBox } from "../src/svg/SvgBBox.js";
import { SvgPoint } from "../src/svg/SvgPoint.js";
import Rect from "../src/geometry/Rect.js";


const label = new HuatuLabel("Hello, I am good!", 200, 20);
console.log(label.buildHtml("direct"));

const bbox = new SvgBBox(50, 50, 150, 150);
const bRot = bbox.rotateAt(new SvgPoint(125, 125), 30);
let path;
const rect1 = new Rect(bbox.x, bbox.y, bbox.w, bbox.h);
path = PathRect.fromRect(rect1);
console.log(path.buildHtmlFull({color: "red"}))
const rect2 = new Rect(bRot.x, bRot.y, bRot.w, bRot.h);
path = PathRect.fromRect(rect2);
console.log(path.buildHtmlFull({color: "lime"}))

// console.log(bbox.moveBy(new SvgPoint(-75, -75)));
// console.log(bbox.rotateAt(new SvgPoint(125, 125), 30));
