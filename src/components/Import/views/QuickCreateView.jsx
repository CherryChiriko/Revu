import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { NewDeck } from "../components/NewDeck";
// import { CloneDeck } from "../components/CloneDeck";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border
        ${activeTheme.background.secondary} ${activeTheme.border.card}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
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
                ? "Create an empty deck and add cards manually."
                : "Swap columns, convert formats, or extract your hardest cards."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-colors 
      hover:bg-black/5 dark:hover:bg-white/10 
      focus:outline-none focus:ring-2 focus:ring-violet-400/40
      ${activeTheme.text.secondary}`}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 block" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {mode === "new" ? (
            <NewDeck activeTheme={activeTheme} onCreated={handleDeckCreated} />
          ) : (
            <></>
            // <CloneDeck activeTheme={activeTheme} onCreated={handleDeckCreated} />
          )}
        </div>
      </div>
    </div>
  );
}
