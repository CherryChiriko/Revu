/**
 * Determines a card's display status based on its stored progress.
 * @param {Object} progress - The card's progress object (from Redux/DB).
 * @returns {string} The computed status: 'due', 'waiting', 'new', or 'mastered'.
 */
export const getCardStatus = (progress) => {
  if (progress.suspended) return progress.status;

  const now = Date.now();

  switch (progress.status) {
    case "mastered":
    case "new":
      return progress.status;

    case "waiting": {
      const due = progress.due_date ? Date.parse(progress.due_date) : null;
      return due !== null && due <= now ? "due" : "waiting";
    }

    default:
      return "new";
  }
};
