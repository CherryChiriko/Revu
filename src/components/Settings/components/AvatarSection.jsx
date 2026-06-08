import React, { useRef, useState, useCallback, useMemo } from "react";

import { supabase } from "../../../utils/supabaseClient";
import { SettingCard } from "../SettingsTemplates";

import { updateLocalProfile } from "../../../slices/userSlice";
import { updateSettings } from "../../../slices/settingsSlice";

import { faImage } from "@fortawesome/free-solid-svg-icons";

import { persistAvatarState } from "../hooks/useSettings";

import { RowLabel, AvatarThumb } from "../SettingsTemplates";
// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// 5 background colour options for the initials avatar
const INITIAL_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f97316", "#e11d48"];

// Exactly 5 preset emojis
const PRESET_EMOJIS = ["🐉", "🦊", "🐼", "🦁", "🐸"];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_HISTORY = 5;

export function AvatarSection({ profile, settings, activeTheme, dispatch }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const history = useMemo(
    () => settings.avatarHistory ?? [],
    [settings.avatarHistory],
  ); // [{ url, path, used_at }]
  const activeUrl = settings.avatarUrl;
  const initial = (profile?.username?.[0] ?? "R").toUpperCase();

  // Determine which "type" is currently active for the preview
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
