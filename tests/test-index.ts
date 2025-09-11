import { type IWtHuatuRenderOptions, WtHuatu, renderYmlInput } from "../src/index.js";
import path from "path"
import fs from "fs"

const outputFolder = "./temp/output";
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, {recursive: true});
}

const inputFolder = path.resolve(process.cwd(), "tests/yml");

const ymls = fs.readdirSync(inputFolder)
  .filter(x => x.endsWith(".yml"))
  .map(x => path.resolve(inputFolder, x));

const buildOpts: IWtHuatuRenderOptions = {
  outputFormat: "svg",
  job: "all",
  componentPreview: {
    showMarks: true,
    ignoreConfig: true,
  },
  scale: 2,
}

for (const yml of ymls) {
  const f = path.parse(yml);
  console.log(`-> Processing: `, yml);
  const res = await renderYmlInput(fs.readFileSync(yml, "utf-8"), buildOpts);
  if (res.errors.length > 0) console.log(`ERRORS:`, res.errors);
  if (res.warnings.length > 0) console.log(`WARNINGS:`, res.warnings);
  if (res.infos.length > 0) console.log(`INFOS:`, res.infos);
  if (res.rendered.length > 0) {
    res.rendered.forEach(j => {
      fs.writeFileSync(outputFolder + `/${f.name}-${j.jobName}.${buildOpts.outputFormat || "svg"}`, j.html, "utf-8");
    })
  }
}
