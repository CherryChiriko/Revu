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
} from "@fortawesome/free-solid-svg-icons";

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

  // grid classes depending on view mode
  const gridClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-4 gap-3";

  const variant = viewMode === "grid" ? "full" : "compact";

  const navigate = useNavigate();

  const handleImportClick = () => {
    navigate("/import");
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        {/* header area */}
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
                className={`w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-5 pl-12`}
                placeholder="Search deck..."
              />
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-4 pr-8 w-40`}
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
                className={`no-arrow ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2 px-4 pr-8 w-40`}
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
              className={`flex rounded-lg p-1 ${activeTheme.background.canvas}`}
            >
              <button
                onClick={() => toggleViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? activeTheme.button.secondary
                    : activeTheme.background.canvas
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

            <button
              className={`flex items-center ${activeTheme.button.accent2} ${activeTheme.text.secondary} font-semibold py-2 px-3 rounded-lg`}
              title="Import"
              onClick={handleImportClick}
            >
              {" "}
              <FontAwesomeIcon icon={faUpload} className="h-5 w-5 mr-2" />
              Import
            </button>

            <button
              className={`flex items-center ${activeTheme.button.accent2} ${activeTheme.text.primary} font-semibold py-2 px-3 rounded-lg`}
              title="Create deck"
            >
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5 mr-2" />
              Quick Create
            </button>
          </div>
        </div>

        {/* main grid/list */}
        {currentDecks.length > 0 ? (
          <DeckCard
            decks={currentDecks}
            activeTheme={activeTheme}
            variant={variant}
            gridClasses={gridClasses}
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

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`${activeTheme.button.secondary} ${activeTheme.text.secondary} px-4 py-1 rounded-lg`}
            >
              Previous
            </button>
            <span className={`${activeTheme.text.secondary} text-sm px-3`}>
              Page {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`${activeTheme.button.secondary} ${activeTheme.text.secondary} px-4 py-1 rounded-lg`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
