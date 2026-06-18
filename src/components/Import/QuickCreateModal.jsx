import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSquarePlus,
  faCopy,
  faChevronRight,
  faCheckCircle,
  faExclamationCircle,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { fetchDecks, selectDecks } from "../../slices/deckSlice";
import { useQuickCreate } from "./hooks/useQuickCreate";
// ─── Clone path — inline (reuses useQuickCreate hook) ────────────────────────
// We import CloneDeckModal's inner content directly to keep everything in one modal.
// Rather than nesting modals, we embed the clone steps here.
import CloneDeckModal from "./CloneDeckModal";

// ─── Shared primitives ────────────────────────────────────────────────────────

const AccentStripe = ({ activeTheme }) => (
  <div
    className={`h-1 w-full bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
  />
);

const inputCls = (activeTheme) =>
  `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2 transition-all
   ${activeTheme.background.canvas} ${activeTheme.text.primary}
   ${activeTheme.border.card} ${activeTheme.ring?.input ?? "focus:ring-violet-300"}`;

const selectCls = (activeTheme) => `${inputCls(activeTheme)} appearance-none`;

// ─── Path picker ──────────────────────────────────────────────────────────────

const PATHS = [
  {
    id: "new",
    icon: faSquarePlus,
    title: "New deck",
    description: "Create an empty deck and add cards manually.",
  },
  {
    id: "clone",
    icon: faCopy,
    title: "Clone existing deck",
    description:
      "Swap columns, convert format, merge directions, or extract your hardest cards.",
  },
];

function PathPicker({ activePath, onPick, activeTheme }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {PATHS.map((path) => {
        const isActive = activePath === path.id;
        return (
          <button
            key={path.id}
            type="button"
            onClick={() => onPick(path.id)}
            className={`text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all
              ${
                isActive
                  ? `border-violet-400 ring-2 ring-violet-300/40 ${activeTheme.background.canvas}`
                  : `${activeTheme.border.card} ${activeTheme.background.canvas} hover:border-violet-300`
              }`}
          >
            <div
              className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0
              ${isActive ? "bg-violet-500/20 text-violet-400" : `${activeTheme.background.secondary} ${activeTheme.text.muted}`}`}
            >
              <FontAwesomeIcon icon={path.icon} className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${activeTheme.text.primary}`}
              >
                {path.title}
              </p>
              <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                {path.description}
              </p>
            </div>
            {isActive && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-violet-400 mt-0.5 shrink-0"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── New deck form ────────────────────────────────────────────────────────────

const STUDY_MODES = [
  { value: "A", label: "Standard (A)", description: "Front / Back flashcards" },
  {
    value: "C",
    label: "Chinese writing (C)",
    description: "Characters, pinyin, strokes",
  },
];

function NewDeckForm({ activeTheme, onCreated }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function QuickCreateModal({ activeTheme, isOpen, onClose }) {
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(null); // null | "new" | "clone"

  const handleClose = () => {
    setActivePath(null);
    onClose();
  };

  const handleDeckCreated = (deckId) => {
    handleClose();
    navigate(`/decks/${deckId}`);
  };

  if (!isOpen) return null;

  // If clone path chosen, hand off to CloneDeckModal's internals.
  // Simplest approach: close this modal and open clone modal.
  // We manage this via a flag.
  if (activePath === "clone") {
    return (
      <CloneDeckModal
        activeTheme={activeTheme}
        isOpen={true}
        onClose={handleClose}
        onBack={() => setActivePath(null)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border
        ${activeTheme.background.secondary} ${activeTheme.border.card}`}
      >
        <AccentStripe activeTheme={activeTheme} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className={`text-base font-bold ${activeTheme.text.primary}`}>
              {activePath === "new" ? "New Deck" : "Quick Create"}
            </h2>
            <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
              {activePath === "new"
                ? "Create an empty deck and add cards later"
                : "Choose what you'd like to do"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {!activePath ? (
            <>
              <PathPicker
                activePath={activePath}
                onPick={setActivePath}
                activeTheme={activeTheme}
              />
            </>
          ) : activePath === "new" ? (
            <>
              <button
                onClick={() => setActivePath(null)}
                className={`text-xs font-semibold ${activeTheme.text.muted} hover:${activeTheme.text.secondary} flex items-center gap-1 mb-1`}
              >
                ← Back
              </button>
              <NewDeckForm
                activeTheme={activeTheme}
                onCreated={handleDeckCreated}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
