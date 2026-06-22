import React from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";
import { selectActiveDeck, selectDecks } from "../../../slices/deckSlice";
import { selectUserProfile } from "../../../slices/userSlice";
import useStudySession from "../hooks/useStudySession";
import SessionMode from "./SessionMode";

const StudySession = () => {
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log("[StudySession] render #", renderCount.current);
  React.useEffect(() => {
    console.log("[StudySession] MOUNTED");
    return () => console.log("[StudySession] UNMOUNTED");
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = searchParams.get("mode"); // "learn" or "review"

  const activeTheme = useSelector(selectActiveTheme);
  const activeDeck = useSelector(selectActiveDeck);
  const allDecks = useSelector(selectDecks);

  const navMode = params ?? (activeDeck?.due > 0 ? "review" : "learn");

  const profile = useSelector(selectUserProfile);
  const session = useStudySession({
    deck: activeDeck,
    navMode,
    userId: profile?.id,
  });
  const { status, cards, error } = session;

  if (!allDecks || allDecks.length === 0) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center p-6 text-center ${activeTheme.background.app}`}
      >
        <div className="max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative w-20 h-24 border-2 border-dashed border-neutral-400 rounded-xl flex items-center justify-center opacity-40">
              <span className="text-2xl font-light">+</span>
              <div className="absolute top-1 left-1 w-full h-full border-2 border-dashed border-neutral-400 rounded-xl -z-10 translate-x-2 translate-y-2 opacity-50"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h2
              className={`text-2xl font-bold tracking-tight ${activeTheme.text.primary}`}
            >
              Your collection is empty
            </h2>
            <p
              className={`text-sm max-w-xs mx-auto ${activeTheme.text.secondary}`}
            >
              Create your very first deck of study flashcards to kickstart your
              daily learning streak!
            </p>
          </div>

          <button
            onClick={() => navigate("/decks?action=create")}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200"
          >
            Create First Deck
          </button>
        </div>
      </div>
    );
  }

  if (!activeDeck) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-xl mb-4`}>
          No active deck selected.
        </p>
        <button
          onClick={() => navigate("/decks")}
          className={`flex items-center px-4 py-2 border rounded-lg ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
        >
          Return to Decks
        </button>
      </div>
    );
  }

  // --- Loading states ---
  if (status === "loading" || status === "idle") {
    return (
      <div
        className={`h-screen flex items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-xl animate-pulse`}>
          Loading cards for "{activeDeck.name}"...
        </p>
      </div>
    );
  }

  if (status === "failed" || error) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-xl`}>
          Error: Could not load cards.
        </p>
      </div>
    );
  }

  console.log("[StudySession render]", {
    status,
    cardsLength: cards?.length,
    activeDeckId: activeDeck?.id,
  });

  // --- Session Mode ---
  if (status === "succeeded" && cards.length > 0 && navMode) {
    return (
      <SessionMode
        mode={navMode}
        activeTheme={activeTheme}
        activeDeck={activeDeck}
        session={session}
      />
    );
  }

  // --- No cards available fallback ---
  if (status === "succeeded") {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-2xl font-bold`}>
          All caught up!
        </p>
        <p className={`${activeTheme.text.secondary} text-xl mt-2 mb-4`}>
          "{activeDeck.name}" has no new or due cards.
        </p>
        <button
          onClick={() => navigate("/decks")}
          className={`flex items-center ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
        >
          Return to Decks
        </button>
      </div>
    );
  }
};

export default StudySession;
