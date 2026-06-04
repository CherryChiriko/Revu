import React, { useMemo } from "react";
import { STATUS_COLOR } from "../../Study/constants/constants";

export const ProgressBar = ({
  counts = {},
  cards_count = 0,
  activeTheme,
  isMastered = false,
}) => {
  // 1. Destructure with default fallbacks safely
  const {
    mastered = 0,
    suspended = 0,
    waiting = 0,
    due = 0,
    new: newCards = 0,
  } = counts;

  // 2. Compute percentages efficiently using useMemo to prevent re-renders
  const segments = useMemo(() => {
    const total = cards_count || 1; // Safeguard against division by zero
    return [
      { status: "due", count: due, pct: (due / total) * 100 },
      { status: "waiting", count: waiting, pct: (waiting / total) * 100 },
      { status: "new", count: newCards, pct: (newCards / total) * 100 },
      { status: "mastered", count: mastered, pct: (mastered / total) * 100 },
      { status: "suspended", count: suspended, pct: (suspended / total) * 100 },
    ].filter((seg) => seg.count > 0);
  }, [counts, cards_count, suspended, mastered, due, waiting, newCards]);

  // 3. Centralized theme background color string retriever
  const getStatusBackground = (status) => {
    const themeKey = STATUS_COLOR[status];
    return activeTheme?.background?.[themeKey] || activeTheme.background.canvas;
  };

  // 4. Clean up structural tracking frame backgrounds
  const trackClass = activeTheme?.isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className="w-full">
      <div
        className={`w-full h-2 rounded-full overflow-hidden flex ${trackClass}`}
      >
        {segments.map((seg) => (
          <div
            key={seg.status}
            className={`h-2 transition-all duration-300 ease-in-out ${getStatusBackground(seg.status)}`}
            style={{ width: `${seg.pct}%` }}
            title={`${seg.status.charAt(0).toUpperCase() + seg.status.slice(1)}: ${seg.count}`}
          />
        ))}
      </div>

      {/* Legend Block */}
      {!isMastered && segments.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 px-0.5">
          {segments.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              {/* Colored Dot Indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full ${getStatusBackground(item.status)}`}
              />

              {/* Quantitative Label Typography */}
              <span
                className={`${activeTheme?.text?.muted || "text-gray-500"} text-[11px] font-medium leading-none`}
              >
                {item.count} {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
