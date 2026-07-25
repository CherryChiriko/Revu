// src/components/Dashboard/Heatmap.jsx
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
  selectSettings,
} from "../../slices/settingsSlice";
import { getTodayISO } from "../../utils/dateHelper";

function generateCalendarGrid(dataMap, weeksToShow = 4, weekStart = "monday") {
  const today = new Date();
  const baseTodayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dayOfWeek = today.getDay();

  let daysUntilEndOfWeek = 0;
  if (weekStart === "sunday") {
    daysUntilEndOfWeek = 6 - dayOfWeek;
  } else {
    daysUntilEndOfWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  }

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilEndOfWeek);

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

export const Heatmap = ({ activeTheme, isMobile }) => {
  const COLORS = activeTheme.gradients.colors;
  const heatmapMetric = useSelector(selectHeatmapMetric);
  const dailyGoal = useSelector(selectDailyGoal);
  const activityDays = useSelector(selectActivityDays);
  const consistencyHeatmapData = useSelector(selectHeatmapData);

  const settings = useSelector(selectSettings);
  const weekStart = settings?.dateFormat || "monday";

  const TODAY_ISO = useMemo(() => getTodayISO(), []);

  const weekdayLabels = useMemo(() => {
    return weekStart === "sunday"
      ? ["S", "M", "T", "W", "T", "F", "S"]
      : ["M", "T", "W", "T", "F", "S", "S"];
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

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7));
    }
    return w;
  }, [cells]);

  return (
    <div
      className={`flex flex-col justify-between h-full w-full ${
        isMobile ? "space-y-3" : "space-y-5"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Activity</h4>
        <div className="text-xs opacity-60">
          {heatmapMetric === "consistency"
            ? "daily objectives reached"
            : heatmapMetric === "learned"
              ? "cards learned"
              : "cards studied"}
        </div>
      </div>

      {/* Centered Calendar Area */}
      <div
        className={`flex flex-col items-center justify-center w-full ${
          isMobile ? "space-y-2" : "space-y-3"
        }`}
      >
        {/* Weekday header */}
        <div
          className={`grid grid-cols-7 gap-1 opacity-60 justify-items-center w-full max-w-xs ${
            isMobile ? "text-[10px]" : "text-xs"
          }`}
        >
          {weekdayLabels.map((label, idx) => (
            <div
              key={idx}
              className={`text-center ${isMobile ? "w-6" : "w-7"}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        <div
          className={`w-full max-w-xs ${isMobile ? "space-y-1" : "space-y-2"}`}
        >
          {weeks.map((week, wIdx) => (
            <div
              key={wIdx}
              className="grid grid-cols-7 gap-1 justify-items-center"
            >
              {week.map((c, idx) => {
                const isToday = c.iso === TODAY_ISO;
                const isUncoloredOrFuture = c.value === 0 || c.isFuture;
                return (
                  <div
                    key={idx}
                    title={`${c.iso}: ${c.value}%`}
                    className={`rounded-sm flex items-center justify-center font-medium
                      ${isMobile ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs"}
                      ${isToday ? `border-2 ${activeTheme.border.card}` : ""}
                      ${c.isFuture ? `border-2 ${activeTheme.border.muted}` : ""}
                      ${
                        !activeTheme.isDark && isUncoloredOrFuture
                          ? activeTheme.text.secondary
                          : activeTheme.text.activeButton
                      }
                    `}
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
      </div>

      {/* Legend */}
      <div
        className={`flex justify-between items-center opacity-60 w-full max-w-xs mx-auto ${
          isMobile ? "text-[10px]" : "text-xs"
        }`}
      >
        <span>0%</span>
        <div className="flex space-x-1">
          {COLORS.map((hex, index) => (
            <div
              key={index}
              className={`rounded-sm ${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"}`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <span>100%</span>
      </div>

      {/* Action Button */}
      <Link
        to="/activity"
        className={`inline-flex items-center justify-center w-full rounded-lg font-semibold no-underline ${
          isMobile ? "text-xs py-1.5" : "text-sm py-2"
        } ${activeTheme.button.secondary} ${activeTheme.text.secondary}`}
      >
        View activity
      </Link>
    </div>
  );
};
