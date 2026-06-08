import React, { useState } from "react";

import { supabase } from "../../../utils/supabaseClient";
import { SettingCard, LabelledSlider } from "../SettingsTemplates";

import { updateLocalProfile } from "../../../slices/userSlice";
import { updateSettings } from "../../../slices/settingsSlice";

import {
  faFire,
  faLayerGroup,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Study limits
// ─────────────────────────────────────────────────────────────────────────────

export function StudyLimitsSection({
  profile,
  settings,
  activeTheme,
  dispatch,
}) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaveState("saving");

    try {
      const { error } = await supabase.rpc("update_user_study_settings", {
        p_user_id: profile.id,
        p_review_limit: settings.reviewLimit,
        p_learn_limit: settings.learnLimit,
        p_streak_goal: settings.streakGoal,
      });
      if (error) throw error;

      // Keep local profile in sync so hydrateFromProfile stays accurate
      dispatch(
        updateLocalProfile({
          review_limit: settings.reviewLimit,
          learn_limit: settings.learnLimit,
          streak_goal: settings.streakGoal,
        }),
      );

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      console.error("Failed to save study limits", err);
      setSaveState("error");
    }
  };

  const saveLabel = {
    idle: "Save limits",
    saving: "Saving…",
    saved: "Saved ✓",
    error: "Try again",
  }[saveState];

  return (
    <SettingCard icon={faFire} title="Study Limits" activeTheme={activeTheme}>
      <div className="space-y-6">
        <LabelledSlider
          icon={faRotate}
          label="Reviews per session"
          value={settings.reviewLimit}
          min={5}
          max={100}
          step={5}
          format={(v) => `${v} cards`}
          onChange={(v) => set("reviewLimit", v)}
          activeTheme={activeTheme}
        />
        <LabelledSlider
          icon={faLayerGroup}
          label="New cards per session"
          value={settings.learnLimit}
          min={5}
          max={50}
          step={5}
          format={(v) => `${v} cards`}
          onChange={(v) => set("learnLimit", v)}
          activeTheme={activeTheme}
        />

        {/* Divider */}
        <div className={`border-t ${activeTheme.border.card}`} />

        <div>
          <LabelledSlider
            icon={faFire}
            label="Daily streak goal"
            value={settings.streakGoal}
            min={5}
            max={100}
            step={5}
            format={(v) => `${v} cards`}
            onChange={(v) => set("streakGoal", v)}
            activeTheme={activeTheme}
          />
          <p className={`${activeTheme.text.muted} text-xs mt-3`}>
            Complete at least this many reviews <em>or</em> new cards in a
            session to count it toward your daily streak.
          </p>
        </div>

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
