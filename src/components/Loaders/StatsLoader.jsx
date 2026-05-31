import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDailyStreakStats } from "../../slices/streakSlice";
import { fetchDailyActivity } from "../../slices/activitySlice";
import { supabase } from "../../utils/supabaseClient";

export default function StatsLoader({ session, authLoading }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (authLoading || !session) return;

    const run = async () => {
      try {
        // Resolve the user's current local timezone string (e.g., "America/New_York")
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Supply both arguments required by your canonical SQL migration script
        const { error } = await supabase.rpc("ensure_today_stats_for_user", {
          p_user_id: session.user.id,
          p_user_timezone: userTimezone,
        });

        if (error) {
          console.error(
            "[StatsLoader] RPC Error executing state setup:",
            error,
          );
          return;
        }

        // Proceed with Redux state updates once metrics rows are successfully initialized
        dispatch(fetchDailyStreakStats());
        dispatch(fetchDailyActivity());
      } catch (err) {
        console.error(
          "[StatsLoader] Failed to safely load current day statistics:",
          err,
        );
      }
    };

    run();
  }, [authLoading, session, dispatch]);

  return null;
}
