import React from "react";
import DeckCardItem from "./DeckCardItem";

export default function DeckCard({
  decks,
  activeTheme,
  variant,
  gridClasses,
  toast,
  highlightedId,
  firstCardRef,
}) {
  return (
    <div
      className={`
        ${gridClasses}
        /* Mobile Only: Horizontal Snap Carousel with extra padding for shadows */
        max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory 
        max-md:gap-3 max-md:px-4 max-md:pt-2 max-md:pb-6 max-md:-mx-4 max-md:scrollbar-hide
      `}
    >
      {decks.map((deck, index) => (
        <div
          key={deck.id || deck.deck_id}
          ref={index === 0 ? firstCardRef : null}
          className="max-md:snap-align-start max-md:shrink-0 max-md:w-[85vw] max-md:max-w-[320px] p-1"
        >
          <DeckCardItem
            deck={deck}
            activeTheme={activeTheme}
            variant={variant}
            toast={toast}
            highlightedId={highlightedId}
          />
        </div>
      ))}
    </div>
  );
}
