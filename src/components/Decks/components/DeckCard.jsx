import React from "react";
import DeckCardItem from "./DeckCardItem";

export default function DeckCard({
  decks,
  activeTheme,
  variant,
  gridClasses,
  toast,
  highlightedId,
}) {
  return (
    <div className={gridClasses}>
      {decks.map((deck) => (
        <DeckCardItem
          key={deck.deck_id}
          deck={deck}
          activeTheme={activeTheme}
          variant={variant}
          toast={toast}
          highlightedId={highlightedId}
        />
      ))}
    </div>
  );
}
