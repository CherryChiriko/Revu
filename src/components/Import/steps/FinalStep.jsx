import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";

const FinalStep = ({ activeTheme, logic }) => {
  const currentProgress = logic.processingProgress?.current ?? 0;
  const totalProgress =
    logic.processingProgress?.total ?? logic.fileContent?.length ?? 0;

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
        /* FAILURE VIEW: Shows up if the database upload fails */
        <div className="text-center space-y-4 py-8 px-4 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600">
            ⚠️ Import Failed
          </h3>

          <p className={`${activeTheme.text.secondary} text-md`}>
            {logic.uploadError}
          </p>
          <button
            onClick={() => logic.setCurrentStep(3)} // Let them go back to verify column choices
            className={`
                  px-8 py-2.5 rounded-full font-bold cursor-pointer transition-all
                  ${activeTheme.button.primary} ${activeTheme.text.primary} 
                  hover:shadow-lg active:scale-95
                `}
          >
            Go Back to Previous View
          </button>
        </div>
      ) : (
        /* SUCCESS VIEW: Only shows up if everything cleared flawlessly */
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <h3 className={`text-lg font-semibold ${activeTheme.text.primary}`}>
            Import Complete!
          </h3>
          <p className={`${activeTheme.text.muted} text-sm`}>
            Successfully processed {totalProgress} cards into your learning
            workspace.
          </p>
        </div>
      )}
    </>
  );
};

export default FinalStep;
