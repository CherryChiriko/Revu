import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCards,
  selectCards,
  selectCardsStatus,
  selectCardsError,
  clearCards,
} from "../../../slices/cardSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import selectDeckNameById from "../../../slices/deckSlice";

// --- CUSTOM TAILWIND COMPONENTS ---
const Card = ({ children, activeTheme, className = "" }) => (
  <div
    className={`${activeTheme.background.card} border ${activeTheme.border.secondary} shadow-sm rounded-2xl overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "outline",
  activeTheme,
  className = "",
}) => {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95";
  const styles =
    variant === "default"
      ? `${activeTheme.button.accent2} ${activeTheme.text.primary}`
      : `border ${activeTheme.border.secondary} ${activeTheme.text.secondary} hover:${activeTheme.background.canvas}`;

  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
};

// --- ICONS (Pure SVG) ---
const IconChevron = ({ isOpen }) => (
  <svg
    className={`w-4 h-4 transition-transform ${
      isOpen ? "rotate-180" : "-rotate-90"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const IconX = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// --- CONFIG ---
const STATUS_COLORS = {
  new: "bg-gray-100 text-gray-600 border border-gray-200",
  learning: "bg-blue-100 text-blue-700 border border-blue-200",
  review: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  mastered: "bg-green-100 text-green-700 border border-green-200",
};

const CHUNK_SIZE = 50;

export default function DeckDetails({ activeTheme }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deckName = useSelector(selectDeckNameById(deckId));

  // Redux State
  const cards = useSelector(selectCards);
  const status = useSelector(selectCardsStatus);
  const error = useSelector(selectCardsError);

  // Local UI State
  const [filter, setFilter] = useState(null);
  const [visibleChunks, setVisibleChunks] = useState(1);
  const [expanded, setExpanded] = useState({ 0: true });
  const [selectedCard, setSelectedCard] = useState(null);

  // Constants (Adjust these based on your Auth context later)
  const USER_ID = "temp-user-id";
  const STUDY_MODE = "A";

  useEffect(() => {
    if (deckId) {
      dispatch(
        fetchCards({
          deck_id: deckId,
          study_mode: STUDY_MODE,
          user_id: USER_ID,
        })
      );
    }
    return () => dispatch(clearCards());
  }, [dispatch, deckId]);

  // Filtering Logic
  const filteredCards = useMemo(() => {
    if (!filter) return cards;
    return cards.filter((c) => c.status === filter);
  }, [cards, filter]);

  // Grouping Logic
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredCards.length; i += CHUNK_SIZE) {
      result.push(filteredCards.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [filteredCards]);

  const toggleGroup = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (status === "loading")
    return (
      <div className="p-10 text-center animate-pulse">Loading cards...</div>
    );
  if (status === "failed")
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div
      className={`min-h-screen ${activeTheme.background.app} ${activeTheme.text.primary} w-full`}
    >
      <div
        className={`${activeTheme.background.app} relative max-w-6xl mx-auto p-4 space-y-6`}
      >
        {/* 1. Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)} // Use -1 to keep list scroll position
              className={`p-2 rounded-full hover:${activeTheme.background.canvas} transition-colors ${activeTheme.text.muted}`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${activeTheme.text.primary}`}>
                Deck Details
              </h1>
              <p className={`${activeTheme.text.secondary} text-sm`}>
                Reviewing cards for {deckId}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["new", "learning", "review", "mastered"].map((s) => (
            <Button
              key={s}
              activeTheme={activeTheme}
              variant={filter === s ? "default" : "outline"}
              onClick={() => {
                setFilter(filter === s ? null : s);
                setVisibleChunks(1);
              }}
              className="capitalize whitespace-nowrap"
            >
              {s}
            </Button>
          ))}
        </div>

        {/* 3. Card Groups */}
        <div className="space-y-4">
          {chunks.slice(0, visibleChunks).map((chunk, idx) => (
            <Card key={idx} activeTheme={activeTheme}>
              <CardContent>
                <button
                  onClick={() => toggleGroup(idx)}
                  className={`flex items-center gap-3 w-full text-left font-bold ${activeTheme.text.primary}`}
                >
                  <IconChevron isOpen={expanded[idx]} />
                  <span className="opacity-90">
                    Chunk {idx + 1}{" "}
                    <span
                      className={`font-normal text-xs ml-2 ${activeTheme.text.muted}`}
                    >
                      ({chunk.length} cards)
                    </span>
                  </span>
                </button>

                {expanded[idx] && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                    {chunk.map((card) => (
                      <button
                        key={card.card_id}
                        onClick={() => setSelectedCard(card)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg truncate text-left transition-all border border-transparent hover:border-white/10 ${activeTheme.background.canvas} ${activeTheme.text.secondary} hover:shadow-lg`}
                      >
                        {card.front}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 4. Side Panel (Drawer) Overlay */}
        {selectedCard && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedCard(null)}
            />
            <div
              className={`fixed inset-y-0 right-0 w-full sm:w-[450px] ${activeTheme.background.card} shadow-2xl z-50 p-8 flex flex-col border-l ${activeTheme.border.secondary}`}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className={`self-end p-2 rounded-full hover:${activeTheme.background.canvas} ${activeTheme.text.secondary}`}
              >
                <IconX />
              </button>

              <div className="mt-8 space-y-8">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 block">
                    Front
                  </label>
                  <p
                    className={`text-3xl font-bold ${activeTheme.text.primary}`}
                  >
                    {selectedCard.front}
                  </p>
                </section>

                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 block">
                    Back / Meaning
                  </label>
                  <p
                    className={`text-xl leading-relaxed ${activeTheme.text.secondary}`}
                  >
                    {selectedCard.back || "No definition provided."}
                  </p>
                </section>

                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      STATUS_COLORS[selectedCard.status]
                    }`}
                  >
                    {selectedCard.status}
                  </span>
                  <span className={`text-[11px] ${activeTheme.text.muted}`}>
                    ID: {selectedCard.card_id}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
