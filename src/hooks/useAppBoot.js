import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAppBoot(session) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    if (ranRef.current) return;

    ranRef.current = true;

    supabase.rpc("refresh_today_availability_for_user", {
      p_user_id: session.user.id,
      p_user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [session]);
}
