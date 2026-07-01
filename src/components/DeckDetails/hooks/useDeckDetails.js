// hooks/useDeckDetails.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { fetchCardsPage } from "../../../slices/cardSlice";
import { fetchDeckCounts, selectDecks } from "../../../slices/deckSlice";
import { CHUNK_SIZE } from "../../../utils/constants";

export function useDeckDetails(deckId) {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState(null);
  const [cardsByPage, setCardsByPage] = useState({});
  const [pageLoading, setPageLoading] = useState({});
  const [visiblePages, setVisiblePages] = useState(1);

  const deck = useSelector((s) =>
    selectDecks(s).find((d) => d.deck_id === deckId || d.id === deckId),
  );

  const totalCardCount = Number(deck?.cards_count || 0);
  const totalPages = Math.max(0, Math.ceil(totalCardCount / CHUNK_SIZE));

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  const fetchPage = useCallback(
    async (pageIndex) => {
      if (!deckId || !userId || pageIndex < 0 || pageIndex >= totalPages)
        return;
      setPageLoading((p) => ({ ...p, [pageIndex]: true }));
      try {
        const cards = await dispatch(
          fetchCardsPage({
            deck_id: deckId,
            study_mode: deck?.study_mode || "A",
            user_id: userId,
            page: pageIndex,
            pageSize: CHUNK_SIZE,
          }),
        ).unwrap();
        setCardsByPage((p) => ({ ...p, [pageIndex]: cards }));
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading((p) => ({ ...p, [pageIndex]: false }));
      }
    },
    [deckId, userId, totalPages, deck?.study_mode, dispatch],
  );

  useEffect(() => {
    if (!deckId || !userId) return;
    for (let i = 0; i < visiblePages && i < totalPages; i++) {
      if (
        !Object.prototype.hasOwnProperty.call(cardsByPage, i) &&
        !pageLoading[i]
      ) {
        fetchPage(i);
      }
    }
  }, [
    deckId,
    userId,
    visiblePages,
    totalPages,
    cardsByPage,
    pageLoading,
    fetchPage,
  ]);

  const visibleCards = useMemo(() => {
    const all = [];
    for (let i = 0; i < visiblePages && i < totalPages; i++) {
      all.push(...(cardsByPage[i] ?? []));
    }
    if (!filter) return all;
    return all.filter((c) =>
      filter === "suspended"
        ? c.suspended
        : c.status === filter && !c.suspended,
    );
  }, [cardsByPage, visiblePages, totalPages, filter]);

  const statusCounts = useMemo(() => {
    const all = Object.values(cardsByPage).flat();
    const result = { new: 0, waiting: 0, due: 0, mastered: 0, suspended: 0 };
    all.forEach((c) => {
      const s = c.suspended ? "suspended" : c.status;
      if (s in result) result[s]++;
    });
    return result;
  }, [cardsByPage]);

  const handleCardUpdate = useCallback(
    (updatedCard) => {
      if (!updatedCard) return;

      setCardsByPage((prev) => {
        const pageEntries = Object.entries(prev);
        // Fallback match check covering both root ids and relational mapping keys
        const pageToUpdate = pageEntries.find(([_, cards]) =>
          cards.some(
            (c) => c.id === updatedCard.id || c.card_id === updatedCard.card_id,
          ),
        );

        if (pageToUpdate) {
          const [pageKey, cards] = pageToUpdate;
          return {
            ...prev,
            [pageKey]: cards.map((c) =>
              c.id === updatedCard.id || c.card_id === updatedCard.card_id
                ? updatedCard
                : c,
            ),
          };
        } else {
          const pageZero = prev[0] ?? [];
          return {
            ...prev,
            0: [updatedCard, ...pageZero],
          };
        }
      });

      if (deckId) {
        dispatch(fetchDeckCounts());
      }
    },
    [deckId, dispatch],
  );

  return {
    deck,
    userId,
    filter,
    setFilter,
    visibleCards,
    statusCounts,
    isLoading: Object.values(pageLoading).some(Boolean),
    hasMore: visiblePages < totalPages,
    loadMore: () => setVisiblePages((v) => v + 1),
    handleCardUpdate,
    totalCardCount,
    loadedCardCount: Object.values(cardsByPage).reduce(
      (sum, p) => sum + p.length,
      0,
    ),
  };
}
