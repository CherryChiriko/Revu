import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faLayerGroup,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Step0 = ({ activeTheme, logic, onSelectNew, onSelectExisting }) => {
  const selectCls = `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none
    focus:ring-2 appearance-none transition-all
    ${activeTheme.background.canvas} ${activeTheme.text.primary}
    ${activeTheme.border.card} focus:ring-violet-300`;

  const MODES = [
    {
      id: "new",
      icon: faSquarePlus,
      title: "New deck",
      description: "Create a new deck and populate it from your file.",
    },
    {
      id: "existing",
      icon: faLayerGroup,
      title: "Add to existing deck",
      description:
        "Append new cards from your file to a deck you already have. Existing cards are never modified.",
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h2
          className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
        >
          <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5" />
          How would you like to import?
        </h2>
        <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
          Choose whether to create a new deck or add cards to an existing one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODES.map((mode) => {
          const isSelected = logic.importMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => logic.setImportMode(mode.id)}
              className={`text-left flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200
                ${
                  isSelected
                    ? `border-violet-400 ring-2 ring-violet-300/40 ${activeTheme.background.canvas}`
                    : `${activeTheme.border.card} ${activeTheme.background.canvas} hover:border-violet-300`
                }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${isSelected ? "bg-violet-500/20 text-violet-400" : `${activeTheme.background.secondary} ${activeTheme.text.muted}`}`}
              >
                <FontAwesomeIcon icon={mode.icon} className="w-4 h-4" />
              </div>
              <div>
                <p className={`font-semibold ${activeTheme.text.primary}`}>
                  {mode.title}
                </p>
                <p className={`text-sm mt-1 ${activeTheme.text.muted}`}>
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {logic.importMode === "existing" && (
        <div className="mt-6 space-y-2">
          <label
            className={`block text-sm font-semibold ${activeTheme.text.primary}`}
          >
            Target deck <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLayerGroup}
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${activeTheme.text.muted}`}
            />
            <select
              value={logic.targetDeckId}
              onChange={(e) => logic.setTargetDeckId(e.target.value)}
              className={`${selectCls} pl-8`}
            >
              <option value="" disabled>
                Choose a deck…
              </option>
              {logic.allDecks.map((d) => (
                <option key={d.deck_id} value={d.deck_id}>
                  {d.name} · {d.language} · Mode {d.study_mode}
                </option>
              ))}
            </select>
          </div>
          {logic.targetDeck && (
            <p className={`text-xs ${activeTheme.text.muted}`}>
              Cards will be appended to{" "}
              <span className={`font-semibold ${activeTheme.text.primary}`}>
                {logic.targetDeck.name}
              </span>{" "}
              (Mode {logic.targetDeck.study_mode} ·{" "}
              {logic.targetDeck.cards_count ?? 0} cards currently). New cards
              will use the same card format as this deck.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={() => {
            if (logic.importMode === "new") onSelectNew();
            else if (logic.importMode === "existing" && logic.targetDeckId)
              onSelectExisting();
          }}
          disabled={
            !logic.importMode ||
            (logic.importMode === "existing" && !logic.targetDeckId)
          }
          className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
        >
          Next
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>
    </>
  );
};

export default Step0;
