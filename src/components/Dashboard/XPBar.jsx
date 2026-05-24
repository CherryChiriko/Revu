import React from "react";
import { Bar } from "../General/ui/Bar";

export const XPBar = ({ totalXP = 100, activeTheme }) => {
  const level = Math.floor(Math.sqrt(totalXP / 10));
  const xpForLevel = (level + 1) ** 2 * 10;
  const xpThisLevel = totalXP - level ** 2 * 10;

  return (
    <>
      <div className="flex justify-between mb-2 items-center">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTheme.background.accent3}`}
          >
            <span className="font-semibold">Lv</span>
          </div>
          <div>
            <div className={`text-sm ${activeTheme.text.secondary}`}>
              Progress to next level
            </div>
            <div className="text-lg font-bold">Level {level}</div>
          </div>
        </div>
        <div className={`text-sm ${activeTheme.text.secondary}`}>
          {totalXP} XP
        </div>
      </div>

      <Bar
        current={xpThisLevel}
        total={xpForLevel}
        activeTheme={activeTheme}
        isLabelOn={false}
      />

      <div
        className={`mt-1 text-xs {activeTheme.text.secondary} text-center w-full max-w-xl`}
      >
        {xpThisLevel} / {xpForLevel} XP
      </div>
    </>
  );
};
