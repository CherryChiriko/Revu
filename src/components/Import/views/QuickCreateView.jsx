import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { NewDeck } from "../components/NewDeck";
import { CopyDeck } from "../components/CopyDeck";

export default function QuickCreateView({ activeTheme, mode, onClose }) {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
  };

  const handleDeckCreated = (deckId) => {
    handleClose();
    navigate(`/decks/${deckId}`);
  };

  if (mode !== "new" && mode !== "clone") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{
        backgroundColor: activeTheme.isDark
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(15, 23, 42, 0.3)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border
        ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between px-6 pt-6 pb-2 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex flex-col text-left">
            <h2
              className={`text-lg font-bold tracking-tight leading-tight ${activeTheme.text.primary}`}
            >
              {mode === "new" ? "New Deck" : "Create From Deck"}
            </h2>
            <p
              className={`text-xs mt-1 leading-snug font-medium ${activeTheme.text.muted}`}
            >
              {mode === "new"
                ? "Create an empty deck and add cards later."
                : "Create a new deck from a copy of an existing one."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-colors outline-none focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
            aria-label="close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 block" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4">
          {mode === "new" ? (
            <NewDeck activeTheme={activeTheme} onCreated={handleDeckCreated} />
          ) : (
            <CopyDeck
              activeTheme={activeTheme}
              isOpen={true}
              onClose={handleClose}
              onCreated={handleDeckCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
