import { createSlice } from "@reduxjs/toolkit";
import themesArray from "../assets/themes";

// Convert the array of themes into an object map for easy lookup by ID ('dark', 'light')
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
    allThemes: themesMap, // Store the themes as a map
  },
  reducers: {
    setTheme: (state, action) => {
      const themeId = action.payload; // Renamed for clarity, using ID
      if (state.allThemes[themeId]) {
        state.currentThemeName = themeId;
        localStorage.setItem("currentThemeName", themeId);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectCurrentThemeName = (state) => state.theme.currentThemeName;
// Lookup now works correctly on the themesMap
export const selectActiveTheme = (state) =>
  state.theme.allThemes[state.theme.currentThemeName];
export const selectAllThemes = (state) => state.theme.allThemes;

export default themeSlice.reducer;
