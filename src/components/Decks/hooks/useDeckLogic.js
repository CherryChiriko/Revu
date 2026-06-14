import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDecks, setActiveDeck } from "../../../slices/deckSlice";
import { selectDeckStreakById } from "../../../slices/streakSlice";
import { supabase } from "../../../utils/supabaseClient";

const DEFAULT_COUNTS = {
  new: 0,
  due: 0,
  mastered: 0,
  waiting: 0,
  suspended: 0,
};

export default function useDeckLogic(id, cards_count, { toast, activeTheme }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Delete modal state ─────────────────────────────────────────────────────
  const [pendingDeleteDeck, setPendingDeleteDeck] = useState(null);

  const counts = useSelector(
    (state) => state.decks.deckCounts[id] ?? DEFAULT_COUNTS,
  );

  const streakData = useSelector(selectDeckStreakById(id));
  const { streak, maxStreak, isStreakActive } = streakData || {
    streak: 0,
    maxStreak: 0,
    isStreakActive: false,
  };

  const showLearn = counts.new > 0;
  const showReview = counts.due > 0;
  const activeCardsCount = Math.max(cards_count - (counts.suspended || 0), 0);
  const isMastered =
    activeCardsCount > 0 && activeCardsCount === counts.mastered;

  const handleCardClick = useCallback(() => {
    if (!isMastered) navigate(`/decks/${id}`);
  }, [isMastered, id, navigate]);

  const deleteDeck = useCallback(
    async (deckData) => {
      try {
        if (!deckData || !deckData.study_mode) {
          throw new Error("Deck data is missing or invalid");
        }

        const table = "cards_" + deckData.study_mode.toLowerCase();

        const { error: cardsError } = await supabase
          .from(table)
          .delete()
          .eq("deck_id", id);

        if (cardsError) throw cardsError;

        const { error: decksError } = await supabase
          .from("decks")
          .delete()
          .eq("id", id);

        if (decksError) throw decksError;

        setPendingDeleteDeck(null);
        await dispatch(fetchDecks());

        toast?.current?.show({
          severity: "success",
          summary: "Deck deleted",
          detail: `"${deckData?.name || "Deck"}" was removed`,
          life: 3000,
        });
      } catch (err) {
        console.error("Delete failed", err);
        setPendingDeleteDeck(null);
        toast?.current?.show({
          severity: "error",
          summary: "Delete failed",
          detail: err.message || "Could not delete deck",
          life: 4000,
        });
      }
    },
    [dispatch, id, toast],
  );

  const handleAction = useCallback(
    (e, type, deckData = null) => {
      if (e && e.stopPropagation) e.stopPropagation();
      dispatch(setActiveDeck(id));

      if (type === "learn" || type === "review") {
        navigate(`/study?mode=${type}`);
        return;
      }

      if (type === "delete") {
        if (!deckData) return;
        setPendingDeleteDeck(deckData);
      }
    },
    [dispatch, id, navigate],
  );

  return useMemo(
    () => ({
      showLearn,
      showReview,
      isMastered,
      counts,
      cards_count,
      handleCardClick,
      handleAction,
      streak,
      maxStreak,
      isStreakActive,
      pendingDeleteDeck,
      onConfirmDelete: () => deleteDeck(pendingDeleteDeck),
      onCancelDelete: () => setPendingDeleteDeck(null),
    }),
    [
      showLearn,
      showReview,
      isMastered,
      counts,
      cards_count,
      handleCardClick,
      handleAction,
      streak,
      maxStreak,
      isStreakActive,
      pendingDeleteDeck,
      deleteDeck,
    ],
  );
}
