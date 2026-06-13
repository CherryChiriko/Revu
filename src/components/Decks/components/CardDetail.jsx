import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBan,
  faCircleCheck,
  faCalendarDays,
  faRepeat,
  faGaugeHigh,
  faPencil,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../utils/supabaseClient";
import { generateReading } from "../../Import/hooks/generateReading";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TILE = {
  new: { dot: "bg-gray-400", badge: "bg-gray-400/15   text-gray-400" },
  waiting: { dot: "bg-sky-400", badge: "bg-sky-400/15    text-sky-400" },
  due: { dot: "bg-purple-400", badge: "bg-purple-400/15 text-purple-400" },
  mastered: { dot: "bg-indigo-400", badge: "bg-indigo-400/15 text-indigo-400" },
  suspended: { dot: "bg-red-400", badge: "bg-red-400/15    text-red-400" },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

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

const SectionLabel = ({ children, activeTheme }) => (
  <label
    className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
  >
    {children}
  </label>
);

// ─── CardDetail ───────────────────────────────────────────────────────────────

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
  // ── Suspension state
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  // ── Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(card.front ?? "");
  const [editBack, setEditBack] = useState(card.back ?? "");
  const [editReading, setEditReading] = useState(card.reading ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;
  const isSusp = card.suspended;
  const isC = studyMode === "C";

  // ── Derived target table (cards_a / cards_c)
  const cardTable = `cards_${studyMode.toLowerCase()}`;

  // ── Enter edit mode — reset fields to current card values
  const startEditing = () => {
    setEditFront(card.front ?? "");
    setEditBack(card.back ?? "");
    setEditReading(card.reading ?? "");
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  // ── Save card content edits
  const handleSave = async () => {
    const front = editFront.trim();
    const back = editBack.trim();
    if (!front || !back) {
      setSaveError("Front and back cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let payload = { front, back };
      console.log("Saving card with payload:", payload);

      if (isC) {
        // Re-derive reading/tones/strokeColors if the character changed
        const frontChanged = front !== card.front;
        const readingHint = editReading.trim() || null;

        if (frontChanged || readingHint !== card.reading) {
          const derived = generateReading(front, "Chinese", readingHint);
          payload = {
            ...payload,
            reading: derived.reading ?? readingHint,
            tones: derived.tones ?? null,
            strokeColors: derived.strokeColors ?? null,
          };
        } else {
          payload.reading = card.reading ?? null;
        }
      }
      console.log(card.card_id);
      const { error: dbError } = await supabase
        .from(cardTable)
        .update(payload)
        .eq("id", card.card_id);

      if (dbError) throw dbError;
      console.log("Success", payload);
      // Find the page this card lives on so the parent refreshes it
      const pageKey = Object.keys(cardsByPage).find((pi) =>
        cardsByPage[pi]?.some((c) => c.card_id === card.card_id),
      );
      await onUpdate(pageKey !== undefined ? Number(pageKey) : 0);

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save card edit:", err);
      setSaveError("Could not save — please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Suspension toggle (unchanged logic)
  const toggleSuspension = async () => {
    if (!userId) return;
    setIsToggling(true);
    setToggleError(null);

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

      const pageKey = Object.keys(cardsByPage).find((pi) =>
        cardsByPage[pi]?.some((c) => c.card_id === card.card_id),
      );
      await onUpdate(pageKey !== undefined ? Number(pageKey) : 0);
    } catch (err) {
      console.error("Failed to update card suspension:", err);
      setToggleError("Could not save — please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  // ── Input style helper
  const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none
    focus:ring-2 transition-all duration-150
    ${activeTheme.background.canvas} ${activeTheme.text.primary}
    ${activeTheme.border.default ?? activeTheme.border.card}
    ${activeTheme.ring?.input ?? "focus:ring-violet-300"}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={isEditing ? undefined : onClose}
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
        {/* Accent stripe */}
        <div
          className={`h-1 shrink-0 bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
        />

        {/* Drawer header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${activeTheme.border.card} shrink-0`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tile.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / Cancel toggle */}
            {!isEditing ? (
              <button
                onClick={startEditing}
                aria-label="Edit card"
                className={`w-8 h-8 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.muted} hover:${activeTheme.background.canvas} transition-colors`}
              >
                <FontAwesomeIcon icon={faPencil} className="text-xs" />
              </button>
            ) : (
              <button
                onClick={cancelEditing}
                aria-label="Cancel edit"
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.secondary} transition-colors`}
              >
                Cancel
              </button>
            )}

            <button
              onClick={isEditing ? undefined : onClose}
              disabled={isEditing}
              aria-label="Close"
              className={`w-8 h-8 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.muted} hover:${activeTheme.background.canvas} transition-colors disabled:opacity-30`}
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {isEditing ? (
            /* ── EDIT MODE ── */
            <div className="space-y-5">
              <div className="space-y-1.5">
                <SectionLabel activeTheme={activeTheme}>Front</SectionLabel>
                <input
                  type="text"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  placeholder={isC ? "Chinese character(s)" : "Word or phrase"}
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <SectionLabel activeTheme={activeTheme}>
                  Back / Meaning
                </SectionLabel>
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  placeholder="Meaning or translation"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {isC && (
                <div className="space-y-1.5">
                  <SectionLabel activeTheme={activeTheme}>
                    Reading (Pinyin)
                  </SectionLabel>
                  <input
                    type="text"
                    value={editReading}
                    onChange={(e) => setEditReading(e.target.value)}
                    placeholder="e.g. nǐ hǎo  (auto-generated if blank)"
                    className={inputCls}
                  />
                  <p className={`text-[10px] ${activeTheme.text.muted}`}>
                    Changing the character will regenerate tones and stroke
                    colours automatically.
                  </p>
                </div>
              )}

              {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            </div>
          ) : (
            /* ── VIEW MODE ── */
            <>
              <section className="space-y-1.5">
                <SectionLabel activeTheme={activeTheme}>Front</SectionLabel>
                <p
                  className={`text-2xl font-extrabold leading-snug ${activeTheme.text.primary}`}
                >
                  {card.front}
                </p>
              </section>

              <div className={`h-px ${activeTheme.background.track}`} />

              <section className="space-y-1.5">
                <SectionLabel activeTheme={activeTheme}>
                  Back / Meaning
                </SectionLabel>
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

              {isC && card.reading && (
                <>
                  <div className={`h-px ${activeTheme.background.track}`} />
                  <section className="space-y-1.5">
                    <SectionLabel activeTheme={activeTheme}>
                      Reading
                    </SectionLabel>
                    <p className={`text-base ${activeTheme.text.secondary}`}>
                      {card.reading}
                    </p>
                  </section>
                </>
              )}

              <div className={`h-px ${activeTheme.background.track}`} />

              <section className="space-y-3">
                <SectionLabel activeTheme={activeTheme}>Card info</SectionLabel>
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
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div
          className={`px-6 py-4 border-t ${activeTheme.border.card} shrink-0 space-y-2`}
        >
          {(toggleError || saveError) && (
            <p className="text-xs text-red-400 text-center">
              {toggleError || saveError}
            </p>
          )}

          {isEditing ? (
            /* Save button in edit mode */
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
            >
              <FontAwesomeIcon icon={faCheck} />
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          ) : (
            /* Suspend/reactivate in view mode */
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
                    : `border ${activeTheme.border.danger} ${activeTheme.text.danger} hover:${activeTheme.background.danger}`
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
          )}
        </div>
      </div>
    </>
  );
}
