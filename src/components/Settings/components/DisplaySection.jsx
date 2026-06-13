import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingCard, SegmentButton } from "../SettingsTemplates";
import { updateSettings } from "../../../slices/settingsSlice";
import { supabase } from "../../../utils/supabaseClient";
import {
  faCalendarDays,
  faLayerGroup,
  faRotate,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

// ─────────────────────────────────────────────────────────────────────────────
// Section: Display defaults
// ─────────────────────────────────────────────────────────────────────────────

export function DisplaySection({ profile, settings, activeTheme, dispatch }) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaveState("saving");
    try {
      const { error } = await supabase.rpc("update_user_display_settings", {
        p_user_id: profile.id,
        p_date_format: settings.dateFormat,
        p_default_deck_view: settings.defaultDeckView,
        p_heatmap_metric: settings.heatmapMetric,
      });
      if (error) throw error;
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      console.error("Failed to save display settings", err);
      setSaveState("error");
    }
  };

  const saveLabel = {
    idle: "Save preferences",
    saving: "Saving…",
    saved: "Saved ✓",
    error: "Try again",
  }[saveState];

  return (
    <SettingCard icon={faLayerGroup} title="Defaults" activeTheme={activeTheme}>
      <div className="space-y-6">
        {/* Date format */}
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

        {/* Default deck view */}
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

        {/* Heatmap metric */}
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
              onClick={() => set("heatmapMetric", "consistency")}
              activeTheme={activeTheme}
            >
              Consistency
            </SegmentButton>
            <SegmentButton
              active={settings.heatmapMetric === "studied"}
              onClick={() => set("heatmapMetric", "studied")}
              activeTheme={activeTheme}
            >
              Cards studied
            </SegmentButton>
            <SegmentButton
              active={settings.heatmapMetric === "learned"}
              onClick={() => set("heatmapMetric", "learned")}
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

        {/* Save button — same pattern as StudyLimitsSection */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={`w-full py-2 rounded-lg font-semibold text-sm ${activeTheme.button.accent2} disabled:opacity-50`}
        >
          {saveLabel}
        </button>
      </div>
    </SettingCard>
  );
}
