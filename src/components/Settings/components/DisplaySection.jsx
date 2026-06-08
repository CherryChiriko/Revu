import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingCard, SegmentButton } from "../SettingsTemplates";

import { updateSettings } from "../../../slices/settingsSlice";

import {
  faCalendarDays,
  faLayerGroup,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Display defaults
// ─────────────────────────────────────────────────────────────────────────────

export function DisplaySection({ settings, activeTheme, dispatch }) {
  const set = (key, value) => dispatch(updateSettings({ [key]: value }));

  return (
    <SettingCard icon={faLayerGroup} title="Defaults" activeTheme={activeTheme}>
      <div className="space-y-6">
        <div>
          <div className="font-semibold mb-2">
            <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
            Date format
          </div>
          <div
            className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
          >
            <SegmentButton
              active={settings.dateFormat === "dd/mm/yyyy"}
              onClick={() => set("dateFormat", "dd/mm/yyyy")}
              activeTheme={activeTheme}
            >
              DD/MM/YYYY
            </SegmentButton>
            <SegmentButton
              active={settings.dateFormat === "mm/dd/yyyy"}
              onClick={() => set("dateFormat", "mm/dd/yyyy")}
              activeTheme={activeTheme}
            >
              MM/DD/YYYY
            </SegmentButton>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">
            <FontAwesomeIcon icon={faRotate} className="mr-2" />
            Default deck view
          </div>
          <div
            className={`p-1 rounded-xl ${activeTheme.background.canvas} flex gap-1`}
          >
            <SegmentButton
              active={settings.defaultDeckView === "grid"}
              onClick={() => set("defaultDeckView", "grid")}
              activeTheme={activeTheme}
            >
              Large card
            </SegmentButton>
            <SegmentButton
              active={settings.defaultDeckView === "list"}
              onClick={() => set("defaultDeckView", "list")}
              activeTheme={activeTheme}
            >
              Compact list
            </SegmentButton>
          </div>
        </div>
      </div>
    </SettingCard>
  );
}
