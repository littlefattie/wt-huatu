const setLetterAtoFUpper = "ABCDEF";
const setLetterAtoFLower = "abcedf";
const setLetterUpper = "ABCDEFGHJKLMNPQRSTUVXYZ";
const setLetterLower = "abcdefghjklmnpqrstuvxyz";
const setNumbers = "0123456789";
const setLetters = setLetterUpper + setLetterLower;
const setHexUpper = setNumbers + setLetterAtoFUpper;
const setHexLower = setNumbers + setLetterAtoFLower;
const setNumLetterUpper = setNumbers + setLetterUpper;
const setNumLetterLower = setNumbers + setLetterLower;
const setNumLetters = setNumbers + setLetters;
const setSymbols = "!@#$%^&*()_-+={}[]|;:.,<>?";
const setAll = setNumLetters + setSymbols;

/**
 * The generator function of producing the random string, with a letter source set.
 * @param srcStr The letter source, which is a set of available letters fo that type.
 * @param len How long of the result string, this determine how many iterations this function will do.
 */
function* getRandStrFrom(srcStr: string, len: number) {
  const strLen = srcStr.length;
  while (len > 0) {
    yield srcStr[Math.round(Math.random() * (strLen-1))];
    len--;
  }
}
/**
 * Get the corresponding letter set to sue.
 * @param charType The identifier to identify which letter set to use.
 * @returns The letter set.
 */
function getCharSet(charType: string) {
  switch (charType) {
    case "A": return setLetterUpper;
    case "a": return setLetterLower;
    case "n": return setNumbers;
    case "H": return setHexUpper;
    case "h": return setHexLower;
    case "S": return setNumLetterUpper;
    case "s": return setNumLetterLower;
    case "w": return setLetters;
    case "W": return setNumLetters;
    case "x": return setAll;
    default: return setAll;
  }
}

/**
 * Generate a random string of specified type, say from the specified letter set.
 * @param charType The identifier of which letter set to generate the random string from.
 * @param len Length of the random string.
 * @returns The generated random string.
 */
export function genRandStrOf(charType: string, len: number): string {
  const strGen = getRandStrFrom(getCharSet(charType), len);
  return [...strGen].join("");
}

/**
 * Get an random letter from the specified set.
 * @param letterSet The Letter set.
 * @returns The random letter.
 */
function getAnRandomLetterFromSet(letterSet: string): string {
  return letterSet[Math.round(Math.random() * (letterSet.length - 1))];
}

/**
 * Generate random string by specified "format string".
 * @param seg The unified format of generating random letters, each digits will correspond to one random letter.
 *            like nnnn will produce like 3234 for example.
 * @returns The generated random string.
 */
function genRdnSeg(seg: string): string {
  return seg.split("").map(c => {
    if (c === "a")      return getAnRandomLetterFromSet(setLetterLower);
    else if (c === "A") return getAnRandomLetterFromSet(setLetterUpper);
    else if (c === "n") return getAnRandomLetterFromSet(setNumbers);
    else if (c === "H") return getAnRandomLetterFromSet(setHexUpper);
    else if (c === "h") return getAnRandomLetterFromSet(setHexLower);
    else if (c === "S") return getAnRandomLetterFromSet(setNumLetterUpper);
    else if (c === "s") return getAnRandomLetterFromSet(setNumLetterLower);
    else if (c === "w") return getAnRandomLetterFromSet(setLetters);
    else if (c === "W") return getAnRandomLetterFromSet(setNumLetters);
    else if (c === "x") return getAnRandomLetterFromSet(setAll);
    else return c;      // This is a bypass, if the format is not the one we defined, then it is transparently passed to the result.
  }).join("");
}

/**
 * Generate Random string by specified format(style), prefix, suffix, and customized hyphen.
 * @param style The format of the wanted random string, e.g. nnnn-AAAA-hhHH-wwss.
 * Style coding: n -> 0-9
 *               a -> a-z, without i,o,w
 *               A -> A-Z, without I,O,W
 *               h -> 0-9 and a-f
 *               H -> 0-9 and A-F
 *               s -> 0-9 and (a-z without i,o,w)
 *               S -> 0-9 and (A-Z without I,O,W)
 *               w -> (a-z without i,o,w) and (A-Z without I,O,W)
 *               W -> 0-9 and (a-z without i,o,w) and (A-Z without I,O,W)
 *               x -> 0-9 and (a-z without i,o,w) and (A-Z without I,O,W) and (common symbols like !@#$ etc)
 * @param hyphenReplace The letter to replace the hyphen character in the style string.
 * @param prefix The Prefix string (if any) to prepend to the final result.
 * @param suffix The Suffix string (if any) to append to the final result.
 * @param hyphen The hyphen used to concatenate prefix and suffix.
 * @returns The generated random string.
 */
export function genRdnStr(style: string, hyphenReplace?: string, prefix?: string, suffix?: string, hyphen?: string): string {
  return (
    (prefix ? prefix + (hyphen ?? "-") : "") +
    style
      .split("-")
      .map((seg) => genRdnSeg(seg))
      .join(hyphenReplace ?? "-") +
    (suffix ? hyphen + suffix : "")
  );
}
