/**
 * Returns true if the string contains at least one CJK character.
 * Covers the main Unified CJK block plus common extensions.
 */
export function hasCJKCharacter(str) {
  if (!str || typeof str !== "string") return false;
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}]/u.test(
    str,
  );
}
