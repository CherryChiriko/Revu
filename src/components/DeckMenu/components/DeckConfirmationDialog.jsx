import React from "react";

export default function DeckConfirmationDialog({
  deckName,
  activeTheme,
  onConfirm,
  onCancel,
  isToast = false,
}) {
  return (
    <div className="flex flex-col ">
      <p className={`text-sm font-semibold ${activeTheme.text.primary}`}>
        Permanently delete{" "}
        <span className="font-semibold">"{deckName || "this deck"}"</span> and
        all its cards?
      </p>
      <p className={`${activeTheme.text.muted} text-sm`}>
        This action cannot be undone.
      </p>

      {(onConfirm || onCancel) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`rounded-full border ${activeTheme.border.danger} ${activeTheme.text.danger} px-4 py-2 text-sm transition hover:bg-red-50 dark:hover:bg-red-900/40`}
            >
              Cancel
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className={`rounded-full ${activeTheme.button.danger} px-4 py-2 text-sm font-semibold`}
            >
              Delete deck
            </button>
          )}
        </div>
      )}
    </div>
  );
}
