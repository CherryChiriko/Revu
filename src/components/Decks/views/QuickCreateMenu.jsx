import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faCopy,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Drop-down trigger button for Quick Create.
 * Renders a button with a chevron that opens a two-item menu:
 *   • New deck       → opens QuickCreateModal on the "new" path
 *   • Clone deck     → opens CloneDeckModal
 *
 * Props:
 *   onNewDeck()    – called when user picks "New deck"
 *   onCloneDeck()  – called when user picks "Clone deck"
 *   activeTheme    – theme object
 */
export default function QuickCreateMenu({
  onNewDeck,
  onCloneDeck,
  activeTheme,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const ITEMS = [
    {
      icon: faSquarePlus,
      label: "New deck",
      description: "Create an empty deck",
      action: onNewDeck,
    },
    {
      icon: faCopy,
      label: "Create from deck",
      description: "Create a deck from an existing one",
      action: onCloneDeck,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-2 font-semibold py-2 px-3 rounded-lg
          ${activeTheme.button.accent2}`}
      >
        Quick Create
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`h-3 w-3 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl border overflow-hidden z-[100]
            ${activeTheme.background.secondary} ${activeTheme.border.card}`}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.action();
                }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${activeTheme.link.hoverBg}`}
              >
                {/* <FontAwesomeIcon
                  icon={item.icon}
                  className={`mt-0.5 w-3.5 h-3.5 shrink-0 ${activeTheme.text.muted}`}
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${activeTheme.text.primary}`}
                  >
                    {item.label}
                  </p>
                  <p className={`text-xs ${activeTheme.text.muted}`}>
                    {item.sub}
                  </p>
                </div> */}
                <div className="flex items-center flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl ${activeTheme.background.track} flex items-center justify-center shrink-0`}
                    >
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className={`text-xs ${activeTheme.text.muted}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
