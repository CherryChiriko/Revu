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
  faCheck,
  faClock,
  faFire,
  faGaugeHigh,
  faImage,
  faLayerGroup,
  faLock,
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

// 5 background colour options for the initials avatar
const INITIAL_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f97316", "#e11d48"];

// Exactly 5 preset emojis
const PRESET_EMOJIS = ["🐉", "🦊", "🐼", "🦁", "🐸"];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_HISTORY = 5;

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

// ── Shared helper: persist history + active URL to Supabase in one RPC call ──
async function persistAvatarState(profileId, history, activeUrl) {
  await supabase.rpc("update_avatar_history", {
    p_user_id: profileId,
    p_history: history,
    p_active_url: activeUrl ?? null,
  });
}

// ── Shared helper: render a single avatar thumbnail ──────────────────────────
function AvatarThumb({
  url,
  emoji,
  initial,
  color,
  active,
  onClick,
  onRemove,
  activeTheme,
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center text-xl font-black text-white transition-all
          ${active ? "ring-2 ring-sky-400 scale-105 shadow-lg" : "opacity-70 hover:opacity-100 hover:scale-105"}`}
        style={{ backgroundColor: url ? "transparent" : (color ?? "#6366f1") }}
      >
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : emoji ? (
          <span className="text-2xl leading-none">{emoji}</span>
        ) : (
          <span className="text-lg font-black">{initial}</span>
        )}
      </button>

      {/* Remove button — only shown when onRemove is provided */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── Row label ─────────────────────────────────────────────────────────────────
function RowLabel({ children, activeTheme }) {
  return (
    <p
      className={`${activeTheme.text.secondary} text-xs font-semibold uppercase tracking-wider mb-2`}
    >
      {children}
    </p>
  );
}

// ── AvatarSection ─────────────────────────────────────────────────────────────
function AvatarSection({ profile, settings, activeTheme, dispatch }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const history = settings.avatarHistory ?? []; // [{ url, path, used_at }]
  const activeUrl = settings.avatarUrl;
  const initial = (profile?.username?.[0] ?? "R").toUpperCase();

  // Determine which "type" is currently active for the preview
  const activeIsPhoto = !!activeUrl;
  const activeIsEmoji =
    !activeUrl && PRESET_EMOJIS.includes(settings.profileIcon);
  // otherwise it's an initial

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Write updated history + activeUrl both to Redux and Supabase */
  const applyAvatarState = useCallback(
    (newHistory, newActiveUrl, newProfileIcon = null) => {
      const updates = {
        avatarHistory: newHistory,
        avatarUrl: newActiveUrl ?? null,
      };
      if (newProfileIcon !== null) updates.profileIcon = newProfileIcon;
      dispatch(updateSettings(updates));
      dispatch(
        updateLocalProfile({
          avatar_url: newActiveUrl ?? null,
          avatar_history: newHistory,
        }),
      );
      if (profile?.id) persistAvatarState(profile.id, newHistory, newActiveUrl);
    },
    [profile, dispatch],
  );

  /** Touch an existing history entry (move to front / update used_at) */
  const touchHistoryEntry = useCallback(
    (entry) => {
      const rest = history.filter((h) => h.path !== entry.path);
      const updated = { ...entry, used_at: new Date().toISOString() };
      applyAvatarState([updated, ...rest], updated.url);
    },
    [history, applyAvatarState],
  );

  // ── Upload ─────────────────────────────────────────────────────────────────
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
        const ext = file.name.split(".").pop().toLowerCase();
        // Unique filename so each upload is its own object in Storage
        const path = `${profile.id}/avatar_${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        const url = `${urlData.publicUrl}?t=${Date.now()}`;

        const newEntry = { url, path, used_at: new Date().toISOString() };

        // Build new history: prepend, sort by used_at desc, cap at MAX_HISTORY
        const merged = [newEntry, ...history.filter((h) => h.path !== path)];
        const sorted = merged.sort((a, b) =>
          b.used_at.localeCompare(a.used_at),
        );
        const trimmed = sorted.slice(0, MAX_HISTORY);

        // If we evicted an entry, delete its file from Storage
        const evicted = sorted.slice(MAX_HISTORY);
        if (evicted.length > 0) {
          await supabase.storage
            .from("avatars")
            .remove(evicted.map((e) => e.path));
        }

        applyAvatarState(trimmed, url);
      } catch (err) {
        setUploadError(err.message ?? "Upload failed.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [profile, history, applyAvatarState],
  );

  // ── Remove a history entry ─────────────────────────────────────────────────
  const handleRemoveHistoryEntry = useCallback(
    async (entry) => {
      // Delete file from Storage
      await supabase.storage.from("avatars").remove([entry.path]);

      const newHistory = history.filter((h) => h.path !== entry.path);
      // If the removed entry was active, fall back to the next in history or null
      const newActiveUrl =
        activeUrl === entry.url ? (newHistory[0]?.url ?? null) : activeUrl;

      applyAvatarState(newHistory, newActiveUrl);
    },
    [history, activeUrl, applyAvatarState],
  );

  // ── Select emoji preset ────────────────────────────────────────────────────
  const handleSelectEmoji = useCallback(
    (emoji) => {
      dispatch(updateSettings({ avatarUrl: null, profileIcon: emoji }));
      dispatch(updateLocalProfile({ avatar_url: null }));
      if (profile?.id) persistAvatarState(profile.id, history, null);
    },
    [profile, history, dispatch],
  );

  // ── Select initial colour ──────────────────────────────────────────────────
  const handleSelectInitialColor = useCallback(
    (color) => {
      dispatch(
        updateSettings({
          avatarUrl: null,
          profileIcon: initial,
          profileColor: color,
        }),
      );
      dispatch(updateLocalProfile({ avatar_url: null }));
      if (profile?.id) persistAvatarState(profile.id, history, null);
    },
    [profile, history, initial, dispatch],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SettingCard icon={faImage} title="Avatar" activeTheme={activeTheme}>
      {/* ── Active avatar preview + upload button ── */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-black text-white shadow-lg"
          style={{
            backgroundColor: activeUrl ? "transparent" : settings.profileColor,
          }}
        >
          {activeUrl ? (
            <img
              src={activeUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : activeIsEmoji ? (
            settings.profileIcon
          ) : (
            initial
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${activeTheme.button.accent2} disabled:opacity-50`}
          >
            {uploading ? "Uploading…" : "Upload new photo"}
          </button>
          {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* ── Row 1: Recent uploads ── */}
      <RowLabel activeTheme={activeTheme}>Recent uploads</RowLabel>
      {history.length === 0 ? (
        <p className={`${activeTheme.text.secondary} text-xs mb-4 italic`}>
          No uploads yet — use the button above.
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-2 mb-5">
          {history.map((entry) => (
            <AvatarThumb
              key={entry.path}
              url={entry.url}
              active={activeUrl === entry.url}
              onClick={() => touchHistoryEntry(entry)}
              onRemove={() => handleRemoveHistoryEntry(entry)}
              activeTheme={activeTheme}
            />
          ))}
        </div>
      )}

      {/* ── Row 2: Preset emojis ── */}
      <RowLabel activeTheme={activeTheme}>Preset icons</RowLabel>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {PRESET_EMOJIS.map((emoji) => (
          <AvatarThumb
            key={emoji}
            emoji={emoji}
            active={!activeUrl && settings.profileIcon === emoji}
            onClick={() => handleSelectEmoji(emoji)}
            activeTheme={activeTheme}
          />
        ))}
      </div>

      {/* ── Row 3: Initial on flat colour ── */}
      <RowLabel activeTheme={activeTheme}>Initial</RowLabel>
      <div className="grid grid-cols-5 gap-2">
        {INITIAL_COLORS.map((color) => (
          <AvatarThumb
            key={color}
            initial={initial}
            color={color}
            active={
              !activeUrl && !activeIsEmoji && settings.profileColor === color
            }
            onClick={() => handleSelectInitialColor(color)}
            activeTheme={activeTheme}
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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Small inline field: label + input + optional error + save button */
function FieldRow({
  label,
  inputProps,
  onSave,
  saveLabel,
  status,
  error,
  success,
  activeTheme,
}) {
  const btnText =
    {
      idle: saveLabel,
      saving: "Saving…",
      saved: "Saved ✓",
      error: "Try again",
    }[status] ?? saveLabel;
  return (
    <div className={`rounded-xl p-4 ${activeTheme.background.canvas}`}>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider ${activeTheme.text.secondary} mb-2`}
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          {...inputProps}
          className={`flex-1 rounded-lg px-3 py-2 text-sm border ${activeTheme.border.card} ${activeTheme.background.secondary} ${activeTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-sky-500`}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
          className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
            status === "saved"
              ? "bg-emerald-600/20 text-emerald-400"
              : status === "error"
                ? "bg-red-600/20 text-red-400"
                : activeTheme.button.accent2
          } disabled:opacity-50`}
        >
          {status === "saved" && (
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
          )}
          {btnText}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      {success && <p className="text-emerald-400 text-xs mt-1.5">{success}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Account (username · email · password)
// ─────────────────────────────────────────────────────────────────────────────

function AccountSection({ profile, activeTheme, dispatch }) {
  // ── Username ───────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameError, setUsernameError] = useState(null);

  // Keep input in sync if profile loads after mount
  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const handleSaveUsername = async () => {
    const clean = username.trim();
    if (!clean) {
      setUsernameError("Username cannot be empty.");
      return;
    }
    if (clean === profile?.username) {
      setUsernameError("That's already your username.");
      return;
    }
    if (clean.length < 3) {
      setUsernameError("Must be at least 3 characters.");
      return;
    }

    setUsernameError(null);
    setUsernameStatus("saving");
    try {
      // Check uniqueness (exclude self)
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", profile.id)
        .maybeSingle();

      if (existing) throw new Error("That username is already taken.");

      const { error } = await supabase
        .from("profiles")
        .update({ username: clean })
        .eq("id", profile.id);
      if (error) throw error;

      dispatch(updateLocalProfile({ username: clean }));
      setUsernameStatus("saved");
      setTimeout(() => setUsernameStatus("idle"), 2000);
    } catch (err) {
      setUsernameError(err.message);
      setUsernameStatus("error");
    }
  };

  // ── Email ──────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState(profile?.email ?? "");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  const handleSaveEmail = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      setEmailError("Email cannot be empty.");
      return;
    }
    if (clean === profile?.email) {
      setEmailError("That's already your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError(null);
    setEmailSuccess(null);
    setEmailStatus("saving");
    try {
      // updateUser sends a confirmation email to the NEW address automatically.
      // The change only takes effect after the user clicks the link — Supabase handles this.
      const { error } = await supabase.auth.updateUser({ email: clean });
      if (error) throw error;

      setEmailSuccess(
        `Confirmation sent to ${clean}. Your email will update once you click the link.`,
      );
      setEmailStatus("saved");
      setTimeout(() => setEmailStatus("idle"), 4000);
    } catch (err) {
      setEmailError(err.message);
      setEmailStatus("error");
    }
  };

  // ── Password ───────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("New password must differ from current.");
      return;
    }

    setPasswordStatus("saving");
    try {
      // Re-authenticate with current password to verify identity
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (reAuthError) throw new Error("Current password is incorrect.");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setPasswordSuccess("Password updated successfully.");
      setPasswordStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordStatus("idle");
        setPasswordSuccess(null);
      }, 3000);
    } catch (err) {
      setPasswordError(err.message);
      setPasswordStatus("error");
    }
  };

  return (
    <SettingCard icon={faUser} title="Account" activeTheme={activeTheme}>
      <div className="space-y-4">
        {/* Username */}
        <FieldRow
          label="Username"
          inputProps={{
            type: "text",
            value: username,
            onChange: (e) => {
              setUsername(e.target.value);
              setUsernameStatus("idle");
              setUsernameError(null);
            },
            placeholder: "your_username",
            autoComplete: "off",
          }}
          onSave={handleSaveUsername}
          saveLabel="Update"
          status={usernameStatus}
          error={usernameError}
          activeTheme={activeTheme}
        />

        {/* Email */}
        <FieldRow
          label="Email"
          inputProps={{
            type: "email",
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
              setEmailStatus("idle");
              setEmailError(null);
              setEmailSuccess(null);
            },
            placeholder: "you@example.com",
            autoComplete: "off",
          }}
          onSave={handleSaveEmail}
          saveLabel="Update"
          status={emailStatus}
          error={emailError}
          success={emailSuccess}
          activeTheme={activeTheme}
        />

        {/* Password — three sub-fields stacked, single save button */}
        <div className={`rounded-xl p-4 ${activeTheme.background.canvas}`}>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.secondary} mb-3`}
          >
            <FontAwesomeIcon icon={faLock} className="mr-1.5" />
            Change Password
          </p>
          <div className="space-y-2">
            {[
              {
                placeholder: "Current password",
                value: currentPassword,
                setter: setCurrentPassword,
              },
              {
                placeholder: "New password",
                value: newPassword,
                setter: setNewPassword,
              },
              {
                placeholder: "Confirm new password",
                value: confirmPassword,
                setter: setConfirmPassword,
              },
            ].map(({ placeholder, value, setter }) => (
              <input
                key={placeholder}
                type="password"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  setPasswordStatus("idle");
                  setPasswordError(null);
                }}
                autoComplete="new-password"
                className={`w-full rounded-lg px-3 py-2 text-sm border ${activeTheme.border.card} ${activeTheme.background.secondary} ${activeTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            ))}
          </div>
          {passwordError && (
            <p className="text-red-400 text-xs mt-2">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-emerald-400 text-xs mt-2">{passwordSuccess}</p>
          )}
          <button
            type="button"
            onClick={handleSavePassword}
            disabled={passwordStatus === "saving"}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold ${
              passwordStatus === "saved"
                ? "bg-emerald-600/20 text-emerald-400"
                : passwordStatus === "error"
                  ? "bg-red-600/20 text-red-400"
                  : activeTheme.button.accent2
            } disabled:opacity-50`}
          >
            {passwordStatus === "saved" && (
              <FontAwesomeIcon icon={faCheck} className="mr-1" />
            )}
            {
              {
                idle: "Update password",
                saving: "Saving…",
                saved: "Updated ✓",
                error: "Try again",
              }[passwordStatus]
            }
          </button>
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
