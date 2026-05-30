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
  sessionKey,
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

  // -------------------------------------------------------------
  // CRITICAL FIX: Store fast-changing values in tracking refs
  // so timeouts never read stale snapshots from a closed function
  // -------------------------------------------------------------
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {
      isLastCharacter,
      currentIndex,
      allowRating,
      mistakes: mistakeList[mistakeList.length - 1] ?? 0,
    };
  }, [isLastCharacter, currentIndex, allowRating, mistakeList]);

  // Split the reset effect from the displayState-watching effect
  useLayoutEffect(() => {
    console.log("[useLayoutEffect RESET] firing", {
      cardId: card?.id,
      currentIndexBefore: currentIndex, // add this
    });
    console.log(
      "[useLayoutEffect RESET] card?.id:",
      card?.id,
      "displayState:",
      displayState,
    );
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentIndex(0);
    setRevealed(false);
    setMistakeList([]);
    setCompletedChars([]);
    playAudio?.();
  }, [card?.id, sessionKey]); // ← Remove displayState from here

  // Separate effect just for displayState-driven resets (no state wipe)
  useEffect(() => {
    console.log("[displayState effect]", {
      displayState,
      hasTimeout: !!timeoutRef.current,
    });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRevealed(false);
  }, [displayState]);

  const calculateAverage = useCallback(
    (mistakesForCurrentChar) => {
      const allMistakes = [...mistakeList, mistakesForCurrentChar];
      return allMistakes.reduce((a, b) => a + b, 0) / allMistakes.length;
    },
    [mistakeList],
  );

  // Auto-advance after showing character
  const handleReveal = useCallback(
    (mistakes = 0) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setRevealed(true);
      onReveal?.();
      setMistakeList((prev) => [...prev, mistakes]);
      setCompletedChars((prev) => [...prev, currentCharacter]);
      playAudio?.();

      // Clear any floating handlers from the engine queue
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      console.log("[handleReveal] setting timeout", {
        character: currentCharacter,
        cardId: card?.id,
      });
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setRevealed(false);

        // ALWAYS read from the latest updated values ref
        const current = stateRef.current;

        if (!current.isLastCharacter) {
          console.log("[TIMEOUT ACTION] Safely advancing internal index");
          setCurrentIndex((i) => i + 1);
        } else {
          console.log(
            "[TIMEOUT ACTION] Last character matched via Ref. Syncing state.",
          );
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
      calculateAverage,
      getRatingFromMistakes,
      onRate,
      onPassComplete,
    ],
  );

  // For manual skipping
  const handleContinue = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isLastCharacter) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    if (displayState === "outline") {
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
