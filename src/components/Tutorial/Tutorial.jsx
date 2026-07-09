import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faEye,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import { ONBOARDING_STEPS } from "./constants/steps";
import { useTutorial } from "./hooks/useTutorial";

import FlipCard from "../Study/components/Card/FlipCard";
import HanziCanvas from "../Study/components/Card/HanziCanvas"; // Direct production import

/* ---------------------------------------------------------------------- */
/* Step 1: Flip Card Demo Component                                       */
/* ---------------------------------------------------------------------- */
function OnboardingFlipCardDemo({ activeTheme }) {
  const mockCard = {
    id: "demo-card",
    front: "Bonjour",
    back: "Hello",
  };

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full h-40 relative">
        <FlipCard
          card={mockCard}
          activeTheme={activeTheme}
          displayState="quiz"
          allowRating={true}
          onRate={() => {}}
          variant="demo"
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Step 2: Hanzi Canvas Demo Component                                    */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/* Step 2: Hanzi Canvas Demo Component                                    */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/* Step 2: Hanzi Canvas Demo Component                                    */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/* Step 2: Hanzi Canvas Demo Component                                    */
/* ---------------------------------------------------------------------- */
function OnboardingHanziDemo({ activeTheme }) {
  const [displayState, setDisplayState] = useState("animation"); // "animation" | "outline" | "quiz"
  const [canvasKey, setCanvasKey] = useState(0);
  const [complete, setComplete] = useState(false);

  const handleToggleState = (state) => {
    setDisplayState(state);
    setComplete(false);
    setCanvasKey((k) => k + 1);
  };

  // Automatically restart the canvas loop 2 seconds after the user finishes drawing
  useEffect(() => {
    if (!complete) return;

    const timeoutId = setTimeout(() => {
      setComplete(false);
      setCanvasKey((k) => k + 1); // Remounts the canvas to reset the quiz seamlessly
    }, 2000); // 2000ms = 2 seconds display time

    return () => clearTimeout(timeoutId);
  }, [complete]);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-1">
      {/* State Switch Tab Layout */}
      <div className="flex gap-1.5 h-7 items-center mb-1 z-10">
        <button
          type="button"
          onClick={() => handleToggleState("animation")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "animation"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          1. Animation
        </button>
        <button
          type="button"
          onClick={() => handleToggleState("outline")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "outline"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          2. Outline
        </button>
        <button
          type="button"
          onClick={() => handleToggleState("quiz")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "quiz"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          3. Draw
        </button>
      </div>

      {/* Centered canvas bounding container */}
      <div className="w-full h-48 flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: "250px",
            height: "250px",
            transform: "scale(0.72)",
            transformOrigin: "center center",
          }}
        >
          <HanziCanvas
            key={canvasKey}
            character="人"
            displayState={displayState}
            activeTheme={activeTheme}
            strokeColor={"#02B31C"}
            revealed={false}
            strokeAnimationSpeed={1.2}
            onQuizComplete={() => setComplete(true)}
          />
        </div>
      </div>

      {/* Context Banner */}
      <div className="h-5 flex items-center justify-center mt-1">
        <span className={`text-[11px] ${activeTheme.text.secondary}`}>
          {displayState === "animation" && "Watching stroke animation order..."}
          {displayState === "outline" &&
            "Trace the character over the outline."}
          {displayState === "quiz" &&
            !complete &&
            "Draw the character on the canvas."}
          {displayState === "quiz" &&
            complete &&
            "🎉 Perfect writing score registered!"}
        </span>
      </div>
    </div>
  );
}
/* ---------------------------------------------------------------------- */
/* OnboardingModal Main Component Implementation                          */
/* ---------------------------------------------------------------------- */
export default function OnboardingModal({ activeTheme, onClose }) {
  const { step, finished, isLastStep, handleNext, handleBack, handleFinish } =
    useTutorial(ONBOARDING_STEPS.length, onClose);

  const [showDemo, setShowDemo] = useState(false);

  const current = ONBOARDING_STEPS[step];
  const stepIcon = current?.icon;
  const isImageIcon = typeof stepIcon === "string";

  const hasDemo = step === 1 || step === 2;

  useEffect(() => {
    setShowDemo(false);
  }, [step]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl ${activeTheme.background.card} shadow-xl overflow-hidden`}
      >
        {/* Header Section Container */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm ${activeTheme.text.secondary}`}>
              {finished
                ? "All set"
                : `Step ${step + 1} of ${ONBOARDING_STEPS.length}`}
            </span>
            {!finished && (
              <button
                type="button"
                onClick={handleFinish}
                className={`text-sm ${activeTheme.text.muted} hover:${activeTheme.text.secondary} transition-colors px-2 py-1 rounded-md`}
              >
                Skip
              </button>
            )}
          </div>
          <div
            className={`h-1 w-full rounded-full ${activeTheme.background.track} overflow-hidden mb-4`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} transition-all duration-300 ease-out`}
              style={{
                width: finished
                  ? "100%"
                  : `${((step + 1) / ONBOARDING_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="px-7 pb-4 h-[340px] flex flex-col justify-between">
          {!finished ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header Icon Context Frame */}
              <div className="flex items-center justify-between h-14 min-h-[56px]">
                <div className="flex items-center gap-3">
                  {stepIcon && (
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15 overflow-hidden`}
                    >
                      {isImageIcon ? (
                        <img
                          src={stepIcon}
                          alt="Revu Logo"
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={stepIcon}
                          className={`w-5 h-5 ${activeTheme.text.accent3}`}
                        />
                      )}
                    </div>
                  )}
                  <h2
                    id="onboarding-title"
                    className={`text-base font-medium ${activeTheme.text.primary}`}
                  >
                    {current.title}
                  </h2>
                </div>

                {/* Demo Toggle Button */}
                {hasDemo && (
                  <button
                    type="button"
                    onClick={() => setShowDemo(!showDemo)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${activeTheme.border.secondary} ${activeTheme.background.secondary} ${activeTheme.text.accent3} hover:opacity-90 transition-opacity`}
                  >
                    <FontAwesomeIcon
                      icon={showDemo ? faFileText : faEye}
                      className="w-3 h-3"
                    />
                    {showDemo ? "Description" : "Demo"}
                  </button>
                )}
              </div>

              {/* Main Container Viewport Box */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {showDemo ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {step === 1 && (
                      <OnboardingFlipCardDemo activeTheme={activeTheme} />
                    )}
                    {step === 2 && (
                      <OnboardingHanziDemo activeTheme={activeTheme} />
                    )}
                  </div>
                ) : (
                  <p
                    className={`text-[14px] leading-relaxed whitespace-pre-line w-full self-start pt-2 ${activeTheme.text.secondary}`}
                  >
                    {current.body}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 h-full">
              <div
                className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15`}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`w-7 h-7 ${activeTheme.text.accent3}`}
                />
              </div>
              <p className={`text-[15px] ${activeTheme.text.secondary}`}>
                Tutorial closed. Time to build your first deck.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!finished && (
          <div
            className={`flex items-center justify-between px-6 py-4 border-t h-16 ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Previous step"
              className={`p-2 rounded-md transition-colors ${
                step === 0
                  ? "invisible"
                  : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5">
              {ONBOARDING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === step
                      ? activeTheme.background.accent3
                      : activeTheme.background.track
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              {isLastStep ? "Get started" : "Next"}
              {!isLastStep && (
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {finished && (
          <div
            className={`flex justify-end px-6 py-4 border-t h-16 ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={handleFinish}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
