import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { inputCls } from "../../../General/ui/FormStyles";
import { ConvertMode } from "../copy_modes/ConvertMode";
import { ConvertModeToC } from "../copy_modes/ConvertModeToC";
import { TYPE_ICONS } from "../../../../utils/constants";

export function StepCopy2({ logic, activeTheme }) {
  const ConditionalLayout = (() => {
    if (logic.cloneTypeId !== "convert") return null;
    if (logic.studyMode === "C") {
      return <ConvertMode logic={logic} activeTheme={activeTheme} />;
    }
    return <ConvertModeToC activeTheme={activeTheme} />;
  })();

  const targetModeLabel =
    logic.resolvedOutputMode === "C" ? "Character" : "Standard";

  return (
    <div className="space-y-5 sm:space-y-4">
      {/* Deck name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="new-deck-name"
          className={`text-sm sm:text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          New deck name
        </label>
        <input
          type="text"
          id="new-deck-name"
          value={logic.newDeckName}
          onChange={(e) => logic.setNewDeckName(e.target.value)}
          placeholder="Enter a name…"
          className={`${inputCls(activeTheme)} text-base`}
          autoFocus
          autoComplete="off"
          enterKeyHint="done"
        />
      </div>

      {ConditionalLayout}

      {logic.skippedCount > 0 && (
        <div
          className={`flex items-start gap-2 text-sm sm:text-xs px-3 py-3 sm:py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.text.warning ?? "text-amber-500"}`}
          role="alert"
        >
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="shrink-0 mt-0.5"
          />
          <span>
            <span className="font-semibold">{logic.skippedCount}</span>{" "}
            {logic.skippedCount === 1 ? "card was" : "cards were"} skipped — no
            valid CJK character found in the front field.
          </span>
        </div>
      )}

      {/* Summary chip */}
      <div
        className={`flex items-start gap-2.5 text-sm sm:text-xs px-3 py-3 sm:py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas}`}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[logic.cloneTypeId]}
          className={`shrink-0 mt-0.5 ${activeTheme.text.muted}`}
        />
        <div className={`${activeTheme.text.muted} text-pretty flex flex-col`}>
          <span>
            Copying{" "}
            <span className={`font-semibold ${activeTheme.text.primary}`}>
              "{logic.selectedDeck?.name}"
            </span>{" "}
            as{" "}
            <span className={`font-semibold ${activeTheme.text.primary}`}>
              "{logic.newDeckName || "…"}"
            </span>
          </span>
          <span>
            {logic.cloneTypeId === "convert" ? "Converting to " : ""}
            <span className={`font-semibold ${activeTheme.text.primary}`}>
              {targetModeLabel}
            </span>{" "}
            Mode
          </span>
        </div>
      </div>

      {logic.error && (
        <div
          className={`flex items-start gap-2 text-sm sm:text-xs ${activeTheme.text.danger}`}
          role="alert"
          aria-live="assertive"
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="shrink-0 mt-0.5"
          />
          {logic.error}
        </div>
      )}
    </div>
  );
}
