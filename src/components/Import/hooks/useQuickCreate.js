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
    outputMode: null,
  },
];

export const C_FIELDS = [
  { value: "front", label: "Character" },
  { value: "back", label: "Meaning" },
  { value: "reading", label: "Reading (Pinyin)" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuickCreate(onClose) {
  const dispatch = useDispatch();
  const decks = useSelector(selectDecks);

  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [cloneTypeId, setCloneTypeId] = useState(null);

  const [newDeckName, setNewDeckName] = useState("");
  const [frontField, setFrontField] = useState("front");
  const [backField, setBackField] = useState("back");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedDeck = decks.find(
    (d) => String(d.deck_id) === String(selectedDeckId),
  );
  const studyMode = selectedDeck?.study_mode ?? null;

  const availableTypes = ACTION_TYPES.filter(
    (t) => !studyMode || t.compatibleModes.includes(studyMode),
  );

  const clearError = () => setError(null);
  const cloneType = ACTION_TYPES.find((t) => t.id === cloneTypeId);

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
      studyMode !== "C" ||
      (frontField && backField && frontField !== backField));
  console.log("is valid? ", isValid);

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

  const selectCloneType = (id) => {
    setCloneTypeId(id);
    setError(null); // <-- Clear previous submission errors
    setSkippedCount(0); // <-- Reset skip counts
    // Reset convert fields to default values to instantly remove the duplicate warning
    setFrontField("front");
    setBackField("back");

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

  const buildInsertPayload = (sourceCards, type, sourceMode) => {
    switch (type) {
      // ── simple: exact copy, same mode ─────────────────────────────────────
      case "simple": {
        if (sourceMode === "C") {
          return {
            cards: sourceCards.map((c) => ({
              front: c.front ?? "",
              back: c.back ?? "",
              // FIX: Checked snake_case property keys from Supabase structure
              reading: c.reading ?? "",
              tones: c.tones ?? null,
              strokeColors: c.stroke_colors ?? c.strokeColors ?? null,
              audioUrl: c.audio_url ?? c.audioUrl ?? null,
              created_at: new Date(),
            })),
            skipped: 0,
          };
        }
        return {
          cards: sourceCards.map((c) => ({
            front: c.front ?? "",
            back: c.back ?? "",
            audioUrl: c.audio_url ?? c.audioUrl ?? null,
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
            audioUrl: c.audio_url ?? c.audioUrl ?? null,
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
              audioUrl: c.audio_url ?? c.audioUrl ?? null,
              created_at: new Date(),
            })),
            ...sourceCards.map((c) => ({
              front: c.back ?? "",
              back: c.front ?? "",
              audioUrl: c.audio_url ?? c.audioUrl ?? null,
              created_at: new Date(),
            })),
          ],
          skipped: 0,
        };

      // ── convert ───────────────────────────────────────────────────────────
      case "convert": {
        // C → A: No CJK validation required here
        if (sourceMode === "C") {
          console.log("this is the first card ", sourceCards[0]);
          const mapped = sourceCards
            .map((c) => ({
              front: String(c[frontField] ?? "").trim(),
              back: String(c[backField] ?? "").trim(),
              audioUrl: c.audio_url ?? c.audioUrl ?? null,
              created_at: new Date(),
            }))
            .filter((c) => c.front !== "");
          return { cards: mapped, skipped: 0 };
        }

        // A → C: ONLY validate CJK here (moving from standard A to character C)
        const valid = [];
        let skipped = 0;
        for (const c of sourceCards) {
          const character = (c.front ?? "").trim();

          // Only validate characters if we are building a dynamic Character deck
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
            reading: reading ?? "",
            strokeColors: strokeColors ?? null,
            tones: tones ?? null,
            audioUrl: c.audio_url ?? c.audioUrl ?? null,
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

      const sourceCards = await fetchAllSourceCards(selectedDeckId, studyMode);
      if (!sourceCards.length) throw new Error("No cards found in this deck.");

      const { cards: cardPayload, skipped } = buildInsertPayload(
        sourceCards,
        cloneTypeId,
        studyMode,
      );

      setSkippedCount(skipped);

      if (!cardPayload.length)
        throw new Error("No valid cards to clone with the selected options.");

      const targetTable = TABLES[resolvedOutputMode];
      const progressTable = PROGRESS[resolvedOutputMode];

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
    newDeckName,
    setNewDeckName,
    frontField,
    setFrontField,
    backField,
    setBackField,
    isValid,
    isSubmitting,
    error,
    success,
    skippedCount,
    submit,
    reset,
    handleClose,
    clearError,
  };
}
