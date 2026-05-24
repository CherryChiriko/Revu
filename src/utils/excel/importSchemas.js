function validateRowA(row, mapping) {
  if (!row[mapping.word]) return "Missing word";
  if (!row[mapping.meaning]) return "Missing meaning";
  return null;
}

function validateRowC(row, mapping) {
  if (!row[mapping.word]) return "Missing character";
  if (!row[mapping.meaning]) return "Missing meaning";
  return null;
}

export function validateRows(rows, mapping, studyMode) {
  const validator = studyMode === "C" ? validateRowC : validateRowA;

  const errors = [];

  rows.forEach((row, index) => {
    const error = validator(row, mapping);
    if (error) errors.push({ index, error });
  });

  return errors;
}
