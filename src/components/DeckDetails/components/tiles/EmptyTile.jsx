// src/components/DeckDetails/components/tiles/EmptyTile.jsx
import React from "react";

export const EmptyTile = ({ activeTheme }) => {
  return (
    <div
      className={`flex flex-col justify-between gap-2 md:gap-3 min-h-[72px] md:min-h-[84px] rounded-xl border px-2.5 py-2 md:px-3 md:py-2.5 pointer-events-none select-none animate-pulse ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
    >
      <div className="space-y-1 md:space-y-1.5">
        <div
          className={`h-2 w-11/12 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
        />
        <div
          className={`h-2 w-8/12 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
        />
      </div>

      <div className="space-y-1.5 md:space-y-2 pt-0.5 md:pt-1">
        <div
          className={`h-1.5 md:h-2 w-5/12 rounded bg-current opacity-10 ${activeTheme.text.muted}`}
        />
        <div className="flex items-center gap-1.5 pt-0.5">
          <div
            className={`size-1 md:size-1.5 rounded-full bg-current opacity-20 ${activeTheme.text.muted}`}
          />
          <div
            className={`h-1 md:h-1.5 w-6 md:w-7 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
          />
        </div>
      </div>
    </div>
  );
};
