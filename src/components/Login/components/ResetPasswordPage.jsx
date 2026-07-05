import React from "react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";
import { inputCls } from "../../General/ui/FormStyles";

export default function ResetPasswordPage({ activeTheme }) {
  const navigate = useNavigate();

  const {
    ready,
    checking,
    loading,
    completed,
    error,
    password,
    setPassword,
    confirm,
    setConfirm,
    handleReset,
  } = useResetPassword();

  return (
    <div
      className={`h-screen flex items-center justify-center p-4 ${activeTheme.background.app}`}
    >
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-lg border ${activeTheme.background.secondary} ${activeTheme.border.card}`}
      >
        <h1
          className={`text-2xl font-bold mb-6 text-center ${activeTheme.text.primary}`}
        >
          Reset Password
        </h1>

        {/* ── Status View: Checking Session ── */}
        {checking && (
          <p
            className={`text-center text-sm ${activeTheme.text.secondary} animate-pulse`}
          >
            Verifying your reset link...
          </p>
        )}

        {/* ── Status View: Link Expired or Invalid ── */}
        {!checking && !ready && (
          <div className="text-center space-y-4">
            <p className="text-red-400 text-sm font-medium">
              Invalid or expired reset link. Please request a new one.
            </p>
            <a
              href="/"
              className={`${activeTheme.text.accent1} underline text-sm block`}
            >
              Back to login
            </a>
          </div>
        )}

        {/* ── Status View: Password Form ── */}
        {ready && !completed && (
          <form onSubmit={handleReset} className="space-y-5">
            {/* 🌟 Wrap the inputs in a contrasting frame block to give them depth */}
            <div className={`p-2`}>
              <div className="mb-4">
                <label
                  className={`${activeTheme.text.secondary} block mb-2 text-xs font-bold uppercase tracking-wider`}
                >
                  New password
                </label>
                <input
                  type="password"
                  className={inputCls(activeTheme)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label
                  className={`${activeTheme.text.secondary} block mb-2 text-xs font-bold uppercase tracking-wider`}
                >
                  Confirm new password
                </label>
                <input
                  type="password"
                  className={inputCls(activeTheme)}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium px-1">{error}</p>
            )}

            {/* Adjust button sizing to balance the larger input layouts */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-bold text-sm shadow transition-all active:scale-[0.99] ${activeTheme.button.accent2} disabled:opacity-50`}
            >
              {loading ? "Updating…" : "Set new password"}
            </button>
          </form>
        )}

        {/* ── Status View: Form Submission Success ── */}
        {completed && (
          <div className="text-center space-y-4">
            <p className="text-emerald-400 text-sm font-semibold">
              ✓ Password updated successfully.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                activeTheme.button.accent2
              } disabled:opacity-50`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
