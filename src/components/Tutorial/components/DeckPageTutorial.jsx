import { useTour } from "../hooks/useTour";
import { DECK_TOUR_STEPS } from "../constants/decks_steps";
import TourModal from "../../General/ui/TourModal";

export default function DeckPageTutorial({ activeTheme, onClose }) {
  const tour = useTour(DECK_TOUR_STEPS.length, onClose);

  return (
    <TourModal
      activeTheme={activeTheme}
      steps={DECK_TOUR_STEPS}
      tour={tour}
      onClose={onClose}
    />
  );
}
