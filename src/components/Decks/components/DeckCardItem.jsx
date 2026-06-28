import React from "react";
import useDeckLogic from "../hooks/useDeckLogic";
import FullVariant from "./variants/FullVariant";
import CompactVariant from "./variants/CompactVariant";
import DeckDelete from "../../DeckMenu/components/DeckDelete";

function DeckCardItem({ deck, activeTheme, variant, toast, highlightedId }) {
  const logic = useDeckLogic(deck.id, deck.cards_count || 0, {
    toast,
    activeTheme,
  });

  if (!deck || !logic) return null;

  // Check against both deck_id and id to cover all configurations
  const isHighlighted =
    highlightedId &&
    (String(deck.id) === String(highlightedId) ||
      String(deck.deck_id) === String(highlightedId));

  const glowColor = activeTheme.gradients?.colors?.[4] || "#6366f1";

  const base = `rounded-xl border shadow-md transition-all duration-300 p-6 shadow-xl 
    cursor-pointer ${activeTheme.border.card}
    ${activeTheme.background.secondary} ${activeTheme.text.primary}
    ${logic.isMastered ? "opacity-60" : "hover:shadow-xl hover:-translate-y-1"}
    ${
      /* Pure Tailwind Highlight State: Green ring, glow shadow, scaling up, and a subtle entry pulse */
      isHighlighted
        ? `ring-4 ${activeTheme.ring?.focus || "ring-indigo-500"} shadow-[0_0_35px_${glowColor}80] scale-[1.03] -translate-y-1 animate-pulse`
        : "hover:shadow-2xl hover:-translate-y-1 transform"
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
    <>
      <div className={base} onClick={logic.handleCardClick}>
        <Content deck={deck} activeTheme={activeTheme} logic={logic} />
      </div>

      <DeckDelete
        deckData={logic.pendingDeleteDeck}
        activeTheme={activeTheme}
        onConfirm={logic.onConfirmDelete}
        onCancel={logic.onCancelDelete}
      />
    </>
  );
}

export default DeckCardItem;
