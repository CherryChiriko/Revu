import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faChevronRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useQuickCreate } from "../hooks/useQuickCreate";
import { SuccessView } from "./copy_subcomponents/SuccessView";
import { StepDeck } from "./copy_subcomponents/StepDeck";
import { StepOptions } from "./copy_subcomponents/StepOption";

export function CopyDeck({ activeTheme, isOpen, onClose, onBack }) {
  const logic = useQuickCreate(onClose);

  if (!isOpen) return null;

  const step = !logic.cloneTypeId ? 1 : 2;
  const isNextDisabled = !logic.cloneTypeId;
  const isSubmitDisabled = !logic.isValid || logic.isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{
        backgroundColor: activeTheme.isDark
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(15, 23, 42, 0.3)",
      }}
      onClick={(e) => e.target === e.currentTarget && logic.handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border
        ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 pt-5 pb-3 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex items-center gap-2">
            {onBack && !logic.success && (
              <button
                onClick={onBack}
                className={`p-1.5 rounded-lg transition-colors focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.muted}`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="text-left">
              <h2 className={`text-base font-bold ${activeTheme.text.primary}`}>
                Clone Deck
              </h2>
              {!logic.success && (
                <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                  {step === 1
                    ? "Select a deck and clone type"
                    : "Configure your clone"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={logic.handleClose}
            className={`p-1.5 rounded-lg transition-colors focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
            aria-label="close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 pb-6 pt-4">
          {logic.success ? (
            <SuccessView logic={logic} activeTheme={activeTheme} />
          ) : step === 1 ? (
            <div className="space-y-4">
              <StepDeck logic={logic} activeTheme={activeTheme} />
              <div className="flex justify-end pt-2">
                <button
                  disabled={isNextDisabled}
                  onClick={() => {}} /* Handled inherently by hook node states */
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 text-white transition-all
                    ${
                      isNextDisabled
                        ? activeTheme.button.disabled
                        : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110`
                    }`}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <StepOptions logic={logic} activeTheme={activeTheme} />
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => logic.selectCloneType(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTheme.border.card} ${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`}
                >
                  Back
                </button>
                <button
                  onClick={logic.submit}
                  disabled={isSubmitDisabled}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-white transition-all
                    ${
                      isSubmitDisabled
                        ? activeTheme.button.disabled
                        : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110`
                    }`}
                >
                  {logic.isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Cloning…
                    </>
                  ) : (
                    "Clone Deck"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
