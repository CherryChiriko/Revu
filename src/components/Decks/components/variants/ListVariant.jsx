import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../../../DeckMenu/components/DeckMenu";

export default function ListVariant({ deck, activeTheme, logic }) {
  const {
    handleAction,
    streak,
    streakState,
    isMastered,
    isStreakActive,
    counts,
    cards_count,
    showLearn,
    showReview,
  } = logic;

  return (
    <div className="flex flex-col gap-1.5 p-1 min-w-0 w-full">
      {/* Row 1: Title + Badges & Menu */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span
          className={`text-sm font-bold truncate min-w-0 ${activeTheme.text.primary}`}
          title={deck.name}
        >
          {deck.name}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <DeckBadges
            streak={streak}
            streakState={streakState}
            activeTheme={activeTheme}
            isMastered={isMastered}
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

      {/* Slim ProgressBar with zero surrounding margins */}
      <div className="min-w-0 w-full">
        <ProgressBar
          counts={counts}
          activeTheme={activeTheme}
          isMastered={isMastered}
          cards_count={cards_count}
          compact
        />
      </div>

      {/* Row 2: Micro Counts + Action Buttons on the same line */}
      <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
        <div
          className={`flex items-center gap-1 text-[11px] font-medium leading-none truncate ${activeTheme.text.muted}`}
        >
          {counts.new > 0 && (
            <span className={activeTheme.text.accent1}>{counts.new} new</span>
          )}
          {counts.due > 0 && (
            <>
              {counts.new > 0 && <span>·</span>}
              <span className={activeTheme.text.warning}>{counts.due} due</span>
            </>
          )}
          {(counts.new > 0 || counts.due > 0) && <span>·</span>}
          <span>{cards_count} total</span>
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
