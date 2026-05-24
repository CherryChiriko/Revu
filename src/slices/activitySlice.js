import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import startOfToday from "date-fns/startOfToday";
import {
  REVIEW_LIMIT,
  LEARN_LIMIT,
} from "../components/Study/constants/constants";
import { supabase } from "../utils/supabaseClient";

/* -------------------------------------------
   Helper Functions
-------------------------------------------- */
/* -------------------------------------------
   Helper Functions
-------------------------------------------- */
const dateKey = () => {
  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
/* -------------------------------------------
   Initial State
-------------------------------------------- */
const initialState = {
  days: {}, // keyed by YYYY-MM-DD
  lastUpdated: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

/* -------------------------------------------
   Async Thunks
-------------------------------------------- */
export const fetchDailyActivity = createAsyncThunk(
  "activity/fetchDaily",
  async (_, { rejectWithValue }) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Not authenticated");
      }
      const userId = userData.user.id;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 60);
      const cutoffStr = cutoffDate.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("daily_user_stats")
        .select("date, cards_reviewed, cards_learned")
        .eq("user_id", userId)
        .gte("date", cutoffStr);
      if (error) return rejectWithValue(error.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* -------------------------------------------
   Slice
-------------------------------------------- */
export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    logStudySession: (state, action) => {
      const {
        cardsReviewed = 0,
        cardsLearned = 0,
        forcedDateKey,
      } = action.payload;
      const key = forcedDateKey || dateKey();

      // Merge with existing data if present
      const existing = state.days[key] || {};
      state.days[key] = {
        date: key,
        cardsReviewed: (existing.cardsReviewed || 0) + cardsReviewed,
        cardsLearned: (existing.cardsLearned || 0) + cardsLearned,
        cardsStudied:
          (existing.cardsStudied || 0) + cardsReviewed + cardsLearned,
      };
      state.lastUpdated = new Date().toISOString();
    },

    resetActivity: (state) => {
      state.days = {};
      state.lastUpdated = new Date().toISOString();
      state.status = "idle";
      state.error = null;
    },

    updateDayFromRealtime: (state, action) => {
      const { date, cards_reviewed, cards_learned } = action.payload;
      state.days[date] = {
        date,
        cardsReviewed: cards_reviewed,
        cardsLearned: cards_learned,
        cardsStudied: cards_reviewed + cards_learned,
      };
      state.lastUpdated = new Date().toISOString();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyActivity.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDailyActivity.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.days = {};
        action.payload.forEach((d) => {
          state.days[d.date] = {
            date: d.date,
            cardsReviewed: d.cards_reviewed,
            cardsLearned: d.cards_learned,
            cardsStudied: d.cards_reviewed + d.cards_learned,
          };
        });
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDailyActivity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch daily activity";
        console.error("fetchDailyActivity failed:", action.payload);
      });
  },
});

/* -------------------------------------------
   Base Selectors
-------------------------------------------- */
// const selectActivityState = (state) => state.activity;
export const selectActivityDays = (state) => state.activity.days;
const selectActivityStatus = (state) => state.activity.status;
const selectActivityError = (state) => state.activity.error;

/* -------------------------------------------
   Memoized Selectors
-------------------------------------------- */

// Status selectors
export const selectIsActivityLoading = createSelector(
  [selectActivityStatus],
  (status) => status === "loading",
);

export const selectActivityLoadError = createSelector(
  [selectActivityError],
  (error) => error,
);

// Today's activity
export const selectTodayActivity = createSelector(
  [selectActivityDays],
  (days) => {
    const today = dateKey();
    return (
      days[today] || {
        date: today,
        cardsReviewed: 0,
        cardsLearned: 0,
        cardsStudied: 0,
      }
    );
  },
);

// Activity for a specific date
export const selectActivityByDate = (date) =>
  createSelector([selectActivityDays], (days) => {
    return (
      days[date] || {
        date,
        cardsReviewed: 0,
        cardsLearned: 0,
        cardsStudied: 0,
      }
    );
  });

// Total stats across all days
export const selectTotalActivity = createSelector(
  [selectActivityDays],
  (days) => {
    return Object.values(days).reduce(
      (acc, day) => ({
        cardsReviewed: acc.cardsReviewed + day.cardsReviewed,
        cardsLearned: acc.cardsLearned + day.cardsLearned,
        cardsStudied: acc.cardsStudied + day.cardsStudied,
        totalDays: acc.totalDays + 1,
      }),
      {
        cardsReviewed: 0,
        cardsLearned: 0,
        cardsStudied: 0,
        totalDays: 0,
      },
    );
  },
);

// Heatmap data (original implementation)
export const selectHeatmapData = createSelector(
  [selectActivityDays],
  (days) => {
    return Object.values(days)
      .map((d) => {
        const objective = Math.round(
          Math.max(
            d.cardsReviewed / REVIEW_LIMIT,
            d.cardsLearned / LEARN_LIMIT,
          ) * 100,
        );
        const percent = Math.min(100, objective);
        return {
          date: d.date,
          value: percent,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },
);

// Flexible heatmap data by metric (memoized version)
export const selectHeatmapDataByMetric = (metric = "cardsStudied") =>
  createSelector([selectActivityDays], (days) => {
    return Object.values(days)
      .map((d) => ({
        date: d.date,
        value: d[metric] ?? 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });

// Activity days sorted by date
export const selectSortedActivityDays = createSelector(
  [selectActivityDays],
  (days) => {
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  },
);

// Recent activity (last N days)
export const selectRecentActivity = (numDays = 7) =>
  createSelector([selectSortedActivityDays], (days) => {
    return days.slice(-numDays);
  });

// Check if user studied today
export const selectHasStudiedToday = createSelector(
  [selectTodayActivity],
  (today) => today.cardsStudied > 0,
);

// Average cards per day
export const selectAverageCardsPerDay = createSelector(
  [selectTotalActivity],
  (total) => {
    if (total.totalDays === 0) return 0;
    return Math.round(total.cardsStudied / total.totalDays);
  },
);

// Days with activity (count)
export const selectActiveDaysCount = createSelector(
  [selectActivityDays],
  (days) => {
    return Object.values(days).filter((d) => d.cardsStudied > 0).length;
  },
);

/* -------------------------------------------
   Actions
-------------------------------------------- */
export const { logStudySession, resetActivity, updateDayFromRealtime } =
  activitySlice.actions;

export default activitySlice.reducer;
