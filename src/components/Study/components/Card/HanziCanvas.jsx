// src/components/Study/components/Card/HanziCanvas.jsx
import React, { useEffect, useState, useRef } from "react";
import { useHanziWriter } from "../../hooks/useHanziWriter";

// Discrete breakpoints — tweak these numbers to taste
function getSizeFromViewport(width) {
  if (width < 640) return 200; // xs
  if (width < 768) return 220; // sm
  if (width < 1024) return 260; // md
  return 300; // lg+
}

function useCanvasSize() {
  const [size, setSize] = useState(() =>
    typeof window !== "undefined"
      ? getSizeFromViewport(window.innerWidth)
      : 200,
  );

  useEffect(() => {
    let ticking = false;

    const onResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setSize(getSizeFromViewport(window.innerWidth));
        ticking = false;
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
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
  const size = useCanvasSize();

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
    <div className="w-full h-full flex items-center justify-center">
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
