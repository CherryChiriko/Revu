import React from "react";
import useDeckLogic from "../hooks/useDeckLogic";
import FullVariant from "./variants/FullVariant";
import CompactVariant from "./variants/CompactVariant";
import DeckDelete from "../../DeckMenu/components/DeckDelete";
import ListVariant from "./variants/ListVariant";

function DeckCardItem({ deck, activeTheme, variant, toast, highlightedId }) {
  const logic = useDeckLogic(deck.id, deck.cards_count || 0, {
    toast,
    activeTheme,
  });

  if (!deck || !logic) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  if (isMobile) {
    variant = "list";
  }

  const isHighlighted =
    highlightedId &&
    (String(deck.id) === String(highlightedId) ||
      String(deck.deck_id) === String(highlightedId));

  const glowColor = activeTheme.gradients?.colors?.[4] || "#6366f1";
  const isList = variant === "list";

  // Mobile list: compact padding, fixed width for horizontal snap scroll
  // Desktop: spacious card with hover lift
  const base = `
    rounded-xl border shadow-md transition-all duration-300 cursor-pointer
    ${activeTheme.border.card}
    ${activeTheme.background.secondary}
    ${activeTheme.text.primary}
    ${logic.isMastered ? "opacity-60" : ""}
    ${isList ? "p-3.5 w-[82vw] max-w-[320px] shrink-0 snap-center select-none" : "p-6 hover:shadow-xl hover:-translate-y-1"}
    ${
      isHighlighted && !isList
        ? `ring-4 ${activeTheme.ring?.focus || "ring-indigo-500"} shadow-[0_0_35px_${glowColor}80] scale-[1.03] -translate-y-1 animate-pulse`
        : isHighlighted && isList
          ? `ring-2 ${activeTheme.ring?.focus || "ring-indigo-500"}`
          : ""
    }
  `;

  let Content;
  switch (variant) {
    case "full":
      Content = FullVariant;
      break;
    case "compact":
      Content = CompactVariant;
      break;
    case "list":
      Content = ListVariant;
      break;
    default:
      Content = null;
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
