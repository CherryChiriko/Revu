import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCards,
  selectCardsStatus,
  fetchCards,
  fetchMoreCards,
} from "../../../slices/cardSlice";
// 🌟 Added updateDeckLocally to the imports here
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

// ----------------------
// Memoized selector
// ----------------------
const selectCardsForDeck = createSelector(
  [selectCards, (_, deckId) => deckId],
  (allCards, deckId) => allCards.filter((c) => c.deck_id === deckId),
);

export default function useStudySession({ deck, navMode, userId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isReviewMode = navMode === "review";
  const sessionMode = isReviewMode ? "review" : "learn";

  const reviewLimit = useSelector(selectReviewLimit);
  const learnLimit = useSelector(selectLearnLimit);
  const modeLimit = isReviewMode ? reviewLimit : learnLimit;
  const BATCH_SIZE = Math.max(20, modeLimit * 2);
  const PREFETCH_THRESHOLD = modeLimit;

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [sessionOffset, setSessionOffset] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionUpdates, setSessionUpdates] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);

  const sessionStartedAtRef = useRef(Date.now());
  const userIdRef = useRef(userId || null);
  const batchPageRef = useRef(1);
  const isFetchingMoreRef = useRef(false);
  const fetchedKeyRef = useRef(null);

  useEffect(() => {
    if (userId) userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!deck?.id || !userId) return;

    const fetchKey = `${deck.id}:${sessionMode}`;
    if (fetchedKeyRef.current === fetchKey) return;
    fetchedKeyRef.current = fetchKey;

    batchPageRef.current = 1;
    isFetchingMoreRef.current = false;

    dispatch(
      fetchCards({
        deck_id: deck.id,
        study_mode: deck.study_mode,
        user_id: userId,
        sessionMode,
        page: 0,
        pageSize: BATCH_SIZE,
      }),
    );
  }, [deck?.id, sessionMode, userId, dispatch, BATCH_SIZE]);

  const allCards = useSelector((state) =>
    selectCardsForDeck(state, deck?.id || -1),
  );
  const cardsStatus = useSelector(selectCardsStatus);

  useEffect(() => {
    if (allCards[0]?.user_id) {
      userIdRef.current = allCards[0].user_id;
    }
  }, [allCards]);

  const { cards, limit } = useMemo(() => {
    if (!deck?.id || allCards.length === 0) return { cards: [], limit: 0 };

    const start = Math.max(0, sessionOffset);
    const sessionSlice = allCards.slice(start, start + modeLimit);
    const sessionLimit = Math.min(modeLimit, sessionSlice.length);

    return { cards: sessionSlice.slice(0, sessionLimit), limit: sessionLimit };
  }, [deck?.id, allCards, modeLimit, sessionOffset]);

  const status = cardsStatus === "idle" ? "loading" : cardsStatus;

  useEffect(() => {
    if (cards.length === 0 || !deck?.id || !userIdRef.current) return;

    const cardsRemaining = cards.length - cardIndex;
    if (cardsRemaining > PREFETCH_THRESHOLD || isFetchingMoreRef.current)
      return;

    isFetchingMoreRef.current = true;
    dispatch(
      fetchMoreCards({
        deck_id: deck.id,
        study_mode: deck.study_mode,
        user_id: userIdRef.current,
        sessionMode,
        page: batchPageRef.current,
        pageSize: BATCH_SIZE,
      }),
    ).then(() => {
      batchPageRef.current += 1;
      isFetchingMoreRef.current = false;
    });
  }, [cardIndex, cards.length]);

  const phases = useMemo(
    () =>
      isReviewMode
        ? [{ displayState: "quiz", allowRating: true }]
        : (PHASES[deck?.study_mode] ?? PHASES.A),
    [isReviewMode, deck?.study_mode],
  );
  const totalPhases = phases.length;
  const currentPhase = useMemo(() => phases[phaseIndex], [phases, phaseIndex]);
  const currentCard = cards[cardIndex];

  const totalSteps = totalPhases * limit || 1;
  const currentStep = phaseIndex * limit + cardIndex;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const restartSession = useCallback((advance = false) => {
    setSessionFinished(false);
    setPhaseIndex(0);
    setCardIndex(0);
    setSessionUpdates([]);
    setSessionSummary(null);
    sessionStartedAtRef.current = Date.now();
    batchPageRef.current = 1;
    isFetchingMoreRef.current = false;
    setSessionOffset(0);
  }, []);

  const prevDeckIdRef = useRef(null);
  useEffect(() => {
    if (!deck?.id || deck.id === prevDeckIdRef.current) return;
    prevDeckIdRef.current = deck.id;
    restartSession(false);
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

  // ----------------------
  // Batch update on session finish
  // ----------------------
  useEffect(() => {
    if (!sessionFinished || sessionUpdates.length === 0) return;

    const resolvedUserId = userIdRef.current;
    if (!resolvedUserId) {
      console.error("[runUpdates] No userId available, aborting.");
      return;
    }

    const updatesSnapshot = [...sessionUpdates];
    const deckSnapshot = deck;
    const sessionModeSnapshot = sessionMode;
    const batchSizeSnapshot = BATCH_SIZE;

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

        fetchedKeyRef.current = null;

        await Promise.all([
          dispatch(
            fetchCards({
              deck_id: deckSnapshot.id,
              user_id: resolvedUserId,
              study_mode: deckSnapshot.study_mode,
              sessionMode: sessionModeSnapshot,
              page: 0,
              pageSize: batchSizeSnapshot,
            }),
          ).unwrap(),
          dispatch(fetchDeckCounts({ user_id: resolvedUserId })).unwrap(),

          // 🌟 CHANGES HERE: Mutates the permanent database date locally inside state.
          // This forces our priority sorter selector to evaluate it instantly on return!
          dispatch(
            updateDeckLocally({
              id: deckSnapshot.id,
              last_reviewed: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
            }),
          ),

          dispatch(fetchDailyStreakStats({ user_id: resolvedUserId })).unwrap(),
          dispatch(fetchDailyActivity({ user_id: resolvedUserId })),
          dispatch(fetchUserProfile(resolvedUserId)),
        ]);

        batchPageRef.current = 1;
        isFetchingMoreRef.current = false;

        dispatch(logStudySession({ cardsReviewed, cardsLearned }));
        setSessionUpdates([]);
      } catch (err) {
        console.error("[runUpdates] Failed batch update:", err);
      }
    };

    runUpdates();
  }, [sessionFinished]);

  return {
    cards,
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
