/**
 * ResetPasswordPage.jsx
 *
 * Fix (v2): Supabase's client has `detectSessionInUrl` enabled (required for
 * the Google OAuth flow), which means it automatically reads the recovery
 * tokens out of the URL hash (#access_token=...&type=recovery) and
 * establishes a session BEFORE this component's own effects run — and it
 * strips the hash from the URL in the process.
 *
 * That means by the time we mount, there's nothing left in the hash to
 * parse manually. The old approach of reading window.location.hash here
 * always found an empty hash and incorrectly reported "invalid or expired
 * link," even though Supabase had already signed the user in successfully.
 *
 * Correct flow now:
 * 1. On mount, just ask Supabase for the current session directly.
 * 2. If one exists, we're ready — Supabase already validated the recovery
 *    token for us.
 * 3. Also listen for onAuthStateChange in case the session resolves a beat
 *    after mount (e.g. slow network), so we don't flash an error first.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function ResetPasswordPage({ activeTheme }) {
  const [ready, setReady] = useState(false); // session established
  const [checking, setChecking] = useState(true); // still checking for a session
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ── Check for the session Supabase already established ────────────────────
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data?.session) {
        setReady(true);
        setChecking(false);
        // Clean any leftover hash/query params out of the URL bar (cosmetic)
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setChecking(false);
      }
    };

    checkSession();

    // Covers the case where the session resolves just after mount.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session) {
        setReady(true);
        setChecking(false);
        window.history.replaceState(null, "", window.location.pathname);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
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

        {/* Still checking for a session — avoid flashing the error state */}
        {checking && (
          <p
            className={`text-center text-sm ${activeTheme.text.secondary} animate-pulse`}
          >
            Verifying your reset link...
          </p>
        )}

        {/* No session found after checking */}
        {!checking && !ready && (
          <div className="text-center space-y-4">
            <p className="text-red-400 text-sm">
              Invalid or expired reset link. Please request a new one.
            </p>
            <a
              href="/"
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
              href="/"
              className={`${activeTheme.text.accent1} underline text-sm`}
            >
              Continue
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
