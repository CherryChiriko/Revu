// src/components/DeckDetails/components/sections/CardGridSection.jsx
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
  refs,
  selectionMode = false,
  selectedCardIds,
  onToggleSelect,
  onLongPressCard,
}) {
  if (totalCount === 0 && !isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <div ref={refs?.addRef} className="flex flex-col w-full h-full">
            <AddCardTile onClick={onAddCard} activeTheme={activeTheme} />
          </div>
        </div>
        <p className={`text-xs ${activeTheme.text.muted} text-center`}>
          No cards yet — add your first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {isLoading && cards.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <EmptyTile key={i} activeTheme={activeTheme} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {/* Hide the add-card tile while selecting so it can't be mistaken for a card */}
          {!selectionMode && (
            <div ref={refs?.addRef} className="flex flex-col w-full h-full">
              <AddCardTile onClick={onAddCard} activeTheme={activeTheme} />
            </div>
          )}

          {cards.length === 0 ? (
            <p
              className={`col-span-full text-xs md:text-sm ${activeTheme.text.muted} py-6 md:py-8 text-center`}
            >
              No matching cards found.
            </p>
          ) : (
            cards.map((card, index) => (
              <div
                ref={index === 0 ? refs?.cardRef : null}
                key={card.card_id}
                className="flex flex-col w-full h-full"
              >
                <CardTile
                  card={card}
                  onClick={onCardClick}
                  activeTheme={activeTheme}
                  selectionMode={selectionMode}
                  isSelected={selectedCardIds?.has(card.card_id || card.id)}
                  onToggleSelect={onToggleSelect}
                  onLongPress={onLongPressCard}
                />
              </div>
            ))
          )}

          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <EmptyTile key={`skel-${i}`} activeTheme={activeTheme} />
            ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex flex-col items-center gap-1 pt-2">
          <p
            className={`text-[11px] md:text-xs tabular-nums ${activeTheme.text.muted}`}
          >
            Showing {loadedCount} of {totalCount} cards
          </p>
          <button
            onClick={onLoadMore}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} ${activeTheme.background.secondary} hover:${activeTheme.background.canvas}`}
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
