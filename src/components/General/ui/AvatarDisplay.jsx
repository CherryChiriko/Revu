import React from "react";

/**
 * Renders the correct avatar based on settings state.
 *
 * Priority:
 * 1. avatarUrl set → uploaded photo (no background color)
 * 2. avatarIcon starts with "/avatars/" → preset PNG on profileColor background
 * 3. Otherwise → letter/emoji on profileColor background
 *
 * Use this everywhere an avatar is displayed so the logic stays in one place.
 */
export function AvatarDisplay({
  settings,
  username,
  className = "",
  style = {},
}) {
  const avatarUrl = settings.avatarUrl;
  const avatarIcon = settings.avatarIcon ?? "";
  const color = settings.profileColor ?? "#6366f1";
  const fallback = (username?.[0] ?? "?").toUpperCase();

  const isPhoto = !!avatarUrl;
  const isPreset = !isPhoto && avatarIcon.startsWith("/avatars/");
  const bgColor = isPhoto ? "transparent" : color;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden font-black text-white ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      {isPhoto ? (
        <img
          src={avatarUrl}
          alt={`${username ?? "user"} avatar`}
          className="w-full h-full object-cover"
        />
      ) : isPreset ? (
        <img
          src={avatarIcon}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{avatarIcon || fallback}</span>
      )}
    </div>
  );
}
