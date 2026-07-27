// src/components/Study/components/Card/FlipCard.jsx
import React, { useState, useEffect, useRef } from "react";
import RatingButtons from "../Controls/RatingButtons";
import RevealButton from "../Controls/RevealButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFastForward } from "@fortawesome/free-solid-svg-icons";

const FlipCard = ({
  card,
  activeTheme,
  displayState,
  onRate,
  allowRating = false,
  onPassComplete,
  autoFlipEnabled = false,
  autoFlipDelay = 3000,
  variant = "standard",
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

  // Shared footer slot — inner container is w-full so children can choose their own width
  const FooterSlot = ({ children }) => (
    <div
      className={`absolute left-0 right-0 px-3 pointer-events-none ${
        isDemo ? "bottom-3" : "bottom-6"
      }`}
    >
      <div className="pointer-events-auto w-full max-w-lg mx-auto flex justify-center">
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: showAnswer ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ─── FRONT ─── */}
        <div
          className={`absolute inset-0 rounded-2xl ${activeTheme.background.secondary} ${
            activeTheme.border?.secondary || "border-gray-200"
          } flex flex-col items-center p-3 shadow-md ${
            isDemo ? "pb-16" : "md:p-6 pb-20 md:pb-24"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="shrink-0">
            <span
              className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold ${activeTheme.text.muted}`}
            >
              Question
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center w-full min-h-0 px-1 overflow-hidden">
            <p
              className={`font-bold ${activeTheme.text.primary} text-center break-words leading-snug ${
                isDemo ? "text-xl" : "text-2xl sm:text-3xl md:text-4xl"
              }`}
            >
              {card?.front}
            </p>
          </div>

          {!showAnswer && displayState === "animation" && (
            <FooterSlot>
              <button
                onClick={handleReveal}
                className={`rounded-full font-semibold ${activeTheme.button.primary} ${activeTheme.text.activeButton} transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 px-4 py-2 text-sm md:px-6 md:py-3 md:text-base`}
              >
                Show
              </button>
            </FooterSlot>
          )}

          {!showAnswer && displayState === "quiz" && (
            <FooterSlot>
              <RevealButton
                onReveal={handleReveal}
                activeTheme={activeTheme}
                variant={variant}
              />
            </FooterSlot>
          )}
        </div>

        {/* ─── BACK ─── */}
        <div
          className={`absolute inset-0 rounded-2xl ${activeTheme.background.secondary} ${
            activeTheme.border?.secondary || "border-gray-200"
          } flex flex-col items-center p-3 shadow-md ${
            isDemo ? "pb-16" : "md:p-6 pb-20 md:pb-24"
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="shrink-0">
            <span
              className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold ${activeTheme.text.muted}`}
            >
              Answer
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center w-full min-h-0 px-1 overflow-y-auto">
            {showAnswer && (
              <p
                className={`font-semibold ${activeTheme.text.primary} text-center break-words leading-snug ${
                  isDemo
                    ? "text-lg sm:text-xl"
                    : "text-2xl sm:text-3xl md:text-4xl"
                }`}
              >
                {card?.back}
              </p>
            )}
          </div>

          {showAnswer && (
            <FooterSlot>
              {allowRating ? (
                <RatingButtons onRate={handleRate} variant={variant} />
              ) : (
                <button
                  onClick={handleNext}
                  className={`rounded-full font-semibold ${activeTheme.button.secondary} ${activeTheme.text.secondary} transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 px-4 py-2 text-sm md:px-6 md:py-3 md:text-base`}
                >
                  Next
                  <FontAwesomeIcon
                    icon={faFastForward}
                    className="w-4 h-4 ml-2"
                  />
                </button>
              )}
            </FooterSlot>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
