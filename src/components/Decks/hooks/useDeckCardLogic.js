import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveDeck, selectDeckCountsById } from "../../../slices/deckSlice";

export default function useDeckCardLogic(id) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const counts = useSelector(selectDeckCountsById(id)) || {
    new: 0,
    due: 0,
    mastered: 0,
    waiting: 0,
  };

  const cards_count = Object.values(counts).reduce((total, value) => {
    if (typeof value === "number") {
      //exclude id
      return total + value;
    }
    return total;
  }, 0);

  const showLearn = counts.new > 0;
  const showReview = counts.due > 0;
  const isMastered = cards_count === counts.mastered;

  const handleCardClick = useCallback(() => {
    if (!isMastered) navigate(`/deck/${id}`);
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
    }),
    [
      showLearn,
      showReview,
      isMastered,
      counts,
      cards_count,
      handleCardClick,
      handleAction,
    ]
  );
}
