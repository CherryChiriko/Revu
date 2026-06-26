import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

/**
 * A → C conversion panel. No field picker needed
 * Front is always used as the character, back becomes the meaning. Pinyin is auto-generated.
 * Cards whose front isn't a valid CJK character are skipped and a warning is shown.
 */
export function ConvertModeToC({ activeTheme }) {
  return (
    <div
      className={`flex items-start gap-2.5 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.canvas}`}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className={`mt-0.5 shrink-0 ${activeTheme.text.muted}`}
      />
      <p className={`${activeTheme.text.muted} text-pretty`}>
        The{" "}
        <span className={`font-semibold ${activeTheme.text.primary}`}>
          front
        </span>{" "}
        of each card will become the Chinese character and the{" "}
        <span className={`font-semibold ${activeTheme.text.primary}`}>
          back
        </span>{" "}
        will become the meaning. Pinyin will be generated automatically. Cards
        whose front doesn't contain a valid CJK character will be skipped.
      </p>
    </div>
  );
}
