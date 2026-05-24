import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDispatch } from "react-redux";
import { updateGlobalStreakFromRealtime } from "../slices/streakSlice";

export default function useGlobalStatsLiveSync(enabled = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("realtime-daily-user-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_user_stats",
        },
        (payload) => {
          dispatch(updateGlobalStreakFromRealtime(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, dispatch]);
}
