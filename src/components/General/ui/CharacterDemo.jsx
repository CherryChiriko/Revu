import React from "react";
import { useHanziWriter } from "../../Study/hooks/useHanziWriter";

// 1. Isolated character rendering canvas concern
export const CharacterCanvas = ({ character, displayState, activeTheme }) => {
  const strokeColor = activeTheme.isDark
    ? "rgb(212,212,212)"
    : "rgb(55, 65, 81)";

  const { containerRef } = useHanziWriter({
    character,
    displayState,
    onQuizComplete: () => {},
    activeTheme,
    strokeColor,
    revealed: true,
    width: 80,
    height: 80,
  });

  return (
    <div
      ref={containerRef}
      className={`${activeTheme.background.canvas} border-2 ${activeTheme.border.card} rounded-xl shadow-sm transition-all mx-auto relative w-[80px] h-[80px]`}
      role="region"
      aria-label="Character canvas slot"
    />
  );
};

export const CharacterDemo = ({ activeTheme, displayState = "" }) => {
  return (
    <div
      className="flex flex-col items-center w-full p-1"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Render Frame block */}
      <div className="text-center space-y-1 w-full">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          zì
        </p>

        <div>
          <CharacterCanvas
            character="字"
            displayState={displayState}
            activeTheme={activeTheme}
          />
        </div>

        <p
          className={`text-xs italic font-medium pt-1 ${activeTheme.text.secondary}`}
        >
          word / character
        </p>
      </div>
    </div>
  );
};
