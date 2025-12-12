import { createSlice, createSelector } from "@reduxjs/toolkit";
import startOfToday from "date-fns/startOfToday";
import {
  REVIEW_LIMIT,
  LEARN_LIMIT,
} from "../components/Study/constants/constants";

const dateKey = () => {
  const d = startOfToday();
  return d.toISOString().slice(0, 10);
};

const initialState = {
  days: {}, // keyed by YYYY-MM-DD
  lastUpdated: null,
};

export const selectActivityDays = (state) => state.activity.days;

export const selectHeatmapData = createSelector(
  [selectActivityDays],
  (days) => {
    return Object.values(days)
      .map((d) => {
        const objective = Math.round(
          Math.max(
            d.cardsReviewed / REVIEW_LIMIT,
            d.cardsLearned / LEARN_LIMIT
          ) * 100
        );
        const percent = Math.min(100, objective);

        return {
          date: d.date,
          value: percent,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
);

// This function is to select different parameters for heatmap values, like time spent, XP earned or cards learned
export const makeSelectHeatmapData =
  (metric = "cardsStudied") =>
  (state) => {
    const days = state.activity.days;
    return Object.values(days)
      .map((d) => ({
        date: d.date,
        value: d[metric] ?? 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    logStudySession: (state, action) => {
      const {
        cardsReviewed = 0,
        cardsLearned = 0,
        // timeStudiedSeconds = 0,
        // xpEarned = 0,
        forcedDateKey, // optional override (useful for debugging)
      } = action.payload;

      const key = forcedDateKey || dateKey();

      if (!state.days[key]) {
        state.days[key] = {
          date: key,
          cardsReviewed: 0,
          cardsLearned: 0,
          // timeStudiedSeconds: 0,
          // xpEarned: 0,
        };
      }

      const cardsStudied = cardsLearned + cardsReviewed;

      state.days[key].cardsStudied += cardsStudied; // TODO : for another optional mode or stats
      state.days[key].cardsReviewed += cardsReviewed;
      state.days[key].cardsLearned += cardsLearned;
      // state.days[key].timeStudiedSeconds += timeStudiedSeconds;
      // state.days[key].xpEarned += xpEarned;

      state.lastUpdated = new Date().toISOString();
    },

    resetActivity: (state) => {
      state.days = {};
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { logStudySession, resetActivity } = activitySlice.actions;
export default activitySlice.reducer;
