// src/components/Import.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

import { selectActiveTheme } from "../../../slices/themeSlice";

const Import = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    word: "",
    meaning: "",
    reading: "",
    audioUrl: "",
  });
  const [deckSettings, setDeckSettings] = useState({
    name: "",
    description: "",
    language: "japanese",
    tags: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Replaced useToast with a simple logging function
  const showNotification = (title, description, variant = "default") => {
    console.log(
      `Notification - ${variant.toUpperCase()}: ${title} - ${description}`
    );
    // In a real app, you might set a state here to display a temporary message in the UI
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx|xls)$/i)
    ) {
      showNotification(
        "Invalid File Type",
        "Please upload a CSV or Excel file.",
        "destructive"
      );
      return;
    }

    setSelectedFile(file);

    // Mock file parsing (in real implementation, use xlsx or csv parser)
    const mockData = [
      { col1: "あ", col2: "a", col3: "a", col4: "vowel sound a" },
      { col1: "か", col2: "ka", col3: "ka", col4: "consonant-vowel ka" },
      { col1: "さ", col2: "sa", col3: "sa", col4: "consonant-vowel sa" },
      { col1: "你", col2: "nǐ", col3: "ni3", col4: "you" },
      { col1: "好", col2: "hǎo", col3: "hao3", col4: "good" },
    ];

    setFileContent(mockData);
    setCurrentStep(2);

    showNotification(
      "File Uploaded",
      `Successfully loaded ${mockData.length} rows from ${file.name}`
    );
  };

  const handleColumnMapping = () => {
    if (!columnMappings.word || !columnMappings.meaning) {
      showNotification(
        "Missing Required Mappings",
        "Please map at least the Word and Meaning columns.",
        "destructive"
      );
      return;
    }

    setCurrentStep(3);
  };

  const handleImport = async () => {
    if (!deckSettings.name.trim()) {
      showNotification(
        "Deck Name Required",
        "Please enter a name for your deck.",
        "destructive"
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Mock processing with progress
    const processCards = async () => {
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    };

    await processCards();

    // Create mock deck
    const newDeck = {
      id: `imported_${Date.now()}`,
      name: deckSettings.name,
      description: deckSettings.description,
      language: deckSettings.language,
      cardCount: fileContent.length,
      dueCount: fileContent.length, // All new cards are due
      masteredCount: 0,
      learningCount: 0,
      createdAt: new Date().toISOString(),
      lastStudied: null,
      tags: deckSettings.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      color: "#4ECDC4", // Consider making this dynamic from theme as well
    };

    setIsProcessing(false);

    showNotification(
      "Import Successful!",
      `Created deck "${newDeck.name}" with ${fileContent.length} cards.`
    );

    navigate("/decks");
  };

  const downloadTemplate = () => {
    const csvContent =
      "word,reading,meaning,audio_url\nあ,a,vowel sound a,\nか,ka,consonant-vowel ka,\n你,nǐ,you,\n好,hǎo,good,";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcard_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification(
      "Template Downloaded",
      "CSV template has been downloaded to help you format your data."
    );
  };

  const getAvailableColumns = () => {
    if (fileContent.length === 0) return [];
    return Object.keys(fileContent[0]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1
          className={`text-4xl font-bold flex items-center justify-center gap-3 ${activeTheme.text.primary}`}
        >
          <FontAwesomeIcon icon={faUpload} className="w-8 h-8" />
          Import Flashcards
        </h1>
        <p className={`${activeTheme.text.muted}`}>
          Import your flashcards from CSV or Excel files
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center border-2 transition-all duration-300
                ${
                  currentStep >= step
                    ? `${
                        activeTheme.button.default
                      } border-${activeTheme.button.default.replace("bg-", "")}`
                    : `bg-white ${activeTheme.border.dashed} ${activeTheme.text.secondary}` // Adjusted for inactive step circle
                }`}
            >
              {currentStep > step ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={`w-5 h-5 ${activeTheme.text.activeButton}`}
                />
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`w-6 h-6 mx-4 transition-colors duration-300 ${
                  currentStep > step
                    ? activeTheme.icon.stepActive
                    : activeTheme.icon.stepInactive
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content Card */}
      <div
        className={`${activeTheme.card.bg} rounded-lg shadow-xl p-6 w-full max-w-3xl mx-auto`}
      >
        {currentStep === 1 && (
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
                className={`border-2 border-dashed ${activeTheme.border.dashed} rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-300`}
              >
                <div className="space-y-4">
                  <FontAwesomeIcon
                    icon={faUpload}
                    className={`w-16 h-16 mx-auto ${activeTheme.icon.default}`}
                  />
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${activeTheme.text.primary}`}
                    >
                      Upload your file
                    </h3>
                    <p className={`${activeTheme.text.muted} mb-4`}>
                      Drag and drop your CSV or Excel file here, or click to
                      browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className={`block w-full max-w-sm mx-auto text-sm ${activeTheme.input.text} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${activeTheme.button.primaryBg} file:${activeTheme.text.activeButton} hover:file:${activeTheme.button.primaryHover} cursor-pointer focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
                  />
                </div>
              </div>

              {/* Template Download Alert */}
              <div
                className={`${activeTheme.alert.infoBg} ${activeTheme.alert.infoText} p-4 rounded-lg flex items-center space-x-3`}
              >
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="h-4 w-4 flex-shrink-0"
                />
                <div className="flex-grow flex items-center justify-between">
                  <span>
                    Need help formatting your data? Download our template.
                  </span>
                  <button
                    onClick={downloadTemplate}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-semibold ${activeTheme.button.outline} transition-colors duration-200`}
                  >
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="w-4 h-4 mr-2"
                    />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Expected Format */}
              <div
                className={`${activeTheme.card.bg} rounded-lg p-4 border ${activeTheme.border.bottom}`}
              >
                <h4
                  className={`font-semibold mb-2 ${activeTheme.text.primary}`}
                >
                  Expected Format:
                </h4>
                <div className={`text-sm ${activeTheme.text.muted} space-y-1`}>
                  <p>
                    • <strong>Word/Character</strong>: The character or word to
                    learn
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
                onClick={() => setCurrentStep(2)}
                disabled={!selectedFile}
                className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.default} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next: Map Columns{" "}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="mb-4">
              <h2
                className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
              >
                <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                Step 2: Map Columns
              </h2>
              <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
                Match your file columns to flashcard fields
              </p>
            </div>
            <div className="space-y-6">
              {/* File Preview */}
              <div className="space-y-4">
                <h4 className={`font-semibold ${activeTheme.text.primary}`}>
                  File Preview ({fileContent.length} rows)
                </h4>
                <div
                  className={`${activeTheme.card.bg} rounded-lg p-4 overflow-x-auto border ${activeTheme.border.bottom}`}
                >
                  <table
                    className={`w-full text-sm ${activeTheme.text.primary}`}
                  >
                    <thead>
                      <tr>
                        {getAvailableColumns().map((col) => (
                          <th
                            key={col}
                            className={`text-left p-2 border-b ${activeTheme.border.bottom}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileContent.slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          {getAvailableColumns().map((col) => (
                            <td
                              key={col}
                              className={`p-2 border-b ${activeTheme.border.bottom}`}
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "word", label: "Word/Character", required: true },
                  { key: "reading", label: "Reading", required: false },
                  { key: "meaning", label: "Meaning", required: true },
                  { key: "audioUrl", label: "Audio URL", required: false },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label
                      htmlFor={field.key}
                      className={`block ${activeTheme.text.primary} text-sm font-medium`}
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      {" "}
                      {/* Wrapper for custom arrow */}
                      <select
                        id={field.key}
                        value={columnMappings[field.key]}
                        onChange={(e) =>
                          setColumnMappings({
                            ...columnMappings,
                            [field.key]: e.target.value,
                          })
                        }
                        className={`block w-full ${activeTheme.input.bg} ${activeTheme.input.text} rounded-lg py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 ${activeTheme.ring.input} appearance-none`}
                      >
                        <option value="">Select column</option>
                        {getAvailableColumns().map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                      <div
                        className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${activeTheme.icon.default}`}
                      >
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.outline}`}
                >
                  Back
                </button>
                <button
                  onClick={handleColumnMapping}
                  className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.default}`}
                >
                  Next: Configure Deck{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <div className="mb-4">
              <h2
                className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
                Step 3: Configure Deck
              </h2>
              <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
                Set up your new deck settings
              </p>
            </div>
            <div className="space-y-6">
              {!isProcessing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="deckName"
                        className={`block ${activeTheme.text.primary} text-sm font-medium`}
                      >
                        Deck Name *
                      </label>
                      <input
                        id="deckName"
                        type="text"
                        value={deckSettings.name}
                        onChange={(e) =>
                          setDeckSettings({
                            ...deckSettings,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter deck name"
                        className={`block w-full ${activeTheme.input.bg} ${activeTheme.input.text} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input} ${activeTheme.input.placeholder}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="language"
                        className={`block ${activeTheme.text.primary} text-sm font-medium`}
                      >
                        Language
                      </label>
                      <div className="relative">
                        <select
                          id="language"
                          value={deckSettings.language}
                          onChange={(e) =>
                            setDeckSettings({
                              ...deckSettings,
                              language: e.target.value,
                            })
                          }
                          className={`block w-full ${activeTheme.input.bg} ${activeTheme.input.text} rounded-lg py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 ${activeTheme.ring.input} appearance-none`}
                        >
                          <option value="japanese">Japanese</option>
                          <option value="chinese">Chinese</option>
                          <option value="english">English</option>
                          <option value="french">French</option>
                          <option value="spanish">Spanish</option>
                          <option value="german">German</option>
                        </select>
                        <div
                          className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${activeTheme.icon.default}`}
                        >
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className={`block ${activeTheme.text.primary} text-sm font-medium`}
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={deckSettings.description}
                      onChange={(e) =>
                        setDeckSettings({
                          ...deckSettings,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your deck"
                      rows="3"
                      className={`block w-full ${activeTheme.input.bg} ${activeTheme.input.text} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input} ${activeTheme.input.placeholder}`}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tags"
                      className={`block ${activeTheme.text.primary} text-sm font-medium`}
                    >
                      Tags
                    </label>
                    <input
                      id="tags"
                      type="text"
                      value={deckSettings.tags}
                      onChange={(e) =>
                        setDeckSettings({
                          ...deckSettings,
                          tags: e.target.value,
                        })
                      }
                      placeholder="Enter tags separated by commas"
                      className={`block w-full ${activeTheme.input.bg} ${activeTheme.input.text} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input} ${activeTheme.input.placeholder}`}
                    />
                  </div>

                  {/* Import Summary */}
                  <div className={`${activeTheme.alert.infoBg} rounded-lg p-4`}>
                    <h4
                      className={`font-semibold mb-2 ${activeTheme.text.primary}`}
                    >
                      Import Summary
                    </h4>
                    <div
                      className={`text-sm ${activeTheme.text.secondary} space-y-1`}
                    >
                      <p>• File: {selectedFile?.name}</p>
                      <p>• Cards to import: {fileContent.length}</p>
                      <p>
                        • Mapped columns:{" "}
                        {Object.values(columnMappings).filter(Boolean).length}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.outline}`}
                    >
                      Back
                    </button>
                    <div className="space-x-2">
                      <button
                        onClick={() => navigate("/decks")}
                        className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.outline}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImport}
                        className={`px-4 py-2 rounded-lg font-semibold ${activeTheme.button.primaryBg} ${activeTheme.button.primaryHover} ${activeTheme.text.activeButton}`}
                      >
                        Import Deck
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <div
                    className={`w-16 h-16 mx-auto ${activeTheme.alert.infoBg.replace(
                      "bg-",
                      "bg-"
                    )} rounded-full flex items-center justify-center`}
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className={`w-8 h-8 ${activeTheme.icon.stepActive} animate-pulse`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${activeTheme.text.primary}`}
                  >
                    Processing Import...
                  </h3>
                  <p className={`${activeTheme.text.muted}`}>
                    Creating your deck and processing {fileContent.length} cards
                  </p>
                  <div className="max-w-md mx-auto">
                    <div
                      className={`w-full h-2 ${activeTheme.progress.track} rounded-full overflow-hidden`}
                    >
                      <div
                        className={`${activeTheme.progress.fill} h-full`}
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className={`text-sm ${activeTheme.text.muted} mt-2`}>
                      {processingProgress}% complete
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Import;
