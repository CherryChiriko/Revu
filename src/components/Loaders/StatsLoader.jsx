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
      await supabase.rpc("ensure_today_stats_for_user", {
        p_user_id: session.user.id,
      });

      dispatch(fetchDailyStreakStats());
      dispatch(fetchDailyActivity());
    };

    run();
  }, [authLoading, session, dispatch]);

  return null;
}
