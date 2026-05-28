import { useEffect, useRef } from "react";

const WRITER_CONFIG = {
  padding: 5,
  strokeAnimationSpeed: 2,
  delayBetweenStrokes: 100,
  drawingColor: "rgba(0,0,0,0)",
  highlightWrongColor: "#ff4d4d",
};

export function useHanziWriter({
  character,
  displayState,
  onQuizComplete,
  activeTheme,
  strokeColor,
  revealed,
  width,
  height,
}) {
  const outlineColor = activeTheme.isDark
    ? "rgb(212,212,212)"
    : "rgb(64,64,64)";

  const containerRef = useRef(null);
  const writerRef = useRef(null);

  const state = revealed ? "reveal" : displayState;

  // Master setup effect: Runs whenever character, properties, OR state changes
  useEffect(() => {
    if (!character || !window.HanziWriter || !containerRef.current) return;

    // 1. Wipe the container and drop any old instance
    containerRef.current.innerHTML = "";
    writerRef.current = null;

    try {
      const writer = window.HanziWriter.create(
        containerRef.current,
        character,
        {
          ...WRITER_CONFIG,
          strokeColor,
          outlineColor,
          highlightColor: strokeColor,
          width,
          height,
        },
      );

      writerRef.current = writer;
      console.log("[useHanziWriter] Hook hook-level evaluated:", {
        character,
        state,
      });

      // 2. Apply behavior directly upon creation based on the current state
      switch (state) {
        case "animation":
          writer.hideCharacter();
          writer.loopCharacterAnimation();
          break;

        case "outline":
          writer.hideCharacter();
          writer.quiz({
            onComplete: () => onQuizComplete?.(0),
          });
          break;

        case "quiz":
          writer.hideCharacter();
          writer.hideOutline();
          writer.quiz({
            onComplete: (summary) => {
              const mistakes = summary?.totalMistakes ?? 0;
              onQuizComplete?.(mistakes);
            },
          });
          break;

        case "reveal":
        default:
          writer.showCharacter();
          break;
      }
    } catch (err) {
      console.error("[HanziWriter] Setup Error:", err);
    }

    // Cleanup when moving away or unmounting
    return () => {
      writerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [
    character,
    state,
    outlineColor,
    strokeColor,
    width,
    height,
    onQuizComplete,
  ]);

  return { containerRef };
}
