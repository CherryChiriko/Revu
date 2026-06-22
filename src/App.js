import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { selectActiveTheme } from "./slices/themeSlice";
import {
  clearUser,
  fetchUserProfile,
  selectUserProfile,
} from "./slices/userSlice";
import { selectSettings } from "./slices/settingsSlice";
import {
  clearDecks,
  selectActiveDeck,
  selectDeckStatus,
  selectDeckError,
} from "./slices/deckSlice";
import { clearCards } from "./slices/cardSlice";
import { clearProgress } from "./slices/progressSlice";
import { clearStreak } from "./slices/streakSlice";
import { resetActivity } from "./slices/activitySlice";

import useAuth from "./hooks/useAuth";
import useDeckLiveSync from "./hooks/useDeckLiveSync";
import useGlobalStatsLiveSync from "./hooks/useGlobalStatsLiveSync";
import useAppBoot from "./hooks/useAppBoot";

import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import DeckListView from "./components/Decks/views/DeckListView";
import DeckDetails from "./components/Decks/views/DeckDetails";
import ImportView from "./components/Import/views/ImportView";
import StudySession from "./components/Study/views/StudySession";
import {
  SettingsPage,
  SettingsAccountPage,
} from "./components/Settings/SettingsPage";
import SettingsView from "./components/Settings/views/SettingsView";
import ActivityPage from "./components/Activity/ActivityPage";
import LoginPage from "./components/LoginPage";
import NotFound404 from "./components/404";

import ScrollToTop from "./components/General/routing/ScrollToTop";
import DecksLoader from "./components/Loaders/DecksLoader";
import StatsLoader from "./components/Loaders/StatsLoader";
import ResetPasswordPage from "./components/ResetPasswordPage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// ─── Stable route tree ────────────────────────────────────────────────────────
// Defined OUTSIDE App so React never sees a new component type on re-render.
// If this were inside App, every App re-render would produce a new component
// reference, forcing React to unmount and remount the entire route tree
// (including StudySession), resetting all state.
const AppRoutes = ({
  profile,
  settings,
  activeTheme,
  allThemes,
  currentThemeName,
  dispatch,
}) => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/decks" element={<DeckListView />} />
    <Route
      path="/decks/import"
      element={<ImportView activeTheme={activeTheme} />}
    />
    <Route
      path="/decks/:deckId"
      element={<DeckDetails activeTheme={activeTheme} />}
    />
    <Route path="/study" element={<StudySession />} />
    <Route path="/activity" element={<ActivityPage />} />
    <Route path="/settings" element={<SettingsView />}>
      <Route
        index
        element={
          <SettingsPage
            profile={profile}
            settings={settings}
            activeTheme={activeTheme}
            allThemes={allThemes}
            currentThemeName={currentThemeName}
            dispatch={dispatch}
          />
        }
      />
      <Route
        path="account"
        element={
          <SettingsAccountPage
            profile={profile}
            activeTheme={activeTheme}
            dispatch={dispatch}
          />
        }
      />
    </Route>
    <Route
      path="/reset-password"
      element={<ResetPasswordPage activeTheme={activeTheme} />}
    />
    <Route path="*" element={<NotFound404 activeTheme={activeTheme} />} />
  </Routes>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);
  const allThemes = useSelector((state) => state.theme.allThemes);
  const currentThemeName = useSelector((state) => state.theme.currentThemeName);

  const { session, loading: authLoading } = useAuth();

  const status = useSelector(selectDeckStatus);
  const error = useSelector(selectDeckError);
  const previousUserIdRef = useRef(null);

  const publicPaths = ["/reset-password"];
  const isPublicPath = publicPaths.includes(location.pathname);

  useDeckLiveSync(session && status === "succeeded");
  useGlobalStatsLiveSync(!!session);
  useAppBoot(session);

  useEffect(() => {
    const currentUserId = session?.user?.id || null;

    if (!currentUserId) {
      console.log("[App] No active session. Purging local user state.");
      dispatch(clearUser());
      dispatch(clearDecks());
      dispatch(clearCards());
      dispatch(clearProgress());
      dispatch(clearStreak());
      dispatch(resetActivity());
    } else if (
      previousUserIdRef.current &&
      previousUserIdRef.current !== currentUserId
    ) {
      console.log(
        "[App] User ID switched. Purging residual account cache data safely.",
      );
      dispatch(clearUser());
      dispatch(clearDecks());
      dispatch(clearCards());
      dispatch(clearProgress());
      dispatch(clearStreak());
      dispatch(resetActivity());
    }

    if (currentUserId) {
      dispatch(fetchUserProfile(currentUserId));
    }

    previousUserIdRef.current = currentUserId;
  }, [dispatch, session?.user?.id]);

  useEffect(() => {
    const themeLink = document.getElementById("primereact-theme");
    if (themeLink) {
      themeLink.href = activeTheme.isDark
        ? "/themes/lara-dark-indigo/theme.css"
        : "/themes/lara-light-blue/theme.css";
    }
    document.documentElement.classList.toggle("dark", activeTheme.isDark);
  }, [activeTheme.isDark]);

  // Shared props passed down to routes
  const routeProps = {
    profile,
    settings,
    activeTheme,
    allThemes,
    currentThemeName,
    dispatch,
  };

  if (authLoading) {
    return (
      <div
        className={`${activeTheme.background.app} min-h-screen flex items-center justify-center`}
      >
        <p className={`${activeTheme.text.primary} text-xl animate-pulse`}>
          Checking session...
        </p>
      </div>
    );
  }

  if (!session && !isPublicPath) {
    return <LoginPage activeTheme={activeTheme} />;
  }

  const isSettingsPath = location.pathname.startsWith("/settings");
  const shouldLoadDeckData = !!session && !isSettingsPath;
  const shouldLoadStatsData = !!session;

  // Deck data still loading — show spinner but keep routes mounted for settings
  if (status === "loading" || status === "idle") {
    if (isSettingsPath && session) {
      return (
        <>
          <StatsLoader session={session} authLoading={authLoading} />
          <div
            style={{
              backgroundColor: activeTheme.background.app,
              color: activeTheme.text.primary,
              minHeight: "100vh",
            }}
          >
            <Navbar />
            <main>
              <ScrollToTop />
              <AppRoutes {...routeProps} />
            </main>
          </div>
        </>
      );
    }

    return (
      <>
        <DecksLoader session={session} authLoading={authLoading} />
        <StatsLoader session={session} authLoading={authLoading} />
        <div
          className={`${activeTheme.background.app} min-h-screen flex items-center justify-center`}
        >
          <p className={`${activeTheme.text.primary} text-xl animate-pulse`}>
            Loading...
          </p>
        </div>
      </>
    );
  }

  if (status === "failed") {
    return (
      <div
        className={`${activeTheme.background.app} min-h-screen flex flex-col items-center justify-center`}
      >
        <button
          onClick={() => navigate("/")}
          className={`flex items-center ${activeTheme.text.muted} hover:${activeTheme.text.primary} mb-4`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 mr-2" />
          Go back
        </button>
        <div
          className={`${activeTheme.text.primary} space-y-4 text-center text-xl`}
        >
          <p>Error loading decks: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-2 rounded ${activeTheme.button.accent2}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {shouldLoadDeckData && (
        <DecksLoader session={session} authLoading={authLoading} />
      )}
      {shouldLoadStatsData && (
        <StatsLoader session={session} authLoading={authLoading} />
      )}
      <div
        style={{
          backgroundColor: activeTheme.background.app,
          color: activeTheme.text.primary,
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <main>
          <ScrollToTop />
          <AppRoutes {...routeProps} />
        </main>
      </div>
    </>
  );
}

export default App;
