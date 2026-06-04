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
  faLanguage,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { selectActiveTheme } from "../../slices/themeSlice";
import {
  selectActiveDaysCount,
  selectSortedActivityDays,
  selectTotalActivity,
} from "../../slices/activitySlice";
import {
  selectDecks,
  selectTotalDueCards,
  selectTotalMasteredCards,
} from "../../slices/deckSlice";
import {
  selectGlobalMaxStreak,
  selectGlobalStreak,
} from "../../slices/streakSlice";
import { selectSettings } from "../../slices/settingsSlice";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentDays(days, count = 14) {
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getTime() - (count - 1 - index) * DAY_MS);
    const key = dateKey(date);
    return (
      dayMap.get(key) || {
        date: key,
        cardsReviewed: 0,
        cardsLearned: 0,
        cardsStudied: 0,
        timeStudiedSeconds: 0,
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

function formatDate(value, format) {
  const [year, month, day] = value.split("-");
  return format === "mm/dd/yyyy"
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
}

const StatTile = ({ icon, label, value, note, activeTheme }) => (
  <div
    className={`${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl p-5 shadow-lg`}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`${activeTheme.text.secondary} text-sm`}>{label}</p>
        <p className="text-3xl font-black mt-1">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      </div>
    </div>
    {note && <p className={`${activeTheme.text.secondary} text-sm mt-4`}>{note}</p>}
  </div>
);

const Section = ({ title, icon, children, activeTheme }) => (
  <section
    className={`${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl p-5 shadow-lg`}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {children}
  </section>
);

export default function ActivityPage() {
  const activeTheme = useSelector(selectActiveTheme);
  const settings = useSelector(selectSettings);
  const activityDays = useSelector(selectSortedActivityDays);
  const totalActivity = useSelector(selectTotalActivity);
  const activeDays = useSelector(selectActiveDaysCount);
  const decks = useSelector(selectDecks);
  const dueCards = useSelector(selectTotalDueCards);
  const masteredCards = useSelector(selectTotalMasteredCards);
  const currentStreak = useSelector(selectGlobalStreak);
  const bestStreak = useSelector(selectGlobalMaxStreak);

  const recentDays = useMemo(() => getRecentDays(activityDays, 14), [activityDays]);
  const maxDailyCards = Math.max(
    1,
    ...recentDays.map((day) => day.cardsStudied || 0),
  );

  const consistencyScore = useMemo(() => {
    const studied = recentDays.filter((day) => day.cardsStudied > 0).length;
    return Math.round((studied / recentDays.length) * 100);
  }, [recentDays]);
  const averageCardsPerActiveDay = activeDays
    ? Math.round(totalActivity.cardsStudied / activeDays)
    : 0;

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
      current.total += deck.cards_count || deck.cardsCount || deck.active_cards_count || 0;
      current.mastered += deck.mastered || deck.mastered_count || 0;
      current.due += deck.due || deck.due_count || 0;
      current.newCards += deck.new || deck.new_count || 0;
      current.waiting += deck.waiting || deck.waiting_count || 0;
      grouped.set(language, current);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        progress: item.total ? Math.round((item.mastered / item.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [decks]);

  const characterDeckCount = decks.filter((deck) => deck.study_mode === "C").length;
  const totalCards = decks.reduce(
    (sum, deck) => sum + (deck.cards_count || deck.cardsCount || 0),
    0,
  );
  const masteredPercent = totalCards
    ? Math.round((masteredCards / totalCards) * 100)
    : 0;

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <header
          className={`${activeTheme.background.secondary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <p className={`${activeTheme.text.accent1} font-semibold mb-2`}>
                Study analytics
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold">Activity</h1>
              <p className={`${activeTheme.text.secondary} mt-2 max-w-2xl`}>
                A consistency-first view of your SRS work: what you reviewed,
                what you learned, and where your decks are building momentum.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 min-w-[260px]">
              <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
                <p className={`${activeTheme.text.secondary} text-xs`}>Today</p>
                <p className="font-black">
                  {recentDays[recentDays.length - 1]?.cardsStudied || 0}
                </p>
              </div>
              <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
                <p className={`${activeTheme.text.secondary} text-xs`}>14 days</p>
                <p className="font-black">{consistencyScore}%</p>
              </div>
              <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
                <p className={`${activeTheme.text.secondary} text-xs`}>Due</p>
                <p className="font-black">{dueCards}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            icon={faCalendarDays}
            label="Active Days"
            value={activeDays}
            note={`${consistencyScore}% consistency across the last 14 days`}
            activeTheme={activeTheme}
          />
          <StatTile
            icon={faBookOpen}
            label="Cards Studied"
            value={totalActivity.cardsStudied}
            note={`${totalActivity.cardsLearned} learned, ${totalActivity.cardsReviewed} reviewed`}
            activeTheme={activeTheme}
          />
          <StatTile
            icon={faClock}
            label="Time Studied"
            value={formatDuration(totalActivity.timeStudiedSeconds)}
            note="Tracked from completed study sessions"
            activeTheme={activeTheme}
          />
          <StatTile
            icon={faFire}
            label="Best Streak"
            value={`${bestStreak || 0}d`}
            note={`Current streak: ${currentStreak || 0}d`}
            activeTheme={activeTheme}
          />
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
                  <div key={day.date} className="flex-1 h-full flex flex-col justify-end">
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
                    <span className={`${activeTheme.text.secondary} text-[11px] mt-2 text-center`}>
                      {day.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={`${activeTheme.text.secondary} flex gap-4 text-sm mt-4`}>
              <span><span className="inline-block w-3 h-3 rounded-sm bg-purple-500 mr-1" />Learned</span>
              <span><span className="inline-block w-3 h-3 rounded-sm bg-sky-500 mr-1" />Reviewed</span>
            </div>
          </Section>

          <Section
            title="SRS Health"
            icon={faBullseye}
            activeTheme={activeTheme}
          >
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={activeTheme.text.secondary}>Mastered cards</span>
                  <span className="font-semibold">{masteredPercent}%</span>
                </div>
                <div className={`${activeTheme.background.track} rounded-full h-3 overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-purple-500"
                    style={{ width: `${masteredPercent}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`${activeTheme.background.canvas} rounded-xl p-4`}>
                  <FontAwesomeIcon icon={faGaugeHigh} className="mb-3" />
                  <p className={`${activeTheme.text.secondary} text-sm`}>Avg cards per active day</p>
                  <p className="text-2xl font-black">
                    {averageCardsPerActiveDay}
                  </p>
                </div>
                <div className={`${activeTheme.background.canvas} rounded-xl p-4`}>
                  <FontAwesomeIcon icon={faStar} className="mb-3" />
                  <p className={`${activeTheme.text.secondary} text-sm`}>Mastered total</p>
                  <p className="text-2xl font-black">{masteredCards}</p>
                </div>
              </div>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                This view rewards steady days and manageable due queues. High
                accuracy is useful, but consistency is what keeps memory alive.
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
                {characterDeckCount > 0 ? "Ready" : "No character decks"}
              </p>
              <p className={`${activeTheme.text.secondary} mt-3 text-sm`}>
                {characterDeckCount > 0
                  ? "Character decks exist, but per-character quiz accuracy is not stored yet. A useful next metric would track completed strokes, hint usage, and quiz retries per character."
                  : "Once you study character decks, this panel can show writing accuracy and tough characters."}
              </p>
            </div>
          </Section>
        </div>

        <Section
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
        </Section>
      </div>
    </div>
  );
}
