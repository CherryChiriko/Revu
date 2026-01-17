import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faStar } from "@fortawesome/free-solid-svg-icons";

export function DeckBadges({
  isMastered,
  streak,
  isStreakActive,
  activeTheme,
}) {
  const activeColor = "text-amber-500 bg-amber-500/10"; // active streak color
  const inactiveColor = "text-gray-400 bg-gray-400/10"; // inactive streak color
  console.log("streak state", streak, isStreakActive);

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
          className={`flex items-center gap-1 ${
            isStreakActive ? activeColor : inactiveColor
          } text-xs font-semibold px-2 py-1 rounded-full`}
        >
          <FontAwesomeIcon icon={faFire} /> {streak}
        </div>
      )}
    </>
  );
}
