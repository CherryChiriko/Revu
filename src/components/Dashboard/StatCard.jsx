import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { selectGlobalStreakState } from "../../slices/streakSlice";

export const StatCard = ({ icon, label, value, activeTheme }) => {
  const streakState = useSelector(selectGlobalStreakState);
  const isStreakActive = streakState === "active";

  return (
    <div
      className={`${activeTheme.background.secondary} rounded-2xl p-4 shadow-sm flex items-center gap-4`}
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-20  ${
          isStreakActive && icon.iconName === "fire" ? " text-amber-500" : ""
        }`}
      >
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm opacity-75">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
};
