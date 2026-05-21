import React, { useRef, useCallback } from "react";
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
      audioRef.current.play().catch(() => {
        // Silently ignore autoplay errors
      });
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

  const showContinueButtons =
    displayState === "animation" || displayState === "outline";

  return (
    <div
      className={`relative w-full rounded-xl ${activeTheme.background.secondary} p-8 flex flex-col justify-start items-center shadow-2xl transition-all duration-300`}
    >
      {/* Header with reading and audio button */}
      <div className="w-full flex justify-between items-center mt-2 px-2 text-center gap-4">
        <div className="w-8 flex-shrink-0" />

        <p
          className={`text-xl font-bold leading-tight ${activeTheme.text.primary} flex-1`}
        >
          {card?.reading}
        </p>

        {card?.audioUrl ? (
          <button
            onClick={playAudio}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
            aria-label="Play audio"
          >
            <FontAwesomeIcon icon={faVolumeHigh} className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}
      </div>

      {/* Canvas */}
      <div className="relative flex justify-center items-center w-full mb-2">
        <HanziCanvas
          character={currentCharacter}
          displayState={displayState}
          strokeColor={strokeColor}
          activeTheme={activeTheme}
          onQuizComplete={handleReveal}
          revealed={revealed}
        />
      </div>

      {/* Controls and info */}
      <div className="flex flex-col w-full justify-center items-center px-4 mt-4 text-center space-y-3">
        {/* Character progress indicator */}
        {renderWordProgress()}

        {/* Translation */}
        <p className={`text-sm italic ${activeTheme.text.secondary}`}>
          {card?.back}
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-center">
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

      {/* Hidden audio element */}
      <audio ref={audioRef} src={card?.audioUrl} />
    </div>
  );
};

export default CharacterCard;
