import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { selectCls } from "../../../General/ui/FormStyles";
import { TYPE_ICONS, STUDY_MODES } from "../../../../utils/constants";

export function StepCopy1({ logic, activeTheme }) {
  return (
    <div className="space-y-5 sm:space-y-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="original-deck"
          className={`text-sm sm:text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Original deck
        </label>
        <div className="relative w-full">
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm sm:text-xs pointer-events-none ${activeTheme.text.muted}`}
          />
          <select
            id="original-deck"
            value={logic.selectedDeckId}
            onChange={(e) => {
              logic.setSelectedDeckId(e.target.value);
              logic.selectCloneType(null);
            }}
            className={`${selectCls(activeTheme)} pl-10 sm:pl-9 text-base`}
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
        <div className="flex flex-col gap-2">
          <p
            className={`text-sm sm:text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Copy type
          </p>
          <div className="space-y-2.5">
            {logic.availableTypes.map((type) => {
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => logic.selectCloneType(type.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 sm:py-2 rounded-xl border transition-all outline-none min-h-12 sm:min-h-0 active:scale-95
                    ${activeTheme.border.secondary} ${activeTheme.background.canvas} ${activeTheme.link.hoverBg}`}
                >
                  <div
                    className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0
                    ${activeTheme.background.secondary} ${activeTheme.text.muted}`}
                  >
                    <FontAwesomeIcon
                      icon={TYPE_ICONS[type.id]}
                      className="text-sm sm:text-xs"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span
                      className={`text-base sm:text-sm font-semibold ${activeTheme.text.primary}`}
                    >
                      {type.label}
                    </span>
                    <span
                      className={`mt-0.5 text-sm sm:text-xs ${activeTheme.text.muted}`}
                    >
                      {type.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
