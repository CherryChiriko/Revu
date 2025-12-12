import React from "react";
import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { useSelector } from "react-redux";
import { selectDeckCountsById } from "../../../../slices/deckSlice";

export default function CompactVariant({ deck, activeTheme, logic }) {
  const { streak, showLearn, showReview, handleAction, isMastered } = logic;
  const counts = useSelector(selectDeckCountsById(deck.id));

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
        />
      </div>

      <ProgressBar
        counts={counts}
        activeTheme={activeTheme}
        isMastered={isMastered}
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
          deck={deck}
          large={false}
        />
      </div>
    </>
  );
}
