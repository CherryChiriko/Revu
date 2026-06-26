export function MissedMode({ logic, activeTheme }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
        >
          Card limit
        </p>
        <span className={`text-sm font-bold ${activeTheme.text.primary}`}>
          {logic.missedLimit} cards
        </span>
      </div>
      <input
        type="range"
        min={5}
        max={100}
        step={5}
        value={logic.missedLimit}
        onChange={(e) => logic.setMissedLimit(Number(e.target.value))}
        className="w-full accent-indigo-500"
      />
      <p className={`text-xs ${activeTheme.text.muted} mt-1`}>
        Selects your {logic.missedLimit} cards with the lowest ease factor — the
        ones SRS considers hardest.
      </p>
    </div>
  );
}
