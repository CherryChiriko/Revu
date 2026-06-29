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

export const STATUS_COLOR = {
  new: "light",
  waiting: "accent1",
  due: "accent2",
  mastered: "accent3",
  suspended: "muted",
};
