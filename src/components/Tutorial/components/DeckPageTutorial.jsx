import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { DECK_TOUR_STEPS } from "../constants/decks_steps";
import SpotlightTourModal from "../../General/ui/SpotlightTourModal";

export default function DeckPageTutorial({ activeTheme, refs, onClose }) {
  const tour = useTutorial(DECK_TOUR_STEPS.length, "decks", onClose);

  return (
    <SpotlightTourModal
      activeTheme={activeTheme}
      steps={DECK_TOUR_STEPS}
      refs={refs}
      tour={tour}
    />
  );
}
