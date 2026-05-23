
/**
 * A Unified function to call to all the functions that are usable in var definition
 */

export const varFuncCall = (name: string, x: number) => {
  if (name === "sin")   return Math.sin(x);
  if (name === "cos")   return Math.cos(x);
  if (name === "tan")   return Math.tan(x);
  if (name === "atan")  return Math.atan(x);
  if (name === "asin")  return Math.asin(x);
  if (name === "acos")  return Math.acos(x);
  if (name === "dsin")  return Math.sin(x * Math.PI / 180);
  if (name === "dcos")  return Math.cos(x * Math.PI / 180);
  if (name === "dtan")  return Math.tan(x * Math.PI / 180);
  if (name === "datan") return Math.atan(x) * 180 / Math.PI;
  if (name === "dacos") return Math.acos(x) * 180 / Math.PI;
  if (name === "dasin") return Math.asin(x) * 180 / Math.PI;
  if (name === "exp")   return Math.exp(x);
  if (name === "log")   return Math.log(x);
  if (name === "log10") return Math.log10(x);
  if (name === "sqrt")  return Math.sqrt(x);
  
  return undefined;
}
