// src/slices/cardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

async function loadCardsForDeck({
  deck_id,
  study_mode,
  user_id,
  page,
  pageSize,
}) {
  if (!deck_id || !study_mode || !user_id) {
    throw new Error("Missing required parameters");
  }

  const table = TABLES[study_mode];
  const progressTable = PROGRESS[study_mode];

  if (!table || !progressTable) {
    throw new Error(`Invalid study mode: ${study_mode}`);
  }

  // 🌟 FIX: Choose the correct explicit relationship token based on study_mode
  // This satisfies Supabase's PGRST201 requirement
  const relationToken =
    study_mode === "A"
      ? `${progressTable}!card_a_progress_card_id_fkey`
      : `${progressTable}!card_c_progress_card_id_fkey`; // Assuming naming conventions match across schemas

  let query = supabase
    .from(table)
    .select(
      `
      *,
      progress: ${relationToken} (
        user_id,
        deck_id,
        card_id,
        ease_factor,
        review_interval,
        repetitions,
        due_date,
        last_studied,
        status,
        suspended
      )
    `,
    )
    .eq("deck_id", deck_id)
    .eq(`${progressTable}.user_id`, user_id)
    .order("created_at", { ascending: true });

  if (typeof page === "number" && typeof pageSize === "number") {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data: mixedCards, error: cardsError } = await query;
  if (cardsError) throw cardsError;
  if (!mixedCards || mixedCards.length === 0) return [];

  return mixedCards.map((card) => {
    const progress = card.progress?.[0] || {
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

    const cleanCard = { ...card };
    delete cleanCard.progress;

    return {
      ...cleanCard,
      ...progress,
      status: getCardStatus(progress),
      card_id: card.id,
    };
  });
}

export const fetchCards = createAsyncThunk(
  "cards/fetchCards",
  async ({ deck_id, study_mode, user_id }, { rejectWithValue }) => {
    try {
      return await loadCardsForDeck({ deck_id, study_mode, user_id });
    } catch (err) {
      console.error("[fetchCards] Error:", err);
      return rejectWithValue(err.message);
    }
  },
);

export const fetchCardsPage = createAsyncThunk(
  "cards/fetchCardsPage",
  async (
    { deck_id, study_mode, user_id, page = 0, pageSize = 50 },
    { rejectWithValue },
  ) => {
    try {
      return await loadCardsForDeck({
        deck_id,
        study_mode,
        user_id,
        page,
        pageSize,
      });
    } catch (err) {
      console.error("[fetchCardsPage] Error:", err);
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
        const updatedCard = {
          ...state.cards[cardId],
          ...updates,
          status: "waiting",
        };
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
