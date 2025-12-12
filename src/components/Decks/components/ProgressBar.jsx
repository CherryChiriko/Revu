export const ProgressBar = ({ counts, activeTheme, isMastered }) => {
  const cards_count = Object.values(counts).reduce((total, value) => {
    if (typeof value === "number") {
      //exclude id
      return total + value;
    }
    return total;
  }, 0);

  const masteredPct = cards_count ? (counts.mastered / cards_count) * 100 : 0;
  const suspendedPct = cards_count ? (counts.suspended / cards_count) * 100 : 0;
  const learningPct = cards_count ? (counts.learning / cards_count) * 100 : 0;
  const duePct = cards_count ? (counts.due / cards_count) * 100 : 0;
  const newPct = cards_count ? (counts.new / cards_count) * 100 : 0;

  // Base classes for the container and segments
  const baseBar = `w-full h-2.5 rounded-full overflow-hidden flex`;
  const segmentBase = `h-2.5 transition-all`;

  // Track background
  const trackClass = activeTheme.isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div>
      <div className={`${baseBar} ${trackClass}`}>
        {suspendedPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.canvas}`}
            style={{ width: `${suspendedPct}%` }}
            title={`Suspended: ${counts.suspended}`}
          />
        )}
        {masteredPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent3}`}
            style={{ width: `${masteredPct}%` }}
            title={`Mastered: ${counts.mastered}`}
          />
        )}
        {duePct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent1}`}
            style={{ width: `${duePct}%` }}
            title={`Due: ${counts.due}`}
          />
        )}
        {learningPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent2}`}
            style={{ width: `${learningPct}%` }}
            title={`Learning: ${counts.learning}`}
          />
        )}
        {newPct > 0 && (
          <div
            className={`${segmentBase} ${trackClass}`}
            style={{ width: `${newPct}%` }}
            title={`New: ${counts.new}`}
          />
        )}
      </div>

      {!isMastered && (
        <div className="flex justify-between text-xs mt-2">
          <span className={activeTheme.text.muted}>
            {counts.suspended} suspended
          </span>
          <span className={activeTheme.text.accent3}>
            {counts.mastered} mastered
          </span>
          <span className={activeTheme.text.accent1}>{counts.due} due</span>
          <span className={activeTheme.text.accent2}>
            {counts.learning} learning
          </span>
          <span className={activeTheme.text.muted}>{counts.new} new</span>
        </div>
      )}
    </div>
  );
};
