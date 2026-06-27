import React from "react";
import { supabase } from "../../../utils/supabaseClient";
import { SettingCard, LabelledSlider } from "../SettingsTemplates";
import { updateSettings } from "../../../slices/settingsSlice";
import { updateLocalProfile } from "../../../slices/userSlice";
import { useSettingSave } from "../hooks/useSettingsSave";
import {
  faFire,
  faLayerGroup,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

export function StudyLimitsSection({
  profile,
  settings,
  activeTheme,
  dispatch,
}) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  const { handleSave, saveState } = useSettingSave(async () => {
    if (!profile?.id) return;
    const { error } = await supabase.rpc("update_user_study_settings", {
      p_user_id: profile.id,
      p_review_limit: settings.reviewLimit,
      p_learn_limit: settings.learnLimit,
      p_streak_goal: settings.streakGoal,
    });
    if (error) throw error;
    dispatch(
      updateLocalProfile({
        review_limit: settings.reviewLimit,
        learn_limit: settings.learnLimit,
        streak_goal: settings.streakGoal,
      }),
    );
  });

  return (
    <SettingCard
      icon={faFire}
      title="Study Limits"
      activeTheme={activeTheme}
      onSave={handleSave}
      saveState={saveState}
    >
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
      <p className={`${activeTheme.text.muted} text-xs mt-3`}>
        Complete at least this many reviews <em>or</em> new cards in a session
        to count it toward your daily streak.
      </p>
    </SettingCard>
  );
}
