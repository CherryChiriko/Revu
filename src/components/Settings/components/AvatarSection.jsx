import React, { useRef, useState, useCallback, useMemo } from "react";

import { supabase } from "../../../utils/supabaseClient";
import { SettingCard } from "../SettingsTemplates";

import { updateLocalProfile } from "../../../slices/userSlice";
import { updateSettings } from "../../../slices/settingsSlice";

import { faImage, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { persistAvatarState } from "../hooks/useSettings";

import { RowLabel, AvatarThumb } from "../SettingsTemplates";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f97316", "#e11d48"];
const PRESET_EMOJIS = ["🐉", "🦊", "🐼", "🦁", "🐸"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_HISTORY = 5;

export function AvatarSection({ profile, settings, activeTheme, dispatch }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Track collapsed state for each section key
  const [collapsedSections, setCollapsedSections] = useState({
    recent: true,
    presets: true,
    initials: true,
  });

  const history = useMemo(
    () => settings.avatarHistory ?? [],
    [settings.avatarHistory],
  );
  const activeUrl = settings.avatarUrl;
  const initial = (profile?.username?.[0] ?? "R").toUpperCase();

  const activeIsEmoji =
    !activeUrl && PRESET_EMOJIS.includes(settings.profileIcon);

  // ── Callbacks ──────────────────────────────────────────────────────────────

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

  const touchHistoryEntry = useCallback(
    (entry) => {
      const rest = history.filter((h) => h.path !== entry.path);
      const updated = { ...entry, used_at: new Date().toISOString() };
      applyAvatarState([updated, ...rest], updated.url);
    },
    [history, applyAvatarState],
  );

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

        const merged = [newEntry, ...history.filter((h) => h.path !== path)];
        const sorted = merged.sort((a, b) =>
          b.used_at.localeCompare(a.used_at),
        );
        const trimmed = sorted.slice(0, MAX_HISTORY);

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

  const handleRemoveHistoryEntry = useCallback(
    async (entry) => {
      await supabase.storage.from("avatars").remove([entry.path]);

      const newHistory = history.filter((h) => h.path !== entry.path);
      const newActiveUrl =
        activeUrl === entry.url ? (newHistory[0]?.url ?? null) : activeUrl;

      applyAvatarState(newHistory, newActiveUrl);
    },
    [history, activeUrl, applyAvatarState],
  );

  const toggleSection = useCallback((sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  // ── Configuration Array ────────────────────────────────────────────────────

  const sectionsConfig = useMemo(() => {
    return [
      {
        key: "recent",
        title: "Recent uploads",
        isEmpty: history.length === 0,
        items: history,
        renderItem: (entry) => (
          <AvatarThumb
            key={entry.path}
            url={entry.url}
            active={activeUrl === entry.url}
            onClick={() => touchHistoryEntry(entry)}
            onRemove={() => handleRemoveHistoryEntry(entry)}
            activeTheme={activeTheme}
          />
        ),
      },
      {
        key: "presets",
        title: "Preset icons",
        isEmpty: false,
        items: PRESET_EMOJIS,
        renderItem: (emoji) => (
          <AvatarThumb
            key={emoji}
            emoji={emoji}
            active={!activeUrl && settings.profileIcon === emoji}
            onClick={() => {
              dispatch(updateSettings({ avatarUrl: null, profileIcon: emoji }));
              dispatch(updateLocalProfile({ avatar_url: null }));
              if (profile?.id) persistAvatarState(profile.id, history, null);
            }}
            activeTheme={activeTheme}
          />
        ),
      },
      {
        key: "initials",
        title: "Initial",
        isEmpty: false,
        items: INITIAL_COLORS,
        renderItem: (color) => (
          <AvatarThumb
            key={color}
            initial={initial}
            color={color}
            active={
              !activeUrl && !activeIsEmoji && settings.profileColor === color
            }
            onClick={() => {
              dispatch(
                updateSettings({
                  avatarUrl: null,
                  profileIcon: initial,
                  profileColor: color,
                }),
              );
              dispatch(updateLocalProfile({ avatar_url: null }));
              if (profile?.id) persistAvatarState(profile.id, history, null);
            }}
            activeTheme={activeTheme}
          />
        ),
      },
    ];
  }, [
    history,
    settings,
    activeUrl,
    activeIsEmoji,
    initial,
    activeTheme,
    profile,
    dispatch,
    touchHistoryEntry,
    handleRemoveHistoryEntry,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SettingCard icon={faImage} title="Avatar" activeTheme={activeTheme}>
      {/* ── Active avatar preview + upload button ── */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-black text-white shadow-lg"
          style={{
            backgroundColor: activeUrl ? "transparent" : settings.profileColor,
          }}
        >
          {activeUrl ? (
            <img
              src={activeUrl}
              alt="icon"
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

      {/* ── Dynamic Layout Sections ── */}
      <div className="flex flex-col gap-3">
        {sectionsConfig.map((section) => {
          const isCollapsed = collapsedSections[section.key];

          return (
            <div key={section.key}>
              {/* Header / Toggle Trigger */}
              {!section.isEmpty && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="flex items-center justify-between w-full text-left group mb-2 focus:outline-none"
                >
                  <RowLabel
                    activeTheme={activeTheme}
                    className="!mb-0 pointer-events-none"
                  >
                    {section.title}
                  </RowLabel>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs transition-transform duration-200 ${
                      activeTheme.text.secondary
                    } ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>
              )}

              {/* Collapsible Content */}
              {/* {!isCollapsed && (
                <div className="transition-all duration-200">
                  {!section.isEmpty && (
                    <div className="grid grid-cols-5 gap-2">
                      {section.items.map((item) => section.renderItem(item))}
                    </div>
                  )}
                </div>
              )} */}
              {!isCollapsed && (
                <div className="transition-all duration-200">
                  <div className="grid grid-cols-5 gap-2">
                    {section.items.map((item) => section.renderItem(item))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SettingCard>
  );
}
