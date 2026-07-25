// src/components/General/ui/SegmentedBar.jsx
import React, { useMemo } from "react";

export const SegmentedBar = ({
  segments = [],
  total,
  activeTheme,
  showLegend = true,
  trackClassName,
  compact = false,
}) => {
  const resolved = useMemo(() => {
    const safeTotal = total || 1;
    return segments
      .filter((seg) => seg.count > 0)
      .map((seg) => ({
        ...seg,
        pct: (seg.count / safeTotal) * 100,
      }));
  }, [segments, total]);

  const trackClass =
    trackClassName ??
    activeTheme?.background?.track ??
    (activeTheme?.isDark ? "bg-gray-700" : "bg-gray-200");

  return (
    <div className="w-full">
      <div
        className={`w-full rounded-full overflow-hidden flex ${trackClass} ${
          compact ? "h-1" : "h-2"
        }`}
      >
        {resolved.map((seg) => (
          <div
            key={seg.key}
            className={`h-full transition-all duration-300 ease-in-out ${seg.colorClass}`}
            style={{ width: `${seg.pct}%` }}
            title={`${seg.label}: ${seg.count}`}
          />
        ))}
      </div>

      {!compact && showLegend && resolved.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 px-0.5">
          {resolved.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${seg.colorClass}`} />
              <span
                className={`${
                  activeTheme?.text?.muted || "text-gray-500"
                } text-[11px] font-medium leading-none`}
              >
                {seg.count} {seg.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentedBar;
