export const LEARN_LIMIT = 1;
export const REVIEW_LIMIT = 10;

export const PHASES = {
  A: [
    { displayState: "animation", allowRating: false },
    { displayState: "quiz", allowRating: true },
  ],
  C: [
    { displayState: "animation", allowRating: false },
    { displayState: "outline", allowRating: false },
    { displayState: "quiz", allowRating: true },
  ],
};
