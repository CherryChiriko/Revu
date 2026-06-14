import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectActiveTheme } from "../../../slices/themeSlice";
import useListController from "../hooks/useListController";
import DeckCard from "../components/DeckCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUpload,
  faPlus,
  faSort,
  faThLarge,
  faList,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../General/ui/Header";
import { Toast } from "primereact/toast";
import QuickCreate from "../../Import/QuickCreate";

export default function DeckListView() {
  const activeTheme = useSelector(selectActiveTheme);
  const controller = useListController();

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
    viewMode === "large"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-4 gap-3";

  const variant = viewMode === "large" ? "full" : "compact";

  const navigate = useNavigate();
  const toast = useRef(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Header
          title="Deck Manager"
          description="Create, edit, and manage your flashcard decks"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        {/* ── Toolbar ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4 w-full md:max-w-3xl">
            <div className="relative w-full">
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

            <div className="relative">
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

          <div className="flex space-x-4 w-full md:w-auto justify-end">
            <div
              className={`border flex rounded-xl p-1 ${activeTheme.background.canvas}`}
            >
              <button
                onClick={() => toggleViewMode("large")}
                className={`p-2 rounded-lg ${
                  viewMode === "large"
                    ? activeTheme.button.secondary
                    : activeTheme.background.canvas
                } ${activeTheme.text.secondary}`}
                title="Large Card View"
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                onClick={() => toggleViewMode("compact")}
                className={`p-2 rounded-lg ${
                  viewMode === "compact"
                    ? activeTheme.button.secondary
                    : activeTheme.background.canvas
                } ${activeTheme.text.secondary}`}
                title="Compact List View"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>

            <button
              className={`flex items-center ${activeTheme.button.accent2} font-semibold py-2 px-3 rounded-lg`}
              title="Import"
              onClick={() => navigate("import")}
            >
              <FontAwesomeIcon icon={faUpload} className="h-5 w-5 mr-2" />
              Import
            </button>

            <button
              className={`flex items-center ${activeTheme.button.accent2} font-semibold py-2 px-3 rounded-lg`}
              title="Quick Create"
              onClick={() => setIsQuickCreateOpen(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5 mr-2" />
              Quick Create
            </button>
          </div>
        </div>

        {/* ── Deck large / compact ── */}
        {currentDecks.length > 0 ? (
          <DeckCard
            decks={currentDecks}
            activeTheme={activeTheme}
            variant={variant}
            gridClasses={gridClasses}
            toast={toast}
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

        <div>
          <Toast ref={toast} position="top-center" />
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`${activeTheme.button.secondary} ${activeTheme.text.secondary} p-3 rounded-full ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <span
              className={`${activeTheme.text.secondary} text-sm font-semibold`}
            >
              Page {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`${activeTheme.button.secondary} ${activeTheme.text.secondary} p-3 rounded-full ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}
      </div>

      {/* ── Quick Create modal ── */}
      <QuickCreate
        activeTheme={activeTheme}
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />
    </div>
  );
}
