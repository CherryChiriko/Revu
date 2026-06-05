import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAppBoot(session) {
  const previousUserIdRef = useRef(null);
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (!userId) {
      previousUserIdRef.current = null;
      return;
    }
    if (previousUserIdRef.current === userId) return;
    previousUserIdRef.current = userId;

    supabase.rpc("refresh_today_availability_for_user", {
      p_user_id: userId,
      p_user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [userId]);
}
