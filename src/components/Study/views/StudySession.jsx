import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";
import { selectActiveDeck } from "../../../slices/deckSlice";
import useStudySession from "../hooks/useStudySession";
import SessionMode from "./SessionMode";

const StudySession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const params = searchParams.get("mode"); // "learn" or "review"

  const activeTheme = useSelector(selectActiveTheme);
  const activeDeck = useSelector(selectActiveDeck);

  const navMode = params ?? (activeDeck.due_count > 0 ? "review" : "learn");

  // --- Use new hook ---
  const { status, cards, error } = useStudySession({
    deck: activeDeck,
    navMode,
  });

  // --- No active deck ---
  if (!activeDeck) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-xl`}>
          No active deck selected.
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

  // --- Session Mode ---
  if (status === "succeeded" && cards.length > 0 && navMode) {
    return (
      <SessionMode
        mode={navMode}
        activeTheme={activeTheme}
        activeDeck={activeDeck}
      />
    );
  }

  // --- No cards available fallback (only after data has fully loaded) ---
  if (status === "succeeded") {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app}`}
      >
        <p className={`${activeTheme.text.primary} text-2xl font-bold`}>
          All caught up!
        </p>
        <p className={`${activeTheme.text.secondary} text-xl mt-2`}>
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
