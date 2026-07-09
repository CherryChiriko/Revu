import React, { useState, useEffect, useRef } from "react";
import RatingButtons from "../Controls/RatingButtons";
import RevealButton from "../Controls/RevealButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFastForward } from "@fortawesome/free-solid-svg-icons";

const CardStyles = () => (
  <style>{`
    .perspective { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .rotate-y-0 { transform: rotateY(0deg); }
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
  variant = "standard", // "standard" | "demo"
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const timerRef = useRef(null);

  const isDemo = variant === "demo";

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimer();
    setShowAnswer(false);
  }, [card?.id]);

  useEffect(() => {
    if (!autoFlipEnabled || displayState !== "animation" || showAnswer) return;
    clearTimer();
    timerRef.current = setTimeout(() => setShowAnswer(true), autoFlipDelay);
    return clearTimer;
  }, [autoFlipEnabled, displayState, showAnswer, autoFlipDelay, card?.id]);

  useEffect(() => clearTimer, []);

  const handleReveal = () => {
    clearTimer();
    setShowAnswer(true);
  };

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
            className={`absolute inset-0 backface-hidden rounded-xl ${
              activeTheme.background.secondary
            } flex flex-col justify-center items-center ${
              isDemo ? "p-2 border" : "p-8 shadow-2xl"
            } ${activeTheme.border?.secondary || ""}`}
          >
            <span
              className={`font-extrabold ${activeTheme.text.primary} text-center max-w-full ${
                isDemo ? "text-3xl p-1" : "text-6xl p-4"
              }`}
            >
              {card?.front}
            </span>

            {!showAnswer && displayState === "animation" && (
              <div
                className={`absolute w-full flex justify-center px-4 ${isDemo ? "bottom-2" : "bottom-8"}`}
              >
                <button
                  onClick={handleReveal}
                  className={`rounded-full font-semibold ${activeTheme.button.primary} ${
                    activeTheme.text.activeButton
                  } transition-all duration-300 shadow-md ${
                    isDemo ? "px-4 py-1 text-xs" : "px-6 py-3"
                  }`}
                >
                  Show
                </button>
              </div>
            )}

            {/* Quiz mode: reveal button */}
            {!showAnswer && displayState === "quiz" && (
              <div
                className={`absolute w-full flex justify-center px-4 ${isDemo ? "bottom-2" : "bottom-8"}`}
              >
                <RevealButton
                  onReveal={handleReveal}
                  activeTheme={activeTheme}
                  variant={variant} // <--- Pass the variant down here!
                />
              </div>
            )}
          </div>

          {/* BACK */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl ${
              activeTheme.background.secondary
            } flex flex-col justify-between items-center ${
              isDemo ? "p-3 border" : "p-8 shadow-2xl"
            } ${activeTheme.border?.secondary || ""}`}
          >
            {/* Term/Definition Slot */}
            <div className="flex-1 flex flex-col justify-center items-center w-full">
              {showAnswer && (
                <p
                  className={`font-semibold ${activeTheme.text.primary} text-center ${isDemo ? "text-xl" : "text-4xl mb-4"}`}
                >
                  {card?.back}
                </p>
              )}
            </div>

            {/* Button Area Slot */}
            {showAnswer && (
              <div className="w-full flex justify-center">
                {allowRating ? (
                  <RatingButtons onRate={handleRate} variant={variant} />
                ) : (
                  <button
                    onClick={handleNext}
                    className={`rounded-full font-semibold ${activeTheme.button.secondary} ${
                      activeTheme.text.primary
                    } transition-all duration-300 shadow-md ${
                      isDemo ? "px-4 py-1 text-xs mb-1" : "px-6 py-3"
                    }`}
                  >
                    Next
                    <FontAwesomeIcon
                      icon={faFastForward}
                      className="w-3 h-3 ml-1.5"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipCard;
