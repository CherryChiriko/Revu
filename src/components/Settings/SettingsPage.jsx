import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { AccountEdit } from "./components/AccountEdit";
import { AvatarSection } from "./components/AvatarSection";
import { StudyLimitsSection } from "./components/StudyLimits";
import { ThemeSection } from "./components/ThemeSection";
import { HeatmapSection } from "./components/HeatmapSection";
import { StudyFlowSection } from "./components/StudyFlowSection";
import { DisplaySection } from "./components/DisplaySection";
import { AccountSection } from "./components/AccountSection";

export function SettingsPage({
  profile,
  settings,
  activeTheme,
  allThemes,
  currentThemeName,
  dispatch,
}) {
  return (
    <>
      <AccountSection profile={profile} activeTheme={activeTheme} />

      {/* ── Row 3: Avatar · Study limits · Theme ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AvatarSection
          profile={profile}
          settings={settings}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />
        <StudyLimitsSection
          profile={profile}
          settings={settings}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />
        <ThemeSection
          activeTheme={activeTheme}
          allThemes={allThemes}
          currentThemeName={currentThemeName}
          dispatch={dispatch}
        />
      </div>

      {/* ── Row 4: Heatmap · Study flow · Display ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HeatmapSection
          settings={settings}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />
        <StudyFlowSection
          settings={settings}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />
        <DisplaySection
          settings={settings}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />
      </div>
    </>
  );
}

export function SettingsAccountPage({ profile, activeTheme, dispatch }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/settings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className={`
                        mt-0.5 px-3 shrink-0 flex items-center justify-center
                        ${activeTheme.text.muted}
                      `}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs px-2" /> Back
        </button>
      </div>

      <AccountEdit
        profile={profile}
        activeTheme={activeTheme}
        dispatch={dispatch}
      />
    </div>
  );
}
