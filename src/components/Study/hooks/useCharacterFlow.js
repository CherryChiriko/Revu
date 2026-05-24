import { useState, useMemo, useCallback, useEffect, useRef } from "react";

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
    [card?.front]
  );

  const currentCharacter = characters[currentIndex];

  const strokeColor = useMemo(() => {
    const toneColors = ["#777777", "#E30000", "#02B31C", "#1510F0", "#8900BF"];
    const toneIdx = card?.tones?.[currentIndex] ?? 0;
    return toneColors[toneIdx];
  }, [card?.tones, currentIndex]);

  const isLastCharacter = currentIndex === characters.length - 1;

  // Cleanup timeout on unmount or card change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setRevealed(false);
    setMistakeList([]);
    setCompletedChars([]);
    playAudio?.();
  }, [card?.id, playAudio]);

  const calculateAverage = useCallback(
    (mistakesForCurrentChar) => {
      // console.log(mistakesForCurrentChar);
      const allMistakes = [...mistakeList, mistakesForCurrentChar];
      // console.log(
      //   allMistakes,
      //   allMistakes.reduce((a, b) => a + b, 0) / allMistakes.length
      // );
      return allMistakes.reduce((a, b) => a + b, 0) / allMistakes.length;
    },
    [mistakeList]
  );

  // Auto-advance after showing character
  const handleReveal = useCallback(
    (mistakes = 0) => {
      setRevealed(true);
      onReveal?.();
      setMistakeList((prev) => [...prev, mistakes]);
      setCompletedChars((prev) => [...prev, currentCharacter]);
      playAudio?.();

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-advance after showing the character for 600ms
      timeoutRef.current = setTimeout(() => {
        setRevealed(false);
        if (!isLastCharacter) {
          // Move to next character
          setCurrentIndex((i) => i + 1);
        } else {
          // Last character - finish the card
          if (allowRating) {
            const avg = calculateAverage(mistakes);
            const rating = getRatingFromMistakes(Math.round(avg));
            // console.log("rating", rating);
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
      allowRating,
      calculateAverage,
      getRatingFromMistakes,
      onRate,
      onPassComplete,
    ]
  );

  // For outline/animation mode: manual continue
  const handleContinue = useCallback(() => {
    if (displayState === "outline") {
      handleReveal();
      return;
    }

    if (!isLastCharacter) {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
      return;
    }

    // Last character
    if (allowRating) {
      const avg = calculateAverage(mistakeList[mistakeList.length - 1] ?? 0);
      const rating = getRatingFromMistakes(Math.round(avg));
      onRate?.(rating);
    } else {
      onPassComplete?.();
    }
  }, [
    displayState,
    isLastCharacter,
    allowRating,
    handleReveal,
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
