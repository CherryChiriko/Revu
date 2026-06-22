// src/slices/cardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";
import { getCardStatus } from "../utils/cardUtils";
import { CHUNK_SIZE } from "../utils/constants";

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
  sessionMode,
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

  const relationToken =
    study_mode === "A"
      ? `${progressTable}!card_a_progress_card_id_fkey`
      : `${progressTable}!card_c_progress_card_id_fkey`;

  // ── Step 1: For study sessions, get eligible card IDs from progress table ──
  // This is reliable — direct query on progress table, no join issues.
  let eligibleCardIds = null; // null = no filter (DeckDetails shows all)

  if (sessionMode === "learn" || sessionMode === "review") {
    const statusFilter = sessionMode === "learn" ? "new" : "due";

    const { data: progressRows, error: progressError } = await supabase
      .from(progressTable)
      .select("card_id")
      .eq("user_id", user_id)
      .eq("deck_id", deck_id)
      .eq("status", statusFilter);

    if (progressError) throw progressError;

    // Cards with a progress row matching the status
    const progressCardIds = new Set((progressRows || []).map((p) => p.card_id));

    if (sessionMode === "learn") {
      // For learn mode: also include cards with NO progress row (genuinely new)
      // We'll resolve this after fetching all cards below
      eligibleCardIds = { type: "learn", progressIds: progressCardIds };
    } else {
      // For review mode: only cards explicitly marked "due"
      eligibleCardIds = { type: "review", progressIds: progressCardIds };

      // If no due cards, return early
      if (progressCardIds.size === 0) return [];
    }
  }

  // ── Step 2: Fetch cards with their progress rows ──
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
    .order("created_at", { ascending: true });

  // For review mode, filter to only eligible cards at the DB level
  if (
    eligibleCardIds?.type === "review" &&
    eligibleCardIds.progressIds.size > 0
  ) {
    query = query.in("id", [...eligibleCardIds.progressIds]);
  }

  // Pagination only for DeckDetails (no sessionMode)
  if (
    !sessionMode &&
    typeof page === "number" &&
    typeof pageSize === "number"
  ) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data: rawCards, error: cardsError } = await query;
  if (cardsError) throw cardsError;
  if (!rawCards || rawCards.length === 0) return [];

  // ── Step 3: Filter progress rows to this user in JS (join returns all users) ──
  const mixedCards = rawCards.map((card) => ({
    ...card,
    progress: (card.progress || []).filter((p) => p.user_id === user_id),
  }));

  // ── Step 4: Map cards with their progress ──
  const mappedCards = mixedCards.map((card) => {
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

  // ── Step 5: For learn mode, filter to new cards (no progress row OR status=new) ──
  if (eligibleCardIds?.type === "learn") {
    const { progressIds } = eligibleCardIds;
    const filtered = mappedCards.filter((card) => {
      const hasProgressRow =
        mixedCards.find((r) => r.id === card.card_id)?.progress?.length > 0;
      // Include if: no progress row (truly new) OR progress row with status=new
      return !hasProgressRow || progressIds.has(card.card_id);
    });

    // Paginate in JS after filtering
    if (typeof page === "number" && typeof pageSize === "number") {
      return filtered.slice(page * pageSize, page * pageSize + pageSize);
    }
    return filtered;
  }

  // ── Step 6: For review mode, cards already filtered at DB level ──
  if (eligibleCardIds?.type === "review") {
    if (typeof page === "number" && typeof pageSize === "number") {
      return mappedCards.slice(page * pageSize, page * pageSize + pageSize);
    }
    return mappedCards;
  }

  // ── No sessionMode: DeckDetails, already paginated at DB level ──
  return mappedCards;
}

// Initial load — replaces all cards in state
export const fetchCards = createAsyncThunk(
  "cards/fetchCards",
  async (
    {
      deck_id,
      study_mode,
      user_id,
      sessionMode,
      page = 0,
      pageSize = CHUNK_SIZE,
    },
    { rejectWithValue },
  ) => {
    try {
      return await loadCardsForDeck({
        deck_id,
        study_mode,
        user_id,
        sessionMode,
        page,
        pageSize,
      });
    } catch (err) {
      console.error("[fetchCards] Error:", err);
      return rejectWithValue(err.message);
    }
  },
);

// Pagination for DeckDetails — no sessionMode, returns all statuses, paginated at DB level
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

// Prefetch next batch during study session — appends to existing cards
export const fetchMoreCards = createAsyncThunk(
  "cards/fetchMoreCards",
  async (
    { deck_id, study_mode, user_id, sessionMode, page, pageSize },
    { rejectWithValue },
  ) => {
    try {
      return await loadCardsForDeck({
        deck_id,
        study_mode,
        user_id,
        sessionMode,
        page,
        pageSize,
      });
    } catch (err) {
      console.error("[fetchMoreCards] Error:", err);
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
        state.cards[cardId] = {
          ...state.cards[cardId],
          ...updates,
          status: "waiting",
        };
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
      })
      .addCase(fetchMoreCards.fulfilled, (state, action) => {
        const existingIds = new Set(state.cards.map((c) => c.card_id));
        const newCards = action.payload.filter(
          (c) => !existingIds.has(c.card_id),
        );
        state.cards = [...state.cards, ...newCards];
      });
  },
});

export const { clearCards, updateCardProgress } = cardSlice.actions;

export const selectCards = (state) => state.cards.cards;
export const selectCardsStatus = (state) => state.cards.status;
export const selectCardsError = (state) => state.cards.error;

export default cardSlice.reducer;
