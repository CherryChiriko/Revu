import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Step3 = ({
  fileContent,
  columnMappings,
  setColumnMappings,
  activeTheme,
  onNext,
  onBack,
}) => {
  const columns = fileContent.length > 0 ? Object.keys(fileContent[0]) : [];

  const fields = [
    { key: "word", label: "Word/Character", required: true },
    { key: "reading", label: "Reading", required: false },
    { key: "meaning", label: "Meaning", required: true },
    { key: "audioUrl", label: "Audio URL", required: false },
  ];

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
      >
        <FontAwesomeIcon icon={faEye} /> Step 2: Map Columns
      </h2>

      {/* Mapping Selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label
              className={`block ${activeTheme.text.primary} text-sm font-medium`}
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={columnMappings[field.key]}
              onChange={(e) =>
                setColumnMappings({
                  ...columnMappings,
                  [field.key]: e.target.value,
                })
              }
              className={`block w-full ${activeTheme.background.canvas} rounded-lg py-2.5 px-3`}
            >
              <option value="">Select column</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className={activeTheme.button.outline}>
          Back
        </button>
        <button onClick={onNext} className={activeTheme.button.default}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3;
