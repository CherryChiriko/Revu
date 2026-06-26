import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { C_FIELDS } from "../../hooks/useQuickCreate";
import { selectCls } from "../SharedStyles";

export function FieldMapping({ logic, activeTheme }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
      >
        Field mapping
      </p>
      <p className={`text-xs ${activeTheme.text.muted} mb-1`}>
        Choose which Chinese fields become the front and back of the new
        standard cards.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Front
          </p>
          <div className="relative w-full">
            <select
              value={logic.frontField}
              onChange={(e) => logic.setFrontField(e.target.value)}
              className={selectCls(activeTheme)}
            >
              {C_FIELDS.filter((f) => f.value !== logic.backField).map((f) => (
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
        <div className="flex flex-col gap-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Back
          </p>
          <div className="relative w-full">
            <select
              value={logic.backField}
              onChange={(e) => logic.setBackField(e.target.value)}
              className={selectCls(activeTheme)}
            >
              {C_FIELDS.filter((f) => f.value !== logic.frontField).map((f) => (
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

      <div
        className={`mt-2 flex items-center gap-2 text-xs ${activeTheme.text.muted} px-3 py-2 rounded-lg ${activeTheme.background.canvas} border ${activeTheme.border.secondary}`}
      >
        <span className={`font-semibold ${activeTheme.text.primary}`}>
          {C_FIELDS.find((f) => f.value === logic.frontField)?.label}
        </span>
        <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
        <span>{C_FIELDS.find((f) => f.value === logic.backField)?.label}</span>
      </div>
    </div>
  );
}
