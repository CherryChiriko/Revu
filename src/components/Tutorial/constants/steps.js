import {
  faFire,
  faLayerGroup,
  faChartLine,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
// import FlipCardDemo from "../components/demos/FlipCardDemo";
// import StrokeOrderDemo from "../components/demos/StrokeOrderDemo";

import RevuLogo from "../../../assets/Revu_logo.png";

export const ONBOARDING_STEPS = [
  {
    icon: RevuLogo,
    title: "Welcome to Revu",
    body: `Revu is a flashcard app that uses a scientifically optimized system to supercharge your memory.

Instead of cramming, you will review cards at the exact moment you're about to forget them — making your study sessions incredibly fast and highly effective.`,
  },
  {
    icon: null,
    title: "Standard cards",
    body: `Standard cards display the word you want to learn on the front and a translation or answer on the back.

After flipping, you'll rate how well you remembered it. Your self-assessment will allow the algorithm to calculate the optimal review schedule.`,
  },
  {
    icon: null,
    title: "Character cards",
    body: `Designed specifically for Chinese, character cards guide you through a specialized three-step learning process:

1. Animation: Visualize the character being drawn.
2. Outline: Trace it yourself following the proper stroke order.
3. Draw: Write it entirely from memory.

If you struggle, a hint will appear. Your rating is automatically calculated based on your precision!`,
  },
  {
    icon: faLayerGroup,
    title: "Decks",
    body: `Organize your study material by grouping related cards together into custom decks.

You can build a deck from scratch, from an existing one or seamlessly import an Excel or CSV file.`,
  },
  {
    icon: faChartLine,
    title: "Card stages",
    body: `As your memory deepens, cards advance across three core proficiency milestones: Familiar, Solid, and Mastered.

Your daily dashboard splits cards into actionable queues:
• 'New' cards are waiting to be introduced in Learn Mode.
• 'Due' cards have reached their review interval and are ready to test.
• 'Waiting' cards don't need attention yet.`,
  },
  {
    icon: faFire,
    title: "Streaks",
    body: `Keep your momentum high by tracking consistency.

Tailor daily requirements in your Settings panel to match your target goals.`,
  },
  {
    icon: faRocket,
    title: "You're ready to go",
    body: `Create your first deck, add your first cards and launch your first session whenever you feel ready.`,
  },
];
