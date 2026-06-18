import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { selectDecks, fetchDecks } from "../../../slices/deckSlice";

// ─── Clone type definitions ───────────────────────────────────────────────────

export const ACTION_TYPES = [
  {
    id: "swap",
    label: "Swap front & back",
    description: "Reverse recall direction.",
    compatibleModes: ["A"],
    outputMode: "A",
  },
  {
    id: "c_to_a",
    label: "Convert to standard flashcard",
    description: "Instead of writing the character, use a regular flashcard.",
    compatibleModes: ["C"],
    outputMode: "A",
  },
  {
    id: "merge",
    label: "Normal + reversed",
    description: "Both language directions in one deck.",
    compatibleModes: ["A"],
    outputMode: "A",
  },
  //   {
  //     id: "missed",
  //     label: "Difficult cards",
  //     description: "A remedial deck built from your hardest cards.",
  //     compatibleModes: ["A", "C"],
  //     outputMode: "A",
  //   },
];

// C→A field options
export const C_FIELDS = [
  { value: "front", label: "Character" },
  { value: "back", label: "Meaning" },
  { value: "reading", label: "Reading (Pinyin)" },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

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
  const [missedLimit, setMissedLimit] = useState(20); // option 4

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedDeck = decks.find(
    (d) => String(d.deck_id) === String(selectedDeckId),
  );
  const studyMode = selectedDeck?.study_mode ?? null;

  const availableTypes = ACTION_TYPES.filter(
    (t) => !studyMode || t.compatibleModes.includes(studyMode),
  );

  const cloneType = ACTION_TYPES.find((t) => t.id === cloneTypeId);

  const isValid =
    selectedDeckId &&
    cloneTypeId &&
    newDeckName.trim() !== "" &&
    (cloneTypeId !== "c_to_a" ||
      (frontField && backField && frontField !== backField));

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = () => {
    setSelectedDeckId("");
    setCloneTypeId(null);
    setNewDeckName("");
    setFrontField("front");
    setBackField("back");
    setMissedLimit(20);
    setError(null);
    setSuccess(false);
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
      swap: `${base} (Reversed)`,
      c_to_a: `${base} (Text)`,
      merge: `${base} (Both directions)`,
      missed: `${base} (Remedial)`,
    };
    setNewDeckName(suggestions[id] ?? base);
  };

  // ── Fetch ALL source cards (no pagination — clone needs everything) ────────

  const fetchAllSourceCards = async (deckId, mode, userId) => {
    const table = mode === "C" ? "cards_c" : "cards_a";
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  };

  const fetchWorstCards = async (deckId, mode, userId, limit) => {
    const progressTable = mode === "C" ? "card_c_progress" : "card_a_progress";
    const cardTable = mode === "C" ? "cards_c" : "cards_a";

    // Get progress rows ordered by ease_factor ASC (lowest = hardest)
    const { data: progressRows, error: progErr } = await supabase
      .from(progressTable)
      .select("card_id, ease_factor")
      .eq("deck_id", deckId)
      .eq("user_id", userId)
      .eq("suspended", false)
      .not("last_studied", "is", null) // only cards that have been studied
      .order("ease_factor", { ascending: true })
      .limit(limit);

    if (progErr) throw progErr;
    if (!progressRows?.length)
      throw new Error("No studied cards found to build a remedial deck.");

    const cardIds = progressRows.map((r) => r.card_id);

    const { data: cards, error: cardsErr } = await supabase
      .from(cardTable)
      .select("*")
      .in("id", cardIds);

    if (cardsErr) throw cardsErr;

    // Preserve the ease_factor order
    const orderMap = Object.fromEntries(
      progressRows.map((r, i) => [r.card_id, i]),
    );
    return (cards ?? []).sort(
      (a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0),
    );
  };

  // ── Build cards_a insert payload per clone type ───────────────────────────

  const buildInsertPayload = (sourceCards, newDeckId, type, mode) => {
    switch (type) {
      case "swap":
        return sourceCards.map((c) => ({
          deck_id: newDeckId,
          front: c.back ?? "",
          back: c.front ?? "",
          audioUrl: c.audioUrl ?? null,
          created_at: new Date(),
        }));

      case "c_to_a":
        return sourceCards
          .map((c) => ({
            deck_id: newDeckId,
            front: c[frontField] ?? "",
            back: c[backField] ?? "",
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          }))
          .filter((c) => c.front.trim() !== "");

      case "merge":
        return [
          ...sourceCards.map((c) => ({
            deck_id: newDeckId,
            front: c.front ?? "",
            back: c.back ?? "",
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          })),
          ...sourceCards.map((c) => ({
            deck_id: newDeckId,
            front: c.back ?? "",
            back: c.front ?? "",
            audioUrl: c.audioUrl ?? null,
            created_at: new Date(),
          })),
        ];

      case "missed":
        // Source cards may be from C or A — always output as A (text only)
        return sourceCards.map((c) => ({
          deck_id: newDeckId,
          front: c.front ?? "",
          back: c.back ?? "",
          audioUrl: c.audioUrl ?? null,
          created_at: new Date(),
        }));

      default:
        return [];
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not authenticated.");

      // 1. Fetch source cards
      const sourceCards =
        cloneTypeId === "missed"
          ? await fetchWorstCards(
              selectedDeckId,
              studyMode,
              user.id,
              missedLimit,
            )
          : await fetchAllSourceCards(selectedDeckId, studyMode, user.id);

      if (!sourceCards.length) throw new Error("No cards found in this deck.");

      // 2. Build insert payload
      const cardPayload = buildInsertPayload(
        sourceCards,
        null,
        cloneTypeId,
        studyMode,
      );
      if (!cardPayload.length)
        throw new Error("No cards to clone with the selected mapping.");

      // 3. Create the new deck
      const { data: newDeck, error: deckErr } = await supabase
        .from("decks")
        .insert([
          {
            user_id: user.id,
            name: newDeckName.trim(),
            language: selectedDeck.language ?? "Unknown",
            study_mode: "A",
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

      // 4. Assign deck_id and insert cards
      const withDeckId = cardPayload.map((c) => ({
        ...c,
        deck_id: newDeck.id,
      }));

      const CHUNK = 400;
      let insertedCards = [];
      for (let i = 0; i < withDeckId.length; i += CHUNK) {
        const { data, error: insertErr } = await supabase
          .from("cards_a")
          .insert(withDeckId.slice(i, i + CHUNK))
          .select("id");
        if (insertErr) throw insertErr;
        insertedCards = [...insertedCards, ...data];
      }

      // 5. Insert progress rows
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
          .from("card_a_progress")
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
    missedLimit,
    setMissedLimit,
    // Submission
    isValid,
    isSubmitting,
    error,
    success,
    submit,
    reset,
    handleClose,
  };
}
