// src/components/Study/components/Card/HanziCanvas.jsx
import React, { useEffect, useState, useRef } from "react";
import { useHanziWriter } from "../../hooks/useHanziWriter";

// Snap to the largest fixed square that fits inside the container.
// Tweak these numbers to match your card's real estate.
function getSizeFromContainer(width, height) {
  const space = Math.min(width, height);

  if (space < 240) return 200; // tight fit (small desktop card, large text)
  if (space < 320) return 240; // medium
  if (space < 400) return 280; // roomy
  return 300; // tablet / landscape with lots of space
}

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
  const [size, setSize] = useState(200);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const next = getSizeFromContainer(width, height);
        // Only update when we cross a breakpoint — prevents jitter
        setSize((prev) => (prev !== next ? next : prev));
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
    width: size,
    height: size,
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
        className={`${bgColor} border-4 ${borderColor} rounded-xl shadow-md`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
        }}
        role="region"
        aria-label="Character writing canvas"
      />
    </div>
  );
};

export default React.memo(HanziCanvas);
