import React from "react";
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
import ImportView from "./components/Import/ImportView";
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
import CardsLoader from "./components/Loaders/CardsLoader";
import StatsLoader from "./components/Loaders/StatsLoader";
import ResetPasswordPage from "./components/ResetPasswordPage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
  const activeDeck = useSelector(selectActiveDeck);
  const previousUserIdRef = React.useRef(null);

  const publicPaths = ["/reset-password"];
  const isPublicPath = publicPaths.includes(location.pathname);

  useDeckLiveSync(session && status === "succeeded");
  useGlobalStatsLiveSync(!!session);
  useAppBoot(session);

  React.useEffect(() => {
    const currentUserId = session?.user?.id || null;
    console.log(
      "[App] session user id changed",
      currentUserId,
      "prev",
      previousUserIdRef.current,
    );

    if (!currentUserId) {
      console.log(
        "[App] clearing user-specific redux state on logout or missing session",
      );
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
        "[App] user changed, clearing stale state between accounts",
        previousUserIdRef.current,
        currentUserId,
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

  function setPrimeTheme(isDark) {
    const themeLink = document.getElementById("primereact-theme");
    if (!themeLink) return;

    themeLink.href = isDark
      ? "/themes/lara-dark-indigo/theme.css"
      : "/themes/lara-light-blue/theme.css";
  }

  React.useEffect(() => {
    setPrimeTheme(activeTheme.isDark);
    document.documentElement.classList.toggle("dark", activeTheme.isDark);
  }, [activeTheme.isDark]);

  // Auth check
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

  // Render DecksLoader to trigger fetch (but show loading UI)
  const isSettingsPath = location.pathname.startsWith("/settings");
  const shouldLoadDeckData = !!session && !isSettingsPath;
  const shouldLoadStatsData = !!session;

  const settingsRoutes = (
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
  );

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
              <Routes>{settingsRoutes}</Routes>
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
            Loading decks...
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

  // All good: decks loaded + user authenticated
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
        <CardsLoader activeDeck={activeDeck} userId={session?.user?.id} />
        <Navbar />
        <main>
          <ScrollToTop />
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
            {settingsRoutes}
            <Route
              path="/reset-password"
              element={<ResetPasswordPage activeTheme={activeTheme} />}
            />

            <Route
              path="*"
              element={<NotFound404 activeTheme={activeTheme} />}
            />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
