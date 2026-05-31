import { createSlice } from "@reduxjs/toolkit";

const SETTINGS_STORAGE_KEY = "revuUserSettings";

const defaultSettings = {
  profileIcon: "R",
  profileColor: "#6366f1",
  autoflipModeA: true,
  characterAnimationSpeed: 1,
  autoflipSpeed: 2.5,
  dateFormat: "dd/mm/yyyy",
  defaultDeckView: "grid",
  heatmapMetric: "consistency",
  dailyGoal: 20,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error("Failed to load user settings", error);
    return defaultSettings;
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save user settings", error);
  }
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadSettings(),
  reducers: {
    updateSettings(state, action) {
      Object.assign(state, action.payload);
      persistSettings(state);
    },
    resetSettings() {
      persistSettings(defaultSettings);
      return defaultSettings;
    },
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectProfileIcon = (state) => state.settings.profileIcon;
export const selectDefaultDeckView = (state) => state.settings.defaultDeckView;
export const selectHeatmapMetric = (state) => state.settings.heatmapMetric;
export const selectDailyGoal = (state) => state.settings.dailyGoal;

export default settingsSlice.reducer;
