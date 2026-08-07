// src/components/Study/views/SessionMode.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CardRenderer from "../../Study/components/Card/CardRenderer";
import SessionComplete from "../components/Modals/SessionComplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../../General/ui/Bar";
import { selectSettings } from "../../../slices/settingsSlice";
import { selectUserProfile, completeTutorial } from "../../../slices/userSlice";
import LoadingSpinner from "../../General/ui/LoadingSpinner";
import StudyTutorial from "../../Tutorial/components/StudyTutorial";

const SessionMode = ({ mode, activeTheme, activeDeck, session }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);
  const autoFlipEnabled = settings.autoflipModeA ?? false;
  const autoFlipDelay = (settings.autoflipSpeed ?? 3) * 1000;
  const strokeAnimationSpeed = settings.characterAnimationSpeed ?? 1;

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;
    const hasSeenDashboardTour = profile.completed_tutorials?.decks === true;
    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const closeTutorial = () => {
    setShowTutorial(false);
    dispatch(completeTutorial("decks"));
  };

  const handleManualReplayTour = () => {
    setShowTutorial(true);
  };

  const {
    currentCard,
    currentPhase,
    progress,
    cards,
    sessionFinished,
    onReveal,
    handleRate,
    handlePassComplete,
    exitSession,
  } = session;

  const [previousCardId, setPreviousCardId] = React.useState(currentCard?.id);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
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

  function SessionHeader({ title, progress }) {
    const gradientFrom = activeTheme?.gradients?.from || "from-indigo-500";
    const gradientTo = activeTheme?.gradients?.to || "to-purple-500";

    return (
      <header
        className={`mt-1 md:mt-4 ${activeTheme.background.secondary} rounded-2xl shadow-md border ${activeTheme.border.card} overflow-hidden relative shrink-0`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
        />

        <div className="relative p-2 md:p-3 min-w-0">
          <button
            onClick={exitSession}
            aria-label="Exit session"
            className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 group inline-flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:h-9 md:px-3 rounded-xl border transition-all ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas} active:scale-95`}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-sm md:text-xs transition-transform group-hover:-translate-x-0.5"
            />
            <span className="hidden md:inline ml-2 text-sm font-semibold">
              Back
            </span>
          </button>

          <div className="flex flex-col items-center text-center min-w-0 px-12 md:px-20">
            <h1
              className={`text-base sm:text-lg md:text-xl font-extrabold tracking-tight truncate ${activeTheme.text.primary}`}
            >
              {title}
            </h1>
            {mode && (
              <p
                className={`text-xs ${activeTheme.text.muted} truncate capitalize`}
              >
                {mode} Session
              </p>
            )}
            {progress && (
              <div className="w-full max-w-[180px] md:max-w-[220px]">
                <Bar
                  activeTheme={activeTheme}
                  current={progress.current}
                  total={progress.total}
                  compact
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualReplayTour}
          title="Show me around"
          aria-label="Show me around"
          className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 group inline-flex items-center justify-center w-10 h-10 ${activeTheme.text.secondary}`}
        >
          <FontAwesomeIcon icon={faCircleQuestion} className="w-4 h-4" />
        </button>
      </header>
    );
  }

  if (sessionFinished) {
    return (
      <div
        className={`h-full flex-1 flex flex-col items-center justify-center ${activeTheme.background.app} text-center px-4`}
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
        className={`h-full flex-1 ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-0 md:px-4`}
      >
        <div className="max-w-screen-xl mx-auto h-full flex flex-col justify-center space-y-4 md:space-y-6">
          <SessionHeader title={activeDeck.name} />
          <LoadingSpinner label="Loading next card…" />
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  if (!cards.length) {
    return (
      <div
        className={`h-full flex-1 flex flex-col items-center justify-center px-0 md:px-4 ${activeTheme.background.app} text-center`}
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
    <div className="w-full h-full flex-1 min-h-0 px-2 md:px-4 select-none flex flex-col">
      <div className="max-w-screen-xl mx-auto w-full h-full flex flex-col gap-2 md:gap-4 pb-2 md:pb-4">
        <SessionHeader title={activeDeck.name} progress={progress} />

        {/* 
            Added p-3 padding so the drop shadow on the card isn't clipped by container edges 
        */}
        <div className="flex-1 min-h-0 flex items-center justify-center w-full p-3 md:p-6">
          <CardRenderer
            key={currentCard.id}
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
      {showTutorial && (
        <StudyTutorial activeTheme={activeTheme} onClose={closeTutorial} />
      )}
    </div>
  );
};

export default SessionMode;
