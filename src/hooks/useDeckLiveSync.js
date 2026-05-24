import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDispatch } from "react-redux";
import { updateDeckStatsFromRealtime } from "../slices/deckSlice";

export default function useDeckLiveSync(enabled = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("realtime-daily-deck-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_deck_stats",
        },
        (payload) => {
          dispatch(updateDeckStatsFromRealtime(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, dispatch]);
}
