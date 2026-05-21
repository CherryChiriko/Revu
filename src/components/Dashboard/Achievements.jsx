import achievements from "../../data/achievements.json";

export const Achievements = ({ onClaim, activeTheme }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Achievements</h3>
        <div className="text-xs opacity-60">Study to unlock badges</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {achievements.slice(0, 3).map((ach) => (
          <div key={ach.id} className="flex flex-col items-center">
            <img src={ach.icon} alt={ach.id} className="w-8 h-8 mb-2" />
            <p className={`${activeTheme.text.primary} text-sm`}>{ach.title}</p>
            <p className={`${activeTheme.text.secondary} text-xs mb-2`}>
              {ach.hint}
            </p>
            <div className="flex items-center gap-2">
              {ach.unlocked ? (
                <button className={`text-xs px-3 ${activeTheme.text.accent1}`}>
                  Claim
                </button>
              ) : (
                <div className="text-xs opacity-60">Owned</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
