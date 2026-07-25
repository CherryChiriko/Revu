import React, { useState } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { SettingCard } from "../../General/ui/SettingCard";
import AccountEditView from "../views/AccountEditView";

export function AccountSection({ profile, activeTheme, dispatch, isMobile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(isMobile);
  return (
    <>
      <SettingCard
        icon={faUser}
        title="Account"
        activeTheme={activeTheme}
        onSave={() => setIsModalOpen(true)}
        saveState="idle" // Keeps button steady in its default style state
        saveLabel="Manage account" // Customizes the action button text cleanly
        isMobile={isMobile}
      >
        <div className="space-y-4 text-left">
          {/* Username Snapshot Display */}
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.muted ?? "text-slate-400"}`}
            >
              Username
            </p>
            <p className={`font-semibold text-sm ${activeTheme.text.primary}`}>
              {profile?.username ?? "Not set"}
            </p>
          </div>

          {/* Email Snapshot Display */}
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.muted ?? "text-slate-400"}`}
            >
              Email
            </p>
            <p className={`font-semibold text-sm ${activeTheme.text.primary}`}>
              {profile?.email ?? "Not set"}
            </p>
          </div>
        </div>
      </SettingCard>

      {/* Account Edit Modal Window Layer */}
      <AccountEditView
        profile={profile}
        activeTheme={activeTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dispatch={dispatch}
      />
    </>
  );
}
