const kanaRegex = /[\u3040-\u30ff]/;
const hanRegex = /[\u4e00-\u9fff]/;
const latinRegex = /^[a-zA-Z\s]+$/;
const urlRegex = /^https?:\/\//;

export function detectColumns(rows) {
  if (!rows.length) return {};

  const scores = {};
  const columns = Object.keys(rows[0]);

  columns.forEach((col) => {
    scores[col] = {
      word: 0,
      reading: 0,
      meaning: 0,
      audioUrl: 0,
    };

    rows.slice(0, 20).forEach((row) => {
      const value = String(row[col] || "");

      if (hanRegex.test(value) || kanaRegex.test(value)) scores[col].word += 2;

      if (kanaRegex.test(value) || value.match(/[āáǎà]/))
        scores[col].reading += 2;

      if (latinRegex.test(value) && value.length > 3) scores[col].meaning += 2;

      if (urlRegex.test(value)) scores[col].audioUrl += 3;
    });
  });

  const pickBest = (field) =>
    Object.entries(scores).sort((a, b) => b[1][field] - a[1][field])[0]?.[0];

  return {
    word: pickBest("word"),
    reading: pickBest("reading"),
    meaning: pickBest("meaning"),
    audioUrl: pickBest("audioUrl"),
  };
}
