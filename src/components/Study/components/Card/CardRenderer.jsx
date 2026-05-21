import CharacterCard from "./CharacterCard";
import FlipCard from "./FlipCard";
import NotFound404 from "../../../404";

/* Maps mistake count to an SRS rating  */
const getRatingFromMistakes = (mistakes) => {
  // console.log("mistakes", mistakes);
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
        />
      );
    default:
      return <NotFound404 />;
  }
};

export default CardRenderer;
