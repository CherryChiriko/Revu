import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUpload } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../utils/supabaseClient";
import { SettingCard } from "../SettingsTemplates";
import { updateSettings } from "../../../slices/settingsSlice";
import { updateLocalProfile } from "../../../slices/userSlice";
import { persistAvatarState } from "../hooks/useSettings";
import { AvatarPick } from "./AvatarPick";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_HISTORY = 5;

export function AvatarSection({ profile, settings, activeTheme, dispatch }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const history = settings.avatarHistory ?? [];
  const activeUrl = settings.avatarUrl;
  const activeIcon = settings.avatarIcon ?? "";
  const activeColor = settings.profileColor ?? "#6366f1";
  const initial = (profile?.username?.[0] ?? "?").toUpperCase();
  const isPhotoMode = !!activeUrl;
  const isPresetMode = !isPhotoMode && activeIcon?.startsWith("/avatars/");

  // Quick upload directly from the section (mirrors the modal upload flow)
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

        dispatch(updateSettings({ avatarUrl: url, avatarHistory: trimmed }));
        dispatch(
          updateLocalProfile({ avatar_url: url, avatar_history: trimmed }),
        );
        if (profile?.id)
          persistAvatarState(profile.id, trimmed, url, activeIcon, activeColor);
      } catch (err) {
        setUploadError(err.message ?? "Upload failed.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [profile, history, activeIcon, activeColor, dispatch],
  );

  return (
    <>
      <SettingCard icon={faImage} title="Avatar" activeTheme={activeTheme}>
        <div className="flex items-center gap-4">
          {/* ── Avatar preview ── */}
          <div
            className="size-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-black text-white shadow-lg"
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

          {/* ── Actions to the right ── */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
            >
              Customize
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
            >
              <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            {uploadError && (
              <p className="text-xs text-red-400">{uploadError}</p>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </SettingCard>

      <AvatarPick
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        profile={profile}
        settings={settings}
        activeTheme={activeTheme}
      />
    </>
  );
}
