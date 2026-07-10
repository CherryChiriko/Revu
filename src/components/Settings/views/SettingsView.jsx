import React from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../hooks/useAuth";
import { selectActiveTheme } from "../../../slices/themeSlice";
import { selectUserProfile } from "../../../slices/userSlice";
import { selectSettings } from "../../../slices/settingsSlice";
import { AvatarDisplay } from "../../General/ui/AvatarDisplay";
import Header from "../../General/ui/Header";

export default function SettingsView() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ── Header ── */}
        <Header
          title="Settings"
          activeTheme={activeTheme}
          leftElement={
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow">
              <AvatarDisplay
                settings={settings}
                username={profile?.username}
                className="w-full h-full text-2xl"
              />
            </div>
          }
          description={profile?.username ? `@${profile.username}` : undefined}
          rightElement={
            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${activeTheme.button.danger} font-semibold transition-colors`}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Logout
            </button>
          }
        />

        <Outlet />
      </div>
    </div>
  );
}
