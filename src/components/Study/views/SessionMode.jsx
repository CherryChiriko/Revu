import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CardRenderer from "../../Study/components/Card/CardRenderer";
import SessionComplete from "../components/Modals/SessionComplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";
import { selectSettings } from "../../../slices/settingsSlice";

const SessionMode = ({ mode, activeTheme, activeDeck, session }) => {
  const navigate = useNavigate();

  const settings = useSelector(selectSettings);
  const autoFlipEnabled = settings.autoflipModeA ?? false;
  const autoFlipDelay = (settings.autoflipSpeed ?? 3) * 1000;
  const strokeAnimationSpeed = settings.characterAnimationSpeed ?? 1;

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

  function SessionHeader({ title }) {
    const gradientFrom = activeTheme?.gradients?.from || "from-indigo-500";
    const gradientTo = activeTheme?.gradients?.to || "to-purple-500";

    return (
      <header
        className={`mt-4 md:mt-8 ${activeTheme.background.secondary} rounded-2xl shadow-md border ${activeTheme.border.card} overflow-hidden relative`}
      >
        {/* Top gradient accent */}
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
        />

        <div className="relative flex items-center justify-center p-3 md:p-4 min-w-0">
          {/* Back Button: absolute left so it doesn't push the title off-center */}
          <button
            onClick={exitSession}
            aria-label="Exit session"
            className={`absolute left-3 md:left-4 group inline-flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:h-9 md:px-3 rounded-xl border transition-all ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas} active:scale-95`}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-sm md:text-xs transition-transform group-hover:-translate-x-0.5"
            />
            <span className="hidden md:inline ml-2 text-sm font-semibold">
              Back
            </span>
          </button>

          {/* Title block: dead center */}
          <div className="text-center min-w-0 px-12 md:px-20">
            <h1
              className={`text-base sm:text-lg md:text-xl font-extrabold tracking-tight truncate ${activeTheme.text.primary}`}
            >
              {title}
            </h1>
            {mode && (
              <p
                className={`hidden sm:block text-xs ${activeTheme.text.muted} truncate capitalize`}
              >
                {mode} Session
              </p>
            )}
          </div>
        </div>
      </header>
    );
  }

  if (sessionFinished) {
    return (
      <div
        className={`min-h-[100dvh] flex flex-col items-center justify-center ${activeTheme.background.app} text-center px-4`}
      >
        <SessionComplete
          isOpen={session.sessionFinished}
          learnedCount={session.sessionSummary?.learned || 0}
          onGoBack={session.exitStudy}
          onLearnMore={session.restartSession}
          activeTheme={activeTheme}
          isLoading={session.status === "loading"}
        />
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div
        className={`min-h-[100dvh] ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-0`}
      >
        <div className="max-w-screen-xl mx-auto space-y-4 md:space-y-6">
          <SessionHeader title={activeDeck.name} />
          <div className="h-72 md:h-96 flex items-center justify-center">
            <p className="text-lg md:text-xl animate-pulse">
              Loading next card…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  if (!cards.length) {
    return (
      <div
        className={`min-h-[100dvh] flex flex-col items-center justify-center px-4 ${activeTheme.background.app} text-center`}
      >
        <h3
          className={`text-xl md:text-2xl font-semibold mb-3 ${activeTheme.text.primary}`}
        >
          No cards available for this session.
        </h3>
        <button
          onClick={() => navigate("/decks")}
          className={`flex items-center py-2 ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
        >
          Return to decks
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] w-full px-4 md:px-0 select-none`}>
      <div className="max-w-screen-xl mx-auto space-y-4 md:space-y-6">
        <SessionHeader title={activeDeck.name} />

        <div className="w-full max-w-2xl mx-auto space-y-3 mb-6 md:mb-8">
          {/* Progress Bar */}
          <div className="w-full">
            <Bar
              activeTheme={activeTheme}
              current={progress.current}
              total={progress.total}
            />
          </div>
        </div>

        <div className="relative perspective-1000 w-full max-w-2xl mx-auto h-[52vh] min-h-[340px] md:h-96 mb-6 md:mb-8">
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
            autoFlipEnabled={autoFlipEnabled}
            autoFlipDelay={autoFlipDelay}
            strokeAnimationSpeed={strokeAnimationSpeed}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionMode;
