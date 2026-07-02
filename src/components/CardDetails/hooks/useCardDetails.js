import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { generateReading } from "../../Import/hooks/generateReading";
import { hasCJKCharacter } from "../../../utils/cjkValidation";

export const useCardDetails = ({
  card,
  deckId,
  userId,
  studyMode,
  progressTable,
  onUpdate,
  onClose,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(card?.front ?? "");
  const [editBack, setEditBack] = useState(card?.back ?? "");
  const [editReading, setEditReading] = useState(card?.reading ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const cardTable = `cards_${studyMode.toLowerCase()}`;
  const isC = studyMode === "C";

  // Use whatever ID fallback structure is populated from the parent context
  const targetCardId = card?.id || card?.card_id;
  const isSusp = card?.suspended ?? false;

  const startEditing = () => {
    setEditFront(card?.front ?? "");
    setEditBack(card?.back ?? "");
    setEditReading(card?.reading ?? "");
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!targetCardId) return;
    const front = editFront.trim();
    const back = editBack.trim();

    if (isC && !hasCJKCharacter(front)) {
      setSaveError("Invalid character.");
      return;
    }

    if (!front || !back) {
      setSaveError("Front and back cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let payload = { front, back };

      if (isC) {
        const frontChanged = front !== card.front;
        const readingHint = editReading.trim() || null;

        if (frontChanged || readingHint !== card.reading) {
          const derived = generateReading(front, "Chinese", readingHint);
          payload = {
            ...payload,
            reading: derived.reading ?? readingHint,
            tones: derived.tones ?? null,
            strokeColors: derived.strokeColors ?? null,
          };
        } else {
          payload.reading = card.reading ?? null;
        }
      }

      const { data: updatedData, error: dbError } = await supabase
        .from(cardTable)
        .update(payload)
        .eq("id", targetCardId)
        .select("*")
        .single();

      if (dbError) throw dbError;

      await onUpdate({ ...card, ...updatedData });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError("Could not save — please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSuspension = async () => {
    if (!userId || !targetCardId) return;
    setIsToggling(true);
    setToggleError(null);

    try {
      const nextSuspendedState = !isSusp;

      // 🌟 FIX: We only upsert to progressTable since 'suspended' lives there!
      const progressPayload = {
        user_id: userId,
        deck_id: deckId,
        card_id: targetCardId,
        ease_factor: card?.ease_factor ?? 2.5,
        review_interval: card?.review_interval ?? 0,
        repetitions: card?.repetitions ?? 0,
        due_date: card?.due_date ?? null,
        last_studied: card?.last_studied ?? null,
        status: card?.status || "new",
        suspended: nextSuspendedState,
      };

      const { error: dbError } = await supabase
        .from(progressTable)
        .upsert(progressPayload, { onConflict: "user_id,card_id" });

      if (dbError) throw dbError;

      // Update frontend state context
      await onUpdate({
        ...card,
        ...progressPayload,
        id: targetCardId,
        card_id: targetCardId,
        suspended: nextSuspendedState,
      });
    } catch (err) {
      console.error(err);
      setToggleError("Could not update suspension status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!targetCardId) return;
    try {
      // 1. Delete progress row tracking metrics
      await supabase
        .from(progressTable)
        .delete()
        .eq("card_id", targetCardId)
        .eq("user_id", userId);

      // 2. Delete base data card reference
      const { error } = await supabase
        .from(cardTable)
        .delete()
        .eq("id", targetCardId);

      if (error) throw error;

      // 3. Purge from local parent view state arrays
      if (onUpdate) {
        await onUpdate({
          id: targetCardId,
          card_id: targetCardId,
          isDeleted: true,
        });
      }
      onClose?.();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleResetProgress = async () => {
    if (!userId || !targetCardId) return;
    try {
      const resetPayload = {
        user_id: userId,
        deck_id: deckId,
        card_id: targetCardId,
        ease_factor: 2.5,
        review_interval: 0,
        repetitions: 0,
        due_date: null,
        last_studied: null,
        status: "new",
        suspended: isSusp,
      };

      const { error } = await supabase
        .from(progressTable)
        .upsert(resetPayload, { onConflict: "user_id,card_id" });

      if (error) throw error;

      await onUpdate({
        ...card,
        ...resetPayload,
        id: targetCardId,
        card_id: targetCardId,
      });
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  return {
    isEditing,
    editFront,
    setEditFront,
    editBack,
    setEditBack,
    editReading,
    setEditReading,
    isSaving,
    saveError,
    isToggling,
    toggleError,
    startEditing,
    cancelEditing,
    handleSave,
    toggleSuspension,
    handleDeleteCard,
    handleResetProgress,
  };
};
