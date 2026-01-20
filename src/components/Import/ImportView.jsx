import React from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Header from "../General/ui/Header";

// Hooks & Sub-components
import { useImportLogic } from "./useImportLogic";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import FinalStep from "./FinalStep";

const PROGRESS_STEPS = [1, 2, 3, 4, 5];

const ImportView = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const logic = useImportLogic();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (logic.currentStep === 5) {
      logic.createDeck();
    }
  }, [logic.currentStep]);

  const renderStep = () => {
    switch (logic.currentStep) {
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
            onBack={() => logic.setCurrentStep(1)}
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
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 ">
        <div className="flex items-start gap-4 mb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate("/decks")}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.text.muted}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Decks
          </button>
          {/* Header */}
          <Header
            title="Import Deck"
            description="Import flashcards from CSV/Excel files"
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {PROGRESS_STEPS.map((step) => (
          <div key={step} className="flex items-center">
            {step !== 5 && (
              <div
                className={`rounded-full w-10 h-10 flex items-center justify-center border-2 transition-all duration-300
                ${
                  logic.currentStep >= step
                    ? `${activeTheme.button.primary} `
                    : `${activeTheme.button.disabled}  ${activeTheme.border.secondary} ${activeTheme.text.secondary}`
                }`}
              >
                {logic.currentStep > step ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={`w-5 h-5 ${activeTheme.text.primary}`}
                  />
                ) : (
                  step
                )}
              </div>
            )}
            {step < PROGRESS_STEPS.length - 1 && (
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

      <div
        className={`${activeTheme.background.secondary} max-w-4xl mx-auto space-y-8 rounded-lg shadow-xl p-12`}
      >
        {renderStep()}
      </div>
    </div>
  );
};

export default ImportView;
