// src/components/Dashboard/XPBar.jsx
import React from "react";
import { Bar } from "../General/ui/Bar";
import { getLevelProgress } from "../../utils/xp";

export const XPBar = ({ totalXP = 100, activeTheme }) => {
  const { level, xpIntoLevel, xpForNextLevel } = getLevelProgress(totalXP);

  return (
    <>
      <div className="flex justify-between mb-1.5 md:mb-2 items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${activeTheme.background.accent3}`}
          >
            <span
              className={`text-xs md:text-sm font-semibold ${activeTheme.text.activeButton}`}
            >
              Lv
            </span>
          </div>
          <div>
            <div
              className={`text-[10px] md:text-sm ${activeTheme.text.secondary}`}
            >
              Progress to next level
            </div>
            <div className="text-base md:text-lg font-bold">Level {level}</div>
          </div>
        </div>
      </div>

      <Bar
        current={xpIntoLevel}
        total={xpForNextLevel}
        activeTheme={activeTheme}
        isLabelOn={false}
      />

      <div
        className={`mt-1 text-[10px] md:text-xs ${activeTheme.text.secondary} text-center w-full`}
      >
        {xpIntoLevel} / {xpForNextLevel} XP
      </div>
    </>
  );
};
