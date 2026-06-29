import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingCard, SegmentButton } from "../SettingsTemplates";
import { updateSettings } from "../../../slices/settingsSlice";
import { updateLocalProfile } from "../../../slices/userSlice";
import { supabase } from "../../../utils/supabaseClient";
import { useSettingSave } from "../hooks/useSettingsSave";
import {
  faCalendarDays,
  faLayerGroup,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

export function DisplaySection({ profile, settings, activeTheme, dispatch }) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  const { handleSave, saveState } = useSettingSave(async () => {
    if (!profile?.id) return;
    const { error } = await supabase.rpc("update_user_display_settings", {
      p_user_id: profile.id,
      p_date_format: settings.dateFormat,
      p_default_deck_view: settings.defaultDeckView,
      p_heatmap_metric: settings.heatmapMetric,
    });
    if (error) throw error;
    dispatch(
      updateSettings({
        dateFormat: settings.dateFormat,
        defaultDeckView: settings.defaultDeckView,
        heatmapMetric: settings.heatmapMetric,
      }),
    );
    dispatch(
      updateLocalProfile({
        date_format: settings.dateFormat,
        default_deck_view: settings.defaultDeckView,
        heatmap_metric: settings.heatmapMetric,
      }),
    );
  });

  return (
    <SettingCard
      icon={faLayerGroup}
      title="Display"
      activeTheme={activeTheme}
      onSave={handleSave}
      saveState={saveState}
    >
      {/* Week start */}
      <div>
        <div className="font-semibold mb-2">
          <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
          Week starts on
        </div>
        <div
          className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
        >
          <SegmentButton
            active={settings.dateFormat === "monday"}
            onClick={() => set("dateFormat", "monday")}
            activeTheme={activeTheme}
          >
            Monday
          </SegmentButton>
          <SegmentButton
            active={settings.dateFormat === "sunday"}
            onClick={() => set("dateFormat", "sunday")}
            activeTheme={activeTheme}
          >
            Sunday
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
            active={settings.defaultDeckView === "large"}
            onClick={() => set("defaultDeckView", "large")}
            activeTheme={activeTheme}
          >
            Large card
          </SegmentButton>
          <SegmentButton
            active={settings.defaultDeckView === "compact"}
            onClick={() => set("defaultDeckView", "compact")}
            activeTheme={activeTheme}
          >
            Compact list
          </SegmentButton>
        </div>
      </div>

      {/* Heatmap metric */}
      {/* <div>
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
      </div> */}
    </SettingCard>
  );
}
