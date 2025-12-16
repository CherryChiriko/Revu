import React, { memo } from "react";
import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
// import { getStreak } from "../../../../slices/deckSlice";

const FullVariant = ({ deck, activeTheme, logic }) => {
  const {
    showLearn,
    showReview,
    handleAction,
    isMastered,
    counts,
    cards_count,
    streak,
    maxStreak,
    isStreakActive,
  } = logic;

  // const [streak, isStreakActive] = getStreak(deck);

  return (
    <>
      {/* Deck title & streak */}
      <h3 className={`text-2xl font-bold ${activeTheme.text.primary} mb-2`}>
        {deck.name}
      </h3>

      {deck.description && (
        <p className={`${activeTheme.text.secondary} text-sm mb-3`}>
          {deck.description}
        </p>
      )}

      {/* Tags & streak */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(deck.tags || []).map((tag, i) => (
          <span
            key={i}
            className={`${activeTheme.background.app} ${activeTheme.accent} text-xs px-3 py-1 rounded-full`}
          >
            {tag}
          </span>
        ))}

        <DeckBadges
          streak={streak}
          activeTheme={activeTheme}
          isMastered={isMastered}
          isStreakActive={isStreakActive}
        />
      </div>

      {/* Progress bar */}
      <ProgressBar
        counts={counts}
        activeTheme={activeTheme}
        isMastered={isMastered}
        cards_count={cards_count}
      />

      {/* Deck info */}
      <div
        className={`flex justify-between items-center ${activeTheme.text.secondary} text-sm mt-3`}
      >
        <span>
          {deck.cards_count} cards • {deck.language}
        </span>
        {/* <span>Last studied: {formatDate(deck.lastStudied)}</span> */}
      </div>

      {/* Action buttons */}
      <DeckActions
        activeTheme={activeTheme}
        showLearn={showLearn}
        showReview={showReview}
        handleAction={handleAction}
        large={true}
        due={counts.due}
      />
    </>
  );
};

export default memo(FullVariant);
