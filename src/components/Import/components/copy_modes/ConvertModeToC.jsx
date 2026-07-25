import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export function ConvertModeToC({ activeTheme }) {
  return (
    <div
      className={`flex items-start gap-2.5 text-sm sm:text-xs px-3 py-3 sm:py-2.5`}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className={`mt-0.5 shrink-0 ${activeTheme.text.muted}`}
      />
      <div
        className={`${activeTheme.text.muted} text-pretty flex flex-col gap-1`}
      >
        <p>
          The{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            front
          </span>{" "}
          of each card will become the Chinese character and the{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            back
          </span>{" "}
          will become the meaning.
        </p>
        <p>Pinyin will be generated automatically.</p>
        <p>
          Cards whose front doesn't contain a valid character will be skipped.
        </p>
      </div>
    </div>
  );
}
