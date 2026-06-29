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
  maxWidth = "max-w-md", // Allows you to scale up the modal size if needed
}) {
  if (!isOpen) return null;

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
        className={`w-full ${maxWidth} rounded-2xl shadow-xl overflow-hidden border max-h-[90vh] flex flex-col
        ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
      >
        {/* Universal Header Structure */}
        <div
          className={`flex items-start justify-between px-6 pt-6 pb-4 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex flex-col text-left">
            <h2
              className={`text-lg font-bold tracking-tight leading-tight ${activeTheme.text.primary}`}
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
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-colors outline-none focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
            aria-label="close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 block" />
          </button>
        </div>

        {/* Dynamic, Scrollable Content Body Area */}
        <div className="px-6 pb-6 pt-4 overflow-y-auto custom-scrollbar flex-1 text-left">
          {children}
        </div>
      </div>
    </div>
  );
}
