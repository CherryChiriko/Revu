// src/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue("No user ID provided");
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (!profile) throw new Error("Profile not found");
      return profile;
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      return rejectWithValue(err.message || "Failed to fetch profile");
    }
  },
);

/**
 * 🌟 NEW: Dynamic Tutorial Completion Tracker
 * Receives a tutorial key (e.g., 'general', 'dashboard', 'decks'),
 * updates local state, and persists it into the DB JSONB payload object.
 */
export const completeTutorial = createAsyncThunk(
  "user/completeTutorial",
  async (tutorialKey, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const profile = state.users?.profile;
    const userId = profile?.id;

    if (!userId) return rejectWithValue("No user profile loaded");

    // Pull current object structure from state or default to an empty one
    const currentTutorials = profile?.completed_tutorials || {};

    // Guard: If it's already true, bypass database network traffic completely
    if (currentTutorials[tutorialKey] === true) {
      return currentTutorials;
    }

    // Build next state payload safely preserving other keys
    const updatedTutorials = {
      ...currentTutorials,
      [tutorialKey]: true,
    };

    // 1. Optimistically update local UI layout frames instantly
    dispatch(updateLocalProfile({ completed_tutorials: updatedTutorials }));

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ completed_tutorials: updatedTutorials })
        .eq("id", userId);

      if (error) throw error;
      return updatedTutorials;
    } catch (err) {
      console.error(`completeTutorial error for [${tutorialKey}]:`, err);

      // Rollback to prior clean backup structural definitions if connection drops
      dispatch(updateLocalProfile({ completed_tutorials: currentTutorials }));
      return rejectWithValue(err.message || "Failed to save tutorial status");
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    profile: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearUser(state) {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
    updateLocalProfile(state, action) {
      state.profile = {
        ...(state.profile || {}),
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch profile";
      });
  },
});

export const { clearUser, updateLocalProfile } = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.users?.profile;
export const selectUsername = (state) => state.users?.profile?.username;
export const selectUserStatus = (state) => state.users?.status;
export const selectUserError = (state) => state.users?.error;

// 🌟 Updated Selector maps to evaluate individual structural keys
export const selectCompletedTutorials = (state) =>
  state.users?.profile?.completed_tutorials || {};

export default userSlice.reducer;
