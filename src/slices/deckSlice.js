import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";
import { getCardStatus } from "../utils/cardUtils";

/** Priority ordering */
const orderDecksByPriority = (decks) => {
  if (!decks || decks.length === 0) return [];

  const dueDecks = decks.filter((d) => d.due > 0).sort((a, b) => b.due - a.due);
  const newDecks = decks.filter(
    (d) => !dueDecks.includes(d) && d.cards_count - d.mastered - d.due > 0
  );
  const masteredDecks = decks.filter(
    (d) => !dueDecks.includes(d) && !newDecks.includes(d)
  );

  return [...dueDecks, ...newDecks, ...masteredDecks];
};

/** Fetch decks */
export const fetchDecks = createAsyncThunk(
  "decks/fetchDecks",
  async (_, { rejectWithValue }) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((deck) => ({
        ...deck,
        deck_id: deck.id,
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const getStatus = (progress) => {
  let actualStatus;

  const now = Date.now();

  if (progress.suspended) {
    actualStatus = "suspended";
  } else {
    switch (progress.status) {
      case "mastered":
      case "new":
        actualStatus = progress.status;
        break;
      case "waiting": {
        const dueDate = progress.due_date
          ? Date.parse(progress.due_date)
          : null;
        actualStatus = dueDate !== null && dueDate <= now ? "due" : "waiting";
        break;
      }
      default:
        actualStatus = "new";
    }
  }
  return actualStatus;
};

/** Deck counters */
/** Deck counters */
export const fetchDeckCounts = createAsyncThunk(
  "cards/fetchDeckCounts",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      // Fetch both progress tables
      const { data: progressA, error: errorA } = await supabase
        .from("card_a_progress")
        .select("deck_id, status, suspended, due_date")
        .eq("user_id", user_id);

      if (errorA) throw errorA;

      const { data: progressC, error: errorC } = await supabase
        .from("card_c_progress")
        .select("deck_id, status, suspended, due_date")
        .eq("user_id", user_id);

      if (errorC) throw errorC;

      const allProgress = [...(progressA || []), ...(progressC || [])];

      const deckCounts = {};

      for (const record of allProgress) {
        const deckId = record.deck_id;

        if (!deckCounts[deckId]) {
          deckCounts[deckId] = {
            deckId,
            new: 0,
            mastered: 0,
            suspended: 0,
            waiting: 0,
            due: 0,
          };
        }

        const status = getStatus(record);
        deckCounts[deckId][status]++;
      }

      return deckCounts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  decks: [],
  deckCounts: {},
  activeDeckId: localStorage.getItem("activeDeckId") || null,
  status: "idle",
  error: null,
};

export const getTotalDueCards = (deckCounts) => {
  if (!deckCounts || typeof deckCounts !== "object") return 0;

  return Object.values(deckCounts).reduce((sum, deck) => {
    // Safety: ensure deck.due exists and is numeric
    const due = typeof deck.due === "number" ? deck.due : 0;
    return sum + due;
  }, 0);
};

const deckSlice = createSlice({
  name: "decks",
  initialState,
  reducers: {
    setActiveDeck(state, action) {
      const id = action.payload;
      state.activeDeckId = id;
      localStorage.setItem("activeDeckId", id);
    },
    updateDeckFromRealtime(state, action) {
      const deck = action.payload;
      const index = state.decks.findIndex((d) => d.deck_id === deck.id);

      if (index !== -1) {
        state.decks[index] = {
          ...state.decks[index],
          ...deck,
          deck_id: deck.id,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDecks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        const decks = action.payload;

        const normalized = decks.map((d) => ({
          ...d,
          deck_id: d.id,
        }));

        const sorted = orderDecksByPriority(normalized);
        state.decks = sorted;

        // Restore persisted active deck
        const persistedId =
          state.activeDeckId || localStorage.getItem("activeDeckId");

        if (persistedId) {
          const match = sorted.find((d) => d.deck_id === persistedId);

          if (match) {
            state.activeDeckId = persistedId;
          } else {
            // Persisted deck no longer exists -> fallback
            state.activeDeckId = sorted[0]?.deck_id || null;
            localStorage.setItem("activeDeckId", state.activeDeckId);
          }
        } else {
          // No persisted active deck -> use default first deck
          state.activeDeckId = sorted[0]?.deck_id || null;
          if (state.activeDeckId) {
            localStorage.setItem("activeDeckId", state.activeDeckId);
          }
        }

        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load decks";
      })
      .addCase(fetchDeckCounts.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchDeckCounts.fulfilled, (state, action) => {
        state.deckCounts = action.payload;
        state.countsLoading = false;
      })
      .addCase(fetchDeckCounts.rejected, (state, action) => {
        state.countsError = action.payload;
        state.countsLoading = false;
      });
  },
});

export const { setActiveDeck, updateDeckFromRealtime } = deckSlice.actions;

export const selectDecks = (state) => state.decks.decks;
export const selectActiveDeck = (state) => {
  return (
    state.decks.decks.find((d) => d.deck_id === state.decks.activeDeckId) ||
    null
  );
};

export const selectDeckCounts = (state) => state.decks.deckCounts;
export const selectTotalDueCards = (state) => {
  const deckCounts = state.decks.deckCounts;
  return Object.values(deckCounts).reduce(
    (total, d) => total + (d.due || 0),
    0
  );
};
export const selectDeckStatus = (state) => state.decks.status;
export const selectDeckError = (state) => state.decks.error;

export default deckSlice.reducer;
