import { useState } from "react";
import { useDispatch } from "react-redux"; // 🌟 ADDED to trigger counter dispatches
import { supabase } from "../../../utils/supabaseClient";
import { generateReading } from "../../Import/hooks/generateReading";
import { hasCJKCharacter } from "../../../utils/cjkValidation";
import { getTodayISO, getUserTimezone } from "../../../utils/dateHelper"; // 🌟 ADDED for timezone math
import { fetchDeckCounts } from "../../../slices/deckSlice"; // 🌟 IMPORT your sync actions
import { fetchDailyActivity } from "../../../slices/activitySlice";

export const useCardDetails = ({
  card,
  deckId,
  userId,
  studyMode,
  progressTable,
  onUpdate,
  onClose,
}) => {
  const dispatch = useDispatch(); // 🌟 ADDED
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
      await supabase
        .from(progressTable)
        .delete()
        .eq("card_id", targetCardId)
        .eq("user_id", userId);

      const { error } = await supabase
        .from(cardTable)
        .delete()
        .eq("id", targetCardId);

      if (error) throw error;

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
      const previousStatus = card?.status || "new";

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

      // 1. Reset card status in card progress tracker table
      const { error: progressError } = await supabase
        .from(progressTable)
        .upsert(resetPayload, { onConflict: "user_id,card_id" });

      if (progressError) throw progressError;

      // 🌟 FIX 1: Trigger the Postgres count function to update the parent deck
      // categories ('mastered', 'due', 'waiting') inside the DB instantly!
      const { error: rpcError } = await supabase.rpc("refresh_deck_counts", {
        p_deck_id: deckId,
        p_user_timezone: getUserTimezone(),
      });

      if (rpcError) throw rpcError;

      // 2. Adjust global daily user overview counters for today
      const userTimezone = getUserTimezone();
      const today = getTodayISO(userTimezone);

      const { data: currentStats } = await supabase
        .from("daily_user_stats")
        .select("cards_learned, cards_reviewed")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (currentStats) {
        const isLearned =
          previousStatus === "learned" ||
          (card?.repetitions > 0 && previousStatus === "waiting");
        const isReviewed =
          previousStatus === "review" || previousStatus === "reviewing";

        await supabase
          .from("daily_user_stats")
          .update({
            cards_learned: isLearned
              ? Math.max(0, currentStats.cards_learned - 1)
              : currentStats.cards_learned,
            cards_reviewed: isReviewed
              ? Math.max(0, currentStats.cards_reviewed - 1)
              : currentStats.cards_reviewed,
          })
          .eq("user_id", userId)
          .eq("date", today);
      }

      // 3. Dispatch changes to Redux so UI layouts update instantly
      dispatch(fetchDeckCounts({ user_id: userId }));
      dispatch(fetchDailyActivity({ user_id: userId }));

      // 4. Update the local UI state context
      await onUpdate({
        ...card,
        ...resetPayload,
        id: targetCardId,
        card_id: targetCardId,
      });
    } catch (err) {
      console.error("Reset progress system failure:", err);
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
