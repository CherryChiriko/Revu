import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { STUDY_TOUR_STEPS } from "../constants/study_steps";
import TourModal from "../../General/ui/TourModal";
import { TutorialFlipCardDemo } from "./TutorialFlipDemo";
import { TutorialCharDemo } from "./TutorialCharDemo";

export default function StudyTutorial({ activeTheme, onClose }) {
  const tour = useTutorial(STUDY_TOUR_STEPS.length, "study", onClose);
  const renderDemo = (step) => {
    if (step === 1) return <TutorialFlipCardDemo activeTheme={activeTheme} />;
    if (step === 2) return <TutorialCharDemo activeTheme={activeTheme} />;
    return null;
  };

  return (
    <TourModal
      activeTheme={activeTheme}
      steps={STUDY_TOUR_STEPS}
      tour={tour}
      onClose={onClose}
      renderDemo={renderDemo}
    />
  );
}
