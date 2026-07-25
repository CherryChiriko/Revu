import React, { useState, useEffect } from "react";
import HanziCanvas from "../../Study/components/Card/HanziCanvas";

export function TutorialCharDemo({ activeTheme }) {
  const [displayState, setDisplayState] = useState("animation");
  const [canvasKey, setCanvasKey] = useState(0);
  const [complete, setComplete] = useState(false);

  const handleToggleState = (state) => {
    setDisplayState(state);
    setComplete(false);
    setCanvasKey((k) => k + 1);
  };

  useEffect(() => {
    if (!complete) return;
    const timeoutId = setTimeout(() => {
      setComplete(false);
      setCanvasKey((k) => k + 1);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [complete]);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-1">
      {/* State Switch Tabs */}
      <div className="flex gap-2 h-auto items-center mb-2 z-10">
        <button
          type="button"
          onClick={() => handleToggleState("animation")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-h-8 active:scale-95 ${
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
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-h-8 active:scale-95 ${
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
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-h-8 active:scale-95 ${
            displayState === "quiz"
              ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
              : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
          }`}
        >
          3. Draw
        </button>
      </div>

      {/* Canvas container */}
      <div className="w-full h-auto min-h-[140px] sm:min-h-[180px] flex items-center justify-center overflow-hidden">
        <div
          style={{
            width: "250px",
            height: "250px",
            transform: "scale(0.6)",
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
      <div className="h-auto min-h-[20px] flex items-center justify-center mt-1 px-2">
        <span className={`text-xs text-center ${activeTheme.text.secondary}`}>
          {displayState === "animation" && "Watching stroke animation order..."}
          {displayState === "outline" &&
            "Trace the character over the outline."}
          {displayState === "quiz" &&
            !complete &&
            "Draw the character on the canvas."}
          {displayState === "quiz" && complete && "Great job!"}
        </span>
      </div>
    </div>
  );
}
