import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faStar, faSnowflake } from "@fortawesome/free-solid-svg-icons";

export function DeckBadges({ isMastered, streak, streakState, activeTheme }) {
  const colorMap = {
    active: "text-amber-500 bg-amber-500/10",
    inactive: "text-gray-400 bg-gray-400/10",
    frozen: "text-sky-400 bg-sky-400/10",
  };
  const badgeColor = colorMap[streakState] || colorMap.inactive;
  console.log(streakState, colorMap[streakState]);

  return (
    <>
      {isMastered && (
        <div
          className={`${activeTheme.text.secondary} flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full`}
        >
          <FontAwesomeIcon icon={faStar} /> Mastered
        </div>
      )}

      {!isMastered && streak > 0 && (
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
