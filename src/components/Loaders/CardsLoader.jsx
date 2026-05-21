import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../../utils/supabaseClient";
import { fetchCards } from "../../slices/cardSlice";

export default function CardsLoader({ activeDeck }) {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);

  // Ensure we always have a real authenticated user
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUserId(data?.user?.id || null);
      }
    }

    loadUser();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!activeDeck?.id || !userId) return;

    dispatch(
      fetchCards({
        deck_id: activeDeck.id,
        study_mode: activeDeck.study_mode,
        user_id: userId,
      })
    );
  }, [activeDeck?.id, activeDeck?.study_mode, userId, dispatch]);

  return null;
}
