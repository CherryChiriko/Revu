import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBan,
  faCircleCheck,
  faCalendarDays,
  faRepeat,
  faGaugeHigh,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../utils/supabaseClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TILE = {
  new: { dot: "bg-gray-400", badge: "bg-gray-400/15  text-gray-400" },
  waiting: { dot: "bg-sky-400", badge: "bg-sky-400/15   text-sky-400" },
  due: { dot: "bg-purple-400", badge: "bg-purple-400/15 text-purple-400" },
  mastered: { dot: "bg-indigo-400", badge: "bg-indigo-400/15 text-indigo-400" },
  suspended: { dot: "bg-red-400", badge: "bg-red-400/15   text-red-400" },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

/** Labelled meta row inside the drawer */
const MetaRow = ({ icon, label, value, activeTheme }) => (
  <div className="flex items-center justify-between gap-4">
    <span
      className={`flex items-center gap-2 text-xs ${activeTheme.text.muted}`}
    >
      <FontAwesomeIcon icon={icon} className="w-3 h-3" />
      {label}
    </span>
    <span
      className={`text-xs font-semibold ${activeTheme.text.secondary} text-right`}
    >
      {value}
    </span>
  </div>
);

// ─── CardDetail ───────────────────────────────────────────────────────────────

/**
 * Props
 *   card          – the card object currently selected
 *   deckId        – current deck id (string)
 *   userId        – authenticated user id (string | null)
 *   studyMode     – "A" | "C"
 *   progressTable – e.g. "card_a_progress"
 *   cardsByPage   – { [pageIndex]: Card[] } — used to find which page to refresh
 *   activeTheme   – theme object
 *   onClose()     – close the drawer without any action
 *   onUpdate(pageToRefresh: number) – called after a suspension toggle so the
 *                                     parent can refresh deck counts + the page
 */
export default function CardDetail({
  card,
  deckId,
  userId,
  studyMode,
  progressTable,
  cardsByPage,
  activeTheme,
  onClose,
  onUpdate,
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState(null);

  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;
  const isSusp = card.suspended;

  const toggleSuspension = async () => {
    if (!userId) return;
    setIsToggling(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from(progressTable).upsert(
        {
          user_id: userId,
          deck_id: deckId,
          card_id: card.card_id,
          ease_factor: card.ease_factor ?? 2.5,
          review_interval: card.review_interval ?? 0,
          repetitions: card.repetitions ?? 0,
          due_date: card.due_date ?? null,
          last_studied: card.last_studied ?? null,
          status: isSusp ? "waiting" : card.status,
          suspended: !isSusp,
        },
        { onConflict: "user_id,card_id" },
      );

      if (dbError) throw dbError;

      // Find which page this card lives in so the parent can refresh it
      const pageKey = Object.keys(cardsByPage).find((pi) =>
        cardsByPage[pi]?.some((c) => c.card_id === card.card_id),
      );
      await onUpdate(pageKey !== undefined ? Number(pageKey) : 0);
    } catch (err) {
      console.error("Failed to update card suspension:", err);
      setError("Could not save — please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Card details"
        className={`
          fixed inset-y-0 right-0 w-full sm:w-[420px] z-50
          ${activeTheme.background.secondary}
          border-l ${activeTheme.border.secondary}
          shadow-2xl flex flex-col overflow-hidden
        `}
      >
        {/* Accent stripe – same as header banner */}
        <div
          className={`h-1 shrink-0 bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
        />

        {/* Drawer header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${activeTheme.border.card} shrink-0`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                text-[10px] font-bold uppercase tracking-wider
                ${tile.badge}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
              {status}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`
              w-8 h-8 flex items-center justify-center rounded-xl
              border ${activeTheme.border.secondary} ${activeTheme.text.muted}
              hover:${activeTheme.background.canvas} transition-colors
            `}
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Front */}
          <section className="space-y-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
            >
              Front
            </label>
            <p
              className={`text-2xl font-extrabold leading-snug ${activeTheme.text.primary}`}
            >
              {card.front}
            </p>
          </section>

          {/* Divider */}
          <div className={`h-px ${activeTheme.background.track}`} />

          {/* Back */}
          <section className="space-y-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
            >
              Back / Meaning
            </label>
            <p
              className={`text-base leading-relaxed ${activeTheme.text.secondary}`}
            >
              {card.back || (
                <span className={activeTheme.text.muted}>
                  No definition provided.
                </span>
              )}
            </p>
          </section>

          {/* Divider */}
          <div className={`h-px ${activeTheme.background.track}`} />

          {/* Meta grid */}
          <section className="space-y-3">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
            >
              Card info
            </label>
            <div className="space-y-2.5">
              {card.due_date && (
                <MetaRow
                  icon={faCalendarDays}
                  label="Due"
                  value={new Date(card.due_date).toLocaleDateString()}
                  activeTheme={activeTheme}
                />
              )}
              {card.ease_factor != null && (
                <MetaRow
                  icon={faGaugeHigh}
                  label="Ease factor"
                  value={Number(card.ease_factor).toFixed(2)}
                  activeTheme={activeTheme}
                />
              )}
              {card.repetitions != null && (
                <MetaRow
                  icon={faRepeat}
                  label="Repetitions"
                  value={card.repetitions}
                  activeTheme={activeTheme}
                />
              )}
              {card.review_interval != null && (
                <MetaRow
                  icon={faCalendarDays}
                  label="Interval"
                  value={`${card.review_interval} day${card.review_interval !== 1 ? "s" : ""}`}
                  activeTheme={activeTheme}
                />
              )}
            </div>
          </section>
        </div>

        {/* Sticky footer CTA */}
        <div
          className={`px-6 py-4 border-t ${activeTheme.border.card} shrink-0 space-y-2`}
        >
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button
            onClick={toggleSuspension}
            disabled={isToggling || !userId}
            className={`
              w-full px-4 py-2.5 rounded-xl text-sm font-bold
              flex items-center justify-center gap-2
              transition-all active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isSusp
                  ? `${activeTheme.button.primary} text-white`
                  : `border ${activeTheme.border.danger} ${activeTheme.text.danger}
                     hover:${activeTheme.background.danger}`
              }
            `}
          >
            <FontAwesomeIcon icon={isSusp ? faCircleCheck : faBan} />
            {isToggling
              ? "Updating…"
              : isSusp
                ? "Reactivate Card"
                : "Suspend Card"}
          </button>
        </div>
      </div>
    </>
  );
}
