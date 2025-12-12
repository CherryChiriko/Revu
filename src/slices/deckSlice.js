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

const initialState = {
  decks: [],
  activeDeckId: localStorage.getItem("activeDeckId") || null,
  status: "idle",
  error: null,
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
export const selectDeckStatus = (state) => state.decks.status;
export const selectDeckError = (state) => state.decks.error;

export default deckSlice.reducer;
