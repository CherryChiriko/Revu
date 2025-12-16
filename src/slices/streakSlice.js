import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";

/* -------------------------------------------
   Thunk: fetch daily streak stats
-------------------------------------------- */
export const fetchDailyStreakStats = createAsyncThunk(
  "streak/fetchDailyStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("Not authenticated");
      }

      const userId = userData.user.id;
      const today = new Date().toISOString().slice(0, 10);

      const [deckRes, userRes] = await Promise.all([
        supabase
          .from("daily_deck_stats")
          .select("deck_id, deck_streak, max_streak, streak_state")
          .eq("user_id", userId)
          .eq("date", today),

        supabase
          .from("daily_user_stats")
          .select("global_streak, max_global_streak, streak_state")
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle(), // IMPORTANT
      ]);

      if (deckRes.error) throw deckRes.error;
      if (userRes.error) throw userRes.error;

      return {
        decks: deckRes.data ?? [],
        global: userRes.data ?? {
          global_streak: 0,
          max_global_streak: 0,
          streak_state: "inactive",
        },
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* -------------------------------------------
   Slice
-------------------------------------------- */
const streakSlice = createSlice({
  name: "streak",
  initialState: {
    status: "idle",
    error: null,

    // deck_id -> streak info
    deckStatsCache: {},

    global: {
      streak: 0,
      maxStreak: 0,
      streakState: "inactive", // inactive | active | frozen
    },
  },

  reducers: {
    clearStreak(state) {
      state.deckStatsCache = {};
      state.global = {
        streak: 0,
        maxStreak: 0,
        streakState: "inactive",
      };
      state.status = "idle";
      state.error = null;
    },
    updateDeckStreakFromRealtime(state, action) {
      const row = action.payload;
      state.deckStatsCache[row.deck_id] = {
        streak: row.deck_streak,
        maxStreak: row.max_streak,
        streakState: row.streak_state,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyStreakStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchDailyStreakStats.fulfilled, (state, action) => {
        state.status = "succeeded";

        /* -------- Deck streaks -------- */
        state.deckStatsCache = {};
        for (const row of action.payload.decks) {
          state.deckStatsCache[row.deck_id] = {
            streak: row.deck_streak,
            maxStreak: row.max_streak,
            streakState: row.streak_state ?? "inactive",
          };
        }

        /* -------- Global streak -------- */
        const g = action.payload.global;
        state.global = {
          streak: g.global_streak,
          maxStreak: g.max_global_streak,
          streakState: g.streak_state ?? "inactive",
        };
      })

      .addCase(fetchDailyStreakStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load streak stats";
      });
  },
});

/* -------------------------------------------
   Selectors
-------------------------------------------- */

// Raw
export const selectGlobalStreak = (state) => state.streak.global.streak;
export const selectGlobalStreakState = (state) =>
  state.streak.global.streakState;

export const selectDeckStreakById = (deckId) => (state) => {
  const deck = state.streak.deckStatsCache[deckId] || {
    streak: 0,
    maxStreak: 0,
    streakState: "inactive",
  };

  return {
    streak: deck.streak,
    maxStreak: deck.maxStreak,
    isStreakActive: deck.streakState === "active",
  };
};

// // Derived (recommended for UI)
// export const selectIsGlobalStreakActive = (state) =>
//   state.streak.global.streakState === "active";

// export const selectIsGlobalStreakFrozen = (state) =>
//   state.streak.global.streakState === "frozen";

// export const selectIsDeckStreakActive = (deckId) => (state) =>
//   state.streak.deckStatsCache[deckId]?.streakState === "active";

// export const selectIsDeckStreakFrozen = (deckId) => (state) =>
//   state.streak.deckStatsCache[deckId]?.streakState === "frozen";

export const { clearStreak } = streakSlice.actions;
export default streakSlice.reducer;
