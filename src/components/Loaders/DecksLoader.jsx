import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchDecks, fetchDeckCounts } from "../../slices/deckSlice";
import { supabase } from "../../utils/supabaseClient";

export default function DecksLoader({ session, authLoading }) {
  const dispatch = useDispatch();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (authLoading || !session) return;
    if (hasRunRef.current) return;

    hasRunRef.current = true;

    const run = async () => {
      try {
        // 1. Refresh daily stats ONCE
        await supabase.rpc("refresh_daily_stats_for_user", {
          p_user_id: session.user.id,
          p_user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (err) {
        console.error("Failed to refresh daily stats", err);
      }

      // 2. Load decks
      dispatch(fetchDecks());
      dispatch(fetchDeckCounts({ user_id: session.user.id }));
    };

    run();
  }, [authLoading, session, dispatch]);

  return null;
}
