import { STAGE_LABELS } from "../../utils/cardMastery";

const STAGE_OPACITY = {
  familiar: "opacity-40",
  solid: "opacity-70",
  mastered: "opacity-100",
};

// Only depth stages — "new" and "suspended" belong to ProgressBar's
// queue-status axis, not this one.
export const MasteryBreakdown = ({
  familiar = 0,
  solid = 0,
  mastered = 0,
  activeTheme,
}) => {
  const total = familiar + solid + mastered;
  const gradient = `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const segments = [
    { key: "familiar", count: familiar },
    { key: "solid", count: solid },
    { key: "mastered", count: mastered },
  ].filter((s) => s.count > 0);

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={activeTheme.text.secondary}>Card depth</span>
        <span className="font-semibold">{pct(mastered)}% mastered</span>
      </div>
      <div
        className={`flex h-3 rounded-full overflow-hidden ${activeTheme.background.track}`}
      >
        {segments.map((seg) => (
          <div
            key={seg.key}
            title={`${STAGE_LABELS[seg.key]}: ${seg.count}`}
            style={{ width: `${(seg.count / (total || 1)) * 100}%` }}
            className={`${gradient} ${STAGE_OPACITY[seg.key]} transition-all duration-300`}
          />
        ))}
      </div>
      <div
        className={`${activeTheme.text.secondary} flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3`}
      >
        {segments.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${gradient} ${STAGE_OPACITY[seg.key]}`}
            />
            {seg.count} {STAGE_LABELS[seg.key]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MasteryBreakdown;
