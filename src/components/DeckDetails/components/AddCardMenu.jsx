import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAddCard } from "../hooks/useAddCard";
import { inputCls } from "../../General/ui/FormStyles";
import { hasCJKCharacter } from "../../../utils/cjkValidation";

export function AddCardMenu({
  isOpen,
  onClose,
  deckId,
  studyMode,
  totalCardCount,
  activeTheme,
  onSuccess,
}) {
  const firstInputRef = useRef(null);

  const { fields, setField, isValid, isSubmitting, error, submit, reset } =
    useAddCard({ deckId, studyMode, totalCardCount, onSuccess, onClose });
  console.log(isValid, isSubmitting);
  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape keypress
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isC = studyMode === "C";
  const isButtonDisabled = !isValid || isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      style={{
        backgroundColor: activeTheme.isDark
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(15, 23, 42, 0.3)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between px-6 pt-6 pb-2 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex flex-col text-left">
            <h2
              className={`text-lg font-bold tracking-tight leading-tight ${activeTheme.text.primary}`}
            >
              Add a card
            </h2>
            <p
              className={`text-xs mt-1 leading-snug font-medium ${activeTheme.text.muted}`}
            >
              {isC
                ? "Character, meaning and optional pinyin."
                : "Front and back for your new flashcard."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-colors outline-none focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 block" />
          </button>
        </div>

        {/* Body Form */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Front / Character input */}
          <div className="flex flex-col gap-1">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
            >
              {isC ? "Character" : "Front"}{" "}
              <span className={activeTheme.text.danger}>*</span>
            </p>
            <input
              ref={firstInputRef}
              type="text"
              value={fields.front}
              onChange={(e) => setField("front", e.target.value)}
              placeholder={isC ? "e.g. 你好" : "Word or phrase"}
              className={inputCls(activeTheme)}
            />
            {isC &&
              fields.front.trim() !== "" &&
              !hasCJKCharacter(fields.front) && (
                <p className={`text-xs ${activeTheme.text.danger} mt-1`}>
                  This field must contain at least one Chinese character.
                </p>
              )}
          </div>

          {/* Meaning input */}
          <div className="flex flex-col gap-1">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
            >
              Meaning <span className={activeTheme.text.danger}>*</span>
            </p>
            <input
              type="text"
              value={fields.back}
              onChange={(e) => setField("back", e.target.value)}
              placeholder="Meaning or translation"
              className={inputCls(activeTheme)}
            />
          </div>

          {/* Optional Reading input for character mode */}
          {isC && (
            <div className="flex flex-col gap-1">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.muted}`}
              >
                Reading (Pinyin)
              </p>
              <input
                type="text"
                value={fields.reading}
                onChange={(e) => setField("reading", e.target.value)}
                placeholder="e.g. nǐ hǎo"
                className={inputCls(activeTheme)}
              />
              <p className={`text-[10px] ${activeTheme.text.muted}`}>
                Auto-generated if left blank.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className={`flex items-center gap-1 text-xs ${activeTheme.text.danger}`}
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={submit}
            disabled={isButtonDisabled}
            className={`w-full py-2.5 mt-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
              ${
                isButtonDisabled
                  ? activeTheme.button.disabled
                  : `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} hover:brightness-110`
              }`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                Saving…
              </>
            ) : (
              "Add card"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
