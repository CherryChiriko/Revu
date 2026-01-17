import React from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faCheckCircle,
  faExclamationCircle, // Used for AlertCircle
  faDownload,
  faEye,
  faArrowRight,
  faFileExcel, // Used for FileSpreadsheet
} from "@fortawesome/free-solid-svg-icons";
import Header from "../General/ui/Header";

// Hooks & Sub-components
import { useImportLogic } from "./useImportLogic";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

const PROGRESS_STEPS = [1, 2, 3, 4];

const ImportView = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const logic = useImportLogic();

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Header
          title="Import Deck"
          description="Import flashcards from CSV/Excel files"
        />
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {PROGRESS_STEPS.map((step) => (
          <div key={step} className="flex items-center">
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
            {step < PROGRESS_STEPS.length && (
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
        {logic.currentStep === 1 && (
          <Step1
            activeTheme={activeTheme}
            onNext={() => logic.setCurrentStep(2)}
          />
        )}

        {logic.currentStep === 2 && (
          <Step2
            fileContent={logic.fileContent}
            columnMappings={logic.columnMappings}
            setColumnMappings={logic.setColumnMappings}
            activeTheme={activeTheme}
            onBack={() => logic.setCurrentStep(1)}
            onNext={() => logic.setCurrentStep(3)}
          />
        )}

        {/* {logic.currentStep === 3 && (
          <Step3 logic={logic} activeTheme={activeTheme} />
        )} */}
      </div>
    </div>
  );
};

export default ImportView;
