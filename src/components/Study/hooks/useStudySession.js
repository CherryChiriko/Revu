import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCards, fetchCards } from "../../../slices/cardSlice";
import { logStudySession } from "../../../slices/activitySlice";
import { updateProgress } from "../../../slices/progressSlice";
import { fetchDailyStreakStats } from "../../../slices/streakSlice";
import { computeSM2 } from "../../../utils/srs";
import { supabase } from "../../../utils/supabaseClient";
import { PHASES, LEARN_LIMIT, REVIEW_LIMIT } from "../constants/constants";
import { createSelector } from "@reduxjs/toolkit";

// ----------------------
// Memoized selector
// ----------------------
const selectCardsForDeck = createSelector(
  [selectCards, (_, deckId) => deckId],
  (allCards, deckId) => allCards.filter((c) => c.deck_id === deckId)
);

export default function useStudySession({ deck, navMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isReviewMode = navMode === "review";
  const modeLimit = isReviewMode ? REVIEW_LIMIT : LEARN_LIMIT;

  const [status, setStatus] = useState("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionUpdates, setSessionUpdates] = useState([]);

  // ----------------------
  // Cards
  // ----------------------
  const allCards = useSelector((state) =>
    selectCardsForDeck(state, deck?.id || -1)
  );

  const { cards, limit } = useMemo(() => {
    if (!deck?.id || allCards.length === 0) return { cards: [], limit: 0 };

    const filteredCards = allCards.filter(
      (c) => c.status === (isReviewMode ? "due" : "new")
    );

    const sessionLimit = Math.min(modeLimit, filteredCards.length);

    return { cards: filteredCards.slice(0, sessionLimit), limit: sessionLimit };
  }, [deck?.id, allCards, isReviewMode, modeLimit]);

  // ----------------------
  // Status
  // ----------------------
  useEffect(() => {
    if (!deck?.id) return setStatus("idle");
    if (allCards.length === 0) return setStatus("loading");
    setStatus("succeeded");
  }, [deck?.id, allCards]);

  // ----------------------
  // Phases
  // ----------------------
  const phases = isReviewMode
    ? [{ displayState: "quiz", allowRating: true }]
    : PHASES[deck?.study_mode] ?? PHASES.A;
  const totalPhases = phases.length;

  const currentPhase = phases[phaseIndex];
  const currentCard = cards[cardIndex];

  const totalSteps = totalPhases * limit || 1;
  const currentStep = phaseIndex * limit + cardIndex;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // ----------------------
  // Session Control
  // ----------------------
  const restartSession = useCallback(() => {
    setSessionFinished(false);
    setPhaseIndex(0);
    setCardIndex(0);
    setSessionUpdates([]);
  }, []);

  useEffect(() => {
    restartSession();
  }, [deck?.id, restartSession]);

  const exitStudy = useCallback(() => {
    navigate("/decks");
  }, [navigate]);

  const advanceCard = useCallback(() => {
    if (cardIndex + 1 < limit) {
      setCardIndex((i) => i + 1);
      return;
    }
    if (phaseIndex + 1 < totalPhases) {
      setPhaseIndex((p) => p + 1);
      setCardIndex(0);
      return;
    }
    setSessionFinished(true);
  }, [cardIndex, limit, phaseIndex, totalPhases]);

  // ----------------------
  // Handle rating
  // ----------------------
  const handleRate = useCallback(
    (rating) => {
      if (!currentCard || !currentPhase.allowRating) return;

      const updates = computeSM2(currentCard, rating);
      const updatedCard = {
        user_id: currentCard.user_id,
        deck_id: currentCard.deck_id,
        card_id: currentCard.card_id,
        status: "waiting",
        suspended: false,
        ...updates,
      };

      // Optimistically add to session updates
      setSessionUpdates((prev) => [...prev, updatedCard]);

      advanceCard();
    },
    [currentCard, currentPhase.allowRating, advanceCard]
  );

  // ----------------------
  // Batch update progress and streaks
  // ----------------------
  useEffect(() => {
    if (!sessionFinished || sessionUpdates.length === 0) return;

    const runUpdates = async () => {
      try {
        const cardsStudied = sessionUpdates.length;
        const cardsReviewed = isReviewMode ? cardsStudied : 0;
        const cardsLearned = isReviewMode ? 0 : cardsStudied;
        // 1. Update progress in Redux + DB
        await dispatch(
          updateProgress({ sessionUpdates, study_mode: deck.study_mode })
        ).unwrap();

        // 2. Update streaks in Supabase
        await supabase.rpc("update_streaks_after_session", {
          p_user_id: currentCard.user_id,
          p_deck_ids: [deck.id],
          p_cards_reviewed: cardsReviewed,
          p_cards_learned: cardsLearned,
          p_review_limit: REVIEW_LIMIT,
          p_learn_limit: LEARN_LIMIT,
        });

        // 3. Refresh cards & streaks in Redux
        await Promise.all([
          dispatch(
            fetchCards({
              deck_id: deck.id,
              user_id: currentCard.user_id,
              study_mode: deck.study_mode,
            })
          ),
          dispatch(fetchDailyStreakStats()),
        ]);

        // 4. Log activity locally
        dispatch(logStudySession({ cardsReviewed, cardsLearned }));

        // 5. Clear session updates
        setSessionUpdates([]);
      } catch (err) {
        console.error("Failed batch update:", err);
      }
    };

    runUpdates();
  }, [
    sessionFinished,
    sessionUpdates,
    deck,
    currentCard,
    dispatch,
    isReviewMode,
  ]);

  // ----------------------
  // Return
  // ----------------------
  return {
    cards,
    currentCard,
    currentPhase,
    sessionFinished,
    progressPercentage,
    progress: { current: currentStep, total: totalSteps },
    currentStep,
    totalSteps,
    handleRate,
    restartSession,
    resetSession: restartSession,
    exitStudy,
    exitSession: exitStudy,
    limit,
    mode: navMode,
    status,
  };
}
