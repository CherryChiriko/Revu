// src/components/DeckDetails/components/sections/DeckStatsSection.jsx
import React from "react";
import { STATUS_TILE, STATUS_FILTERS } from "../SharedStyles";

export default function DeckStatsSection({
  statusCounts,
  totalCardCount,
  activeFilter,
  onFilterChange,
  activeTheme,
}) {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex gap-1.5 md:gap-2 overflow-x-auto overflow-y-visible pt-1 pb-2 px-0.5 scrollbar-hide">
        {STATUS_FILTERS.map((s) => {
          const active = activeFilter === s;
          return (
            <button
              key={s}
              onClick={() => onFilterChange(active ? null : s)}
              className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold border whitespace-nowrap transition-all duration-150 active:scale-95 focus:outline-none ${
                active
                  ? `${activeTheme.background.accent2} ${activeTheme.text.activeButton} shadow-md`
                  : `${activeTheme.background.card} ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:border-gray-400`
              }`}
            >
              <span
                className={`size-1.5 md:size-2 rounded-full ${STATUS_TILE[s].dot} transition-all ${active ? "border" : ""}`}
              />
              <span className="capitalize">{s}</span>
              <span
                className={`ml-0.5 rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-bold tabular-nums transition-colors ${
                  active
                    ? `${activeTheme.background.canvas} bg-opacity-40 ${activeTheme.text.activeButton}`
                    : `${activeTheme.background.canvas} ${activeTheme.text.muted}`
                }`}
              >
                {statusCounts[s] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
