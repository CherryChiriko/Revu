import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { selectDecks, fetchDecks } from "../../../slices/deckSlice";
import { generateReading } from "../hooks/generateReading";
import { hasCJKCharacter } from "../../../utils/cjkValidation";
import { PROGRESS, TABLES } from "../../../utils/constants";

// ─── Clone type definitions ───────────────────────────────────────────────────

export const ACTION_TYPES = [
  {
    id: "simple",
    label: "Copy deck",
    description: "Make an exact copy of this deck.",
    compatibleModes: ["A", "C"],
    // outputMode matches the source deck's mode — resolved at submit time
    outputMode: null,
  },
  {
    id: "swap",
    label: "Swap front & back",
    description: "Reverse recall direction.",
    compatibleModes: ["A"],
    outputMode: "A",
  },
  {
    id: "merge",
    label: "Normal + reversed",
    description: "Both language directions in one deck.",
    compatibleModes: ["A"],
    outputMode: "A",
  },
  {
    id: "convert",
    label: "Convert card type",
    description: "Switch between standard and character cards.",
    compatibleModes: ["A", "C"],
    outputMode: null, // opposite of source — resolved at submit time
  },

  // missed — deferred
  // {
  //   id: "missed",
  //   label: "Difficult cards",
  //   description: "A remedial deck built from your hardest cards.",
  //   compatibleModes: ["A", "C"],
  //   outputMode: "A",
  // },
];

// C→A field options
export const C_FIELDS = [
  { value: "front", label: "Character" },
  { value: "back", label: "Meaning" },
  { value: "reading", label: "Reading (Pinyin)" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuickCreate(onClose) {
  const dispatch = useDispatch();
  const decks = useSelector(selectDecks);

  // Step 1 — source deck + clone type
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [cloneTypeId, setCloneTypeId] = useState(null);

  // Step 2 — options per type
  const [newDeckName, setNewDeckName] = useState("");
  const [frontField, setFrontField] = useState("front"); // C→A mapping
  const [backField, setBackField] = useState("back"); // C→A mapping

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedDeck = decks.find(
    (d) => String(d.deck_id) === String(selectedDeckId),
  );
  const studyMode = selectedDeck?.study_mode ?? null; // "A" or "C"

  // swap is only available for mode A; hide it for C
  const availableTypes = ACTION_TYPES.filter(
    (t) => !studyMode || t.compatibleModes.includes(studyMode),
  ).filter((t) => !(t.id === "swap" && studyMode === "C"));

  const cloneType = ACTION_TYPES.find((t) => t.id === cloneTypeId);

  // Resolve the output mode for types whose outputMode is dynamic
  const resolvedOutputMode = (() => {
    if (!cloneType || !studyMode) return null;
    if (cloneType.outputMode) return cloneType.outputMode;
    if (cloneTypeId === "simple") return studyMode;
    if (cloneTypeId === "convert") return studyMode === "A" ? "C" : "A";
    return studyMode;
  })();

  const isValid =
    selectedDeckId &&
    cloneTypeId &&
    newDeckName.trim() !== "" &&
    (cloneTypeId !== "convert" ||
      studyMode !== "C" || // A→C needs no extra field check
      (frontField && backField && frontField !== backField));

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = () => {
    setSelectedDeckId("");
    setCloneTypeId(null);
    setNewDeckName("");
    setFrontField("front");
    setBackField("back");
    setError(null);
    setSuccess(false);
    setSkippedCount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Auto-suggest deck name when type is chosen ────────────────────────────

  const selectCloneType = (id) => {
    setCloneTypeId(id);
    if (!selectedDeck) return;
    const base = selectedDeck.name;
    const suggestions = {
      simple: `${base} (Copy)`,
      swap: `${base} (Reversed)`,
      convert: `${base} (Converted)`,
      merge: `${base} (Both directions)`,
    };
    setNewDeckName(suggestions[id] ?? base);
  };

  // ── Fetch ALL source cards (no pagination — clone needs everything) ────────

  const fetchAllSourceCards = async (deckId, mode) => {
    const table = TABLES[mode];
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  };

  // ── Build insert payload per clone type ───────────────────────────────────

  /**
   * Returns { cards, skipped }
   * cards  — array ready for Supabase insert (without deck_id)
   * skipped — count of rows dropped (CJK validation failures)
   */
  const buildInsertPayload = (sourceCards, type, sourceMode) => {
    switch (type) {
      // ── simple: exact copy, same mode ─────────────────────────────────────
      case "simple": {
        if (sourceMode === "C") {
          return {
            cards: sourceCards.map((c) => ({
              front: c.front ?? "",
              back: c.back ?? "",
              reading: c.reading ?? null,
              tones: c.tones ?? null,
              strokeColors: c.strokeColors ?? null,
              audioUrl: c.audioUrl ?? null,
              created_at: new Date(),
            })),
            skipped: 0,
          };
        }
        return {
          cards: sourceCards.map((c) => ({
            front: c.front ?? "",
            back: c.back ?? "",
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          })),
          skipped: 0,
        };
      }

      // ── swap: reverse front/back (mode A only) ────────────────────────────
      case "swap":
        return {
          cards: sourceCards.map((c) => ({
            front: c.back ?? "",
            back: c.front ?? "",
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          })),
          skipped: 0,
        };

      // ── merge: original + reversed in one deck (mode A only) ──────────────
      case "merge":
        return {
          cards: [
            ...sourceCards.map((c) => ({
              front: c.front ?? "",
              back: c.back ?? "",
              audioUrl: c.audioUrl ?? null,
              created_at: new Date(),
            })),
            ...sourceCards.map((c) => ({
              front: c.back ?? "",
              back: c.front ?? "",
              audioUrl: c.audioUrl ?? null,
              created_at: new Date(),
            })),
          ],
          skipped: 0,
        };

      // ── convert ───────────────────────────────────────────────────────────
      case "convert": {
        // C → A: user picks which C fields map to front/back
        if (sourceMode === "C") {
          const mapped = sourceCards
            .map((c) => ({
              front: c[frontField] ?? "",
              back: c[backField] ?? "",
              audioUrl: c.audioUrl ?? null,
              created_at: new Date(),
            }))
            .filter((c) => c.front.trim() !== "");
          return { cards: mapped, skipped: 0 };
        }

        // A → C: front must be a valid CJK character; generate pinyin
        const valid = [];
        let skipped = 0;
        for (const c of sourceCards) {
          const character = (c.front ?? "").trim();
          if (!hasCJKCharacter(character)) {
            skipped++;
            continue;
          }
          const { reading, strokeColors, tones } = generateReading(
            character,
            "Chinese",
            null,
          );
          valid.push({
            front: character,
            back: c.back ?? "",
            reading: reading ?? null,
            strokeColors: strokeColors ?? null,
            tones: tones ?? null,
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          });
        }
        return { cards: valid, skipped };
      }

      default:
        return { cards: [], skipped: 0 };
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSkippedCount(0);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not authenticated.");

      // 1. Fetch source cards
      const sourceCards = await fetchAllSourceCards(selectedDeckId, studyMode);
      if (!sourceCards.length) throw new Error("No cards found in this deck.");

      // 2. Build insert payload
      const { cards: cardPayload, skipped } = buildInsertPayload(
        sourceCards,
        cloneTypeId,
        studyMode,
      );

      setSkippedCount(skipped);

      if (!cardPayload.length)
        throw new Error("No valid cards to clone with the selected options.");

      // 3. Determine target table
      const targetTable = TABLES[resolvedOutputMode];
      const progressTable = PROGRESS[resolvedOutputMode];

      // 4. Create the new deck
      const { data: newDeck, error: deckErr } = await supabase
        .from("decks")
        .insert([
          {
            user_id: user.id,
            name: newDeckName.trim(),
            language: selectedDeck.language ?? "Unknown",
            study_mode: resolvedOutputMode,
            description: `Cloned from "${selectedDeck.name}"`,
            tags: selectedDeck.tags ?? [],
            cards_count: cardPayload.length,
            new_count: cardPayload.length,
            due_count: 0,
            waiting_count: 0,
            mastered_count: 0,
            suspended_count: 0,
            active_cards_count: cardPayload.length,
            status: "learning",
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (deckErr) throw deckErr;

      // 5. Assign deck_id and insert cards in chunks
      const withDeckId = cardPayload.map((c) => ({
        ...c,
        deck_id: newDeck.id,
      }));

      const CHUNK = 400;
      let insertedCards = [];
      for (let i = 0; i < withDeckId.length; i += CHUNK) {
        const { data, error: insertErr } = await supabase
          .from(targetTable)
          .insert(withDeckId.slice(i, i + CHUNK))
          .select("id");
        if (insertErr) throw insertErr;
        insertedCards = [...insertedCards, ...data];
      }

      // 6. Insert progress rows
      const progressRows = insertedCards.map((c) => ({
        user_id: user.id,
        card_id: c.id,
        deck_id: newDeck.id,
        status: "new",
        ease_factor: 2.5,
        review_interval: 0,
        repetitions: 0,
        suspended: false,
        due_date: null,
        last_studied: null,
      }));

      for (let i = 0; i < progressRows.length; i += CHUNK) {
        const { error: progErr } = await supabase
          .from(progressTable)
          .insert(progressRows.slice(i, i + CHUNK));
        if (progErr) throw progErr;
      }

      await dispatch(fetchDecks()).unwrap();
      setSuccess(true);
    } catch (err) {
      console.error("Clone failed:", err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Data
    decks,
    selectedDeckId,
    setSelectedDeckId,
    selectedDeck,
    studyMode,
    resolvedOutputMode,
    availableTypes,
    cloneTypeId,
    cloneType,
    selectCloneType,
    // Options
    newDeckName,
    setNewDeckName,
    frontField,
    setFrontField,
    backField,
    setBackField,
    // Submission
    isValid,
    isSubmitting,
    error,
    success,
    skippedCount,
    submit,
    reset,
    handleClose,
  };
}
