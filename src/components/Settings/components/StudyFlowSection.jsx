import React from "react";
import { SettingCard, Toggle, LabelledSlider } from "../SettingsTemplates";
import { updateSettings } from "../../../slices/settingsSlice";
import {
  faBolt,
  faClock,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";

// ─────────────────────────────────────────────────────────────────────────────
// Section: Study flow
// ─────────────────────────────────────────────────────────────────────────────

export function StudyFlowSection({ settings, activeTheme, dispatch }) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  return (
    <SettingCard icon={faBolt} title="Study Flow" activeTheme={activeTheme}>
      <div className="space-y-6">
        {/* Autoflip toggle — mode A only */}
        <Toggle
          checked={settings.autoflipModeA}
          onChange={(v) => set("autoflipModeA", v)}
          label="Autoflip cards"
          description="In animation mode, cards flip to the back automatically after a set delay."
          activeTheme={activeTheme}
        />

        {/* Autoflip speed — only shown when autoflip is on */}
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

        {/* Character animation speed — mode C only, always shown */}
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
