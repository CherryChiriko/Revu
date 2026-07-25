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
          className={`flex items-center justify-center rounded-xl transition-all active:scale-90 ${activeTheme.text.secondary} ${compact ? "w-8 h-8" : "w-9 h-9 md:w-8 md:h-8"} hover:bg-black/5 dark:hover:bg-white/10`}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
        </button>
      </Menu.Trigger>

      <Menu.Items activeTheme={activeTheme} width="w-36">
        <Menu.Item action={onEdit} activeTheme={activeTheme} divider>
          <FontAwesomeIcon
            icon={faPen}
            className={`w-3.5 h-3.5 ${activeTheme.text.secondary}`}
          />
          <span className="text-sm">Edit</span>
        </Menu.Item>

        <Menu.Item action={onDelete} danger activeTheme={activeTheme}>
          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
          <span className="text-sm">Delete</span>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
