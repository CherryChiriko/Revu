import { useTutorial } from "../hooks/useTutorial";
import { DECK_DETAILS_TOUR_STEPS } from "../constants/details_steps";
import SpotlightTourModal from "../../General/ui/SpotlightTourModal";

export default function DeckDetailsTutorial({ activeTheme, refs, onClose }) {
  const tour = useTutorial(DECK_DETAILS_TOUR_STEPS.length, "decks", onClose);
  console.log("executing");
  return (
    <SpotlightTourModal
      activeTheme={activeTheme}
      steps={DECK_DETAILS_TOUR_STEPS}
      refs={refs}
      tour={tour}
    />
  );
}
