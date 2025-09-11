export class WT_REGEX {
  static FLOAT_NUMBER = /^[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?$/;
  static NUMBER_AND_CALCULATE = /^[0-9e.\s+\-*\/\(\)]+$/i;
  static PARENTHESIS = /^\((.*)\)$/;
  static POINT_LIKE = /^\(([^,]+),([^,]+)\)$/;
  static VAR_NAME = /^[a-z][a-z0-9_]*$/i;
  static VAR_WITH_INDEXING = /^([a-z][a-z0-9_]*)\s*(\(\s*(\d+)\s*\)|\[\s*(\d+)\s*\])$/i;
  /** The regex to math Web color codes, it could be 3/6/8 digits */
  static COLOR_CODE_3 = /^[#]([a-f0-9]{3})$/i;
  static COLOR_CODE_6 = /^[#]([a-f0-9]{6})$/i;
  static COLOR_CODE_8 = /^[#]([a-f0-9]{8})$/i;
  /** Used to match the start/ste/end number series, with | as separator, : is not chosen 
   *  because it has some violation against YML syntax */
  static RANGE = /^([^\|:]+)[\|:]([^\|:]+)[\|:]([^\|]+)$/i;
}
