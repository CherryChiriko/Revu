// constants/decks_steps.js
import {
  faAddressCard,
  faPlus,
  faThLarge,
  faUpload,
  faLayerGroup,
  faArrowsLeftRight,
  faCircleQuestion,
  faSort,
} from "@fortawesome/free-solid-svg-icons";

export const DECK_DETAILS_TOUR_STEPS = [
  {
    target: "filter",
    icon: faSort,
    title: "Filter by status",
    body: `Quickly view your deck performance metrics by filtering flashcards based on their study schedules.
    The numbers displayed refer only to the currently loaded cards.`,
  },
  {
    target: "help",
    icon: faCircleQuestion,
    title: "Help",
    body: `Click to see this tutorial again.`,
  },
  {
    target: "add",
    icon: faPlus,
    title: "Grow your deck",
    body: `Ready to expand? 
    Click the add button to instantly add a new flashcard to this collection.`,
  },
  {
    target: "card",
    icon: faAddressCard,
    title: "Manage your cards",
    body: `Click any card tile to open its inspection panel. 
    From there, you can view learning progress metrics, edit front/back contents, or delete the item.`,
  },
];
