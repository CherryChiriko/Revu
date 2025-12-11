export const ProgressBar = ({ deck, activeTheme, isMastered }) => {
  const { mastered = 0, learning = 0, cards_count = 0 } = deck;
  const newCards = Math.max(cards_count - mastered - learning, 0);

  const masteredPct = cards_count ? (mastered / cards_count) * 100 : 0;
  const learningPct = cards_count ? (learning / cards_count) * 100 : 0;
  const newPct = cards_count ? (newCards / cards_count) * 100 : 0;

  // Base classes for the container and segments
  const baseBar = `w-full h-2.5 rounded-full overflow-hidden flex`;
  const segmentBase = `h-2.5 transition-all`;

  // Track background
  const trackClass = activeTheme.isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div>
      <div className={`${baseBar} ${trackClass}`}>
        {masteredPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent1}`}
            style={{ width: `${masteredPct}%` }}
            title={`Mastered: ${mastered}`}
          />
        )}
        {learningPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent2}`}
            style={{ width: `${learningPct}%` }}
            title={`Learning: ${learning}`}
          />
        )}
        {newPct > 0 && (
          <div
            className={`${segmentBase} ${trackClass}`}
            style={{ width: `${newPct}%` }}
            title={`New: ${newCards}`}
          />
        )}
      </div>

      {!isMastered && (
        <div className="flex justify-between text-xs mt-2">
          <span className={activeTheme.text.accent1}>{mastered} mastered</span>
          <span className={activeTheme.text.accent2}>{learning} learning</span>
          <span className={activeTheme.text.muted}>{newCards} new</span>
        </div>
      )}
    </div>
  );
};
