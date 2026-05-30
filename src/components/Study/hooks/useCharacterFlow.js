import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";

export function useCharacterFlow({
  card,
  allowRating,
  onRate,
  onPassComplete,
  getRatingFromMistakes,
  onReveal,
  playAudio,
  displayState,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mistakeList, setMistakeList] = useState([]);
  const [completedChars, setCompletedChars] = useState([]);

  const timeoutRef = useRef(null);

  const characters = useMemo(
    () => (card?.front || "").split(""),
    [card?.front],
  );

  const currentCharacter = characters[currentIndex];

  const strokeColor = useMemo(() => {
    const toneColors = ["#777777", "#E30000", "#02B31C", "#1510F0", "#8900BF"];
    const toneIdx = card?.tones?.[currentIndex] ?? 0;
    return toneColors[toneIdx];
  }, [card?.tones, currentIndex]);

  const isLastCharacter = currentIndex === characters.length - 1;

  // Track fast-changing values for timeouts
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {
      isLastCharacter,
      currentIndex,
      allowRating,
      displayState,
    };
  }, [isLastCharacter, currentIndex, allowRating, displayState]);

  // Master cleanup for active timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [card?.id, displayState, currentIndex]);

  const phaseGenerationRef = useRef(0);

  useLayoutEffect(() => {
    phaseGenerationRef.current += 1;
    console.log(
      "[useCharacterFlow] layoutEffect reset — card:",
      card?.id,
      "displayState:",
      displayState,
    ); // ADD THIS

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setCurrentIndex(0);
    setMistakeList([]);
    setCompletedChars([]);

    // CRITICAL: Always hide the character when a new phase or card mounts!
    // This ensures Quiz phase starts completely blank.
    setRevealed(false);

    playAudio?.();
  }, [card?.id, displayState]);

  // Handles character completion/reveal (either auto in outline or on-complete in quiz)
  const handleReveal = useCallback(
    (mistakes = 0) => {
      const generation = phaseGenerationRef.current;

      // Clear any pending triggers safely
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Show the character strokes now that it's completed/revealed
      setRevealed(true);
      console.log(
        "[useCharacterFlow] setRevealed(true) — displayState at call time:",
        displayState,
      );
      onReveal?.();
      setMistakeList((prev) => [...prev, mistakes]);
      setCompletedChars((prev) => [...prev, currentCharacter]);
      playAudio?.();

      timeoutRef.current = setTimeout(() => {
        if (phaseGenerationRef.current !== generation) return;
        timeoutRef.current = null;

        const current = stateRef.current;

        // If the user manually changed phases out from under us, stop execution
        if (current.displayState !== displayState) return;

        // Turn reveal back off for the next character coming up
        setRevealed(false);

        if (!isLastCharacter) {
          setCurrentIndex((i) => i + 1);
        } else {
          if (current.allowRating) {
            const avg = calculateAverage(mistakes);
            const rating = getRatingFromMistakes(Math.round(avg));
            onRate?.(rating);
          } else {
            onPassComplete?.();
          }
        }
      }, 600);
    },
    [
      onReveal,
      playAudio,
      currentCharacter,
      isLastCharacter,
      displayState,
      allowRating,
      onRate,
      onPassComplete,
      getRatingFromMistakes,
    ],
  );

  const calculateAverage = useCallback(
    (mistakesForCurrentChar) => {
      const allMistakes = [...mistakeList, mistakesForCurrentChar];
      return allMistakes.reduce((a, b) => a + b, 0) / allMistakes.length;
    },
    [mistakeList],
  );

  // Manual fallback button navigation
  const handleContinue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // In outline mode, continue should first reveal the current character.
    if (displayState === "outline" && !revealed) {
      handleReveal();
      return;
    }

    if (!isLastCharacter) {
      setRevealed(false); // Hide for next character
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Auto-reveal on continue for quiz mode when there is no outline branch.
    if (displayState === "quiz") {
      handleReveal();
      return;
    }

    if (allowRating) {
      const avg = calculateAverage(mistakeList[mistakeList.length - 1] ?? 0);
      const rating = getRatingFromMistakes(Math.round(avg));
      onRate?.(rating);
    } else {
      onPassComplete?.();
    }
  }, [
    currentIndex,
    isLastCharacter,
    displayState,
    characters,
    handleReveal,
    allowRating,
    calculateAverage,
    mistakeList,
    getRatingFromMistakes,
    onRate,
    onPassComplete,
    revealed,
  ]);

  const renderWordProgress = () => {
    return (
      <div className="flex space-x-2 text-2xl justify-center items-center">
        {characters.map((ch, idx) => {
          if (displayState === "quiz") {
            const isRevealed = idx < completedChars.length;
            return (
              <span
                key={idx}
                className={`transition-all duration-300 ${
                  isRevealed ? "opacity-100" : "opacity-20"
                }`}
              >
                {isRevealed ? ch : "•"}
              </span>
            );
          }

          const isCurrent = idx === currentIndex;
          return (
            <span
              key={idx}
              className={`transition-all duration-300 underline-offset-4 ${
                isCurrent ? "font-bold" : "opacity-60"
              }`}
              style={{
                color: isCurrent ? strokeColor : "inherit",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    );
  };

  return {
    currentIndex,
    currentCharacter,
    strokeColor,
    revealed,
    handleReveal,
    handleContinue,
    renderWordProgress,
  };
}
