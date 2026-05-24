import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [deckStats, setDeckStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------------------------------------------------------------
  // Fetch user profile and deck stats
  // --------------------------------------------------------------------------
  const fetchProfileAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const { data: statsData, error: statsError } = await supabase
        .from("deck_stats")
        .select("*")
        .eq("user_id", userId);

      if (statsError) throw statsError;

      setProfile(profileData);
      setDeckStats(statsData || []);
    } catch (err) {
      console.error("Failed to fetch user profile or deck stats", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchProfileAndStats();
  }, [userId, fetchProfileAndStats]);

  // --------------------------------------------------------------------------
  // Compute streaks
  // --------------------------------------------------------------------------
  const getToday = () => dayjs().tz(dayjs.tz.guess()).startOf("day");

  const isStreakActive = (lastActivity) => {
    if (!lastActivity) return false;
    const last = dayjs(lastActivity).tz(dayjs.tz.guess()).startOf("day");
    return getToday().diff(last, "day") === 0;
  };

  const computeGlobalStreak = () => {
    if (!profile) return { count: 0, active: false };
    return {
      count: profile.current_streak || 0,
      active: isStreakActive(profile.last_activity),
    };
  };

  const computeDeckStreak = (deckId) => {
    const deck = deckStats.find((d) => d.deck_id === deckId);
    if (!deck) return { count: 0, active: false };
    return {
      count: deck.current_streak || 0,
      active: isStreakActive(deck.last_activity),
      max: deck.max_streak || 0,
    };
  };

  // --------------------------------------------------------------------------
  // Update streaks after a study session
  // --------------------------------------------------------------------------
  const updateStreaks = async ({ deckId, reviewedToday = false }) => {
    if (!userId) return;

    const today = getToday().format("YYYY-MM-DD");

    try {
      // Update global streak
      let newGlobalStreak = profile.current_streak || 0;
      const lastGlobal = dayjs(profile.last_activity).tz(dayjs.tz.guess());
      if (lastGlobal.isSame(today, "day")) {
        // Already updated today, do nothing
      } else if (lastGlobal.isSame(today.subtract(1, "day"), "day")) {
        newGlobalStreak += 1;
      } else {
        newGlobalStreak = 1; // reset streak
      }

      const { error: globalErr } = await supabase
        .from("profiles")
        .update({ current_streak: newGlobalStreak, last_activity: today })
        .eq("id", userId);

      if (globalErr) throw globalErr;

      setProfile((p) => ({
        ...p,
        current_streak: newGlobalStreak,
        last_activity: today,
      }));

      // Update per-deck streak
      if (deckId) {
        const deck = deckStats.find((d) => d.deck_id === deckId);
        let newDeckStreak = deck?.current_streak || 0;
        let newMax = deck?.max_streak || 0;
        const lastDeck = deck?.last_activity
          ? dayjs(deck.last_activity).tz(dayjs.tz.guess())
          : null;

        if (lastDeck?.isSame(today, "day")) {
          // already updated
        } else if (lastDeck?.isSame(today.subtract(1, "day"), "day")) {
          newDeckStreak += 1;
        } else {
          newDeckStreak = 1;
        }

        if (newDeckStreak > newMax) newMax = newDeckStreak;

        const { error: deckErr } = await supabase.from("deck_stats").upsert(
          {
            user_id: userId,
            deck_id: deckId,
            current_streak: newDeckStreak,
            max_streak: newMax,
            last_activity: today,
          },
          { onConflict: ["user_id", "deck_id"] }
        );

        if (deckErr) throw deckErr;

        setDeckStats((prev) => {
          const exists = prev.find((d) => d.deck_id === deckId);
          if (exists) {
            return prev.map((d) =>
              d.deck_id === deckId
                ? {
                    ...d,
                    current_streak: newDeckStreak,
                    max_streak: newMax,
                    last_activity: today,
                  }
                : d
            );
          } else {
            return [
              ...prev,
              {
                deck_id: deckId,
                current_streak: newDeckStreak,
                max_streak: newMax,
                last_activity: today,
              },
            ];
          }
        });
      }
    } catch (err) {
      console.error("Failed to update streaks", err);
    }
  };

  return {
    profile,
    deckStats,
    loading,
    error,
    computeGlobalStreak,
    computeDeckStreak,
    updateStreaks,
    refetch: fetchProfileAndStats,
  };
}
