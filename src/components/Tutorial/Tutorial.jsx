import { useTutorial } from "./hooks/useTutorial";
import { ONBOARDING_STEPS } from "./constants/steps";
import TourModal from "../General/ui/TourModal";
import { TutorialCharDemo } from "./TutorialCharDemo";
import { TutorialFlipCardDemo } from "./TutorialFlipDemo";

export default function Tutorial({ activeTheme, onClose }) {
  const tour = useTutorial(ONBOARDING_STEPS.length, onClose);

  const renderDemo = (step) => {
    if (step === 1) return <TutorialFlipCardDemo activeTheme={activeTheme} />;
    if (step === 2) return <TutorialCharDemo activeTheme={activeTheme} />;
    return null;
  };

  return (
    <TourModal
      activeTheme={activeTheme}
      steps={ONBOARDING_STEPS}
      tour={tour}
      onClose={onClose}
      renderDemo={renderDemo}
      finishedContent={{
        body: "Tutorial closed. Time to build your first deck.",
      }}
    />
  );
}
