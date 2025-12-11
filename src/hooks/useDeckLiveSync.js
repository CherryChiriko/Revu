import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDispatch } from "react-redux";
import { updateDeckFromRealtime } from "../slices/deckSlice";

export default function useDeckLiveSync(enabled = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("realtime-decks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "decks",
        },
        (payload) => {
          // update Redux with new deck row
          dispatch(updateDeckFromRealtime(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, dispatch]);
}
