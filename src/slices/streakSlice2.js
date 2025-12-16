// src/slices/streakSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";
import { getLocalISODate, getLocalISODateOffset } from "../utils/localDate";
import { updateProfileFromStreak } from "./userSlice";

// export const updateDeckStreak = createAsyncThunk(
//   "streak/updateDeckStreak",
//   async ({ userId, deckId, studiedCount }, { rejectWithValue }) => {
//     if (!userId || !deckId) {
//       return rejectWithValue("Missing userId or deckId");
//     }

//     const today = getLocalISODate();
//     const yesterday = getLocalISODateOffset(-1);

//     try {
//       const { data: existing, error: selErr } = await supabase
//         .from("deck_stats")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("deck_id", deckId)
//         .single();

//       if (selErr && selErr.code !== "PGRST116") {
//         throw selErr;
//       }

//       if (!existing) {
//         const initialStreak = studiedCount > 0 ? 1 : 0;
//         const row = {
//           user_id: userId,
//           deck_id: deckId,
//           streak: initialStreak,
//           max_streak: initialStreak,
//           last_active: studiedCount > 0 ? today : null,
//           daily_cards: studiedCount,
//         };

//         const { data: inserted, error: insertErr } = await supabase
//           .from("deck_stats")
//           .insert([row])
//           .select()
//           .single();

//         if (insertErr) throw insertErr;
//         return inserted;
//       }

//       let newStreak = existing.streak ?? 0;
//       let newMax = existing.max_streak ?? 0;
//       let newLastActive = existing.last_active;

//       if (studiedCount > 0) {
//         if (existing.last_active === today) {
//           newLastActive = today;
//         } else if (existing.last_active === yesterday) {
//           newStreak = (existing.streak ?? 0) + 1;
//           newLastActive = today;
//         } else {
//           newStreak = 1;
//           newLastActive = today;
//         }

//         if (newStreak > newMax) newMax = newStreak;
//       }

//       const updates = {
//         streak: newStreak,
//         max_streak: newMax,
//         last_active: newLastActive,
//         daily_cards: studiedCount,
//       };

//       const { data: updated, error: updateErr } = await supabase
//         .from("deck_stats")
//         .update(updates)
//         .eq("user_id", userId)
//         .eq("deck_id", deckId)
//         .select()
//         .single();

//       if (updateErr) throw updateErr;
//       return updated;
//     } catch (err) {
//       console.error("updateDeckStreak error:", err);
//       return rejectWithValue(err.message || "Failed to update deck streak");
//     }
//   }
// );

/**
 * updateGlobalStreak:
 * - Reads from userSlice cache if available (no DB call)
 * - Only queries DB if profile not in cache
 * - Updates both Supabase and userSlice
 */
export const updateGlobalStreak = createAsyncThunk(
  "streak/updateGlobalStreak",
  async (
    { userId, reviewedCount = 0, learnedCount = 0 },
    { rejectWithValue, dispatch, getState }
  ) => {
    if (!userId) return rejectWithValue("Missing userId");

    const today = getLocalISODate();
    const yesterday = getLocalISODateOffset(-1);
    const conditionMet = reviewedCount >= 25 || learnedCount >= 5;

    try {
      // OPTIMIZATION: Check userSlice first (already in memory, no DB call)
      const state = getState();
      let profile = state.user?.profile;

      // If not in userSlice, fetch from DB
      if (!profile) {
        const { data, error: selErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (selErr && selErr.code !== "PGRST116") {
          throw selErr;
        }

        if (!data) {
          return rejectWithValue("Profile not found. User must sign up first.");
        }

        profile = data;
      }

      let newStreak = profile.global_streak ?? 0;
      let newMax = profile.global_max_streak ?? 0;
      let newLastActive = profile.global_last_active;

      if (conditionMet) {
        if (profile.global_last_active === today) {
          newLastActive = today;
        } else if (profile.global_last_active === yesterday) {
          newStreak = (profile.global_streak ?? 0) + 1;
          newLastActive = today;
        } else {
          newStreak = 1;
          newLastActive = today;
        }

        if (newStreak > newMax) newMax = newStreak;
      }

      const updates = {
        global_streak: newStreak,
        global_max_streak: newMax,
        global_last_active: newLastActive,
      };

      // Update Supabase
      const { data: updated, error: updateErr } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Sync back to userSlice (single source of truth)
      dispatch(updateProfileFromStreak(updated));

      return updated;
    } catch (err) {
      console.error("updateGlobalStreak error:", err);
      return rejectWithValue(err.message || "Failed to update global streak");
    }
  }
);

const streakSlice = createSlice({
  name: "streak",
  initialState: {
    lastDeckUpdate: null,
    lastProfileUpdate: null,
    status: "idle",
    error: null,
    deckStatsCache: {}, // Keep this for deck stats (not synced to other slices)
  },
  reducers: {
    clearStreak(state) {
      state.lastDeckUpdate = null;
      state.lastProfileUpdate = null;
      state.deckStatsCache = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(updateDeckStreak.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(updateDeckStreak.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.error = null;
      //   state.lastDeckUpdate = action.payload;
      //   if (action.payload?.deck_id) {
      //     state.deckStatsCache[action.payload.deck_id] = action.payload;
      //   }
      // })
      // .addCase(updateDeckStreak.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload || "Failed to update deck streak";
      // })
      .addCase(updateGlobalStreak.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateGlobalStreak.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.lastProfileUpdate = action.payload;
      })
      .addCase(updateGlobalStreak.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update global streak";
      });
  },
});

export const { clearStreak } = streakSlice.actions;

// Selectors
export const selectStreakStatus = (state) => state.streak.status;
export const selectStreakError = (state) => state.streak.error;
export const selectDeckStatsCache = (state) => state.streak.deckStatsCache;
export const selectLastDeckUpdate = (state) => state.streak.lastDeckUpdate;
export const selectLastProfileUpdate = (state) =>
  state.streak.lastProfileUpdate;

export default streakSlice.reducer;
