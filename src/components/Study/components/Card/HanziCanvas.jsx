import React from "react";
import { useHanziWriter } from "../../hooks/useHanziWriter";

const HanziCanvas = ({
  character,
  displayState,
  onQuizComplete,
  activeTheme,
  strokeColor,
  revealed,
  strokeAnimationSpeed = 1,
}) => {
  const { containerRef } = useHanziWriter({
    character,
    displayState,
    onQuizComplete,
    activeTheme,
    strokeColor,
    revealed,
    strokeAnimationSpeed,
    width: 250,
    height: 250,
  });

  const bgColor = activeTheme?.background?.canvas ?? "bg-white";
  const borderColor = activeTheme?.border?.card ?? "border-gray-200";

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div
        ref={containerRef}
        className={`${bgColor} border-4 ${borderColor} rounded-xl shadow-md transition-all duration-300`}
        style={{ width: "250px", height: "250px", position: "relative" }}
        role="region"
        aria-label="Character writing canvas"
      />
    </div>
  );
};

export default React.memo(HanziCanvas);
