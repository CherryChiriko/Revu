import { useState } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { TABLES, PROGRESS } from "../../../utils/constants";
import { generateReading } from "../../Import/hooks/generateReading";
import { appendCard } from "../../../slices/cardSlice";

const INITIAL_FIELDS = { front: "", back: "", reading: "", audioUrl: "" };

export const useAddCard = ({
  deckId,
  studyMode,
  totalCardCount,
  onSuccess,
  onClose, // <─── 1. Pass onClose into your hook options hook parameter object
}) => {
  const dispatch = useDispatch();
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setFields(INITIAL_FIELDS);
    setError(null);
  };

  const isValid =
    deckId && fields.front.trim() !== "" && fields.back.trim() !== "";

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

      const targetTable = TABLES[studyMode];
      const progressTable = PROGRESS[studyMode];

      let cardPayload = {
        deck_id: deckId,
        front: fields.front.trim(),
        back: fields.back.trim(),
        audioUrl: fields.audioUrl.trim() || null,
        created_at: new Date().toISOString(),
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
        .select("*")
        .single();

      if (insertError) throw insertError;

      // Insert progress row
      const defaultProgress = {
        user_id: user.id,
        card_id: inserted.id,
        deck_id: deckId,
        status: "new",
        ease_factor: 2.5,
        review_interval: 0,
        repetitions: 0,
        suspended: false,
        due_date: null,
        last_studied: null,
      };

      const { error: progressError } = await supabase
        .from(progressTable)
        .insert([defaultProgress]);

      if (progressError) throw progressError;

      // ─── 2. FORMAT COMPATIBILITY FIX ───
      // Ensure the structural layout matches exactly what mappedCards emits
      const UIReadyCard = {
        ...inserted,
        ...defaultProgress,
        id: inserted.id, // Ensure component unique keys match
        card_id: inserted.id, // Match structural references
        status: "new", // Ensure card displays instantly under UI filters
      };

      dispatch(appendCard(UIReadyCard));

      if (onSuccess) {
        await onSuccess();
      }

      reset();

      // ─── 3. AUTO CLOSE MODAL ───
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Quick create failed:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { fields, setField, isValid, isSubmitting, error, submit, reset };
};
