import React from "react";
import CharacterCard from "./CharacterCard";
import FlipCard from "./FlipCard";
import NotFound404 from "../../../404";

const getRatingFromMistakes = (mistakes) => {
  if (mistakes === 2) return "hard";
  if (mistakes === 1) return "good";
  if (mistakes === 0) return "easy";
  return "again";
};

const CardRenderer = ({
  card,
  study_mode = "A",
  displayState,
  allowRating = false,
  activeTheme,
  onReveal,
  onRate,
  onPassComplete,
  // Mode A autoflip settings
  autoFlipEnabled = false,
  autoFlipDelay = 3000,
  // Mode C animation speed
  strokeAnimationSpeed = 1,
}) => {
  switch (study_mode) {
    case "A":
      return (
        <FlipCard
          card={card}
          activeTheme={activeTheme}
          displayState={displayState}
          onRate={onRate}
          allowRating={allowRating}
          onPassComplete={onPassComplete}
          autoFlipEnabled={autoFlipEnabled}
          autoFlipDelay={autoFlipDelay}
        />
      );
    case "C":
      return (
        <CharacterCard
          card={card}
          activeTheme={activeTheme}
          displayState={displayState}
          onReveal={onReveal}
          onRate={onRate}
          allowRating={allowRating}
          getRatingFromMistakes={getRatingFromMistakes}
          onPassComplete={onPassComplete}
          strokeAnimationSpeed={strokeAnimationSpeed}
        />
      );
    default:
      return <NotFound404 />;
  }
};

export default CardRenderer;
