import { useCallback, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectDecks } from "../../../slices/deckSlice";

export default function useListController({
  initialView = "grid",
  initialSort = "lastStudied-desc",
  initialLanguage = "All Languages",
  initialPage = 1,
} = {}) {
  const decks = useSelector(selectDecks);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState(initialView);

  // decks per page based on view
  const decksPerPage = useMemo(() => (viewMode === "grid" ? 3 : 8), [viewMode]);

  // unique languages (depend on decks)
  const uniqueLanguages = useMemo(() => {
    const langs = Array.from(
      new Set(decks.map((d) => d.language).filter(Boolean))
    );
    return ["All Languages", ...langs];
  }, [decks]);

  // filter
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return decks.filter((deck) => {
      if (!deck) return false;
      const matchesSearch =
        !term ||
        (deck.name && deck.name.toLowerCase().includes(term)) ||
        (deck.description && deck.description.toLowerCase().includes(term)) ||
        (Array.isArray(deck.tags) &&
          deck.tags.some((t) => String(t).toLowerCase().includes(term)));
      const matchesLang =
        selectedLanguage === "All Languages" ||
        (deck.language &&
          deck.language.toLowerCase() === selectedLanguage.toLowerCase());
      return matchesSearch && matchesLang;
    });
  }, [decks, searchTerm, selectedLanguage]);

  // sort results
  const sorted = useMemo(() => {
    const [field, dir] = (sortBy || "lastStudied-desc").split("-");
    const direction = dir === "asc" ? 1 : -1;

    // support date field lastStudied and numeric cardCount
    const compare = (a, b) => {
      const aVal = a?.[field];
      const bVal = b?.[field];

      // date comparison
      if (field === "lastStudied") {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return (aTime - bTime) * direction;
      }

      // cardCount fallback (maybe stored as cardsCount)
      if (field === "cardCount") {
        const aNum = Number(a.cardsCount || 0);
        const bNum = Number(b.cardsCount || 0);
        return (aNum - bNum) * direction;
      }

      // string compare
      const av = (aVal ?? "").toString().toLowerCase();
      const bv = (bVal ?? "").toString().toLowerCase();
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    };

    return [...filtered].sort(compare);
  }, [filtered, sortBy]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(sorted.length / decksPerPage));
  const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    // if filters / sort / view change, reset to page 1
    setCurrentPage(1);
  }, [searchTerm, selectedLanguage, sortBy, viewMode]);

  const currentDecks = useMemo(() => {
    const start = (currentPageSafe - 1) * decksPerPage;
    return sorted.slice(start, start + decksPerPage);
  }, [sorted, currentPageSafe, decksPerPage]);

  const setPage = useCallback(
    (n) => {
      setCurrentPage((_) => {
        const v = Number(n) || 1;
        return Math.min(Math.max(1, v), totalPages);
      });
    },
    [totalPages]
  );

  const toggleViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return {
    // state + setters
    searchTerm,
    setSearchTerm,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    currentPage: currentPageSafe,
    setPage,
    viewMode,
    toggleViewMode,

    // derived
    uniqueLanguages,
    decksPerPage,
    totalPages,
    currentDecks,
    allFilteredCount: sorted.length,
  };
}
