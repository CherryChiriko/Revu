import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faBan,
  faLayerGroup,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 50;

const STATUS_FILTERS = ["new", "waiting", "due", "mastered", "suspended"];

/**
 * Maps status → concrete Tailwind classes that work as semi-transparent tints
 * on top of both dark (bg-gray-800) and light (bg-white) card backgrounds.
 * The dot color is reused for the summary bar and filter pills.
 */
const STATUS_TILE = {
  new: {
    bg: "bg-gray-400/10  border-gray-400/20",
    dot: "bg-gray-400",
    text: "text-gray-400",
  },
  waiting: {
    bg: "bg-sky-400/10   border-sky-400/20",
    dot: "bg-sky-400",
    text: "text-sky-400",
  },
  due: {
    bg: "bg-purple-400/10 border-purple-400/20",
    dot: "bg-purple-400",
    text: "text-purple-400",
  },
  mastered: {
    bg: "bg-indigo-400/10 border-indigo-400/20",
    dot: "bg-indigo-400",
    text: "text-indigo-400",
  },
  suspended: {
    bg: "bg-red-400/10   border-red-400/20",
    dot: "bg-red-400",
    text: "text-red-400",
  },
};

// ─── Primitive components ─────────────────────────────────────────────────────

/** Shell card – mirrors the SettingCard pattern from SettingsPage */
const SectionCard = ({ children, activeTheme, className = "" }) => (
  <div
    className={`
      ${activeTheme.background.secondary}
      border ${activeTheme.border.card}
      rounded-2xl shadow-lg overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

/** Pill filter – compact, consistent with SegmentButton aesthetic */
const FilterPill = ({ status, active, count, onClick, activeTheme }) => {
  const tile = STATUS_TILE[status];
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-xs font-semibold border whitespace-nowrap
        transition-all duration-150 active:scale-95
        ${
          active
            ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}
               border-transparent text-white shadow-md`
            : `${activeTheme.background.canvas} ${activeTheme.border.secondary}
               ${activeTheme.text.secondary} hover:border-indigo-400`
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
      <span className="capitalize">{status}</span>
      <span
        className={`
          ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold
          ${active ? "bg-white/20 text-white" : `${activeTheme.background.secondary} ${activeTheme.text.muted}`}
        `}
      >
        {count}
      </span>
    </button>
  );
};

/** Compact stat chip for the header summary row */
const StatChip = ({ label, value, dot, activeTheme }) => (
  <div
    className={`
      flex items-center gap-1.5 px-2.5 py-1 rounded-lg
      border ${activeTheme.border.card} ${activeTheme.background.canvas}
    `}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    <span
      className={`text-[11px] font-semibold ${activeTheme.text.muted} capitalize`}
    >
      {label}
    </span>
    <span className={`text-[11px] font-bold ${activeTheme.text.primary}`}>
      {value}
    </span>
  </div>
);

/** Individual card tile in the grid */
const CardTile = ({ card, onClick, activeTheme }) => {
  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;

  return (
    <button
      onClick={() => onClick(card)}
      className={`
        group relative flex flex-col justify-between gap-2
        min-h-[68px] rounded-xl border px-3 py-2.5
        text-left text-xs font-medium
        transition-all duration-150
        hover:-translate-y-0.5 hover:shadow-md
        focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1
        ${tile.bg}
      `}
    >
      <span
        className={`line-clamp-3 text-xs leading-snug ${activeTheme.text.primary}`}
      >
        {card.front}
      </span>
      <span className="flex items-center gap-1">
        <span className={`w-1 h-1 rounded-full ${tile.dot}`} />
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${tile.text}`}
        >
          {status}
        </span>
        {card.due_date && (
          <span className={`ml-auto text-[9px] ${activeTheme.text.muted}`}>
            due
          </span>
        )}
      </span>
    </button>
  );
};

/** Animated skeleton placeholder while a page chunk loads */
const SkeletonTile = ({ activeTheme }) => (
  <div
    className={`
      min-h-[68px] rounded-xl border
      ${activeTheme.border.card} ${activeTheme.background.canvas}
      animate-pulse
    `}
  />
);

// ─── StatusSummaryBar ─────────────────────────────────────────────────────────

/**
 * Thin proportional bar showing the share of each status across all loaded
 * cards. Gives an instant visual snapshot of deck health. Pure display.
 */
const StatusSummaryBar = ({ cardsByPage, totalCardCount }) => {
  const counts = useMemo(() => {
    const all = Object.values(cardsByPage).flat();
    const result = { new: 0, waiting: 0, due: 0, mastered: 0, suspended: 0 };
    all.forEach((c) => {
      const s = c.suspended ? "suspended" : c.status;
      if (s in result) result[s]++;
    });
    return result;
  }, [cardsByPage]);

  const total = totalCardCount || 1;

  return (
    <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
      {STATUS_FILTERS.map((s) => {
        const pct = (counts[s] / total) * 100;
        if (pct < 0.5) return null;
        return (
          <div
            key={s}
            title={`${s}: ${counts[s]}`}
            className={`${STATUS_TILE[s].dot} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
};

// ─── DeckDetails ──────────────────────────────────────────────────────────────

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deckName = useSelector(selectDeckNameById(deckId));
  const deck = useSelector((s) =>
    selectDecks(s).find((d) => d.deck_id === deckId),
  );

  // ── local state
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

  // ── auth
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  // ── data fetching (single responsibility: load one page chunk)
  const fetchPage = React.useCallback(
    async (pageIndex) => {
      if (!deckId || !userId || pageIndex < 0 || pageIndex >= totalPages)
        return;
      setPageLoading((p) => ({ ...p, [pageIndex]: true }));
      setPageError((p) => ({ ...p, [pageIndex]: null }));
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
        setCardsByPage((p) => ({ ...p, [pageIndex]: cards }));
      } catch (err) {
        setPageError((p) => ({
          ...p,
          [pageIndex]: err?.message || "Failed to load cards",
        }));
      } finally {
        setPageLoading((p) => ({ ...p, [pageIndex]: false }));
      }
    },
    [deckId, userId, totalPages, studyMode, dispatch],
  );

  // ── reset + load page 0 whenever deck/user changes
  useEffect(() => {
    if (!deckId || !userId) return;
    setCardsByPage({});
    setPageLoading({});
    setPageError({});
    setExpanded({ 0: true });
    if (totalPages > 0) fetchPage(0);
  }, [deckId, userId, studyMode, totalPages, fetchPage]);

  // ── derived: paginated + filtered view
  const pages = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, idx) => {
        const pageCards = cardsByPage[idx] || [];
        const filtered = filter
          ? pageCards.filter((c) =>
              filter === "suspended"
                ? c.suspended
                : c.status === filter && !c.suspended,
            )
          : pageCards;
        const isLast = idx === totalPages - 1;
        const countOnPage = isLast
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
      }),
    [cardsByPage, filter, pageError, pageLoading, totalCardCount, totalPages],
  );

  // ── derived: status counts for filter pills + stat chips
  const statusCounts = useMemo(() => {
    const all = Object.values(cardsByPage).flat();
    const result = { new: 0, waiting: 0, due: 0, mastered: 0, suspended: 0 };
    all.forEach((c) => {
      const s = c.suspended ? "suspended" : c.status;
      if (s in result) result[s]++;
    });
    return result;
  }, [cardsByPage]);

  // ── interaction: toggle accordion, lazy-fetch if needed
  const toggleGroup = (idx) => {
    setExpanded((prev) => {
      const next = !prev[idx];
      if (
        next &&
        !Object.prototype.hasOwnProperty.call(cardsByPage, idx) &&
        !pageLoading[idx]
      ) {
        fetchPage(idx);
      }
      return { ...prev, [idx]: next };
    });
  };

  // ── interaction: update card from drawer, delegate to CardDetail
  const handleCardUpdate = async (pageToRefresh) => {
    await Promise.all([
      dispatch(fetchDeckCounts({ user_id: userId })),
      fetchPage(pageToRefresh),
    ]);
    setSelectedCard(null);
  };

  // ── render
  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* ══ Hero header ══ */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl shadow-xl overflow-hidden relative`}
        >
          {/* Accent stripe — mirrors Settings page */}
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
          />

          <div className="px-5 pt-6 pb-5 space-y-4">
            {/* Back + title */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className={`
                  mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-xl
                  border ${activeTheme.border.secondary} ${activeTheme.text.muted}
                  hover:${activeTheme.background.canvas} transition-colors
                `}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                  </div>
                  <h1
                    className={`text-xl font-extrabold truncate ${activeTheme.text.primary}`}
                  >
                    {deckName || "Deck Details"}
                  </h1>
                </div>
                <p className={`mt-1 text-xs ${activeTheme.text.muted}`}>
                  Study mode&nbsp;
                  <span className="font-bold">{studyMode}</span>
                  &nbsp;·&nbsp;
                  {totalCardCount} card{totalCardCount !== 1 ? "s" : ""}
                  &nbsp;·&nbsp;
                  {totalPages} set{totalPages !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {totalCardCount > 0 && (
              <StatusSummaryBar
                cardsByPage={cardsByPage}
                totalCardCount={totalCardCount}
              />
            )}

            {/* Stat chips */}
            {totalCardCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((s) =>
                  statusCounts[s] > 0 ? (
                    <StatChip
                      key={s}
                      label={s}
                      value={statusCounts[s]}
                      dot={STATUS_TILE[s].dot}
                      activeTheme={activeTheme}
                    />
                  ) : null,
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ Filter pills ══ */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <FilterPill
              key={s}
              status={s}
              active={filter === s}
              count={statusCounts[s] || 0}
              activeTheme={activeTheme}
              onClick={() => {
                setFilter(filter === s ? null : s);
                setExpanded({ 0: true });
              }}
            />
          ))}
        </div>

        {/* ══ Page groups ══ */}
        <div className="space-y-3">
          {totalPages === 0 && (
            <p
              className={`text-sm ${activeTheme.text.muted} py-12 text-center`}
            >
              No cards in this deck yet.
            </p>
          )}

          {pages.map(
            ({ pageIndex, cards, loaded, loading, error, totalCount }) => (
              <SectionCard key={pageIndex} activeTheme={activeTheme}>
                {/* Accordion header */}
                <button
                  onClick={() => toggleGroup(pageIndex)}
                  className={`
                  flex items-center justify-between w-full px-5 py-3.5
                  text-left transition-colors
                  ${expanded[pageIndex] ? `border-b ${activeTheme.border.card}` : ""}
                `}
                >
                  <span className="flex items-center gap-2.5">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`
                      text-[10px] transition-transform duration-200
                      ${expanded[pageIndex] ? "rotate-0" : "-rotate-90"}
                      ${activeTheme.text.muted}
                    `}
                    />
                    <span
                      className={`text-sm font-bold ${activeTheme.text.primary}`}
                    >
                      Set {pageIndex + 1}
                    </span>
                  </span>
                  <span
                    className={`
                    text-[10px] font-semibold px-2 py-0.5 rounded-full
                    ${activeTheme.background.canvas} ${activeTheme.text.muted}
                    border ${activeTheme.border.card}
                  `}
                  >
                    {totalCount} card{totalCount !== 1 ? "s" : ""}
                  </span>
                </button>

                {/* Accordion body */}
                {expanded[pageIndex] && (
                  <div className="px-5 py-4">
                    {loading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <SkeletonTile key={i} activeTheme={activeTheme} />
                        ))}
                      </div>
                    ) : error ? (
                      <div className="flex items-center gap-2 text-red-400 text-xs py-2">
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
                      <p className={`text-xs ${activeTheme.text.muted} py-2`}>
                        {filter
                          ? `No "${filter}" cards in this set.`
                          : "No cards in this set."}
                      </p>
                    ) : (
                      <p className={`text-xs ${activeTheme.text.muted} py-2`}>
                        Expand to load.
                      </p>
                    )}
                  </div>
                )}
              </SectionCard>
            ),
          )}
        </div>
      </div>

      {/* ══ Card detail drawer (delegated to CardDetail) ══ */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          deckId={deckId}
          userId={userId}
          studyMode={studyMode}
          progressTable={progressTable}
          cardsByPage={cardsByPage}
          activeTheme={activeTheme}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
        />
      )}
    </div>
  );
}
