import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useCreateNew } from "../hooks/useCreateNew";
import { inputCls, selectCls } from "./SharedStyles";

const STUDY_MODES = [
  { value: "A", label: "Standard", description: "Front / Back flashcards" },
  {
    value: "C",
    label: "Character",
    description: "Characters, pinyin, strokes",
  },
];

export function NewDeck({ activeTheme, onCreated }) {
  // Consume our isolated logic hook
  const {
    name,
    setName,
    language,
    setLanguage,
    studyMode,
    setStudyMode,
    description,
    setDescription,
    tags,
    setTags,
    isSaving,
    error,
    isValid,
    handleCreate,
  } = useCreateNew(onCreated);

  const isButtonDisabled = !isValid || isSaving;

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Deck name <span className={activeTheme.text.danger}>*</span>
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name"
          className={inputCls(activeTheme)}
          autoFocus
        />
      </div>

      {/* Language + Study mode side by side */}
      <div className="flex gap-3 w-full">
        <div className="flex flex-col gap-1 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Language <span className={activeTheme.text.danger}>*</span>
          </p>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Enter target language"
            className={inputCls(activeTheme)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
          >
            Card type
          </p>
          <div className="relative w-full">
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value)}
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
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Description
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description…"
          rows={2}
          className={`${inputCls(activeTheme)} resize-none`}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Tags
        </p>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={(e) => {
            const rawValue = e.target.value;
            if (!rawValue.trim()) return;

            const tagArray = rawValue
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);

            const uniqueTags = [];
            const seen = new Set();

            tagArray.forEach((tag) => {
              const lower = tag.toLowerCase();
              if (!seen.has(lower)) {
                seen.add(lower);
                uniqueTags.push(tag);
              }
            });

            setTags(uniqueTags.join(", "));
          }}
          placeholder="tag1, tag2, tag3"
          className={inputCls(activeTheme)}
        />
      </div>

      {error && (
        <div
          className={`flex items-center gap-1 text-xs ${activeTheme.text.danger}`}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={isButtonDisabled}
        className={`w-full mt-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
          ${
            isButtonDisabled
              ? activeTheme.button.disabled
              : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} opacity-100 hover:brightness-110`
          }`}
      >
        {isSaving ? (
          <>
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
            Creating…
          </>
        ) : (
          <>Create deck</>
        )}
      </button>
    </div>
  );
}
