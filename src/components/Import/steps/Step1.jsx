import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faCircle,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

import { useHanziWriter } from "../../Study/hooks/useHanziWriter";

const CharacterSample = ({ activeTheme }) => {
  const { containerRef } = useHanziWriter({
    character: "字",
    displayState: "animation",
    onQuizComplete: () => {},
    activeTheme,
    strokeColor: `${activeTheme.isDark ? "rgb(212,212,212)" : "rgb(55, 65, 81)"}`,
    revealed: true,
    width: 100,
    height: 100,
  });

  return (
    <div
      ref={containerRef}
      className={`${activeTheme.background.canvas} border-4 ${activeTheme.border.card} rounded-xl shadow-lg transition-all duration-300 mx-auto`}
      style={{
        width: "100px",
        height: "100px",
        position: "relative",
      }}
      role="region"
      aria-label="Character writing canvas"
    />
  );
};

const Step1 = ({ activeTheme, logic, onNext }) => {
  const CARD_TYPES = [
    {
      id: 1,
      title: "Standard",
      description: "Basic flashcards with front and back",
    },
    {
      id: 2,
      title: "Chinese writing",
      description: "Flashcards with Chinese characters and pinyin",
    },
  ];

  const sample = (id) => {
    switch (id) {
      case 1:
        return (
          <div className="grid grid-cols-3 gap-3">
            {/* Column 1: Front Card + Label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-lg p-3 border flex items-center justify-center ${activeTheme.border.default} ${activeTheme.background.accent1}`}
              >
                <div className={`font-medium ${activeTheme.text.primary}`}>
                  Hola
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold ${activeTheme.text.muted}`}
              >
                Front
              </span>
            </div>

            {/* Column 2: Arrow */}
            <div className="flex items-start justify-center pt-4">
              {/* pt-4 aligns the arrow vertically with the text inside the cards */}
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`text-sm ${activeTheme.text.muted}`}
              />
            </div>

            {/* Column 3: Back Card + Label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-lg p-3 border flex items-center justify-center ${activeTheme.border.default} ${activeTheme.background.primary}`}
              >
                <div className={`font-medium ${activeTheme.text.primary}`}>
                  Hello
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold ${activeTheme.text.muted}`}
              >
                Back
              </span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center ">
            <div
              className={`rounded-xl shadow-sm flex flex-col items-center justify-between p-2 ${activeTheme.border.card} border`}
            >
              {/* Pinyin */}
              <p
                className={`text-sm font-bold leading-tight ${activeTheme.text.primary} flex-1`}
              >
                zì
              </p>

              {/* Character */}
              <CharacterSample activeTheme={activeTheme} />

              {/* Translation */}
              <div className="flex flex-col w-full justify-center items-center px-4 mt-2 text-center space-y-3">
                <p className={`text-sm italic ${activeTheme.text.secondary}`}>
                  word
                </p>
              </div>
            </div>
          </div>
        );
      default:
        break;
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2
          className={`text-2xl font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
        >
          <FontAwesomeIcon icon={faSquarePlus} className="w-5 h-5" />
          Step 1: Choose your flashcard type
        </h2>
        <p className={`${activeTheme.text.secondary} text-sm mt-2`}>
          Select the flashcard structure that matches your learning content
        </p>
      </div>

      {/* Flashcard Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARD_TYPES.map((type) => {
          const isSelected = logic.selectedStudyType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => logic.setSelectedStudyType(type.id)}
              className={`text-left flex justify-start flex-col rounded-xl border p-4 transition-all duration-200
              ${
                isSelected
                  ? `${activeTheme.border.primary} ring-2 ring-offset-2 ${activeTheme.ring}`
                  : activeTheme.border.muted
              }
              `}
            >
              <div className="flex justify-between mb-2">
                <p className={`font-semibold ${activeTheme.text.primary}`}>
                  {type.title}
                </p>
                {isSelected ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={`${activeTheme.text.primary}`}
                  />
                ) : (
                  <div
                    className={`
      flex items-center justify-center rounded-full w-5 h-5 border
      ${activeTheme.border.card}
    `}
                  >
                    {!activeTheme.isDark && (
                      <FontAwesomeIcon
                        icon={faCircle}
                        className={`text-[10px] ${activeTheme.text.activeButton}`}
                      />
                    )}
                  </div>
                )}
              </div>

              <p className={`text-sm mb-4 ${activeTheme.text.muted}`}>
                {type.description}
              </p>

              {/* Sample Card Preview */}
              {/* <div className="flex justify-center items-center"> */}
              {sample(type.id)}
              {/* </div> */}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!logic.selectedStudyType}
          className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next: Upload File
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
      </div>
    </>
  );
};

export default Step1;
