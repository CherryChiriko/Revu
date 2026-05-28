export const ProgressBar = ({
  counts,
  cards_count,
  activeTheme,
  isMastered,
}) => {
  const [mastered, suspended, waiting, due, newCards] = [
    counts.mastered,
    counts.suspended,
    counts.waiting,
    counts.due,
    counts.new,
  ];

  const masteredPct = cards_count ? (mastered / cards_count) * 100 : 0;
  const suspendedPct = cards_count ? (suspended / cards_count) * 100 : 0;
  const learningPct = cards_count ? (waiting / cards_count) * 100 : 0;
  const duePct = cards_count ? (due / cards_count) * 100 : 0;
  const newPct = cards_count ? (newCards / cards_count) * 100 : 0;

  // Base classes for the container and segments
  const baseBar = `w-full h-2 rounded-full overflow-hidden flex`;
  const segmentBase = `h-2 transition-all`;

  // Track background
  const trackClass = activeTheme.isDark ? "bg-gray-700" : "bg-gray-200";

  // Reusable Stat Item Component
  const StatItem = ({ label, count, colorClass }) => {
    if (count === 0) return null; // Clean up UI by hiding zeros
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
        <span
          className={`${activeTheme.text.muted} text-[11px] font-medium leading-none`}
        >
          <span>{count}</span> {label}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className={`${baseBar} ${trackClass}`}>
        {suspendedPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.canvas}`}
            style={{ width: `${suspendedPct}%` }}
            title={`Suspended: ${suspended}`}
          />
        )}
        {masteredPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent3}`}
            style={{ width: `${masteredPct}%` }}
            title={`Mastered: ${mastered}`}
          />
        )}
        {duePct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent1}`}
            style={{ width: `${duePct}%` }}
            title={`Due: ${due}`}
          />
        )}
        {learningPct > 0 && (
          <div
            className={`${segmentBase} ${activeTheme.background.accent2}`}
            style={{ width: `${learningPct}%` }}
            title={`Learning: ${waiting}`}
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
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 px-0.5">
          <StatItem
            label="due"
            count={due}
            colorClass={activeTheme.background.accent1}
          />
          <StatItem
            label="waiting"
            count={waiting}
            colorClass={activeTheme.background.accent2}
          />
          <StatItem
            label="new"
            count={newCards}
            colorClass={activeTheme.background.light}
          />
          <StatItem
            label="mastered"
            count={mastered}
            colorClass={activeTheme.background.accent3}
          />
          <StatItem
            label="suspended"
            count={suspended}
            colorClass={activeTheme.background.muted}
          />
        </div>
      )}
    </div>
  );
};
