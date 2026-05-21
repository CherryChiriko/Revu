import { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveDeck, selectDeckCountsById } from "../../../slices/deckSlice";
import { selectDeckStreakById } from "../../../slices/streakSlice";
import { supabase } from "../../../utils/supabaseClient";
import fetchDecks from "../../../slices/deckSlice";

import { confirmDialog } from "primereact/confirmdialog";

export default function useDeckLogic(id, cards_count, { toast }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const counts = useSelector(selectDeckCountsById(id)) || {
    new: 0,
    due: 0,
    mastered: 0,
    waiting: 0,
  };

  const { streak, maxStreak, isStreakActive } = useSelector(
    selectDeckStreakById(id),
  );

  const showLearn = counts.new > 0;
  const showReview = counts.due > 0;
  const isMastered = cards_count === counts.mastered;

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
      // Always set the active deck when an action occurs
      dispatch(setActiveDeck(id));

      // 1. Handle Study Navigation
      if (type === "learn" || type === "review") {
        navigate(`/study?mode=${type}`);
        return;
      }

      // 2. Handle Management Actions (Edit/Delete)
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
            console.log("deckData:", deckData);

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
