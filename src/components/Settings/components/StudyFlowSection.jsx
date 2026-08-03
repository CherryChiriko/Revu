import React from "react";
import { supabase } from "../../../utils/supabaseClient";
import { Toggle, LabelledSlider } from "../SettingsTemplates";
import { SettingCard } from "../../General/ui/SettingCard";
import { updateSettings } from "../../../slices/settingsSlice";
import { updateLocalProfile } from "../../../slices/userSlice"; // If keeping track in user state too
import { useSettingSave } from "../hooks/useSettingsSave";
import {
  faBolt,
  faClock,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";

export function StudyFlowSection({
  profile,
  settings,
  activeTheme,
  dispatch,
  isMobile,
}) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  // 🌟 Connect the exact same saving hook structure for UX consistency
  const { handleSave, saveState } = useSettingSave(async () => {
    if (!profile?.id) return;

    // Update the database layout with current frontend configuration values
    const { error } = await supabase
      .from("profiles") // assuming profiles or user_settings is your target table
      .update({
        autoflip_mode_a: settings.autoflipModeA,
        autoflip_speed: settings.autoflipSpeed,
        character_animation_speed: settings.characterAnimationSpeed,
      })
      .eq("id", profile.id);

    if (error) throw error;

    // Optional: Synchronize your deep userSlice profile if needed
    if (dispatch(updateLocalProfile)) {
      dispatch(
        updateLocalProfile({
          autoflip_mode_a: settings.autoflipModeA,
          autoflip_speed: settings.autoflipSpeed,
          character_animation_speed: settings.characterAnimationSpeed,
        }),
      );
    }
  });

  return (
    <SettingCard
      icon={faBolt}
      title="Study Flow"
      activeTheme={activeTheme}
      onSave={handleSave} // Added the explicit save trigger action
      saveState={saveState} // Syncs loading/error styles on the button
      isMobile={isMobile}
      isSettings={true}
    >
      <div className="space-y-6">
        {/* Autoflip toggle */}
        <Toggle
          checked={settings.autoflipModeA}
          onChange={(v) => set("autoflipModeA", v)}
          label="Autoflip cards"
          description="In animation mode, cards flip to the back automatically after a set delay."
          activeTheme={activeTheme}
        />

        {/* Autoflip speed — conditionally rendered */}
        {settings.autoflipModeA && (
          <LabelledSlider
            icon={faClock}
            label="Autoflip delay"
            value={settings.autoflipSpeed}
            min={1}
            max={8}
            step={0.5}
            format={(v) => `${v.toFixed(1)}s`}
            onChange={(v) => set("autoflipSpeed", v)}
            activeTheme={activeTheme}
          />
        )}

        {/* Character animation speed */}
        <LabelledSlider
          icon={faGaugeHigh}
          label="Character animation speed"
          value={settings.characterAnimationSpeed}
          min={0.5}
          max={3}
          step={0.25}
          format={(v) => `${v.toFixed(2)}x`}
          onChange={(v) => set("characterAnimationSpeed", v)}
          activeTheme={activeTheme}
        />
      </div>
    </SettingCard>
  );
}
