import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export function SuccessView({ logic, activeTheme }) {
  return (
    <div className="flex flex-col items-center gap-5 sm:gap-4 py-6 sm:py-4 text-center">
      <div
        className={`w-16 h-16 sm:w-14 sm:h-14 ${activeTheme.background.light} ${activeTheme.text.accent1} rounded-full flex items-center justify-center text-2xl`}
      >
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <div>
        <p
          className={`font-semibold text-lg sm:text-base ${activeTheme.text.primary}`}
        >
          Deck cloned!
        </p>
        <p
          className={`text-base sm:text-sm mt-2 sm:mt-1 ${activeTheme.text.muted}`}
        >
          <span className="font-medium">{logic.newDeckName}</span> is ready to
          study.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
        <button
          onClick={logic.reset}
          className={`px-4 py-3.5 sm:py-2 rounded-xl text-base sm:text-sm font-semibold border transition-colors min-h-12 sm:min-h-0 ${activeTheme.border.card} ${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`}
        >
          Clone another
        </button>
        <button
          onClick={logic.handleClose}
          className={`px-4 py-3.5 sm:py-2 rounded-xl text-base sm:text-sm font-semibold text-white min-h-12 sm:min-h-0 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110 transition-all`}
        >
          Done
        </button>
      </div>
    </div>
  );
}
