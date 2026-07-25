import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useCreateNew } from "../hooks/useCreateNew";
import { inputCls, selectCls } from "../../General/ui/FormStyles";
import { FormField } from "../../General/ui/FormField";

const STUDY_MODES = [
  { value: "A", label: "Standard" },
  { value: "C", label: "Character" },
];

export function NewDeck({ activeTheme, onCreated }) {
  const state = useCreateNew(onCreated);
  const baseInputCls = inputCls(activeTheme);
  const isButtonDisabled = !state.isValid || state.isSaving;

  return (
    <div className="space-y-5 sm:space-y-4">
      {/* Name */}
      <FormField label="Deck name" required activeTheme={activeTheme}>
        <input
          type="text"
          id="deck-name"
          value={state.name}
          onChange={(e) => state.setName(e.target.value)}
          placeholder="Enter deck name"
          className={`${baseInputCls} text-base`}
          autoFocus
          autoComplete="off"
          enterKeyHint="next"
        />
      </FormField>

      {/* Language + Card Type — stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex-1 min-w-0">
          <FormField label="Language" required activeTheme={activeTheme}>
            <input
              type="text"
              id="deck-language"
              value={state.language}
              onChange={(e) => state.setLanguage(e.target.value)}
              placeholder="Enter target language"
              className={`${baseInputCls} text-base`}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="next"
            />
          </FormField>
        </div>

        <div className="flex-1 min-w-0">
          <FormField label="Card type" activeTheme={activeTheme}>
            <div className="relative w-full">
              <select
                id="deck-study-mode"
                value={state.studyMode}
                onChange={(e) => state.setStudyMode(e.target.value)}
                className={`${selectCls(activeTheme)} text-base`}
              >
                {STUDY_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${activeTheme.text.muted}`}
              >
                <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
              </div>
            </div>
          </FormField>
        </div>
      </div>

      {/* Description */}
      <FormField label="Description" activeTheme={activeTheme}>
        <textarea
          id="deck-description"
          value={state.description}
          onChange={(e) => state.setDescription(e.target.value)}
          placeholder="Optional description…"
          rows={3}
          className={`${baseInputCls} resize-none text-base`}
        />
      </FormField>

      {/* Tags */}
      <FormField label="Tags" activeTheme={activeTheme}>
        <input
          type="text"
          id="deck-tags"
          value={state.tags}
          onChange={(e) => state.setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className={`${baseInputCls} text-base`}
          autoComplete="off"
          enterKeyHint="done"
        />
      </FormField>

      {state.error && (
        <div
          className={`flex items-start gap-2 text-sm sm:text-xs ${activeTheme.text.danger}`}
          role="alert"
          aria-live="polite"
        >
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="shrink-0 mt-0.5"
          />
          {state.error}
        </div>
      )}

      <button
        onClick={state.handleCreate}
        disabled={isButtonDisabled}
        aria-busy={state.isSaving}
        className={`w-full mt-2 py-3.5 sm:py-2.5 rounded-xl text-base sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-12 sm:min-h-0
          ${
            isButtonDisabled
              ? activeTheme.button.disabled
              : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} opacity-100 hover:brightness-110`
          }`}
      >
        {state.isSaving ? "Creating…" : "Create deck"}
      </button>
    </div>
  );
}
