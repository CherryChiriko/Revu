import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useDeckLogic from "../hooks/useDeckLogic";
import FullVariant from "./variants/FullVariant";
import CompactVariant from "./variants/CompactVariant";
import ListVariant from "./variants/ListVariant";
import DeckDelete from "../../DeckMenu/components/DeckDelete";
import { supabase } from "../../../utils/supabaseClient";
import { updateDeckLocally } from "../../../slices/deckSlice";

function DeckCardItem({ deck, activeTheme, variant, toast, highlightedId }) {
  const logic = useDeckLogic(deck.id, deck.cards_count || 0, {
    toast,
    activeTheme,
  });

  // Local state for all editable deck fields
  const [editName, setEditName] = useState(deck?.name || "");
  const [editDescription, setEditDescription] = useState(
    deck?.description || "",
  );
  const [editLanguage, setEditLanguage] = useState(deck?.language || "");
  const [editTags, setEditTags] = useState(deck?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Keep state synced if deck changes externally
  useEffect(() => {
    if (deck) {
      setEditName(deck.name || "");
      setEditDescription(deck.description || "");
      setEditLanguage(deck.language || "");
      setEditTags(deck.tags || []);
    }
  }, [deck]);

  if (!deck || !logic) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  if (isMobile) {
    variant = "list";
  }

  const isHighlighted =
    highlightedId &&
    (String(deck.id) === String(highlightedId) ||
      String(deck.deck_id) === String(highlightedId));

  const glowColor = activeTheme.gradients?.colors?.[4] || "#6366f1";
  const isList = variant === "list";

  const base = `
    rounded-xl border shadow-md transition-all duration-300
    ${activeTheme.border.card}
    ${activeTheme.background.secondary}
    ${activeTheme.text.primary}
    ${isList ? "p-3.5 w-[82vw] max-w-[320px] shrink-0 snap-center select-none" : "p-4 hover:shadow-xl"}
    ${!logic.isEditing ? "cursor-pointer hover:-translate-y-1" : ""}
    ${
      isHighlighted && !isList
        ? `ring-4 ${activeTheme.ring?.focus || "ring-indigo-500"} shadow-[0_0_35px_${glowColor}80] scale-[1.03] -translate-y-1 animate-pulse`
        : isHighlighted && isList
          ? `ring-2 ${activeTheme.ring?.focus || "ring-indigo-500"}`
          : ""
    }
  `;

  // Tag helper
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

  const handleRemoveTag = (tagToRemove) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editName.trim()) return;

    setIsSaving(true);
    try {
      const formattedLang = editLanguage.trim()
        ? editLanguage.trim().charAt(0).toUpperCase() +
          editLanguage.trim().slice(1)
        : "";

      const updatedFields = {
        name: editName.trim(),
        description: editDescription.trim(),
        language: formattedLang,
        tags: editTags,
      };

      const { error } = await supabase
        .from("decks")
        .update(updatedFields)
        .eq("id", deck.id);

      if (error) throw error;

      // Update Redux immediately
      logic.dispatch(
        updateDeckLocally({
          id: deck.id,
          ...updatedFields,
        }),
      );

      logic.setIsEditing(false);
      toast?.current?.show({
        severity: "success",
        summary: "Saved",
        detail: "Deck updated successfully.",
        life: 2500,
      });
    } catch (err) {
      console.error(err);
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Could not save changes.",
        life: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditName(deck?.name || "");
    setEditDescription(deck?.description || "");
    setEditLanguage(deck?.language || "");
    setEditTags(deck?.tags || []);
    setTagInput("");
    logic.setIsEditing(false);
  };

  let Content;
  switch (variant) {
    case "large":
      Content = FullVariant;
      break;
    case "compact":
    case "dashboard":
      Content = CompactVariant;
      break;
    case "list":
      Content = ListVariant;
      break;
    default:
      Content = null;
  }

  return (
    <>
      <div className={base} onClick={logic.handleCardClick}>
        {logic.isEditing ? (
          /* Card-Native Inline Editor with All Fields */
          <div
            className="flex flex-col gap-2 text-left w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & Language side-by-side to save vertical space */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label
                  className={`text-[9px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className={`w-full mt-0.5 px-2 py-1 text-xs font-semibold rounded-lg border bg-transparent outline-none focus:ring-1 focus:ring-indigo-500/50 ${activeTheme.border.secondary} ${activeTheme.text.primary}`}
                  placeholder="Deck name..."
                />
              </div>
              <div>
                <label
                  className={`text-[9px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
                >
                  Language
                </label>
                <input
                  type="text"
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className={`w-full mt-0.5 px-2 py-1 text-xs rounded-lg border bg-transparent outline-none focus:ring-1 focus:ring-indigo-500/50 ${activeTheme.border.secondary} ${activeTheme.text.primary}`}
                  placeholder="e.g. Spanish"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                className={`text-[9px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
              >
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={1}
                className={`w-full mt-0.5 px-2 py-1 text-xs rounded-lg border bg-transparent resize-none outline-none focus:ring-1 focus:ring-indigo-500/50 ${activeTheme.border.secondary} ${activeTheme.text.primary}`}
                placeholder="Brief description..."
              />
            </div>

            {/* Tags Input */}
            <div>
              <label
                className={`text-[9px] font-bold uppercase tracking-wider ${activeTheme.text.muted}`}
              >
                Tags (Press Enter)
              </label>
              <div
                className={`mt-0.5 flex flex-wrap gap-1 p-1.5 rounded-lg border min-h-[32px] ${activeTheme.border.secondary}`}
              >
                {editTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-medium px-1.5 py-0.5 rounded border border-indigo-500/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="text-[9px] hover:text-red-400 cursor-pointer"
                      />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={editTags.length === 0 ? "Add tag..." : ""}
                  className="flex-1 bg-transparent text-xs px-1 min-w-[50px] outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:bg-white/5`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !editName.trim()}
                className={`px-3 py-1 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          Content && (
            <Content deck={deck} activeTheme={activeTheme} logic={logic} />
          )
        )}
      </div>

      <DeckDelete
        deckData={logic.pendingDeleteDeck}
        activeTheme={activeTheme}
        onConfirm={logic.onConfirmDelete}
        onCancel={logic.onCancelDelete}
      />
    </>
  );
}

export default DeckCardItem;
