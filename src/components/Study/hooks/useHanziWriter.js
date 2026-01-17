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

  // Init / recreate writer on character change
  useEffect(() => {
    if (!character || !window.HanziWriter || !containerRef.current) return;

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
        }
      );

      writerRef.current = writer;
    } catch (err) {
      console.error("[HanziWriter] Failed to init:", err);
    }
  }, [character, outlineColor, strokeColor, width, height]);

  // Apply mode-specific behavior
  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    try {
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
      }
    } catch (err) {
      console.error("[useHanziWriter] Mode error:", err);
    }
  }, [state, onQuizComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      writerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return { containerRef };
}
