import React from "react";
import Menu from "../../General/ui/Menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export function DeckMenu({ activeTheme, onEdit, onDelete }) {
  return (
    <Menu>
      <Menu.Trigger>
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-xl
          hover:bg-black/5 dark:hover:bg-white/10 transition-all
          active:scale-90 ${activeTheme.text.secondary}`}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </Menu.Trigger>

      <Menu.Items activeTheme={activeTheme} width="w-36">
        <Menu.Item action={onEdit} activeTheme={activeTheme} divider>
          <FontAwesomeIcon
            icon={faPen}
            className={`w-3.5 h-3.5 ${activeTheme.text.secondary}`}
          />
          <span>Edit</span>
        </Menu.Item>

        <Menu.Item action={onDelete} danger activeTheme={activeTheme}>
          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
          <span>Delete</span>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
