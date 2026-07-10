import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectGlobalStreak } from "../../slices/streakSlice";
import {
  selectDecks,
  selectTotalDueCards,
  selectTotalMasteredCards,
} from "../../slices/deckSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faClock,
  faBullseye,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import RevuLogo from "../../assets/revu2.png";
import { selectTotalActivity } from "../../slices/activitySlice";

import DeckCard from "../Decks/components/DeckCard";
import { Heatmap } from "./Heatmap";
// import { Achievements } from "./Achievements";
import { XPBar } from "./XPBar";
import { StatCard } from "./StatCard";
import { Toast } from "primereact/toast";
import Header from "../General/ui/Header";

const Dashboard = () => {
  const navigate = useNavigate();
  const activeTheme = useSelector(selectActiveTheme);
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

  // Connect to the new, authoritative database-backed XP economy
  const totalActivity = useSelector(selectTotalActivity);

  const totalXP = useMemo(() => {
    const baseXP = totalActivity?.totalXP || 0;
    return Math.max(0, baseXP);
  }, [totalActivity]);

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
            <div className="w-full md:w-64 lg:w-80">
              <XPBar totalXP={totalXP} activeTheme={activeTheme} />
            </div>
          }
        />

        {/* Quick stats panel - Added negative margin top option to stitch sections together tightly, or standard spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
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
            label="Active Decks"
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
          <div className="lg:col-span-2 space-y-6">
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
            className={`${activeTheme.background.secondary} p-6 rounded-2xl shadow-lg flex flex-col space-y-6`}
          >
            <Heatmap activeTheme={activeTheme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
