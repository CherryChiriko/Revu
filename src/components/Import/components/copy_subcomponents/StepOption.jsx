import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightLeft,
  faLanguage,
  faCopy,
  faFire,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { inputCls } from "./SharedStyles";
import FieldMapping from "./FieldMapping";
import MissedLimitSlider from "./MissedLimitSlider";

const TYPE_ICONS = {
  swap: faRightLeft,
  c_to_a: faLanguage,
  merge: faCopy,
  missed: faFire,
};

export function StepOptions({ logic, activeTheme }) {
  return (
    <div className="space-y-4">
      {/* Deck name */}
      <div className="flex flex-col gap-1">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          New deck name
        </p>
        <input
          type="text"
          value={logic.newDeckName}
          onChange={(e) => logic.setNewDeckName(e.target.value)}
          placeholder="Enter a name…"
          className={inputCls(activeTheme)}
          autoFocus
        />
      </div>

      {/* Conditional layouts managed purely */}
      {logic.cloneTypeId === "c_to_a" && (
        <FieldMapping logic={logic} activeTheme={activeTheme} />
      )}
      {logic.cloneTypeId === "missed" && (
        <MissedLimitSlider logic={logic} activeTheme={activeTheme} />
      )}

      {/* Summary chip */}
      <div
        className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas}`}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[logic.cloneTypeId]}
          className={activeTheme.text.muted}
        />
        <span className={activeTheme.text.muted}>
          Cloning{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            "{logic.selectedDeck?.name}"
          </span>{" "}
          as{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            "{logic.newDeckName || "…"}"
          </span>{" "}
          · Output: Mode A
        </span>
      </div>

      {logic.error && (
        <div
          className={`flex items-center gap-2 text-xs ${activeTheme.text.danger}`}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
          {logic.error}
        </div>
      )}
    </div>
  );
}
