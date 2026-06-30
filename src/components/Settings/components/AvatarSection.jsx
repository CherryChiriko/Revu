import React, { useState } from "react";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { SettingCard } from "../SettingsTemplates";
import { AvatarDisplay } from "../../General/ui/AvatarDisplay";
import { AvatarPick } from "./AvatarPick";

export function AvatarSection({ profile, settings, activeTheme }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <SettingCard
        icon={faImage}
        title="Avatar"
        activeTheme={activeTheme}
        onSave={() => setPickerOpen(true)}
        saveState="idle"
        saveLabel="Customize"
      >
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <AvatarDisplay
              settings={settings}
              username={profile?.username}
              className="w-full h-full text-5xl"
            />
          </div>
        </div>
      </SettingCard>

      <AvatarPick
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        profile={profile}
        settings={settings}
        activeTheme={activeTheme}
      />
    </>
  );
}
