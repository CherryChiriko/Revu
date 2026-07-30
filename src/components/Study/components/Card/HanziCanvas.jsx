import React, { useEffect, useRef, useState } from "react";
import { useHanziWriter } from "../../hooks/useHanziWriter";

const HanziCanvas = ({
  character,
  displayState,
  onQuizComplete,
  activeTheme,
  strokeColor,
  revealed,
  strokeAnimationSpeed = 1,
  variant = "standard",
}) => {
  const isDemo = variant === "demo";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const wrapperRef = useRef(null);
  const canvasSize = isDemo ? 150 : isMobile ? 300 : 250;

  const { containerRef } = useHanziWriter({
    character,
    displayState,
    onQuizComplete,
    activeTheme,
    strokeColor,
    revealed,
    strokeAnimationSpeed,
    width: canvasSize,
    height: canvasSize,
  });

  const bgColor = activeTheme?.background?.canvas ?? "bg-white";
  const borderColor = activeTheme?.border?.card ?? "border-gray-200";

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col items-center justify-center h-full w-full min-h-0"
    >
      <div
        ref={containerRef}
        className={`${bgColor} border-4 ${borderColor} rounded-xl shadow-md transition-all duration-300`}
        style={{
          width: `${canvasSize}px`,
          height: `${canvasSize}px`,
          position: "relative",
        }}
        role="region"
        aria-label="Character writing canvas"
      />
    </div>
  );
};

export default React.memo(HanziCanvas);
