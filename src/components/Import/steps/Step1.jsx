import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faCircle,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

import { CharacterDemo } from "../../General/ui/CharacterDemo";

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
                <div className={`font-medium ${activeTheme.text.activeButton}`}>
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
          <div className="w-full max-w-[180px] mx-auto">
            <div
              className={`rounded-xl p-3 ${activeTheme.background.secondary} border ${activeTheme.border.card}`}
            >
              <CharacterDemo activeTheme={activeTheme} />
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
