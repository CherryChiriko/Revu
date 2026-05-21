import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const ResetPasswordPage = ({ activeTheme }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Extract token from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setError("Invalid or expired reset link.");
      return;
    }

    setToken(accessToken);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT: Supabase automatically uses the token in the URL.
      // No need to manually pass it.
      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess("Your password has been reset successfully.");
      setCompleted(true);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen flex items-center justify-center ${activeTheme.background.app}`}
    >
      <div
        className={`w-full max-w-md p-6 rounded-lg shadow-md ${activeTheme.background.secondary} ${activeTheme.border.card}`}
      >
        <h1
          className={`text-2xl font-bold mb-4 text-center ${activeTheme.text.primary}`}
        >
          Reset Password
        </h1>

        {!token && (
          <p className="text-red-500 text-center">
            Invalid or expired reset link.
          </p>
        )}

        {token && !completed && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 font-semibold`}
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 font-semibold`}
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-2 rounded ${activeTheme.button.accent2} ${activeTheme.text.primary} disabled:opacity-50`}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {completed && (
          <div className="text-center space-y-3">
            <p className="text-green-500 text-sm">
              Your password has been updated.
            </p>

            <button
              className={`${activeTheme.text.accent1} underline`}
              onClick={() => (window.location.href = "/login")}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
