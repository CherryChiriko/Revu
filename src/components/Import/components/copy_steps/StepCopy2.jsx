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
  // Route the optional extra-options panel by type AND source mode
  const ConditionalLayout = (() => {
    if (logic.cloneTypeId !== "convert") return null;
    if (logic.studyMode === "C") {
      return <ConvertMode logic={logic} activeTheme={activeTheme} />;
    }
    // studyMode === "A"
    return <ConvertModeToC activeTheme={activeTheme} />;
  })();

  // Human-readable target mode label for the summary chip
  const targetModeLabel =
    logic.resolvedOutputMode === "C" ? "Character" : "Standard";

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

      {/* Type-specific options (only rendered for convert) */}
      {ConditionalLayout}

      {/* Skipped cards warning — shown after submission if cards were dropped */}
      {logic.skippedCount > 0 && (
        <div
          className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.text.warning ?? "text-amber-500"}`}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="shrink-0" />
          <span>
            <span className="font-semibold">{logic.skippedCount}</span>{" "}
            {logic.skippedCount === 1 ? "card was" : "cards were"} skipped — no
            valid CJK character found in the front field.
          </span>
        </div>
      )}

      {/* Summary chip */}
      <div
        className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas}`}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[logic.cloneTypeId]}
          className={activeTheme.text.muted}
        />
        <div className={`${activeTheme.text.muted} flex flex-col`}>
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

      {/* Submission error */}
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
