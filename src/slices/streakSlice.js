import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";

/* -------------------------------------------
   Thunk: fetch daily streak stats
-------------------------------------------- */
export const fetchDailyStreakStats = createAsyncThunk(
  "streak/fetchDailyStats",
  async ({ user_id } = {}, { rejectWithValue }) => {
    try {
      let userId = user_id;
      if (!userId) {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          throw new Error("Not authenticated");
        }
        userId = userData.user.id;
      }

      const [deckRes, userRes] = await Promise.all([
        supabase
          .from("daily_deck_stats")
          .select("deck_id, deck_streak, max_streak, streak_state, date")
          .eq("user_id", userId)
          .order("date", { ascending: false }), // Gets the newest records first

        supabase
          .from("profiles")
          .select("global_streak, global_max_streak")
          .eq("id", userId)
          .single(),
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
  },
);

export function updateGlobalStreakFromRealtime(state, action) {
  const row = action.payload;
  state.global = {
    streak: row.global_streak,
    maxStreak: row.max_global_streak,
    streakState: row.streak_state,
  };
}

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
   Base Selectors (select raw state)
-------------------------------------------- */
const selectStreakState = (state) => state.streak;
const selectDeckStatsCache = (state) => state.streak.deckStatsCache;
const selectGlobalState = (state) => state.streak.global;

/* -------------------------------------------
   Memoized Selectors
-------------------------------------------- */

// Global streak selectors
export const selectGlobalStreak = createSelector(
  [selectGlobalState],
  (global) => global.streak,
);

export const selectGlobalMaxStreak = createSelector(
  [selectGlobalState],
  (global) => global.maxStreak,
);

export const selectGlobalStreakState = createSelector(
  [selectGlobalState],
  (global) => global.streakState,
);

// Deck streak selectors
export const selectDeckStreakById = (deckId) =>
  createSelector([selectDeckStatsCache], (deckStatsCache) => {
    const deck = deckStatsCache[deckId] || {
      streak: 0,
      maxStreak: 0,
      streakState: "inactive",
    };

    return {
      streak: deck.streak,
      maxStreak: deck.maxStreak,
      isStreakActive: deck.streakState === "active",
      streakState: deck.streakState,
    };
  });

// Status selectors
export const selectStreakStatus = createSelector(
  [selectStreakState],
  (streak) => streak.status,
);

export const selectStreakError = createSelector(
  [selectStreakState],
  (streak) => streak.error,
);

export const selectIsStreakLoading = createSelector(
  [selectStreakStatus],
  (status) => status === "loading",
);

/* -------------------------------------------
   Actions
-------------------------------------------- */
export const { clearStreak, updateDeckStreakFromRealtime } =
  streakSlice.actions;

export default streakSlice.reducer;
