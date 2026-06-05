import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchDecks } from "../../slices/deckSlice";
import { supabase } from "../../utils/supabaseClient";

export default function DecksLoader({ session, authLoading }) {
  const dispatch = useDispatch();
  const previousUserIdRef = useRef(null);
  const userId = session?.user?.id || null;

  useEffect(() => {
    console.log(
      "[DecksLoader] authLoading",
      authLoading,
      "userId",
      userId,
      "previousUserId",
      previousUserIdRef.current,
    );

    if (authLoading || !userId) {
      previousUserIdRef.current = null;
      return;
    }

    if (previousUserIdRef.current === userId) return;
    previousUserIdRef.current = userId;

    const run = async () => {
      try {
        // 1. Refresh daily stats ONCE
        await supabase.rpc("refresh_daily_stats_for_user", {
          p_user_id: userId,
          p_user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (err) {
        console.error("Failed to refresh daily stats", err);
      }

      // 2. Load decks and deck counts from the same response
      console.log("[DecksLoader] dispatching fetchDecks for user", userId);
      dispatch(fetchDecks({ user_id: userId }));
    };

    run();
  }, [authLoading, userId, dispatch]);

  return null;
}
