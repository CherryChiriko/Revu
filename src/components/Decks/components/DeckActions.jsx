import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faRedo } from "@fortawesome/free-solid-svg-icons";

export function DeckActions({
  isMastered,
  showLearn,
  showReview,
  handleAction,
  activeTheme,
  due = 0,
  newCount = 0,
  large = false,
}) {
  if (isMastered) {
    return (
      <button
        onClick={(e) => handleAction(e, "reset")}
        className={`flex-1 py-2 rounded-lg font-semibold border ${activeTheme.text.primary}`}
      >
        Reset Progress
      </button>
    );
  }

  const largeClasses =
    "flex-1 py-2 rounded-lg font-semibold flex items-center justify-center";

  // Compact: pill badge with icon + count
  const compactClasses =
    "h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold";

  return (
    <div className={large ? "mt-3 flex space-x-3" : "flex space-x-2"}>
      {showLearn && (
        <button
          onClick={(e) => handleAction(e, "learn")}
          className={`${activeTheme.button.primary} ${activeTheme.text.activeButton} ${large ? largeClasses : compactClasses}`}
        >
          <FontAwesomeIcon
            icon={faGraduationCap}
            className={large ? "mr-2" : "w-3 h-3"}
          />
          Learn
        </button>
      )}
      {showReview && (
        <button
          onClick={(e) => handleAction(e, "review")}
          className={`${activeTheme.button.accent} ${activeTheme.text.activeButton} ${large ? largeClasses : compactClasses}`}
        >
          <FontAwesomeIcon
            icon={faRedo}
            className={large ? "mr-2" : "w-3 h-3"}
          />
          {`Review (${due})`}
        </button>
      )}
    </div>
  );
}
