import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export function AddCardTile({ onClick, activeTheme }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add a card"
      className={`group flex items-center justify-center min-h-[84px] rounded-xl border-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${activeTheme.border.secondary} ${activeTheme.background.canvas} hover:border-indigo-400`}
    >
      <FontAwesomeIcon
        icon={faPlus}
        className={`text-sm transition-colors ${activeTheme.text.muted} group-hover:text-indigo-400`}
      />
    </button>
  );
}
