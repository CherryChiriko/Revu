import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";
import {
  selectActiveDaysCount,
  selectSortedActivityDays,
  selectTotalActivity,
} from "../../../slices/activitySlice";
import {
  selectDecks,
  selectTotalDueCards,
  selectTotalFamiliarCards,
  selectTotalMasteredCards,
  selectTotalSolidCards,
} from "../../../slices/deckSlice";
import {
  selectGlobalMaxStreak,
  selectGlobalStreak,
  selectGlobalStreakState,
} from "../../../slices/streakSlice";
import { selectSettings } from "../../../slices/settingsSlice";
import { selectUserProfile } from "../../../slices/userSlice";

import { getTodayISO, addDaysToDateKey } from "../../../utils/dateHelper";

// import getLevelProgress from "../../../utils/xp";

// --- Pure Utility Functions (Kept out of component scope) ---
function getRecentDays(days, count = 14) {
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const today = getTodayISO();

  return Array.from({ length: count }, (_, index) => {
    const key = addDaysToDateKey(today, -(count - 1 - index));
    return (
      dayMap.get(key) || {
        date: key,
        cardsReviewed: 0,
        cardsLearned: 0,
        cardsStudied: 0,
        timeStudiedSeconds: 0,
        totalXP: 0,
      }
    );
  });
}

function formatDuration(seconds = 0) {
  if (!seconds) return "0m";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

// --- Custom Analytics Hook ---
export function useActivityAnalytics(timelineWindowSize = 14) {
  const activeTheme = useSelector(selectActiveTheme);
  const settings = useSelector(selectSettings);
  const activityDays = useSelector(selectSortedActivityDays);
  const totalActivity = useSelector(selectTotalActivity);
  const activeDays = useSelector(selectActiveDaysCount);
  const decks = useSelector(selectDecks);
  const dueCards = useSelector(selectTotalDueCards);
  const familiarCards = useSelector(selectTotalFamiliarCards);
  const solidCards = useSelector(selectTotalSolidCards);
  const masteredCards = useSelector(selectTotalMasteredCards);
  const currentStreak = useSelector(selectGlobalStreak);
  const bestStreak = useSelector(selectGlobalMaxStreak);
  const streakState = useSelector(selectGlobalStreakState);
  const profile = useSelector(selectUserProfile);

  // 1. Timeline Window Calculations
  const recentDays = useMemo(
    () => getRecentDays(activityDays, timelineWindowSize),
    [activityDays, timelineWindowSize],
  );

  const maxDailyCards = useMemo(() => {
    return Math.max(1, ...recentDays.map((day) => day.cardsStudied || 0));
  }, [recentDays]);

  const consistencyScore = useMemo(() => {
    const studied = recentDays.filter((day) => day.cardsStudied > 0).length;
    return Math.round((studied / recentDays.length) * 100);
  }, [recentDays]);

  // 2. Global Lifetime Metrics
  const averageCardsPerActiveDay = useMemo(() => {
    return activeDays ? Math.round(totalActivity.cardsStudied / activeDays) : 0;
  }, [totalActivity.cardsStudied, activeDays]);

  const totalXP = profile?.lifetime_xp ?? totalActivity.totalXP ?? 0;
  //   const levelProgress = useMemo(() => getLevelProgress(totalXP), [totalXP]);

  const totalCards = useMemo(() => {
    return decks.reduce(
      (sum, deck) => sum + (deck.cards_count || deck.cardsCount || 0),
      0,
    );
  }, [decks]);

  const masteredPercent = useMemo(() => {
    return totalCards ? Math.round((masteredCards / totalCards) * 100) : 0;
  }, [masteredCards, totalCards]);

  const characterDeckCount = useMemo(() => {
    return decks.filter((deck) => deck.study_mode === "C").length;
  }, [decks]);

  // 3. Language Breakdown Calculations
  const languageStats = useMemo(() => {
    const grouped = new Map();

    decks.forEach((deck) => {
      const language = deck.language || "Unsorted";
      const current = grouped.get(language) || {
        language,
        decks: 0,
        total: 0,
        mastered: 0,
        due: 0,
        newCards: 0,
        waiting: 0,
      };

      current.decks += 1;
      current.total +=
        deck.cards_count || deck.cardsCount || deck.active_cards_count || 0;
      current.mastered += deck.mastered || deck.mastered_count || 0;
      current.due += deck.due || deck.due_count || 0;
      current.newCards += deck.new || deck.new_count || 0;
      current.waiting += deck.waiting || deck.waiting_count || 0;
      grouped.set(language, current);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        progress: item.total
          ? Math.round((item.mastered / item.total) * 100)
          : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [decks]);

  return {
    activeTheme,
    settings,
    recentDays,
    maxDailyCards,
    consistencyScore,
    averageCardsPerActiveDay,
    totalXP,
    // levelProgress,
    languageStats,
    characterDeckCount,
    totalCards,
    masteredPercent,
    dueCards,
    familiarCards,
    solidCards,
    masteredCards,
    currentStreak,
    bestStreak,
    streakState,
    formatDuration, // Exported formatting references
  };
}
