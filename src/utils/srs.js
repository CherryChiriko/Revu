export const computeSM2 = (card, rating) => {
  let EF = card.ease_factor ?? 2.5;
  let interval = card.review_interval ?? 0;
  let reps = card.repetitions ?? 0;

  if (rating === "again") {
    // reset review state, this is how SM-2 treats lapses
    reps = 0;
    interval = 1;
    EF = Math.max(1.3, EF - 0.2);
  } else {
    // successful review
    reps += 1;

    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * EF);

    if (rating === "hard") {
      EF = Math.max(1.3, EF - 0.15);
    }
    if (rating === "good") {
      EF = Math.min(2.5, EF + 0.0);
    }
    if (rating === "easy") {
      EF = Math.min(2.5, EF + 0.15);
      interval = Math.round(interval * 1.3);
    }
  }

  const now = new Date();
  const due_date = new Date(now.getTime() + interval * 86400 * 1000);

  return {
    ease_factor: EF,
    review_interval: interval,
    repetitions: reps,
    due_date: due_date.toISOString(),
    last_studied: now.toISOString(),
  };
};
