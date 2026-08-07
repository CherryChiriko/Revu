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
          : "w-full flex justify-center gap-1.5 md:gap-3 px-1 md:px-2"
      }
    >
      {buttons.map(({ label, icon, color, value }) => (
        <button
          key={value}
          onClick={(e) => {
            e.stopPropagation();
            onRate(value);
          }}
          className={`flex-1 flex items-center justify-center rounded-lg font-semibold text-white transition-colors duration-200 shadow-md active:scale-95 ${color} ${
            isDemo
              ? "px-1 py-1.5 text-[10px]"
              : "py-2.5 md:px-4 md:py-3 text-[9px] md:text-base"
          }`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={
              isDemo ? "mr-1 text-[11px]" : "w-5 h-5 md:w-5 md:h-5 md:mr-2"
            }
          />
          <span className={isDemo ? "" : "hidden md:inline"}>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default RatingButtons;
