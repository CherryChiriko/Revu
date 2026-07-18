import { useState, useEffect } from "react";
import HanziCanvas from "../../Study/components/Card/HanziCanvas";

export function TutorialCharDemo({ activeTheme }) {
  const [displayState, setDisplayState] = useState("animation"); // "animation" | "outline" | "quiz"
  const [canvasKey, setCanvasKey] = useState(0);
  const [complete, setComplete] = useState(false);

  const handleToggleState = (state) => {
    setDisplayState(state);
    setComplete(false);
    setCanvasKey((k) => k + 1);
  };

  // Automatically restart the canvas loop 2 seconds after the user finishes drawing
  useEffect(() => {
    if (!complete) return;

    const timeoutId = setTimeout(() => {
      setComplete(false);
      setCanvasKey((k) => k + 1); // Remounts the canvas to reset the quiz seamlessly
    }, 2000); // 2000ms = 2 seconds display time

    return () => clearTimeout(timeoutId);
  }, [complete]);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-1">
      {/* State Switch Tab Layout */}
      <div className="flex gap-1.5 h-7 items-center mb-1 z-10">
        <button
          type="button"
          onClick={() => handleToggleState("animation")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "animation"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          1. Animation
        </button>
        <button
          type="button"
          onClick={() => handleToggleState("outline")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "outline"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          2. Outline
        </button>
        <button
          type="button"
          onClick={() => handleToggleState("quiz")}
          className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            displayState === "quiz"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          3. Draw
        </button>
      </div>

      {/* Centered canvas bounding container */}
      <div className="w-full h-48 flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: "250px",
            height: "250px",
            transform: "scale(0.72)",
            transformOrigin: "center center",
          }}
        >
          <HanziCanvas
            key={canvasKey}
            character="人"
            displayState={displayState}
            activeTheme={activeTheme}
            strokeColor={"#02B31C"}
            revealed={false}
            strokeAnimationSpeed={1.2}
            onQuizComplete={() => setComplete(true)}
          />
        </div>
      </div>

      {/* Context Banner */}
      <div className="h-5 flex items-center justify-center mt-1">
        <span className={`text-[11px] ${activeTheme.text.secondary}`}>
          {displayState === "animation" && "Watching stroke animation order..."}
          {displayState === "outline" &&
            "Trace the character over the outline."}
          {displayState === "quiz" &&
            !complete &&
            "Draw the character on the canvas."}
        </span>
      </div>
    </div>
  );
}
