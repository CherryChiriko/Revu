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
  const generationRef = useRef(0);

  // Create writer only when character changes
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
  }, [character, strokeColor, outlineColor, width, height]);

  // Control display state
  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    // Increment FIRST, then capture — this generation is now "current"
    generationRef.current += 1;
    const generation = generationRef.current;

    // If a manual reveal was triggered, show the character immediately
    // and skip other state handling. This guarantees Continue->reveal
    // works in both outline and quiz phases.
    if (revealed) {
      writer.cancelQuiz();
      writer.showOutline();
      writer.showCharacter();
      console.log("[useHanziWriter effect] forced reveal");
      return;
    }

    // Ensure that quiz mode is handled next
    const resolvedState = displayState === "quiz" ? "quiz" : displayState;

    console.log("[useHanziWriter effect]", {
      displayState,
      revealed,
      resolvedState,
      generation,
    });

    switch (resolvedState) {
      case "animation":
        writer.cancelQuiz();
        writer.hideCharacter();
        writer.loopCharacterAnimation();
        break;

      case "outline":
        // In outline mode, show the stroke outline but do NOT auto-complete.
        // The parent flow will call `handleReveal` (triggering a reveal)
        // when the user presses Continue. Previously we auto-fired
        // completion which caused outlines to reveal automatically.
        writer.cancelQuiz();
        writer.hideCharacter();
        writer.showOutline();
        break;

      case "quiz":
        writer.cancelQuiz();
        writer.hideOutline();
        writer.hideCharacter();
        writer.quiz({
          showOutline: false,
          onComplete: (summary) => {
            if (generationRef.current !== generation) {
              console.log("[quiz onComplete] stale, ignoring", {
                generation,
                current: generationRef.current,
              });
              return;
            }
            console.log("[quiz onComplete] firing", {
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
        writer.cancelQuiz();
        writer.showOutline();
        writer.showCharacter();
        break;
    }
  }, [displayState, revealed, onQuizComplete, character]);

  return { containerRef };
}
