import React from "react";
import { useQuickCreate } from "../hooks/useQuickCreate";
import { SuccessView } from "./copy_steps/SuccessView";
import { StepCopy1 } from "./copy_steps/StepCopy1";
import { StepCopy2 } from "./copy_steps/StepCopy2";

export function CopyDeck({ activeTheme, onCreated }) {
  // Use the parent hook runner context directly
  const logic = useQuickCreate(onCreated);

  const step = !logic.cloneTypeId ? 1 : 2;
  const isSubmitDisabled = !logic.isValid || logic.isSubmitting;

  if (logic.success) {
    return <SuccessView logic={logic} activeTheme={activeTheme} />;
  }

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <>
          <StepCopy1 logic={logic} activeTheme={activeTheme} />
        </>
      ) : (
        <>
          <StepCopy2 logic={logic} activeTheme={activeTheme} />
          <div className="flex justify-between pt-2">
            <button
              onClick={() => {
                logic.clearError(); // Wipes out Supabase/Network error states
                logic.selectCloneType(null); // Safely sets type to null and strips field conflicts
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTheme.border.card} ${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`}
            >
              Back
            </button>
            <button
              onClick={logic.submit}
              disabled={isSubmitDisabled}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${activeTheme.text.activeButton} transition-all
                ${isSubmitDisabled ? activeTheme.button.disabled : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110`}`}
            >
              {logic.isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
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
