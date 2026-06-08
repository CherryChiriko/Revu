import React from "react";
import { SettingCard } from "../SettingsTemplates";
import { setTheme } from "../../../slices/themeSlice";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Theme
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeSection({
  activeTheme,
  allThemes,
  currentThemeName,
  dispatch,
}) {
  return (
    <SettingCard icon={faPalette} title="Theme" activeTheme={activeTheme}>
      <div className="grid grid-cols-2 gap-3">
        {Object.values(allThemes).map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => dispatch(setTheme(theme.id))}
            className={`text-left rounded-xl p-3 border ${
              currentThemeName === theme.id
                ? "border-sky-400"
                : activeTheme.border.card
            } ${activeTheme.background.canvas}`}
          >
            <div className="flex gap-1 mb-3">
              {theme.gradients.colors.slice(1, 5).map((color) => (
                <span
                  key={color}
                  className="h-7 flex-1 rounded-md"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="font-semibold">{theme.name}</span>
          </button>
        ))}
      </div>
    </SettingCard>
  );
}
