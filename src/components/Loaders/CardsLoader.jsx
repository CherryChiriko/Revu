import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCards } from "../../slices/cardSlice";

export default function CardsLoader({ activeDeck, userId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    console.debug(
      "[CardsLoader] activeDeck",
      activeDeck?.id,
      "studyMode",
      activeDeck?.study_mode,
      "userId",
      userId,
    );
    if (!activeDeck?.id || !userId) return;

    dispatch(
      fetchCards({
        deck_id: activeDeck.id,
        study_mode: activeDeck.study_mode,
        user_id: userId,
      }),
    );
  }, [activeDeck?.id, activeDeck?.study_mode, userId, dispatch]);

  return null;
}
