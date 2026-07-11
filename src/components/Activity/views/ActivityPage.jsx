import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faBullseye,
  faCalendarDays,
  faChartLine,
  faClock,
  faFire,
  faGaugeHigh,
  faLayerGroup,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
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
import { MasteryBreakdown } from "../../Mastery/MasteryBar";
import { addDaysToDateKey, getTodayISO } from "../../../utils/dateHelper";
import { getLevelProgress } from "../../../utils/xp";

import { StatTile } from "../components/StatTile";
import { ActivitySection as Section } from "../components/ActivitySection";

import { useActivityAnalytics } from "../hooks/useActivityAnalytics";

import Header from "../../General/ui/Header";
import { SettingCard } from "../../General/ui/SettingCard";

function formatDuration(seconds = 0) {
  if (!seconds) return "0m";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatDate(value, format) {
  const [year, month, day] = value.split("-");
  return format === "mm/dd/yyyy"
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
}

export default function ActivityPage() {
  const settings = useSelector(selectSettings);
  const activityDays = useSelector(selectSortedActivityDays);
  const totalActivity = useSelector(selectTotalActivity);
  const activeDays = useSelector(selectActiveDaysCount);
  const decks = useSelector(selectDecks);
  const dueCards = useSelector(selectTotalDueCards);
  const familiarCards = useSelector(selectTotalFamiliarCards);
  const solidCards = useSelector(selectTotalSolidCards);
  const masteredCards = useSelector(selectTotalMasteredCards);
  const streakState = useSelector(selectGlobalStreakState);
  const profile = useSelector(selectUserProfile);

  const {
    activeTheme,
    consistencyScore,
    averageCardsPerActiveDay,
    recentDays,
    languageStats,
    masteredPercent,
    currentStreak,
    bestStreak,
    formatDuration,
  } = useActivityAnalytics(14);

  const maxDailyCards = Math.max(
    1,
    ...recentDays.map((day) => day.cardsStudied || 0),
  );

  const characterDeckCount = decks.filter(
    (deck) => deck.study_mode === "C",
  ).length;

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8  shadow-md`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <Header
          title="Activity"
          description="Track your learning streaks, historical review data, and daily
                retention metrics."
          activeTheme={activeTheme}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 z-10">
          <SettingCard
            icon={faCalendarDays}
            title="Active Days"
            activeTheme={activeTheme}
          >
            <div className="space-y-6 flex align-middle justify-center flex-col text-center">
              <h3 className={`${activeTheme.text.primary} text-3xl font-black`}>
                {activeDays}
              </h3>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                {consistencyScore}% consistency across the last 14 days
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={faBookOpen}
            title="Cards Studied"
            activeTheme={activeTheme}
          >
            <div className="space-y-6 flex align-middle justify-center flex-col text-center">
              <h3 className={`${activeTheme.text.primary} text-3xl font-black`}>
                {totalActivity.cardsStudied}
              </h3>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                {totalActivity.cardsLearned} learned,{" "}
                {totalActivity.cardsReviewed} reviewed
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={faFire}
            title="Best Streak"
            activeTheme={activeTheme}
          >
            <div className="space-y-6 flex align-middle justify-center flex-col text-center">
              <h3 className={`${activeTheme.text.primary} text-3xl font-black`}>
                {bestStreak || 0}d
              </h3>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                Current streak: {currentStreak || 0}d (
                {streakState || "inactive"})
              </p>
            </div>
          </SettingCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section
            title="Recent Work"
            icon={faChartLine}
            activeTheme={activeTheme}
          >
            <div className="flex items-end gap-2 h-56">
              {recentDays.map((day) => {
                const learnedHeight = `${Math.max(
                  4,
                  (day.cardsLearned / maxDailyCards) * 100,
                )}%`;
                const reviewedHeight = `${Math.max(
                  4,
                  (day.cardsReviewed / maxDailyCards) * 100,
                )}%`;
                const inactive = day.cardsStudied === 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 h-full flex flex-col justify-end"
                  >
                    <div
                      title={`${formatDate(day.date, settings.dateFormat)}: ${
                        day.cardsStudied
                      } cards`}
                      className={`h-full rounded-lg flex flex-col justify-end overflow-hidden ${activeTheme.background.canvas}`}
                    >
                      <div
                        className={inactive ? "bg-white/10" : "bg-sky-500"}
                        style={{ height: reviewedHeight }}
                      />
                      <div
                        className={inactive ? "bg-white/10" : "bg-purple-500"}
                        style={{ height: learnedHeight }}
                      />
                    </div>
                    <span
                      className={`${activeTheme.text.secondary} text-[11px] mt-2 text-center`}
                    >
                      {day.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              className={`${activeTheme.text.secondary} flex gap-4 text-sm mt-4`}
            >
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-purple-500 mr-1" />
                Learned
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-sky-500 mr-1" />
                Reviewed
              </span>
            </div>
          </Section>

          <Section
            title="SRS Health"
            icon={faBullseye}
            activeTheme={activeTheme}
          >
            <div className="space-y-5">
              <MasteryBreakdown
                familiar={familiarCards}
                solid={solidCards}
                mastered={masteredCards}
                activeTheme={activeTheme}
              />
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`${activeTheme.background.canvas} rounded-xl p-4`}
                >
                  <FontAwesomeIcon icon={faGaugeHigh} className="mb-3" />
                  <p className={`${activeTheme.text.secondary} text-sm`}>
                    Avg cards per active day
                  </p>
                  <p className="text-2xl font-black">
                    {averageCardsPerActiveDay}
                  </p>
                </div>
                <div
                  className={`${activeTheme.background.canvas} rounded-xl p-4`}
                >
                  <FontAwesomeIcon icon={faStar} className="mb-3" />
                  <p className={`${activeTheme.text.secondary} text-sm`}>
                    Solid + mastered
                  </p>
                  <p className="text-2xl font-black">
                    {solidCards + masteredCards}
                  </p>
                </div>
              </div>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                Queue status tells you what is available today; completeness
                tells you how resilient those memories are becoming.
              </p>
            </div>
          </Section>

          <Section
            title="Character Accuracy"
            icon={faLayerGroup}
            activeTheme={activeTheme}
          >
            <div className={`${activeTheme.background.canvas} rounded-xl p-5`}>
              <p className="text-3xl font-black">
                {characterDeckCount > 0
                  ? "Not available"
                  : "No character decks"}
              </p>
              <p className={`${activeTheme.text.secondary} mt-3 text-sm`}>
                {characterDeckCount > 0
                  ? "Character decks exist, but per-character quiz accuracy is not stored yet. A useful next metric would track completed strokes, hint usage, and quiz retries per character."
                  : "Once you study character decks, this panel can show writing accuracy and tough characters."}
              </p>
            </div>
          </Section>
        </div>

        {/* <Section
          title="Language Progress"
          icon={faLanguage}
          activeTheme={activeTheme}
        >
          {languageStats.length === 0 ? (
            <div className={`${activeTheme.background.canvas} rounded-xl p-6 text-center ${activeTheme.text.secondary}`}>
              Import or create a deck to start building language progress.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languageStats.map((item) => (
                <div
                  key={item.language}
                  className={`${activeTheme.background.canvas} rounded-xl p-4`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{item.language}</h3>
                      <p className={`${activeTheme.text.secondary} text-sm`}>
                        {item.decks} deck{item.decks === 1 ? "" : "s"} - {item.total} cards
                      </p>
                    </div>
                    <span className="text-2xl font-black">{item.progress}%</span>
                  </div>
                  <div className={`${activeTheme.background.track} rounded-full h-3 overflow-hidden mt-4`}>
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-purple-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className={`${activeTheme.text.secondary} grid grid-cols-3 gap-2 text-sm mt-4`}>
                    <span>{item.mastered} mastered</span>
                    <span>{item.due} due</span>
                    <span>{item.newCards} new</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section> */}
      </div>
    </div>
  );
}
