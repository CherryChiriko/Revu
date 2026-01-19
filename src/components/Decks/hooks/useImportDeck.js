import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../../utils/supabaseClient";
import { generateMetadata } from "../../../utils/excel/generateMetadata";
import { detectColumns } from "../utils/detectColumns";
import { validateRows } from "../utils/importSchemas";

export default function useImportDeck() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  /* ---------- file parsing ---------- */

  const parseFile = useCallback(async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const parsed = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    setFile(file);
    setRows(parsed);

    // auto-detect immediately
    setMapping(detectColumns(parsed));
  }, []);

  /* ---------- validation ---------- */

  const validate = useCallback(
    (studyMode) => {
      const result = validateRows(rows, mapping, studyMode);
      setErrors(result);
      return result.length === 0;
    },
    [rows, mapping]
  );

  /* ---------- import ---------- */

  const importDeck = useCallback(
    async ({ deck, studyMode, userId }) => {
      setIsImporting(true);

      try {
        const { data: newDeck } = await supabase
          .from("decks")
          .insert({
            ...deck,
            study_mode: studyMode,
            user_id: userId,
          })
          .select()
          .single();

        const table = studyMode === "C" ? "cards_c" : "cards_a";

        const cards = rows.map((row) => {
          const front = row[mapping.word];
          const meta = generateMetadata(front, deck.language);

          const base = {
            deck_id: newDeck.id,
            front,
            back: row[mapping.meaning],
            audioUrl:
              mapping.audioUrl && row[mapping.audioUrl]
                ? row[mapping.audioUrl]
                : null,
          };

          return studyMode === "C"
            ? {
                ...base,
                reading: meta.reading,
                tones: meta.tones,
                strokeColors: meta.strokeColors,
              }
            : {
                ...base,
                reading: mapping.reading ? row[mapping.reading] : meta.reading,
              };
        });

        const { data: inserted } = await supabase
          .from(table)
          .insert(cards)
          .select();

        const progressTable =
          studyMode === "C" ? "card_c_progress" : "card_a_progress";

        await supabase.from(progressTable).insert(
          inserted.map((c) => ({
            card_id: c.id,
            deck_id: newDeck.id,
            user_id: userId,
            status: "new",
          }))
        );

        return newDeck;
      } finally {
        setIsImporting(false);
      }
    },
    [rows, mapping]
  );

  return {
    file,
    rows,
    mapping,
    setMapping,
    errors,
    parseFile,
    validate,
    importDeck,
    isImporting,
  };
}
