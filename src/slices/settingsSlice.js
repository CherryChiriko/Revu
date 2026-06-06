/**
 * settingsSlice.js
 *
 * Owns all per-user UI and study preferences.
 * Study limits (reviewLimit, learnLimit, streakGoal) are persisted to
 * the `profiles` table via the SettingsPage save flow.
 * Everything else is kept in localStorage via redux-persist (or your
 * existing persistence layer).
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ── Study limits ──────────────────────────────────────────
  reviewLimit: 20, // cards/session that count toward streak (review)
  learnLimit: 20, // cards/session that count toward streak (learn)
  streakGoal: 20, // alias shown in UI as "daily card goal"

  // ── Heatmap ───────────────────────────────────────────────
  heatmapMetric: "consistency", // consistency | studied | learned

  // ── Avatar ────────────────────────────────────────────────
  profileIcon: "R",
  profileColor: "#6366f1",
  avatarUrl: null, // active uploaded photo URL (null = emoji/initial)
  avatarHistory: [], // [{ url, path, used_at }] max 5, desc by used_at

  // ── Study flow ────────────────────────────────────────────
  autoflipModeA: false,
  autoflipSpeed: 3.0,
  characterAnimationSpeed: 1.0,

  // ── Display ───────────────────────────────────────────────
  dateFormat: "dd/mm/yyyy",
  defaultDeckView: "grid",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    /** Generic single-key update (for toggles, sliders, selects) */
    updateSettings(state, action) {
      return { ...state, ...action.payload };
    },

    /**
     * Hydrate from the `profiles` row fetched after login.
     * Call this in userSlice.extraReducers or wherever you load the profile.
     */
    hydrateFromProfile(state, action) {
      const p = action.payload;
      if (p.review_limit != null) state.reviewLimit = p.review_limit;
      if (p.learn_limit != null) state.learnLimit = p.learn_limit;
      if (p.streak_goal != null) state.streakGoal = p.streak_goal;
      if (p.avatar_url != null) state.avatarUrl = p.avatar_url;
      if (Array.isArray(p.avatar_history))
        state.avatarHistory = p.avatar_history;
    },

    /** Clear all settings on logout */
    resetSettings() {
      return initialState;
    },
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────
export const selectSettings = (state) => state.settings;
export const selectReviewLimit = (state) => state.settings.reviewLimit;
export const selectLearnLimit = (state) => state.settings.learnLimit;
export const selectStreakGoal = (state) => state.settings.streakGoal;
export const selectDailyGoal = (state) => state.settings.streakGoal;
export const selectHeatmapMetric = (state) => state.settings.heatmapMetric;
export const selectDefaultDeckView = (state) => state.settings.defaultDeckView;
export const selectAvatarUrl = (state) => state.settings.avatarUrl;

export const { updateSettings, hydrateFromProfile, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
