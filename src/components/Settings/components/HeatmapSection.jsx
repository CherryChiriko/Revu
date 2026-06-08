import React from "react";
import { SettingCard, SegmentButton } from "../SettingsTemplates";

import { updateSettings } from "../../../slices/settingsSlice";

import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Heatmap metric
// ─────────────────────────────────────────────────────────────────────────────

export function HeatmapSection({ settings, activeTheme, dispatch }) {
  const set = (metric) => dispatch(updateSettings({ heatmapMetric: metric }));

  return (
    <SettingCard icon={faChartSimple} title="Heatmap" activeTheme={activeTheme}>
      <div
        className={`p-1 rounded-xl ${activeTheme.background.canvas} flex flex-wrap gap-1 mb-4`}
      >
        <SegmentButton
          active={settings.heatmapMetric === "consistency"}
          onClick={() => set("consistency")}
          activeTheme={activeTheme}
        >
          Consistency
        </SegmentButton>
        <SegmentButton
          active={settings.heatmapMetric === "studied"}
          onClick={() => set("studied")}
          activeTheme={activeTheme}
        >
          Cards studied
        </SegmentButton>
        <SegmentButton
          active={settings.heatmapMetric === "learned"}
          onClick={() => set("learned")}
          activeTheme={activeTheme}
        >
          Cards learned
        </SegmentButton>
      </div>
      <p className={`${activeTheme.text.secondary} text-sm`}>
        Consistency is the default — SRS is won by showing up daily, not by
        chasing big sessions.
      </p>
    </SettingCard>
  );
}
