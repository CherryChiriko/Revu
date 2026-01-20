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

// --- CUSTOM TAILWIND COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "outline", className = "" }) => {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95";
  const styles =
    variant === "default"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-gray-300 text-gray-700 hover:bg-gray-50";
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

export default function DeckDetails({ deckName }) {
  const { deckId } = useParams();
  const dispatch = useDispatch();

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
    <div className="relative max-w-6xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{deckName}</h1>
        <p className="text-gray-500">{cards.length} Total Cards</p>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {["new", "learning", "review", "mastered"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            onClick={() => {
              setFilter(filter === s ? null : s);
              setVisibleChunks(1);
            }}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Card Groups */}
      <div className="space-y-4">
        {chunks.slice(0, visibleChunks).map((chunk, idx) => (
          <Card key={idx}>
            <CardContent>
              <button
                onClick={() => toggleGroup(idx)}
                className="flex items-center gap-3 w-full text-left font-bold text-gray-700"
              >
                <IconChevron isOpen={expanded[idx]} />
                Cards {idx * CHUNK_SIZE + 1}–{idx * CHUNK_SIZE + chunk.length}
              </button>

              {expanded[idx] && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                  {chunk.map((card) => (
                    <button
                      key={card.card_id}
                      onClick={() => setSelectedCard(card)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg truncate text-left transition-all hover:shadow-md active:scale-95 ${
                        STATUS_COLORS[card.status] || STATUS_COLORS.new
                      }`}
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

      {/* Load More */}
      {visibleChunks < chunks.length && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setVisibleChunks((v) => v + 1)}
            variant="outline"
          >
            Load More Cards
          </Button>
        </div>
      )}

      {/* Side Panel Overlay */}
      {selectedCard && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSelectedCard(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 p-6 flex flex-col transform transition-transform border-l border-gray-100">
            <button
              onClick={() => setSelectedCard(null)}
              className="self-end p-2 hover:bg-gray-100 rounded-full"
            >
              <IconX />
            </button>

            <div className="mt-4 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Front
                </span>
                <p className="text-2xl font-semibold text-gray-900">
                  {selectedCard.front}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Back / Meaning
                </span>
                <p className="text-lg text-gray-700">
                  {selectedCard.back || "No definition provided."}
                </p>
              </div>

              {selectedCard.reading && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Reading
                  </span>
                  <p className="text-lg text-blue-600">
                    {selectedCard.reading}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    STATUS_COLORS[selectedCard.status]
                  }`}
                >
                  {selectedCard.status}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
