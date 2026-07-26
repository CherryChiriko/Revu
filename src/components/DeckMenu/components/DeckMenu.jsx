// src/components/DeckMenu/components/DeckMenu.jsx
import React from "react";
import Menu from "../../General/ui/Menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export function DeckMenu({ activeTheme, onEdit, onDelete, compact = false }) {
  return (
    <Menu>
      <Menu.Trigger>
        <button
          className={`flex items-center justify-center rounded transition-all active:scale-90 ${activeTheme.text.secondary} ${
            compact ? "w-5 h-5" : "w-7 h-7"
          } hover:bg-black/5 dark:hover:bg-white/10`}
          aria-label="Deck menu"
        >
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            className={compact ? "w-2.5 h-2.5" : "w-3 h-3"}
          />
        </button>
      </Menu.Trigger>

      <Menu.Items
        activeTheme={activeTheme}
        width={compact ? "w-28" : "w-32"}
        className="py-0.5"
      >
        <Menu.Item
          action={onEdit}
          activeTheme={activeTheme}
          divider
          className="py-1 px-2 min-h-0"
        >
          <FontAwesomeIcon
            icon={faPen}
            className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} ${activeTheme.text.secondary}`}
          />
          <span
            className={`leading-none ${compact ? "text-[11px]" : "text-xs"}`}
          >
            Edit
          </span>
        </Menu.Item>

        <Menu.Item
          action={onDelete}
          danger
          activeTheme={activeTheme}
          className="py-1 px-2 min-h-0"
        >
          <FontAwesomeIcon
            icon={faTrash}
            className={compact ? "w-2.5 h-2.5" : "w-3 h-3"}
          />
          <span
            className={`leading-none ${compact ? "text-[11px]" : "text-xs"}`}
          >
            Delete
          </span>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
