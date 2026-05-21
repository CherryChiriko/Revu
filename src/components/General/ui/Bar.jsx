import React from "react";

export const Bar = ({ current, total, activeTheme, isLabelOn = true }) => {
  const progressPercentage =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="flex flex-col items-center flex-grow mx-4">
      {isLabelOn && (
        <p className={`${activeTheme.text.muted} text-sm mb-2`}>
          {current} of {total}
        </p>
      )}
      <div
        className={`w-full max-w-xl ${activeTheme.background.track} rounded-full h-2.5 overflow-hidden`}
      >
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default React.memo(Bar);
