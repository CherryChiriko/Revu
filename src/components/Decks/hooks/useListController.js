import { useCallback, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectDecks } from "../../../slices/deckSlice";
import { selectDefaultDeckView } from "../../../slices/settingsSlice"; // Selector from your settings slice

export default function useListController({
  initialSort = "lastStudied-desc",
  initialLanguage = "All Languages",
  initialPage = 1,
} = {}) {
  const decks = useSelector(selectDecks);
  const preferredView = useSelector(selectDefaultDeckView); // e.g., "large" or "compact"

  // ── Responsive breakpoint state ──────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  // Fallback preference checks: if no view has been manually selected/set, default to preferredView.
  // If the user is on mobile, force 'compact' (list mode) immediately.
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "list"; // 'list' acts as the compact layout mapping
    }
    return preferredView || "large";
  });

  useEffect(() => {
    const onResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);

      if (nextIsMobile) {
        // Enforce compact mode on mobile screens without triggering any database upload actions
        setViewMode("list");
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync state if the user settings preferences change externally later
  useEffect(() => {
    if (!isMobile && preferredView) {
      setViewMode(preferredView);
    }
  }, [preferredView, isMobile]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // decks per page: fewer on mobile, more on desktop
  const decksPerPage = useMemo(() => {
    switch (viewMode) {
      case "compact":
        return 8;
      case "list":
        return 6;
      case "large":
        return 3;
      default:
        return 8;
    }
  }, [viewMode]);

  // unique languages (depend on decks)
  const uniqueLanguages = useMemo(() => {
    const langs = Array.from(
      new Set(decks.map((d) => d.language).filter(Boolean)),
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

    const compare = (a, b) => {
      const aVal = a?.[field];
      const bVal = b?.[field];

      if (field === "lastStudied") {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return (aTime - bTime) * direction;
      }

      if (field === "cardCount") {
        const aNum = Number(a.cardsCount || 0);
        const bNum = Number(b.cardsCount || 0);
        return (aNum - bNum) * direction;
      }

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

  // reset to page 1 when filters, sort, view mode, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLanguage, sortBy, viewMode, decksPerPage]);

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
    [totalPages],
  );

  const toggleViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return {
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
    uniqueLanguages,
    decksPerPage,
    totalPages,
    currentDecks,
    allFilteredCount: sorted.length,
    isMobile,
  };
}
