import React from "react";

export const Bar = ({ current, total, activeTheme, isLabelOn = true }) => {
  const progressPercentage =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="flex flex-col w-full gap-2">
      {isLabelOn && (
        <div className="flex items-center justify-between px-0.5">
          <span
            className={`text-xs md:text-sm font-semibold tracking-wide uppercase ${activeTheme.text.muted}`}
          >
            Progress
          </span>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs md:text-sm font-bold ${activeTheme.background.canvas} ${activeTheme.text.primary} border ${activeTheme.border.secondary}`}
          >
            <span>{current}</span>
            <span className={`${activeTheme.text.muted} font-normal`}>/</span>
            <span>{total}</span>
          </div>
        </div>
      )}

      <div
        className={`w-full ${activeTheme.background.track} rounded-full h-2.5 md:h-3 overflow-hidden shadow-inner`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default React.memo(Bar);
