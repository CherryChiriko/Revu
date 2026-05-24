// src/components/CardRenderer/RatingButtons.jsx
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

const RatingButtons = ({ onRate }) => (
  <div className="absolute bottom-8 w-full flex justify-center space-x-4 px-8">
    {buttons.map(({ label, icon, color, value }) => (
      <button
        key={value}
        onClick={() => onRate(value)}
        className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors duration-200 shadow-md ${color}`}
      >
        <FontAwesomeIcon icon={icon} className="w-5 h-5 mr-2" />
        {label}
      </button>
    ))}
  </div>
);

export default RatingButtons;
