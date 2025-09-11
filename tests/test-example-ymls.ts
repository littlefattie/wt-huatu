import fs from "fs"
import path, { resolve } from "path"

import { flatDirPaths, listDir } from "./dir-tree.js";
import {
  type IWtHuatuRenderOptions,
  type IWtHuatuResolvingResult,
  renderYmlInput
} from "../src/index.js";
import { exit } from "process";

const buildOpts: IWtHuatuRenderOptions = {
  outputFormat: "svg",
  job: "all",
  componentPreview: {
    showMarks: true,
    ignoreConfig: true,
  },
}

interface IWtHuatuResolvingResultWithTitle extends IWtHuatuResolvingResult {
  // Title, actually the file name
  title: string;
}


const examplesFolder = resolve("./examples");
console.log(`Try parsing the example design inputs located in:\n\x1b[36m${examplesFolder}\x1b[0m :`);
let intToDigits = (x: number) => Math.floor(Math.log10(x) + 1);
const ymlFiles = flatDirPaths(listDir(examplesFolder))
  .filter(x => x.endsWith(".yml"));
const maxFileNameLen = Math.max(...ymlFiles.map(x => x.substring(examplesFolder.length + 1).length));
const ymlRes: IWtHuatuResolvingResultWithTitle[] = [];

for (const yf of ymlFiles) {
  let title = yf.substring(examplesFolder.length + 1);
  const res = await renderYmlInput(fs.readFileSync(yf, "utf-8"), buildOpts);
  ymlRes.push({
    title,
    errors: res.errors,
    warnings: res.warnings,
    infos: res.infos,
  });
}

const maxErrorCount = Math.max(...ymlRes.map(x => x.errors.length));
const maxWarningCount = Math.max(...ymlRes.map(x => x.warnings.length));
const maxInfoCount = Math.max(...ymlRes.map(x => x.infos.length));

for (const res of ymlRes) {
  let colorCode = res.errors.length > 0 ? `\x1b[31m` : `\x1b[42m`;
  let textCode = res.errors.length > 0 ? `\x1b[31m` : `\x1b[32m`;
  console.log(`  ${colorCode}-> `, `${res.title}\x1b[0m`, " ".padEnd(maxFileNameLen + 2 - res.title.length),
                `${textCode}[e]: ${res.errors.length.toString().padEnd(intToDigits(maxErrorCount))} | [w]: ${res.warnings.length.toString().padEnd(intToDigits(maxWarningCount))} | [i]: ${res.infos.length.toString()}\x1b[0m`);

  if (res.errors.length > 0) {
    console.error(`      \x1b[41m${res.errors.length} ERRORS happened:\x1b[0m`);
    res.errors.forEach(e => {
      console.error(`       x `, `\x1b[31m${e.title}\x1b[0m`);
      if (e.msgs && e.msgs.length > 0) {
        e.msgs.forEach(m => console.error(`         * `, `\x1b[31m${m}\x1b[0m`))
      }
    })
  }
}

exit(maxErrorCount > 0 ? 1 : 0);
