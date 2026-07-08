import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";

const TABLES = {
  A: "card_a_progress",
  C: "card_c_progress",
};

export const updateProgress = createAsyncThunk(
  "progress/updateProgress",
  async ({ sessionUpdates, study_mode }, { rejectWithValue }) => {
    if (!sessionUpdates?.length || !study_mode) {
      return rejectWithValue("Missing required fields: updates or study_mode");
    }

    const table = TABLES[study_mode];
    if (!table) {
      return rejectWithValue(`Invalid study mode: ${study_mode}`);
    }

    try {
      const progressUpdates = sessionUpdates.map(({ xp_earned, ...update }) => update);

      const { error } = await supabase.from(table).upsert(progressUpdates, {
        onConflict: ["user_id", "card_id"],
      });

      if (error) throw error;
      return progressUpdates;
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
        for (const update of action.payload || []) {
          state.byCardId[update.card_id] = {
            ...state.byCardId[update.card_id],
            ...update,
          };
        }
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
