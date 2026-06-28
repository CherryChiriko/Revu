import React from "react";

export const EmptyTile = ({ activeTheme }) => {
  return (
    <div
      className={`flex flex-col justify-between gap-3 min-h-[84px] rounded-xl border px-3 py-2.5 pointer-events-none select-none animate-pulse ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
    >
      <div className="space-y-1.5">
        {/* Mocking Front of Card: Line 1 */}
        <div
          className={`h-2.5 w-11/12 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
        />
        {/* Mocking Front of Card: Line 2 */}
        <div
          className={`h-2.5 w-8/12 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
        />
      </div>

      <div className="space-y-2 pt-1">
        {/* Mocking Back of Card */}
        <div
          className={`h-2 w-5/12 rounded bg-current opacity-10 ${activeTheme.text.muted}`}
        />

        {/* Mocking Bottom Status Badge Layout (Dot + Text) */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div
            className={`size-1.5 rounded-full bg-current opacity-20 ${activeTheme.text.muted}`}
          />
          <div
            className={`h-1.5 w-7 rounded bg-current opacity-15 ${activeTheme.text.muted}`}
          />
        </div>
      </div>
    </div>
  );
};
