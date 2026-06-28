// components/DeckDetails/DeckMetaEditor.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../utils/supabaseClient";
import { updateDeckLocally } from "../../../slices/deckSlice";

const C_LANGUAGES = ["Chinese"];

// Shared class styles for clean, uniform input boxes
const inputCls =
  "w-full text-xs font-medium px-3 py-2 rounded-xl border bg-transparent outline-none focus:ring-1 transition-all";

export default function DeckMetaEditor({
  deck,
  deckId,
  activeTheme,
  onSaved,
  onCancel,
  dispatch,
}) {
  const studyMode = deck?.study_mode ?? "A";
  const isCharacterMode = studyMode === "C";

  const [editName, setEditName] = useState(deck?.name ?? "");
  const [editDescription, setEditDescription] = useState(
    deck?.description ?? "",
  );
  const [editTags, setEditTags] = useState(deck?.tags ?? []);
  const [editLanguage, setEditLanguage] = useState(deck?.language ?? "");
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);

  // Fetch language suggestions for non-character decks
  useEffect(() => {
    if (isCharacterMode) return;

    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabase
        .from("decks")
        .select("language")
        .eq("user_id", data.user.id)
        .then(({ data: rows }) => {
          const unique = [...new Set(rows?.map((r) => r.language))].filter(
            Boolean,
          );
          setLanguageSuggestions(unique);
        });
    });
  }, [isCharacterMode]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim();
      if (!editTags.includes(cleanTag)) {
        setEditTags([...editTags, cleanTag]);
      }
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const lang = editLanguage.trim();
      const formattedLang = lang
        ? lang.charAt(0).toUpperCase() + lang.slice(1)
        : "";

      const { error } = await supabase
        .from("decks")
        .update({
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
          language: formattedLang,
        })
        .eq("id", deckId);

      if (error) throw error;

      dispatch(
        updateDeckLocally({
          id: deckId,
          name: editName.trim(),
          description: editDescription.trim(),
          tags: editTags,
          language: formattedLang,
        }),
      );
      onSaved();
    } catch (err) {
      console.error(err);
      setSaveError("Could not save — please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Build reactive styling classes based on the theme context
  const inputThemeCls = `${activeTheme.border.secondary} ${activeTheme.text.primary} focus:${activeTheme.border.primary} focus:ring-indigo-500/30`;

  return (
    <div className="space-y-3 max-w-xl text-left">
      {/* Name Input */}
      <div>
        <label
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Deck Name
        </label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className={`mt-1 ${inputCls} ${inputThemeCls}`}
          placeholder="Deck name…"
          autoFocus
        />
      </div>

      {/* Language Selector / Input */}
      <div>
        <label
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Language
        </label>
        {isCharacterMode ? (
          <select
            value={editLanguage}
            onChange={(e) => setEditLanguage(e.target.value)}
            className={`mt-1 ${inputCls} ${inputThemeCls} ${activeTheme.background.canvas}`}
          >
            <option value="" disabled>
              Select language
            </option>
            {C_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              type="text"
              list="language-suggestions"
              value={editLanguage}
              onChange={(e) => setEditLanguage(e.target.value)}
              className={`mt-1 ${inputCls} ${inputThemeCls}`}
              placeholder="e.g. Japanese, Spanish…"
            />
            <datalist id="language-suggestions">
              {languageSuggestions.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </>
        )}
      </div>

      {/* Description Input */}
      <div>
        <label
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Description
        </label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={2}
          className={`mt-1 ${inputCls} ${inputThemeCls} resize-none`}
          placeholder="Brief description…"
        />
      </div>

      {/* Tags Input */}
      <div>
        <label
          className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Tags (Press Enter)
        </label>
        <div
          className={`mt-1 flex flex-wrap gap-1.5 p-2 rounded-xl border min-h-[40px] ${activeTheme.background.canvas} ${activeTheme.border.secondary}`}
        >
          {editTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[11px] font-medium px-2 py-0.5 rounded-md border border-indigo-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
                aria-label={`Remove tag ${tag}`}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[10px] hover:text-red-400 cursor-pointer"
                />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={editTags.length === 0 ? "Add tags…" : ""}
            className="flex-1 bg-transparent text-xs px-1 min-w-[60px] focus:outline-none"
          />
        </div>
      </div>

      {saveError && <p className="text-xs text-red-400">{saveError}</p>}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} disabled:opacity-50`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !editName.trim()}
          className={`px-3 py-1.5 text-xs font-semibold text-white rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
