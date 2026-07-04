import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDispatch } from "react-redux";
import { resetAllUserState } from "../app/store";
import { SETTINGS_STORAGE_KEY } from "../slices/settingsSlice";

/**
 * Clears all user-specific localStorage entries before Redux reset.
 * Must run BEFORE resetAllUserState so that loadPersistedSettings()
 * inside settingsSlice doesn't re-hydrate stale values on the next login.
 */
function clearUserLocalStorage() {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (e) {
    console.error("[clearUserLocalStorage] failed:", e);
  }
}

/**
 * Derives a starting username from a Google OAuth user's metadata.
 * Falls back to the email local-part if no display name is present.
 */
function deriveBaseUsername(user) {
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";

  const cleaned = displayName.trim().replace(/\s+/g, "");
  if (cleaned) return cleaned;

  const emailPrefix = user?.email?.split("@")[0] || "user";
  return emailPrefix.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Ensures a `profiles` row exists for the given auth user. Used for
 * Google OAuth sign-ins, which don't go through the manual signup()
 * flow that normally creates this row. If a profile is missing, a
 * username is derived from the Google display name and de-duped
 * against existing usernames (Jane -> Jane2 -> Jane3, etc).
 *
 * No-ops (and returns quickly) for users that already have a profile,
 * so this is safe to call on every SIGNED_IN event.
 */
async function ensureProfileExists(user) {
  if (!user) return;

  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // PGRST116 = no rows found, which is the expected "needs creation" case
    if (existingProfile) return;
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[ensureProfileExists] lookup failed:", fetchError);
      return;
    }

    const baseUsername = deriveBaseUsername(user);
    let candidate = baseUsername;
    let suffix = 2;
    const MAX_ATTEMPTS = 25;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", candidate)
        .maybeSingle();

      if (!taken) break;
      candidate = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username: candidate,
        email: user.email,
        global_streak: 0,
        global_max_streak: 0,
      },
    ]);

    if (insertError) {
      // Ignore duplicate-key races (e.g. duplicate SIGNED_IN events firing
      // ensureProfileExists concurrently) - one of them wins, that's fine.
      if (insertError.code !== "23505") {
        console.error("[ensureProfileExists] insert failed:", insertError);
      }
    }
  } catch (err) {
    console.error("[ensureProfileExists] unexpected error:", err);
  }
}

export default function useAuth() {
  const dispatch = useDispatch();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, data) => {
      if (!mounted) return;

      const nextSession = data?.session ?? null;
      const nextUserId = nextSession?.user?.id || null;

      if (event === "SIGNED_OUT") {
        // Clear localStorage FIRST so resetAllUserState picks up clean defaults
        clearUserLocalStorage();
        dispatch(resetAllUserState());
        currentUserIdRef.current = null;
      } else if (event === "SIGNED_IN") {
        if (nextUserId && nextUserId !== currentUserIdRef.current) {
          // Different user — clear previous user's cached settings before reset
          clearUserLocalStorage();
          dispatch(resetAllUserState());
          currentUserIdRef.current = nextUserId;
        }

        // Safe no-op for existing users; only creates a row for
        // first-time Google OAuth sign-ins that lack a profile.
        if (nextSession?.user) {
          ensureProfileExists(nextSession.user);
        }
      }

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

  const signup = useCallback(async (username, email, password) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (!username || !email || !password)
        throw new Error("All fields are required");
      if (password.length < 6)
        throw new Error("Password must be at least 6 characters");

      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();
      if (existingUser) throw new Error("Username already exists");

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
        await supabase.auth.signInWithPassword({ email, password });
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

  const login = useCallback(async (username, password) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (!username || !password)
        throw new Error("Username and password are required");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();
      if (profileError || !profile)
        throw new Error("Invalid username or password");

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });
      if (signInError) throw signInError;
      if (!authData.session)
        throw new Error("Login failed. Please check your credentials.");

      setSuccessMessage("Login successful!");
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) throw oauthError;
      // Browser redirects to Google here; no session to return yet.
      // ensureProfileExists() picks up profile creation on the
      // SIGNED_IN event once the user lands back in the app.
      return true;
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      setAuthLoading(false);
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (!email) throw new Error("Email is required");
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

  const logout = useCallback(async () => {
    setSession(null);
    currentUserIdRef.current = null;
    setLoading(false);
    setAuthLoading(false);
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handler clears localStorage + Redux
  }, []);

  const deleteAccount = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

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
    loginWithGoogle,
  };
}
