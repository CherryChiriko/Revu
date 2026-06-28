import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { C_FIELDS } from "../../hooks/useQuickCreate";
import { selectCls } from "../../../General/ui/FormStyles";

export function ConvertMode({ logic, activeTheme }) {
  // Check if they are currently violating the unique constraint to show a helpful validation hint
  const hasConflict = logic.frontField === logic.backField;

  return (
    <div className="flex flex-col gap-1 w-full">
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
      >
        Assign fields
      </p>
      <span className={`text-xs ${activeTheme.text.muted} mb-2`}>
        Choose what should be the front and back of the new cards.
      </span>

      <div className="grid grid-cols-2 gap-3">
        {/* Front Field Select */}
        <div className="flex flex-col">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Front
          </p>
          <div className="relative w-full">
            <select
              value={logic.frontField}
              onChange={(e) => logic.setFrontField(e.target.value)}
              className={`${selectCls(activeTheme)} ${hasConflict ? `${activeTheme.ring.error}` : ""}`}
            >
              {/* REMOVED FILTER: All options are always visible */}
              {C_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${activeTheme.text.muted}`}
            >
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Back Field Select */}
        <div className="flex flex-col">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Back
          </p>
          <div className="relative w-full">
            <select
              value={logic.backField}
              onChange={(e) => logic.setBackField(e.target.value)}
              className={`${selectCls(activeTheme)} ${hasConflict ? `${activeTheme.ring.error}` : ""}`}
            >
              {/* REMOVED FILTER: All options are always visible */}
              {C_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${activeTheme.text.muted}`}
            >
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Add a subtle text danger so the user knows why the submit button went dead */}
      {hasConflict && (
        <div className={`${activeTheme.text.danger} flex flex-row gap-2 mt-2`}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mt-0.5 shrink-0"
          />
          <span className="text-[11px]  mt-1 font-medium">
            "Front" and "Back" fields must be different.
          </span>
        </div>
      )}
    </div>
  );
}
