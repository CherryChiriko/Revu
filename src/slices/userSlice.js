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
 * Persists has_completed_onboarding = true to the profiles table.
 * Updates local state optimistically so OnboardingModal can close
 * immediately; rolls back if the write fails so the modal reappears
 * next boot instead of silently losing the flag.
 */
export const completeOnboarding = createAsyncThunk(
  "user/completeOnboarding",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const userId = getState().users?.profile?.id;
    if (!userId) return rejectWithValue("No user profile loaded");

    dispatch(updateLocalProfile({ has_completed_onboarding: true }));

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", userId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("completeOnboarding error:", err);
      dispatch(updateLocalProfile({ has_completed_onboarding: false }));
      return rejectWithValue(err.message || "Failed to save onboarding status");
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
export const selectHasCompletedOnboarding = (state) =>
  Boolean(state.users?.profile?.has_completed_onboarding);

export default userSlice.reducer;
