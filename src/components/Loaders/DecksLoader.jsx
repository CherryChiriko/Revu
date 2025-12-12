import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDecks,
  selectDeckStatus,
  fetchDeckCounts,
} from "../../slices/deckSlice";
// import { fetchDeckCounts } from "../../slices/cardSlice";
import { supabase } from "../../utils/supabaseClient";

export default function DecksLoader({ session, authLoading }) {
  const dispatch = useDispatch();
  const status = useSelector(selectDeckStatus);

  useEffect(() => {
    const run = async () => {
      if (authLoading || !session) return;

      // 1. Call the RPC to refresh daily stats
      try {
        await supabase.rpc("refresh_daily_stats");
      } catch (err) {
        console.error("Failed to refresh daily stats", err);
      }

      // 2. THEN fetch decks
      dispatch(fetchDecks());
      dispatch(fetchDeckCounts({ user_id: session.user.id }));
    };

    run();
  }, [authLoading, session, status, dispatch]);

  return null;
}
