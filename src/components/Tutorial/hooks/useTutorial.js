import { useDispatch } from "react-redux";
import { completeOnboarding } from "../../../slices/userSlice";
import { useTour } from "./useTour";

export function useTutorial(totalSteps, onClose) {
  const dispatch = useDispatch();

  const tour = useTour(totalSteps, () => {
    dispatch(completeOnboarding());
    onClose?.();
  });

  return tour;
}
