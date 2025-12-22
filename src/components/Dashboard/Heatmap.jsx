import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectHeatmapData } from "../../slices/activitySlice";

// Weekday labels (Mon–Sun)
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_ISO = new Date().toISOString().slice(0, 10);

// Generate calendar grid aligned to weeks
function generateCalendarGrid(dataMap, weeksToShow = 4) {
  const today = new Date();
  const dayOfTheWeek = today.getDay();

  const startDate = new Date(today);
  const endDate = new Date(today);

  endDate.setDate(
    today.getDate() + (dayOfTheWeek === 0 ? 0 : 7 - dayOfTheWeek)
  );
  startDate.setDate(endDate.getDate() - (weeksToShow * 7 - 1));

  const gridStart = new Date(startDate);
  gridStart.setDate(startDate.getDate());

  const cells = [];
  const totalCells = weeksToShow * 7;

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);

    const iso = d.toISOString().slice(0, 10);
    const value = dataMap.get(iso) || 0;

    // Mark future cells (after today)
    const isFuture = d > today;

    cells.push({
      date: d,
      iso,
      value,
      isFuture,
    });
  }

  return cells;
}

export const Heatmap = ({ activeTheme }) => {
  const COLORS = activeTheme.gradients.colors;
  const heatmapData = useSelector(selectHeatmapData);

  const dataMap = useMemo(() => {
    const m = new Map();
    heatmapData.forEach((d) => m.set(d.date, d.value));
    return m;
  }, [heatmapData]);

  const cells = generateCalendarGrid(dataMap, 4);

  const getColor = (value, isFuture) => {
    const max_value = 100;
    const nonzero_steps = COLORS.length - 1;

    if (isFuture) return "rgba(255,255,255,0)";
    if (value === 0) return COLORS[0];
    if (value >= max_value) return COLORS[nonzero_steps];

    const raw = Math.floor((value / max_value) * nonzero_steps);
    return COLORS[Math.min(nonzero_steps - 1, Math.max(0, raw)) + 1];
  };

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Activity</h3>
        <div className="text-xs opacity-60">daily objectives reached</div>
      </div>

      {/* Weekday header - FIRST ROW */}
      <div className="grid grid-cols-7 gap-1 text-xs opacity-60">
        {WEEKDAY_LABELS.map((label, idx) => (
          <div key={idx} className="w-7 text-center">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar weeks - Content below the header */}
      <div className="space-y-1">
        {weeks.map((week, wIdx) => (
          // IMPORTANT: Use the same grid classes here to align perfectly
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((c, idx) => {
              const isToday = c.iso === TODAY_ISO;
              return (
                <div
                  key={idx}
                  title={`${c.iso}: ${c.value}`}
                  className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-medium
  ${isToday ? `border-2 ${activeTheme.border.card}` : ""} ${
                    c.isFuture ? `border-2 ${activeTheme.border.muted}` : ""
                  }`}
                  style={{
                    background: getColor(c.value, c.isFuture),
                    color: c.isFuture
                      ? activeTheme.text.primary
                      : activeTheme.text.secondary,
                  }}
                >
                  {c.date.getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center text-xs opacity-60 pt-1">
        <span>0%</span>
        <div className="flex space-x-1">
          {COLORS.map((hex, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <span>100%</span>
      </div>
    </div>
  );
};
