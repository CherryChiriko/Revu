import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveDeck, selectDeckCountsById } from "../../../slices/deckSlice";
import { selectDeckStreakById } from "../../../slices/streakSlice";

export default function useDeckCardLogic(id, cards_count) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const counts = useSelector(selectDeckCountsById(id)) || {
    new: 0,
    due: 0,
    mastered: 0,
    waiting: 0,
  };

  const { streak, maxStreak, isStreakActive } = useSelector(
    selectDeckStreakById(id)
  );

  const showLearn = counts.new > 0;
  const showReview = counts.due > 0;
  const isMastered = cards_count === counts.mastered;

  const handleCardClick = useCallback(() => {
    if (!isMastered) navigate(`/decks/${id}`);
  }, [isMastered, id, navigate]);

  const handleAction = useCallback(
    (e, type) => {
      if (e && e.stopPropagation) e.stopPropagation();
      dispatch(setActiveDeck(id));
      if (type === "learn") navigate("/study?mode=learn");
      if (type === "review") navigate("/study?mode=review");
    },
    [dispatch, id, navigate]
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
    ]
  );
}
