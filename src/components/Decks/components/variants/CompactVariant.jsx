import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../DeckMenu";

export default function CompactVariant({ deck, activeTheme, logic }) {
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
    <div className="relative">
      {/* Top Row: Name on the left, Badges & Menu on the right */}
      <div className="flex flex-row justify-between items-center mb-2 gap-4">
        <div className="min-w-0 flex-grow">
          <span
            className={`text-sm font-bold block truncate ${activeTheme.text.primary}`}
            title={deck.name}
          >
            {deck.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DeckBadges
            streak={streak}
            streakState={streakState}
            activeTheme={activeTheme}
            isMastered={isMastered}
            isStreakActive={isStreakActive}
          />
          <DeckMenu
            activeTheme={activeTheme}
            onEdit={(e) => handleAction(e, "edit", deck)}
            onDelete={(e) => handleAction(e, "delete", deck)}
          />
        </div>
      </div>

      <ProgressBar
        counts={counts}
        activeTheme={activeTheme}
        isMastered={isMastered}
        cards_count={cards_count}
      />

      <div className="flex justify-between items-center mt-3">
        <DeckActions
          activeTheme={activeTheme}
          showLearn={showLearn}
          showReview={showReview}
          handleAction={handleAction}
          large={false}
          newCount={counts.new}
          due={counts.due}
        />
      </div>
    </div>
  );
}
