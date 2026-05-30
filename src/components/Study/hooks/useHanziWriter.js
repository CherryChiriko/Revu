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

  // Master setup effect: Runs whenever character, properties, OR state changes
  // create writer ONLY when character changes
  useEffect(() => {
    if (!character || !window.HanziWriter || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const writer = window.HanziWriter.create(containerRef.current, character, {
      ...WRITER_CONFIG,
      strokeColor,
      outlineColor,
      highlightColor: strokeColor,
      width,
      height,
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [character]);

  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    const resolvedState = revealed ? "reveal" : displayState;

    switch (resolvedState) {
      case "animation":
        writer.hideCharacter();
        writer.loopCharacterAnimation();
        break;

      case "outline":
        writer.hideCharacter();
        writer.quiz({
          onComplete: () => {
            console.log("[HanziWriter onComplete outline]", {
              character,
              displayState,
            });
            onQuizComplete?.(0);
          },
        });
        break;

      case "quiz":
        writer.quiz({
          onComplete: (summary) => {
            console.log("[HanziWriter onComplete quiz]", {
              character,
              displayState,
              summary,
            });
            onQuizComplete?.(summary?.totalMistakes ?? 0);
          },
        });
        break;

      case "reveal":
      default:
        writer.showCharacter();
        break;
    }
  }, [displayState, revealed, onQuizComplete]);

  return { containerRef };
}
