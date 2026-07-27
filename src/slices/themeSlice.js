// src/slices/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import themesArray from "../assets/themes";

const themesMap = themesArray.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

const initialThemeId = localStorage.getItem("currentThemeName");
const defaultThemeId = themesMap[initialThemeId] ? initialThemeId : "dark";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    currentThemeName: defaultThemeId,
    allThemes: themesMap,
  },
  reducers: {
    setTheme: (state, action) => {
      const themeId = action.payload;
      if (state.allThemes[themeId]) {
        state.currentThemeName = themeId;
        localStorage.setItem("currentThemeName", themeId);
      }
    },
    // Hydrate theme directly from Supabase profile on user session load
    syncThemeFromProfile: (state, action) => {
      const themeId = action.payload;
      if (themeId && state.allThemes[themeId]) {
        state.currentThemeName = themeId;
        localStorage.setItem("currentThemeName", themeId);
      }
    },
  },
});

export const { setTheme, syncThemeFromProfile } = themeSlice.actions;

export const selectCurrentThemeName = (state) => state.theme.currentThemeName;
export const selectActiveTheme = (state) =>
  state.theme.allThemes[state.theme.currentThemeName];
export const selectAllThemes = (state) => state.theme.allThemes;

export default themeSlice.reducer;
