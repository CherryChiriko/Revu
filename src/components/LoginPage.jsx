import React, { useState } from "react";
import useAuth from "../hooks/useAuth";

const LoginPage = ({ activeTheme }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { authLoading, error, successMessage, login, signup, resetPassword } =
    useAuth();

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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
            className={`w-full ${activeTheme.button.accent2} ${activeTheme.text.primary} mt-4 py-2 rounded transition disabled:opacity-50`}
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
    </div>
  );
};

export default LoginPage;
