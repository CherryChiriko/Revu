import React from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import { useImportLogic } from "../hooks/useImportLogic";
import Step0 from "../steps/Step0";
import Step1 from "../steps/Step1";
import Step2 from "../steps/Step2";
import Step3 from "../steps/Step3";
import Step4 from "../steps/Step4";
import FinalStep from "../steps/FinalStep";

const NEW_STEPS = [1, 2, 3, 4, 5];
const EXISTING_STEPS = [2, 3, 4, 5];

const ImportView = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const navigate = useNavigate();
  const logic = useImportLogic();

  const progressSteps =
    logic.importMode === "existing" ? EXISTING_STEPS : NEW_STEPS;

  const renderStep = () => {
    console.log("current step ", logic.currentStep);
    switch (logic.currentStep) {
      case 0:
        return (
          <Step0
            activeTheme={activeTheme}
            logic={logic}
            onSelectNew={() => logic.setCurrentStep(1)}
            onSelectExisting={() => logic.setCurrentStep(2)}
          />
        );
      case 1:
        return (
          <Step1
            activeTheme={activeTheme}
            logic={logic}
            onNext={() => logic.setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Step2
            activeTheme={activeTheme}
            logic={logic}
            onBack={() =>
              logic.setCurrentStep(logic.importMode === "existing" ? 0 : 1)
            }
            onNext={() => logic.setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <Step3
            activeTheme={activeTheme}
            logic={logic}
            onBack={() => logic.setCurrentStep(2)}
            onNext={() => logic.setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <Step4
            activeTheme={activeTheme}
            logic={logic}
            onBack={() => logic.setCurrentStep(3)}
            onNext={() => logic.setCurrentStep(5)}
          />
        );
      case 5:
        return <FinalStep activeTheme={activeTheme} logic={logic} />;
      default:
        console.log("default");
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div
        className={`${activeTheme.background.app} relative max-w-6xl mx-auto p-4 space-y-6`}
      >
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (logic.currentStep === 0) navigate(-1);
                else logic.setCurrentStep(logic.currentStep - 1);
              }}
              className={`p-2 rounded-full hover:${activeTheme.background.canvas} transition-colors ${activeTheme.text.muted}`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${activeTheme.text.primary}`}>
                Import Deck
              </h1>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                {logic.importMode === "existing"
                  ? `Adding cards to "${logic.targetDeck?.name ?? "…"}"`
                  : "Import flashcards from CSV/Excel files"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {logic.currentStep > 0 && (
          <div className="flex items-center justify-center space-x-8 mb-8">
            {progressSteps.map((step, idx) => (
              <div key={step} className="flex items-center">
                {step !== 5 && (
                  <div
                    className={`rounded-full w-10 h-10 flex items-center justify-center border-2 transition-all duration-300
                      ${
                        logic.currentStep >= step
                          ? `${activeTheme.button.primary}`
                          : `${activeTheme.button.disabled} ${activeTheme.border.secondary} ${activeTheme.text.secondary}`
                      }`}
                  >
                    {logic.currentStep > step ? (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className={`w-5 h-5 ${activeTheme.text.primary}`}
                      />
                    ) : (
                      idx + 1
                    )}
                  </div>
                )}
                {idx < progressSteps.length - 2 && (
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={`w-6 h-6 mx-4 transition-colors duration-300 ${
                      logic.currentStep > step
                        ? activeTheme.text.primary
                        : activeTheme.text.muted
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className={`${activeTheme.background.secondary} max-w-4xl mx-auto space-y-8 rounded-lg shadow-xl p-12`}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ImportView;
