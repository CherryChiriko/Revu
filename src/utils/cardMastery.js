export const MASTERY_STAGES = ["new", "familiar", "solid", "mastered"];

export const STAGE_LABELS = {
  new: "New",
  familiar: "Familiar",
  solid: "Solid",
  mastered: "Mastered",
};

export const STAGE_DESCRIPTIONS = {
  new: "Ready for a first pass.",
  familiar: "You can recognize it, but it still needs close spacing.",
  solid: "The memory is holding across longer gaps.",
  mastered: "Long-term recall is strong and resilient.",
};

// Single source of truth for thresholds. Must match the SQL trigger exactly —
// flagged for you when you share the trigger definition.
export const MASTERY_THRESHOLDS = {
  solidInterval: 21,
  masteredInterval: 90,
  masteredMinReps: 4,
};

export const getMasteryStage = (card) => {
  const interval = card.review_interval ?? 0;
  const reps = card.repetitions ?? 0;
  const { solidInterval, masteredInterval, masteredMinReps } =
    MASTERY_THRESHOLDS;

  if (reps === 0) return "new";
  if (interval >= masteredInterval && reps >= masteredMinReps)
    return "mastered";
  if (interval >= solidInterval) return "solid";
  return "familiar";
};

export const getMasteryProgress = (card) => {
  const interval = card.review_interval ?? 0;
  const reps = card.repetitions ?? 0;
  const { solidInterval, masteredInterval, masteredMinReps } =
    MASTERY_THRESHOLDS;
  const intervalScore = Math.min(1, interval / masteredInterval);
  const repScore = Math.min(1, reps / masteredMinReps);

  return Math.round((intervalScore * 0.7 + repScore * 0.3) * 100);
};

export const getMasterySummary = (card) => {
  const stage = getMasteryStage(card);
  return {
    stage,
    label: STAGE_LABELS[stage],
    description: STAGE_DESCRIPTIONS[stage],
    progress: getMasteryProgress(card),
  };
};
