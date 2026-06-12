import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { selectDecks } from "../../../slices/deckSlice";
import { fetchDecks } from "../../../slices/deckSlice";
import { generateReading } from "./generateReading";

const INITIAL_FIELDS = { front: "", back: "", reading: "", audioUrl: "" };

export const useQuickCreateLogic = (onClose) => {
  const dispatch = useDispatch();
  const decks = useSelector(selectDecks);

  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedDeck = decks.find(
    (d) => String(d.deck_id) === String(selectedDeckId),
  );

  const studyMode = selectedDeck?.study_mode ?? null; // "A" | "C"

  const setField = (key, value) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setSelectedDeckId("");
    setFields(INITIAL_FIELDS);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid =
    selectedDeckId && fields.front.trim() !== "" && fields.back.trim() !== "";

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated.");

      const targetTable = studyMode === "C" ? "cards_c" : "cards_a";
      const progressTable =
        studyMode === "C" ? "card_c_progress" : "card_a_progress";

      // Build card payload
      let cardPayload = {
        deck_id: selectedDeckId,
        front: fields.front.trim(),
        back: fields.back.trim(),
        audioUrl: fields.audioUrl.trim() || null,
        created_at: new Date(),
      };

      if (studyMode === "C") {
        const { reading, strokeColors, tones } = generateReading(
          cardPayload.front,
          "Chinese",
          fields.reading.trim() || null,
        );
        cardPayload = {
          ...cardPayload,
          reading: reading ?? fields.reading.trim() ?? null,
          strokeColors: strokeColors ?? null,
          tones: tones ?? null,
        };
      }

      // Insert card
      const { data: inserted, error: insertError } = await supabase
        .from(targetTable)
        .insert([cardPayload])
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Insert progress row
      const { error: progressError } = await supabase
        .from(progressTable)
        .insert([
          {
            user_id: user.id,
            card_id: inserted.id,
            deck_id: selectedDeckId,
            status: "new",
            ease_factor: 2.5,
            review_interval: 0,
            repetitions: 0,
            suspended: false,
            due_date: null,
            last_studied: null,
          },
        ]);

      if (progressError) throw progressError;

      // Bump deck counts (new_count, cards_count, active_cards_count)
      const { error: deckUpdateError } = await supabase.rpc(
        "increment_deck_new_card",
        { p_deck_id: selectedDeckId },
      );

      // Fallback to manual update if RPC doesn't exist yet
      if (deckUpdateError) {
        await supabase
          .from("decks")
          .update({
            new_count: (selectedDeck.new ?? 0) + 1,
            cards_count: (selectedDeck.cards_count ?? 0) + 1,
            active_cards_count: (selectedDeck.active_cards_count ?? 0) + 1,
          })
          .eq("id", selectedDeckId);
      }

      await dispatch(fetchDecks()).unwrap();
      setSuccess(true);
    } catch (err) {
      console.error("Quick create failed:", err);
      setError(err.message || "Something went wrong.");
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
    fields,
    setField,
    isValid,
    isSubmitting,
    error,
    success,
    submit,
    reset,
    handleClose,
  };
};
