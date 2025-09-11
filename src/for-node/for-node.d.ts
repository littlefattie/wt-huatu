
export {};

declare global {
  var wthtCli: {
    compParentDir: string | undefined;
    resolveFilePath: (path: string) => string | undefined;
    getFileContent:  (path: string) => string | undefined;
    updateParentDir: (dir: string) => void | undefined;
  } | undefined;
}
