import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCards,
  selectCardsStatus,
  fetchCards,
} from "../../../slices/cardSlice";
import { fetchDeckCounts, updateDeckLocally } from "../../../slices/deckSlice";
import {
  logStudySession,
  fetchDailyActivity,
} from "../../../slices/activitySlice";
import { updateProgress } from "../../../slices/progressSlice";
import { fetchDailyStreakStats } from "../../../slices/streakSlice";
import {
  selectReviewLimit,
  selectLearnLimit,
} from "../../../slices/settingsSlice";
import { computeSM2 } from "../../../utils/srs";
import { getMasteryStage } from "../../../utils/cardMastery";
import { getReviewXP } from "../../../utils/xp";
import { supabase } from "../../../utils/supabaseClient";
import { getTodayISO, getUserTimezone } from "../../../utils/dateHelper";
import { PHASES } from "../../../utils/constants";
import { createSelector } from "@reduxjs/toolkit";
import { fetchUserProfile } from "../../../slices/userSlice";

// Helper: Standard Fisher-Yates shuffle
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ----------------------
// Memoized selector: Gets ALL cards matching mode criteria once
// ----------------------
const selectFilteredCardsForDeck = createSelector(
  [selectCards, (_, deckId) => deckId, (_, __, sessionMode) => sessionMode],
  (allCards, deckId, sessionMode) => {
    const deckCards = allCards.filter((c) => c.deck_id === deckId);
    if (sessionMode === "learn") {
      return deckCards.filter(
        (c) => c.repetitions === 0 || c.status === "new" || !c.last_reviewed,
      );
    }
    return deckCards.filter(
      (c) => c.status === "waiting" || (c.repetitions && c.repetitions > 0),
    );
  },
);

export default function useStudySession({ deck, navMode, userId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isReviewMode = navMode === "review";
  const sessionMode = isReviewMode ? "review" : "learn";

  const reviewLimit = useSelector(selectReviewLimit);
  const learnLimit = useSelector(selectLearnLimit);
  const chunkSize = isReviewMode ? reviewLimit : learnLimit;

  // Track state
  const [startIndex, setStartIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionUpdates, setSessionUpdates] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);

  // Store shuffled order for the current active phase
  const [shuffledPhaseCards, setShuffledPhaseCards] = useState([]);

  const sessionStartedAtRef = useRef(Date.now());
  const userIdRef = useRef(userId || null);
  const fetchedKeyRef = useRef(null);

  useEffect(() => {
    if (userId) userIdRef.current = userId;
  }, [userId]);

  // Initial Fetch
  useEffect(() => {
    if (!deck?.id || !userId) return;

    const fetchKey = `${deck.id}:${sessionMode}`;
    if (fetchedKeyRef.current === fetchKey) return;
    fetchedKeyRef.current = fetchKey;

    dispatch(
      fetchCards({
        deck_id: deck.id,
        study_mode: deck.study_mode,
        user_id: userId,
        sessionMode,
        page: 0,
      }),
    );
  }, [deck?.id, sessionMode, userId, dispatch, deck?.study_mode]);

  const allFilteredCards = useSelector((state) =>
    selectFilteredCardsForDeck(state, deck?.id || -1, sessionMode),
  );
  const cardsStatus = useSelector(selectCardsStatus);

  useEffect(() => {
    if (allFilteredCards[0]?.user_id) {
      userIdRef.current = allFilteredCards[0].user_id;
    }
  }, [allFilteredCards]);

  // Base 5-card linear window
  const rawCards = useMemo(() => {
    return allFilteredCards.slice(startIndex, startIndex + chunkSize);
  }, [allFilteredCards, startIndex, chunkSize]);

  // Shuffle card order every time phaseIndex or rawCards batch changes
  useEffect(() => {
    if (rawCards.length > 0) {
      setShuffledPhaseCards(shuffleArray(rawCards));
    } else {
      setShuffledPhaseCards([]);
    }
  }, [phaseIndex, rawCards]);

  const limit = shuffledPhaseCards.length;
  const status = cardsStatus === "idle" ? "loading" : cardsStatus;

  const phases = useMemo(
    () =>
      isReviewMode
        ? [{ displayState: "quiz", allowRating: true }]
        : (PHASES[deck?.study_mode] ?? PHASES.A),
    [isReviewMode, deck?.study_mode],
  );
  const totalPhases = phases.length;
  const currentPhase = useMemo(() => phases[phaseIndex], [phases, phaseIndex]);
  const currentCard = shuffledPhaseCards[cardIndex];

  const totalSteps = totalPhases * limit || 1;
  const currentStep = phaseIndex * limit + cardIndex;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // "Learn More" / Restart with Next Batch
  const restartSession = useCallback(() => {
    setSessionFinished(false);
    setPhaseIndex(0);
    setCardIndex(0);
    setSessionUpdates([]);
    setSessionSummary(null);
    setStartIndex((prev) => prev + chunkSize);
    sessionStartedAtRef.current = Date.now();
  }, [chunkSize]);

  const prevDeckIdRef = useRef(null);
  useEffect(() => {
    if (!deck?.id || deck.id === prevDeckIdRef.current) return;
    prevDeckIdRef.current = deck.id;
    setStartIndex(0);
    setSessionFinished(false);
    setPhaseIndex(0);
    setCardIndex(0);
    setSessionUpdates([]);
    setSessionSummary(null);
  }, [deck?.id]);

  const exitStudy = useCallback(() => {
    navigate("/decks");
  }, [navigate]);

  const advanceCard = useCallback(() => {
    if (cardIndex + 1 < limit) {
      setCardIndex((i) => i + 1);
      return;
    }
    if (phaseIndex + 1 < totalPhases) {
      setPhaseIndex((p) => p + 1); // Phase change triggers useEffect -> reshuffles rawCards for next phase
      setCardIndex(0);
      return;
    }
    setSessionFinished(true);
  }, [cardIndex, limit, phaseIndex, totalPhases]);

  const handleRate = useCallback(
    (rating) => {
      if (!currentCard || !currentPhase?.allowRating) return;

      const updates = computeSM2(currentCard, rating);
      const prevStage = getMasteryStage(currentCard);
      const newStage = getMasteryStage({ ...currentCard, ...updates });
      const updatedCard = {
        user_id: currentCard.user_id,
        deck_id: currentCard.deck_id,
        card_id: currentCard.card_id,
        status: "waiting",
        suspended: false,
        xp_earned: getReviewXP(rating, prevStage, newStage),
        ...updates,
      };

      setSessionUpdates((prev) => [...prev, updatedCard]);
      advanceCard();
    },
    [currentCard, currentPhase?.allowRating, advanceCard],
  );

  // Batch update database on session finish
  useEffect(() => {
    if (!sessionFinished || sessionUpdates.length === 0) return;

    const resolvedUserId = userIdRef.current;
    if (!resolvedUserId) {
      console.error("[runUpdates] No userId available, aborting.");
      return;
    }

    const updatesSnapshot = [...sessionUpdates];
    const deckSnapshot = deck;

    const runUpdates = async () => {
      try {
        const cardsStudied = updatesSnapshot.length;
        const cardsReviewed = isReviewMode ? cardsStudied : 0;
        const cardsLearned = isReviewMode ? 0 : cardsStudied;

        setSessionSummary({ learned: cardsLearned, reviewed: cardsReviewed });

        await dispatch(
          updateProgress({
            sessionUpdates: updatesSnapshot,
            study_mode: deckSnapshot.study_mode,
          }),
        ).unwrap();

        const userTimezone = getUserTimezone();
        await supabase.rpc("update_streaks_after_session", {
          p_user_id: resolvedUserId,
          p_deck_results: [
            {
              deck_id: deckSnapshot.id,
              cards_reviewed: cardsReviewed,
              cards_learned: cardsLearned,
              xp_earned: updatesSnapshot.reduce(
                (total, update) => total + (update.xp_earned || 0),
                0,
              ),
            },
          ],
          p_review_limit: reviewLimit,
          p_learn_limit: learnLimit,
          p_user_timezone: userTimezone,
        });

        const studiedSeconds = Math.max(
          1,
          Math.round((Date.now() - sessionStartedAtRef.current) / 1000),
        );
        const today = getTodayISO(userTimezone);
        const { data: dailyStats } = await supabase
          .from("daily_user_stats")
          .select("time_studied_seconds")
          .eq("user_id", resolvedUserId)
          .eq("date", today)
          .maybeSingle();

        await supabase
          .from("daily_user_stats")
          .update({
            time_studied_seconds:
              (dailyStats?.time_studied_seconds || 0) + studiedSeconds,
          })
          .eq("user_id", resolvedUserId)
          .eq("date", today);

        await Promise.all([
          dispatch(fetchDeckCounts({ user_id: resolvedUserId })).unwrap(),
          dispatch(
            updateDeckLocally({
              id: deckSnapshot.id,
              last_reviewed: new Date().toISOString().split("T")[0],
            }),
          ),
          dispatch(fetchDailyStreakStats({ user_id: resolvedUserId })).unwrap(),
          dispatch(fetchDailyActivity({ user_id: resolvedUserId })),
          dispatch(fetchUserProfile(resolvedUserId)),
        ]);

        dispatch(logStudySession({ cardsReviewed, cardsLearned }));
        setSessionUpdates([]);
      } catch (err) {
        console.error("[runUpdates] Failed batch update:", err);
      }
    };

    runUpdates();
  }, [
    deck,
    dispatch,
    isReviewMode,
    learnLimit,
    reviewLimit,
    sessionFinished,
    sessionUpdates,
  ]);

  return {
    cards: shuffledPhaseCards,
    currentCard,
    currentPhase,
    sessionFinished,
    sessionSummary,
    progressPercentage,
    progress: { current: currentStep, total: totalSteps },
    currentStep,
    totalSteps,
    handleRate,
    handlePassComplete: advanceCard,
    restartSession,
    resetSession: restartSession,
    exitStudy,
    exitSession: exitStudy,
    limit,
    mode: navMode,
    status,
  };
}
