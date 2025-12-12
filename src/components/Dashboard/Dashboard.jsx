import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectGlobalStreak } from "../../slices/userSlice";
import { selectDecks, selectTotalDueCards } from "../../slices/deckSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faClock,
  faBullseye,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import RevuLogo from "../../assets/revu2.png";

import DeckCard from "../Decks/components/DeckCard";
import { Heatmap } from "./Heatmap";
import { Achievements } from "./Achievements";
import { XPBar } from "./XPBar";
import { StatCard } from "./StatCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const activeTheme = useSelector(selectActiveTheme);

  const decks = useSelector(selectDecks);

  const gradient = `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`;

  // 1. Select the map of due counts { deckId: count, ... }
  const cards_due_today = useSelector(selectTotalDueCards);

  console.log(cards_due_today);

  // const cards_due_today = decks.reduce((t, d) => t + (d.due || 0), 0);
  // const cards_due_today = useSelector(fetchDueCardCounts);
  console.log(cards_due_today);
  const mastered_cards = decks.reduce((t, d) => t + (d.mastered || 0), 0);
  const currentStreak = useSelector(selectGlobalStreak);

  const totalXP = useMemo(
    () =>
      Math.max(0, mastered_cards * 5 + currentStreak * 10 + cards_due_today),
    [mastered_cards, currentStreak, cards_due_today]
  );

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full py-8 px-6 font-inter`}
    >
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* ===== TOP SECTION (Improved Compact Layout) ===== */}
        <div
          className={`${activeTheme.background.secondary} rounded-2xl p-6 sm:p-8 shadow-xl flex items-center justify-between gap-6`}
        >
          {/* Logo */}
          <div className="flex items-center w-32 h-20 relative shrink-0">
            <div
              className={`absolute inset-0 ${gradient}`}
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

          {/* XP Bar */}
          <div className="flex-1 max-w-lg">
            <XPBar totalXP={totalXP} activeTheme={activeTheme} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={faFire}
            label="Current Streak"
            value={`${currentStreak} days`}
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
          <div
            className={`${activeTheme.background.secondary} rounded-2xl p-4 shadow-sm flex items-center gap-4`}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-75">Active Decks</div>
              <div className="text-2xl font-bold">{decks.length}</div>
            </div>
          </div>
        </div>

        {/* ===== MAIN GRID (Vertically Centered) ===== */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
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
                  className={`px-6 py-2 rounded-full font-semibold ${activeTheme.button.primaryBg}`}
                >
                  Create Deck
                </button>
              </div>
            ) : (
              <DeckCard
                decks={decks.slice(0, 4)}
                activeTheme={activeTheme}
                variant="compact"
                gridClasses={"grid grid-cols-1 md:grid-cols-2 gap-4"}
              />
            )}
          </div>

          {/* Right: Heatmap + Achievements */}
          <div
            className={`${activeTheme.background.secondary} p-6 rounded-2xl shadow-lg flex flex-col space-y-6`}
          >
            <Heatmap activeTheme={activeTheme} />
            <Achievements activeTheme={activeTheme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
