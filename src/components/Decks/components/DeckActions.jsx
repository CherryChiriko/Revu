import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faRedo } from "@fortawesome/free-solid-svg-icons";

export function DeckActions({
  isMastered,
  showLearn,
  showReview,
  handleAction,
  activeTheme,
  due = 0,
  large = false, // compact = false, full = true
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

  const sizeClasses = large
    ? "flex-1 py-2 rounded-lg font-semibold flex items-center justify-center"
    : "w-24 h-6 rounded-full flex items-center justify-center";

  return (
    <div className={large ? "mt-3 flex space-x-3" : "flex space-x-3"}>
      {showLearn && (
        <button
          onClick={(e) => handleAction(e, "learn")}
          className={`${activeTheme.button.primary} ${activeTheme.text.activeButton} ${sizeClasses}`}
        >
          {large && <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />}
          {!large && (
            <FontAwesomeIcon icon={faGraduationCap} className="h-3 w-3" />
          )}
          {large && "Learn"}
        </button>
      )}

      {showReview && (
        <button
          onClick={(e) => handleAction(e, "review")}
          className={`${activeTheme.button.accent} ${activeTheme.text.activeButton} ${sizeClasses}`}
        >
          {large && (
            <>
              <FontAwesomeIcon icon={faRedo} className="mr-2" />
              Review ({due})
            </>
          )}
          {!large && <FontAwesomeIcon icon={faRedo} className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}
