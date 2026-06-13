/**
 * settingsSlice.js
 *
 * Owns all per-user UI and study preferences.
 * Study limits (reviewLimit, learnLimit, streakGoal) are persisted to
 * the `profiles` table via the StudyLimitsSection save flow.
 * Display prefs (dateFormat, defaultDeckView, heatmapMetric) are persisted
 * to `profiles` via the DisplaySection save flow.
 * Everything else is kept in localStorage via redux-persist.
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ── Study limits ──────────────────────────────────────────
  reviewLimit: 20,
  learnLimit: 20,
  streakGoal: 20,
  // ── Heatmap ───────────────────────────────────────────────
  heatmapMetric: "consistency", // consistency | studied | learned
  // ── Avatar ────────────────────────────────────────────────
  profileIcon: "R",
  profileColor: "#6366f1",
  avatarUrl: null,
  avatarHistory: [],
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
    updateSettings(state, action) {
      return { ...state, ...action.payload };
    },
    /**
     * Hydrate from the `profiles` row fetched after login.
     * Covers study limits, avatar, and display prefs.
     */
    hydrateFromProfile(state, action) {
      const p = action.payload;
      // Study limits
      if (p.review_limit != null) state.reviewLimit = p.review_limit;
      if (p.learn_limit != null) state.learnLimit = p.learn_limit;
      if (p.streak_goal != null) state.streakGoal = p.streak_goal;
      // Avatar
      if (p.avatar_url != null) state.avatarUrl = p.avatar_url;
      if (Array.isArray(p.avatar_history))
        state.avatarHistory = p.avatar_history;
      // Display prefs
      if (p.date_format != null) state.dateFormat = p.date_format;
      if (p.default_deck_view != null)
        state.defaultDeckView = p.default_deck_view;
      if (p.heatmap_metric != null) state.heatmapMetric = p.heatmap_metric;
    },
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
