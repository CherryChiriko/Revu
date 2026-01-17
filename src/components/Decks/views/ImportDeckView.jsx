import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faArrowRight,
  faCheckCircle,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

import { supabase } from "../../../utils/supabaseClient";
import { generateMetadata } from "../../../utils/generateMetadata";
import { selectActiveTheme } from "../../../slices/themeSlice";
import Header from "../../General/ui/Header";

const STEPS = [1, 2, 3];

export default function ImportDeckView() {
  const activeTheme = useSelector(selectActiveTheme);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({
    word: "",
    reading: "",
    meaning: "",
    audioUrl: "",
  });

  const [deck, setDeck] = useState({
    name: "",
    description: "",
    language: "japanese",
  });

  const [isImporting, setIsImporting] = useState(false);

  //   const {
  //   rows,
  //   mapping,
  //   setMapping,
  //   parseFile,
  //   validate,
  //   importDeck,
  //   errors,
  //   isImporting,
  // } = useImportDeck();

  /* ---------------- file parsing ---------------- */

  const parseFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  };

  const handleFileUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const parsedRows = await parseFile(selected);

    if (!parsedRows.length) return;

    setFile(selected);
    setRows(parsedRows);
    setStep(2);
  };

  /* ---------------- derived data ---------------- */

  const availableColumns = useMemo(
    () => (rows.length ? Object.keys(rows[0]) : []),
    [rows]
  );

  const canProceedMapping = mapping.word.trim() && mapping.meaning.trim();

  const canImport = deck.name.trim().length > 0 && rows.length > 0;

  /* ---------------- import logic ---------------- */

  const handleImport = async () => {
    setIsImporting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const studyMode = deck.language === "chinese" ? "C" : "A";

      const { data: newDeck, error: deckError } = await supabase
        .from("decks")
        .insert({
          name: deck.name,
          description: deck.description,
          language: deck.language,
          study_mode: studyMode,
          user_id: user.id,
        })
        .select()
        .single();

      if (deckError) throw deckError;

      const cardTable = studyMode === "C" ? "cards_c" : "cards_a";

      const cards = rows.map((row) => {
        const front = row[mapping.word];
        const meta = generateMetadata(front, deck.language);

        const base = {
          deck_id: newDeck.id,
          front,
          back: row[mapping.meaning],
          audioUrl: mapping.audioUrl ? row[mapping.audioUrl] : null,
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

      const { data: insertedCards, error: cardError } = await supabase
        .from(cardTable)
        .insert(cards)
        .select();

      if (cardError) throw cardError;

      const progressTable =
        studyMode === "C" ? "card_c_progress" : "card_a_progress";

      await supabase.from(progressTable).insert(
        insertedCards.map((card) => ({
          card_id: card.id,
          deck_id: newDeck.id,
          user_id: user.id,
          status: "new",
        }))
      );

      navigate("/decks");
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setIsImporting(false);
    }
  };

  /* ---------------- render ---------------- */

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary}`}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <Header
          title="Import Deck"
          description="Import flashcards from CSV or Excel"
        />

        {/* progress */}
        <div className="flex justify-center items-center space-x-6">
          {STEPS.map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                ${
                  step >= s
                    ? activeTheme.button.primary
                    : activeTheme.border.secondary
                }`}
              >
                {step > s ? <FontAwesomeIcon icon={faCheckCircle} /> : s}
              </div>
              {s < 3 && (
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="mx-4 opacity-50"
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <section className={`${activeTheme.card.bg} p-6 rounded-xl`}>
            <h2 className="text-xl font-semibold mb-4">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload file
            </h2>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <section className={`${activeTheme.card.bg} p-6 rounded-xl`}>
            <h2 className="text-xl font-semibold mb-4">
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Map columns
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "word", label: "Word *" },
                { key: "reading", label: "Reading" },
                { key: "meaning", label: "Meaning *" },
                { key: "audioUrl", label: "Audio URL" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <select
                    value={mapping[key]}
                    onChange={(e) =>
                      setMapping({
                        ...mapping,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full mt-1 rounded-lg px-3 py-2"
                  >
                    <option value="">Select column</option>
                    {availableColumns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)}>Back</button>
              <button onClick={() => setStep(3)} disabled={!canProceedMapping}>
                Next
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <section className={`${activeTheme.card.bg} p-6 rounded-xl`}>
            <h2 className="text-xl font-semibold mb-4">Deck settings</h2>

            <input
              placeholder="Deck name"
              value={deck.name}
              onChange={(e) => setDeck({ ...deck, name: e.target.value })}
              className="w-full mb-3 px-3 py-2 rounded-lg"
            />

            <select
              value={deck.language}
              onChange={(e) =>
                setDeck({
                  ...deck,
                  language: e.target.value,
                })
              }
              className="w-full mb-3 px-3 py-2 rounded-lg"
            >
              <option value="japanese">Japanese</option>
              <option value="chinese">Chinese</option>
              <option value="english">English</option>
              <option value="french">French</option>
            </select>

            <textarea
              placeholder="Description"
              value={deck.description}
              onChange={(e) =>
                setDeck({
                  ...deck,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg"
            />

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)}>Back</button>
              <button
                disabled={!canImport || isImporting}
                onClick={handleImport}
              >
                {isImporting ? "Importing…" : "Import deck"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
