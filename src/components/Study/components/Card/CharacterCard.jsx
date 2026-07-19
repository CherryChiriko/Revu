// src/components/Study/components/Card/CharacterCard.jsx
import React, { useRef, useCallback, useMemo } from "react";
import HanziCanvas from "./HanziCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import RevealButton from "../Controls/RevealButton";
import ContinueButton from "../Controls/ContinueButton";
import { useCharacterFlow } from "../../hooks/useCharacterFlow";

const CharacterCard = ({
  card,
  activeTheme,
  displayState,
  allowRating = false,
  onReveal,
  onRate,
  getRatingFromMistakes,
  onPassComplete,
}) => {
  const audioRef = useRef(null);

  const playAudio = useCallback(() => {
    if (audioRef.current && card?.audioUrl) {
      audioRef.current.play().catch(() => {});
    }
  }, [card?.audioUrl]);

  const {
    currentCharacter,
    strokeColor,
    revealed,
    handleReveal,
    handleContinue,
    renderWordProgress,
  } = useCharacterFlow({
    card,
    allowRating,
    onRate,
    onPassComplete,
    getRatingFromMistakes,
    onReveal,
    displayState,
    playAudio,
  });

  const showContinueButtons = useMemo(() => {
    if (revealed) return false;
    return displayState === "animation" || displayState === "outline";
  }, [displayState, revealed]);

  return (
    <div
      className={`relative w-full h-full rounded-xl ${activeTheme.background.secondary} p-2 md:p-8 flex flex-col justify-between items-center shadow-2xl transition-all duration-300 overflow-y-auto`}
    >
      {/* Header — compact on mobile, centered reading, absolute audio */}
      <div className="w-full flex items-center justify-center relative shrink-0 px-1 md:px-2">
        <p
          className={`text-base md:text-xl font-bold leading-tight ${activeTheme.text.primary} text-center`}
        >
          {card?.reading}
        </p>

        {card?.audioUrl && (
          <button
            onClick={playAudio}
            className="absolute right-0 p-1.5 md:p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Play audio"
          >
            <FontAwesomeIcon
              icon={faVolumeHigh}
              className="w-4 h-4 md:w-5 md:h-5"
            />
          </button>
        )}
      </div>

      {/* Canvas — flex-1 so it eats every spare pixel */}
      <div className="relative flex-1 flex justify-center items-center w-full min-h-0 my-1">
        <HanziCanvas
          character={currentCharacter}
          displayState={displayState}
          strokeColor={strokeColor}
          activeTheme={activeTheme}
          onQuizComplete={handleReveal}
          revealed={revealed}
        />
      </div>

      {/* Controls — compact, shrink-0 so they don't steal canvas space */}
      <div className="flex flex-col w-full justify-center items-center shrink-0 px-1 md:px-4 mt-1 md:mt-4 text-center space-y-1.5 md:space-y-3">
        {renderWordProgress()}

        <p
          className={`text-xs md:text-sm italic ${activeTheme.text.secondary}`}
        >
          {card?.back}
        </p>

        <div className="flex items-center justify-center pb-1">
          {!showContinueButtons && !revealed && (
            <RevealButton onReveal={handleReveal} activeTheme={activeTheme} />
          )}
          {showContinueButtons && (
            <ContinueButton
              onContinue={handleContinue}
              activeTheme={activeTheme}
            />
          )}
        </div>
      </div>

      <audio ref={audioRef} src={card?.audioUrl} />
    </div>
  );
};

export default CharacterCard;
