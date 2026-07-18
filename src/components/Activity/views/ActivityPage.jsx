import React from "react";
import { useSelector } from "react-redux";
import {
  faBookOpen,
  faBullseye,
  faCalendarDays,
  faChartLine,
  faFire,
  faGaugeHigh,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  selectActiveDaysCount,
  selectTotalActivity,
} from "../../../slices/activitySlice";
import {
  selectDecks,
  selectTotalFamiliarCards,
  selectTotalMasteredCards,
  selectTotalSolidCards,
} from "../../../slices/deckSlice";
import { selectGlobalStreakState } from "../../../slices/streakSlice";
import { selectSettings } from "../../../slices/settingsSlice";

import { useActivityAnalytics } from "../hooks/useActivityAnalytics";

import Header from "../../General/ui/Header";
import { SettingCard } from "../../General/ui/SettingCard";
import { SegmentedBar } from "../../General/ui/SegmentedBar";

import { formatDate } from "../../../utils/dateHelper";

export default function ActivityPage() {
  const settings = useSelector(selectSettings);
  const totalActivity = useSelector(selectTotalActivity);
  const activeDays = useSelector(selectActiveDaysCount);
  const decks = useSelector(selectDecks);
  const familiarCards = useSelector(selectTotalFamiliarCards);
  const solidCards = useSelector(selectTotalSolidCards);
  const masteredCards = useSelector(selectTotalMasteredCards);
  const streakState = useSelector(selectGlobalStreakState);

  const {
    activeTheme,
    consistencyScore,
    averageCardsPerActiveDay,
    recentDays,
    currentStreak,
    bestStreak,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 z-10">
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
            icon={faGaugeHigh}
            title="Cards per Day"
            activeTheme={activeTheme}
          >
            <div className="space-y-6 flex align-middle justify-center flex-col text-center">
              <h3 className={`${activeTheme.text.primary} text-3xl font-black`}>
                {averageCardsPerActiveDay}
              </h3>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                On average on an active day
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
          <SettingCard
            icon={faChartLine}
            title="Recent Work"
            activeTheme={activeTheme}
          >
            <div className="flex items-end gap-2 h-56">
              {recentDays.map((day) => {
                const learnedHeight = `${Math.max(
                  0,
                  (day.cardsLearned / maxDailyCards) * 100,
                )}%`;
                const reviewedHeight = `${Math.max(
                  0,
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
                        className={
                          inactive
                            ? "bg-white/10"
                            : activeTheme.background.accent1
                        }
                        style={{ height: reviewedHeight }}
                      />
                      <div
                        className={
                          inactive
                            ? "bg-white/10"
                            : activeTheme.background.accent2
                        }
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
                <span
                  className={`inline-block w-3 h-3 rounded-sm ${activeTheme.background.accent2} mr-1`}
                />
                Learned
              </span>
              <span>
                <span
                  className={`inline-block w-3 h-3 rounded-sm ${activeTheme.background.accent1} mr-1`}
                />
                Reviewed
              </span>
            </div>
          </SettingCard>

          <SettingCard
            title="Mastery Progress"
            icon={faBullseye}
            activeTheme={activeTheme}
          >
            <div className="space-y-5">
              {(() => {
                const total = familiarCards + solidCards + masteredCards;
                const masteredPct = total
                  ? Math.round((masteredCards / total) * 100)
                  : 0;

                const segments = [
                  {
                    key: "familiar",
                    label: "familiar",
                    count: familiarCards,
                    colorClass: activeTheme.background.accent1,
                  },
                  {
                    key: "solid",
                    label: "solid",
                    count: solidCards,
                    colorClass: activeTheme.background.accent2,
                  },
                  {
                    key: "mastered",
                    label: "mastered",
                    count: masteredCards,
                    colorClass: activeTheme.background.accent3,
                  },
                ];

                return (
                  <>
                    <div className="text-center">
                      <h3
                        className={`${activeTheme.text.primary} text-3xl font-black`}
                      >
                        {masteredPct}%
                      </h3>
                      <p
                        className={`${activeTheme.text.secondary} text-sm mt-1`}
                      >
                        {masteredCards} of {total} studied cards mastered
                      </p>
                    </div>

                    <SegmentedBar
                      segments={segments}
                      total={total}
                      activeTheme={activeTheme}
                      showLegend={true}
                    />
                  </>
                );
              })()}

              <p className={`${activeTheme.text.muted} text-xs text-center`}>
                Mastery reflects how resilient a memory has become — moving from
                "familiar" to "solid" and finally "mastered".
              </p>
            </div>
          </SettingCard>

          <SettingCard
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
          </SettingCard>
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
