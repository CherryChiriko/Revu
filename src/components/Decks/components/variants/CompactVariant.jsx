import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../DeckMenu";

export default function CompactVariant({ deck, activeTheme, logic }) {
  const {
    handleAction,
    streak,
    isMastered,
    isStreakActive,
    counts,
    cards_count,
    showLearn,
    showReview,
  } = logic;

  return (
    <div className="relative">
      {" "}
      {/* Added relative for absolute positioning if needed */}
      <div className="flex flex-row justify-between items-start mb-2 gap-2">
        <div className="flex flex-col flex-grow min-w-0">
          <span
            className={`text-sm font-bold truncate ${activeTheme.text.primary}`}
          >
            {deck.name}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <DeckBadges
              streak={streak}
              activeTheme={activeTheme}
              isMastered={isMastered}
              isStreakActive={isStreakActive}
            />
          </div>
        </div>

        <DeckMenu
          activeTheme={activeTheme}
          onEdit={() => console.log("Edit")}
          onDelete={() => handleAction("delete", deck)}
        />
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
        />
      </div>
    </div>
  );
}
