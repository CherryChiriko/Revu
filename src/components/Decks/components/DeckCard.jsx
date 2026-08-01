import React from "react";
import DeckCardItem from "./DeckCardItem";

export default function DeckCard({
  decks,
  activeTheme,
  variant,
  toast,
  highlightedId,
  firstCardRef,
}) {
  // Desktop grid maps directly from the view mode
  const desktopGrid =
    {
      large: "md:grid-cols-2 lg:grid-cols-3 md:gap-6",
      compact: "md:grid-cols-4 md:gap-3",
      list: "md:grid-cols-3 md:gap-4",
    }[variant] || "md:grid-cols-4 md:gap-3";

  return (
    <div
      className={`
        grid grid-rows-2 grid-flow-col auto-cols-[85vw] gap-3
        px-4 pt-2 pb-6 -mx-4
        overflow-x-auto snap-x snap-mandatory scrollbar-hide
        
        md:grid-flow-row md:auto-cols-auto md:overflow-visible md:snap-none
        md:px-0 md:mx-0
        ${desktopGrid}
      `}
    >
      {decks.map((deck, index) => (
        <div
          key={deck.id || deck.deck_id}
          ref={index === 0 ? firstCardRef : null}
          className="snap-start shrink-0"
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
