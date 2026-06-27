import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { selectGlobalStreakState } from "../../slices/streakSlice";
import { faSnowflake } from "@fortawesome/free-solid-svg-icons";

export const StatCard = ({ icon, label, value, activeTheme }) => {
  const streakState = useSelector(selectGlobalStreakState);

  // 1. Map streak states directly to their respective Tailwind text and background colors
  const colorMap = {
    active: "text-amber-500",
    frozen: "text-blue-300",
    inactive: "opacity-75", // Fallback text color style for inactive streaks
  };

  // Determine if this specific card represents the streak
  const isStreakCard = icon.iconName === "fire";
  const badgeIcon =
    isStreakCard && streakState === "frozen" ? faSnowflake : icon;

  // Get the matching style if it's a streak card, otherwise default to a subtle gray background
  const badgeColors = isStreakCard
    ? colorMap[streakState] || colorMap.inactive
    : "null";

  return (
    <div
      className={`${activeTheme.background.secondary} rounded-2xl p-4 shadow-sm flex items-center gap-4`}
    >
      {/* 2. Dynamically inject the computed classes into the icon container */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${badgeColors} bg-opacity-20`}
      >
        <FontAwesomeIcon icon={badgeIcon} className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm opacity-75">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
};
