import React from "react";

export default function DeckDelete({
  deckData,
  activeTheme,
  onConfirm,
  onCancel,
}) {
  if (!deckData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl flex flex-col text-left ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`text-sm font-semibold ${activeTheme.text.primary}`}>
          Permanently delete{" "}
          <span className="font-bold">"{deckData.name || "this deck"}"</span>{" "}
          and all its cards?
        </p>
        <p className={`${activeTheme.text.muted} text-xs mt-1 leading-snug`}>
          This action destroys database indices immediately and cannot be
          undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.secondary} px-4 py-2 text-xs font-bold transition hover:${activeTheme.background.canvas}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl ${activeTheme.button.danger ?? "bg-red-600 text-white"} px-4 py-2 text-xs font-bold transition-all`}
          >
            Delete deck
          </button>
        </div>
      </div>
    </div>
  );
}
