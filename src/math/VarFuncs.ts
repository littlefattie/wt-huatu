
/**
 * A function to override the default Math functions to new, and
 * make deg sin/cos/tan/acos/asin/atan functions
 */
export const loadVarFuncsToGlobalThis = () => {
  globalThis.wtVarFuncs = {
    sin:   Math.sin,
    cos:   Math.cos,
    tan:   Math.tan,
    atan:  Math.atan,
    asin:  Math.asin,
    acos:  Math.acos,
    dsin:  x => Math.sin(x * Math.PI / 180),
    dcos:  x => Math.cos(x * Math.PI / 180),
    dtan:  x => Math.tan(x * Math.PI / 180),
    datan: x => Math.atan(x) * 180 / Math.PI,
    dacos: x => Math.acos(x) * 180 / Math.PI,
    dasin: x => Math.asin(x) * 180 / Math.PI,
    exp:   Math.exp,
    log:   Math.log,
    log10: Math.log10,
    sqrt:  Math.sqrt,
  }
}
