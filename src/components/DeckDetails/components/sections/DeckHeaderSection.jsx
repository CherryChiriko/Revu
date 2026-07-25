// src/components/DeckDetails/components/sections/DeckHeaderSection.jsx
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
  const gradientFrom = activeTheme?.gradients?.from || "from-indigo-500";
  const gradientTo = activeTheme?.gradients?.to || "to-purple-500";

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
      className={`${activeTheme.background.secondary} rounded-2xl shadow-xl border ${activeTheme.border.card} overflow-hidden relative p-4 md:p-6 lg:p-8`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 md:gap-6 w-full">
        <div className="w-full space-y-2 md:space-y-3 min-w-0 flex-1">
          {!isEditingMeta && (
            <p
              className={`${activeTheme.text.accent1} font-semibold text-[10px] md:text-xs uppercase tracking-wider`}
            >
              Deck details
            </p>
          )}

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
            <div className="w-full space-y-2 md:space-y-3">
              <h1
                className={`text-xl md:text-2xl lg:text-4xl font-extrabold text-balance leading-tight tracking-tight break-words ${activeTheme.text.primary}`}
              >
                {deck?.name ?? "Deck Details"}
              </h1>

              {deck?.description && (
                <p
                  className={`text-xs md:text-sm md:pl-2 max-w-3xl leading-relaxed text-pretty break-words ${activeTheme.text.secondary}`}
                >
                  {deck.description}
                </p>
              )}

              {deck?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:pl-2">
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

              <p
                className={`text-[11px] md:text-xs md:pl-2 ${activeTheme.text.muted}`}
              >
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

        {!isEditingMeta && (
          <div className="shrink-0 pt-0 sm:pt-6 self-start">
            <DeckMenu
              activeTheme={activeTheme}
              onEdit={() => setIsEditingMeta(true)}
              onDelete={() => setPendingDelete(deck)}
            />
          </div>
        )}
      </div>

      <DeckDelete
        deckData={pendingDelete}
        activeTheme={activeTheme}
        onConfirm={handleDeleteDeck}
        onCancel={() => setPendingDelete(null)}
      />
    </header>
  );
}
