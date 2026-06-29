import React, { useState } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { SettingCard } from "../SettingsTemplates";
import AccountEditView from "../views/AccountEditView"; // Path to your new modal component

export function AccountSection({ profile, activeTheme, dispatch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SettingCard icon={faUser} title="Account" activeTheme={activeTheme}>
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

        {/* Action Button Segment Layer formatted exactly like the SettingCard footer wrapper */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors active:scale-[0.99] ${activeTheme.button.accent2}`}
          >
            Manage account
          </button>
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
