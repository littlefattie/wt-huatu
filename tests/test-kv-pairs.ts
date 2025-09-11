import { HuatuComponentPort } from "../src/component/HuatuComponentPort.js";
import { parseStrIntoKeyValuePair } from "../src/tools/utils.js";

const testPorts = [
  "1;3, 3; 35; 22",
  "A; 2, t.x + 5;pu",
];

testPorts.forEach(p => {
  const parseRes = parseStrIntoKeyValuePair(p, HuatuComponentPort.optsComponentPort)
  console.log(parseRes);
})