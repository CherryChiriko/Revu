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
  cardsByPage,
  onUpdate,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(card.front ?? "");
  const [editBack, setEditBack] = useState(card.back ?? "");
  const [editReading, setEditReading] = useState(card.reading ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const cardTable = `cards_${studyMode.toLowerCase()}`;
  const isC = studyMode === "C";
  const isSusp = card.suspended;

  const startEditing = () => {
    setEditFront(card.front ?? "");
    setEditBack(card.back ?? "");
    setEditReading(card.reading ?? "");
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const getPageKey = (id) => {
    if (!cardsByPage) return null; // Prevent the "undefined to object" error

    return Object.keys(cardsByPage).find((key) =>
      cardsByPage[key]?.some((c) => c.id === id),
    );
  };

  const handleSave = async () => {
    const front = editFront.trim();
    const back = editBack.trim();

    // Add validation check for Chinese Mode during save
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

      // Add .select().single() to get the updated row back from Supabase
      const { data: updatedData, error: dbError } = await supabase
        .from(cardTable)
        .update(payload)
        .eq("id", card.card_id)
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
    if (!userId) return;
    setIsToggling(true);
    setToggleError(null);

    try {
      const progressPayload = {
        user_id: userId,
        deck_id: deckId,
        card_id: card.card_id,
        ease_factor: card.ease_factor ?? 2.5,
        review_interval: card.review_interval ?? 0,
        repetitions: card.repetitions ?? 0,
        due_date: card.due_date ?? null,
        last_studied: card.last_studied ?? null,
        status: isSusp ? "waiting" : card.status,
        suspended: !isSusp,
      };

      const { error: dbError } = await supabase
        .from(progressTable)
        .upsert(progressPayload, { onConflict: "user_id,card_id" });

      if (dbError) throw dbError;

      await onUpdate({ ...card, ...progressPayload });
    } catch (err) {
      console.error(err);
      setToggleError("Could not save — please try again.");
    } finally {
      setIsToggling(false);
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
  };
};
