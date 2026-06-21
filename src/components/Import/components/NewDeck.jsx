import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { fetchDecks } from "../../../slices/deckSlice";

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls = (activeTheme) =>
  `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2 transition-all
   ${activeTheme.background.canvas} ${activeTheme.text.primary}
   ${activeTheme.border.card} ${activeTheme.ring?.input ?? "focus:ring-violet-300"}`;

const selectCls = (activeTheme) => `${inputCls(activeTheme)} appearance-none`;

// ─── New deck form ────────────────────────────────────────────────────────────

const STUDY_MODES = [
  { value: "A", label: "Standard (A)", description: "Front / Back flashcards" },
  {
    value: "C",
    label: "Chinese writing (C)",
    description: "Characters, pinyin, strokes",
  },
];

export function NewDeck({ activeTheme, onCreated }) {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [studyMode, setStudyMode] = useState("A");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const isValid = name.trim() !== "" && language.trim() !== "";

  const handleCreate = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not authenticated.");

      const lang = language.trim();
      const formattedLang =
        lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

      const { data: newDeck, error: deckErr } = await supabase
        .from("decks")
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            language: formattedLang,
            study_mode: studyMode,
            description: description.trim() || null,
            tags: tags
              ? tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            cards_count: 0,
            new_count: 0,
            due_count: 0,
            waiting_count: 0,
            mastered_count: 0,
            suspended_count: 0,
            active_cards_count: 0,
            status: "learning",
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (deckErr) throw deckErr;

      await dispatch(fetchDecks()).unwrap();
      onCreated(newDeck.id);
    } catch (err) {
      console.error("Failed to create deck:", err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Deck name <span className="text-red-400">*</span>
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. HSK 1 Vocabulary"
          className={inputCls(activeTheme)}
          autoFocus
        />
      </div>

      {/* Language + Study mode side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Language <span className="text-red-400">*</span>
          </p>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. Chinese"
            className={inputCls(activeTheme)}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Card type
          </p>
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
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
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
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Tags
        </p>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className={inputCls(activeTheme)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={!isValid || isSaving}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2
          bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white
          disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
      >
        {isSaving ? (
          <>
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            Creating…
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSquarePlus} />
            Create deck
          </>
        )}
      </button>
    </div>
  );
}
