import { useState, useEffect } from "react";

export function useCharacter(initialState = "animation", delayMs = 2000) {
  const [displayState, setDisplayState] = useState(initialState);
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
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [complete, delayMs]);

  return {
    displayState,
    canvasKey,
    complete,
    setComplete,
    handleToggleState,
  };
}
