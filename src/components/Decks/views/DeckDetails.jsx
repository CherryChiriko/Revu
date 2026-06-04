import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import { supabase } from "../../../utils/supabaseClient";
import { fetchCardsPage } from "../../../slices/cardSlice";
import {
  fetchDeckCounts,
  selectDeckNameById,
  selectDecks,
} from "../../../slices/deckSlice";
import { STATUS_COLOR } from "../../Study/constants/constants";
import CardDetail from "../components/CardDetail";

// --- CONSTANTS ---

const CHUNK_SIZE = 50;
const STATUS_FILTERS = ["new", "waiting", "due", "mastered", "suspended"];
const STATUS_LABELS = STATUS_FILTERS.map(
  (s) => s.charAt(0).toUpperCase() + s.slice(1),
);
console.log(STATUS_COLOR, STATUS_LABELS);

// --- SUB-COMPONENTS ---

/**
 * Card shell — consistent with your theme tokens, slightly elevated with a
 * ring on hover so it doesn't fight the background.
 */
const Card = ({ children, activeTheme, className = "" }) => (
  <div
    className={`
      ${activeTheme.background.card}
      border ${activeTheme.border.card}
      rounded-2xl shadow-sm
      overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

/**
 * Pill-shaped filter button — uses your theme's border/text tokens and
 * highlights the active filter with the accent gradient.
 */
const FilterPill = ({ label, active, dot, onClick, activeTheme }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
      border transition-all duration-150 active:scale-95 whitespace-nowrap
      ${
        active
          ? `${activeTheme.background.primary} ${activeTheme.text.primary} shadow-sm`
          : `${activeTheme.border.secondary} border ${activeTheme.text.secondary} ${activeTheme.background.secondary} hover:border-indigo-400`
      }
    `}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    {label}
  </button>
);

/**
 * Individual card tile in the grid.
 */
const CardTile = ({ card, onClick, activeTheme }) => {
  const status = card.suspended ? "suspended" : card.status;
  const bgClass =
    activeTheme.background[STATUS_COLOR[status]] ||
    activeTheme.background.canvas;

  return (
    <button
      onClick={() => onClick(card)}
      className={`
        group relative flex flex-col justify-between
        min-h-[72px] rounded-xl border px-3 py-3
        text-left text-sm font-medium
        transition-all duration-150
        hover:-translate-y-0.5 hover:shadow-md
        focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1
        ${bgClass}
        ${activeTheme.border.card}
      `}
    >
      <span className="line-clamp-3 text-sm leading-snug">{card.front}</span>
      <span className="mt-2 flex items-center justify-between gap-1">
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-2 py-0.5
            text-[9px] font-bold uppercase tracking-wider
            bg-black/10
          `}
        >
          <span className={`w-1 h-1 rounded-full ${STATUS_COLOR[status]}`} />
          {status}
        </span>
      </span>
    </button>
  );
};

/**
 * Skeleton tile shown while a page is loading.
 */
const SkeletonTile = ({ activeTheme }) => (
  <div
    className={`
      min-h-[72px] rounded-xl border
      ${activeTheme.border.card} ${activeTheme.background.secondary}
      animate-pulse
    `}
  />
);

// --- MAIN COMPONENT ---

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deckName = useSelector(selectDeckNameById(deckId));
  const deck = useSelector((state) =>
    selectDecks(state).find((d) => d.deck_id === deckId),
  );

  // Local state
  const [filter, setFilter] = useState(null);
  const [expanded, setExpanded] = useState({ 0: true });
  const [selectedCard, setSelectedCard] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cardsByPage, setCardsByPage] = useState({});
  const [pageLoading, setPageLoading] = useState({});
  const [pageError, setPageError] = useState({});

  const studyMode = deck?.study_mode || "A";
  const totalCardCount = Number(deck?.cards_count || 0);
  const totalPages = Math.max(0, Math.ceil(totalCardCount / CHUNK_SIZE));
  const progressTable = `card_${studyMode.toLowerCase()}_progress`;

  // --- Auth ---
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    loadUser();
  }, []);

  // --- Data fetching ---
  const fetchPage = React.useCallback(
    async (pageIndex) => {
      if (!deckId || !userId || pageIndex < 0 || pageIndex >= totalPages)
        return;

      setPageLoading((prev) => ({ ...prev, [pageIndex]: true }));
      setPageError((prev) => ({ ...prev, [pageIndex]: null }));

      try {
        const cards = await dispatch(
          fetchCardsPage({
            deck_id: deckId,
            study_mode: studyMode,
            user_id: userId,
            page: pageIndex,
            pageSize: CHUNK_SIZE,
          }),
        ).unwrap();

        setCardsByPage((prev) => ({ ...prev, [pageIndex]: cards }));
      } catch (err) {
        setPageError((prev) => ({
          ...prev,
          [pageIndex]: err?.message || err || "Failed to load cards",
        }));
      } finally {
        setPageLoading((prev) => ({ ...prev, [pageIndex]: false }));
      }
    },
    [deckId, userId, totalPages, studyMode, dispatch],
  );

  useEffect(() => {
    if (!deckId || !userId) return;

    setCardsByPage({});
    setPageLoading({});
    setPageError({});
    setExpanded({ 0: true });

    if (totalPages > 0) fetchPage(0);
  }, [deckId, userId, studyMode, totalPages, fetchPage]);

  // --- Pages derived state ---
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, idx) => {
      const pageCards = cardsByPage[idx] || [];
      const filtered = filter
        ? pageCards.filter((c) =>
            filter === "suspended"
              ? c.suspended
              : c.status === filter && !c.suspended,
          )
        : pageCards;

      const isLastPage = idx === totalPages - 1;
      const countOnPage = isLastPage
        ? totalCardCount - idx * CHUNK_SIZE
        : CHUNK_SIZE;

      return {
        pageIndex: idx,
        cards: filtered,
        loaded: Object.prototype.hasOwnProperty.call(cardsByPage, idx),
        loading: Boolean(pageLoading[idx]),
        error: pageError[idx],
        totalCount: Math.max(0, countOnPage),
      };
    });
  }, [cardsByPage, filter, pageError, pageLoading, totalCardCount, totalPages]);

  // --- Interactions ---
  const toggleGroup = (idx) => {
    setExpanded((prev) => {
      const nextExpanded = !prev[idx];
      if (
        nextExpanded &&
        !Object.prototype.hasOwnProperty.call(cardsByPage, idx) &&
        !pageLoading[idx]
      ) {
        fetchPage(idx);
      }
      return { ...prev, [idx]: nextExpanded };
    });
  };

  // --- Render ---
  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ── Header ── */}
        <div
          className={`
            flex flex-col sm:flex-row sm:items-center justify-between gap-4
            pb-5 border-b ${activeTheme.border.card}
          `}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-full
                border ${activeTheme.border.secondary}
                ${activeTheme.text.muted}
                hover:${activeTheme.background.secondary}
                transition-colors
              `}
              aria-label="Go back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <h1
                className={`text-xl font-bold ${activeTheme.text.primary} leading-tight`}
              >
                {deckName || "Deck Details"}
              </h1>
              <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                {totalCardCount} card{totalCardCount !== 1 ? "s" : ""} ·{" "}
                {totalPages} set{totalPages !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <FilterPill
              key={s}
              label={STATUS_LABELS[s]}
              dot={STATUS_COLOR[s]}
              active={filter === s}
              activeTheme={activeTheme}
              onClick={() => {
                setFilter(filter === s ? null : s);
                setExpanded({ 0: true });
              }}
            />
          ))}
        </div>

        {/* ── Page Groups ── */}
        <div className="space-y-3">
          {totalPages === 0 && (
            <p className={`text-sm ${activeTheme.text.muted} py-8 text-center`}>
              No cards in this deck yet.
            </p>
          )}

          {pages.map(
            ({ pageIndex, cards, loaded, loading, error, totalCount }) => (
              <Card key={pageIndex} activeTheme={activeTheme}>
                <CardContent>
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleGroup(pageIndex)}
                    className={`
                    flex items-center justify-between w-full text-left
                    ${activeTheme.text.primary}
                  `}
                  >
                    <span className="flex items-center gap-2 font-semibold text-sm">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`
                        text-xs transition-transform duration-200
                        ${expanded[pageIndex] ? "rotate-0" : "-rotate-90"}
                        ${activeTheme.text.muted}
                      `}
                      />
                      Set {pageIndex + 1}
                    </span>
                    <span className={`text-xs ${activeTheme.text.muted}`}>
                      {totalCount} card{totalCount !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Accordion body */}
                  {expanded[pageIndex] && (
                    <div className="mt-4">
                      {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <SkeletonTile key={i} activeTheme={activeTheme} />
                          ))}
                        </div>
                      ) : error ? (
                        <div className="flex items-center gap-2 text-red-400 text-sm py-3">
                          <FontAwesomeIcon icon={faBan} />
                          {error}
                        </div>
                      ) : loaded && cards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {cards.map((card) => (
                            <CardTile
                              key={card.card_id}
                              card={card}
                              onClick={setSelectedCard}
                              activeTheme={activeTheme}
                            />
                          ))}
                        </div>
                      ) : loaded ? (
                        <p className={`text-sm ${activeTheme.text.muted} py-3`}>
                          {filter
                            ? `No "${filter}" cards in this set.`
                            : "No cards in this set."}
                        </p>
                      ) : (
                        <p className={`text-sm ${activeTheme.text.muted} py-3`}>
                          Expand to load this set.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>

      {/* ── Card Detail Drawer ── */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          setSelectedCard={setSelectedCard}
          activeTheme={activeTheme}
        />
      )}
    </div>
  );
}
