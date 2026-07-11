import React from "react";
import { useTutorial } from "../hooks/useTutorial";
import { DASHBOARD_SPOTLIGHT_STEPS } from "../constants/dashboard_steps";
import SpotlightTourModal from "./SpotlightTourModal";

export default function DashboardTutorial({ activeTheme, refs, onClose }) {
  // Pull standard hook engine that dispatches completeOnboarding automatically
  const tour = useTutorial(DASHBOARD_SPOTLIGHT_STEPS.length, onClose);

  return (
    <SpotlightTourModal
      activeTheme={activeTheme}
      steps={DASHBOARD_SPOTLIGHT_STEPS}
      refs={refs}
      tour={tour}
    />
  );
}
