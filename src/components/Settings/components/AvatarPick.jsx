import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../utils/supabaseClient";
import { updateSettings } from "../../../slices/settingsSlice";
import { updateLocalProfile } from "../../../slices/userSlice";
import { persistAvatarState } from "../hooks/useSettings";
import { ModalTemplate } from "../../General/ui/ModalTemplate";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_AVATARS = Array.from(
  { length: 10 },
  (_, i) => `/avatars/avatar${i + 1}.png`,
);

const PALETTE = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#14b8a6", // teal
  "#22c55e", // green
  "#f97316", // orange
  "#e11d48", // rose
  "#f59e0b", // amber
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_HISTORY = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionTitle = ({ children, activeTheme }) => (
  <p
    className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${activeTheme.text.muted}`}
  >
    {children}
  </p>
);

/** Thin selection ring overlaid on a grid item */
const Ring = ({ active, activeTheme }) =>
  active ? (
    <span
      className={`absolute inset-0 rounded-xl ring-2 ring-offset-1 ${activeTheme.ring.focus} pointer-events-none`}
    />
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────

export function AvatarPick({
  isOpen,
  onClose,
  profile,
  settings,
  activeTheme,
}) {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const history = settings.avatarHistory ?? [];
  const activeUrl = settings.avatarUrl; // null = icon mode
  const activeIcon = settings.avatarIcon ?? ""; // letter/emoji
  const activeColor = settings.profileColor ?? "#6366f1";
  const initial = (profile?.username?.[0] ?? "?").toUpperCase();

  // ── Unified state updater ─────────────────────────────────────────────────

  const apply = useCallback(
    ({ url = null, history: hist, icon, color } = {}) => {
      const nextHistory = hist ?? history;
      const nextUrl = url ?? null;
      const nextIcon = icon ?? activeIcon;
      const nextColor = color ?? activeColor;

      dispatch(
        updateSettings({
          avatarUrl: nextUrl,
          avatarHistory: nextHistory,
          avatarIcon: nextIcon,
          profileColor: nextColor,
        }),
      );
      dispatch(
        updateLocalProfile({
          avatar_url: nextUrl,
          avatar_history: nextHistory,
          avatar_icon: nextIcon,
          avatar_color: nextColor,
        }),
      );
      if (profile?.id)
        persistAvatarState(
          profile.id,
          nextHistory,
          nextUrl,
          nextIcon,
          nextColor,
        );
    },
    [dispatch, profile, history, activeIcon, activeColor],
  );

  // ── Photo upload ──────────────────────────────────────────────────────────

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

        const merged = [
          { url, path, used_at: new Date().toISOString() },
          ...history.filter((h) => h.path !== path),
        ].sort((a, b) => b.used_at.localeCompare(a.used_at));
        const trimmed = merged.slice(0, MAX_HISTORY);
        const evicted = merged.slice(MAX_HISTORY);

        if (evicted.length > 0)
          await supabase.storage
            .from("avatars")
            .remove(evicted.map((e) => e.path));

        // Uploaded photos: no background color applied — pass null for url, keep icon/color unchanged
        apply({ url, history: trimmed });
      } catch (err) {
        setUploadError(err.message ?? "Upload failed.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [profile, history, apply],
  );

  const removeHistoryEntry = useCallback(
    async (entry) => {
      await supabase.storage.from("avatars").remove([entry.path]);
      const nextHistory = history.filter((h) => h.path !== entry.path);
      const nextUrl =
        activeUrl === entry.url ? (nextHistory[0]?.url ?? null) : activeUrl;
      apply({ url: nextUrl, history: nextHistory });
    },
    [history, activeUrl, apply],
  );

  const selectHistoryEntry = useCallback(
    (entry) => {
      const rest = history.filter((h) => h.path !== entry.path);
      const updated = { ...entry, used_at: new Date().toISOString() };
      apply({ url: updated.url, history: [updated, ...rest] });
    },
    [history, apply],
  );

  // ── Preset avatar (transparent PNG — color shows through) ─────────────────

  const selectPreset = useCallback(
    (presetUrl) => {
      // Switch to icon mode (no photo URL), use the preset path as the icon value
      apply({ url: null, icon: presetUrl });
    },
    [apply],
  );

  // ── Color ─────────────────────────────────────────────────────────────────

  const selectColor = useCallback(
    (color) => {
      apply({ color });
    },
    [apply],
  );

  // ── Custom icon/letter ────────────────────────────────────────────────────

  const setIcon = useCallback(
    (value) => {
      // Take only first grapheme (handles emoji correctly)
      const trimmed = [...value.trim()].slice(0, 1).join("") || initial;
      apply({ url: null, icon: trimmed });
    },
    [apply, initial],
  );

  // ── Derived display state ─────────────────────────────────────────────────

  const isPhotoMode = !!activeUrl;
  // In icon mode, check if the icon is a preset path
  const isPresetMode = !isPhotoMode && activeIcon?.startsWith("/avatars/");
  const isInitialMode = !isPhotoMode && !isPresetMode;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Choose avatar"
      subtitle="Customize your icon and background color."
      activeTheme={activeTheme}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* ── Live preview ── */}
        <div
          className={`flex items-center justify-center py-4 rounded-xl ${activeTheme.background.canvas}`}
        >
          <div
            className="size-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-black text-white shadow-lg transition-all duration-200"
            style={{
              backgroundColor: isPhotoMode ? "transparent" : activeColor,
            }}
          >
            {isPhotoMode ? (
              <img
                src={activeUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : isPresetMode ? (
              <img
                src={activeIcon}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              activeIcon || initial
            )}
          </div>
        </div>

        {/* ── Background color — hidden for uploaded photos ── */}
        {!isPhotoMode && (
          <div>
            <SectionTitle activeTheme={activeTheme}>
              Background color
            </SectionTitle>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => selectColor(color)}
                  aria-label={color}
                  className="relative size-9 rounded-xl focus:outline-none hover:scale-105 transition-transform active:scale-95"
                  style={{ backgroundColor: color }}
                >
                  {activeColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white text-xs drop-shadow"
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Custom letter / emoji ── */}
        <div>
          <SectionTitle activeTheme={activeTheme}>Letter or emoji</SectionTitle>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={isInitialMode ? activeIcon || initial : ""}
              onChange={(e) => setIcon(e.target.value)}
              placeholder={initial}
              maxLength={2}
              className={`w-16 text-center text-lg font-bold rounded-xl px-2 py-2 border outline-none focus:ring-2 transition-all ${activeTheme.background.canvas} ${activeTheme.text.primary} ${activeTheme.border.secondary} ${activeTheme.ring.focus}`}
            />
            <p className={`text-xs ${activeTheme.text.muted}`}>
              Type a letter or paste an emoji — it will appear on your chosen
              background.
            </p>
          </div>
        </div>

        {/* ── Preset avatars ── */}
        <div>
          <SectionTitle activeTheme={activeTheme}>Preset avatars</SectionTitle>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AVATARS.map((url) => (
              <button
                key={url}
                onClick={() => selectPreset(url)}
                className="relative aspect-square rounded-xl overflow-hidden focus:outline-none hover:opacity-90 transition-opacity"
                style={{ backgroundColor: activeColor }}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <Ring
                  active={isPresetMode && activeIcon === url}
                  activeTheme={activeTheme}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Upload section ── */}
        <div>
          <SectionTitle activeTheme={activeTheme}>Upload photo</SectionTitle>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
            >
              <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            {uploadError && (
              <p className="text-xs text-red-400">{uploadError}</p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />

          {/* Upload history */}
          {history.length > 0 && (
            <div className="grid grid-cols-6 gap-2 mt-3">
              {history.map((entry) => (
                <div key={entry.path} className="relative group">
                  <button
                    onClick={() => selectHistoryEntry(entry)}
                    className="relative w-full aspect-square rounded-xl overflow-hidden focus:outline-none"
                  >
                    <img
                      src={entry.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <Ring
                      active={activeUrl === entry.url}
                      activeTheme={activeTheme}
                    />
                  </button>
                  <button
                    onClick={() => removeHistoryEntry(entry)}
                    aria-label="Remove"
                    className="absolute -top-1 -right-1 size-4 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalTemplate>
  );
}
