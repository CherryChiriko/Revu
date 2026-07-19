// src/components/Study/components/Controls/RatingButtons.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFaceTired,
  faFaceFrown,
  faFaceSmile,
  faFaceLaughBeam,
} from "@fortawesome/free-solid-svg-icons";

const buttons = [
  {
    label: "Again",
    icon: faFaceTired,
    color: "bg-red-600 hover:bg-red-700",
    value: "again",
  },
  {
    label: "Hard",
    icon: faFaceFrown,
    color: "bg-orange-600 hover:bg-orange-700",
    value: "hard",
  },
  {
    label: "Good",
    icon: faFaceSmile,
    color: "bg-blue-600 hover:bg-blue-700",
    value: "good",
  },
  {
    label: "Easy",
    icon: faFaceLaughBeam,
    color: "bg-green-600 hover:bg-green-700",
    value: "easy",
  },
];

const RatingButtons = ({ onRate, variant = "standard" }) => {
  const isDemo = variant === "demo";

  return (
    <div
      className={
        isDemo
          ? "w-full flex justify-center gap-1 px-2 pb-2"
          : "absolute bottom-2 md:bottom-8 w-full flex justify-center gap-1.5 md:gap-2 md:space-x-4 px-3 md:px-8"
      }
    >
      {buttons.map(({ label, icon, color, value }) => (
        <button
          key={value}
          onClick={(e) => {
            e.stopPropagation();
            onRate(value);
          }}
          className={`flex-1 flex flex-col md:flex-row items-center justify-center rounded-lg font-semibold text-white transition-colors duration-200 shadow-md active:scale-95 ${color} ${
            isDemo
              ? "px-1 py-1.5 text-[10px]"
              : "px-1.5 py-2 md:px-4 md:py-3 text-[10px] md:text-base"
          }`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`min-w-3 min-h-3 ${
              isDemo
                ? "mr-1 text-[11px]"
                : "mb-0.5 md:mb-0 md:mr-2 w-3.5 h-3.5 md:w-5 md:h-5"
            }`}
          />
          {label}
        </button>
      ))}
    </div>
  );
};

export default RatingButtons;
