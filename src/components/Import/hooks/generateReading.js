import { pinyin } from "pinyin-pro";
import * as wanakana from "wanakana";

function pinyinToNum(input, markNeutral = true) {
  // normalize to NFD "decomposed" form, which splits diacritics from the root character, e.g. "à" -> "a" + "`"
  const decomposed = input.normalize("NFD");
  // split on syllable initial or non-word char, including the matches in the results
  const fragments = decomposed.split(
    /((?:(?:(?:[csz]h|[bcdfghjklmnpqrstwxyz])(?=[aeiou]))|[^\p{L}\p{M}])+)/iu,
  );
  // pair the start of syllable (or non-word char) with rest of relevant syllable
  const pairs = Object.values(
    Object.groupBy(fragments, (_, i) => Math.floor((i + 1) / 2)),
  );
  const syllables = pairs.map((x) => x.join(""));

  return (
    syllables
      .filter(Boolean)
      .map((syllable) => {
        // iterate through all diacritics in the syllable
        for (const [mark] of syllable.matchAll(/\p{M}/gu)) {
          // 1, 2, 3, or 4 (or 0 if not present in the list)
          const toneNumber = ["̄", "́", "̌", "̀"].indexOf(mark) + 1;
          // if 0 (e.g. is umlaut), go to next mark
          if (!toneNumber) continue;
          return `${syllable.replace(new RegExp(mark), "")}${toneNumber}`;
        }

        // if no mark found and syllable ends with letter, assume neutral tone
        return markNeutral && /\p{L}$/u.test(syllable)
          ? `${syllable}5`
          : syllable;
      })
      .join("")
      // normalize any remaining diacritics to NFC "composed" form
      .normalize("NFC")
  );
}

export const generateReading = (
  char,
  language,
  reading,
  preferences = "kana",
) => {
  const result = { reading: reading, tones: null, strokeColors: null };
  console.log(char, language, reading, preferences);
  if (!char) return result;

  switch (language) {
    case "Chinese":
      let pinyinWithTones;

      if (!reading) {
        result.reading = pinyin(char);
        pinyinWithTones = pinyin(char, { toneType: "num" });
      } else {
        pinyinWithTones = pinyinToNum(reading);
      }

      result.tones = pinyinWithTones
        .split(" ")
        .map((item) => parseInt(item.match(/\d/)?.[0] || 5));

      // Pleco Chinese Tone Colors
      const colors = {
        0: "gray",
        1: "red",
        2: "green",
        3: "blue",
        4: "purple",
      };

      result.strokeColors = result.tones.map((t) => colors[t]);

      return result;

    case "Japanese":
      // preferences could be 'kana' or 'romaji'
      result.reading =
        preferences === "romaji"
          ? wanakana.toRomaji(char)
          : wanakana.toKana(char);

      result.strokeColors = null; // No stroke colors for Japanese
      result.tones = null; // No tones for Japanese
      return result;
    default:
      result.reading = "";
      result.strokeColors = null;
      result.tones = null;
      console.log("I'm default");
      return result;
  }
};
