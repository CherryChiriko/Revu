// src/components/DeckDetails/views/DeckDetails.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useDeckDetails } from "../hooks/useDeckDetails";
import { useBulkCardActions } from "../hooks/useBulkCardActions";
import { PROGRESS } from "../../../utils/constants";
import DeckHeaderSection from "../components/sections/DeckHeaderSection";
import DeckStatsSection from "../components/sections/DeckStatsSection";
import CardGridSection from "../components/sections/CardGridSection";
import CardDetails from "../../CardDetails/views/CardDetails";
import DeckDetailsTutorial from "../../Tutorial/components/DeckDetailsTutorial";
import ConfirmationDialog from "../../General/ui/ConfirmationDialog";
import { selectUserProfile, completeTutorial } from "../../../slices/userSlice";
import { AddCardMenu } from "../components/AddCardMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleQuestion,
  faSquareCheck,
  faXmark,
  faTrashCan,
  faRotateLeft,
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
  const progressTable = PROGRESS[studyMode];

  // ---- Multi-select state ----
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [pendingBulkAction, setPendingBulkAction] = useState(null); // "reset" | "delete" | null

  const { resetMany, deleteMany, isProcessing } = useBulkCardActions({
    deckId,
    userId: state.userId,
    studyMode,
    progressTable,
  });

  // Note: selection only tracks cards from currently loaded pages. If a user
  // selects cards, then loads more pages, earlier selections remain valid —
  // but a card that hasn't been loaded yet can't be selected.
  const selectedCards = state.visibleCards.filter((c) =>
    selectedCardIds.has(c.id || c.card_id),
  );

  const enterSelectionMode = (card) => {
    const id = card.id || card.card_id;
    setSelectionMode(true);
    setSelectedCardIds(new Set([id]));
  };

  const toggleSelectCard = (card) => {
    const id = card.id || card.card_id;
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) setSelectionMode(false);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedCardIds(new Set());
  };

  const handleConfirmBulkAction = async () => {
    if (pendingBulkAction === "reset") {
      await resetMany(selectedCards, state.handleCardUpdate);
    } else if (pendingBulkAction === "delete") {
      await deleteMany(selectedCards, state.handleCardUpdate);
    }
    setPendingBulkAction(null);
    exitSelectionMode();
  };

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
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;
    const hasSeenDashboardTour = profile.completed_tutorials?.details === true;

    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("details"));
  };

  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  if (!state.deck) return null;

  return (
    <div
      className={`min-h-dvh ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4 pb-24">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          <span className="hidden md:inline">Back</span>
        </button>

        {/* Hero */}
        <DeckHeaderSection
          deck={state.deck}
          deckId={deckId}
          activeTheme={activeTheme}
          onDeckDeleted={() => navigate(-1)}
        />

        <div className="flex flex-row justify-between items-start gap-2">
          <div ref={filterRef} className="flex-1 min-w-0">
            <DeckStatsSection
              statusCounts={state.statusCounts}
              totalCardCount={state.totalCardCount}
              activeFilter={state.filter}
              onFilterChange={state.setFilter}
              activeTheme={activeTheme}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Select toggle (desktop / no-long-press fallback) */}
            <button
              type="button"
              onClick={() =>
                selectionMode ? exitSelectionMode() : setSelectionMode(true)
              }
              title={selectionMode ? "Cancel selection" : "Select cards"}
              aria-label={selectionMode ? "Cancel selection" : "Select cards"}
              className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 transition-colors ${
                selectionMode
                  ? "bg-blue-600 text-white"
                  : `${activeTheme.background.app} ${activeTheme.text.secondary}`
              }`}
            >
              <FontAwesomeIcon
                icon={selectionMode ? faXmark : faSquareCheck}
                className="w-3.5 h-3.5 md:w-4 md:h-4"
              />
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={handleManualReplayTour}
              title="Show me around"
              aria-label="Show me around"
              className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 transition-colors ${activeTheme.background.app} ${activeTheme.text.secondary}`}
            >
              <FontAwesomeIcon
                icon={faCircleQuestion}
                ref={helpRef}
                className="w-3.5 h-3.5 md:w-4 md:h-4"
              />
            </button>
          </div>
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
          selectionMode={selectionMode}
          selectedCardIds={selectedCardIds}
          onToggleSelect={toggleSelectCard}
          onLongPressCard={enterSelectionMode}
        />
      </div>

      {selectedCard && (
        <CardDetails
          card={selectedCard}
          deckId={deckId}
          userId={state.userId}
          studyMode={studyMode}
          progressTable={progressTable}
          onClose={() => setSelectedCard(null)}
          onUpdate={state.handleCardUpdate}
          activeTheme={activeTheme}
        />
      )}

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

      {/* Bulk action bottom sheet */}
      {selectionMode && selectedCardIds.size > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t px-4 py-3 md:py-4 flex items-center justify-between gap-3 ${activeTheme.background.secondary} ${activeTheme.border.card}`}
          style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.15)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={exitSelectionMode}
              aria-label="Cancel selection"
              className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${activeTheme.text.secondary}`}
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
            <span
              className={`text-xs md:text-sm font-semibold ${activeTheme.text.primary}`}
            >
              {selectedCardIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setPendingBulkAction("reset")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
            >
              <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
              Reset
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setPendingBulkAction("delete")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${activeTheme.button.danger ?? "bg-red-600 text-white"}`}
            >
              <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      )}

      {pendingBulkAction && (
        <ConfirmationDialog
          title={
            pendingBulkAction === "reset"
              ? `Reset ${selectedCardIds.size} card${selectedCardIds.size === 1 ? "" : "s"}?`
              : `Delete ${selectedCardIds.size} card${selectedCardIds.size === 1 ? "" : "s"}?`
          }
          description={
            pendingBulkAction === "reset"
              ? "This clears all progress on the selected cards and returns them to New."
              : "This permanently removes the selected cards and their progress. This can't be undone."
          }
          confirmText={pendingBulkAction === "reset" ? "Reset" : "Delete"}
          variant={pendingBulkAction === "reset" ? "warning" : "danger"}
          onConfirm={handleConfirmBulkAction}
          onCancel={() => setPendingBulkAction(null)}
          activeTheme={activeTheme}
        />
      )}
    </div>
  );
}
