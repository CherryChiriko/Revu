/**
 * settingsSlice.js
 *
 * Owns all per-user UI and study preferences.
 * Study limits (reviewLimit, learnLimit, streakGoal) are persisted to
 * the `profiles` table via the StudyLimitsSection save flow.
 * Display prefs (dateFormat, defaultDeckView, heatmapMetric) are persisted
 * to `profiles` via the DisplaySection save flow.
 * Settings are also cached in localStorage so choices survive refreshes even
 * before the profile save flow completes.
 */
import { createSlice } from "@reduxjs/toolkit";

export const SETTINGS_STORAGE_KEY = "revuSettings";

const defaultSettings = {
  // ── Study limits ──────────────────────────────────────────
  reviewLimit: 25,
  learnLimit: 5,
  streakGoal: 25,
  // ── Heatmap ───────────────────────────────────────────────
  heatmapMetric: "consistency", // consistency | studied | learned
  // ── Avatar ────────────────────────────────────────────────
  profileIcon: "", // hydrated from profile username after login
  profileColor: "#6366f1",
  avatarUrl: null,
  avatarHistory: [],
  // ── Study flow ────────────────────────────────────────────
  autoflipModeA: false,
  autoflipSpeed: 3.0,
  characterAnimationSpeed: 1.0,
  // ── Display ───────────────────────────────────────────────
  dateFormat: "monday",
  defaultDeckView: "large",
};

const loadPersistedSettings = () => {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([key]) => key in defaultSettings),
    );
  } catch (error) {
    console.error("Failed to load persisted settings", error);
    return {};
  }
};

const persistedSettings = loadPersistedSettings();
const persistedSettingKeys = new Set(Object.keys(persistedSettings));

export const settingsPersistKeys = Object.keys(defaultSettings);

export const getPersistableSettings = (settings) =>
  Object.fromEntries(
    settingsPersistKeys.map((key) => [key, settings[key] ?? defaultSettings[key]]),
  );

const initialState = {
  ...defaultSettings,
  ...persistedSettings,
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
      if (p.review_limit != null && !persistedSettingKeys.has("reviewLimit"))
        state.reviewLimit = p.review_limit;
      if (p.learn_limit != null && !persistedSettingKeys.has("learnLimit"))
        state.learnLimit = p.learn_limit;
      if (p.streak_goal != null && !persistedSettingKeys.has("streakGoal"))
        state.streakGoal = p.streak_goal;
      // Avatar / profile icon — derive initial from username if no icon set
      if (p.avatar_url != null && !persistedSettingKeys.has("avatarUrl"))
        state.avatarUrl = p.avatar_url;
      if (Array.isArray(p.avatar_history) && !persistedSettingKeys.has("avatarHistory"))
        state.avatarHistory = p.avatar_history;
      if (p.username && !state.profileIcon && !persistedSettingKeys.has("profileIcon")) {
        state.profileIcon = p.username.slice(0, 1).toUpperCase();
      }
      // Display prefs
      if (p.date_format != null && !persistedSettingKeys.has("dateFormat"))
        state.dateFormat = p.date_format;
      if (p.default_deck_view != null && !persistedSettingKeys.has("defaultDeckView"))
        state.defaultDeckView = p.default_deck_view;
      if (p.heatmap_metric != null && !persistedSettingKeys.has("heatmapMetric"))
        state.heatmapMetric = p.heatmap_metric;
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
