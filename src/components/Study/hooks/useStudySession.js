import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCards, fetchCards } from "../../../slices/cardSlice";
// import { updateGlobalStreak } from "../../../slices/streakSlice";
import { logStudySession } from "../../../slices/activitySlice";
import { updateProgress } from "../../../slices/progressSlice";
import { computeSM2 } from "../../../utils/srs";
// import useAuth from "../../../hooks/useAuth";
import { PHASES, LEARN_LIMIT, REVIEW_LIMIT } from "../constants/constants";

export default function useStudySession({ deck, navMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { session } = useAuth();

  const isReviewMode = navMode === "review";
  const modeLimit = isReviewMode ? REVIEW_LIMIT : LEARN_LIMIT;

  // const userId = session?.user?.id;
  const [status, setStatus] = useState("idle");

  // --------------------------------------------------------------------------
  // Cards
  // --------------------------------------------------------------------------
  const allCards = useSelector(selectCards);

  const { cards, limit } = useMemo(() => {
    if (!deck?.id) return { cards: [], limit: 0 };

    // If we have cards in the store, but they belong to a different deck,
    // treat the list as empty during the transition.

    if (allCards.length > 0 && allCards[0].deck_id !== deck.id) {
      console.warn(
        "Card list contains stale data for a different deck. Returning empty list temporarily."
      );
      return { cards: [], limit: 0 };
    }

    const filteredCards = allCards.filter(
      (c) => c.status === (isReviewMode ? "due" : "new")
    );

    const sessionLimit = Math.min(modeLimit, filteredCards.length);

    return {
      cards: filteredCards.slice(0, sessionLimit),
      limit: sessionLimit,
    };
  }, [deck.id, allCards, isReviewMode, modeLimit]); // deck?.id to re-memoize on deck switch

  // --------------------------------------------------------------------------
  // Detect loading / stale / success states (NEW)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!deck?.id) {
      setStatus("idle");
      return;
    }

    // A. No cards at all → loading
    if (allCards.length === 0 || !cards) {
      setStatus("loading");
      return;
    }

    // B. Stale cards for different deck → loading
    if (allCards[0].deck_id !== deck.id) {
      setStatus("loading");
      return;
    }

    // C. Valid cards loaded
    setStatus("succeeded");
  }, [deck?.id, allCards]);

  // --------------------------------------------------------------------------
  // Phases (A or C)
  // --------------------------------------------------------------------------
  const phases = isReviewMode
    ? [{ displayState: "quiz", allowRating: true }]
    : PHASES[deck?.study_mode] ?? PHASES.A;

  const totalPhases = phases.length;

  // --------------------------------------------------------------------------
  // Session State
  // --------------------------------------------------------------------------
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);

  // const [sessionReviewed, setSessionReviewed] = useState(0);
  // const [sessionLearned, setSessionLearned] = useState(0);

  const currentPhase = phases[phaseIndex];
  const currentCard = cards[cardIndex];

  const [sessionUpdates, setSessionUpdates] = useState([]);

  // --------------------------------------------------------------------------
  // Restart session (same deck)
  // --------------------------------------------------------------------------
  const restartSession = useCallback(() => {
    setSessionFinished(false);
    setPhaseIndex(0);
    setCardIndex(0);
    // setSessionLearned(0);
    // setSessionReviewed(0);
    setSessionUpdates([]);
  }, []);

  // --------------------------------------------------------------------------
  // Reset when deck or available cards change
  // --------------------------------------------------------------------------

  useEffect(() => {
    restartSession();
  }, [deck.id, restartSession]);

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------
  const exitStudy = useCallback(() => {
    navigate("/decks");
  }, [navigate]);

  // --------------------------------------------------------------------------
  // Batch send updates when session finishes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!sessionFinished || sessionUpdates.length === 0) return;

    const sendBatch = async () => {
      try {
        await dispatch(
          updateProgress({
            sessionUpdates: sessionUpdates,
            study_mode: deck.study_mode,
          })
        ).unwrap();

        setStatus("loading");

        await dispatch(
          fetchCards({
            deck_id: deck.id,
            user_id: currentCard.user_id,
            study_mode: deck.study_mode,
          })
        );

        console.log("success");

        setSessionUpdates([]);
      } catch (err) {
        console.error("Failed batch update:", err);
      }
    };

    sendBatch();
  }, [sessionFinished, deck.study_mode, dispatch]);

  // --------------------------------------------------------------------------
  // Update daily stats after session
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!sessionFinished || sessionUpdates.length === 0) return;

    const cardsStudied = sessionUpdates.length;
    isReviewMode
      ? dispatch(
          logStudySession({
            cardsReviewed: cardsStudied,
            cardsLearned: 0,
            // timeStudiedSeconds: session.totalSeconds,  TODO: implement later
            // xpEarned: session.xp,                      TODO: implement later
          })
        )
      : dispatch(
          logStudySession({
            cardsReviewed: 0,
            cardsLearned: cardsStudied,
            // timeStudiedSeconds: session.totalSeconds,  TODO: implement later
            // xpEarned: session.xp,                      TODO: implement later
          })
        );
  }, [sessionFinished]); //LEAVE IT

  // --------------------------------------------------------------------------
  // Advance step
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Rating (SM-2 + Supabase)
  // --------------------------------------------------------------------------
  const handleRate = useCallback(
    async (rating) => {
      if (!currentCard || !currentPhase.allowRating) return;

      const updates = computeSM2(currentCard, rating);
      console.log("updates", updates);
      const updatedCard = {
        user_id: currentCard.user_id,
        deck_id: currentCard.deck_id,
        card_id: currentCard.card_id,
        status: "waiting",
        suspended: false,
        ...updates,
      };

      setSessionUpdates((prev) => [...prev, updatedCard]);

      advanceCard();
    },
    [currentCard, currentPhase.allowRating, advanceCard]
  );

  // --------------------------------------------------------------------------
  // Pass (no rating)
  // --------------------------------------------------------------------------
  const handlePass = useCallback(() => {
    advanceCard();
  }, [advanceCard]);

  // --------------------------------------------------------------------------
  // Update streaks when session finishes
  // --------------------------------------------------------------------------
  // useEffect(() => {
  //   if (!sessionFinished) return;
  //   if (!userId || !deck?.id) return;

  //   console.log("Log ", {
  //     cardsReviewed: sessionReviewed,
  //     cardsLearned: sessionLearned,
  //   });

  //   dispatch(
  //     logStudySession({
  //       cardsReviewed: sessionReviewed,
  //       cardsLearned: sessionLearned,
  //       // timeStudiedSeconds: session.totalSeconds,  TODO: implement later
  //       // xpEarned: session.xp,                      TODO: implement later
  //     })
  //   );

  // // Update global streak
  // dispatch(
  //   updateGlobalStreak({
  //     userId,
  //     reviewedCount: sessionReviewed,
  //     learnedCount: sessionLearned,
  //   })
  // );
  // }, [
  //   sessionFinished,
  //   sessionReviewed,
  //   sessionLearned,
  //   userId,
  //   deck?.id,
  //   dispatch,
  // ]);

  // --------------------------------------------------------------------------
  // Progress counters
  // --------------------------------------------------------------------------
  const totalSteps = totalPhases * limit || 1;
  const currentStep = phaseIndex * limit + cardIndex + 1;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // --------------------------------------------------------------------------
  // Return values matching what components expect
  // --------------------------------------------------------------------------
  return {
    // State
    cards,
    currentCard,
    currentPhase,
    sessionFinished,
    progressPercentage,
    progress: { current: currentStep - 1, total: totalSteps }, // For Bar component
    currentStep,
    totalSteps,
    // sessionReviewed,
    // sessionLearned,

    // API
    handleRate,
    handlePass,
    handlePassComplete: handlePass, // alias for SessionMode
    restartSession,
    resetSession: restartSession, // alias for SessionMode
    exitStudy,
    exitSession: exitStudy, // alias for SessionMode

    // Constants
    limit,
    mode: navMode, // return mode for components that need it
    status: status,
  };
}
