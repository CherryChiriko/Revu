import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faThLarge } from "@fortawesome/free-solid-svg-icons"; // Added faThLarge
import { Bar } from "../../General/ui/Bar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const FinalStep = ({ activeTheme, logic }) => {
  const navigate = useNavigate();
  const currentProgress = logic.processingProgress?.current ?? 0;
  const totalProgress =
    logic.processingProgress?.total ?? logic.fileContent?.length ?? 0;

  // Grab the target deck ID from your hook's state (adjust key naming if different in useImportLogic)
  const targetDeckId = logic.targetDeck?.id || logic.createdDeckId;

  return (
    <>
      {logic.isProcessing ? (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faUpload}
              className={`w-8 h-8 ${activeTheme.text.primary} animate-pulse`}
            />
          </div>
          <h3 className={`text-lg font-semibold ${activeTheme.text.primary}`}>
            Processing Import...
          </h3>
          <p className={`${activeTheme.text.muted} text-sm`}>
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
        <div className="text-center space-y-4 py-8 px-4 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600">
            ⚠️ Import Failed
          </h3>
          <p className={`${activeTheme.text.secondary} text-md`}>
            {logic.uploadError}
          </p>
          <button
            onClick={() => logic.setCurrentStep(3)}
            className={`px-8 py-2.5 rounded-full font-bold cursor-pointer transition-all
              ${activeTheme.button.primary} ${activeTheme.text.primary} hover:shadow-lg active:scale-95`}
          >
            Go Back to Previous View
          </button>
        </div>
      ) : (
        /* SUCCESS VIEW: Added action button to View Decks */
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-2xl font-bold border border-green-500/20">
            ✓
          </div>
          <div className="space-y-2">
            <h3 className={`text-xl font-bold ${activeTheme.text.primary}`}>
              Import Complete!
            </h3>
            <p className={`${activeTheme.text.muted} text-sm`}>
              Successfully processed <strong>{totalProgress}</strong> cards.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/decks", { state: { highlightedDeckId: targetDeckId } })
            }
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-xl active:scale-[0.98]
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
