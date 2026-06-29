import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBan,
  faCircleCheck,
  faPencil,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { STATUS_TILE } from "../../DeckDetails/components/SharedStyles";
import { useCardDetails } from "../hooks/useCardDetails";
import { CardEdit } from "../components/CardEdit";
import { CardInfo } from "../components/CardInfo";

export default function CardDetails(props) {
  const { card, studyMode, activeTheme, onClose, userId } = props;

  const {
    isEditing,
    editFront,
    setEditFront,
    editBack,
    setEditBack,
    editReading,
    setEditReading,
    isSaving,
    saveError,
    isToggling,
    toggleError,
    startEditing,
    cancelEditing,
    handleSave,
    toggleSuspension,
  } = useCardDetails(props);

  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;
  const isC = studyMode === "C";

  const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none
    focus:ring-2 transition-all duration-150
    ${activeTheme.background.canvas} ${activeTheme.text.primary}
    ${activeTheme.border.default ?? activeTheme.border.card}
    ${activeTheme.ring?.input ?? "focus:ring-violet-300"}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={isEditing ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Card details"
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] z-50 ${activeTheme.background.secondary} border-l ${activeTheme.border.secondary} shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${activeTheme.border.card} shrink-0`}
        >
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tile.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
            {status}
          </span>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={startEditing}
                  aria-label="Edit card"
                  className={`w-8 h-8 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.muted} hover:${activeTheme.background.canvas} transition-colors`}
                >
                  <FontAwesomeIcon icon={faPencil} className="text-xs" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className={`w-8 h-8 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.muted} hover:${activeTheme.background.canvas} transition-colors`}
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </>
            ) : (
              <button
                onClick={cancelEditing}
                aria-label="Cancel edit"
                className={`px-3 py-2 text-xs font-semibold rounded-xl border ${activeTheme.border.secondary} ${activeTheme.text.secondary} transition-colors`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {isEditing ? (
            <CardEdit
              editFront={editFront}
              setEditFront={setEditFront}
              editBack={editBack}
              setEditBack={setEditBack}
              editReading={editReading}
              setEditReading={setEditReading}
              isC={isC}
              activeTheme={activeTheme}
              inputCls={inputCls}
            />
          ) : (
            <CardInfo card={card} isC={isC} activeTheme={activeTheme} />
          )}
        </div>

        {/* Sticky Footer */}
        <div
          className={`px-6 py-4 border-t ${activeTheme.border.card} shrink-0 space-y-2`}
        >
          {(toggleError || saveError) && (
            <p className="text-xs text-red-400 text-center">
              {toggleError || saveError}
            </p>
          )}

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
            >
              <FontAwesomeIcon icon={faCheck} />
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={toggleSuspension}
              disabled={isToggling || !userId}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${card.suspended ? `${activeTheme.button.primary} text-white` : `border ${activeTheme.border.danger} ${activeTheme.text.danger} hover:${activeTheme.background.danger}`}`}
            >
              <FontAwesomeIcon icon={card.suspended ? faCircleCheck : faBan} />
              {isToggling
                ? "Updating…"
                : card.suspended
                  ? "Reactivate Card"
                  : "Suspend Card"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
