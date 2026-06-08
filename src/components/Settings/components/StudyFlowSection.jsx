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
        <Toggle
          checked={settings.autoflipModeA}
          onChange={(v) => set("autoflipModeA", v)}
          label="Autoflip cards in mode A"
          description="Reveal the answer automatically during fast recall."
          activeTheme={activeTheme}
        />
        <LabelledSlider
          icon={faGaugeHigh}
          label="Character animation speed"
          value={settings.characterAnimationSpeed}
          min={0.5}
          max={2}
          step={0.1}
          format={(v) => `${v.toFixed(1)}x`}
          onChange={(v) => set("characterAnimationSpeed", v)}
          activeTheme={activeTheme}
        />
        <LabelledSlider
          icon={faClock}
          label="Autoflip speed"
          value={settings.autoflipSpeed}
          min={1}
          max={8}
          step={0.5}
          format={(v) => `${v.toFixed(1)}s`}
          onChange={(v) => set("autoflipSpeed", v)}
          activeTheme={activeTheme}
        />
      </div>
    </SettingCard>
  );
}
