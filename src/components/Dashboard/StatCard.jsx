// src/components/Dashboard/StatCard.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { selectGlobalStreakState } from "../../slices/streakSlice";
import { faSnowflake } from "@fortawesome/free-solid-svg-icons";

export const StatCard = ({ icon, label, value, activeTheme }) => {
  const streakState = useSelector(selectGlobalStreakState);

  const colorMap = {
    active: "text-amber-500",
    frozen: "text-blue-300",
    inactive: "opacity-75",
  };

  const isStreakCard = icon.iconName === "fire";
  const badgeIcon =
    isStreakCard && streakState === "frozen" ? faSnowflake : icon;

  const badgeColors = isStreakCard
    ? colorMap[streakState] || colorMap.inactive
    : activeTheme.text.primary;

  return (
    <div
      className={`shadow-md transition-all duration-200 hover:-translate-y-0.5 ${activeTheme.background.secondary} rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4`}
    >
      <div
        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${badgeColors} bg-opacity-20`}
      >
        <FontAwesomeIcon icon={badgeIcon} className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs md:text-sm opacity-75">{label}</div>
        <div className="text-xl md:text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
};
