import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faArrowRight,
  faArrowLeft,
  faRightLeft,
} from "@fortawesome/free-solid-svg-icons";

const Step3 = ({ activeTheme, logic, onNext, onBack }) => {
  const rows = logic.fileContent || [];
  const firstRow = rows[0] || {};
  console.log(firstRow);

  const fields = logic.getFields();

  // Build column options ONCE
  const columnOptions = Object.keys(firstRow).map((key) => {
    const sample = firstRow[key];
    const label = logic.hasHeaders ? key : `Column ${Number(key) + 1}`;

    return {
      value: key, // STRING — this is critical
      label: `${label} (e.g. "${sample}")`,
    };
  });

  const isReady = fields
    .filter((f) => f.required)
    .every((f) => logic.mappedColumns[f.key]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="mb-4">
          <h2
            className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
          >
            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
            Step 3: Map Columns
          </h2>
          <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
            Assign a column from your file to each flashcard field
          </p>
        </div>

        <button
          onClick={logic.handleSwap}
          type="button"
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border ${activeTheme.border.default} ${activeTheme.text.secondary} hover:bg-gray-500/10 transition-colors flex items-center gap-2`}
        >
          <FontAwesomeIcon icon={faRightLeft} />
          Swap Front & Back
        </button>
      </div>

      <p className={`${activeTheme.text.secondary} text-sm`}>
        Match each field to a column from your uploaded file.
      </p>

      {/* Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-dashed border-gray-500/30">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label
              className={`block text-sm font-medium ${activeTheme.text.primary}`}
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            <select
              value={logic.mappedColumns[field.key] || ""}
              onChange={(e) =>
                logic.setMappedColumns({
                  ...logic.mappedColumns,
                  [field.key]: e.target.value,
                })
              }
              className={`block w-full ${activeTheme.background.canvas} rounded-lg py-2.5 px-3 border ${activeTheme.border.default} focus:ring-2 focus:ring-blue-500 outline-none`}
            >
              <option value="">-- Select column --</option>
              {columnOptions.map((col) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Preview */}
      {isReady && (
        <div className={`rounded-lg border ${activeTheme.border.default}`}>
          <div
            className={`px-4 py-2 text-xs font-bold uppercase ${activeTheme.background.secondary} ${activeTheme.text.muted}`}
          >
            Preview (first 3 rows)
          </div>

          {rows.slice(0, 3).map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-4 p-4 text-sm border-t"
            >
              <div>
                <div className="text-xs font-bold uppercase text-gray-400">
                  Front
                </div>
                <div className={activeTheme.text.primary}>
                  {row[logic.mappedColumns.front || logic.mappedColumns.word]}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-gray-400">
                  Back
                </div>
                <div className={activeTheme.text.primary}>
                  {row[logic.mappedColumns.back || logic.mappedColumns.meaning]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
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
          disabled={!isReady}
          className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next : Finalize Deck
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Step3;
