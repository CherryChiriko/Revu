import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export function SettingCard({
  icon,
  title,
  children,
  activeTheme,
  onSave,
  saveState,
  saveLabel, // optional: overrides the idle button label (default "Save")
}) {
  const hasSave = Boolean(onSave);

  const btnText =
    {
      idle: saveLabel ?? "Save",
      saving: "Saving…",
      saved: "Saved",
      error: "Try again",
    }[saveState] ??
    saveLabel ??
    "Save";

  return (
    <section
      className={`flex flex-col ${activeTheme.background.secondary} border ${activeTheme.border.card} relative z-10 rounded-2xl shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div
          className={`w-10 h-10 rounded-xl ${activeTheme.background.track} flex items-center justify-center shrink-0`}
        >
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-4 space-y-6">{children}</div>

      {/* Save / action button — only rendered when onSave is provided */}
      {hasSave && (
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === "saving"}
            className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50
              ${
                saveState === "saved"
                  ? "bg-emerald-600/20 text-emerald-400"
                  : saveState === "error"
                    ? "bg-red-600/20 text-red-400"
                    : activeTheme.button.accent2
              }`}
          >
            {saveState === "saved" && (
              <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
            )}
            {btnText}
          </button>
        </div>
      )}
    </section>
  );
}
