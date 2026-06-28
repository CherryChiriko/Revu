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
    <div className="space-y-4">
      {/* FIXED PARENT CONTAINER:
        - Changed 'pb-0.5' to 'pt-1.5 pb-2 px-1' to give the shadows and scale transforms room to breathe.
        - Added 'overflow-y-visible' so the browser doesn't slice off elements that bleed past the bounds.
      */}
      <div className="flex gap-2 overflow-x-auto overflow-y-visible pt-1.5 pb-2 px-1 scrollbar-hide">
        {STATUS_FILTERS.map((s) => {
          const active = activeFilter === s;
          return (
            <button
              key={s}
              onClick={() => onFilterChange(active ? null : s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-150 active:scale-95 focus:outline-none ${
                active
                  ? `${activeTheme.background.accent2} ${activeTheme.text.activeButton} shadow-md`
                  : `${activeTheme.background.card} ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:border-gray-400`
              }`}
            >
              {/* Status Indicator Dot */}
              <span
                className={`size-2 rounded-full ${STATUS_TILE[s].dot} transition-all ${active ? "border" : ""}`}
              />

              <span className="capitalize">{s}</span>

              {/* Number Badge Circle */}
              <span
                className={`ml-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums transition-colors ${
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
