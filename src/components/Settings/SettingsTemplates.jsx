import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

// ─────────────────────────────────────────────────────────────────────────────
// SettingCard
// ─────────────────────────────────────────────────────────────────────────────

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
      className={`flex flex-col ${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl shadow-lg overflow-hidden`}
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
        <div className="px-5 py-5">
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

export function Toggle({ checked, onChange, label, description, activeTheme }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className={`${activeTheme.text.muted} text-xs mt-3`}>
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

export function SegmentButton({ active, children, onClick, activeTheme }) {
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

export function LabelledSlider({
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

export function FieldRow({
  label,
  inputProps,
  onSave,
  status,
  error,
  success,
  activeTheme,
}) {
  const btnText = {
    idle: "Save",
    saving: "Saving…",
    saved: "Saved",
    error: "Try again",
  }[status];

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
      {error && <p className="text-red-400    text-xs mt-1.5">{error}</p>}
      {success && <p className="text-emerald-400 text-xs mt-1.5">{success}</p>}
    </div>
  );
}

export function RowLabel({ children, activeTheme }) {
  return (
    <p
      className={`${activeTheme.text.secondary} text-xs font-semibold uppercase tracking-wider mb-2`}
    >
      {children}
    </p>
  );
}

export function AvatarThumb({
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
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        >
          ✕
        </button>
      )}
    </div>
  );
}
