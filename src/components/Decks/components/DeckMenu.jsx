import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export function DeckMenu({ activeTheme, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all 
          hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 ${activeTheme.text.secondary}`}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-40 rounded-xl shadow-xl border overflow-hidden 
            animate-in fade-in zoom-in-95 duration-100 origin-top-right z-[100]
            ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTheme.text.primary} ${activeTheme.link.hoverBg} ${activeTheme.link.hoverText}`}
            >
              <FontAwesomeIcon
                icon={faPen}
                className={`w-3.5 h-3.5 ${activeTheme.text.secondary}`}
              />
              <span>Edit</span>
            </button>

            {/* Divider Line */}
            <hr
              className={`border-t my-1 ${activeTheme.border.muted || "border-gray-200 dark:border-gray-700"}`}
            />

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTheme.text.danger} hover:bg-red-500/10`}
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
