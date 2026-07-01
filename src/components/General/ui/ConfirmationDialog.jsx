import React from "react";

export default function ConfirmationDialog({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  activeTheme,
  variant = "danger", // "danger" | "warning" | "primary"
  positionMode = "fixed", // Defaulted to full-screen window layer
  maxWidth = "max-w-sm", // Layout size control panel
}) {
  const isFixed = positionMode === "fixed";

  // Resolve action color variants based on application theme
  const actionButtonCls =
    variant === "danger"
      ? (activeTheme.button.danger ?? "bg-red-600 text-white")
      : "bg-amber-600 text-white";

  return (
    <div
      className={`${isFixed ? "fixed" : "absolute"} inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border p-6 shadow-2xl flex flex-col text-left ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        onClick={(e) => e.stopPropagation()} // Keeps clicks inside from triggering onCancel
      >
        <div className={`text-sm font-semibold ${activeTheme.text.primary}`}>
          {title}
        </div>

        {description && (
          <p className={`${activeTheme.text.muted} text-xs mt-1 leading-snug`}>
            {description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.secondary} px-4 py-2 text-xs font-bold transition hover:${activeTheme.background.canvas}`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl ${actionButtonCls} px-4 py-2 text-xs font-bold transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
