import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { EmptyTile } from "../tiles/EmptyTile";
import { CardTile } from "../tiles/CardTile";
import { AddCardTile } from "../tiles/AddCardTile";

export default function CardGridSection({
  cards,
  isLoading,
  hasMore,
  loadedCount,
  totalCount,
  onLoadMore,
  onCardClick,
  onAddCard,
  activeTheme,
}) {
  // Empty deck: show only the add tile with a hint
  if (totalCount === 0 && !isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <AddCardTile onClick={onAddCard} activeTheme={activeTheme} />
        </div>
        <p className={`text-xs ${activeTheme.text.muted} text-center`}>
          No cards yet — add your first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && cards.length === 0 ? (
        // Initial load: show skeletons (add tile not shown during first load)
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <EmptyTile key={i} activeTheme={activeTheme} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {/* Add tile always first */}
          <AddCardTile onClick={onAddCard} activeTheme={activeTheme} />

          {cards.length === 0 ? (
            // Filter active but no matches
            <p
              className={`col-span-full text-sm ${activeTheme.text.muted} py-8 text-center`}
            >
              No matching cards found or loaded yet.
            </p>
          ) : (
            cards.map((card) => (
              <CardTile
                key={card.card_id}
                card={card}
                onClick={onCardClick}
                activeTheme={activeTheme}
              />
            ))
          )}

          {/* Trailing skeletons while loading more pages */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <EmptyTile key={`skel-${i}`} activeTheme={activeTheme} />
            ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex flex-col items-center gap-1 pt-2">
          <p className={`text-xs tabular-nums ${activeTheme.text.muted}`}>
            Showing {loadedCount} of {totalCount} cards
          </p>
          <button
            onClick={onLoadMore}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} ${activeTheme.background.secondary} hover:${activeTheme.background.canvas}`}
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
