import React, { useState, useEffect, useRef, useCallback } from "react";
import HanziCanvas from "../../Study/components/Card/HanziCanvas";

export function TutorialCharDemo({ activeTheme }) {
  const [displayState, setDisplayState] = useState("animation");
  const [canvasKey, setCanvasKey] = useState(0);
  const [complete, setComplete] = useState(false);
  const timeoutRef = useRef(null);

  const clearAutoReset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleToggleState = (state) => {
    clearAutoReset();
    setDisplayState(state);
    setComplete(false);
    setCanvasKey((k) => k + 1);
  };

  const handleQuizComplete = useCallback(() => {
    setComplete(true);
  }, []);

  // Auto-reset the quiz 2 seconds after completion
  useEffect(() => {
    if (!complete || displayState !== "quiz") return;

    timeoutRef.current = setTimeout(() => {
      setComplete(false);
      setCanvasKey((k) => k + 1);
    }, 2000);

    return () => clearAutoReset();
  }, [complete, displayState]);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden pt-1">
      {/* State tabs */}
      <div className="flex gap-1.5 items-center mb-2 z-10">
        {[
          { key: "animation", label: "1. Animation" },
          { key: "outline", label: "2. Outline" },
          { key: "quiz", label: "3. Draw" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleToggleState(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-h-8 flex items-center active:scale-95 ${
              displayState === tab.key
                ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
                : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="w-full h-44 flex items-center justify-center overflow-hidden">
        <div className="w-[180px] h-[180px]">
          <HanziCanvas
            key={canvasKey}
            character="人"
            displayState={displayState}
            activeTheme={activeTheme}
            strokeColor={"#02B31C"}
            revealed={false}
            strokeAnimationSpeed={1.2}
            onQuizComplete={handleQuizComplete}
            variant="demo"
          />
        </div>
      </div>

      {/* Context banner */}
      <div className="h-5 flex items-center justify-center mt-1">
        <span className={`text-xs ${activeTheme.text.secondary}`}>
          {displayState === "animation" && "Watching stroke animation order…"}
          {displayState === "outline" &&
            "Trace the character over the outline."}
          {displayState === "quiz" &&
            !complete &&
            "Draw the character on the canvas."}
          {displayState === "quiz" && complete && "Great job! Resetting…"}
        </span>
      </div>
    </div>
  );
}
