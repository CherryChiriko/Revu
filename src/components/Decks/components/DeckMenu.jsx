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
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all 
          hover:bg-black/10 active:scale-90 ${activeTheme.text.secondary}`}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>

      {isOpen && (
        // Updated styles inside DeckMenu.jsx
        <div
          className={`absolute right-0 mt-2 w-36 rounded-xl shadow-2xl border z-[100] 
  overflow-hidden animate-in fade-in zoom-in duration-75 origin-top-right
  bg-[#1a2233]/95 backdrop-blur-md border-white/10`} // Using a dark theme neutral
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
        hover:bg-white/5 text-gray-200"
            >
              <FontAwesomeIcon icon={faPen} className="text-gray-400 w-3" />
              <span>Edit</span>
            </button>

            <div className="h-[1px] bg-white/5 my-1 mx-2" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
        hover:bg-red-500/10 text-red-400 font-medium"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
