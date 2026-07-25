import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export function ModalTemplate({
  isOpen,
  onClose,
  title,
  subtitle,
  activeTheme,
  children,
  maxWidth = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-[2px]"
      style={{
        backgroundColor: activeTheme.isDark
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(15, 23, 42, 0.3)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${maxWidth} rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border max-h-[92vh] sm:max-h-[90vh] flex flex-col
        ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex flex-col text-left min-w-0">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight leading-tight ${activeTheme.text.primary}`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`text-xs mt-1 leading-snug font-medium ${activeTheme.text.muted}`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 sm:p-1.5 -mr-1 -mt-1 rounded-lg transition-colors outline-none focus:ring-2 min-h-8 min-w-8 flex items-center justify-center ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
            aria-label="close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 block" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4 overflow-y-auto custom-scrollbar flex-1 text-left">
          {children}
        </div>
      </div>
    </div>
  );
}
