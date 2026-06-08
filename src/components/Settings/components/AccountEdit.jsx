import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { supabase } from "../../../utils/supabaseClient";
import { SettingCard } from "../SettingsTemplates";
import { updateLocalProfile } from "../../../slices/userSlice";
import { faCheck, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FieldRow } from "../SettingsTemplates";
// ─────────────────────────────────────────────────────────────────────────────
// Section: Account (username · email · password)
// ─────────────────────────────────────────────────────────────────────────────
export function AccountEdit({ profile, activeTheme, dispatch }) {
  // ── Username ───────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameError, setUsernameError] = useState(null);

  // Keep input in sync if profile loads after mount
  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const handleSaveUsername = async () => {
    const clean = username.trim();
    if (!clean) {
      setUsernameError("Username cannot be empty.");
      return;
    }
    if (clean === profile?.username) {
      setUsernameError("That's already your username.");
      return;
    }
    if (clean.length < 3) {
      setUsernameError("Must be at least 3 characters.");
      return;
    }

    setUsernameError(null);
    setUsernameStatus("saving");
    try {
      // Check uniqueness (exclude self)
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", profile.id)
        .maybeSingle();

      if (existing) throw new Error("That username is already taken.");

      const { error } = await supabase
        .from("profiles")
        .update({ username: clean })
        .eq("id", profile.id);
      if (error) throw error;

      dispatch(updateLocalProfile({ username: clean }));
      setUsernameStatus("saved");
      setTimeout(() => setUsernameStatus("idle"), 2000);
    } catch (err) {
      setUsernameError(err.message);
      setUsernameStatus("error");
    }
  };

  // ── Email ──────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState(profile?.email ?? "");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  const handleSaveEmail = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      setEmailError("Email cannot be empty.");
      return;
    }
    if (clean === profile?.email) {
      setEmailError("That's already your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError(null);
    setEmailSuccess(null);
    setEmailStatus("saving");
    try {
      // updateUser sends a confirmation email to the NEW address automatically.
      // The change only takes effect after the user clicks the link — Supabase handles this.
      const { error } = await supabase.auth.updateUser({ email: clean });
      if (error) throw error;

      setEmailSuccess(
        `Confirmation sent to ${clean}. Your email will update once you click the link.`,
      );
      setEmailStatus("saved");
      setTimeout(() => setEmailStatus("idle"), 4000);
    } catch (err) {
      setEmailError(err.message);
      setEmailStatus("error");
    }
  };

  // ── Password ───────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("New password must differ from current.");
      return;
    }

    setPasswordStatus("saving");
    try {
      // Re-authenticate with current password to verify identity
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (reAuthError) throw new Error("Current password is incorrect.");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setPasswordSuccess("Password updated successfully.");
      setPasswordStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordStatus("idle");
        setPasswordSuccess(null);
      }, 3000);
    } catch (err) {
      setPasswordError(err.message);
      setPasswordStatus("error");
    }
  };

  return (
    <SettingCard icon={faUser} title="Account" activeTheme={activeTheme}>
      <div className="space-y-4">
        {/* Username */}
        <FieldRow
          label="Username"
          inputProps={{
            type: "text",
            value: username,
            onChange: (e) => {
              setUsername(e.target.value);
              setUsernameStatus("idle");
              setUsernameError(null);
            },
            placeholder: "your_username",
            autoComplete: "off",
          }}
          onSave={handleSaveUsername}
          saveLabel="Update"
          status={usernameStatus}
          error={usernameError}
          activeTheme={activeTheme}
        />

        {/* Email */}
        <FieldRow
          label="Email"
          inputProps={{
            type: "email",
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
              setEmailStatus("idle");
              setEmailError(null);
              setEmailSuccess(null);
            },
            placeholder: "you@example.com",
            autoComplete: "off",
          }}
          onSave={handleSaveEmail}
          saveLabel="Update"
          status={emailStatus}
          error={emailError}
          success={emailSuccess}
          activeTheme={activeTheme}
        />

        {/* Password — three sub-fields stacked, single save button */}
        <div className={`rounded-xl p-4 ${activeTheme.background.canvas}`}>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.secondary} mb-3`}
          >
            <FontAwesomeIcon icon={faLock} className="mr-1.5" />
            Change Password
          </p>
          <div className="space-y-2">
            {[
              {
                placeholder: "Current password",
                value: currentPassword,
                setter: setCurrentPassword,
              },
              {
                placeholder: "New password",
                value: newPassword,
                setter: setNewPassword,
              },
              {
                placeholder: "Confirm new password",
                value: confirmPassword,
                setter: setConfirmPassword,
              },
            ].map(({ placeholder, value, setter }) => (
              <input
                key={placeholder}
                type="password"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  setPasswordStatus("idle");
                  setPasswordError(null);
                }}
                autoComplete="new-password"
                className={`w-full rounded-lg px-3 py-2 text-sm border ${activeTheme.border.card} ${activeTheme.background.secondary} ${activeTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            ))}
          </div>
          {passwordError && (
            <p className="text-red-400 text-xs mt-2">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-emerald-400 text-xs mt-2">{passwordSuccess}</p>
          )}
          <button
            type="button"
            onClick={handleSavePassword}
            disabled={passwordStatus === "saving"}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold ${
              passwordStatus === "saved"
                ? "bg-emerald-600/20 text-emerald-400"
                : passwordStatus === "error"
                  ? "bg-red-600/20 text-red-400"
                  : activeTheme.button.accent2
            } disabled:opacity-50`}
          >
            {passwordStatus === "saved" && (
              <FontAwesomeIcon icon={faCheck} className="mr-1" />
            )}
            {
              {
                idle: "Update password",
                saving: "Saving…",
                saved: "Updated ✓",
                error: "Try again",
              }[passwordStatus]
            }
          </button>
        </div>
      </div>
    </SettingCard>
  );
}
