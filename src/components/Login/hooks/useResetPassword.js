import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";

export function useResetPassword() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ── Synchronize Auth Session Event Lifecycles ───────────────────────────
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data?.session) {
        setReady(true);
        setChecking(false);
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setChecking(false);
      }
    };

    checkSession();

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

  // ── Submit API Transaction Payload ─────────────────────────────────────────
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

  return {
    ready,
    checking,
    loading,
    completed,
    error,
    password,
    setPassword,
    confirm,
    setConfirm,
    handleReset,
  };
}
