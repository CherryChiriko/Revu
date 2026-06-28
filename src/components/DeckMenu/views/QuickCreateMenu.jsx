import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faCopy,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Menu from "../../General/ui/Menu";

export default function QuickCreateMenu({
  onNewDeck,
  onCloneDeck,
  activeTheme,
}) {
  return (
    <Menu>
      <Menu.Trigger>
        {(isOpen) => (
          <button
            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-xl
            transition-all active:scale-98 ${activeTheme.button.accent2}`}
          >
            <span>Quick Create</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </Menu.Trigger>

      <Menu.Items activeTheme={activeTheme} width="w-64">
        <Menu.Item action={onNewDeck} activeTheme={activeTheme} divider>
          <div
            className={`w-8 h-8 rounded-lg ${activeTheme.background.track} flex items-center justify-center shrink-0`}
          >
            <FontAwesomeIcon icon={faSquarePlus} className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold leading-tight">New deck</span>
            <span
              className={`text-xs mt-0.5 leading-snug ${activeTheme.text.muted}`}
            >
              Create an empty deck
            </span>
          </div>
        </Menu.Item>

        <Menu.Item action={onCloneDeck} activeTheme={activeTheme}>
          <div
            className={`w-8 h-8 rounded-lg ${activeTheme.background.track} flex items-center justify-center shrink-0`}
          >
            <FontAwesomeIcon icon={faCopy} className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold leading-tight">
              Create from deck
            </span>
            <span
              className={`text-xs mt-0.5 leading-snug ${activeTheme.text.muted}`}
            >
              Create a deck from an existing one
            </span>
          </div>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
