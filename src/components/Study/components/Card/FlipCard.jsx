import React, { useEffect, useState } from "react";
import RatingButtons from "../Controls/RatingButtons";
import RevealButton from "../Controls/RevealButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFastForward } from "@fortawesome/free-solid-svg-icons";

const CardStyles = () => (
  <style>{`
    .perspective {
      perspective: 1000px;
    }
    .preserve-3d {
      transform-style: preserve-3d;
    }
    .backface-hidden {
      backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
    .rotate-y-0 {
      transform: rotateY(0deg);
    }
    .slide-out-right {
      transform: translateX(120%) rotateZ(10deg);
      opacity: 0;
      transition: transform 0.5s ease, opacity 0.5s ease;
    }
  `}</style>
);

const FlipCard = ({
  card,
  activeTheme,
  displayState,
  onRate,
  allowRating = false,
  onPassComplete,
  autoFlipEnabled = false,
  autoFlipDelay = 3000,
  autoAdvanceDelay = 3000,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Auto-flip front in animation mode
  useEffect(() => {
    if (!autoFlipEnabled) return;
    let frontTimer;
    if (displayState === "animation" && !showAnswer) {
      frontTimer = setTimeout(() => setShowAnswer(true), autoFlipDelay);
    }
    return () => clearTimeout(frontTimer);
  }, [displayState, showAnswer, autoFlipDelay, autoFlipEnabled]);

  // Auto-advance after back
  useEffect(() => {
    if (!autoFlipEnabled) return;
    let backTimer;
    if ((displayState === "animation" || !allowRating) && showAnswer) {
      backTimer = setTimeout(() => handleNext(), autoAdvanceDelay);
    }
    return () => clearTimeout(backTimer);
  }, [
    displayState,
    showAnswer,
    allowRating,
    onPassComplete,
    autoAdvanceDelay,
    autoFlipEnabled,
  ]);

  const handleReveal = () => setShowAnswer(true);
  const handleNext = () => {
    setShowAnswer(false);
    onPassComplete?.();
  };
  const handleRate = (rating) => {
    setShowAnswer(false);
    onRate?.(rating);
  };

  return (
    <>
      <CardStyles />
      <div className="relative w-full h-full perspective">
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-700 ${
            showAnswer ? "rotate-y-180" : "rotate-y-0"
          }`}
        >
          {/* FRONT */}
          <div
            className={`absolute inset-0 backface-hidden rounded-xl ${activeTheme.background.secondary} p-8 flex flex-col justify-center items-center shadow-2xl`}
          >
            <span
              className={`text-6xl font-extrabold ${activeTheme.text.primary} text-center p-4 max-w-full`}
            >
              {card?.front}
            </span>

            {!showAnswer && displayState === "animation" && (
              <div className="absolute bottom-8 w-full flex justify-center space-x-4 px-8">
                <button
                  onClick={handleReveal}
                  className={`px-6 py-3 rounded-full font-semibold ${activeTheme.button.primary} ${activeTheme.text.primary} transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  Show
                </button>
              </div>
            )}
            {!showAnswer && displayState === "quiz" && (
              <div className="absolute bottom-8 w-full flex justify-center space-x-4 px-8">
                <RevealButton
                  onReveal={handleReveal}
                  activeTheme={activeTheme}
                />
              </div>
            )}
          </div>

          {/* BACK */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl ${activeTheme.background.secondary} p-8 flex flex-col justify-between items-center shadow-2xl`}
          >
            {showAnswer && (
              <div className="flex flex-col justify-center items-center h-full pt-8">
                <p
                  className={`text-4xl font-semibold ${activeTheme.text.primary} text-center mb-4`}
                >
                  {card?.back}
                </p>
              </div>
            )}
            {showAnswer && allowRating && <RatingButtons onRate={handleRate} />}
            {showAnswer && !allowRating && (
              <button
                onClick={handleNext}
                className={`px-6 py-3 rounded-full font-semibold ${activeTheme.button.secondary} ${activeTheme.text.primary} transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                Next
                <FontAwesomeIcon
                  icon={faFastForward}
                  className="w-4 h-4 ml-2"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipCard;
