import fs, { realpath } from "node:fs";
import path from "node:path";

/**
 * A function to override the functions designed to be executed in Node.JS to global this
 * This function will be only executed in the CLI tool
 */
export const loadNodeCliFuncs = (initialDir?: string) => {

  // Assign the body
  globalThis.wthtCli = {
    compParentDir: initialDir || __dirname,

    updateParentDir: (dir: string) => {
      if (globalThis.wthtCli) {
        globalThis.wthtCli.compParentDir = dir;
      }
    },
    
    resolveFilePath: (p: string, parent?: string) => {
      const isFileAndExists = (file: string) => {
        return fs.existsSync(file) && fs.statSync(file).isFile()
          ? file
          : undefined;
      }

      if (path.isAbsolute(p)) return isFileAndExists(p);
      return isFileAndExists(path.resolve(parent || globalThis.wthtCli?.compParentDir || __dirname, p));
    },

    getFileContent: (p: string) => {
      if (globalThis.wthtCli){
        const pReal = globalThis.wthtCli.resolveFilePath(p);
        return pReal ? fs.readFileSync(pReal, {encoding: "utf8"}) : undefined;
      } else {
        return undefined;
      }
    }

  }
  
}
