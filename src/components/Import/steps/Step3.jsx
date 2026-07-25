import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faArrowRight,
  faArrowLeft,
  faRightLeft,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const Step3 = ({ activeTheme, logic, onNext, onBack }) => {
  const rows = logic.fileContent || [];
  const firstRow = rows[0] || {};

  const fields = logic.getFields();

  const currentType =
    logic.importMode === "existing"
      ? logic.targetDeck?.study_mode === "C"
        ? 2
        : 1
      : logic.selectedStudyType;
  const isChineseMode = currentType === 2;

  const requiredFieldsMapped = fields
    .filter((f) => f.required)
    .every((f) => logic.mappedColumns[f.key]);

  const hasNoValidCjkRows =
    isChineseMode &&
    requiredFieldsMapped &&
    rows.length > 0 &&
    logic.allCards.length === 0;

  const isReady = requiredFieldsMapped && !hasNoValidCjkRows;

  const columnOptions = Object.keys(firstRow).map((key) => {
    const sample = firstRow[key];
    const label = logic.hasHeaders ? key : `Column ${Number(key) + 1}`;

    return {
      value: key,
      label: `${label} (e.g. "${sample}")`,
    };
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
          >
            <FontAwesomeIcon icon={faEye} className="w-5 h-5 shrink-0" />
            Step 3: Map Columns
          </h2>
          <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
            Assign a column from your file to each flashcard field
          </p>
        </div>

        <button
          onClick={logic.handleSwap}
          type="button"
          className={`shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-2.5 sm:py-1.5 rounded-md border ${activeTheme.border.default} ${activeTheme.text.secondary} hover:bg-gray-500/10 transition-colors flex items-center gap-2 min-h-10 active:scale-95`}
        >
          <FontAwesomeIcon icon={faRightLeft} />
          Swap Front & Back
        </button>
      </div>

      <p className={`${activeTheme.text.secondary} text-sm`}>
        Match each field to a column from your uploaded file.
      </p>

      {/* Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border border-dashed border-gray-500/30">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label
              htmlFor={`map-${field.key}`}
              className={`block text-sm font-medium ${activeTheme.text.primary}`}
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
              <select
                id={`map-${field.key}`}
                value={logic.mappedColumns[field.key] || ""}
                onChange={(e) =>
                  logic.setMappedColumns({
                    ...logic.mappedColumns,
                    [field.key]: e.target.value,
                  })
                }
                className={`block w-full ${activeTheme.background.canvas} rounded-lg py-3 sm:py-2.5 px-3 border ${activeTheme.border.default} focus:ring-2 focus:ring-blue-500 outline-none text-base appearance-none`}
              >
                <option value="">-- Select column --</option>
                {columnOptions.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* CJK validation error */}
      {hasNoValidCjkRows && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border border-red-500/40 bg-red-500/10`}
          role="alert"
        >
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-red-500 mt-0.5 shrink-0"
          />
          <div className="text-sm text-red-500 flex flex-col">
            <span>
              The front column you selected does not contain any valid
              characters.
            </span>{" "}
            <span>
              Double-check your column mapping, or make sure your file actually
              contains Chinese characters.
            </span>
          </div>
        </div>
      )}

      {/* Existing partial-skip warning */}
      {!hasNoValidCjkRows && logic.cjkWarning && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${activeTheme.border.default} ${activeTheme.background.secondary}`}
          role="alert"
        >
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-yellow-500 mt-0.5 shrink-0"
          />
          <div className={`text-sm ${activeTheme.text.secondary}`}>
            {logic.cjkWarning}
          </div>
        </div>
      )}

      {/* Preview */}
      {isReady && (
        <div
          className={`rounded-xl border ${activeTheme.border.default} overflow-hidden`}
        >
          <div
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${activeTheme.background.secondary} ${activeTheme.text.muted}`}
          >
            Preview · First 3 cards
          </div>

          <div className="divide-y">
            {rows.slice(0, 3).map((row, i) => (
              <div
                key={i}
                className={`p-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${activeTheme.background.canvas}`}
              >
                <div
                  className={`rounded-lg p-3 border ${activeTheme.border.default}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Front
                  </div>
                  <div
                    className={`text-base font-semibold ${activeTheme.text.primary} break-words`}
                  >
                    {row[logic.mappedColumns.front]}
                  </div>
                </div>

                <div
                  className={`rounded-lg p-3 border ${activeTheme.border.default}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Back
                  </div>
                  <div
                    className={`text-sm ${activeTheme.text.primary} break-words`}
                  >
                    {row[logic.mappedColumns.back]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
        <button
          onClick={onBack}
          className={`px-4 py-3.5 sm:py-2 rounded-lg font-semibold min-h-12 sm:min-h-0 text-base sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back : Choose Type
        </button>
        <button
          onClick={onNext}
          disabled={!isReady}
          className={`px-4 py-3.5 sm:py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-12 sm:min-h-0 text-base sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform`}
        >
          Next : Finalize Deck
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default Step3;
