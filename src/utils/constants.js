import {
  faRightLeft,
  faLanguage,
  faCopy,
  faClone,
  faFire,
} from "@fortawesome/free-solid-svg-icons";

export const CHUNK_SIZE = 50;

export const TYPE_ICONS = {
  simple: faCopy,
  swap: faRightLeft,
  merge: faClone,
  convert: faLanguage,
  missed: faFire,
};

export const TABLES = {
  A: "cards_a",
  C: "cards_c",
};

export const PROGRESS = {
  A: "card_a_progress",
  C: "card_c_progress",
};

export const STUDY_MODES = {
  A: "Standard",
  C: "Character",
};

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
