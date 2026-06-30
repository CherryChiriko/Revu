import { createSlice } from "@reduxjs/toolkit";

export const SETTINGS_STORAGE_KEY = "revuSettings";

const defaultSettings = {
  // ── Study limits ──────────────────────────────────────────
  reviewLimit: 25,
  learnLimit: 5,
  // ── Heatmap ───────────────────────────────────────────────
  heatmapMetric: "consistency",
  // ── Avatar ────────────────────────────────────────────────
  // avatarUrl    → uploaded photo URL; null = icon mode
  // avatarIcon   → letter/emoji shown on color background; "" = username initial
  // profileColor → hex background for icon/preset avatars
  // avatarHistory → array of past uploads
  avatarUrl: null,
  avatarIcon: "",
  profileColor: "#6366f1",
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
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
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
    settingsPersistKeys.map((key) => [
      key,
      settings[key] ?? defaultSettings[key],
    ]),
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

    hydrateFromProfile(state, action) {
      const p = action.payload;

      // Study limits — respect locally-persisted overrides
      if (p.review_limit != null && !persistedSettingKeys.has("reviewLimit"))
        state.reviewLimit = p.review_limit;
      if (p.learn_limit != null && !persistedSettingKeys.has("learnLimit"))
        state.learnLimit = p.learn_limit;

      // Avatar — always hydrate from profile (localStorage cleared on logout)
      state.avatarUrl = p.avatar_url ?? null;
      state.avatarHistory = Array.isArray(p.avatar_history)
        ? p.avatar_history
        : [];
      state.avatarIcon = p.avatar_icon ?? "";
      state.profileColor = p.avatar_color ?? defaultSettings.profileColor;

      // Derive initial from username if no icon is explicitly set
      if (!state.avatarIcon && p.username)
        state.avatarIcon = p.username.slice(0, 1).toUpperCase();

      // Display prefs — respect locally-persisted overrides
      if (p.date_format != null && !persistedSettingKeys.has("dateFormat"))
        state.dateFormat = p.date_format;
      if (
        p.default_deck_view != null &&
        !persistedSettingKeys.has("defaultDeckView")
      )
        state.defaultDeckView = p.default_deck_view;
      if (
        p.heatmap_metric != null &&
        !persistedSettingKeys.has("heatmapMetric")
      )
        state.heatmapMetric = p.heatmap_metric;
    },

    // CRITICAL: return defaultSettings, NOT initialState.
    // initialState bakes in previous user's localStorage at module load time.
    resetSettings() {
      return { ...defaultSettings };
    },
  },
});

export const selectSettings = (state) => state.settings;
export const selectReviewLimit = (state) => state.settings.reviewLimit;
export const selectLearnLimit = (state) => state.settings.learnLimit;
export const selectDailyGoal = (state) => state.settings.reviewLimit;
export const selectHeatmapMetric = (state) => state.settings.heatmapMetric;
export const selectDefaultDeckView = (state) => state.settings.defaultDeckView;
export const selectAvatarUrl = (state) => state.settings.avatarUrl;

export const { updateSettings, hydrateFromProfile, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
