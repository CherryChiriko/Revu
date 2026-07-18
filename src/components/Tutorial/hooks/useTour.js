import { useState, useEffect } from "react";

export function useTour(totalSteps, onClose) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const isLastStep = step === totalSteps - 1;

  const handleFinish = () => {
    onClose?.();
  };

  const handleNext = () => {
    if (finished) return;
    if (isLastStep) {
      setFinished(true);
    } else {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    if (finished) return;
    setStep((s) => Math.max(s - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleFinish();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, finished, isLastStep]);

  return {
    step,
    finished,
    isLastStep,
    handleNext,
    handleBack,
    handleFinish,
  };
}
