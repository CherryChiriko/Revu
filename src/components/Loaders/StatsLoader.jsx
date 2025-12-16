import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDailyStreakStats } from "../../slices/streakSlice";

export default function StatsLoader({ session, authLoading }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (authLoading || !session) return;

    // Simply fetch the daily streak stats; backend handles state computation
    dispatch(fetchDailyStreakStats());
  }, [authLoading, session, dispatch]);

  return null;
}
