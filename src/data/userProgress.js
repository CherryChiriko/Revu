const userProgress = {
  userId: "user123", // If you have multiple users
  cardProgress: [
    {
      cardId: 1,
      deckId: 1,
      lastReviewed: "2025-07-28T10:00:00Z",
      nextReview: "2025-07-29T10:00:00Z",
      interval: 1,
      easeFactor: 2.5,
      repetitionCount: 0,
    },
    {
      cardId: 9,
      deckId: 2,
      lastReviewed: null, // Not reviewed yet
      nextReview: null,
      interval: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
    },
    // ... progress for all cards user has interacted with
  ]
};