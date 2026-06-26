import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faCheckCircle,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { selectCls } from "../SharedStyles";
import { TYPE_ICONS } from "../../../../utils/constants";

const STUDY_MODES = {
  A: "Standard",
  C: "Character",
};

export function StepCopy1({ logic, activeTheme }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Original deck
        </p>
        <div className="relative w-full">
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${activeTheme.text.muted}`}
          />
          <select
            value={logic.selectedDeckId}
            onChange={(e) => {
              logic.setSelectedDeckId(e.target.value);
              logic.selectCloneType(null);
            }}
            className={`${selectCls(activeTheme)} pl-9`}
          >
            <option value="" disabled>
              Choose a deck…
            </option>
            {logic.decks.map((d) => (
              <option key={d.deck_id} value={d.deck_id}>
                {d.name} · {d.language} ·{" "}
                {STUDY_MODES[d.study_mode.toUpperCase()]}
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

      {logic.selectedDeckId && (
        <div className="flex flex-col gap-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted} mt-2`}
          >
            Copy type
          </p>
          <div className="space-y-2">
            {logic.availableTypes.map((type) => {
              const isActive = logic.cloneTypeId === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => logic.selectCloneType(type.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all outline-none
                    ${
                      isActive
                        ? `ring-2 ${activeTheme.ring.focus} ${activeTheme.border.secondary} ${activeTheme.background.canvas}`
                        : `${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.link.hoverBg}`
                    }`}
                >
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                    ${isActive ? `${activeTheme.background.accent3} ${activeTheme.text.activeButton}` : `${activeTheme.background.secondary} ${activeTheme.text.muted}`}`}
                  >
                    <FontAwesomeIcon
                      icon={TYPE_ICONS[type.id]}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${activeTheme.text.primary}`}
                    >
                      {type.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                      {type.description}
                    </p>
                  </div>
                  {isActive && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={`mt-0.5 shrink-0 ${activeTheme.text.accent1}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
