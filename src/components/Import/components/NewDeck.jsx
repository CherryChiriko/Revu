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
    <div className="space-y-4">
      {/* Name */}
      <FormField label="Deck name" required activeTheme={activeTheme}>
        <input
          type="text"
          value={state.name}
          onChange={(e) => state.setName(e.target.value)}
          placeholder="Enter deck name"
          className={baseInputCls}
          autoFocus
        />
      </FormField>

      {/* Language + Card Type Side-by-Side Flex Grid */}
      <div className="flex gap-3 w-full">
        <div className="flex-1">
          <FormField label="Language" required activeTheme={activeTheme}>
            <input
              type="text"
              value={state.language}
              onChange={(e) => state.setLanguage(e.target.value)}
              placeholder="Enter target language"
              className={baseInputCls}
            />
          </FormField>
        </div>

        <div className="flex-1">
          <FormField label="Card type" activeTheme={activeTheme}>
            <div className="relative w-full">
              <select
                value={state.studyMode}
                onChange={(e) => state.setStudyMode(e.target.value)}
                className={selectCls(activeTheme)}
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
          value={state.description}
          onChange={(e) => state.setDescription(e.target.value)}
          placeholder="Optional description…"
          rows={2}
          className={`${baseInputCls} resize-none`}
        />
      </FormField>

      {/* Tags */}
      <FormField label="Tags" activeTheme={activeTheme}>
        <input
          type="text"
          value={state.tags}
          onChange={(e) => state.setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className={baseInputCls}
        />
      </FormField>

      {state.error && (
        <div
          className={`flex items-center gap-1 text-xs ${activeTheme.text.danger}`}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
          {state.error}
        </div>
      )}

      <button
        onClick={state.handleCreate}
        disabled={isButtonDisabled}
        className={`w-full mt-2 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
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
