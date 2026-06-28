import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { DeckMenu } from "../../../DeckMenu/components/DeckMenu";
import DeckDelete from "../../../DeckMenu/components/DeckDelete";
import DeckMetaEditor from "../DeckMetaEditor";
import { supabase } from "../../../../utils/supabaseClient";
import { STUDY_MODES } from "../../../../utils/constants";

export default function DeckHeaderSection({
  deck,
  deckId,
  activeTheme,
  onDeckDeleted,
}) {
  const dispatch = useDispatch();
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const studyMode = deck?.study_mode || "A";
  const totalCardCount = Number(deck?.cards_count || 0);

  const handleDeleteDeck = async () => {
    if (!pendingDelete) return;
    try {
      const table = "cards_" + (deck?.study_mode ?? "a").toLowerCase();
      await supabase.from(table).delete().eq("deck_id", deckId);
      await supabase.from("decks").delete().eq("id", deckId);
      if (onDeckDeleted) onDeckDeleted();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <header
      className={`${activeTheme.background.secondary} rounded-2xl shadow-xl border ${activeTheme.border.card} overflow-hidden relative p-6 md:p-8`}
    >
      {/* Top decorative gradient bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full">
        {/* Main textual wrapper - explicitly forcing wrap behavior */}
        <div className="w-full space-y-3 min-w-0 flex-1 block">
          <p
            className={`${activeTheme.text.accent1} font-semibold text-xs uppercase tracking-wider block mb-1`}
          >
            Deck details
          </p>

          {isEditingMeta ? (
            <DeckMetaEditor
              deck={deck}
              deckId={deckId}
              activeTheme={activeTheme}
              dispatch={dispatch}
              onSaved={() => setIsEditingMeta(false)}
              onCancel={() => setIsEditingMeta(false)}
            />
          ) : (
            <div className="w-full space-y-3 block overflow-visible">
              {/* Heading Container: Cleaned up line-breaks entirely */}
              <div className="w-full block overflow-visible">
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-balance leading-tight tracking-tight whitespace-normal break-words ${activeTheme.text.primary}`}
                >
                  {deck?.name ?? "Deck Details"}
                </h1>
              </div>

              {deck?.description && (
                <p
                  className={`text-xs sm:text-sm pl-2 max-w-3xl leading-relaxed text-pretty whitespace-normal break-words ${activeTheme.text.secondary}`}
                >
                  {deck.description}
                </p>
              )}

              {deck?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5 pl-2">
                  {deck.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-500/5 border ${activeTheme.border.secondary} ${activeTheme.text.muted}`}
                    >
                      <FontAwesomeIcon
                        icon={faTags}
                        className="text-[9px] opacity-60"
                      />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className={`text-xs pl-2 pt-0.5 ${activeTheme.text.muted}`}>
                <span className="font-bold">
                  {STUDY_MODES[studyMode] || studyMode}
                </span>{" "}
                mode
                {deck?.language && <>&nbsp;·&nbsp;{deck.language}</>}
                &nbsp;·&nbsp;
                <span className="tabular-nums">{totalCardCount}</span> card
                {totalCardCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Menu Actions Wrapper */}
        {!isEditingMeta && (
          <div className="shrink-0 sm:pt-7 self-end sm:self-start">
            <DeckMenu
              activeTheme={activeTheme}
              onEdit={() => setIsEditingMeta(true)}
              onDelete={() => setPendingDelete(deck)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <DeckDelete
        deckData={pendingDelete}
        activeTheme={activeTheme}
        onConfirm={handleDeleteDeck}
        onCancel={() => setPendingDelete(null)}
      />
    </header>
  );
}
