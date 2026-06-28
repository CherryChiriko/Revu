import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { EmptyTile } from "../CardTile"; // Standard path to your skeleton loaders
import { STATUS_TILE } from "../SharedStyles";

export default function CardGridSection({
  cards,
  isLoading,
  hasMore,
  loadedCount,
  totalCount,
  onLoadMore,
  onCardClick,
  activeTheme,
}) {
  if (totalCount === 0) {
    return (
      <p className={`text-sm ${activeTheme.text.muted} py-12 text-center`}>
        No cards in this deck yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && cards.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <EmptyTile key={i} activeTheme={activeTheme} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <p className={`text-sm ${activeTheme.text.muted} py-12 text-center`}>
          No matching cards found or loaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {cards.map((card) => {
            const status = card.suspended ? "suspended" : card.status;
            const tile = STATUS_TILE[status] ?? STATUS_TILE.new;
            return (
              <button
                key={card.card_id}
                onClick={() => onCardClick(card)}
                className={`group flex flex-col justify-between gap-2 min-h-[72px] rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
              >
                <span
                  className={`line-clamp-3 text-xs leading-snug ${activeTheme.text.primary}`}
                >
                  {card.front}
                </span>
                <span
                  className={`text-xs leading-snug ${activeTheme.text.secondary} line-clamp-1 opacity-60`}
                >
                  {card.back}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`size-1.5 rounded-full ${tile.dot}`} />
                  <span
                    className={`text-[9px] font-bold uppercase ${tile.text}`}
                  >
                    {tile.label}
                  </span>
                </span>
              </button>
            );
          })}

          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <EmptyTile key={`skel-${i}`} activeTheme={activeTheme} />
            ))}
        </div>
      )}

      {/* Pagination Actions Button Footer */}
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
