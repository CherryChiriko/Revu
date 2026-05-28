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
import { confirmDialog } from "primereact/confirmdialog";

// Safe fallback object outside the hook so its reference remains completely static
const DEFAULT_COUNTS = {
  new: 0,
  due: 0,
  mastered: 0,
  waiting: 0,
  suspended: 0,
};

export default function useDeckLogic(id, cards_count, { toast }) {
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

  const deleteDeck = async (deck) => {
    try {
      const table = "cards_" + deck.study_mode.toLowerCase();

      await supabase.from(table).delete().eq("deck_id", id);
      await supabase.from("decks").delete().eq("id", id);

      dispatch(fetchDecks());
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

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
        confirmDialog({
          header: "Confirm Delete",
          message: "This will permanently delete the deck and all its cards.",
          icon: "pi pi-exclamation-triangle",
          acceptClassName: "p-button-danger ml-3",
          rejectClassName: "p-button-text",
          maskClassName: "backdrop-blur-sm",
          defaultFocus: "reject",

          accept: async () => {
            await deleteDeck(deckData);

            toast.current?.show({
              severity: "success",
              summary: "Deck deleted",
              detail: `"${deckData.name}" was removed`,
              life: 3000,
              className: `shadow-2xl `,
            });
          },

          reject: () => {
            toast.current?.show({
              severity: "info",
              summary: "Cancelled",
              detail: "Deletion cancelled",
              life: 2000,
            });
          },
        });
      }
    },
    [dispatch, id, navigate, toast], // Added missing 'toast' dependency reference safely
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
