import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; // 🌟 Added useDispatch
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectGlobalStreak } from "../../slices/streakSlice";
import {
  selectDecks,
  selectTotalDueCards,
  selectTotalMasteredCards,
} from "../../slices/deckSlice";
import { selectUserProfile, completeTutorial } from "../../slices/userSlice"; // 🌟 Imported new thunk action
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faClock,
  faBullseye,
  faArrowRight,
  faArrowLeft,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import RevuLogo from "../../assets/revu2.png";
import { selectTotalActivity } from "../../slices/activitySlice";

import DeckCard from "../Decks/components/DeckCard";
import { Heatmap } from "./Heatmap";
import { XPBar } from "./XPBar";
import { StatCard } from "./StatCard";
import { Toast } from "primereact/toast";
import Header from "../General/ui/Header";
import DashboardTutorial from "../Tutorial/components/DashboardTutorial";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // 🌟 Hooks up dispatch handler
  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const toast = useRef(null);

  const decks = useSelector(selectDecks);
  const [deckPage, setDeckPage] = useState(1);
  const decksPerPage = 4;
  const totalDeckPages = Math.max(1, Math.ceil(decks.length / decksPerPage));
  const pageDecks = decks.slice(
    (deckPage - 1) * decksPerPage,
    deckPage * decksPerPage,
  );

  useEffect(() => {
    setDeckPage((prevPage) => Math.min(prevPage, totalDeckPages));
  }, [totalDeckPages]);

  const cards_due_today = useSelector(selectTotalDueCards);
  const mastered_cards = useSelector(selectTotalMasteredCards);
  const globalStreak = useSelector(selectGlobalStreak);

  const totalActivity = useSelector(selectTotalActivity);

  const totalXP = useMemo(() => {
    const baseXP = totalActivity?.totalXP || 0;
    return Math.max(0, baseXP);
  }, [totalActivity]);

  // ── Spotlight tour references ─────────────────────────────────────────────
  const statsRef = useRef(null);
  const continueLearningRef = useRef(null);
  const heatmapRef = useRef(null);
  const xpBarRef = useRef(null);
  const helpRef = useRef(null);
  const spotlightRefs = {
    stats: statsRef,
    continueLearning: continueLearningRef,
    heatmap: heatmapRef,
    xpBar: xpBarRef,
    help: helpRef,
  };

  const [showSpotlight, setShowSpotlight] = useState(false);

  // 🌟 Auto-trigger evaluation sequence
  useEffect(() => {
    if (!profile) return;

    // 1. Guard: Ensure they've finalized the introductory global tutorial first
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;

    // 2. Evaluate if they have viewed this dashboard layout context yet
    const hasSeenDashboardTour =
      profile.completed_tutorials?.dashboard === true;

    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      // Small architectural delay ensuring DOM ref spacing layouts settle cleanly
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // 🌟 Handles tour dismissal updates dynamically through Redux
  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("dashboard"));
  };

  // 🌟 Allows user to explicitly manual replay the workflow when pressing help icon
  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ===== TOP SECTION ===== */}
        <Header
          title=""
          activeTheme={activeTheme}
          leftElement={
            <div className="flex items-center w-32 h-20 relative shrink-0">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
                style={{
                  WebkitMaskImage: `url(${RevuLogo})`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskImage: `url(${RevuLogo})`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                }}
              />
            </div>
          }
          rightElement={
            <div className="flex items-center gap-3">
              <div ref={xpBarRef} className="w-full md:w-64 lg:w-80 rounded-xl">
                <XPBar totalXP={totalXP} activeTheme={activeTheme} />
              </div>
              <button
                type="button"
                onClick={handleManualReplayTour} // 🌟 Connected to our review callback logic
                title="Show me around"
                aria-label="Show me around"
                className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors ${activeTheme.background.secondary} ${activeTheme.text.secondary} hover:${activeTheme.text.accent3}`}
              >
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  ref={helpRef}
                  className="w-4 h-4"
                />
              </button>
            </div>
          }
        />

        {/* Quick stats panel */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 rounded-2xl"
        >
          <StatCard
            icon={faFire}
            label="Current Streak"
            value={`${globalStreak} day${globalStreak === 1 ? "" : "s"}`}
            activeTheme={activeTheme}
          />

          <StatCard
            icon={faClock}
            label="Cards Due"
            value={cards_due_today}
            activeTheme={activeTheme}
          />

          <StatCard
            icon={faBullseye}
            label="Mastered"
            value={mastered_cards}
            activeTheme={activeTheme}
          />

          <StatCard
            icon={faBookOpen}
            label="Decks"
            value={decks.length}
            activeTheme={activeTheme}
          />
        </div>

        {/* ===== MAIN GRID ===== */}
        <div
          className={`mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 ${
            decks.length > 2 ? "items-center" : ""
          }`}
        >
          {/* Left: Decks */}
          <div
            ref={continueLearningRef}
            className="lg:col-span-2 space-y-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Continue Learning</h2>
              <button
                onClick={() => navigate("/decks")}
                className={`text-sm ${activeTheme.text.link}`}
              >
                Browse decks <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {decks.length === 0 ? (
              <div
                className={`${activeTheme.background.secondary} text-center py-16 rounded-xl shadow-md`}
              >
                <FontAwesomeIcon icon={faBookOpen} className="text-4xl mb-3" />
                <p className="font-semibold mb-3">No decks yet</p>
                <button
                  onClick={() => navigate("/decks")}
                  className={`px-6 py-2 rounded-full font-semibold ${activeTheme.button.primary}`}
                >
                  Create Deck
                </button>
              </div>
            ) : (
              <>
                <DeckCard
                  decks={pageDecks}
                  activeTheme={activeTheme}
                  variant="compact"
                  gridClasses={"grid grid-cols-1 md:grid-cols-2 gap-4"}
                  toast={toast}
                />

                {totalDeckPages > 1 && (
                  <div className="flex items-center justify-between mt-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDeckPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={deckPage <= 1}
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${activeTheme.button.secondary} ${activeTheme.text.secondary} ${deckPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div className={`${activeTheme.text.secondary} text-sm`}>
                      Page {deckPage} of {totalDeckPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeckPage((prev) =>
                          Math.min(totalDeckPages, prev + 1),
                        )
                      }
                      disabled={deckPage >= totalDeckPages}
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${activeTheme.button.secondary} ${activeTheme.text.secondary} ${deckPage >= totalDeckPages ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                )}
                <Toast ref={toast} position="top-center" />
              </>
            )}
          </div>

          {/* Right: Heatmap */}
          <div
            ref={heatmapRef}
            className={`${activeTheme.background.secondary} p-6 rounded-2xl shadow-lg flex flex-col space-y-6`}
          >
            <Heatmap activeTheme={activeTheme} />
          </div>
        </div>
      </div>

      {showSpotlight && (
        <DashboardTutorial
          activeTheme={activeTheme}
          refs={spotlightRefs}
          onClose={closeSpotlight}
        />
      )}
    </div>
  );
};

export default Dashboard;
