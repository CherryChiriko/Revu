// src/components/Study/components/Card/HanziCanvas.jsx
import React, { useEffect, useState, useRef } from "react";
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
  const wrapperRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(200);

  // Measure the actual space we have and use the largest square that fits
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize(Math.min(width, height));
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      className="w-full h-full flex items-center justify-center"
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
