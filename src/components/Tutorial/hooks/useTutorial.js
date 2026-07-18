import { useDispatch } from "react-redux";
import { completeTutorial } from "../../../slices/userSlice";
import { useTour } from "./useTour";

/**
 * Wraps useTour with persistence: marks `tutorialKey` as complete in
 * `completed_tutorials` whenever the tour is finished or skipped.
 */
export function useTutorial(totalSteps, tutorialKey, onClose) {
  const dispatch = useDispatch();

  return useTour(totalSteps, () => {
    if (tutorialKey) dispatch(completeTutorial(tutorialKey));
    onClose?.();
  });
}
