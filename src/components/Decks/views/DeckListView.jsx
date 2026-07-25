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
  faThLarge,
  faList,
  faCircleQuestion,
  faPlus,
  faChevronDown,
  faSliders,
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

  // ── Responsive page size ────────────────────────────────────────────────
  // If useListController supports setPageSize, this keeps mobile snappy.
  // If not, add `setPageSize` to your controller hook (see note below).
  const [responsivePageSize, setResponsivePageSize] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 6 : 12,
  );

  useEffect(() => {
    const onResize = () => {
      const next = window.innerWidth < 768 ? 6 : 12;
      setResponsivePageSize((prev) => {
        if (prev !== next) {
          // Notify controller if it supports dynamic page size
          // setPageSize?.(next);
          return next;
        }
        return prev;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset to page 1 whenever page size changes so we don't land out-of-bounds
  useEffect(() => {
    setPage(1);
  }, [responsivePageSize, setPage]);

  const gridClasses =
    viewMode === "large"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      : "grid grid-cols-1 md:grid-cols-4 gap-3";

  const variant = viewMode === "large" ? "full" : "compact";

  const [mode, setMode] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [highlightedId, setHighlightedId] = useState(
    location.state?.highlightedDeckId || null,
  );
  useEffect(() => {
    if (highlightedId) {
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setHighlightedId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId, navigate, location.pathname]);

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
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;
    const hasSeenDashboardTour = profile.completed_tutorials?.decks === true;
    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("decks"));
  };

  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <Header
          title="Deck Manager"
          description="Create, edit, and manage your flashcard decks"
          activeTheme={activeTheme}
        />

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Actions */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 z-10 items-stretch">
            {/* Search */}
            <div className="relative flex-1 min-w-0" ref={searchRef}>
              <FontAwesomeIcon
                icon={faSearch}
                className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${activeTheme.text.muted}`}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full h-[46px] border-1 ${activeTheme.border.secondary} ${activeTheme.isDark ? activeTheme.background.canvas : activeTheme.background.secondary} ${activeTheme.text.primary} placeholder:${activeTheme.text.muted} rounded-xl pl-10 pr-10 md:pr-4 text-sm focus:outline-none focus:ring-2 ${activeTheme.ring.focus} transition-all`}
                placeholder="Search decks..."
              />
              {/* Mobile filter toggle — sits inside the search bar */}
              <button
                type="button"
                onClick={() => setShowMobileFilters((s) => !s)}
                className={`md:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  showMobileFilters
                    ? `${activeTheme.background.secondary} ${activeTheme.text.primary}`
                    : `${activeTheme.text.muted} hover:${activeTheme.background.secondary}`
                }`}
                aria-label="Toggle filters"
                aria-expanded={showMobileFilters}
              >
                <FontAwesomeIcon icon={faSliders} className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* View toggle — desktop only (grid/list are identical on mobile) */}
              <div
                className={`hidden md:inline-flex h-[46px] rounded-xl border-1 ${activeTheme.border.secondary} p-1 ${activeTheme.isDark ? activeTheme.background.canvas : activeTheme.background.secondary}`}
                ref={viewRef}
              >
                <button
                  onClick={() => toggleViewMode("large")}
                  className={`px-3 rounded-lg transition-all text-sm font-medium flex items-center justify-center ${
                    viewMode === "large"
                      ? `${activeTheme.button.secondary} ${activeTheme.text.primary} shadow-sm`
                      : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`
                  }`}
                  title="Grid view"
                >
                  <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleViewMode("list")}
                  className={`px-3 rounded-lg transition-all text-sm font-medium flex items-center justify-center ${
                    viewMode === "list"
                      ? `${activeTheme.button.secondary} ${activeTheme.text.primary} shadow-sm`
                      : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`
                  }`}
                  title="List view"
                >
                  <FontAwesomeIcon icon={faList} className="w-4 h-4" />
                </button>
              </div>

              <button
                className={`flex items-center gap-2 font-semibold py-2 px-3 rounded-xl  text-sm md:text-base
                          transition-all active:scale-98 ${activeTheme.button.accent2}`}
                title="Import deck"
                ref={importRef}
                onClick={() => navigate("import")}
              >
                <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                <span>Import</span>
              </button>

              {/* Quick Create */}
              <div className="flex items-stretch text-sm md:text-base">
                <QuickCreateMenu
                  activeTheme={activeTheme}
                  onNewDeck={() => setMode("new")}
                  onCloneDeck={() => setMode("clone")}
                  triggerIcon={faPlus}
                  triggerLabel="Create"
                />
              </div>

              {/* Help */}
              <button
                type="button"
                onClick={handleManualReplayTour}
                title="Show me around"
                aria-label="Show me around"
                className={`inline-flex items-center justify-center w-[46px] h-[46px] rounded-xl `}
              >
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  ref={helpRef}
                  className="w-4 h-4"
                />
              </button>
            </div>
          </div>

          {/* Row 2: Filters — collapsible on mobile, always visible on desktop */}
          <div
            className={`flex flex-wrap items-center gap-2 md:flex ${showMobileFilters ? "flex" : "hidden"}`}
          >
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`appearance-none border ${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.text.primary} rounded-lg py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 ${activeTheme.ring.focus} cursor-pointer`}
              >
                {uniqueLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 ${activeTheme.text.muted} pointer-events-none`}
              />
            </div>

            <div className="relative" ref={sortRef}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none border ${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.text.primary} rounded-lg py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 ${activeTheme.ring.focus} cursor-pointer`}
              >
                <option value="lastStudied-desc">Last Studied</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="cardCount-desc">Most Cards</option>
                <option value="cardCount-asc">Least Cards</option>
              </select>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 ${activeTheme.text.muted} pointer-events-none`}
              />
            </div>
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
            className={`p-8 md:p-10 text-center rounded-xl border-2 border-dashed ${activeTheme.border.secondary} ${activeTheme.background.canvas} mt-6 md:mt-10`}
          >
            <p
              className={`text-xl md:text-2xl font-bold mb-2 ${activeTheme.text.primary}`}
            >
              No decks found
            </p>
            {searchTerm ? (
              <>
                <p className={`${activeTheme.text.secondary} text-sm`}>
                  Your filters didn't match any decks.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLanguage("All Languages");
                    }}
                    className={`font-semibold ${activeTheme.text.accent1} text-sm hover:underline`}
                  >
                    Reset filters
                  </button>
                </div>
              </>
            ) : (
              <p className={`${activeTheme.text.secondary} text-sm`}>
                Create or import a deck to get started.
              </p>
            )}
          </div>
        )}

        <Toast ref={toast} position="top-center" />

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
            >
              Previous
            </button>
            <span className={`${activeTheme.text.secondary} text-sm px-2`}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
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
