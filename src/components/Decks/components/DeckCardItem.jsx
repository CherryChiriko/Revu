import React from "react";
import useDeckLogic from "../hooks/useDeckLogic";
import FullVariant from "./variants/FullVariant";
import CompactVariant from "./variants/CompactVariant";

function DeckCardItem({ deck, activeTheme, variant, toast }) {
  const logic = useDeckLogic(deck.id, deck.cards_count || 0, {
    toast,
    activeTheme,
  });

  if (!deck || !logic) return null;

  const base = `rounded-xl border shadow-md transition-all duration-300 p-6 shadow-xl 
      hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 
      cursor-pointer ${activeTheme.border.card}
     ${activeTheme.background.secondary} ${activeTheme.text.primary}
     ${
       logic.isMastered ? "opacity-60" : "hover:shadow-xl hover:-translate-y-1"
     }`;

  let Content;
  switch (variant) {
    case "full":
      Content = FullVariant;
      break;
    case "compact":
      Content = CompactVariant;
      break;
    default:
      Content = null;
      break;
  }

  return (
    <div className={base} onClick={logic.handleCardClick}>
      <Content deck={deck} activeTheme={activeTheme} logic={logic} />
    </div>
  );
}

export default DeckCardItem;
