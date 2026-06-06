/**
 * ResetPasswordPage.jsx
 *
 * Fix: Supabase delivers the reset token in the URL **hash** (#access_token=...),
 * not query params (?access_token=...). The old code used URLSearchParams on
 * window.location.search, which always returned null.
 *
 * Correct flow:
 * 1. Parse the hash fragment for access_token + refresh_token.
 * 2. Call supabase.auth.setSession() so the client is authenticated.
 * 3. Only then allow supabase.auth.updateUser({ password }) to succeed.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ResetPasswordPage({ activeTheme }) {
  const [ready, setReady] = useState(false); // session established
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ── Parse hash and establish session ──────────────────────────────────────
  useEffect(() => {
    // Hash looks like: #access_token=xxx&refresh_token=yyy&type=recovery&...
    const hash = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || type !== "recovery") {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    // Establish an authenticated session from the recovery tokens.
    // Without this, updateUser() will fail with "not authenticated".
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
      })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setReady(true);
          // Clean the tokens out of the URL bar (cosmetic + security)
          window.history.replaceState(null, "", window.location.pathname);
        }
      });
  }, []);

  // ── Submit new password ────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setCompleted(true);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputCls = `w-full border rounded-lg px-3 py-2 ${activeTheme.border.card} ${activeTheme.background.canvas} ${activeTheme.text.primary} focus:outline-none focus:ring-2 focus:ring-sky-500`;

  return (
    <div
      className={`h-screen flex items-center justify-center ${activeTheme.background.app}`}
    >
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-lg ${activeTheme.background.secondary} border ${activeTheme.border.card}`}
      >
        <h1
          className={`text-2xl font-bold mb-6 text-center ${activeTheme.text.primary}`}
        >
          Reset Password
        </h1>

        {/* Error with no valid token */}
        {!ready && error && (
          <div className="text-center space-y-4">
            <p className="text-red-400 text-sm">{error}</p>
            <a
              href="/login"
              className={`${activeTheme.text.accent1} underline text-sm`}
            >
              Back to login
            </a>
          </div>
        )}

        {/* Form */}
        {ready && !completed && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 text-sm font-semibold`}
              >
                New password
              </label>
              <input
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 text-sm font-semibold`}
              >
                Confirm new password
              </label>
              <input
                type="password"
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-2 rounded-lg font-semibold ${activeTheme.button.accent2} disabled:opacity-50`}
            >
              {loading ? "Updating…" : "Set new password"}
            </button>
          </form>
        )}

        {/* Success */}
        {completed && (
          <div className="text-center space-y-4">
            <p className="text-emerald-400 text-sm font-semibold">
              ✓ Password updated successfully.
            </p>
            <a
              href="/login"
              className={`${activeTheme.text.accent1} underline text-sm`}
            >
              Go to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
