import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { selectActiveTheme } from "./slices/themeSlice";
import { clearUser, fetchUserProfile } from "./slices/userSlice";
import {
  selectActiveDeck,
  selectDeckStatus,
  selectDeckError,
} from "./slices/deckSlice";

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
import SettingsPage from "./components/Settings/SettingsPage";
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
  const { session, loading: authLoading } = useAuth();
  const status = useSelector(selectDeckStatus);
  const error = useSelector(selectDeckError);
  const activeDeck = useSelector(selectActiveDeck);

  const publicPaths = ["/reset-password"];
  const isPublicPath = publicPaths.includes(location.pathname);

  useDeckLiveSync(session && status === "succeeded");
  useGlobalStatsLiveSync(!!session);
  useAppBoot(session);

  React.useEffect(() => {
    if (session?.user?.id) {
      dispatch(fetchUserProfile(session.user.id));
    } else {
      dispatch(clearUser());
    }
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
  if (status === "loading" || status === "idle") {
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
    <div
      style={{
        backgroundColor: activeTheme.background.app,
        color: activeTheme.text.primary,
        minHeight: "100vh",
      }}
    >
      <CardsLoader activeDeck={activeDeck} />
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
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage activeTheme={activeTheme} />}
          />

          <Route path="*" element={<NotFound404 activeTheme={activeTheme} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
