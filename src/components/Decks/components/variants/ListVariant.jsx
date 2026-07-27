// ListVariant.jsx
import React from "react";
import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../../../DeckMenu/components/DeckMenu";
import { STATUS_COLOR } from "../../../../utils/constants";

// Map status keys to display labels
const STATUS_CONFIG = [
  { key: "due", label: "due" },
  { key: "waiting", label: "waiting" },
  { key: "new", label: "new" },
];

/**
 * SRP: Helper component specifically responsible for rendering status badges/counts
 */
function DeckCountsSummary({ counts, activeTheme }) {
  const activeStatuses = STATUS_CONFIG.filter(
    (config) => counts[config.key] > 0,
  );

  if (activeStatuses.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
      {activeStatuses.map((config, index) => {
        const count = counts[config.key];
        const themeKey = STATUS_COLOR[config.key];

        const isNew = config.key === "new";

        // Apply normal weight for "new", bold for due/waiting
        const fontWeightClass = isNew ? "font-normal" : "font-bold";

        const textColorClass = isNew
          ? activeTheme?.text?.muted || "text-slate-400"
          : activeTheme?.text?.[themeKey] || "text-indigo-400";

        const isLast = index === activeStatuses.length - 1;

        return (
          <React.Fragment key={config.key}>
            <span className={`${textColorClass} ${fontWeightClass}`}>
              {count} {config.label}
            </span>
            {!isLast && (
              <span
                className={`font-normal ${activeTheme?.text?.muted || "text-slate-500"}`}
              >
                ·
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ListVariant({ deck, activeTheme, logic }) {
  const {
    handleAction,
    streak,
    streakState,
    isStreakActive,
    counts = {},
    cards_count,
    showLearn,
    showReview,
  } = logic;

  // Safe theme fallbacks
  const titleClass = activeTheme?.text?.primary || "text-white";

  return (
    <div className="flex flex-col gap-2 min-w-0 w-full h-full justify-between">
      {/* Top: Title + Status Summary | Badges + Menu */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <h3
            className={`text-sm font-semibold truncate leading-tight ${titleClass}`}
            title={deck?.name}
          >
            {deck?.name}
          </h3>

          <DeckCountsSummary counts={counts} activeTheme={activeTheme} />
        </div>

        <div className="flex items-center gap-1 shrink-0 -mr-1">
          <DeckBadges
            streak={streak}
            streakState={streakState}
            activeTheme={activeTheme}
            isStreakActive={isStreakActive}
            compact
          />
          <DeckMenu
            activeTheme={activeTheme}
            onEdit={(e) => handleAction(e, "edit", deck)}
            onDelete={(e) => handleAction(e, "delete", deck)}
            compact
          />
        </div>
      </div>

      {/* Bottom: Progress bar + Actions */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-1 min-w-0">
          <ProgressBar
            counts={counts}
            activeTheme={activeTheme}
            cards_count={cards_count}
            compact
          />
        </div>
        <div className="shrink-0">
          <DeckActions
            activeTheme={activeTheme}
            showLearn={showLearn}
            showReview={showReview}
            handleAction={handleAction}
            compact
            newCount={counts.new}
            due={counts.due}
          />
        </div>
      </div>
    </div>
  );
}
