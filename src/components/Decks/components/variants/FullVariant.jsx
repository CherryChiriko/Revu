import React, { memo } from "react";
import { ProgressBar } from "../ProgressBar";
import { DeckActions } from "../DeckActions";
import { DeckBadges } from "../DeckBadges";
import { DeckMenu } from "../DeckMenu";

const FullVariant = ({ deck, activeTheme, logic }) => {
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
    // min-h-[320px] (or similar) ensures the card itself has a standard minimum size
    <div className="relative flex flex-col h-full min-h-[200px]">
      {/* Header Section: Title & Menu */}
      <div className="flex justify-between items-start">
        <div className="pr-20 min-w-0 flex-1">
          <h3
            className={`text-xl font-bold ${activeTheme.text.primary} truncate mb-1`}
            title={deck.name}
          >
            {deck.name}
          </h3>

          {/* Description: Fixed height area to keep tags aligned */}
          <div className="h-10 overflow-hidden">
            {deck.description ? (
              <p
                className={`${activeTheme.text.secondary} text-xs leading-relaxed line-clamp-2`}
              >
                {deck.description}
              </p>
            ) : (
              // Empty space holder if no description exists
              <div className="h-full" />
            )}
          </div>

          <ProgressBar
            counts={counts}
            activeTheme={activeTheme}
            isMastered={isMastered}
            cards_count={cards_count}
          />

          <div className="absolute top-0 right-0 flex items-center gap-2">
            <DeckBadges
              streak={streak}
              activeTheme={activeTheme}
              isMastered={isMastered}
              isStreakActive={isStreakActive}
            />
            <DeckMenu
              activeTheme={activeTheme}
              onEdit={() => console.log("Edit")}
              onDelete={() => handleAction("delete", deck)}
            />
          </div>
        </div>

        <div className="absolute top-0 right-0">
          <DeckMenu
            activeTheme={activeTheme}
            onEdit={() => console.log("Edit")}
            onDelete={() => handleAction("delete", deck)}
          />
        </div>
      </div>

      {/* Tags Section: Fixed height to prevent shifting if empty */}
      <div className="flex flex-wrap gap-2 mt-3 mb-2 items-center h-7 overflow-hidden">
        {deck.tags && deck.tags.length > 0 ? (
          deck.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className={`${activeTheme.background.app} ${activeTheme.accent} text-xs px-3 py-1 rounded-full`}
            >
              {tag}
            </span>
          ))
        ) : (
          <div className="h-full w-1" /> // Invisible spacer
        )}
      </div>

      <div className="flex-grow flex flex-col justify-end">
        <DeckActions
          activeTheme={activeTheme}
          showLearn={showLearn}
          showReview={showReview}
          handleAction={handleAction}
          large={true}
          due={counts.due}
        />
      </div>
    </div>
  );
};

export default memo(FullVariant);
