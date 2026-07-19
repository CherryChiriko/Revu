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
  saveLabel,
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
      className={`flex flex-col ${activeTheme.background.secondary} border ${activeTheme.border.card} relative z-10 rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden`}
    >
      {/* Header — Desktop bottom padding reduced from pb-4 to md:pb-1 */}
      <div className="flex items-center gap-2 md:gap-3 px-3 pt-3 pb-2 md:px-5 md:pt-5 md:pb-1">
        <div
          className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${activeTheme.background.track} flex items-center justify-center shrink-0`}
        >
          <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
        <h2 className="text-sm md:text-lg font-bold truncate">{title}</h2>
      </div>

      {/* Body — Desktop vertical gap modified from space-y-6 to md:space-y-4 */}
      <div className="flex-1 px-3 pb-3 md:px-5 md:pb-5 space-y-3 md:space-y-4">
        {children}
      </div>

      {/* Save button */}
      {hasSave && (
        <div className="px-3 py-3 md:px-5 md:py-4">
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
