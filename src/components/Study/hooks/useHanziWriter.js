import { useEffect, useRef } from "react";

const BASE_WRITER_CONFIG = {
  padding: 5,
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
  strokeAnimationSpeed = 1,
  width,
  height,
}) {
  const outlineColor = activeTheme.isDark
    ? "rgb(212,212,212)"
    : "rgb(64,64,64)";

  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const generationRef = useRef(0);

  // ── Create writer when character or visual config changes ─────────────────
  // strokeAnimationSpeed is a create-time config in HanziWriter — the writer
  // must be recreated when it changes.
  useEffect(() => {
    if (!character || !window.HanziWriter || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const writer = window.HanziWriter.create(containerRef.current, character, {
      ...BASE_WRITER_CONFIG,
      strokeAnimationSpeed,
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
  }, [
    character,
    strokeColor,
    outlineColor,
    strokeAnimationSpeed,
    width,
    height,
  ]);

  // ── Control display state ─────────────────────────────────────────────────
  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    generationRef.current += 1;
    const generation = generationRef.current;

    // Manual reveal overrides everything — show character immediately
    if (revealed) {
      writer.cancelQuiz();
      writer.showOutline();
      writer.showCharacter();
      return;
    }

    const resolvedState = displayState === "quiz" ? "quiz" : displayState;

    switch (resolvedState) {
      case "animation":
        writer.cancelQuiz();
        writer.hideCharacter();
        writer.loopCharacterAnimation();
        break;

      case "outline":
        writer.cancelQuiz();
        writer.hideCharacter();
        writer.showOutline();
        writer.quiz({
          onComplete: () => {
            onQuizComplete?.();
          },
        });
        break;

      case "quiz":
        writer.cancelQuiz();
        writer.hideOutline();
        writer.hideCharacter();
        writer.quiz({
          showOutline: false,
          onComplete: (summary) => {
            if (generationRef.current !== generation) return;
            onQuizComplete?.(summary?.totalMistakes ?? 0);
          },
        });
        break;

      case "reveal":
      default:
        writer.cancelQuiz();
        writer.showOutline();
        writer.showCharacter();
        break;
    }
  }, [displayState, revealed, onQuizComplete, character]);

  return { containerRef };
}
