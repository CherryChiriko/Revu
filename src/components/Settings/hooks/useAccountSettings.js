import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { updateLocalProfile } from "../../../slices/userSlice";

export function useAccountSettings(profile, dispatch) {
  // ── Username State ──
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const handleSaveUsername = async () => {
    const clean = username.trim();
    if (!clean) return setUsernameError("Username cannot be empty.");
    if (clean === profile?.username)
      return setUsernameError("That's already your username.");
    if (clean.length < 3)
      return setUsernameError("Must be at least 3 characters.");

    setUsernameError(null);
    setUsernameStatus("saving");
    try {
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

  // ── Email State ──
  const [email, setEmail] = useState(profile?.email ?? "");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);

  const handleSaveEmail = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) return setEmailError("Email cannot be empty.");
    if (clean === profile?.email)
      return setEmailError("That's already your email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
      return setEmailError("Enter a valid email address.");

    setEmailError(null);
    setEmailSuccess(null);
    setEmailStatus("saving");
    try {
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

  // ── Password State ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword)
      return setPasswordError("Enter your current password.");
    if (newPassword.length < 6)
      return setPasswordError("New password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setPasswordError("Passwords do not match.");
    if (newPassword === currentPassword)
      return setPasswordError("New password must differ from current.");

    setPasswordStatus("saving");
    try {
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

  return {
    username,
    setUsername,
    usernameStatus,
    usernameError,
    handleSaveUsername,
    email,
    setEmail,
    emailStatus,
    emailError,
    emailSuccess,
    handleSaveEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordStatus,
    passwordError,
    passwordSuccess,
    handleSavePassword,
  };
}
