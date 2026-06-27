import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLayerGroup,
  faXmark,
  faTags,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { supabase } from "../../../utils/supabaseClient";
import { fetchCardsPage } from "../../../slices/cardSlice";
import {
  fetchDeckCounts,
  selectDecks,
  updateDeckLocally,
} from "../../../slices/deckSlice";
import CardDetail from "../components/CardDetail";
import { DeckMenu } from "../components/DeckMenu";
import DeckDelete from "../components/DeckDelete";
import { CHUNK_SIZE, PROGRESS } from "../../../utils/constants";

const STATUS_FILTERS = ["new", "waiting", "due", "mastered", "suspended"];

const STATUS_TILE = {
  new: { dot: "bg-gray-400", text: "text-gray-400", label: "new" },
  waiting: { dot: "bg-sky-400", text: "text-sky-400", label: "waiting" },
  due: { dot: "bg-purple-400", text: "text-purple-400", label: "due" },
  mastered: {
    dot: "bg-indigo-400",
    text: "text-indigo-400",
    label: "mastered",
  },
  suspended: { dot: "bg-red-400", text: "text-red-400", label: "suspended" },
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const FilterPill = ({ status, active, count, onClick, activeTheme }) => {
  const tile = STATUS_TILE[status];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-150 active:scale-95 ${
        active
          ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} border-transparent text-white shadow-md`
          : `${activeTheme.background.canvas} ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:border-indigo-400`
      }`}
    >
      <span className={`size-1.5 rounded-full ${tile.dot}`} />
      <span className="capitalize">{status}</span>
      <span
        className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums ${
          active
            ? "bg-white/20 text-white"
            : `${activeTheme.background.secondary} ${activeTheme.text.muted}`
        }`}
      >
        {count}
      </span>
    </button>
  );
};

const StatChip = ({ label, value, dot, activeTheme }) => (
  <div
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${activeTheme.border.card} ${activeTheme.background.canvas}`}
  >
    <span className={`size-1.5 rounded-full ${dot}`} />
    <span
      className={`text-[11px] font-semibold ${activeTheme.text.muted} capitalize`}
    >
      {label}
    </span>
    <span
      className={`text-[11px] font-bold tabular-nums ${activeTheme.text.primary}`}
    >
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
      className={`group flex flex-col justify-between gap-2 min-h-[72px] rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${activeTheme.background.canvas} ${activeTheme.border.secondary}`}
    >
      <span
        className={`line-clamp-3 text-xs leading-snug ${activeTheme.text.primary}`}
      >
        {card.front}
      </span>
      <span
        className={`text-xs leading-snug ${activeTheme.text.secondary} line-clamp-1 opacity-60`}
      >
        {card.back}
      </span>
      <span className="flex items-center gap-1">
        <span className={`size-1.5 rounded-full ${tile.dot}`} />
        <span className={`text-[9px] font-bold uppercase ${tile.text}`}>
          {tile.label}
        </span>
      </span>
    </button>
  );
};

const SkeletonTile = ({ activeTheme }) => (
  <div
    className={`min-h-[72px] rounded-xl border ${activeTheme.border.card} ${activeTheme.background.canvas} animate-pulse`}
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

// ─── Deck meta editor ─────────────────────────────────────────────────────────

const C_LANGUAGES = ["Chinese"];

const DeckMetaEditor = ({
  deck,
  deckId,
  activeTheme,
  onSaved,
  onCancel,
  dispatch,
}) => {
  const studyMode = deck?.study_mode ?? "A";
  const isCharacterMode = studyMode === "C";

  const [editName, setEditName] = useState(deck?.name ?? "");
  const [editDescription, setEditDescription] = useState(
    deck?.description ?? "",
  );
  const [editTags, setEditTags] = useState(deck?.tags ?? []);
  const [editLanguage, setEditLanguage] = useState(deck?.language ?? "");
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);

  useEffect(() => {
    if (isCharacterMode) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabase
        .from("decks")
        .select("language")
        .eq("user_id", data.user.id)
        .then(({ data: rows }) => {
          const unique = [...new Set(rows?.map((r) => r.language))].filter(
            Boolean,
          );
          setLanguageSuggestions(unique);
        });
    });
  }, [isCharacterMode]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!editTags.includes(tagInput.trim()))
        setEditTags([...editTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const lang = editLanguage.trim();
      const formattedLang = lang.charAt(0).toUpperCase() + lang.slice(1);
      const { error } = await supabase
        .from("decks")
        .update({
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
          language: formattedLang,
        })
        .eq("id", deckId);
      if (error) throw error;
      dispatch(
        updateDeckLocally({
          id: deckId,
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
          language: formattedLang,
        }),
      );
      onSaved();
    } catch (err) {
      console.error(err);
      setSaveError("Could not save — please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = `w-full rounded-xl px-3 py-2 text-sm border outline-none focus:ring-2 transition-all ${activeTheme.background.canvas} ${activeTheme.text.primary} ${activeTheme.border.secondary} ${activeTheme.ring.focus}`;

  return (
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
          className={`mt-1 ${inputCls}`}
          placeholder="Deck name…"
          autoFocus
        />
      </div>

      <div>
        <label
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Language
        </label>
        {isCharacterMode ? (
          <select
            value={editLanguage}
            onChange={(e) => setEditLanguage(e.target.value)}
            className={`mt-1 ${inputCls}`}
          >
            <option value="" disabled>
              Select language
            </option>
            {C_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              type="text"
              list="language-suggestions"
              value={editLanguage}
              onChange={(e) => setEditLanguage(e.target.value)}
              className={`mt-1 ${inputCls}`}
              placeholder="e.g. Japanese, Spanish…"
            />
            <datalist id="language-suggestions">
              {languageSuggestions.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </>
        )}
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
          className={`mt-1 ${inputCls} resize-none`}
          placeholder="Brief description…"
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
                onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
                aria-label={`Remove tag ${tag}`}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[10px] hover:text-red-400"
                />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={editTags.length === 0 ? "Add tags…" : ""}
            className="flex-1 bg-transparent text-xs px-1 min-w-[60px] focus:outline-none"
          />
        </div>
      </div>

      {saveError && <p className="text-xs text-red-400">{saveError}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} disabled:opacity-50`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !editName.trim()}
          className={`px-3 py-1.5 text-xs font-semibold text-white rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const deck = useSelector((s) =>
    selectDecks(s).find((d) => d.deck_id === deckId || d.id === deckId),
  );

  const [filter, setFilter] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cardsByPage, setCardsByPage] = useState({});
  const [pageLoading, setPageLoading] = useState({});
  const [pageError, setPageError] = useState({});
  const [visiblePages, setVisiblePages] = useState(1);
  const [isEditingMeta, setIsEditingMeta] = useState(
    () => location.state?.openEdit === true,
  );
  const [pendingDelete, setPendingDelete] = useState(null);

  const studyMode = deck?.study_mode || "A";
  const totalCardCount = Number(deck?.cards_count || 0);
  const totalPages = Math.max(0, Math.ceil(totalCardCount / CHUNK_SIZE));
  const progressTable = PROGRESS[studyMode];

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
    for (let i = 0; i < visiblePages && i < totalPages; i++) {
      if (
        !Object.prototype.hasOwnProperty.call(cardsByPage, i) &&
        !pageLoading[i]
      ) {
        fetchPage(i);
      }
    }
  }, [deckId, userId, visiblePages, totalPages]);

  useEffect(() => {
    setCardsByPage({});
    setPageLoading({});
    setPageError({});
    setVisiblePages(1);
    setFilter(null);
  }, [deckId]);

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

  const isLoadingAny = useMemo(
    () => Object.values(pageLoading).some(Boolean),
    [pageLoading],
  );
  const hasMore = visiblePages < totalPages;
  const loadMore = () => setVisiblePages((v) => v + 1);

  const statusCounts = useMemo(() => {
    const all = Object.values(cardsByPage).flat();
    const result = { new: 0, waiting: 0, due: 0, mastered: 0, suspended: 0 };
    all.forEach((c) => {
      const s = c.suspended ? "suspended" : c.status;
      if (s in result) result[s]++;
    });
    return result;
  }, [cardsByPage]);

  const handleCardUpdate = async (pageToRefresh) => {
    await Promise.all([
      dispatch(fetchDeckCounts({ user_id: userId })),
      fetchPage(pageToRefresh),
    ]);
    setSelectedCard(null);
  };

  const handleDeleteDeck = async () => {
    if (!pendingDelete) return;
    try {
      const table = "cards_" + (deck?.study_mode ?? "a").toLowerCase();
      await supabase.from(table).delete().eq("deck_id", deckId);
      await supabase.from("decks").delete().eq("id", deckId);
      navigate(-1);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setPendingDelete(null);
    }
  };

  const loadedCardCount = useMemo(
    () => Object.values(cardsByPage).reduce((sum, p) => sum + p.length, 0),
    [cardsByPage],
  );

  return (
    <div
      className={`min-h-dvh ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back to decks"
          className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Back
        </button>

        {/* Hero: identity only */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl shadow-xl border ${activeTheme.border.card}`}
        >
          <div
            className={`h-1 bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
          />
          <div className="px-5 pt-5 pb-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditingMeta ? (
                  <DeckMetaEditor
                    deck={deck}
                    deckId={deckId}
                    activeTheme={activeTheme}
                    dispatch={dispatch}
                    onSaved={() => setIsEditingMeta(false)}
                    onCancel={() => setIsEditingMeta(false)}
                  />
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                        <FontAwesomeIcon
                          icon={faLayerGroup}
                          className="text-xs"
                        />
                      </div>
                      <h1
                        className={`text-xl font-extrabold truncate text-balance ${activeTheme.text.primary}`}
                      >
                        {deck?.name ?? "Deck Details"}
                      </h1>
                    </div>
                    {deck?.description && (
                      <p
                        className={`text-xs pl-8 max-w-2xl leading-relaxed text-pretty ${activeTheme.text.secondary}`}
                      >
                        {deck.description}
                      </p>
                    )}
                    {deck?.tags?.length > 0 && (
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
                    <p
                      className={`text-xs pl-8 pt-1 ${activeTheme.text.muted}`}
                    >
                      Mode <span className="font-bold">{studyMode}</span>
                      {deck?.language && <>&nbsp;·&nbsp;{deck.language}</>}
                      &nbsp;·&nbsp;
                      <span className="tabular-nums">
                        {totalCardCount}
                      </span>{" "}
                      card{totalCardCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
              {!isEditingMeta && (
                <div className="shrink-0">
                  <DeckMenu
                    activeTheme={activeTheme}
                    onEdit={() => setIsEditingMeta(true)}
                    onDelete={() => setPendingDelete(deck)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health row */}
        {totalCardCount > 0 && (
          <div className="space-y-2.5">
            <StatusSummaryBar
              cardsByPage={cardsByPage}
              totalCardCount={totalCardCount}
            />
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
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <FilterPill
              key={s}
              status={s}
              active={filter === s}
              count={statusCounts[s] || 0}
              activeTheme={activeTheme}
              onClick={() => setFilter(filter === s ? null : s)}
            />
          ))}
        </div>

        {/* Card grid */}
        {totalCardCount === 0 ? (
          <p className={`text-sm ${activeTheme.text.muted} py-12 text-center`}>
            No cards in this deck yet.
          </p>
        ) : (
          <div className="space-y-4">
            {isLoadingAny && visibleCards.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonTile key={i} activeTheme={activeTheme} />
                ))}
              </div>
            ) : visibleCards.length === 0 && filter ? (
              <p
                className={`text-sm ${activeTheme.text.muted} py-12 text-center`}
              >
                No "{filter}" cards loaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {visibleCards.map((card) => (
                  <CardTile
                    key={card.card_id}
                    card={card}
                    onClick={setSelectedCard}
                    activeTheme={activeTheme}
                  />
                ))}
                {isLoadingAny &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTile key={`skel-${i}`} activeTheme={activeTheme} />
                  ))}
              </div>
            )}

            {hasMore && !isLoadingAny && (
              <div className="flex flex-col items-center gap-1 pt-2">
                <p className={`text-xs tabular-nums ${activeTheme.text.muted}`}>
                  Showing {loadedCardCount} of {totalCardCount} cards
                </p>
                <button
                  onClick={loadMore}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} ${activeTheme.background.secondary} hover:${activeTheme.background.canvas}`}
                >
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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

      <DeckDelete
        deckData={pendingDelete}
        activeTheme={activeTheme}
        onConfirm={handleDeleteDeck}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
