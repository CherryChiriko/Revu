// src/components/Auth/views/LoginPage.jsx
import React from "react";
import { useLogin } from "../hooks/useLogin";
import { inputCls } from "../../General/ui/FormStyles";
import LoadingSpinner from "../../General/ui/LoadingSpinner";

const LoginPage = ({ activeTheme }) => {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    isSigningUp,
    isResetting,
    authLoading,
    error,
    successMessage,
    loginWithGoogle,
    handleSubmit,
    switchToResetMode,
    exitResetMode,
    handleToggleMode,
  } = useLogin();

  return (
    <div
      className={`min-h-[100dvh] flex flex-col items-center justify-center p-4 ${activeTheme.background.app}`}
    >
      {authLoading ? (
        <>
          <LoadingSpinner />
        </>
      ) : (
        <>
          <div
            className={`w-full max-w-md border shadow-xl rounded-2xl p-5 md:p-6 ${activeTheme.background.secondary} ${activeTheme.border.card}`}
          >
            <h2
              className={`text-lg md:text-xl ${activeTheme.text.primary} font-bold mb-4 md:mb-6 text-center`}
            >
              {isResetting
                ? "Reset Password"
                : isSigningUp
                  ? "Sign Up"
                  : "Login"}
            </h2>

            {!isResetting && (
              <>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  disabled={authLoading}
                  className={`w-full flex items-center justify-center gap-2 border py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${activeTheme.border.card} ${activeTheme.background.canvas} ${activeTheme.text.primary}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    className="shrink-0"
                  >
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

                <div className="flex items-center gap-3 mt-4">
                  <div className={`flex-1 h-px ${activeTheme.border.card}`} />
                  <span
                    className={`text-[10px] font-bold tracking-widest ${activeTheme.text.secondary}`}
                  >
                    OR
                  </span>
                  <div className={`flex-1 h-px ${activeTheme.border.card}`} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-4">
                {!isResetting && (
                  <div>
                    <label
                      className={`${activeTheme.text.secondary} block mb-1.5 text-xs font-bold uppercase tracking-wider`}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      className={`${inputCls(activeTheme)} text-base md:text-sm`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required={!isResetting}
                    />
                  </div>
                )}

                {(isSigningUp || isResetting) && (
                  <div>
                    <label
                      className={`${activeTheme.text.secondary} block mb-1.5 text-xs font-bold uppercase tracking-wider`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className={`${inputCls(activeTheme)} text-base md:text-sm`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                )}

                {!isResetting && (
                  <div>
                    <label
                      className={`${activeTheme.text.secondary} block mb-1.5 text-xs font-bold uppercase tracking-wider`}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      className={`${inputCls(activeTheme)} text-base md:text-sm`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required={!isResetting}
                    />
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-xs font-medium px-1">{error}</p>
              )}
              {successMessage && (
                <p className="text-emerald-400 text-xs font-medium px-1">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                className={`w-full mt-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all active:scale-[0.98] disabled:opacity-50 ${activeTheme?.button?.accent2 || "bg-indigo-600 text-white"}`}
              >
                {isResetting
                  ? "Send Reset Email"
                  : isSigningUp
                    ? "Sign Up"
                    : "Login"}
              </button>
            </form>

            <div className="mt-5 space-y-3 text-center">
              {!isResetting && !isSigningUp && (
                <button
                  className={`${activeTheme.text.accent1} underline text-xs font-medium`}
                  onClick={switchToResetMode}
                >
                  Forgot password?
                </button>
              )}

              {isResetting && (
                <button
                  className={`${activeTheme.text.accent1} hover:underline font-semibold text-xs`}
                  onClick={exitResetMode}
                >
                  Back to Login
                </button>
              )}

              {!isResetting && (
                <button
                  className={`${activeTheme.text.accent1} hover:underline font-semibold text-xs block w-full`}
                  onClick={handleToggleMode}
                >
                  {isSigningUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign Up"}
                </button>
              )}
            </div>
          </div>
          <span
            className={`mt-4 text-xs font-medium opacity-60 tracking-wide ${activeTheme.text.primary} text-center`}
          >
            Demo: Username "guest" / Password "guest123"
          </span>
        </>
      )}
    </div>
  );
};

export default LoginPage;
