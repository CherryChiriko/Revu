import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Import selectors and thunk from your slice
import {
  fetchCards,
  selectCards,
  selectCardsStatus,
  selectCardsError,
  clearCards,
} from "../slices/cardSlice";

const STATUS_STYLES = {
  new: "bg-gray-200 text-gray-700",
  learning: "bg-blue-200 text-blue-800",
  review: "bg-yellow-200 text-yellow-800",
  mastered: "bg-green-200 text-green-800",
};

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const DeckDetails = ({ deckName }) => {
  const { deckId } = useParams();
  const dispatch = useDispatch();

  // 1. Grab data from Redux Store
  const cards = useSelector(selectCards);
  const status = useSelector(selectCardsStatus);
  const error = useSelector(selectCardsError);

  // Hardcoded for now, or get these from your Auth/Settings context
  const USER_ID = "your-user-id";
  const STUDY_MODE = "A";

  // 2. Fetch cards on mount
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

    // Optional: Clear cards when leaving the page so the next deck starts fresh
    return () => dispatch(clearCards());
  }, [dispatch, deckId]);

  // 3. Logic for grouping
  const groups = chunkArray(cards, 50);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (index) => {
    setOpenGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Loading & Error States
  if (status === "loading")
    return <div className="p-8 text-center">Loading cards...</div>;
  if (status === "failed")
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{deckName}</h1>

      {groups.length === 0 && status === "succeeded" && (
        <p className="text-gray-500">No cards found in this deck.</p>
      )}

      {groups.map((group, groupIndex) => (
        <Card
          key={groupIndex}
          className="rounded-2xl border border-gray-100 shadow-sm"
        >
          <CardContent className="p-4">
            <button
              onClick={() => toggleGroup(groupIndex)}
              className="flex items-center gap-2 text-sm font-semibold w-full text-left"
            >
              {openGroups[groupIndex] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Cards {groupIndex * 50 + 1}–{groupIndex * 50 + group.length}
            </button>

            {openGroups[groupIndex] && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                {group.map((card) => (
                  <div
                    key={card.card_id} // Using card_id from your merged object
                    className={`rounded-lg px-2 py-1 text-xs font-medium text-center truncate shadow-sm ${
                      STATUS_STYLES[card.status] || STATUS_STYLES.new
                    }`}
                    title={card.front}
                  >
                    {card.front}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeckDetails;
