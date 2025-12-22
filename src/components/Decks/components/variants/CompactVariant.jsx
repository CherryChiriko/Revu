import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";

export default function CompactVariant({ deck, activeTheme, logic }) {
  const {
    showLearn,
    showReview,
    handleAction,
    isMastered,
    counts,
    cards_count,
    streak,
    isStreakActive,
  } = logic;

  return (
    <>
      <div className="flex flex-row justify-between mb-2">
        <span className={`text-sm font-bold ${activeTheme.text.primary}`}>
          {deck.name}
        </span>

        <DeckBadges
          streak={streak}
          activeTheme={activeTheme}
          isMastered={isMastered}
          isStreakActive={isStreakActive}
        />
      </div>

      <ProgressBar
        counts={counts}
        activeTheme={activeTheme}
        isMastered={isMastered}
        cards_count={cards_count}
      />

      <div
        className={`flex justify-between items-center ${activeTheme.text.secondary} text-xs mt-3`}
      >
        <span>
          {deck.language} • {deck.cards_count} cards
        </span>

        <DeckActions
          activeTheme={activeTheme}
          showLearn={showLearn}
          showReview={showReview}
          handleAction={handleAction}
          large={false}
        />
      </div>
    </>
  );
}
