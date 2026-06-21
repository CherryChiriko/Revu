import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faArrowRight,
  faArrowLeft,
  faEye,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

const Step4 = ({ activeTheme, logic, onNext, onBack }) => {
  // ── Existing deck mode: show summary only ─────────────────────────────────
  if (logic.importMode === "existing") {
    return (
      <>
        <div className="mb-6">
          <h2
            className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
          >
            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
            Step 3: Confirm import
          </h2>
          <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
            Review what will be added before proceeding.
          </p>
        </div>

        <div
          className={`rounded-xl border ${activeTheme.border.card} ${activeTheme.background.canvas} divide-y ${activeTheme.border.card}`}
        >
          <div className="px-5 py-4 flex items-center gap-3">
            <FontAwesomeIcon
              icon={faLayerGroup}
              className={`${activeTheme.text.muted} w-4 h-4`}
            />
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
              >
                Target deck
              </p>
              <p className={`font-semibold ${activeTheme.text.primary}`}>
                {logic.targetDeck?.name}
              </p>
              <p className={`text-xs ${activeTheme.text.muted}`}>
                Mode {logic.targetDeck?.study_mode} ·{" "}
                {logic.targetDeck?.cards_count ?? 0} cards currently
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
            >
              Cards to append
            </p>
            <p
              className={`text-2xl font-extrabold mt-1 ${activeTheme.text.primary}`}
            >
              {logic.allCards.length}
            </p>
            <p className={`text-xs ${activeTheme.text.muted} mt-1`}>
              from {logic.selectedFile?.name}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className={`text-xs ${activeTheme.text.muted}`}>
              ✓ Existing cards and their study progress will not be affected.
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg font-semibold`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={logic.allCards.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed
              bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
          >
            Add {logic.allCards.length} cards
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>
      </>
    );
  }

  // ── New deck mode: original deck settings form ────────────────────────────
  const getLanguageOptions = () => {
    switch (logic.selectedType) {
      case 1:
        return [...logic.existingLanguages, "Add new language..."];
      case 2:
        return ["Chinese"];
      default:
        return ["Add new language..."];
    }
  };
  const languageOptions = getLanguageOptions();

  return (
    <>
      <div className="space-y-6">
        <div className="mb-4">
          <h2
            className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
          >
            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
            Step 4: Finalize Deck
          </h2>
          <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
            Finalize and review your deck settings
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className={`block ${activeTheme.text.primary} text-sm font-medium`}
              >
                Deck Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={logic.deckSettings.name || ""}
                onChange={(e) =>
                  logic.setDeckSettings({
                    ...logic.deckSettings,
                    name: e.target.value,
                  })
                }
                onBlur={logic.checkDeckNameExists}
                placeholder="Enter deck name"
                className={`block w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
              />
              {logic.isNameTaken && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{logic.uploadError}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="language"
                className={`block ${activeTheme.text.primary} text-sm font-medium`}
              >
                Language{" "}
                {logic.selectedType === 2 && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {logic.isAddingLanguage ? (
                <div className="relative">
                  <input
                    id="language"
                    type="text"
                    value={logic.deckSettings.language || ""}
                    onChange={(e) =>
                      logic.setDeckSettings({
                        ...logic.deckSettings,
                        language: e.target.value,
                      })
                    }
                    placeholder="Type a new language"
                    className={`block w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => logic.setIsAddingLanguage(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={logic.deckSettings.language || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Add new language...")
                      logic.setIsAddingLanguage(true);
                    else
                      logic.setDeckSettings({
                        ...logic.deckSettings,
                        language: val,
                      });
                  }}
                  className={`block w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
                >
                  <option value="" disabled>
                    Select a language
                  </option>
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}
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
              value={logic.deckSettings.description || ""}
              onChange={(e) =>
                logic.setDeckSettings({
                  ...logic.deckSettings,
                  description: e.target.value,
                })
              }
              placeholder="Describe your deck"
              rows="3"
              className={`block w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
            />
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
              value={logic.deckSettings.tags || ""}
              onChange={(e) =>
                logic.setDeckSettings({
                  ...logic.deckSettings,
                  tags: e.target.value,
                })
              }
              placeholder="Enter tags separated by comma"
              className={`block w-full ${activeTheme.background.canvas} ${activeTheme.text.secondary} rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 ${activeTheme.ring.input}`}
            />
          </div>

          <div
            className={`rounded-lg p-4 border ${activeTheme.border.card} ${activeTheme.background.canvas}`}
          >
            <h4 className={`font-semibold mb-2 ${activeTheme.text.primary}`}>
              Import Summary
            </h4>
            <div className={`text-sm ${activeTheme.text.secondary} space-y-1`}>
              <p>• File: {logic.selectedFile?.name}</p>
              <p>• Cards to import: {logic.allCards.length}</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={onBack}
              className={`px-4 py-2 rounded-lg font-semibold`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back : Map Columns
            </button>
            <button
              onClick={onNext}
              disabled={
                logic.isCheckingName ||
                logic.isNameTaken ||
                !logic.deckSettings.name
              }
              className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Confirm and continue
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step4;
