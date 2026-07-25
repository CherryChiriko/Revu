import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { DECK_DETAILS_TOUR_STEPS } from "../constants/details_steps";
import SpotlightTourModal from "../../General/ui/SpotlightTourModal";

export default function DeckDetailsTutorial({ activeTheme, refs, onClose }) {
  const tour = useTutorial(DECK_DETAILS_TOUR_STEPS.length, "decks", onClose);

  return (
    <SpotlightTourModal
      activeTheme={activeTheme}
      steps={DECK_DETAILS_TOUR_STEPS}
      refs={refs}
      tour={tour}
    />
  );
}
