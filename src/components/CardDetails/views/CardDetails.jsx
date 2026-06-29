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
import { ModalTemplate } from "../../General/ui/ModalTemplate"; // Reusing your new template!
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

  const [confirmTarget, setConfirmTarget] = useState(null); // 'delete' | 'reset' | null
  const isC = studyMode === "C";

  return (
    <ModalTemplate
      isOpen={true} // Controlled by parent mounting state
      onClose={isEditing ? undefined : onClose} // Prevent accidental overlay close during edits
      title="Card Details"
      subtitle=""
      activeTheme={activeTheme}
      maxWidth="max-w-md"
    >
      <div className="relative space-y-6">
        {/* Dynamic Display Switchboard */}
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

            <div className="flex justify-center gap-3">
              {/* Toggle Edit Control Layer */}
              <div
                className={`flex justify-end -mt-2 text-xs ${activeTheme.text.secondary}`}
              >
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 hover:${activeTheme.background.canvas}`}
                  >
                    <FontAwesomeIcon
                      icon={faPencil}
                      className={`${activeTheme.text.activeButton}`}
                    />
                    Edit Card
                  </button>
                ) : (
                  //   <button
                  //     type="button"
                  //     onClick={startEditing}
                  //     className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors
                  // ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`}
                  //   >
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors
                ${activeTheme.border.secondary} ${activeTheme.text.muted} `}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={toggleSuspension}
                disabled={isToggling || !userId}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${card.suspended ? `${activeTheme.button.primary} ${activeTheme.text.activeButton}` : `border ${activeTheme.border.danger} ${activeTheme.text.danger} hover:${activeTheme.background.danger}`}`}
              >
                <FontAwesomeIcon
                  icon={card.suspended ? faCircleCheck : faBan}
                />
                {isToggling
                  ? "Updating Status…"
                  : card.suspended
                    ? "Reactivate Card"
                    : "Suspend Card"}
              </button>
            </div>

            {/* Destructive Option Partition */}
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
                  className={`py-2 px-3 rounded-xl ${activeTheme.button.danger} font-bold flex items-center justify-center gap-1.5 `}
                >
                  <FontAwesomeIcon
                    icon={faArrowRotateLeft}
                    className={`${activeTheme.text.activeButton}`}
                  />
                  Reset Progress
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget("delete")}
                  className={`py-2 px-3 rounded-xl ${activeTheme.button.danger} font-bold flex items-center justify-center gap-1.5 `}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                  Delete Card
                </button>
              </div>
            </div>
          </>
        )}

        {/* Primary Operational Action Tray */}
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

        {/* Inline Safety Confirmation Overlap Layer */}
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white ${confirmTarget === "delete" ? (activeTheme.button.danger ?? "bg-red-600") : "bg-amber-600"}`}
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
