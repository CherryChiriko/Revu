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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl flex flex-col text-left ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfirmationDialog
          activeTheme={activeTheme}
          variant="danger"
          title={`Permanently delete "${deckData.name || "this deck"}" and all its cards?`}
          description="This action cannot be undone."
          confirmText="Delete deck"
          cancelText="Cancel"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
