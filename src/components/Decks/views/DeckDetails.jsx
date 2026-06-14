import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faBan,
  faLayerGroup,
  faXmark,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import { supabase } from "../../../utils/supabaseClient";
import { fetchCardsPage } from "../../../slices/cardSlice";
import {
  fetchDeckCounts,
  selectDeckNameById,
  selectDecks,
  updateDeckLocally, // Imported from your actions
} from "../../../slices/deckSlice";
import CardDetail from "../components/CardDetail";
import { DeckMenu } from "../components/DeckMenu"; // Ensure path matches your setup
import { CHUNK_SIZE } from "../../../utils/constants";

const STATUS_FILTERS = ["new", "waiting", "due", "mastered", "suspended"];

const STATUS_TILE = {
  new: {
    bg: "bg-gray-400/10 border-gray-400/20",
    dot: "bg-gray-400",
    text: "text-gray-400",
  },
  waiting: {
    bg: "bg-sky-400/10 border-sky-400/20",
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
    bg: "bg-red-400/10 border-red-400/20",
    dot: "bg-red-400",
    text: "text-red-400",
  },
};

// ─── Primitive components ─────────────────────────────────────────────────────
const SectionCard = ({ children, activeTheme, className = "" }) => (
  <div
    className={` ${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl shadow-lg overflow-hidden ${className} `}
  >
    {children}
  </div>
);

const FilterPill = ({ status, active, count, onClick, activeTheme }) => {
  const tile = STATUS_TILE[status];
  return (
    <button
      onClick={onClick}
      className={` inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-150 active:scale-95 ${
        active
          ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} border-transparent text-white shadow-md`
          : `${activeTheme.background.canvas} ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:border-indigo-400`
      } `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
      <span className="capitalize">{status}</span>
      <span
        className={` ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${active ? "bg-white/20 text-white" : `${activeTheme.background.secondary} ${activeTheme.text.muted}`} `}
      >
        {count}
      </span>
    </button>
  );
};

const StatChip = ({ label, value, dot, activeTheme }) => (
  <div
    className={` flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${activeTheme.border.card} ${activeTheme.background.canvas} `}
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

const CardTile = ({ card, onClick, activeTheme }) => {
  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;
  return (
    <button
      onClick={() => onClick(card)}
      className={` group relative flex flex-col justify-between gap-2 min-h-[68px] rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${tile.bg} `}
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

const SkeletonTile = ({ activeTheme }) => (
  <div
    className={` min-h-[68px] rounded-xl border ${activeTheme.border.card} ${activeTheme.background.canvas} animate-pulse `}
  />
);

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deckName = useSelector(selectDeckNameById(deckId));
  const deck = useSelector((s) =>
    selectDecks(s).find((d) => d.deck_id === deckId || d.id === deckId),
  );

  // ── local data state
  const [filter, setFilter] = useState(null);
  const [expanded, setExpanded] = useState({ 0: true });
  const [selectedCard, setSelectedCard] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cardsByPage, setCardsByPage] = useState({});
  const [pageLoading, setPageLoading] = useState({});
  const [pageError, setPageError] = useState({});

  // ── local EDIT form state
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const studyMode = deck?.study_mode || "A";
  const totalCardCount = Number(deck?.cards_count || 0);
  const totalPages = Math.max(0, Math.ceil(totalCardCount / CHUNK_SIZE));
  const progressTable = `card_${studyMode.toLowerCase()}_progress`;

  // ── Sync internal edit state when deck info loads/updates
  useEffect(() => {
    if (deck) {
      setEditName(deck.name || "");
      setEditDescription(deck.description || "");
      setEditTags(deck.tags || []);
    }
  }, [deck]);

  // ── auth
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  // ── data fetching
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

  useEffect(() => {
    if (!deckId || !userId) return;
    setCardsByPage({});
    setPageLoading({});
    setPageError({});
    setExpanded({ 0: true });
    if (totalPages > 0) fetchPage(0);
  }, [deckId, userId, studyMode, totalPages, fetchPage]);

  // ── derived views & counts
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

  const statusCounts = useMemo(() => {
    const all = Object.values(cardsByPage).flat();
    const result = { new: 0, waiting: 0, due: 0, mastered: 0, suspended: 0 };
    all.forEach((c) => {
      const s = c.suspended ? "suspended" : c.status;
      if (s in result) result[s]++;
    });
    return result;
  }, [cardsByPage]);

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

  const handleCardUpdate = async (pageToRefresh) => {
    await Promise.all([
      dispatch(fetchDeckCounts({ user_id: userId })),
      fetchPage(pageToRefresh),
    ]);
    setSelectedCard(null);
  };

  // ── PERSIST EDIT TO SUPABASE
  const handleSaveDeckMeta = async () => {
    if (!editName.trim()) return;
    setIsSavingMeta(true);

    try {
      const { error } = await supabase
        .from("decks")
        .update({
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
        })
        .eq("id", deckId);

      if (error) throw error;

      // Update Redux system locally so changes populate globally immediately
      dispatch(
        updateDeckLocally({
          id: deckId,
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
        }),
      );

      setIsEditingMeta(false);
    } catch (err) {
      console.error("Failed to update deck settings:", err);
      alert("Error saving updates: " + err.message);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!editTags.includes(tagInput.trim())) {
        setEditTags([...editTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* ══ Hero Header Layout ══ */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl shadow-xl overflow-hidden relative border ${activeTheme.border.card}`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
          />

          <div className="px-5 pt-6 pb-5 space-y-4">
            {/* Top Row: Navigation Button + Interactive Content Row */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className={`mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.muted} hover:${activeTheme.background.canvas} transition-colors`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  {/* Dynamic Core Metadata Block */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {isEditingMeta ? (
                      /* EDIT STATE INTERFACE */
                      <div className="space-y-3 max-w-xl">
                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
                          >
                            Deck Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={`mt-1 text-sm font-semibold px-3 py-2 w-full rounded-xl border focus:outline-none focus:ring-2 ${activeTheme.ring.focus} ${activeTheme.background.canvas} ${activeTheme.border.secondary} ${activeTheme.text.primary}`}
                            placeholder="Enter deck name..."
                          />
                        </div>

                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
                          >
                            Description
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            className={`mt-1 text-xs px-3 py-2 w-full rounded-xl border focus:outline-none focus:ring-2 ${activeTheme.ring.focus} ${activeTheme.background.canvas} ${activeTheme.border.secondary} ${activeTheme.text.primary} resize-none`}
                            placeholder="Add a brief description describing this collection..."
                          />
                        </div>

                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
                          >
                            Tags (Press Enter)
                          </label>
                          <div
                            className={`mt-1 flex flex-wrap gap-1.5 p-2 rounded-xl border min-h-[40px] ${activeTheme.background.canvas} ${activeTheme.border.secondary}`}
                          >
                            {editTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[11px] font-medium px-2 py-0.5 rounded-md border border-indigo-500/20"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:text-red-400 transition-colors"
                                >
                                  <FontAwesomeIcon
                                    icon={faXmark}
                                    className="text-[10px]"
                                  />
                                </button>
                              </span>
                            ))}
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleAddTag}
                              placeholder={
                                editTags.length === 0 ? "Add tags..." : ""
                              }
                              className="flex-1 bg-transparent text-xs px-1 min-w-[60px] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* DEFAULT DISPLAY STATE */
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                            <FontAwesomeIcon
                              icon={faLayerGroup}
                              className="text-xs"
                            />
                          </div>
                          <h1
                            className={`text-xl font-extrabold truncate ${activeTheme.text.primary}`}
                          >
                            {deck?.name || "Deck Details"}
                          </h1>
                        </div>

                        {deck?.description && (
                          <p
                            className={`text-xs pl-8 max-w-2xl leading-relaxed ${activeTheme.text.secondary}`}
                          >
                            {deck.description}
                          </p>
                        )}

                        {deck?.tags && deck.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 pl-8">
                            {deck.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-500/5 border ${activeTheme.border.secondary} ${activeTheme.text.muted}`}
                              >
                                <FontAwesomeIcon
                                  icon={faTags}
                                  className="text-[9px] opacity-60"
                                />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Context Header Actions Toggle */}
                  <div className="shrink-0 pt-0.5">
                    {isEditingMeta ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            // Reset local states to active database records
                            setEditName(deck?.name || "");
                            setEditDescription(deck?.description || "");
                            setEditTags(deck?.tags || []);
                            setIsEditingMeta(false);
                          }}
                          disabled={isSavingMeta}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} disabled:opacity-50`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDeckMeta}
                          disabled={isSavingMeta || !editName.trim()}
                          className={`px-3 py-1.5 text-xs font-semibold text-white rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
                        >
                          {isSavingMeta ? "Saving..." : "Save"}
                        </button>
                      </div>
                    ) : (
                      <DeckMenu
                        activeTheme={activeTheme}
                        onEdit={() => setIsEditingMeta(true)}
                        onDelete={() => {
                          /* Handled via your context logic hook hook */
                        }}
                      />
                    )}
                  </div>
                </div>

                <p className={`mt-3 text-xs pl-8 ${activeTheme.text.muted}`}>
                  Study mode&nbsp;<span className="font-bold">{studyMode}</span>
                  &nbsp;·&nbsp;
                  {totalCardCount} card{totalCardCount !== 1 ? "s" : ""}
                  &nbsp;·&nbsp;
                  {totalPages} set{totalPages !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Progress metric indicators */}
            {totalCardCount > 0 && (
              <StatusSummaryBar
                cardsByPage={cardsByPage}
                totalCardCount={totalCardCount}
              />
            )}

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

        {/* ══ Page groups accordion ══ */}
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
                <button
                  onClick={() => toggleGroup(pageIndex)}
                  className={` flex items-center justify-between w-full px-5 py-3.5 text-left transition-colors ${expanded[pageIndex] ? `border-b ${activeTheme.border.card}` : ""} `}
                >
                  <span className="flex items-center gap-2.5">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={` text-[10px] transition-transform duration-200 ${expanded[pageIndex] ? "rotate-0" : "-rotate-90"} ${activeTheme.text.muted} `}
                    />
                    <span
                      className={`text-sm font-bold ${activeTheme.text.primary}`}
                    >
                      Set {pageIndex + 1}
                    </span>
                  </span>
                  <span
                    className={` text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeTheme.background.canvas} ${activeTheme.text.muted} border ${activeTheme.border.card} `}
                  >
                    {totalCount} card{totalCount !== 1 ? "s" : ""}
                  </span>
                </button>

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

      {/* Drawer overlay delegated viewport details */}
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
