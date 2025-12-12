import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDecks, selectDeckStatus } from "../../slices/deckSlice";
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
    };

    run();
  }, [authLoading, session, status, dispatch]);

  return null;
}
