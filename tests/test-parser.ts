import fs from "fs"
import { resolveYmlModel } from "../src/huatu/HuatuParser.js";
import { HuatuYml } from "../src/huatu/HuatuYml.js";

const ymlShape = fs.readFileSync(process.cwd() + "/tests/parser/shape.yml").toString();
const baguaShape = fs.readFileSync(process.cwd() + "/tests/parser/bagua.yml").toString();
const htShape = HuatuYml.parseYml(ymlShape);
const bagua = await resolveYmlModel(HuatuYml.parseYml(baguaShape).rootObj);
console.log(bagua.buildSvg("direct"));
const htShapeModel = resolveYmlModel(htShape.rootObj);

const yml1 = fs.readFileSync(process.cwd() + "/tests/parser/three-circle.yml").toString();
const yml = fs.readFileSync(process.cwd() + "/tests/parser/test1.yml").toString();
const ymlPointSeries = fs.readFileSync(process.cwd() + "/tests/parser/point-series.yml").toString();

const huatu1 = HuatuYml.parseYml(yml1);
const huatu2 = HuatuYml.parseYml(yml);
const ht1 = await resolveYmlModel(huatu1.rootObj);
const ht2 = await resolveYmlModel(HuatuYml.parseYml(ymlPointSeries).rootObj);
// console.log(huatu);
console.dir(ht2.points, {depth: null});
console.dir(ht1.vars, {depth: null});
// console.dir(huatu1, {depth: null})
// console.dir(huatu2, {depth: null})
