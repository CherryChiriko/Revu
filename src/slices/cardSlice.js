// src/slices/cardSlice.js
import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";
import { getCardStatus } from "../utils/cardUtils";

const TABLES = {
  A: "cards_a",
  C: "cards_c",
};

const PROGRESS = {
  A: "card_a_progress",
  C: "card_c_progress",
};

export const fetchCards = createAsyncThunk(
  "cards/fetchCards",
  async ({ deck_id, study_mode, user_id }, { rejectWithValue }) => {
    try {
      if (!deck_id || !study_mode || !user_id) {
        throw new Error("Missing required parameters");
      }

      const table = TABLES[study_mode];
      const progressTable = PROGRESS[study_mode];

      if (!table || !progressTable) {
        throw new Error(`Invalid study mode: ${study_mode}`);
      }

      // Fetch cards from the appropriate table
      const { data: cards, error: cardsError } = await supabase
        .from(table)
        .select("*")
        .eq("deck_id", deck_id);

      if (cardsError) throw cardsError;

      if (!cards || cards.length === 0) {
        return [];
      }

      // Fetch progress for these cards
      // const cardIds = cards.map((c) => c.id);
      const { data: progressData, error: progressError } = await supabase
        .from(progressTable)
        .select("*")
        .eq("deck_id", deck_id)
        .eq("user_id", user_id)
        .limit(200); // Limit to 200 for performance; adjust as needed

      console.log(progressData);

      if (progressError) {
        console.warn("[fetchCards] Progress fetch failed:", progressError);
        // Continue without progress data
      }

      // Create a map of card_id -> progress
      const progressMap = {};
      if (progressData) {
        progressData.forEach((p) => {
          progressMap[p.card_id] = p;
        });
      }

      // Merge cards with their progress
      const mergedCards = cards.map((card) => {
        const progress = progressMap[card.id] || {
          user_id,
          deck_id,
          card_id: card.id,
          ease_factor: 2.5,
          review_interval: 0,
          repetitions: 0,
          due_date: null,
          last_studied: null,
          status: "new",
          suspended: false,
        };

        const status = getCardStatus(progress);

        return {
          ...card,
          ...progress,
          status: status,
          card_id: card.id,
        };
      });

      return mergedCards;
    } catch (err) {
      console.error("[fetchCards] Error:", err);
      return rejectWithValue(err.message);
    }
  },
);

const cardSlice = createSlice({
  name: "cards",
  initialState: {
    cards: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearCards(state) {
      state.cards = [];
      state.status = "idle";
      state.error = null;
    },
    updateCardProgress(state, action) {
      const { cardId, updates } = action.payload;

      if (cardId !== -1) {
        // 1. Calculate the final updated card object immutably
        const updatedCard = {
          ...state.cards[cardId],
          ...updates,
          status: "waiting",
        };

        // 2. Replace the card immutably and update array reference
        state.cards[cardId] = updatedCard;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cards = action.payload;
        state.error = null;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load cards";
      });
  },
});

export const { clearCards, updateCardProgress } = cardSlice.actions;

export const selectCards = (state) => state.cards.cards;
export const selectCardsStatus = (state) => state.cards.status;
export const selectCardsError = (state) => state.cards.error;

export default cardSlice.reducer;
