import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { selectActiveTheme } from "./slices/themeSlice";
import {
  clearUser,
  fetchUserProfile,
  selectUserProfile,
  completeTutorial, // 🌟 Updated to use our new single async thunk
} from "./slices/userSlice";
import { selectSettings } from "./slices/settingsSlice";
import {
  clearDecks,
  selectDeckStatus,
  selectDeckError,
} from "./slices/deckSlice";
import { clearCards } from "./slices/cardSlice";
import { clearProgress } from "./slices/progressSlice";
import { clearStreak } from "./slices/streakSlice";
import { resetActivity } from "./slices/activitySlice";
import { hydrateFromProfile } from "./slices/settingsSlice";

import useAuth from "./hooks/useAuth";
import useDeckLiveSync from "./hooks/useDeckLiveSync";
import useGlobalStatsLiveSync from "./hooks/useGlobalStatsLiveSync";
import useAppBoot from "./hooks/useAppBoot";

import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import DeckListView from "./components/Decks/views/DeckListView";
import DeckDetails from "./components/DeckDetails/views/DeckDetails";
import ImportView from "./components/Import/views/ImportView";
import StudySession from "./components/Study/views/StudySession";
import { SettingsPage } from "./components/Settings/SettingsPage";
import SettingsView from "./components/Settings/views/SettingsView";
import ActivityPage from "./components/Activity/views/ActivityPage";
import LoginPage from "./components/Login/components/LoginPage";
import NotFound404 from "./components/404";

import ScrollToTop from "./components/General/routing/ScrollToTop";
import DecksLoader from "./components/Loaders/DecksLoader";
import StatsLoader from "./components/Loaders/StatsLoader";
import ResetPasswordPage from "./components/Login/components/ResetPasswordPage";
import Tutorial from "./components/Tutorial/components/Tutorial";
import LoadingSpinner from "./components/General/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { useBackButton } from "./hooks/useBackButton";

// ─── Stable route tree ────────────────────────────────────────────────────────
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

  useBackButton();

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
    if (profile) dispatch(hydrateFromProfile(profile));
  }, [profile, dispatch]);

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
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  if (isPublicPath) {
    return (
      <div
        style={{
          backgroundColor: activeTheme.background.app,
          color: activeTheme.text.primary,
          minHeight: "100vh",
        }}
      >
        <ScrollToTop />
        <AppRoutes {...routeProps} />
      </div>
    );
  }

  if (!session) {
    return <LoginPage activeTheme={activeTheme} />;
  }

  const isSettingsPath = location.pathname.startsWith("/settings");
  const shouldLoadDeckData = !!session && !isSettingsPath;
  const shouldLoadStatsData = !!session;

  // if (status === "loading" || status === "idle") {
  //   if (isSettingsPath && session) {
  //     return (
  //       <>
  //         <StatsLoader session={session} authLoading={authLoading} />
  //         <div
  //           style={{
  //             backgroundColor: activeTheme.background.app,
  //             color: activeTheme.text.primary,
  //             minHeight: "100vh",
  //           }}
  //         >
  //           <Navbar />
  //           <main>
  //             <ScrollToTop />
  //             <AppRoutes {...routeProps} />
  //           </main>
  //         </div>
  //       </>
  //     );
  //   }

  //   const isImportPath = location.pathname.startsWith("/decks/import");
  //   if (isImportPath && session) {
  //     return (
  //       <>
  //         <DecksLoader session={session} authLoading={authLoading} />
  //         <StatsLoader session={session} authLoading={authLoading} />
  //         <div
  //           style={{
  //             backgroundColor: activeTheme.background.app,
  //             color: activeTheme.text.primary,
  //             minHeight: "100vh",
  //           }}
  //         >
  //           <Navbar />
  //           <main>
  //             <ScrollToTop />
  //             <AppRoutes {...routeProps} />
  //           </main>
  //         </div>
  //       </>
  //     );
  //   }
  //   return (
  //     <>
  //       <DecksLoader session={session} authLoading={authLoading} />
  //       <StatsLoader session={session} authLoading={authLoading} />
  //       <div
  //         className={`${activeTheme.background.app} min-h-screen flex items-center justify-center`}
  //       >
  //         <LoadingSpinner fullScreen />
  //       </div>
  //     </>
  //   );
  // }

  if (session && (status === "loading" || status === "idle")) {
    if (isSettingsPath) {
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
          <LoadingSpinner fullScreen />
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

  // 🌟 Check if 'general' key inside JSONB object is missing or false
  const shouldShowGeneralTutorial =
    !!profile && profile.completed_tutorials?.general !== true;

  // 🌟 Clean presentation layer: Dispatches key directly to your thunk
  const handleCloseGeneralTutorial = () => {
    dispatch(completeTutorial("general"));
  };

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

      {shouldShowGeneralTutorial && (
        <Tutorial
          activeTheme={activeTheme}
          onClose={handleCloseGeneralTutorial}
        />
      )}
    </>
  );
}

export default App;
