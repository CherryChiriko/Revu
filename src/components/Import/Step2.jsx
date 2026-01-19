import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faExclamationCircle,
  faDownload,
  faArrowRight,
  faArrowLeft,
  faCheckCircle,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

const Step2 = ({ activeTheme, logic, onNext, onBack }) => {
  const Format = () => {
    switch (logic.selectedType) {
      case 1:
        return (
          <div className={`text-sm ${activeTheme.text.muted}`}>
            <p>
              • <strong>Front</strong>: The word to learn
            </p>
            <p>
              • <strong>Back</strong>: The definition or translation
            </p>
            {/* <p>
              • <strong>(optional) Audio</strong>: English translation
            </p> */}
          </div>
        );
      case 2:
        return (
          <div className={`text-sm ${activeTheme.text.muted}`}>
            <p>
              • <strong>Word/Character</strong>: The character or word to learn
            </p>
            <p>
              • <strong>Reading</strong>: Pronunciation (hiragana/pinyin)
            </p>
            <p>
              • <strong>Meaning</strong>: English translation
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2
          className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
        >
          <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5" />
          Step 2: Upload Your File
        </h2>
        <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
          Select a CSV or Excel file containing your flashcard data
        </p>
      </div>
      {/* File Upload */}
      <div className="space-y-6">
        <div
          onDragOver={logic.handleDragOver}
          onDragLeave={logic.handleDragLeave}
          onDrop={logic.handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              activeTheme.border.card
            }
            ${
              logic.isDragging
                ? ` bg-blue-50/10 scale-[1.01] shadow-inner`
                : ` hover:border-blue-400`
            }
            ${logic.uploadError ? "border-red-500 bg-red-50/5" : ""}
          `}
        >
          {/* Helpful Overlay for Dragging State */}
          {logic.isDragging && (
            <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none flex items-center justify-center">
              <div
                className={`text-lg font-bold ${activeTheme.text.primary} animate-bounce`}
              >
                Drop to upload!
              </div>
            </div>
          )}

          <div
            className={`space-y-4 flex flex-col items-center transition-opacity ${
              logic.isDragging ? "opacity-20" : "opacity-100"
            }`}
          >
            <FontAwesomeIcon
              icon={
                logic.selectedFile && !logic.uploadError
                  ? faCheckCircle
                  : faUpload
              }
              className={`w-16 h-16 mx-auto transition-transform duration-300 ${
                logic.isDragging ? "scale-110" : ""
              } 
        ${logic.uploadError ? "text-red-500" : activeTheme.text.primary}`}
            />

            <div>
              <h3
                className={`text-xl font-semibold mb-2 ${activeTheme.text.primary}`}
              >
                {logic.selectedFile && !logic.uploadError
                  ? "File Ready"
                  : "Upload your file"}
              </h3>
              {(!logic.selectedFile || logic.uploadError) && (
                <p className={`${activeTheme.text.muted} max-w-xs mx-auto`}>
                  Drag and drop your CSV/Excel here or use the button below
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <label
                className={`
                  px-8 py-2.5 rounded-full font-bold cursor-pointer transition-all
                  ${activeTheme.button.primary} ${activeTheme.text.primary} 
                  hover:shadow-lg active:scale-95
                `}
              >
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={logic.handleFileUpload}
                />
              </label>

              {logic.selectedFile && !logic.uploadError && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${activeTheme.border.default} bg-white/5`}
                >
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    className="text-green-500"
                  />
                  <span
                    className={`text-sm font-medium ${activeTheme.text.primary}`}
                  >
                    {logic.selectedFile.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message Display */}
        {logic.uploadError && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-2">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{logic.uploadError}</span>
          </div>
        )}

        {/* Header Toggle */}
        <div className="flex items-center justify-center gap-3 py-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={logic.hasHeaders}
              onChange={(e) => logic.setHasHeaders(e.target.checked)}
            />
            <div
              className={`w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
            ></div>
            <span
              className={`ml-3 text-sm font-medium ${activeTheme.text.primary}`}
            >
              My file has headers (Column names)
            </span>
          </label>
        </div>

        {/* Template Download Alert */}
        <div
          className={`${activeTheme.text.accent1} p-4 rounded-lg flex items-center space-x-3`}
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="h-4 w-4 flex-shrink-0"
          />
          <div className="flex-grow flex items-center justify-between">
            <span>Need help formatting your data?</span>
            <button
              onClick={logic.downloadTemplate}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-semibold ${activeTheme.button.outline} transition-colors duration-200`}
            >
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Expected Format */}
        <div
          className={`${activeTheme.background.secondary} rounded-lg p-4 border ${activeTheme.border.bottom}`}
        >
          <h4 className={`font-semibold mb-4 ${activeTheme.text.primary}`}>
            Expected Format:
          </h4>
          <Format />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-lg font-semibold`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back : Choose Type
        </button>
        <button
          onClick={onNext}
          disabled={!logic.selectedFile}
          className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next : Map Columns
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
      </div>
    </>
  );
};

export default Step2;
