// src/components/DeckMenu/components/DeckDelete.jsx
import React from "react";
import ConfirmationDialog from "../../General/ui/ConfirmationDialog";

export default function DeckDelete({
  deckData,
  activeTheme,
  onConfirm,
  onCancel,
}) {
  if (!deckData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 backdrop-blur-[2px]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-sm rounded-xl md:rounded-2xl border p-4 md:p-6 shadow-2xl flex flex-col text-left ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfirmationDialog
          activeTheme={activeTheme}
          variant="danger"
          title={`Delete "${deckData.name || "this deck"}"?`}
          description="This deck and all its cards will be permanently removed. This cannot be undone."
          confirmText="Delete deck"
          cancelText="Cancel"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
