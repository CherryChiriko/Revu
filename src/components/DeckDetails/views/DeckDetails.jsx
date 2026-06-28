import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeckDetails } from "../hooks/useDeckDetails";
import { PROGRESS } from "../../../utils/constants";
import DeckHeaderSection from "../components/sections/DeckHeaderSection";
import DeckStatsSection from "../components/sections/DeckStatsSection";
import CardGridSection from "../components/sections/CardGridSection";
import CardDetail from "../../Decks/components/CardDetail";
import { AddCardMenu } from "../components/AddCardMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const state = useDeckDetails(deckId);

  if (!state.deck) return null;

  const studyMode = state.deck.study_mode || "A";

  return (
    <div
      className={`min-h-dvh ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Back
        </button>

        {/* Hero */}
        <DeckHeaderSection
          deck={state.deck}
          deckId={deckId}
          activeTheme={activeTheme}
          onDeckDeleted={() => navigate(-1)}
        />

        {/* Stats + filter pills */}
        <DeckStatsSection
          statusCounts={state.statusCounts}
          totalCardCount={state.totalCardCount}
          activeFilter={state.filter}
          onFilterChange={state.setFilter}
          activeTheme={activeTheme}
        />

        {/* Card grid */}
        <CardGridSection
          cards={state.visibleCards}
          isLoading={state.isLoading}
          hasMore={state.hasMore}
          loadedCount={state.loadedCardCount}
          totalCount={state.totalCardCount}
          onLoadMore={state.loadMore}
          onCardClick={setSelectedCard}
          onAddCard={() => setIsAddingCard(true)}
          activeTheme={activeTheme}
        />
      </div>

      {/* Card detail drawer */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          deckId={deckId}
          userId={state.userId}
          studyMode={studyMode}
          progressTable={PROGRESS[studyMode]}
          onClose={() => setSelectedCard(null)}
          onUpdate={state.handleCardUpdate}
          activeTheme={activeTheme}
        />
      )}

      {/* Add card modal */}
      <AddCardMenu
        isOpen={isAddingCard}
        onClose={() => setIsAddingCard(false)}
        deckId={deckId}
        studyMode={studyMode}
        totalCardCount={state.totalCardCount}
        activeTheme={activeTheme}
        onSuccess={state.handleCardUpdate}
      />
    </div>
  );
}
