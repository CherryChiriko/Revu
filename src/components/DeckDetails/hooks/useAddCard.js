import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { TABLES, PROGRESS } from "../../../utils/constants";
import { generateReading } from "../../Import/hooks/generateReading";

const INITIAL_FIELDS = { front: "", back: "", reading: "", audioUrl: "" };

export const useAddCard = ({
  deckId,
  studyMode,
  totalCardCount,
  onSuccess,
  onClose,
}) => {
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

      // 1. Insert core card contents
      const { data: inserted, error: insertError } = await supabase
        .from(targetTable)
        .insert([cardPayload])
        .select("*")
        .single();

      if (insertError) throw insertError;

      // 2. Insert progress row
      const { error: progressError } = await supabase
        .from(progressTable)
        .insert([
          {
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
          },
        ]);

      if (progressError) throw progressError;

      // ─── 3. EXECUTE PARENT REFETCH LOGIC FIRST ───
      if (onSuccess) {
        await onSuccess();
      }

      reset();

      // ─── 4. CLOSE MODAL AFTER SUCCESSFUL REFETCH ───
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
