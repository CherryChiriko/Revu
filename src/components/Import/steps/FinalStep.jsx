import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faThLarge } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";
import { useNavigate } from "react-router-dom";

const FinalStep = ({ activeTheme, logic }) => {
  const navigate = useNavigate();
  const currentProgress = logic.processingProgress?.current ?? 0;
  const totalProgress =
    logic.processingProgress?.total ?? logic.fileContent?.length ?? 0;

  const targetDeckId = logic.targetDeck?.id || logic.createdDeckId;

  return (
    <>
      {logic.isProcessing ? (
        <div
          className="text-center space-y-5 sm:space-y-4 py-10 sm:py-8"
          aria-live="polite"
        >
          <div className="w-20 h-20 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faUpload}
              className={`w-10 h-10 sm:w-8 sm:h-8 ${activeTheme.text.primary} animate-pulse`}
            />
          </div>
          <h3
            className={`text-xl sm:text-lg font-semibold ${activeTheme.text.primary}`}
          >
            Processing Import...
          </h3>
          <p className={`${activeTheme.text.muted} text-base sm:text-sm`}>
            Writing card records
          </p>
          <Bar
            current={currentProgress}
            total={totalProgress}
            activeTheme={activeTheme}
            isLabelOn={true}
          />
        </div>
      ) : logic.uploadError ? (
        <div
          className="text-center space-y-5 sm:space-y-4 py-10 sm:py-8 px-4 max-w-md mx-auto"
          role="alert"
          aria-live="assertive"
        >
          <h3 className="text-xl sm:text-lg font-semibold text-red-600">
            ⚠️ Import Failed
          </h3>
          <p className={`${activeTheme.text.secondary} text-base`}>
            {logic.uploadError}
          </p>
          <button
            onClick={() => logic.setCurrentStep(3)}
            className={`px-8 py-3.5 sm:py-2.5 rounded-full font-bold cursor-pointer transition-all text-base sm:text-sm min-h-12 sm:min-h-0
              ${activeTheme.button.primary} ${activeTheme.text.primary} hover:shadow-lg active:scale-95`}
          >
            Go Back to Previous View
          </button>
        </div>
      ) : (
        <div className="text-center space-y-7 sm:space-y-6 py-10 sm:py-8 max-w-md mx-auto px-4">
          <div className="w-20 h-20 sm:w-16 sm:h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-3xl sm:text-2xl font-bold border border-green-500/20">
            ✓
          </div>
          <div className="space-y-2">
            <h3
              className={`text-2xl sm:text-xl font-bold ${activeTheme.text.primary}`}
            >
              Import Complete!
            </h3>
            <p className={`${activeTheme.text.muted} text-base sm:text-sm`}>
              Successfully processed <strong>{totalProgress}</strong> cards.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/decks", {
                state: { highlightedDeckId: targetDeckId },
              })
            }
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-xl active:scale-[0.98] text-base sm:text-sm min-h-12 sm:min-h-0
              bg-gradient-to-r ${activeTheme.gradients?.from ?? "from-blue-500"} ${activeTheme.gradients?.to ?? "to-indigo-600"} text-white`}
          >
            <FontAwesomeIcon icon={faThLarge} />
            Go to My Decks
          </button>
        </div>
      )}
    </>
  );
};

export default FinalStep;
