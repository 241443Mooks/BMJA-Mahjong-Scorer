# Instructional screenshot plan

> **Purpose:** define a small canonical set of real product screenshots for Help, guides and feature explanations.
>
> These are **instructional reference images**, not decorative marketing mockups. The job of each screenshot is to reduce the amount of interface description a player has to read.

## Core principle

Use screenshots to explain **the product interface**. Use tile illustrations and diagrams to explain **Mahjong itself**.

Examples:

- “What is a Chow?” → use the existing tile illustration.
- “Where do I enter a Chow?” → use a product screenshot.
- “How does East rotate?” → use the existing gameplay diagram.
- “Where can I see the current East player?” → use a product screenshot.

Do not screenshot every click. A screenshot belongs in a guide only when seeing the interface materially reduces uncertainty.

---

# Canonical screenshot set

The aim is to maintain roughly **10–12 reusable screenshots** that cover the product’s main instructional needs. One screenshot should be reused in more than one page where appropriate.

## 01 — Start a game

**Filename:** `game-setup.png`

**Show:**

- new-game/start-game screen
- four player names
- seat Winds / starting East where visible
- prevailing Wind or game-length options where visible
- primary action to begin the game

**Purpose:** answer “Where do I start?” and make the four-player setup model obvious.

**Use in:**

- Help → How do I start a complete game?
- Features → Four-player game scoring
- future “How to score a complete game” walkthrough

**Capture state:** use neutral example names such as Alex, Beth, Chris and Dee. Avoid real people’s names.

**Annotation:** probably none. If the screen is busy, one restrained outline around the primary Start action is enough.

---

## 02 — Main game table with mixed score entry

**Filename:** `game-table-score-entry.png`

**Show:**

- active hand in a four-player game
- current East / prevailing Wind context
- player score-entry rows/cards
- at least one manual numeric score
- at least one player with detailed-scoring route visible

**Purpose:** demonstrate that the table does not have to score every player the same way.

**Use in:**

- Help → Do all four players have to use the detailed scorer?
- Help → I already know the score
- Features → Manual or calculated hand scores
- Features → Game progression/context

**Capture state:** mid-game rather than an empty table so the screen looks real and the current context is visible.

**Annotation:** optional small labels “type a score” and “score from tiles” only if the distinction is not visually obvious.

---

## 03 — Ordinary detailed hand builder

**Filename:** `hand-builder-ordinary.png`

**Show:**

- an ordinary partially or fully entered hand
- Pung / Kong / Chow / Pair controls or equivalent set-entry affordances
- exposed/concealed state where visible
- Flowers / Seasons area if it fits without making the crop too large

**Purpose:** establish the visual model of building the hand from tiles instead of compact notation.

**Use in:**

- Help → How do I enter an ordinary hand?
- Features → Visual tile entry
- Features → Exposed and concealed sets
- future “How to score a hand” walkthrough

**Capture state:** choose a visually varied but ordinary hand: one Pung, one Kong or second Pung, one Chow, pair, and one bonus tile if practical.

**Annotation:** none unless needed. The UI should do the teaching.

---

## 04 — Partial losing hand and Remaining tiles

**Filename:** `hand-partial-losing.png`

**Show:**

- losing-hand state
- two or three completed scoring groups
- some Remaining tiles
- visible partial/completeness state
- current supported score if shown

**Purpose:** make the product’s unusual but important “partial evidence is valid” behaviour tangible.

**Use in:**

- Help → What if I only know part of a losing hand?
- Help → What are Remaining tiles?
- Features → Partial-evidence scoring
- Features → Clear completeness state
- How It Works → Evidence / Partial

**Capture state:** deliberately leave the hand incomplete while including enough evidence to produce a meaningful score.

**Annotation:** one small callout to “Remaining tiles” and, if shown elsewhere, “Partial evidence”.

**Priority:** **very high.** This screenshot explains a product capability that is hard to communicate through generic Mahjong imagery.

---

## 05 — Winning tile question

**Filename:** `hand-winning-tile.png`

**Show:**

- completed winning hand
- prompt asking which tile completed Mah Jong
- selectable tiles / destination set where applicable
- “I’m not sure” option

**Purpose:** show why the app occasionally asks one more question and reinforce that unknown is a valid answer.

**Use in:**

- Help → Why does the scorer ask which tile completed Mah Jong?
- Help → What if I do not know which tile completed Mah Jong?
- Features → Winning-tile provenance
- How It Works → asks only when necessary

**Capture state:** use a hand where winning-tile provenance genuinely matters if practical, rather than triggering an artificial example.

**Annotation:** none. The prompt itself is the instructional content.

---

## 06 — Special layout entry

**Filename:** `hand-special-layout.png`

**Show:**

- “My hand doesn’t fit normal sets” / Special layout route
- loose individual tile entry
- enough entered tiles to make the difference from ordinary grouped entry obvious

**Purpose:** show what to do when a hand cannot sensibly be represented as Pungs, Kongs, Chows and pairs.

**Use in:**

- Help → My hand does not fit normal Pungs, Chows, Kongs and pairs
- Help → Do I need to know the name of the special hand first?
- Features → Irregular special layouts
- Special hands catalogue → contextual “enter this kind of hand” help, if later useful

**Capture state:** use a recognisable supported irregular hand, but the screenshot should teach the entry route rather than test the reader’s pattern knowledge.

**Annotation:** optional single arrow from the Special layout selector to the loose-tile area.

---

## 07 — Score breakdown / “why did it score that?”

**Filename:** `hand-score-breakdown.png`

**Show:**

- entered hand
- final/current score
- points and doubles breakdown
- one or more contextual pattern explanations

**Purpose:** demonstrate the product promise “a scorer that tells you why.”

**Use in:**

- Help → What if the scorer and our table disagree?
- Features → Points and doubles
- Features → Contextual pattern explanations
- How It Works → Calculate / Explain
- Scoring guide → bridge from rule explanation into the live scorer

**Capture state:** pick a hand with enough scoring components to be useful but not so many that the explanation panel becomes visually overwhelming.

**Annotation:** none. Prefer the actual scoring explanation over external labels.

**Priority:** **very high.** This is one of the clearest screenshots of the product’s core value.

---

## 08 — Special fishing / possible completing tiles

**Filename:** `hand-special-fishing.png`

**Show:**

- complete non-winning hand
- detected special-hand fishing result
- possible completing tile or tiles
- fishing value / pattern name where shown

**Purpose:** make automatic fishing detection understandable without requiring the player to know the target special-hand name first.

**Use in:**

- Help → What if I think I am fishing for a special hand?
- Features → Automatic special-hand fishing
- Special hands / scoring learning content where a UI example adds value

**Capture state:** use one of the cleaner supported examples with one or two possible completing tiles.

**Annotation:** probably none.

**Priority:** medium. Capture after the core seven unless this proves especially visually strong.

---

## 09 — Expanded game ledger, settlement and balances

**Filename:** `game-ledger-settlement.png`

**Show:**

- at least two confirmed hands in the ledger
- one expanded hand
- winner / scores
- actual player-to-player settlement transactions
- running balances
- East/prevailing context if visible

**Purpose:** one image can explain settlement, running totals, canonical history and the rich game record.

**Use in:**

- Help → How does settlement work?
- Features → Automatic settlement
- Features → Running balances
- Features → Rich hand-by-hand game record
- Features → Settlement explanations
- How It Works → Settle / Record

**Capture state:** choose figures that are easy to read. Avoid extreme values that distract from the layout.

**Annotation:** optionally highlight one settlement transaction and the resulting running balance, but avoid drawing arrows all over the ledger.

**Priority:** **very high.** This is the strongest “whole game” screenshot.

---

## 10 — Correct / undo a confirmed hand

**Filename:** `game-correct-hand.png`

**Show:**

- confirmed ledger entry
- correction / undo control clearly visible
- enough surrounding context to show the action applies to a recorded hand

**Purpose:** reassure users that an ordinary scoring error does not mean restarting the game.

**Use in:**

- Help → I made a mistake in a confirmed hand
- Features → Undo and correction

**Capture state:** use the same demo game as screenshot 09 if possible.

**Annotation:** a single subtle outline around the correction control is justified here because the screenshot’s sole job is to locate it.

**Priority:** medium.

---

## 11 — Print / Save game choices

**Filename:** `game-print-save.png`

**Show:**

- Print / Save game action
- Full game record vs Game summary choice
- explanatory copy around the two modes, if present

**Purpose:** show exactly where saved/printable game records come from and clarify Full vs Summary before the browser print dialog appears.

**Use in:**

- Help → How do I save the game record?
- Help → Full game record vs Game summary
- Help → Can I print before the game is finished?
- Features → Browser Print / Save as PDF
- Features → Full game record / Game summary

**Capture state:** use the same populated demo game as screenshots 09–10.

**Annotation:** none if the two options are clearly labelled.

**Important:** do not use screenshots of browser-native Print dialogs as canonical product screenshots. Those vary by browser and operating system and will age badly.

---

## 12 — Mobile hand scoring flow

**Filename:** `hand-builder-mobile.png`

**Show:**

- narrow/mobile viewport
- hand context
- active group or part of hand being edited
- tile selection close to that editing context
- clear touch targets / navigation

**Purpose:** demonstrate how the same scorer is intended to work at the table on a phone, where most real-world use may happen.

**Use in:**

- Features → Designed for phones as well as larger screens
- future mobile-specific Help answer if user testing shows one is needed
- README or product explanation if a real UI example is useful later

**Capture state:** mirror the ordinary hand from screenshot 03 if possible so readers can recognise the same task at a different viewport.

**Annotation:** none.

---

# Features that probably do not need their own screenshot

These features are real and worth explaining, but a dedicated screenshot would add little or would duplicate another image.

| Feature / help topic | Screenshot decision | Reason |
| --- | --- | --- |
| Local browser recovery | Text first | Unless there is a distinct Resume/Recover screen, storage behaviour is not meaningfully visible in a screenshot. |
| No account required | No screenshot | Absence of a login is not useful instructional imagery. |
| Tile copy limits | Only if a user repeatedly gets stuck | Validation text is more useful than a screenshot unless the error state is hard to understand. |
| Kong physical vs structural count | Existing tile diagrams + text | This is a Mahjong/data-model concept rather than an interface-location problem. |
| “Unknown means unknown” | Reuse screenshot 05 | The winning-tile screen with “I’m not sure” demonstrates the principle better than a dedicated image. |
| Draws / game progression | Reuse screenshots 01/02/09 where context is visible | Do not create an image simply to show a label changing. |
| Final standings | Reuse populated ledger/record unless a dedicated final screen is substantially different | Capture later only if the completed-game state has genuinely useful controls or information not visible elsewhere. |
| Navigation / safe exits | Text first | Capture only if testing shows users cannot locate the exit/back behaviour. |
| Ruleset comparison | Use the page itself, not a product screenshot | It is educational content rather than a how-to for scorer controls. |

---

# Recommended capture order

## Phase 1 — highest instructional value

Capture these first:

1. `game-setup.png`
2. `game-table-score-entry.png`
3. `hand-builder-ordinary.png`
4. `hand-partial-losing.png`
5. `hand-winning-tile.png`
6. `hand-score-breakdown.png`
7. `game-ledger-settlement.png`
8. `game-print-save.png`

This gives strong coverage of the most common Help and Features material with only eight images.

## Phase 2 — specialist / less frequent flows

Add when useful:

9. `hand-special-layout.png`
10. `hand-special-fishing.png`
11. `game-correct-hand.png`
12. `hand-builder-mobile.png`

Do not create Phase 2 images merely because they are listed here. User testing or content implementation may show that some are unnecessary.

---

# Reuse map

A canonical screenshot should be referenced from multiple places rather than copied into several slightly different variants.

| Screenshot | Help | Features | How It Works / Guides |
| --- | --- | --- | --- |
| Game setup | Start game | Four-player scoring | Complete-game walkthrough |
| Game table score entry | Mixed entry / manual score | Manual or calculated | Game workflow |
| Ordinary hand builder | Ordinary hand | Visual tile entry | Hand walkthrough |
| Partial losing hand | Partial hand / Remaining tiles | Partial evidence | Evidence model |
| Winning tile | Winning tile / unknown | Provenance | Ask only when needed |
| Special layout | Irregular hand | Special layout | Special-hand help |
| Score breakdown | Disagreement | Explanations | Calculate → Explain |
| Special fishing | Fishing | Automatic fishing | Special-hand learning |
| Ledger / settlement | Settlement | Settlement / balances / record | Settle → Record |
| Correction | Correct hand | Undo / correction | — |
| Print / Save | Save / Full vs Summary | Printable record | Record |
| Mobile hand | — | Mobile use | Future mobile help |

---

# Screenshot style rules

## Use real UI

Canonical instructional images should be captures of the actual application state. Do not redraw the application or use AI-generated substitute UI for Help documentation.

## Crop to the task

Do not show a full browser window when the user only needs to understand one panel. Keep enough surrounding UI to provide orientation, then crop tightly enough that labels remain readable on a phone.

## Use consistent demo data

Prefer one reusable fictitious four-player game across the whole screenshot set.

Suggested players:

- Alex
- Beth
- Chris
- Dee

Use the same player/Wind assignments and a small set of deterministic demo hands wherever possible. This makes the screenshots feel like one coherent example game and makes future automated regeneration easier.

## Avoid personal or volatile data

Do not capture:

- real player names
- browser bookmarks/history
- notification bars
- operating-system chrome
- private URLs or local development details
- dates/times unless they are genuinely part of the product behaviour being explained

## Annotation style

Default: **no annotation**.

When a control would still be difficult to find:

- use one restrained outline, arrow or numbered marker;
- keep annotations outside the product’s own colour semantics where practical;
- never cover the label being explained;
- keep an unannotated canonical source image as well as any annotated derivative.

## Image dimensions

For desktop/tablet instructional captures, use one consistent viewport and preserve readable UI text rather than targeting marketing aspect ratios.

Recommended capture viewport to test first:

- **1280 × 900** for desktop/tablet source captures.

For mobile:

- use a common narrow viewport around **390 × 844**.

Crop derivatives for specific pages after capture rather than maintaining separate application states for every destination.

## Accessibility

Every placed screenshot needs alt text describing the task, not every visible pixel.

Good:

> “Partial losing hand in the scorer showing completed groups, Remaining tiles and the Partial evidence status.”

Bad:

> “Screenshot of app.”

Do not place essential instructional information only inside an image. The surrounding Help text must still explain the action.

---

# Capture automation direction

The long-term ideal is a **repeatable screenshot fixture**, not a folder of manual screenshots nobody can recreate.

A future capture script should be able to:

1. open a known demo state;
2. set a fixed viewport;
3. hide development-only UI;
4. wait for fonts/tile artwork to settle;
5. capture named screenshot targets;
6. write them to one canonical screenshot directory; and
7. make visual changes obvious in review when the product UI changes.

Do not build a large screenshot test framework before the first set proves useful. First define/capture the eight Phase 1 images. If they work well in the Help pages, automate regeneration afterwards.

---

# Proposed repository location

When real captures exist, keep canonical source screenshots in a predictable product-owned location, for example:

`artifacts/mahjong-scorer/public/help/screenshots/`

Suggested names:

- `game-setup.png`
- `game-table-score-entry.png`
- `hand-builder-ordinary.png`
- `hand-partial-losing.png`
- `hand-winning-tile.png`
- `hand-special-layout.png`
- `hand-score-breakdown.png`
- `hand-special-fishing.png`
- `game-ledger-settlement.png`
- `game-correct-hand.png`
- `game-print-save.png`
- `hand-builder-mobile.png`

Keep annotation derivatives separate only if annotations are actually required; do not create duplicate files pre-emptively.

---

# Decision rule for future screenshots

Before adding a screenshot, ask:

> **Will seeing this interface save the player from having to interpret a paragraph about where or how to do something?**

If yes, capture it.

If the image only makes the page look busier or repeats a rule already illustrated more clearly with tiles/diagrams, leave it out.
