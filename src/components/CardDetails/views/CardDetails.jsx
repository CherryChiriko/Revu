import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCircleCheck,
  faPencil,
  faCheck,
  faTrashCan,
  faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useCardDetails } from "../hooks/useCardDetails";
import { CardEdit } from "../components/CardEdit";
import { CardInfo } from "../components/CardInfo";
import { ModalTemplate } from "../../General/ui/ModalTemplate";
import { inputCls } from "../../General/ui/FormStyles";

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
    handleDeleteCard,
    handleResetProgress,
  } = useCardDetails(props);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const isC = studyMode === "C";

  return (
    <ModalTemplate
      isOpen={true}
      onClose={isEditing ? cancelEditing : onClose}
      title="Card Details"
      subtitle=""
      activeTheme={activeTheme}
      maxWidth="max-w-md"
    >
      <div className="relative space-y-6">
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
          <>
            <CardInfo card={card} isC={isC} activeTheme={activeTheme} />

            {/* ── Edit + Suspend row ── */}
            <div className="flex gap-2">
              {/* Edit — ghost/outline, low visual weight */}
              <button
                type="button"
                onClick={startEditing}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
              >
                <FontAwesomeIcon icon={faPencil} className="text-xs" />
                Edit
              </button>

              {/* Suspend — amber warning; Reactivate — green positive */}
              <button
                type="button"
                onClick={toggleSuspension}
                disabled={isToggling || !userId}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                  card.suspended
                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                }`}
              >
                <FontAwesomeIcon
                  icon={card.suspended ? faCircleCheck : faBan}
                  className="text-xs"
                />
                {isToggling
                  ? "Updating…"
                  : card.suspended
                    ? "Reactivate"
                    : "Suspend"}
              </button>
            </div>

            {/* ── Danger Zone ── */}
            <div className="pt-4 border-t">
              <p
                className={`text-xs uppercase text-pretty ${activeTheme.text.danger}`}
              >
                Danger Zone
              </p>
              <div
                className={`flex justify-center gap-3 text-xs ${activeTheme.text.danger}`}
              >
                <button
                  type="button"
                  onClick={() => setConfirmTarget("reset")}
                  className={`py-2 px-3 rounded-xl ${activeTheme.button.danger} font-bold flex items-center justify-center gap-1.5`}
                >
                  <FontAwesomeIcon
                    icon={faArrowRotateLeft}
                    className={activeTheme.text.activeButton}
                  />
                  Reset Progress
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget("delete")}
                  className={`py-2 px-3 rounded-xl ${activeTheme.button.danger} font-bold flex items-center justify-center gap-1.5`}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                  Delete Card
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Action tray ── */}
        <div className="pt-2 space-y-2">
          {(toggleError || saveError) && (
            <p className={`text-xs ${activeTheme.text.danger} text-center`}>
              {toggleError || saveError}
            </p>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
            >
              <FontAwesomeIcon icon={faCheck} />
              {isSaving ? "Saving Changes…" : "Save Changes"}
            </button>
          )}
        </div>

        {/* ── Confirmation overlay ── */}
        {confirmTarget && (
          <div className="absolute inset-0 z-50 rounded-xl bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div
              className={`w-full rounded-2xl border p-5 shadow-2xl ${activeTheme.background.secondary} ${activeTheme.border.card}`}
            >
              <h3 className={`text-sm font-bold ${activeTheme.text.primary}`}>
                {confirmTarget === "delete"
                  ? "Delete Card Permanently?"
                  : "Reset Spaced Repetition?"}
              </h3>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${activeTheme.text.muted}`}
              >
                {confirmTarget === "delete"
                  ? "This completely removes the card and its historical memory weight scores from this deck. This action cannot be reversed."
                  : "This will wipe out current scheduler patterns, intervals, and history, reverting the card back into a fresh 'New' deck status state."}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmTarget === "delete") handleDeleteCard?.();
                    else handleResetProgress?.();
                    setConfirmTarget(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white ${
                    confirmTarget === "delete"
                      ? (activeTheme.button.danger ?? "bg-red-600")
                      : "bg-amber-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalTemplate>
  );
}
