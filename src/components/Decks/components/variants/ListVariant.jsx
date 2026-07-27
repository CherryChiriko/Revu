import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../../../DeckMenu/components/DeckMenu";
import { STATUS_COLOR } from "../../../../utils/constants";

export default function ListVariant({ deck, activeTheme, logic }) {
  const {
    handleAction,
    streak,
    streakState,
    isStreakActive,
    counts,
    cards_count,
    showLearn,
    showReview,
  } = logic;

  const hasNew = counts.new > 0;
  const hasDue = counts.due > 0;

  const getStatusBackground = (status) => {
    const themeKey = STATUS_COLOR[status];
    return activeTheme?.background?.[themeKey] || activeTheme.background.canvas;
  };

  return (
    <div className="flex flex-col gap-2 min-w-0 w-full h-full justify-between">
      {/* Top: Title + Badges/Menu on one line */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <h3
            className={`text-sm font-semibold truncate leading-tight ${activeTheme.text.primary}`}
            title={deck.name}
          >
            {deck.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {hasDue && (
              <>
                <span
                  className={`text-[11px] font-bold ${activeTheme.text.warning}`}
                >
                  {counts.due} due
                </span>
                <span>·</span>
              </>
            )}
            {hasNew && (
              <span
                className={`text-[11px] font-bold ${activeTheme.text.accent1}`}
              >
                {counts.new} new
              </span>
            )}
          </div>
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
