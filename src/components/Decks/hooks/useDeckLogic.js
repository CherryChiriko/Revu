import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDecks,
  setActiveDeck,
  selectDecks, // 👈 Import the raw decks array selector instead
} from "../../../slices/deckSlice";
import { selectDeckStreakById } from "../../../slices/streakSlice";
import { supabase } from "../../../utils/supabaseClient";
import DeckConfirmationDialog from "../components/DeckConfirmationDialog";

// Safe fallback object outside the hook so its reference remains completely static
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

  // 1. Efficient Inline Lookup: Grabs the master decks array without breaking memoization
  const decks = useSelector(selectDecks);

  const counts = useMemo(() => {
    const deck = decks.find((d) => d.deck_id === id);
    if (!deck) return DEFAULT_COUNTS;
    return {
      deckId: id,
      new: deck.new ?? 0,
      due: deck.due ?? 0,
      waiting: deck.waiting ?? 0,
      mastered: deck.mastered ?? 0,
      suspended: deck.suspended ?? 0,
    };
  }, [decks, id]);

  // 2. Do the exact same thing for streaks if selectDeckStreakById is structured similarly
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
        toast?.current?.clear();

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

        await dispatch(fetchDecks());

        if (toast?.current?.show) {
          toast.current.show({
            severity: "success",
            summary: "Deck deleted",
            detail: `"${deckData?.name || "Deck"}" was removed`,
            life: 3000,
            className: `shadow-2xl`,
          });
        }
      } catch (err) {
        console.error("Delete failed", err);
        if (toast?.current?.show) {
          toast.current.show({
            severity: "error",
            summary: "Delete failed",
            detail: err.message || "Could not delete deck",
            life: 4000,
            className: `shadow-2xl`,
          });
        }
      }
    },
    [dispatch, id, toast],
  );

  const handleAction = useCallback(
    (e, type, deckData = null) => {
      if (e && e.stopPropagation) e.stopPropagation();

      // Explicitly sets the active deck context when interacting with this deck card
      dispatch(setActiveDeck(id));

      if (type === "learn" || type === "review") {
        navigate(`/study?mode=${type}`);
        return;
      }

      if (type === "edit") {
        // openEditModal();
      }

      if (type === "delete") {
        if (!deckData) return;

        toast?.current?.show({
          severity: "warn",
          sticky: true,
          className: `space-y-3 rounded-2xl border ${activeTheme.border.card} ${activeTheme.background.danger} p-4 shadow-2xl`,
          content: (
            <DeckConfirmationDialog
              deckName={deckData?.name}
              activeTheme={activeTheme}
              isToast
              onConfirm={() => deleteDeck(deckData)}
              onCancel={() => {
                toast?.current?.clear();
                if (toast?.current?.show) {
                  toast.current.show({
                    severity: "info",
                    summary: "Cancelled",
                    detail: "Deletion cancelled",
                    life: 2000,
                  });
                }
              }}
            />
          ),
        });
      }
    },
    [dispatch, id, navigate, toast, activeTheme, deleteDeck],
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
    ],
  );
}
