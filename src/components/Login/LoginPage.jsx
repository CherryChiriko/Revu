import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";

const LoginPage = ({ activeTheme }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    authLoading,
    error,
    successMessage,
    login,
    signup,
    resetPassword,
    loginWithGoogle,
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isResetting) {
      await resetPassword(email);
      return;
    }

    if (isSigningUp) {
      await signup(username, email, password);
    } else {
      await login(username, password);
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // On success, Supabase redirects the browser to Google immediately,
    // so there's nothing further to do here.
  };

  const switchToResetMode = () => {
    setIsSigningUp(false);
    setIsResetting(true);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const exitResetMode = () => {
    setIsResetting(false);
    setIsSigningUp(false);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleToggleMode = () => {
    setIsSigningUp(!isSigningUp);
    setIsResetting(false);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${activeTheme.background.app}`}
    >
      <div
        className={`w-full max-w-md ${activeTheme.background.secondary} ${activeTheme.border.card} shadow-md rounded-lg p-6`}
      >
        <h2
          className={`text-2xl ${activeTheme.text.primary} font-bold mb-4 text-center`}
        >
          {isResetting ? "Reset Password" : isSigningUp ? "Sign Up" : "Login"}
        </h2>

        {/* Google OAuth (not shown in reset-password mode) */}
        {!isResetting && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className={`w-full flex items-center justify-center gap-2 border ${activeTheme.border.card} ${activeTheme.background.canvas} ${activeTheme.text.primary} py-2 rounded transition disabled:opacity-50 hover:opacity-90`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.94.47 3.77 1.29 5.37l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className={`flex-1 h-px ${activeTheme.border.card}`} />
              <span className={`text-xs ${activeTheme.text.secondary}`}>
                OR
              </span>
              <div className={`flex-1 h-px ${activeTheme.border.card}`} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (login + signup) */}
          {!isResetting && (
            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 font-semibold`}
              >
                Username
              </label>
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 ${activeTheme.background.canvas} ${activeTheme.text.primary}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required={!isResetting}
              />
            </div>
          )}

          {/* Email (signup + reset password) */}
          {(isSigningUp || isResetting) && (
            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 font-semibold`}
              >
                Email
              </label>
              <input
                type="email"
                className={`w-full border rounded px-3 py-2 ${activeTheme.background.canvas} ${activeTheme.text.primary}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {/* Password (not used for reset mode) */}
          {!isResetting && (
            <div>
              <label
                className={`${activeTheme.text.secondary} block mb-1 font-semibold`}
              >
                Password
              </label>
              <input
                type="password"
                className={`w-full border rounded px-3 py-2 ${activeTheme.background.canvas} ${activeTheme.text.primary}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required={!isResetting}
              />
            </div>
          )}

          {/* Messages */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full ${activeTheme.button.accent2} mt-4 py-2 rounded transition disabled:opacity-50`}
          >
            {authLoading
              ? "Loading..."
              : isResetting
                ? "Send Reset Email"
                : isSigningUp
                  ? "Sign Up"
                  : "Login"}
          </button>
        </form>

        {/* Secondary options */}
        {!isResetting && !isSigningUp && (
          <div className="text-center mt-3">
            <button
              className={`${activeTheme.text.accent1} underline`}
              onClick={switchToResetMode}
            >
              Forgot password?
            </button>
          </div>
        )}

        {isResetting && (
          <div className="text-center mt-4">
            <button
              className={`${activeTheme.text.accent1} hover:underline`}
              onClick={exitResetMode}
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          {!isResetting && (
            <button
              className={`${activeTheme.text.accent1} hover:underline`}
              onClick={handleToggleMode}
            >
              {isSigningUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>
      <span className={`mt-2 ${activeTheme.text.primary}`}>
        Demo only: Username - "guest", Password - "guest123"
      </span>
    </div>
  );
};

export default LoginPage;
