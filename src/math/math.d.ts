
export {};

declare global {

  var wtVarFuncs: {
    [funcName: string]: (x: number) => number;
  }

}
