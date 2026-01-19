import { pinyin } from "pinyin-pro";
import * as wanakana from "wanakana";

export const generateMetadata = (text, language, preferences = "kana") => {
  const result = { reading: "", tones: null, strokeColors: null };

  switch (language) {
    case "Chinese":
      const pinyinWithTones = pinyin(text, { type: "tone-num" });
      result.reading = pinyin(text);
      result.tones = pinyinWithTones
        .split(" ")
        .map((item) => parseInt(item.match(/\d/)?.[0] || 5));

      // Traditional Chinese Tone Colors
      const colors = {
        1: "red",
        2: "green",
        3: "blue",
        4: "purple",
        5: "gray",
      };

      result.strokeColors = result.tones.map((t) => colors[t]);

      return result;

    case "Japanese":
      // preferences could be 'kana' or 'romaji'
      result.reading =
        preferences === "romaji"
          ? wanakana.toRomaji(text)
          : wanakana.toKana(text);
      result.strokeColors = [];
      return result;
    default:
      result.reading = "";
      result.strokeColors = [];
      return result;
  }
};
