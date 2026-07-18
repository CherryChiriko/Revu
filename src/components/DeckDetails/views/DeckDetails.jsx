import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useDeckDetails } from "../hooks/useDeckDetails";
import { PROGRESS } from "../../../utils/constants";
import DeckHeaderSection from "../components/sections/DeckHeaderSection";
import DeckStatsSection from "../components/sections/DeckStatsSection";
import CardGridSection from "../components/sections/CardGridSection";
import CardDetails from "../../CardDetails/views/CardDetails";
import DeckDetailsTutorial from "../../Tutorial/components/DeckDetailsTutorial";
import { selectUserProfile, completeTutorial } from "../../../slices/userSlice";
import { AddCardMenu } from "../components/AddCardMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector(selectUserProfile);

  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const state = useDeckDetails(deckId);
  const studyMode = state.deck.study_mode || "A";

  // ── Spotlight tour references ─────────────────────────────────────────────

  const filterRef = useRef(null);
  const helpRef = useRef(null);
  const addRef = useRef(null);
  const cardRef = useRef(null);
  const spotlightRefs = {
    filter: filterRef,
    help: helpRef,
    card: cardRef,
    add: addRef,
  };

  const [showSpotlight, setShowSpotlight] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // 1. Guard: Ensure they've finalized the introductory global tutorial first
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;

    // 2. Evaluate if they have viewed this dashboard layout context yet
    const hasSeenDashboardTour = profile.completed_tutorials?.details === true;

    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      // Small architectural delay ensuring DOM ref spacing layouts settle cleanly
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // 🌟 Handles tour dismissal updates dynamically through Redux
  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("details"));
  };

  // 🌟 Allows user to explicitly manual replay the workflow when pressing help icon
  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  if (!state.deck) return null;

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

        <div className="flex flex-row justify-between">
          <div ref={filterRef}>
            {/* Stats + filter pills */}
            <DeckStatsSection
              statusCounts={state.statusCounts}
              totalCardCount={state.totalCardCount}
              activeFilter={state.filter}
              onFilterChange={state.setFilter}
              activeTheme={activeTheme}
            />
          </div>

          {/* Help / tutorial */}
          <button
            type="button"
            onClick={handleManualReplayTour} // 🌟 Connected to our review callback logic
            title="Show me around"
            aria-label="Show me around"
            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors ${activeTheme.background.app} ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon
              icon={faCircleQuestion}
              ref={helpRef}
              className="w-4 h-4"
            />
          </button>
        </div>

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
          refs={{ addRef: addRef, cardRef: cardRef }}
        />
      </div>

      {/* Card detail drawer */}
      {selectedCard && (
        <CardDetails
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

      {showSpotlight && (
        <DeckDetailsTutorial
          activeTheme={activeTheme}
          refs={spotlightRefs}
          onClose={closeSpotlight}
        />
      )}
    </div>
  );
}
