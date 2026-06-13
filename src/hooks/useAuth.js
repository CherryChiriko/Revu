import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDispatch } from "react-redux";
import { resetAllUserState } from "../app/store";

export default function useAuth() {
  const dispatch = useDispatch();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Keep track of the current user to prevent redundant state wipes on token refresh
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          const initialSession = data?.session ?? null;
          setSession(initialSession);
          currentUserIdRef.current = initialSession?.user?.id || null;
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

      const nextSession = data?.session ?? null;
      const nextUserId = nextSession?.user?.id || null;

      console.log("[useAuth] onAuthStateChange", {
        event,
        userId: nextUserId,
        sessionExists: !!nextSession,
      });

      // 💥 THE FIX: Only reset the Redux store if the authentication state actually transitioned to a completely different user identity.
      if (event === "SIGNED_OUT") {
        console.log("[useAuth] User signed out. Clearing store.");
        dispatch(resetAllUserState());
        currentUserIdRef.current = null;
      } else if (event === "SIGNED_IN") {
        if (nextUserId && nextUserId !== currentUserIdRef.current) {
          console.log(
            "[useAuth] Genuine new login detected. Resetting store for new user context.",
          );
          dispatch(resetAllUserState());
          currentUserIdRef.current = nextUserId;
        }
      }

      // Update local state safely
      setSession(nextSession);

      if (event === "SIGNED_IN" && !nextSession) {
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (mounted) {
            setSession(sessionData.session ?? null);
            currentUserIdRef.current = sessionData.session?.user?.id || null;
          }
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  // SIGNUP
  const signup = useCallback(async (username, email, password) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!username || !email || !password) {
        throw new Error("All fields are required");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUser) {
        throw new Error("Username already exists");
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: { data: { username } },
        },
      );

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

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

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;
      if (!loginData.session) throw new Error("Login failed after signup");

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();

      if (profileError || !profile) {
        throw new Error("Invalid username or password");
      }

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
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // RESET PASSWORD
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
        },
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
    setSession(null);
    currentUserIdRef.current = null;
    setLoading(false);
    setAuthLoading(false);
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

      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileDeleteError) throw profileDeleteError;

      await supabase.auth.signOut();
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
    loading,
    authLoading,
    error,
    successMessage,
    login,
    signup,
    logout,
    deleteAccount,
    resetPassword,
  };
}
