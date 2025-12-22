import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDailyStreakStats } from "../../slices/streakSlice";
import { fetchDailyActivity } from "../../slices/activitySlice";

export default function StatsLoader({ session, authLoading }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (authLoading || !session) return;
    dispatch(fetchDailyStreakStats());
    dispatch(fetchDailyActivity());
  }, [authLoading, session, dispatch]);

  return null;
}
