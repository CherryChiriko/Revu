import { useNavigate } from "react-router-dom";
import Header from "../../General/ui/Header";
import CardRenderer from "../../Study/components/Card/CardRenderer";
import SessionComplete from "../components/Modals/SessionComplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";
import useStudySession from "../hooks/useStudySession";

const SessionMode = ({ mode, activeTheme, activeDeck }) => {
  const navigate = useNavigate();

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
  } = useStudySession({ deck: activeDeck, navMode: mode });

  if (sessionFinished) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app} text-center`}
      >
        <SessionComplete
          learnedCount={limit}
          isOpen={!!sessionSummary}
          onGoBack={exitSession}
          onLearnMore={resetSession}
          activeTheme={activeTheme}
        />
      </div>
    );
  }

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
