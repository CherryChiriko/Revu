import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDailyStreakStats } from "../../slices/streakSlice";
import { fetchDailyActivity } from "../../slices/activitySlice";
import { supabase } from "../../utils/supabaseClient";

export default function StatsLoader({ session, authLoading }) {
  const dispatch = useDispatch();
  const userId = session?.user?.id || null;

  useEffect(() => {
    console.log("[StatsLoader] authLoading", authLoading, "userId", userId);
    if (authLoading || !userId) return;

    const run = async () => {
      try {
        // Resolve the user's current local timezone string (e.g., "America/New_York")
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Supply both arguments required by your canonical SQL migration script
        const { error } = await supabase.rpc("ensure_today_stats_for_user", {
          p_user_id: userId,
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
        console.log(
          "[StatsLoader] dispatching daily stats fetches for user",
          userId,
        );
        dispatch(fetchDailyStreakStats({ user_id: userId }));
        dispatch(fetchDailyActivity({ user_id: userId }));
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
