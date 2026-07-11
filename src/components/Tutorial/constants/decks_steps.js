import {
  faSearch,
  faSort,
  faThLarge,
  faUpload,
  faLayerGroup,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";

export const DECK_TOUR_STEPS = [
  {
    icon: faSearch,
    title: "Search & filter",
    body: `Use the search bar to quickly find a deck by name.
The language dropdown next to it narrows your list down to decks in a specific language — handy once you're juggling several.`,
  },
  {
    icon: faSort,
    title: "Sorting",
    body: `The sort menu reorders your decks by last studied, name, or card count — ascending or descending.
"Last Studied" is the default, keeping the decks you're actively working on near the top.`,
  },
  {
    icon: faThLarge,
    title: "Grid & list view",
    body: `Toggle between two layouts:
- Grid view — larger cards with more detail, great for browsing.
- List view — a compact, information-dense layout, better when you have many decks.`,
  },
  {
    icon: faUpload,
    title: "Import",
    body: `Bring in cards from a CSV or Excel file. You can create a brand new deck from the import, or append cards to an existing one.
Column mapping and validation happen automatically as you go.`,
  },
  {
    icon: faLayerGroup,
    title: "Quick Create",
    body: `Prefer to start fresh? Create an empty deck and add cards later.
Or clone an existing deck — copy it as-is, merge two decks together, convert between Standard and Character cards, or build a remedial deck from previously missed cards.`,
  },
  {
    icon: faArrowsLeftRight,
    title: "Managing a deck",
    body: `Click any deck card to open it and manage its cards, settings, and study options.
Decks with a lot of cards will paginate automatically — use the controls at the bottom to move between pages.`,
  },
];
