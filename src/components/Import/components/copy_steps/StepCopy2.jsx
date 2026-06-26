import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { inputCls } from "../SharedStyles";
import { FieldMapping } from "./FieldMapping";
import { MissedLimitSlider } from "./MissedLimitSlider";
import { SwapComponent } from "./SwapComponent";
import { MergeComponent } from "./MergeComponent";
import { TYPE_ICONS } from "../../../../utils/constants";

export function StepCopy2({ logic, activeTheme }) {
  // 1. Define your component map matching your keys
  const ConditionalLayout =
    {
      simple: null,
      c_to_a: <FieldMapping logic={logic} activeTheme={activeTheme} />,
      merge: <MergeComponent logic={logic} activeTheme={activeTheme} />,
      missed: <MissedLimitSlider logic={logic} activeTheme={activeTheme} />,
      swap: <SwapComponent logic={logic} activeTheme={activeTheme} />,
    }[logic.cloneTypeId] || null; // Fallback to null if key doesn't match

  const studyModeText =
    logic.cloneTypeId === "simple" && logic.selectedDeck?.studyMode === "C"
      ? "Character"
      : "Standard";

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

      {/* 2. Render the mapped component cleanly */}
      {ConditionalLayout}

      {/* Summary chip */}
      <div
        className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas}`}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[logic.cloneTypeId]}
          className={activeTheme.text.muted}
        />
        <div className={`{activeTheme.text.muted} flex flex-col`}>
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
            <span className={`font-semibold ${activeTheme.text.primary}`}>
              {studyModeText}
            </span>{" "}
            Mode
          </span>
        </div>
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
