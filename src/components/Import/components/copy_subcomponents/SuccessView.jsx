import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export function SuccessView({ logic, activeTheme }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div
        className={`w-14 h-14 ${activeTheme.background.light} ${activeTheme.text.accent1} rounded-full flex items-center justify-center text-2xl`}
      >
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <div>
        <p className={`font-semibold ${activeTheme.text.primary}`}>
          Deck cloned!
        </p>
        <p className={`text-sm mt-1 ${activeTheme.text.muted}`}>
          <span className="font-medium">{logic.newDeckName}</span> is ready to
          study.
        </p>
      </div>
      <div className="flex gap-3 mt-1">
        <button
          onClick={logic.reset}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${activeTheme.border.card} ${activeTheme.text.secondary} ${activeTheme.link.hoverBg}`}
        >
          Clone another
        </button>
        <button
          onClick={logic.handleClose}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} hover:brightness-110 transition-all`}
        >
          Done
        </button>
      </div>
    </div>
  );
}
