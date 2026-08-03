// src/components/DeckDetails/hooks/useBulkCardActions.js
import { useState } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { getTodayISO, getUserTimezone } from "../../../utils/dateHelper";
import { fetchDeckCounts } from "../../../slices/deckSlice";
import { fetchDailyActivity } from "../../../slices/activitySlice";

export const useBulkCardActions = ({
  deckId,
  userId,
  studyMode,
  progressTable,
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const cardTable = `cards_${studyMode.toLowerCase()}`;

  // cards: array of full card objects (need their current suspended flag etc.)
  // onUpdate: same callback passed to CardDetails (state.handleCardUpdate)
  const resetMany = async (cards, onUpdate) => {
    if (!userId || !cards?.length) return;
    setIsProcessing(true);
    setError(null);

    try {
      const resetPayloads = cards.map((card) => ({
        user_id: userId,
        deck_id: deckId,
        card_id: card.id || card.card_id,
        ease_factor: 2.5,
        review_interval: 0,
        repetitions: 0,
        due_date: null,
        last_studied: null,
        status: "new",
        suspended: card?.suspended ?? false,
      }));

      const { error: progressError } = await supabase
        .from(progressTable)
        .upsert(resetPayloads, { onConflict: "user_id,card_id" });

      if (progressError) throw progressError;

      // One RPC call covers the whole batch since it recalculates from the deck
      const { error: rpcError } = await supabase.rpc("refresh_deck_counts", {
        p_deck_id: deckId,
        p_user_timezone: getUserTimezone(),
      });

      if (rpcError) throw rpcError;

      // Adjust today's daily stats once for the whole batch
      const userTimezone = getUserTimezone();
      const today = getTodayISO(userTimezone);

      const { data: currentStats } = await supabase
        .from("daily_user_stats")
        .select("cards_learned, cards_reviewed")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (currentStats) {
        let learnedDelta = 0;
        let reviewedDelta = 0;

        cards.forEach((card) => {
          const previousStatus = card?.status || "new";
          const isLearned =
            previousStatus === "learned" ||
            (card?.repetitions > 0 && previousStatus === "waiting");
          const isReviewed =
            previousStatus === "review" || previousStatus === "reviewing";
          if (isLearned) learnedDelta += 1;
          if (isReviewed) reviewedDelta += 1;
        });

        if (learnedDelta > 0 || reviewedDelta > 0) {
          await supabase
            .from("daily_user_stats")
            .update({
              cards_learned: Math.max(
                0,
                currentStats.cards_learned - learnedDelta,
              ),
              cards_reviewed: Math.max(
                0,
                currentStats.cards_reviewed - reviewedDelta,
              ),
            })
            .eq("user_id", userId)
            .eq("date", today);
        }
      }

      dispatch(fetchDeckCounts({ user_id: userId }));
      dispatch(fetchDailyActivity({ user_id: userId }));

      // Sync local list state, one call per card (same shape CardDetails already uses)
      for (const card of cards) {
        const targetId = card.id || card.card_id;
        await onUpdate?.({
          ...card,
          ...resetPayloads.find((p) => p.card_id === targetId),
          id: targetId,
          card_id: targetId,
        });
      }
    } catch (err) {
      console.error("Bulk reset failed:", err);
      setError("Could not reset the selected cards.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMany = async (cards, onUpdate) => {
    if (!userId || !cards?.length) return;
    setIsProcessing(true);
    setError(null);

    try {
      const ids = cards.map((card) => card.id || card.card_id);

      const { error: progressDeleteError } = await supabase
        .from(progressTable)
        .delete()
        .in("card_id", ids)
        .eq("user_id", userId);

      if (progressDeleteError) throw progressDeleteError;

      const { error: cardDeleteError } = await supabase
        .from(cardTable)
        .delete()
        .in("id", ids);

      if (cardDeleteError) throw cardDeleteError;

      for (const id of ids) {
        await onUpdate?.({ id, card_id: id, isDeleted: true });
      }
    } catch (err) {
      console.error("Bulk delete failed:", err);
      setError("Could not delete the selected cards.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { resetMany, deleteMany, isProcessing, error };
};
