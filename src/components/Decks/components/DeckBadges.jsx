import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faSnowflake } from "@fortawesome/free-solid-svg-icons";

export function DeckBadges({ streak, streakState, activeTheme }) {
  const colorMap = {
    active: "text-amber-500 bg-amber-500/10",
    inactive: "text-gray-400 bg-gray-400/10",
    frozen: "text-sky-400 bg-sky-400/10",
  };
  const badgeColor = colorMap[streakState] || colorMap.inactive;
  return (
    <>
      {streak > 0 && (
        <div
          className={`flex items-center gap-1 ${badgeColor} text-xs font-semibold px-2 py-1 rounded-full`}
        >
          <FontAwesomeIcon
            icon={streakState === "frozen" ? faSnowflake : faFire}
          />{" "}
          {streak}
        </div>
      )}
    </>
  );
}
