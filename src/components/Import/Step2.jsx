import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faExclamationCircle, // Used for AlertCircle
  faDownload,
  faArrowRight,
  faFileExcel, // Used for FileSpreadsheet
} from "@fortawesome/free-solid-svg-icons";

import { useImportLogic } from "./useImportLogic";

const Step2 = ({ activeTheme, onNext }) => {
  const logic = useImportLogic();
  return (
    <>
      <div className="mb-4">
        <h2
          className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
        >
          <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5" />
          Step 1: Upload Your File
        </h2>
        <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
          Select a CSV or Excel file containing your flashcard data
        </p>
      </div>
      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed ${activeTheme.border.muted} rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-300`}
        >
          <div className="space-y-4">
            <FontAwesomeIcon
              icon={faUpload}
              className={`w-16 h-16 mx-auto ${activeTheme.text.primary}`}
            />
            <div>
              <h3
                className={`text-lg font-semibold mb-2 ${activeTheme.text.primary}`}
              >
                Upload your file
              </h3>
              <p className={`${activeTheme.text.muted} mb-4`}>
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={logic.handleFileUpload}
              className={`block w-full max-w-sm mx-auto text-sm ${activeTheme.text.secondary} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${activeTheme.button.primaryBg} file:${activeTheme.text.activeButton} hover:file:${activeTheme.button.primaryHover} cursor-pointer focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
            />
          </div>
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
            <span>Need help formatting your data? Download our template.</span>
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
          <h4 className={`font-semibold mb-2 ${activeTheme.text.primary}`}>
            Expected Format:
          </h4>
          <div className={`text-sm ${activeTheme.text.muted} space-y-1`}>
            <p>
              • <strong>Word/Character</strong>: The character or word to learn
            </p>
            <p>
              • <strong>Reading</strong>: Pronunciation (hiragana/pinyin)
            </p>
            <p>
              • <strong>Meaning</strong>: English translation
            </p>
            <p>
              • <strong>Audio URL</strong>: Optional audio file URL
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => onNext()}
          disabled={!logic.selectedFile}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.default} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next: Map Columns{" "}
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
      </div>
    </>
  );
};

export default Step2;
