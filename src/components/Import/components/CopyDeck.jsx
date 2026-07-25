import React from "react";
import { useQuickCreate } from "../hooks/useQuickCreate";
import { SuccessView } from "./copy_steps/SuccessView";
import { StepCopy1 } from "./copy_steps/StepCopy1";
import { StepCopy2 } from "./copy_steps/StepCopy2";

export function CopyDeck({ activeTheme, onCreated }) {
  const logic = useQuickCreate(onCreated);

  const step = !logic.cloneTypeId ? 1 : 2;
  const isSubmitDisabled = !logic.isValid || logic.isSubmitting;

  if (logic.success) {
    return <SuccessView logic={logic} activeTheme={activeTheme} />;
  }

  return (
    <div className="space-y-5 sm:space-y-4">
      {step === 1 ? (
        <StepCopy1 logic={logic} activeTheme={activeTheme} />
      ) : (
        <>
          <StepCopy2 logic={logic} activeTheme={activeTheme} />
          <div className="flex flex-col sm:flex-row justify-between pt-2 gap-3">
            <button
              onClick={() => {
                logic.clearError();
                logic.selectCloneType(null);
              }}
              className={`px-4 py-3.5 sm:py-2 rounded-xl text-base sm:text-sm font-semibold border transition-colors min-h-12 sm:min-h-0 ${activeTheme.border.card} ${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`}
            >
              Back
            </button>
            <button
              onClick={logic.submit}
              disabled={isSubmitDisabled}
              aria-busy={logic.isSubmitting}
              className={`px-4 py-3.5 sm:py-2 rounded-xl text-base sm:text-sm font-semibold flex items-center justify-center gap-2 min-h-12 sm:min-h-0 ${activeTheme.text.activeButton} transition-all
                ${isSubmitDisabled ? activeTheme.button.disabled : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110`}`}
            >
              {logic.isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 sm:w-3.5 sm:h-3.5 border-2 border-current border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                "Create Deck"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
