import { useState } from "react";
import useAuth from "../../../hooks/useAuth";

export function useLogin() {
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

  const clearInputs = () => {
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const switchToResetMode = () => {
    setIsSigningUp(false);
    setIsResetting(true);
    clearInputs();
  };

  const exitResetMode = () => {
    setIsResetting(false);
    setIsSigningUp(false);
    clearInputs();
  };

  const handleToggleMode = () => {
    setIsSigningUp((prev) => !prev);
    setIsResetting(false);
    clearInputs();
  };

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

  return {
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
  };
}
