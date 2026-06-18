import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectActivityDays,
  selectHeatmapData,
} from "../../slices/activitySlice";
import {
  selectDailyGoal,
  selectHeatmapMetric,
  selectSettings, // 🌟 Added to pull the generic settings state for dateFormat
} from "../../slices/settingsSlice";
import { getTodayISO } from "../../utils/dateHelper";

// Generate calendar grid dynamically aligned to week preference
function generateCalendarGrid(dataMap, weeksToShow = 4, weekStart = "monday") {
  const today = new Date();
  const baseTodayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate days needed to stretch to the end of the current visible row
  let daysUntilEndOfWeek = 0;
  if (weekStart === "sunday") {
    // Week ends on Saturday (6)
    daysUntilEndOfWeek = 6 - dayOfWeek;
  } else {
    // Week ends on Sunday (0)
    daysUntilEndOfWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  }

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilEndOfWeek);

  // Start back from the end of the grid row space
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (weeksToShow * 7 - 1));

  const cells = [];
  for (let i = 0; i < weeksToShow * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    const cellMidnight = new Date(year, d.getMonth(), d.getDate());
    const isFuture = cellMidnight.getTime() > baseTodayMidnight.getTime();

    cells.push({
      date: d,
      iso,
      value: dataMap.get(iso) || 0,
      isFuture: isFuture,
    });
  }

  return cells;
}

export const Heatmap = ({ activeTheme }) => {
  const COLORS = activeTheme.gradients.colors;
  const heatmapMetric = useSelector(selectHeatmapMetric);
  const dailyGoal = useSelector(selectDailyGoal);
  const activityDays = useSelector(selectActivityDays);
  const consistencyHeatmapData = useSelector(selectHeatmapData);

  // 🌟 Read the week start preference. Defaults to 'monday' if not loaded.
  const settings = useSelector(selectSettings);
  const weekStart = settings?.dateFormat || "monday";

  const TODAY_ISO = useMemo(() => getTodayISO(), []);

  // 🌟 Dynamically rotate labels depending on choice
  const weekdayLabels = useMemo(() => {
    return weekStart === "sunday"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [weekStart]);

  const heatmapData = useMemo(() => {
    if (heatmapMetric === "consistency") return consistencyHeatmapData;

    return Object.values(activityDays)
      .map((day) => {
        const value =
          heatmapMetric === "learned"
            ? day.cardsLearned || 0
            : day.cardsStudied || 0;
        return {
          date: day.date,
          value: Math.min(100, Math.round((value / dailyGoal) * 100)),
          rawValue: value,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activityDays, consistencyHeatmapData, dailyGoal, heatmapMetric]);

  const dataMap = useMemo(() => {
    const m = new Map();
    heatmapData.forEach((d) => m.set(d.date, d.value));
    return m;
  }, [heatmapData]);

  // 🌟 Regenerate calendar layout row grid cells whenever week preference switches
  const cells = useMemo(() => {
    return generateCalendarGrid(dataMap, 4, weekStart);
  }, [dataMap, weekStart]);

  const getColor = (value, isFuture) => {
    const max_value = 100;
    const nonzero_steps = COLORS.length - 1;

    if (isFuture) return "transparent";
    if (value === 0) return COLORS[0];
    if (value >= max_value) return COLORS[nonzero_steps];

    const raw = Math.floor((value / max_value) * nonzero_steps);
    return COLORS[Math.min(nonzero_steps - 1, Math.max(0, raw)) + 1];
  };

  // Split into structural weeks
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7));
    }
    return w;
  }, [cells]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Activity</h3>
        <div className="text-xs opacity-60">
          {heatmapMetric === "consistency"
            ? "daily objectives reached"
            : heatmapMetric === "learned"
              ? "cards learned"
              : "cards studied"}
        </div>
      </div>

      {/* Weekday header - Dynamically Ordered */}
      <div className="grid grid-cols-7 gap-1 text-xs opacity-60">
        {weekdayLabels.map((label, idx) => (
          <div key={idx} className="w-7 text-center">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar weeks */}
      <div className="space-y-1">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((c, idx) => {
              const isToday = c.iso === TODAY_ISO;
              return (
                <div
                  key={idx}
                  title={`${c.iso}: ${c.value}%`}
                  className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-medium
                  ${isToday ? `border-2 ${activeTheme.border.card}` : ""} ${
                    c.isFuture ? `border-2 ${activeTheme.border.muted}` : ""
                  }
                  ${
                    !activeTheme.isDark && c.isFuture
                      ? `${activeTheme.text.muted}`
                      : `${activeTheme.text.activeButton}`
                  }`}
                  style={{
                    background: getColor(c.value, c.isFuture),
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

      <Link
        to="/activity"
        className={`inline-flex items-center justify-center w-full rounded-lg py-2 text-sm font-semibold no-underline ${activeTheme.button.secondary} ${activeTheme.text.secondary}`}
      >
        View activity
      </Link>
    </div>
  );
};
