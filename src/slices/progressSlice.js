import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";

const TABLES = {
  A: "card_a_progress",
  C: "card_c_progress",
};

export const updateProgress = createAsyncThunk(
  "progress/updateProgress",
  async ({ sessionUpdates, study_mode }, { rejectWithValue }) => {
    console.log("updateProgress", sessionUpdates);
    if (!sessionUpdates?.length || !study_mode) {
      return rejectWithValue("Missing required fields: updates or study_mode");
    }

    const table = TABLES[study_mode];
    if (!table) {
      return rejectWithValue(`Invalid study mode: ${study_mode}`);
    }

    try {
      console.log("updates ", sessionUpdates);

      const { error } = await supabase.from(table).upsert(sessionUpdates, {
        onConflict: ["user_id", "card_id"],
      });

      if (error) throw error;
      return sessionUpdates;
    } catch (err) {
      console.error("updateProgress error:", err);
      return rejectWithValue(
        err.message || "Failed to batch update card progress"
      );
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    byCardId: {},
    status: "idle",
    error: null,
  },
  reducers: {
    clearProgress(state) {
      state.byCardId = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProgress.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const { cardId, updates } = action.payload;
        state.byCardId[cardId] = {
          ...state.byCardId[cardId],
          ...updates,
        };
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update progress";
      });
  },
});

export const { clearProgress } = progressSlice.actions;

// Selectors
export const selectProgress = (state) => state.progress.byCardId;
export const selectProgressStatus = (state) => state.progress.status;
export const selectProgressError = (state) => state.progress.error;
export const selectCardProgress = (state, cardId) =>
  state.progress.byCardId[cardId] || null;

export default progressSlice.reducer;
