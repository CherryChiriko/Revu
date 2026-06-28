import React from "react";
import DeckConfirmationDialog from "./DeckConfirmationDialog";

export default function DeckDelete({
  deckData,
  activeTheme,
  onConfirm,
  onCancel,
}) {
  if (!deckData) return null;

  return (
    /* Backdrop — full screen, above navbar (z-50) */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
    >
      {/* Panel — stop clicks bubbling to backdrop */}
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <DeckConfirmationDialog
          deckName={deckData.name}
          activeTheme={activeTheme}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
