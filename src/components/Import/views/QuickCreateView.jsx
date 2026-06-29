import React from "react";
import { useNavigate } from "react-router-dom";
import { ModalTemplate } from "../../General/ui/ModalTemplate"; // Import template
import { NewDeck } from "../components/NewDeck";
import { CopyDeck } from "../components/CopyDeck";

export default function QuickCreateView({ activeTheme, mode, onClose }) {
  const navigate = useNavigate();

  if (mode !== "new" && mode !== "clone") return null;

  const handleDeckCreated = (deckId) => {
    onClose();
    navigate(`/decks/${deckId}`);
  };

  const isNew = mode === "new";

  return (
    <ModalTemplate
      isOpen={true} // Controlled directly by mount state here
      onClose={onClose}
      title={isNew ? "New Deck" : "Create from deck"}
      subtitle={
        isNew
          ? "Create an empty deck and add cards later."
          : "Select a deck and configure your copy options."
      }
      activeTheme={activeTheme}
    >
      {isNew ? (
        <NewDeck activeTheme={activeTheme} onCreated={handleDeckCreated} />
      ) : (
        <CopyDeck activeTheme={activeTheme} onCreated={handleDeckCreated} />
      )}
    </ModalTemplate>
  );
}
