import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { DECK_TOUR_STEPS } from "../constants/decks_steps";
import SpotlightTourModal from "../../General/ui/SpotlightTourModal";

export default function DeckPageTutorial({ activeTheme, refs, onClose }) {
  // Filter steps dynamically where refs[step.target] exists and has a rendered DOM element
  const activeSteps = DECK_TOUR_STEPS.filter((step) => {
    const targetRef = refs[step.target];
    return targetRef && targetRef.current !== null;
  });

  const tour = useTutorial(activeSteps.length, "decks", onClose);

  return (
    <SpotlightTourModal
      activeTheme={activeTheme}
      steps={activeSteps}
      refs={refs}
      tour={tour}
    />
  );
}
