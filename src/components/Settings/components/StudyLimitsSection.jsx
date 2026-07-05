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
    });
    if (error) throw error;
    dispatch(
      updateLocalProfile({
        review_limit: settings.reviewLimit,
        learn_limit: settings.learnLimit,
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
      <p className={`${activeTheme.text.muted} text-xs mt-1`}>
        Complete at least your review <em>or</em> learning session to keep your
        daily streak going.
      </p>
    </SettingCard>
  );
}
