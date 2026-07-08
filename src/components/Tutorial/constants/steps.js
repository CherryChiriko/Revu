import {
  faTableCellsLarge,
  faLayerGroup,
  faChartLine,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
// import FlipCardDemo from "../components/demos/FlipCardDemo";
// import StrokeOrderDemo from "../components/demos/StrokeOrderDemo";

export const ONBOARDING_STEPS = [
  {
    icon: faTableCellsLarge,
    title: "Welcome to Revu",
    body: "Revu uses spaced repetition to help you learn and remember. Cards you know well show up less often, and cards you struggle with come back sooner.",
  },
  {
    icon: null,
    title: "Standard cards",
    body: "The first time you see a card, it's just to learn it. From then on, each time it's due you rate how well you remembered it — that rating is what schedules the next review.",
    // demo: FlipCardDemo,
  },
  {
    icon: null,
    title: "Character cards",
    body: "Character cards walk you through three phases for every character. Explore them below.",
    // demo: StrokeOrderDemo,
  },
  {
    icon: faLayerGroup,
    title: "Decks are your collections",
    body: "Group related cards into a deck. Build one from scratch, import a list, or duplicate an existing deck to remix it.",
  },
  {
    icon: faChartLine,
    title: "Cards mature as you review",
    body: "Every card moves through four stages: new, learning, reviewing, and mastered. Review honestly — the schedule adjusts automatically based on how you do.",
  },
  {
    icon: faRocket,
    title: "You're ready to go",
    body: "Create your first deck, add a few cards, and start a study session whenever you like. Your streak and XP update as you go.",
  },
];
