import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBolt,
  faCalendarDays,
  faChartSimple,
  faClock,
  faFire,
  faGaugeHigh,
  faLayerGroup,
  faPalette,
  faPen,
  faRotate,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../utils/supabaseClient";
import useAuth from "../../hooks/useAuth";
import {
  selectActiveTheme,
  selectAllThemes,
  selectCurrentThemeName,
  setTheme,
} from "../../slices/themeSlice";
import { selectUserProfile, updateLocalProfile } from "../../slices/userSlice";
import { selectSettings, updateSettings } from "../../slices/settingsSlice";

const avatarColors = ["#6366f1", "#0ea5e9", "#14b8a6", "#f97316", "#e11d48"];

const SettingCard = ({ icon, title, children, activeTheme }) => (
  <section
    className={`${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl p-5 shadow-lg`}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    {children}
  </section>
);

const Toggle = ({ checked, onChange, label, description, activeTheme }) => (
  <label className="flex items-center justify-between gap-4 cursor-pointer">
    <span>
      <span className="block font-semibold">{label}</span>
      <span className={`${activeTheme.text.secondary} text-sm`}>
        {description}
      </span>
    </span>
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? activeTheme.background.accent1 : activeTheme.background.track
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  </label>
);

const SegmentButton = ({ active, children, onClick, activeTheme }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
      active
        ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} shadow`
        : `${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`
    }`}
  >
    {children}
  </button>
);

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeTheme = useSelector(selectActiveTheme);
  const allThemes = useSelector(selectAllThemes);
  const currentThemeName = useSelector(selectCurrentThemeName);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);
  const { logout } = useAuth();

  const [username, setUsername] = useState("");
  const [iconDraft, setIconDraft] = useState(settings.profileIcon);
  const [saveState, setSaveState] = useState("idle");

  const fallbackName = useMemo(() => {
    return profile?.username || profile?.email?.split("@")[0] || "Revu learner";
  }, [profile]);

  useEffect(() => {
    setUsername(fallbackName);
  }, [fallbackName]);

  const updateSetting = (key, value) => {
    dispatch(updateSettings({ [key]: value }));
  };

  const saveProfile = async () => {
    const cleanName = username.trim();
    const cleanIcon = (
      iconDraft.trim()[0] ||
      cleanName[0] ||
      "R"
    ).toUpperCase();

    setSaveState("saving");
    dispatch(updateSettings({ profileIcon: cleanIcon }));

    try {
      if (profile?.id && cleanName) {
        const { error } = await supabase
          .from("profiles")
          .update({ username: cleanName })
          .eq("id", profile.id);
        if (error) throw error;
        dispatch(updateLocalProfile({ username: cleanName }));
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    } catch (error) {
      console.error("Failed to save profile", error);
      setSaveState("error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div
          className={`${activeTheme.background.secondary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ backgroundColor: settings.profileColor }}
              >
                {settings.profileIcon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Settings
                </h1>
                <p className={`${activeTheme.text.secondary} mt-1`}>
                  Tune Revu around the way you actually study.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SettingCard icon={faUser} title="Profile" activeTheme={activeTheme}>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                style={{ backgroundColor: settings.profileColor }}
              >
                {iconDraft.trim()[0]?.toUpperCase() || settings.profileIcon}
              </div>
              <div className="space-y-3 w-full">
                <label className="block">
                  <span className={`${activeTheme.text.secondary} text-sm`}>
                    Username
                  </span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className={`mt-1 w-full border ${activeTheme.border.card} ${activeTheme.background.canvas} ${activeTheme.text.primary} rounded-lg py-2 px-3`}
                  />
                </label>
                <label className="block">
                  <span className={`${activeTheme.text.secondary} text-sm`}>
                    Icon
                  </span>
                  <input
                    value={iconDraft}
                    maxLength={2}
                    onChange={(event) => setIconDraft(event.target.value)}
                    className={`mt-1 w-full border ${activeTheme.border.card} ${activeTheme.background.canvas} ${activeTheme.text.primary} rounded-lg py-2 px-3`}
                  />
                </label>
                <div className="flex gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={`Use ${color}`}
                      onClick={() => updateSetting("profileColor", color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        settings.profileColor === color
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={saveProfile}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${activeTheme.button.accent2} font-semibold`}
                >
                  <FontAwesomeIcon icon={faPen} />
                  {saveState === "saving"
                    ? "Saving..."
                    : saveState === "saved"
                      ? "Saved"
                      : saveState === "error"
                        ? "Try again"
                        : "Save profile"}
                </button>
              </div>
            </div>
          </SettingCard>

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

          <SettingCard
            icon={faChartSimple}
            title="Heatmap"
            activeTheme={activeTheme}
          >
            <div
              className={`p-1 rounded-xl ${activeTheme.background.canvas} flex flex-wrap gap-1 mb-4`}
            >
              <SegmentButton
                active={settings.heatmapMetric === "consistency"}
                onClick={() => updateSetting("heatmapMetric", "consistency")}
                activeTheme={activeTheme}
              >
                Consistency
              </SegmentButton>
              <SegmentButton
                active={settings.heatmapMetric === "studied"}
                onClick={() => updateSetting("heatmapMetric", "studied")}
                activeTheme={activeTheme}
              >
                Cards studied
              </SegmentButton>
              <SegmentButton
                active={settings.heatmapMetric === "learned"}
                onClick={() => updateSetting("heatmapMetric", "learned")}
                activeTheme={activeTheme}
              >
                Cards learned
              </SegmentButton>
            </div>
            <p className={`${activeTheme.text.secondary} text-sm`}>
              Consistency stays the default because SRS progress is mostly won
              by showing up, not by chasing perfect sessions.
            </p>
          </SettingCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingCard
            icon={faBolt}
            title="Study Flow"
            activeTheme={activeTheme}
          >
            <div className="space-y-6">
              <Toggle
                checked={settings.autoflipModeA}
                onChange={(value) => updateSetting("autoflipModeA", value)}
                label="Autoflip cards in mode A"
                description="Reveal the answer automatically during fast recall."
                activeTheme={activeTheme}
              />
              <label className="block">
                <span className="flex items-center justify-between gap-4">
                  <span className="font-semibold">
                    <FontAwesomeIcon icon={faGaugeHigh} className="mr-2" />
                    Character animation speed
                  </span>
                  <span className={`${activeTheme.text.secondary} text-sm`}>
                    {settings.characterAnimationSpeed.toFixed(1)}x
                  </span>
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.characterAnimationSpeed}
                  onChange={(event) =>
                    updateSetting(
                      "characterAnimationSpeed",
                      Number(event.target.value),
                    )
                  }
                  className="w-full mt-3"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-4">
                  <span className="font-semibold">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    Autoflip speed
                  </span>
                  <span className={`${activeTheme.text.secondary} text-sm`}>
                    {settings.autoflipSpeed.toFixed(1)}s
                  </span>
                </span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={settings.autoflipSpeed}
                  onChange={(event) =>
                    updateSetting("autoflipSpeed", Number(event.target.value))
                  }
                  className="w-full mt-3"
                />
              </label>
            </div>
          </SettingCard>

          <SettingCard
            icon={faLayerGroup}
            title="Defaults"
            activeTheme={activeTheme}
          >
            <div className="space-y-6">
              <div>
                <div className="font-semibold mb-2">
                  <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
                  Date format
                </div>
                <div
                  className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
                >
                  <SegmentButton
                    active={settings.dateFormat === "dd/mm/yyyy"}
                    onClick={() => updateSetting("dateFormat", "dd/mm/yyyy")}
                    activeTheme={activeTheme}
                  >
                    DD/MM/YYYY
                  </SegmentButton>
                  <SegmentButton
                    active={settings.dateFormat === "mm/dd/yyyy"}
                    onClick={() => updateSetting("dateFormat", "mm/dd/yyyy")}
                    activeTheme={activeTheme}
                  >
                    MM/DD/YYYY
                  </SegmentButton>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">
                  <FontAwesomeIcon icon={faRotate} className="mr-2" />
                  Default deck view
                </div>
                <div
                  className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
                >
                  <SegmentButton
                    active={settings.defaultDeckView === "grid"}
                    onClick={() => updateSetting("defaultDeckView", "grid")}
                    activeTheme={activeTheme}
                  >
                    Large card
                  </SegmentButton>
                  <SegmentButton
                    active={settings.defaultDeckView === "list"}
                    onClick={() => updateSetting("defaultDeckView", "list")}
                    activeTheme={activeTheme}
                  >
                    Compact list
                  </SegmentButton>
                </div>
              </div>
              <label className="block">
                <span className="flex items-center justify-between gap-4">
                  <span className="font-semibold">
                    <FontAwesomeIcon icon={faFire} className="mr-2" />
                    Daily card goal
                  </span>
                  <span className={`${activeTheme.text.secondary} text-sm`}>
                    {settings.dailyGoal} cards
                  </span>
                </span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={settings.dailyGoal}
                  onChange={(event) =>
                    updateSetting("dailyGoal", Number(event.target.value))
                  }
                  className="w-full mt-3"
                />
              </label>
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
}
