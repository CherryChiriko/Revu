export const XP_EVENTS = {
  review_again: 1,
  review_hard: 2,
  review_good: 3,
  review_easy: 4,
  stage_familiar: 6,
  stage_solid: 18,
  stage_mastered: 45,
};

const RATING_XP = {
  again: XP_EVENTS.review_again,
  hard: XP_EVENTS.review_hard,
  good: XP_EVENTS.review_good,
  easy: XP_EVENTS.review_easy,
};

const STAGE_TRANSITION_XP = {
  familiar: XP_EVENTS.stage_familiar,
  solid: XP_EVENTS.stage_solid,
  mastered: XP_EVENTS.stage_mastered,
};

export const getReviewXP = (rating, prevStage, newStage) => {
  let xp = RATING_XP[rating] ?? 0;
  if (newStage !== prevStage && STAGE_TRANSITION_XP[newStage]) {
    xp += STAGE_TRANSITION_XP[newStage];
  }
  return xp;
};

// Premium-safe economy: XP reflects learning work only. Cosmetics, boosts, or
// subscriptions can multiply presentation/rewards later without selling memory.
export const xpForLevel = (level) => Math.round(50 * Math.pow(level, 1.5));

export const getLevelProgress = (totalXP = 0) => {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) level += 1;
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const xpIntoLevel = Math.max(0, totalXP - floor);
  const xpForNextLevel = Math.max(1, ceiling - floor);

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    percent: Math.round((xpIntoLevel / xpForNextLevel) * 100),
  };
};
