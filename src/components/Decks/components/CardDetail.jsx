import React, { useState } from "react";
import { STATUS_COLOR } from "../../Study/constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBan,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

const CardDetail = ({ card, setSelectedCard, activeTheme }) => {
  const [isTogglingSuspension, setIsTogglingSuspension] = useState(false);
  const toggleCardSuspension = async () => {
    // if (!selectedCard || !userId) return;
    // const suspended = !selectedCard.suspended;
    // setIsTogglingSuspension(true);
    // try {
    //   const { error } = await supabase.from(progressTable).upsert(
    //     {
    //       user_id: userId,
    //       deck_id: deckId,
    //       card_id: selectedCard.card_id,
    //       ease_factor: selectedCard.ease_factor ?? 2.5,
    //       review_interval: selectedCard.review_interval ?? 0,
    //       repetitions: selectedCard.repetitions ?? 0,
    //       due_date: selectedCard.due_date ?? null,
    //       last_studied: selectedCard.last_studied ?? null,
    //       status: selectedCard.suspended ? "waiting" : selectedCard.status,
    //       suspended,
    //     },
    //     { onConflict: "user_id,card_id" },
    //   );
    //   if (error) throw error;
    //   const pageKey = Object.keys(cardsByPage).find((pi) =>
    //     cardsByPage[pi]?.some((c) => c.card_id === selectedCard.card_id),
    //   );
    //   const pageToRefresh = pageKey !== undefined ? Number(pageKey) : 0;
    //   await Promise.all([
    //     dispatch(fetchDeckCounts({ user_id: userId })),
    //     fetchPage(pageToRefresh),
    //   ]);
    //   setSelectedCard(null);
    // } catch (err) {
    //   console.error("Failed to update card suspension:", err);
    // } finally {
    //   setIsTogglingSuspension(false);
    // }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => setSelectedCard(null)}
      />

      {/* Panel */}
      <div
        className={`
              fixed inset-y-0 right-0 w-full sm:w-[420px]
              ${activeTheme.background.card}
              border-l ${activeTheme.border.secondary}
              shadow-2xl z-50
              flex flex-col
            `}
        role="dialog"
        aria-modal="true"
        aria-label="Card details"
      >
        {/* Drawer header */}
        <div
          className={`
                flex items-center justify-between
                px-6 py-4 border-b ${activeTheme.border.card}
              `}
        >
          <span
            className={`text-xs font-bold uppercase tracking-widest ${activeTheme.text.muted}`}
          >
            Card Details
          </span>
          <button
            onClick={() => setSelectedCard(null)}
            className={`
                  w-8 h-8 flex items-center justify-center rounded-full
                  ${activeTheme.text.muted}
                  hover:${activeTheme.background.secondary}
                  transition-colors
                `}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status badge */}
          <div>
            {(() => {
              const status = card.suspended ? "suspended" : card.status;
              return (
                <span
                  className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                        text-[10px] font-bold uppercase tracking-widest
                        ${STATUS_COLOR[status]}
                      `}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[status]}`}
                  />
                  {status}
                </span>
              );
            })()}
          </div>

          {/* Front */}
          <section className="space-y-2">
            <label
              className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}
            >
              Front
            </label>
            <p
              className={`text-2xl font-bold leading-snug ${activeTheme.text.primary}`}
            >
              {card.front}
            </p>
          </section>

          {/* Back */}
          <section className="space-y-2">
            <label
              className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}
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

          {/* Meta */}
          <div
            className={`
                  grid grid-cols-2 gap-3 pt-4 border-t ${activeTheme.border.card}
                  text-xs ${activeTheme.text.muted}
                `}
          >
            {card.due_date && (
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1">
                  Due
                </div>
                <div>{new Date(card.due_date).toLocaleDateString()}</div>
              </div>
            )}
            {card.repetitions != null && (
              <div>
                <div className="font-semibold uppercase tracking-wider mb-1">
                  Reps
                </div>
                <div>{card.repetitions}</div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer footer — sticky CTA */}
        <div className={`px-6 py-4 border-t ${activeTheme.border.card}`}>
          <button
            onClick={toggleCardSuspension}
            disabled={isTogglingSuspension}
            className={`
                  w-full px-4 py-2.5 rounded-xl text-sm font-semibold
                  flex items-center justify-center gap-2
                  transition-all active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    card.suspended
                      ? `${activeTheme.button.primary} ${activeTheme.text.primary}`
                      : `border ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:border-red-400 hover:${activeTheme.text.primary}`
                  }
                `}
          >
            <FontAwesomeIcon icon={card.suspended ? faCircleCheck : faBan} />
            {isTogglingSuspension
              ? "Updating…"
              : card.suspended
                ? "Reactivate Card"
                : "Suspend Card"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CardDetail;
