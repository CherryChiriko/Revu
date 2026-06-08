import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingCard, SegmentButton } from "../SettingsTemplates";

import { updateSettings } from "../../../slices/settingsSlice";

import {
  faCalendarDays,
  faLayerGroup,
  faRotate,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Display defaults
// ─────────────────────────────────────────────────────────────────────────────

export function DisplaySection({ settings, activeTheme, dispatch }) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));
  // const set = (metric) => dispatch(updateSettings({ heatmapMetric: metric }));

  return (
    <SettingCard icon={faLayerGroup} title="Defaults" activeTheme={activeTheme}>
      <div className="space-y-6">
        <div>
          <div className="font-semibold mb-2">
            <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
            Date format
          </div>
          <div
            className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
          >
            <SegmentButton
              active={settings.dateFormat === "dd/mm/yyyy"}
              onClick={() => set("dateFormat", "dd/mm/yyyy")}
              activeTheme={activeTheme}
            >
              DD/MM/YYYY
            </SegmentButton>
            <SegmentButton
              active={settings.dateFormat === "mm/dd/yyyy"}
              onClick={() => set("dateFormat", "mm/dd/yyyy")}
              activeTheme={activeTheme}
            >
              MM/DD/YYYY
            </SegmentButton>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">
            <FontAwesomeIcon icon={faRotate} className="mr-2" />
            Default deck view
          </div>
          <div
            className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
          >
            <SegmentButton
              active={settings.defaultDeckView === "grid"}
              onClick={() => set("defaultDeckView", "grid")}
              activeTheme={activeTheme}
            >
              Large card
            </SegmentButton>
            <SegmentButton
              active={settings.defaultDeckView === "list"}
              onClick={() => set("defaultDeckView", "list")}
              activeTheme={activeTheme}
            >
              Compact list
            </SegmentButton>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-2">
            <FontAwesomeIcon icon={faChartSimple} className="mr-2" />
            Heatmap
          </div>
          <div
            className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
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
          <p className={`${activeTheme.text.muted} text-xs mt-3`}>
            Consistency is the default — fluency is won by showing up daily, not
            by chasing big sessions.
          </p>
        </div>
      </div>
    </SettingCard>
  );
}
