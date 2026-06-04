import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "../utils/supabaseClient";
import { getTodayISO } from "../utils/dateHelper";

/** Priority ordering */
const orderDecksByPriority = (decks) => {
  if (!decks || decks.length === 0) return [];

  const dueDecks = decks.filter((d) => d.due > 0).sort((a, b) => b.due - a.due);
  const newDecks = decks.filter((d) => !dueDecks.includes(d) && d.new > 0);
  const masteredDecks = decks.filter(
    (d) => !dueDecks.includes(d) && !newDecks.includes(d),
  );

  return [...dueDecks, ...newDecks, ...masteredDecks];
};

const normalizeDeck = (deck) => {
  const id = deck.deck_id ?? deck.id;
  return {
    ...deck,
    deck_id: id,
    id: id, // Ensure both variants are identical to prevent lookup failure
    due: deck.due_count ?? 0,
    waiting: deck.waiting_count ?? 0,
    new: deck.new_count ?? 0,
    mastered: deck.mastered_count ?? 0,
    suspended: deck.suspended_count ?? 0,
  };
};

const countsFromDeck = (deck) => ({
  deckId: deck.deck_id ?? deck.id,
  new: deck.new_count ?? 0,
  mastered: deck.mastered_count ?? 0,
  suspended: deck.suspended_count ?? 0,
  waiting: deck.waiting_count ?? 0,
  due: deck.due_count ?? 0,
});

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

      return (data || []).map(normalizeDeck);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/** Deck counters */
export const fetchDeckCounts = createAsyncThunk(
  "cards/fetchDeckCounts",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .select(
          "id, new_count, due_count, waiting_count, mastered_count, suspended_count",
        )
        .eq("user_id", user_id);

      if (error) throw error;

      const deckCounts = {};
      for (const deck of data || []) {
        // Enforce alignment with the main id property key string type
        const idKey = deck.id;
        deckCounts[idKey] = countsFromDeck(deck);
      }

      return deckCounts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  decks: [],
  deckCounts: {},
  activeDeckId: localStorage.getItem("activeDeckId") || null,
  status: "idle",
  error: null,
  countsLoading: false,
  countsError: null,
};

export function updateDeckStatsFromRealtime(state, action) {
  const row = action.payload;
  const targetId = row.deck_id ?? row.id;

  const index = state.decks.findIndex((d) => d.deck_id === targetId);
  if (index !== -1) {
    state.decks[index] = normalizeDeck({
      ...state.decks[index],
      due_count: row.due_count,
      waiting_count: row.waiting_count,
      new_count: row.new_count,
      mastered_count: row.mastered_count ?? state.decks[index].mastered_count,
      suspended_count: row.suspended_count,
    });
  }

  state.deckCounts[targetId] = {
    ...(state.deckCounts[targetId] || { deckId: targetId }),
    due: row.due_count ?? 0,
    waiting: row.waiting_count ?? 0,
    new: row.new_count ?? 0,
    mastered: row.mastered_count ?? state.deckCounts[targetId]?.mastered ?? 0,
    suspended: row.suspended_count ?? 0,
  };
}

const deckSlice = createSlice({
  name: "decks",
  initialState,
  reducers: {
    setActiveDeck(state, action) {
      const id = action.payload;
      state.activeDeckId = id;

      if (id) {
        const today = getTodayISO();

        localStorage.setItem("activeDeckId", id);
        localStorage.setItem("activeDeckIdDate", today);
      } else {
        localStorage.removeItem("activeDeckId");
        localStorage.removeItem("activeDeckIdDate");
      }
    },
    updateDeckFromRealtime(state, action) {
      const deck = action.payload;
      const targetId = deck.id ?? deck.deck_id;
      const index = state.decks.findIndex((d) => d.deck_id === targetId);

      if (index !== -1) {
        state.decks[index] = normalizeDeck({
          ...state.decks[index],
          ...deck,
          deck_id: targetId,
        });
        state.deckCounts[targetId] = countsFromDeck(state.decks[index]);
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
        const normalized = (action.payload || []).map(normalizeDeck);
        const sorted = orderDecksByPriority(normalized);

        state.decks = sorted;
        state.deckCounts = Object.fromEntries(
          sorted.map((deck) => [deck.deck_id, countsFromDeck(deck)]),
        );

        const persistedId =
          state.activeDeckId || localStorage.getItem("activeDeckId");

        // Debug information to help trace why a particular deck becomes active
        try {
          console.debug(
            "[deckSlice] fetchDecks.fulfilled - persistedId:",
            persistedId,
            "(type:",
            typeof persistedId,
            ")",
          );
          console.debug(
            "[deckSlice] fetchDecks.fulfilled - sorted decks (deck_id:due):",
            sorted.map((d) => ({ id: d.deck_id, due: d.due })),
          );
        } catch (e) {
          /* ignore debug failures */
        }

        if (persistedId) {
          // Use string coercion to avoid type mismatches between stored ids and fetched ids
          const match = sorted.find(
            (d) => String(d.deck_id) === String(persistedId),
          );
          if (match) {
            state.activeDeckId = persistedId;
            try {
              console.debug(
                "[deckSlice] Keeping persisted activeDeckId:",
                persistedId,
              );
            } catch (e) {}
          } else {
            state.activeDeckId = sorted[0]?.deck_id || null;
            localStorage.setItem("activeDeckId", state.activeDeckId);
            try {
              console.debug(
                "[deckSlice] persistedId not found in fetched decks, selecting:",
                state.activeDeckId,
              );
            } catch (e) {}
          }
        } else {
          state.activeDeckId = sorted[0]?.deck_id || null;
          if (state.activeDeckId) {
            localStorage.setItem("activeDeckId", state.activeDeckId);
          }
          try {
            console.debug(
              "[deckSlice] No persistedId, selected first prioritized deck:",
              state.activeDeckId,
            );
          } catch (e) {}
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
export const selectDeckNameById = (deckId) =>
  createSelector(
    (state) => state.decks.decks,
    (decks) => {
      const deck = decks.find((d) => d.deck_id === deckId);
      return deck ? deck.name : null;
    },
  );

export const selectDeckCounts = (state) => state.decks.deckCounts;
export const selectDeckCountsById = (deckId) =>
  createSelector(
    (state) => state.decks.decks,
    (decks) => {
      const deck = decks.find((d) => d.deck_id === deckId);
      if (!deck) return null;
      return {
        deckId: deckId,
        new: deck.new ?? 0,
        due: deck.due ?? 0,
        waiting: deck.waiting ?? 0,
        mastered: deck.mastered ?? 0,
        suspended: deck.suspended ?? 0,
      };
    },
  );

export const selectTotalDueCards = (state) => {
  const deckCounts = state.decks.deckCounts;
  return Object.values(deckCounts).reduce(
    (total, d) => total + (d.due || 0),
    0,
  );
};
export const selectTotalMasteredCards = (state) => {
  const deckCounts = state.decks.deckCounts;
  return Object.values(deckCounts).reduce(
    (total, d) => total + (d.mastered || 0),
    0,
  );
};
export const selectDeckStatus = (state) => state.decks.status;
export const selectDeckError = (state) => state.decks.error;

export default deckSlice.reducer;
