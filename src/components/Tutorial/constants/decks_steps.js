// constants/decks_steps.js
import {
  faSearch,
  faSort,
  faThLarge,
  faUpload,
  faLayerGroup,
  faArrowsLeftRight,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

export const DECK_TOUR_STEPS = [
  {
    target: "search",
    icon: faSearch,
    title: "Search & filter",
    body: `Use the search bar to quickly find a deck by name.
  The language dropdown next to it narrows your list down to decks in a specific language.`,
  },
  {
    target: "sort",
    icon: faSort,
    title: "Sorting",
    body: `The sort menu reorders your decks by last studied, name, or card count — ascending or descending.
  "Last Studied" is the default, keeping the decks you're actively working on near the top.`,
  },
  {
    target: "view",
    icon: faThLarge,
    title: "Grid & list view",
    body: `Toggle between two layouts:
  - Grid view — larger cards with more detail, great for browsing.
  - List view — a compact, information-dense layout, better when you have many decks.
  You can change the default view in the Settings.`,
  },
  {
    target: "import",
    icon: faUpload,
    title: "Import",
    body: `Build a deck from a CSV or Excel file. You can create a new deck from the import, or add cards to an existing one.
You will be guided step by step.`,
  },
  {
    target: "create",
    icon: faLayerGroup,
    title: "Quick Create",
    body: `Prefer to start fresh? Create an empty deck and add cards later.
  Or you can clone an existing deck — copy it as-is or build a variant (several options are proposed).`,
  },
  {
    target: "help",
    icon: faCircleQuestion,
    title: "Help",
    body: `Click to see this tutorial again.`,
  },
  {
    target: "decks",
    icon: faArrowsLeftRight,
    title: "Your deck",
    body: `Click any deck card to open it and manage its cards. Click on "Learn" or "Study" to either learn or review cards.`,
  },
];
