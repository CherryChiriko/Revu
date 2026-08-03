import React from "react";
import { SettingCard } from "../../General/ui/SettingCard";
import { setTheme } from "../../../slices/themeSlice";
import { persistUserTheme } from "../hooks/useSettings";
import { faPalette } from "@fortawesome/free-solid-svg-icons";

export function ThemeSection({
  activeTheme,
  allThemes,
  currentThemeName,
  dispatch,
  isMobile,
  userId, // Pass user ID (e.g. profile?.id) here
}) {
  const handleThemeSelect = (themeId) => {
    if (themeId === currentThemeName) return;

    // 1. Instant optimistic update in Redux + localStorage
    dispatch(setTheme(themeId));

    // 2. Persist to Supabase DB in the background
    if (userId) {
      persistUserTheme(userId, themeId);
    }
  };

  return (
    <SettingCard
      icon={faPalette}
      title="Theme"
      activeTheme={activeTheme}
      isMobile={isMobile}
    >
      <div className="grid grid-cols-2 gap-3">
        {Object.values(allThemes).map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleThemeSelect(theme.id)}
            className={`text-left rounded-xl p-3 border transition-all ${
              currentThemeName === theme.id
                ? `focus:outline-none focus:ring-2 ${activeTheme.ring.focus}`
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
