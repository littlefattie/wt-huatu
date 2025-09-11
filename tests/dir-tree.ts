import fs, { Dir, fstatSync, opendir, opendirSync, readdir, readdirSync } from "fs";
import path, { parse, resolve } from "path";

interface IFsItem {
  type: "dir" | "file" | "unknown",
  fullPath: string,
  relativePath: string,
  name: string,
  size?: number,
  ext?: string,
  children?: IFsItem[],
}

export const listDir = (path: string, ext?: string): IFsItem[] => {
  try {
    return readdirSync(path)
      .map(x => {
        const relPath = `${path}/${x}`;
        const fullPath = resolve(path, x);
        const fsState = fs.statSync(fullPath);
        const pathInfo = parse(fullPath);
        return fsState.isDirectory() ? {
            type: "dir",
            fullPath: fullPath,
            relativePath: relPath,
            name: x,
            children: listDir(fullPath),
          } as IFsItem
          : fsState.isFile() ? {
            type: "file",
            fullPath: fullPath,
            relativePath: relPath,
            name: x,
            ext: pathInfo.ext,
            size: fsState.size,
          } as IFsItem
          : {
            type: "unknown",
            fullPath: fullPath,
            relativePath: relPath,
            name: x,
          } as IFsItem;
      })
      .filter(x => x.type !== "unknown");
  } catch (error) {
    return [];
  }
};

export const flatDirPaths = (dir: IFsItem[]) => {
  const paths: string[] = [];
  dir.forEach(x => {
    if (x.type === "file") paths.push(x.fullPath);
    else if (x.type === "dir" && x.children) paths.push(...flatDirPaths(x.children));
  });
  return paths;
};
