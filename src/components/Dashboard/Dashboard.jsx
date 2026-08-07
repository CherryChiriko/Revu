// src/components/Dashboard/Dashboard.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectGlobalStreak } from "../../slices/streakSlice";
import {
  selectDecks,
  selectTotalDueCards,
  selectTotalMasteredCards,
} from "../../slices/deckSlice";
import { selectUserProfile, completeTutorial } from "../../slices/userSlice";
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
  const dispatch = useDispatch();
  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const toast = useRef(null);

  // Dynamic window resize listener to keep isMobile accurately updated
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (!profile) return;
    const hasFinishedGeneralTour =
      profile.completed_tutorials?.general === true;
    const hasSeenDashboardTour =
      profile.completed_tutorials?.dashboard === true;

    if (hasFinishedGeneralTour && !hasSeenDashboardTour) {
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const closeSpotlight = () => {
    setShowSpotlight(false);
    dispatch(completeTutorial("dashboard"));
  };

  const handleManualReplayTour = () => {
    setShowSpotlight(true);
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full px-4 md:px-8 py-6 md:py-8`}
    >
      <div className="max-w-screen-xl mx-auto space-y-5 md:space-y-6">
        {/* Header */}
        <Header
          title=""
          activeTheme={activeTheme}
          leftElement={
            <div className="flex items-center w-20 h-12 md:w-32 md:h-20 relative shrink-0">
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
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <div ref={xpBarRef} className="w-full md:w-64 lg:w-80">
                <XPBar totalXP={totalXP} activeTheme={activeTheme} />
              </div>
              <button
                type="button"
                onClick={handleManualReplayTour}
                title="Show me around"
                aria-label="Show me around"
                className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 transition-colors ${activeTheme.background.secondary} ${activeTheme.text.secondary} hover:${activeTheme.text.accent3}`}
              >
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  ref={helpRef}
                  className="w-3.5 h-3.5 md:w-4 md:h-4"
                />
              </button>
            </div>
          }
          layout="row"
        />

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative z-10"
        >
          <StatCard
            icon={faFire}
            label="Streak"
            value={`${globalStreak}d`}
            activeTheme={activeTheme}
          />
          <StatCard
            icon={faClock}
            label="Due"
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

        {/* Main content */}
        <div
          className={`mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 ${
            decks.length > 2 ? "items-center" : ""
          }`}
        >
          {/* Decks */}
          <div
            ref={continueLearningRef}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">
                Continue Learning
              </h2>
              <button
                onClick={() => navigate("/decks")}
                className={`text-xs md:text-sm ${activeTheme.text.link}`}
              >
                Browse{" "}
                <FontAwesomeIcon icon={faArrowRight} className="ml-0.5" />
              </button>
            </div>

            {decks.length === 0 ? (
              <div
                className={`${activeTheme.background.secondary} text-center py-12 md:py-16 rounded-xl shadow-md`}
              >
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="text-3xl md:text-4xl mb-3"
                />
                <p className="font-semibold mb-3 text-sm md:text-base">
                  No decks yet
                </p>
                <button
                  onClick={() => navigate("/decks")}
                  className={`px-5 py-2 md:px-6 md:py-2 rounded-full text-sm font-semibold ${activeTheme.button.primary}`}
                >
                  Create Deck
                </button>
              </div>
            ) : (
              <>
                <DeckCard
                  decks={pageDecks}
                  activeTheme={activeTheme}
                  variant="dashboard"
                  toast={toast}
                />

                {totalDeckPages > 1 && (
                  <div className="flex items-center justify-between mt-3 md:mt-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDeckPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={deckPage <= 1}
                      className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full ${activeTheme.button.secondary} ${activeTheme.text.secondary} ${deckPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                    </button>
                    <div
                      className={`${activeTheme.text.secondary} text-xs md:text-sm`}
                    >
                      {deckPage} / {totalDeckPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeckPage((prev) =>
                          Math.min(totalDeckPages, prev + 1),
                        )
                      }
                      disabled={deckPage >= totalDeckPages}
                      className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full ${activeTheme.button.secondary} ${activeTheme.text.secondary} ${deckPage >= totalDeckPages ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    >
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-sm"
                      />
                    </button>
                  </div>
                )}
                <Toast ref={toast} position="top-center" />
              </>
            )}
          </div>

          {/* Heatmap Card Wrapper */}
          <div
            ref={heatmapRef}
            className={`${activeTheme.background.secondary} p-4 md:p-5 rounded-xl md:rounded-2xl shadow-md flex flex-col justify-between`}
          >
            <Heatmap activeTheme={activeTheme} isMobile={isMobile} />
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
