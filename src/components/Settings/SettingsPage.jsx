/**
 * SettingsPage.jsx
 *
 * Changes vs. previous version
 * ─────────────────────────────
 * • Removed username-change form (login depends on username lookup).
 * • Avatar: upload photo OR pick a preset emoji from a curated palette.
 * • Study limits (review, learn, streak goal) now persist to `profiles`
 *   via a single Supabase RPC call.
 * • Broken into small, self-contained section components so the file
 *   stays navigable as features grow.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  faImage,
  faLayerGroup,
  faPalette,
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
import {
  selectSettings,
  updateSettings,
  hydrateFromProfile,
} from "../../slices/settingsSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f97316", "#e11d48"];

const PRESET_AVATARS = [
  "🐉",
  "🦊",
  "🐼",
  "🦁",
  "🐸",
  "🦋",
  "🌸",
  "⚡",
  "🔥",
  "🌙",
  "🎯",
  "🧠",
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI pieces (kept inline so the file is self-contained)
// ─────────────────────────────────────────────────────────────────────────────

function SettingCard({ icon, title, children, activeTheme }) {
  return (
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
}

function Toggle({ checked, onChange, label, description, activeTheme }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className={`${activeTheme.text.secondary} text-sm`}>
          {description}
        </span>
      </span>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked
            ? activeTheme.background.accent1
            : activeTheme.background.track
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}

function SegmentButton({ active, children, onClick, activeTheme }) {
  return (
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
}

/** Labelled slider with live value display */
function LabelledSlider({
  icon,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  activeTheme,
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4">
        <span className="font-semibold">
          {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
          {label}
        </span>
        <span className={`${activeTheme.text.secondary} text-sm tabular-nums`}>
          {format(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-3"
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Avatar
// ─────────────────────────────────────────────────────────────────────────────

function AvatarSection({ profile, settings, activeTheme, dispatch }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const currentAvatarUrl = settings.avatarUrl;
  const initials = (profile?.username?.[0] ?? "R").toUpperCase();

  // ── Upload photo ────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !profile?.id) return;

      if (file.size > MAX_AVATAR_BYTES) {
        setUploadError("Image must be under 2 MB.");
        return;
      }

      setUploadError(null);
      setUploading(true);

      try {
        const ext = file.name.split(".").pop();
        const path = `${profile.id}/avatar.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        if (upErr) throw upErr;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        // Bust cache with a timestamp param
        const url = `${data.publicUrl}?t=${Date.now()}`;

        await supabase
          .from("profiles")
          .update({ avatar_url: url })
          .eq("id", profile.id);

        dispatch(updateSettings({ avatarUrl: url }));
        dispatch(updateLocalProfile({ avatar_url: url }));
      } catch (err) {
        setUploadError(err.message ?? "Upload failed.");
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-selected if needed
        e.target.value = "";
      }
    },
    [profile, dispatch],
  );

  // ── Pick preset emoji ───────────────────────────────────────────────────
  const handlePreset = useCallback(
    async (emoji) => {
      dispatch(updateSettings({ avatarUrl: null, profileIcon: emoji }));
      if (profile?.id) {
        await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", profile.id);
      }
    },
    [profile, dispatch],
  );

  // ── Remove photo ────────────────────────────────────────────────────────
  const handleRemovePhoto = useCallback(async () => {
    dispatch(updateSettings({ avatarUrl: null }));
    if (profile?.id) {
      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);
    }
  }, [profile, dispatch]);

  return (
    <SettingCard icon={faImage} title="Avatar" activeTheme={activeTheme}>
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 mb-5">
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-black text-white shadow-lg"
          style={{
            backgroundColor: currentAvatarUrl
              ? "transparent"
              : settings.profileColor,
          }}
        >
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : settings.profileIcon.length > 1 ? (
            // emoji preset
            settings.profileIcon
          ) : (
            initials
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${activeTheme.button.accent2} disabled:opacity-50`}
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          {currentAvatarUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="px-3 py-1.5 text-sm rounded-lg font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
        {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}
      </div>

      {/* Preset emojis */}
      <p className={`${activeTheme.text.secondary} text-xs mb-2`}>
        Or pick a preset
      </p>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {PRESET_AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handlePreset(emoji)}
            className={`h-9 w-full rounded-lg text-xl flex items-center justify-center transition ${
              settings.profileIcon === emoji && !currentAvatarUrl
                ? "ring-2 ring-sky-400 bg-white/10"
                : "hover:bg-white/10"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Accent colour */}
      <p className={`${activeTheme.text.secondary} text-xs mb-2`}>
        Background colour
      </p>
      <div className="flex gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => dispatch(updateSettings({ profileColor: color }))}
            className={`w-8 h-8 rounded-full border-2 transition ${
              settings.profileColor === color
                ? "border-white scale-110"
                : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </SettingCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Study limits
// ─────────────────────────────────────────────────────────────────────────────

function StudyLimitsSection({ profile, settings, activeTheme, dispatch }) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaveState("saving");

    try {
      const { error } = await supabase.rpc("update_user_study_settings", {
        p_user_id: profile.id,
        p_review_limit: settings.reviewLimit,
        p_learn_limit: settings.learnLimit,
        p_streak_goal: settings.streakGoal,
      });
      if (error) throw error;

      // Keep local profile in sync so hydrateFromProfile stays accurate
      dispatch(
        updateLocalProfile({
          review_limit: settings.reviewLimit,
          learn_limit: settings.learnLimit,
          streak_goal: settings.streakGoal,
        }),
      );

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      console.error("Failed to save study limits", err);
      setSaveState("error");
    }
  };

  const saveLabel = {
    idle: "Save limits",
    saving: "Saving…",
    saved: "Saved ✓",
    error: "Try again",
  }[saveState];

  return (
    <SettingCard icon={faFire} title="Study Limits" activeTheme={activeTheme}>
      <div className="space-y-6">
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

        {/* Divider */}
        <div className={`border-t ${activeTheme.border.card}`} />

        <div>
          <LabelledSlider
            icon={faFire}
            label="Daily streak goal"
            value={settings.streakGoal}
            min={5}
            max={100}
            step={5}
            format={(v) => `${v} cards`}
            onChange={(v) => set("streakGoal", v)}
            activeTheme={activeTheme}
          />
          <p className={`${activeTheme.text.secondary} text-xs mt-2`}>
            Complete at least this many reviews <em>or</em> new cards in a
            session to count it toward your daily streak.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={`w-full py-2 rounded-lg font-semibold text-sm ${activeTheme.button.accent2} disabled:opacity-50`}
        >
          {saveLabel}
        </button>
      </div>
    </SettingCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Theme
// ─────────────────────────────────────────────────────────────────────────────

function ThemeSection({ activeTheme, allThemes, currentThemeName, dispatch }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Section: Heatmap metric
// ─────────────────────────────────────────────────────────────────────────────

function HeatmapSection({ settings, activeTheme, dispatch }) {
  const set = (metric) => dispatch(updateSettings({ heatmapMetric: metric }));

  return (
    <SettingCard icon={faChartSimple} title="Heatmap" activeTheme={activeTheme}>
      <div
        className={`p-1 rounded-xl ${activeTheme.background.canvas} flex flex-wrap gap-1 mb-4`}
      >
        <SegmentButton
          active={settings.heatmapMetric === "consistency"}
          onClick={() => set("consistency")}
          activeTheme={activeTheme}
        >
          Consistency
        </SegmentButton>
        <SegmentButton
          active={settings.heatmapMetric === "studied"}
          onClick={() => set("studied")}
          activeTheme={activeTheme}
        >
          Cards studied
        </SegmentButton>
        <SegmentButton
          active={settings.heatmapMetric === "learned"}
          onClick={() => set("learned")}
          activeTheme={activeTheme}
        >
          Cards learned
        </SegmentButton>
      </div>
      <p className={`${activeTheme.text.secondary} text-sm`}>
        Consistency is the default — SRS is won by showing up daily, not by
        chasing big sessions.
      </p>
    </SettingCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Study flow
// ─────────────────────────────────────────────────────────────────────────────

function StudyFlowSection({ settings, activeTheme, dispatch }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Section: Display defaults
// ─────────────────────────────────────────────────────────────────────────────

function DisplaySection({ settings, activeTheme, dispatch }) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  return (
    <SettingCard icon={faLayerGroup} title="Defaults" activeTheme={activeTheme}>
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
              onClick={() => set("dateFormat", "dd/mm/yyyy")}
              activeTheme={activeTheme}
            >
              DD/MM/YYYY
            </SegmentButton>
            <SegmentButton
              active={settings.dateFormat === "mm/dd/yyyy"}
              onClick={() => set("dateFormat", "mm/dd/yyyy")}
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
              onClick={() => set("defaultDeckView", "grid")}
              activeTheme={activeTheme}
            >
              Large card
            </SegmentButton>
            <SegmentButton
              active={settings.defaultDeckView === "list"}
              onClick={() => set("defaultDeckView", "list")}
              activeTheme={activeTheme}
            >
              Compact list
            </SegmentButton>
          </div>
        </div>
      </div>
    </SettingCard>
  );
}

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

        {/* ── Row 1: Avatar · Study limits · Theme ────────────────────── */}
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

        {/* ── Row 2: Heatmap · Study flow · Display ───────────────────── */}
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
