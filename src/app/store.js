import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../slices/themeSlice";
import deckReducer from "../slices/deckSlice";
import cardReducer from "../slices/cardSlice";
import streakReducer from "../slices/streakSlice";
import userReducer from "../slices/userSlice";
import progressReducer from "../slices/progressSlice";
import activityReducer from "../slices/activitySlice";
import { getTodayISO } from "../utils/dateHelper";

const checkMidnightReset = () => {
  try {
    const savedDate = localStorage.getItem("activeDeckIdDate");
    const today = getTodayISO();

    // If a saved date exists and it doesn't match today's date, it's a new day!
    if (savedDate && savedDate !== today) {
      localStorage.removeItem("activeDeckId");
      localStorage.removeItem("activeDeckIdDate");
      console.log("🌙 New day detected! Cleared cached active deck selection.");
    }
  } catch (error) {
    console.error(
      "Failed to read/write localStorage for midnight reset",
      error,
    );
  }
};

// Execute the check immediately upon application initialization
checkMidnightReset();

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    decks: deckReducer,
    cards: cardReducer,
    users: userReducer,
    streak: streakReducer,
    progress: progressReducer,
    activity: activityReducer,
  },
});
