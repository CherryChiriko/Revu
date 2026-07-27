import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useAccountSettings } from "../hooks/useAccountSettings";
import { inputCls } from "../../General/ui/FormField";
import { ModalTemplate } from "../../General/ui/ModalTemplate";
import { FormField } from "../../General/ui/FormField";

export default function AccountEditView({
  profile,
  activeTheme,
  isOpen,
  onClose,
  dispatch,
}) {
  const state = useAccountSettings(profile, dispatch);
  const baseInputCls = inputCls(activeTheme);

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      subtitle="Update your security login credentials and application identity."
      activeTheme={activeTheme}
    >
      <div className="space-y-5">
        {/* Username field shell encapsulation */}
        <FormField
          label="Username"
          error={state.usernameError}
          hint={state.usernameStatus === "saved" ? "Username updated ✓" : null}
          activeTheme={activeTheme}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={state.username}
              onChange={(e) => {
                state.setUsername(e.target.value);
                state.setUsernameStatus("idle");
                state.setUsernameError(null);
              }}
              className={`${baseInputCls} flex-1`}
            />
            <button
              onClick={state.handleSaveUsername}
              disabled={state.usernameStatus === "saving"}
              className={`px-4 rounded-xl text-xs font-bold transition-all ${activeTheme.button.accent2} disabled:opacity-50`}
            >
              {state.usernameStatus === "saving" ? "..." : "Update"}
            </button>
          </div>
        </FormField>

        {/* Email field shell encapsulation */}
        <FormField
          label="Email Address"
          error={state.emailError}
          hint={state.emailSuccess}
          activeTheme={activeTheme}
        >
          <div className="flex gap-2">
            <input
              type="email"
              value={state.email || profile?.email || ""}
              onChange={(e) => {
                state.setEmail(e.target.value);
                state.setEmailStatus("idle");
                state.setEmailError(null);
                state.setEmailSuccess(null);
              }}
              className={`${baseInputCls} flex-1`}
            />
            <button
              onClick={state.handleSaveEmail}
              disabled={state.emailStatus === "saving"}
              className={`px-4 rounded-xl text-xs font-bold transition-all ${activeTheme.button.accent2} disabled:opacity-50`}
            >
              {state.emailStatus === "saving" ? "..." : "Update"}
            </button>
          </div>
        </FormField>

        {/* Password field shell encapsulation */}
        <FormField
          label="Change Password"
          error={state.passwordError}
          hint={state.passwordSuccess}
          activeTheme={activeTheme}
        >
          <div className="flex flex-col gap-2.5">
            {[
              {
                placeholder: "Current password",
                value: state.currentPassword,
                setter: state.setCurrentPassword,
              },
              {
                placeholder: "New password",
                value: state.newPassword,
                setter: state.setNewPassword,
              },
              {
                placeholder: "Confirm new password",
                value: state.confirmPassword,
                setter: state.setConfirmPassword,
              },
            ].map(({ placeholder, value, setter }) => (
              <input
                key={placeholder}
                type="password"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  state.setPasswordStatus("idle");
                  state.setPasswordError(null);
                }}
                autoComplete="new-password"
                className={baseInputCls}
              />
            ))}

            <button
              type="button"
              onClick={state.handleSavePassword}
              disabled={state.passwordStatus === "saving"}
              className={`w-full mt-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all
                ${
                  state.passwordStatus === "saved"
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : state.passwordStatus === "error"
                      ? "bg-red-600/20 text-red-400 border border-red-500/30"
                      : activeTheme.button.accent2
                } disabled:opacity-50`}
            >
              {state.passwordStatus === "saved" && (
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              )}
              {state.passwordStatus === "saving"
                ? "Saving…"
                : state.passwordStatus === "saved"
                  ? "Updated"
                  : "Update password"}
            </button>
          </div>
        </FormField>
      </div>
    </ModalTemplate>
  );
}
