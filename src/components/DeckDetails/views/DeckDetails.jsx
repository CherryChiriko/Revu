// components/DeckDetails.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeckDetails } from "../hooks/useDeckDetails";
import { PROGRESS } from "../../../utils/constants";

// Sub-components moved to their own clean files
import DeckHeaderSection from "../components/sections/DeckHeaderSection";
import DeckStatsSection from "../components/sections/DeckStatsSection";
import CardGridSection from "../components/sections/CardGridSection";
import CardDetail from "../../Decks/components/CardDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  // Unified controller abstraction hook
  const state = useDeckDetails(deckId);

  if (!state.deck) return null;

  return (
    <div
      className={`min-h-dvh ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Navigation back button */}
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Hero Panel */}
        <DeckHeaderSection
          deck={state.deck}
          deckId={deckId}
          activeTheme={activeTheme}
        />

        {/* Stats */}
        <DeckStatsSection
          statusCounts={state.statusCounts}
          totalCardCount={state.totalCardCount}
          activeFilter={state.filter}
          onFilterChange={state.setFilter}
          activeTheme={activeTheme}
        />

        {/* Card Grid */}
        <CardGridSection
          cards={state.visibleCards}
          isLoading={state.isLoading}
          hasMore={state.hasMore}
          loadedCount={state.loadedCardCount}
          totalCount={state.totalCardCount}
          onLoadMore={state.loadMore}
          onCardClick={setSelectedCard}
          activeTheme={activeTheme}
        />
      </div>

      {/* Card Sidebar with details */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          deckId={deckId}
          userId={state.userId}
          studyMode={state.deck.study_mode}
          progressTable={PROGRESS[state.deck.study_mode || "A"]}
          onClose={() => setSelectedCard(null)}
          onUpdate={state.handleCardUpdate}
          activeTheme={activeTheme}
        />
      )}
    </div>
  );
}
