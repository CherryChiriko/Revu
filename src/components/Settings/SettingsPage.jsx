import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import {
  selectActiveTheme,
  selectAllThemes,
  selectCurrentThemeName,
} from "../../slices/themeSlice";
import { selectUserProfile } from "../../slices/userSlice";
import { selectSettings, hydrateFromProfile } from "../../slices/settingsSlice";

import { AccountSection } from "./components/AccountSection";
import { AvatarSection } from "./components/AvatarSection";
import { StudyLimitsSection } from "./components/StudyLimits";
import { ThemeSection } from "./components/ThemeSection";
import { HeatmapSection } from "./components/HeatmapSection";
import { StudyFlowSection } from "./components/StudyFlowSection";
import { DisplaySection } from "./components/DisplaySection";

// ─────────────────────────────────────────────────────────────────────────────
// Root: SettingsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const activeTheme = useSelector(selectActiveTheme);
  const allThemes = useSelector(selectAllThemes);
  const currentThemeName = useSelector(selectCurrentThemeName);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);

  // Hydrate study limits from profile once it's loaded
  useEffect(() => {
    if (profile) dispatch(hydrateFromProfile(profile));
  }, [profile, dispatch]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Mini avatar preview in header */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-2xl font-black text-white shadow"
                style={{
                  backgroundColor: settings.avatarUrl
                    ? "transparent"
                    : settings.profileColor,
                }}
              >
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : settings.profileIcon.length > 1 ? (
                  settings.profileIcon
                ) : (
                  (profile?.username?.[0] ?? "R").toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Settings
                </h1>
                <p className={`${activeTheme.text.secondary} mt-1`}>
                  {profile?.username ?? "Revu learner"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Logout
            </button>
          </div>
        </div>

        {/* ── Row 1: Account ──────────────────────────────────────── */}
        <AccountSection
          profile={profile}
          activeTheme={activeTheme}
          dispatch={dispatch}
        />

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
      </div>
    </div>
  );
}
