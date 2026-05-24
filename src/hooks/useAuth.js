import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load initial session + subscribe to changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data?.session ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to get session:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, data) => {
      if (!mounted) return;

      // Always update session from the callback data first
      setSession(data?.session ?? null);

      // For SIGNED_IN, data.session might be undefined due to timing
      // We'll do a follow-up check if needed
      if (event === "SIGNED_IN" && !data.session) {
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (mounted) {
            setSession(sessionData.session ?? null);
          }
        });
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // SIGNUP
  const signup = useCallback(async (username, email, password) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validation
      if (!username || !email || !password) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check username uniqueness
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: { username },
          },
        }
      );

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create profile record
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          username,
          email,
          global_streak: 0,
          global_max_streak: 0,
        },
      ]);

      if (profileError) throw profileError;

      setSuccessMessage("Account created successfully! Logging you in...");

      // Auto-login after signup
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;
      if (!loginData.session) throw new Error("Login failed after signup");

      // Session update will trigger via onAuthStateChange
      return true;
    } catch (err) {
      setError(err.message || "Signup failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // LOGIN
  const login = useCallback(async (username, password) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Lookup email by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();

      if (profileError || !profile) {
        throw new Error("Invalid username or password");
      }

      // Login with email + password
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });

      if (signInError) throw signInError;
      if (!authData.session) {
        throw new Error("Login failed. Please check your credentials.");
      }

      setSuccessMessage("Login successful!");

      // Session update will trigger via onAuthStateChange
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // RESET PASSWORD (send email)
  const resetPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSuccessMessage("Password reset email sent. Check your inbox.");
      return true;
    } catch (err) {
      setError(err.message || "Failed to send reset email");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // DELETE ACCOUNT
  const deleteAccount = useCallback(async () => {
    setAuthLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No user logged in");
      }

      // Delete profile
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileDeleteError) throw profileDeleteError;

      // Sign out
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setSuccessMessage("Account deleted successfully");
      return true;
    } catch (err) {
      setError(err.message || "Failed to delete account");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  return {
    session,
    loading, // initial session check
    authLoading, // login/signup/delete in progress
    error,
    successMessage,
    login,
    signup,
    logout,
    deleteAccount,
    resetPassword,
  };
}
