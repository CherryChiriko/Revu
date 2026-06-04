import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../General/ui/Header";
import CardRenderer from "../../Study/components/Card/CardRenderer";
import SessionComplete from "../components/Modals/SessionComplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";

const SessionMode = ({ mode, activeTheme, activeDeck, session }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("[SessionMode] MOUNTED");
    return () => console.log("[SessionMode] UNMOUNTED");
  }, []);

  const {
    currentCard,
    currentPhase,
    progress,
    cards,
    sessionFinished,
    sessionSummary,
    limit,
    onReveal,
    handleRate,
    handlePassComplete,
    resetSession,
    exitSession,
  } = session;

  // SessionMode.jsx
  const [previousCardId, setPreviousCardId] = React.useState(currentCard?.id);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [sessionResetCount, setSessionResetCount] = React.useState(0);
  const transitionTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (!isTransitioning) return;

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (currentCard?.id && currentCard?.id !== previousCardId) {
      setIsTransitioning(false);
      setPreviousCardId(currentCard.id);
      return;
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 1000);

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [isTransitioning, currentCard?.id, previousCardId]);

  const handleResetSession = React.useCallback(() => {
    setPreviousCardId(currentCard?.id);
    setIsTransitioning(true);
    setSessionResetCount((count) => count + 1);
    resetSession(true);
  }, [currentCard?.id, resetSession]);

  if (sessionFinished) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app} text-center`}
      >
        <SessionComplete
          learnedCount={limit}
          isOpen={!!sessionSummary}
          onGoBack={exitSession}
          onLearnMore={handleResetSession}
          activeTheme={activeTheme}
        />
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div
        className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
          <Header title={`${activeDeck.name}`} />
          <div className="h-96 flex items-center justify-center">
            <p className="text-xl animate-pulse">Loading next card…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  if (!cards.length) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app} text-center`}
      >
        <h3
          className={`text-2xl font-semibold mb-3 ${activeTheme.text.primary}`}
        >
          No cards available for this session.
        </h3>
        <button
          onClick={() => navigate("/decks")}
          className={`flex items-center ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
        >
          Return to decks
        </button>
      </div>
    );
  }

  console.log("[SessionMode render]", {
    currentCard: currentCard?.id,
    phase: currentPhase?.displayState,
    sessionFinished,
  });

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Header title={`${activeDeck.name}`} />

        <header className="flex justify-between items-center mb-10">
          <button
            onClick={exitSession}
            className={`flex items-center ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 mr-2" />
            Exit Study
          </button>

          <Bar
            activeTheme={activeTheme}
            current={progress.current}
            total={progress.total}
          />

          <div className="w-32" />
        </header>

        <div className="relative perspective-1000 w-full max-w-2xl mx-auto h-96 mb-8">
          <CardRenderer
            key={`${currentCard.id}-${sessionResetCount}`}
            card={currentCard}
            study_mode={activeDeck.study_mode}
            phase={currentPhase}
            activeTheme={activeTheme}
            displayState={currentPhase.displayState}
            allowRating={currentPhase.allowRating}
            onReveal={onReveal}
            onRate={handleRate}
            onPassComplete={handlePassComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionMode;
