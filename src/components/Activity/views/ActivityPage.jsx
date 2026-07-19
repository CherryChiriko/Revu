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
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-3 md:px-8 py-6 md:py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-5 md:space-y-6">
        <Header
          title="Activity"
          description="Track your learning streaks, historical review data, and daily retention metrics."
          activeTheme={activeTheme}
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <SettingCard
            icon={faCalendarDays}
            title="Active Days"
            activeTheme={activeTheme}
          >
            <div className="flex flex-col items-center text-center">
              <h3
                className={`${activeTheme.text.primary} text-xl md:text-3xl font-black leading-none`}
              >
                {activeDays}
              </h3>
              <p
                className={`${activeTheme.text.secondary} text-[11px] md:text-sm mt-1 leading-tight`}
              >
                {consistencyScore}% consistency
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={faBookOpen}
            title="Cards Studied"
            activeTheme={activeTheme}
          >
            <div className="flex flex-col items-center text-center">
              <h3
                className={`${activeTheme.text.primary} text-xl md:text-3xl font-black leading-none`}
              >
                {totalActivity.cardsStudied}
              </h3>
              <p
                className={`${activeTheme.text.secondary} text-[11px] md:text-sm mt-1 leading-tight`}
              >
                {totalActivity.cardsLearned} learned ·{" "}
                {totalActivity.cardsReviewed} rev.
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={faGaugeHigh}
            title="Cards / Day"
            activeTheme={activeTheme}
          >
            <div className="flex flex-col items-center text-center">
              <h3
                className={`${activeTheme.text.primary} text-xl md:text-3xl font-black leading-none`}
              >
                {averageCardsPerActiveDay}
              </h3>
              <p
                className={`${activeTheme.text.secondary} text-[11px] md:text-sm mt-1 leading-tight`}
              >
                Avg. active day
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={faFire}
            title="Best Streak"
            activeTheme={activeTheme}
          >
            <div className="flex flex-col items-center text-center">
              <h3
                className={`${activeTheme.text.primary} text-xl md:text-3xl font-black leading-none`}
              >
                {bestStreak || 0}d
              </h3>
              <p
                className={`${activeTheme.text.secondary} text-[11px] md:text-sm mt-1 leading-tight`}
              >
                Now: {currentStreak || 0}d ({streakState})
              </p>
            </div>
          </SettingCard>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Work chart */}
          <SettingCard
            icon={faChartLine}
            title="Recent Work"
            activeTheme={activeTheme}
          >
            <div className="flex items-end gap-1.5 md:gap-2 h-40 md:h-56">
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
                    className="flex-1 h-full flex flex-col justify-end min-w-0"
                  >
                    <div
                      title={`${formatDate(day.date, settings.dateFormat)}: ${day.cardsStudied} cards`}
                      className={`h-full rounded-md md:rounded-lg flex flex-col justify-end overflow-hidden ${activeTheme.background.canvas}`}
                    >
                      <div
                        className={
                          inactive
                            ? activeTheme.background.track
                            : activeTheme.background.accent1
                        }
                        style={{ height: reviewedHeight }}
                      />
                      <div
                        className={
                          inactive
                            ? activeTheme.background.track
                            : activeTheme.background.accent2
                        }
                        style={{ height: learnedHeight }}
                      />
                    </div>
                    <span
                      className={`${activeTheme.text.secondary} text-[10px] md:text-[11px] mt-1.5 md:mt-2 text-center`}
                    >
                      {day.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className={`${activeTheme.text.secondary} flex gap-4 text-xs md:text-sm mt-3 md:mt-4`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-3 h-3 rounded-sm ${activeTheme.background.accent2}`}
                />
                Learned
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-3 h-3 rounded-sm ${activeTheme.background.accent1}`}
                />
                Reviewed
              </span>
            </div>
          </SettingCard>

          {/* Mastery */}
          <SettingCard
            title="Mastery Progress"
            icon={faBullseye}
            activeTheme={activeTheme}
          >
            <div className="space-y-4 md:space-y-5">
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
                        className={`${activeTheme.text.primary} text-2xl md:text-3xl font-black`}
                      >
                        {masteredPct}%
                      </h3>
                      <p
                        className={`${activeTheme.text.secondary} text-xs md:text-sm mt-1`}
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

              <p
                className={`${activeTheme.text.muted} text-[11px] md:text-xs text-center leading-relaxed`}
              >
                Mastery reflects how resilient a memory has become — moving from
                "familiar" to "solid" and finally "mastered".
              </p>
            </div>
          </SettingCard>

          {/* Character Accuracy */}
          <SettingCard
            title="Character Accuracy"
            icon={faLayerGroup}
            activeTheme={activeTheme}
          >
            <div
              className={`${activeTheme.background.canvas} rounded-xl p-4 md:p-5`}
            >
              <p className="text-2xl md:text-3xl font-black">
                {characterDeckCount > 0
                  ? "Not available"
                  : "No character decks"}
              </p>
              <p
                className={`${activeTheme.text.secondary} mt-2 md:mt-3 text-xs md:text-sm leading-relaxed`}
              >
                {characterDeckCount > 0
                  ? "Character decks exist, but per-character quiz accuracy is not stored yet. A useful next metric would track completed strokes, hint usage, and quiz retries per character."
                  : "Once you study character decks, this panel can show writing accuracy and tough characters."}
              </p>
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
}
