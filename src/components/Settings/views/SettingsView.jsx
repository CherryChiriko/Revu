import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../hooks/useAuth";
import { selectActiveTheme } from "../../../slices/themeSlice";
import { selectUserProfile } from "../../../slices/userSlice";
import {
  selectSettings,
  hydrateFromProfile,
} from "../../../slices/settingsSlice";

export default function SettingsView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);

  // Hydrate study limits from profile once it's loaded
  useEffect(() => {
    if (profile) dispatch(hydrateFromProfile(profile));
  }, [profile, dispatch]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Mini avatar preview in header */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-2xl font-black text-white shadow"
                style={{
                  backgroundColor: settings.avatarUrl
                    ? "transparent"
                    : settings.profileColor,
                }}
              >
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : settings.profileIcon.length > 1 ? (
                  settings.profileIcon
                ) : (
                  (profile?.username?.[0] ?? "R").toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Settings
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${activeTheme.button.danger} font-semibold`}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Logout
            </button>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
