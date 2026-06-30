import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../slices/themeSlice";
import deckReducer, { clearDecks } from "../slices/deckSlice";
import cardReducer from "../slices/cardSlice";
import streakReducer, { clearStreak } from "../slices/streakSlice";
import userReducer, { clearUser } from "../slices/userSlice";
import progressReducer from "../slices/progressSlice";
import activityReducer, { resetActivity } from "../slices/activitySlice";
import settingsReducer, {
  getPersistableSettings,
  SETTINGS_STORAGE_KEY,
  resetSettings,
} from "../slices/settingsSlice";
import { getTodayISO } from "../utils/dateHelper";

const checkMidnightReset = () => {
  try {
    const savedDate = localStorage.getItem("activeDeckIdDate");
    const today = getTodayISO();
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

checkMidnightReset();

/**
 * Resets all user-specific Redux state on logout or user switch.
 *
 * IMPORTANT: useAuth clears localStorage BEFORE dispatching this, so that
 * resetSettings() returns defaultSettings rather than re-hydrating stale
 * values from the previous user's localStorage cache.
 *
 * clearUser is included so the profile slice doesn't hold user1's data
 * while user2's profile is being fetched, which would cause a brief flash
 * of the wrong avatar/username.
 */
export const resetAllUserState = () => (dispatch) => {
  console.log("[store] resetAllUserState called");
  dispatch(clearDecks());
  dispatch(clearStreak());
  dispatch(resetActivity());
  dispatch(clearUser());
  dispatch(resetSettings());
};

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    decks: deckReducer,
    cards: cardReducer,
    users: userReducer,
    streak: streakReducer,
    progress: progressReducer,
    activity: activityReducer,
    settings: settingsReducer,
  },
});

let previousPersistedSettings = JSON.stringify(
  getPersistableSettings(store.getState().settings),
);

store.subscribe(() => {
  try {
    if (typeof localStorage === "undefined") return;
    const nextPersistedSettings = JSON.stringify(
      getPersistableSettings(store.getState().settings),
    );
    if (nextPersistedSettings !== previousPersistedSettings) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, nextPersistedSettings);
      previousPersistedSettings = nextPersistedSettings;
    }
  } catch (error) {
    console.error("Failed to persist settings", error);
  }
});
