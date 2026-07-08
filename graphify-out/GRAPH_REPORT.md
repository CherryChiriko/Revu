# Graph Report - my-app - Copy  (2026-07-08)

## Corpus Check
- 159 files · ~96,789 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 510 nodes · 1078 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6597c0df`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- activitySlice.js
- App.js
- deckSlice.js
- dependencies
- constants.js
- useStudySession.js
- SettingsPage.jsx
- settingsSlice.js
- userSlice.js
- CompactVariant.jsx
- ImportView.jsx
- CardRenderer.jsx
- CardGridSection.jsx
- Learn More
- manifest.json
- cardMastery.js
- xp.js
- seed.js
- README.md
- userProgress.js

## God Nodes (most connected - your core abstractions)
1. `supabase` - 30 edges
2. `selectActiveTheme()` - 23 edges
3. `inputCls()` - 15 edges
4. `useStudySession()` - 15 edges
5. `selectDecks()` - 15 edges
6. `App()` - 13 edges
7. `selectSettings()` - 13 edges
8. `fetchDecks` - 11 edges
9. `hasCJKCharacter()` - 11 edges
10. `ActivityPage()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `useImportLogic()` --references--> `xlsx`  [EXTRACTED]
  src/components/Import/hooks/useImportLogic.js → package.json
- `CharacterCard()` --references--> `react`  [EXTRACTED]
  src/components/Study/components/Card/CharacterCard.jsx → package.json
- `NavItem()` --references--> `react`  [EXTRACTED]
  src/components/Navbar/NavItem.jsx → package.json
- `SessionMode()` --references--> `react`  [EXTRACTED]
  src/components/Study/views/SessionMode.jsx → package.json
- `StudySession()` --references--> `react`  [EXTRACTED]
  src/components/Study/views/StudySession.jsx → package.json

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "activitySlice.js"
Cohesion: 0.06
Nodes (40): ActivityPage(), dateKey(), formatDate(), formatDuration(), getRecentDays(), Dashboard(), generateCalendarGrid(), Heatmap() (+32 more)

### Community 1 - "App.js"
Cohesion: 0.09
Nodes (30): react, App(), resetAllUserState(), themes, ScrollToTop(), Head(), LoginPage(), useLogin() (+22 more)

### Community 2 - "deckSlice.js"
Cohesion: 0.10
Nodes (26): useCardDetails(), C_LANGUAGES, DeckMetaEditor(), DeckHeaderSection(), INITIAL_FIELDS, useDeckDetails(), DeckDetails(), generateReading() (+18 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (45): browserslist, development, production, dependencies, bootstrap, date-fns, dotenv, @fortawesome/fontawesome-svg-core (+37 more)

### Community 4 - "constants.js"
Cohesion: 0.09
Nodes (26): CardEdit(), CardDetails(), AddCardMenu(), useAddCard(), ConfirmationDialog(), FormField(), inputCls(), selectCls() (+18 more)

### Community 5 - "useStudySession.js"
Cohesion: 0.09
Nodes (25): checkMidnightReset(), previousPersistedSettings, IMPORTANT: useAuth clears localStorage BEFORE dispatching this, so that, store, StatsLoader(), selectCardsForDeck, useStudySession(), root (+17 more)

### Community 6 - "SettingsPage.jsx"
Cohesion: 0.14
Nodes (14): AvatarDisplay(), AccountSection(), AvatarSection(), DisplaySection(), StudyFlowSection(), StudyLimitsSection(), ThemeSection(), useAccountSettings() (+6 more)

### Community 7 - "settingsSlice.js"
Cohesion: 0.10
Nodes (17): XPBar(), DeckCard(), DeckCardItem(), useListController(), DeckListView(), Bar(), Header(), FinalStep() (+9 more)

### Community 8 - "userSlice.js"
Cohesion: 0.11
Nodes (11): AvatarPick(), PALETTE, PRESET_AVATARS, persistAvatarState(), ONBOARDING_STEPS, useTutorial(), OnboardingModal(), STEPS (+3 more)

### Community 9 - "CompactVariant.jsx"
Cohesion: 0.16
Nodes (10): DeckDelete(), DeckMenu(), QuickCreateMenu(), DeckActions(), DeckBadges(), ProgressBar(), CompactVariant(), Menu() (+2 more)

### Community 10 - "ImportView.jsx"
Cohesion: 0.13
Nodes (13): CharacterCanvas(), CharacterDemo(), Step0(), Step1(), Step2(), Step3(), Step4(), EXISTING_STEPS (+5 more)

### Community 11 - "CardRenderer.jsx"
Cohesion: 0.18
Nodes (8): NotFound404(), CharacterCard(), FlipCard(), ContinueButton(), buttons, RatingButtons(), RevealButton(), useCharacterFlow()

### Community 12 - "CardGridSection.jsx"
Cohesion: 0.18
Nodes (9): CardInfo(), getCardStrengthLabel(), CardGridSection(), DeckStatsSection(), STATUS_FILTERS, STATUS_TILE, AddCardTile(), CardTile() (+1 more)

### Community 13 - "Learn More"
Cohesion: 0.14
Nodes (13): Advanced Configuration, Analyzing the Bundle Size, Available Scripts, Code Splitting, Deployment, Getting Started with Create React App, Learn More, Making a Progressive Web App (+5 more)

### Community 14 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 15 - "cardMastery.js"
Cohesion: 0.29
Nodes (4): STAGE_OPACITY, MASTERY_STAGES, MASTERY_THRESHOLDS, STAGE_LABELS

### Community 16 - "xp.js"
Cohesion: 0.33
Nodes (5): getLevelProgress(), RATING_XP, STAGE_TRANSITION_XP, XP_EVENTS, xpForLevel()

### Community 18 - "seed.js"
Cohesion: 0.67
Nodes (3): fetch, fs, seedTable()

## Knowledge Gaps
- **106 isolated node(s):** `name`, `version`, `private`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-brands-svg-icons` (+101 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `App.js`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `react` connect `App.js` to `CardRenderer.jsx`, `dependencies`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `StudySession()` connect `App.js` to `deckSlice.js`, `useStudySession.js`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `selectActiveTheme()` (e.g. with `App()` and `ActivityPage()`) actually correct?**
  _`selectActiveTheme()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useStudySession()` (e.g. with `selectCardsStatus()` and `selectLearnLimit()`) actually correct?**
  _`useStudySession()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `activitySlice.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05639097744360902 - nodes in this community are weakly interconnected._