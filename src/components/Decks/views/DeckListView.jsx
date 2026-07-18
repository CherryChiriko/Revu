import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { selectActiveTheme } from "../../../slices/themeSlice";
import useListController from "../hooks/useListController";
import DeckCard from "../components/DeckCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUpload,
  faSort,
  faThLarge,
  faList,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../General/ui/Header";
import { Toast } from "primereact/toast";

import QuickCreateMenu from "../../DeckMenu/views/QuickCreateMenu";
import QuickCreateView from "../../Import/views/QuickCreateView";
import DeckPageTutorial from "../../Tutorial/components/DeckPageTutorial";

import { selectUserProfile, completeTutorial } from "../../../slices/userSlice";

export default function DeckListView() {
  const activeTheme = useSelector(selectActiveTheme);
  const controller = useListController();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useRef(null);
  const dispatch = useDispatch();
  const profile = useSelector(selectUserProfile);

  const {
    searchTerm,
    setSearchTerm,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    currentPage,
    setPage,
    viewMode,
    toggleViewMode,
    uniqueLanguages,
    currentDecks,
    totalPages,
  } = controller;

  const gridClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-4 gap-3";

  const variant = viewMode === "grid" ? "full" : "compact";

  // ── Modal state ───────────────────────────────────────────────────────────
  const [mode, setMode] = useState(null);

  // ── Highlight new deck ───────────────────────────────────────────────────────────

  const [highlightedId, setHighlightedId] = useState(
    location.state?.highlightedDeckId || null,
  );
  useEffect(() => {
    if (highlightedId) {
      // Clear navigation state history immediately so it doesn't re-flash on component adjustments
      navigate(location.pathname, { replace: true, state: {} });

      // Turn off highlight indicator after 4 seconds
      const timer = setTimeout(() => setHighlightedId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId, navigate, location.pathname]);

  // ── Spotlight tour references ─────────────────────────────────────────────
  const searchRef = useRef(null);
  const sortRef = useRef(null);
  const viewRef = useRef(null);
  const importRef = useRef(null);
  const helpRef = useRef(null);
  const spotlightRefs = {
    search: searchRef,
    sort: sortRef,
    view: viewRef,
    import: importRef,
    help: helpRef,
  };

  const [showSpotlight, setShowSpotlight] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // 1. Guard: Ensure they've finalized the introductory global tutorial first
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;

    // 2. Evaluate if they have viewed this dashboard layout context yet
    const hasSeenDashboardTour = profile.completed_tutorials?.decks === true;

    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      // Small architectural delay ensuring DOM ref spacing layouts settle cleanly
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // 🌟 Handles tour dismissal updates dynamically through Redux
  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("decks"));
  };

  // 🌟 Allows user to explicitly manual replay the workflow when pressing help icon
  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <Header
          title="Deck Manager"
          description="Create, edit, and manage your flashcard decks"
          activeTheme={activeTheme}
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4 w-full md:max-w-3xl">
            {/* Search */}
            <div className="relative w-full" ref={searchRef}>
              <FontAwesomeIcon
                icon={faSearch}
                className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${activeTheme.text.secondary}`}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-5 pl-12`}
                placeholder="Search deck..."
              />
            </div>

            {/* Language filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`border ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-4 pr-8 w-40`}
            >
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <FontAwesomeIcon
                icon={faSort}
                className={`h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 ${activeTheme.text.secondary}`}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`border no-arrow ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-4 pr-8 w-40`}
              >
                <option value="lastStudied-desc">Last Studied</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="cardCount-desc">Cards (High to Low)</option>
                <option value="cardCount-asc">Cards (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 w-full md:w-auto justify-end items-center">
            {/* View toggle */}
            <div
              className={`border flex rounded-xl p-1 ${activeTheme.background.canvas}`}
              ref={viewRef}
            >
              <button
                onClick={() => toggleViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? activeTheme.button.secondary
                    : activeTheme.background.card
                } ${activeTheme.text.secondary}`}
                title="Large Card View"
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                onClick={() => toggleViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? activeTheme.button.secondary
                    : activeTheme.background.canvas
                } ${activeTheme.text.secondary}`}
                title="Compact List View"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>

            {/* Import */}
            <button
              className={`flex items-center ${activeTheme.button.accent2} font-semibold py-2 px-3 rounded-lg`}
              title="Import"
              ref={importRef}
              onClick={() => navigate("import")}
            >
              <FontAwesomeIcon icon={faUpload} className="h-5 w-5 mr-2" />
              Import
            </button>

            {/* Quick Create dropdown */}
            <QuickCreateMenu
              activeTheme={activeTheme}
              onNewDeck={() => setMode("new")}
              onCloneDeck={() => setMode("clone")}
            />

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
        </div>

        {/* ── Deck grid / list ── */}
        {currentDecks.length > 0 ? (
          <DeckCard
            decks={currentDecks}
            activeTheme={activeTheme}
            variant={variant}
            gridClasses={gridClasses}
            toast={toast}
            highlightedId={highlightedId}
          />
        ) : (
          <div
            className={`p-10 text-center rounded-lg border-2 border-dashed ${activeTheme.border.secondary} ${activeTheme.background.canvas} mt-10`}
          >
            <p
              className={`text-2xl font-bold mb-3 ${activeTheme.text.primary}`}
            >
              😥 No Decks Found.
            </p>
            {searchTerm ? (
              <>
                <p className={`${activeTheme.text.secondary}`}>
                  Your filters didn't match any decks.
                </p>
                <div className="mt-5">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLanguage("All Languages");
                    }}
                    className={`font-semibold ${activeTheme.text.accent}`}
                  >
                    Reset Filters
                  </button>
                </div>
              </>
            ) : (
              <p className={`${activeTheme.text.secondary}`}>Create one?</p>
            )}
          </div>
        )}

        <Toast ref={toast} position="top-center" />

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
              aria-label="Prev page"
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span className={`${activeTheme.text.secondary} text-sm px-3`}>
              Page {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <QuickCreateView
        activeTheme={activeTheme}
        mode={mode}
        onClose={() => setMode(null)}
      />

      {showSpotlight && (
        <DeckPageTutorial
          activeTheme={activeTheme}
          refs={spotlightRefs}
          onClose={closeSpotlight}
        />
      )}
    </div>
  );
}
