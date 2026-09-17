# Responsive instructional screenshot plan

> **Purpose:** define a small, maintainable system of real product screenshots for Help, guides and feature explanations.
>
> These are **instructional reference images**, not decorative marketing mockups. Their job is to answer practical questions such as “where do I do that?”, “what should I be looking for?” and “what does this look like on my device?”

## Core principle

Use screenshots to explain **the product interface**. Use tile illustrations and diagrams to explain **Mahjong itself**.

Examples:

- “What is a Chow?” → use a tile illustration.
- “Where do I enter a Chow?” → use a product screenshot.
- “How does East rotate?” → use the gameplay diagram.
- “Where can I see the current East player?” → use a product screenshot.

Do not screenshot every click. An instructional image belongs only where seeing the real interface materially reduces uncertainty.

---

# The revised model: one how-to, three responsive views

Every canonical instructional screenshot is a **three-image set**:

- **Mobile**
- **Tablet**
- **Desktop**

The instruction itself stays the same. Only the visual example changes to match the responsive layout.

A visitor should normally see the image that matches the viewport they are currently using. They can then deliberately switch between **Mobile | Tablet | Desktop** to inspect another layout.

This gives the guides two useful behaviours at once:

1. **automatic relevance** — the first image looks like the interface on the visitor’s current device; and
2. **manual comparison** — someone on a laptop can switch to Mobile while helping a person using the scorer on a phone.

## “Mobile first” now means authoring priority, not forced display

Mobile remains the first version we design and capture because table use is likely to be phone-heavy and because the mobile layout has the least space.

It does **not** mean every visitor should initially see the mobile screenshot.

Initial display should be:

- narrow viewport → Mobile
- medium viewport → Tablet
- large viewport → Desktop

The mobile image is also the safe HTML fallback.

---

# Recommended responsive behaviour

## Breakpoints

Use the same broad breakpoints already familiar to the product UI rather than inventing a screenshot-only responsive system.

Recommended initial mapping:

- **Mobile:** below `640px`
- **Tablet:** `640px` to `1023px`
- **Desktop:** `1024px` and above

These can be adjusted later if actual layouts show that a different boundary better matches the application.

## Automatic image selection

When the user has not manually selected a view, use the browser’s native responsive image behaviour.

Conceptually:

```html
<picture>
  <source media="(min-width: 1024px)" srcset="partial-losing-desktop.png">
  <source media="(min-width: 640px)" srcset="partial-losing-tablet.png">
  <img src="partial-losing-mobile.png" alt="…">
</picture>
```

The browser should therefore request the image appropriate to the current viewport rather than downloading all three merely to choose one.

## Manual view selector

Each instructional image block may expose:

> **Mobile | Tablet | Desktop**

The currently shown view should be visibly selected and the controls must be real accessible buttons, not icon-only decoration.

Behaviour:

1. On first load, the displayed image follows the viewport.
2. If the user chooses another view, that becomes a **manual override**.
3. The manual choice should be reused for subsequent instructional screenshot blocks during the same Help/guide session where practical.
4. A manual choice should not be treated as a permanent account preference.

Recommended persistence: `sessionStorage`, for example `mahjong-instruction-view`.

If no stored override exists, return to automatic viewport selection.

## Do not preload all three by default

The selector should not cause every page to download 3× the screenshot payload up front.

Load the automatic/current image first. Load another device version when the visitor explicitly requests it.

## Current-view indicator

When the system is still in automatic mode, a small client-side `matchMedia` check may be used to highlight the matching Mobile / Tablet / Desktop button.

Image selection itself should still prefer native `<picture>` behaviour rather than depending on JavaScript simply to determine screen width.

---

# The instructional block

The useful unit is not “a screenshot”. It is a **small how-to block**.

Recommended structure:

1. **Task title** — e.g. “How to enter a partial losing hand”
2. **Short answer** — one or two sentences
3. **Steps** — normally 2–4 concise actions
4. **Responsive screenshot** — automatically matched to the current viewport
5. **Mobile | Tablet | Desktop selector**
6. **Optional tip or evidence note**

Example content shape:

## How to enter a partial losing hand

Enter the completed scoring parts you know. Add ordinary loose tiles under **Remaining tiles** if you want to record them. You do not have to reconstruct every unseen or irrelevant tile.

1. Add any completed Pungs, Kongs, Chow or pair you know.
2. Add Flowers and Seasons if relevant.
3. Add loose ordinary tiles under **Remaining tiles**.
4. Stop when you have recorded the evidence you want.

**View:** Mobile | Tablet | Desktop

[responsive screenshot]

> **Tip:** Partial evidence is valid. Complete evidence unlocks additional whole-hand analysis.

The surrounding text remains the actual instruction. The image supports it rather than becoming the only place where the instruction exists.

---

# Canonical filename convention

Each instructional topic gets one stable slug and three device assets.

Pattern:

```text
<topic>-mobile.png
<topic>-tablet.png
<topic>-desktop.png
```

Example:

```text
partial-losing-hand-mobile.png
partial-losing-hand-tablet.png
partial-losing-hand-desktop.png
```

Recommended public location when implementation begins:

```text
public/help/screenshots/
```

Do not make separate copies of the same screenshot for Help, Features and How It Works. Those pages should reference the same canonical asset set.

---

# Capture viewports

Start with three explicit CSS viewport sizes so screenshots can be reproduced consistently.

## Mobile

**390 × 844**

Why:

- representative modern phone width;
- enough height to show a useful task state;
- forces the narrow layout rather than a compressed tablet layout.

## Tablet

**820 × 1180**

Why:

- clearly inside the medium layout range;
- useful portrait/tabletop form factor;
- enough width to reveal genuine tablet layout differences.

## Desktop

**1440 × 1000**

Why:

- reveals the intended desktop organisation;
- avoids capturing an excessively wide monitor that few users see;
- provides enough room for ledger and scoring layouts.

These are capture viewports, not claims that all devices use those exact dimensions.

For the pilot, capture at normal browser scale first. Only introduce higher device-scale-factor exports if real placement shows the text is not crisp enough.

---

# Canonical Phase 1 how-to set

Phase 1 should contain **eight instructional topics × three views = 24 images**.

The goal is not 24 different lessons. It is eight useful lessons that each work on mobile, tablet and desktop.

## 01 — How to start a game

**Slug:** `start-game`

**Assets:**

- `start-game-mobile.png`
- `start-game-tablet.png`
- `start-game-desktop.png`

**Show:**

- new-game/start-game screen;
- four player names;
- seat Winds / starting East where visible;
- prevailing Wind or game-length choices where visible;
- primary action to begin.

**Instructional job:** answer “Where do I start?” and make the four-player setup model obvious.

**Likely steps:**

1. Enter the four players.
2. Check the starting game options.
3. Start the game.

**Reuse:**

- Help → How do I start a complete game?
- Features → Four-player game scoring
- future complete-game walkthrough

**Demo state:** Alex, Beth, Chris and Dee.

---

## 02 — How to enter scores during a game

**Slug:** `game-score-entry`

**Assets:**

- `game-score-entry-mobile.png`
- `game-score-entry-tablet.png`
- `game-score-entry-desktop.png`

**Show:**

- active hand in a four-player game;
- current East / prevailing Wind context;
- player score-entry controls;
- one manual numeric score;
- detailed-score route visible for another player.

**Instructional job:** demonstrate that a table does not have to score every player the same way.

**Likely steps:**

1. Choose the winner/draw context as required.
2. Type a score directly when it is already known.
3. Open the detailed scorer when a hand needs calculating from tiles.
4. Confirm once the table is satisfied with the entries.

**Reuse:**

- Help → Do all four players have to use the detailed scorer?
- Help → I already know the score
- Features → Manual or calculated scores
- Features → Game progression/context

---

## 03 — How to build an ordinary hand

**Slug:** `ordinary-hand`

**Assets:**

- `ordinary-hand-mobile.png`
- `ordinary-hand-tablet.png`
- `ordinary-hand-desktop.png`

**Show:**

- ordinary detailed hand builder;
- Pung / Kong / Chow / Pair entry routes;
- exposed/concealed state where visible;
- Flowers / Seasons if they fit naturally.

**Instructional job:** establish the product’s visual hand-building model instead of compact notation.

**Likely steps:**

1. Add each completed set or pair.
2. Mark exposed/concealed where relevant.
3. Add Flowers and Seasons separately.
4. Let the score update from the structured hand.

**Reuse:**

- Help → How do I enter an ordinary hand?
- Features → Visual tile entry
- Features → Exposed and concealed sets
- future “How to score a hand” walkthrough

---

## 04 — How to score a partial losing hand

**Slug:** `partial-losing-hand`

**Assets:**

- `partial-losing-hand-mobile.png`
- `partial-losing-hand-tablet.png`
- `partial-losing-hand-desktop.png`

**Show:**

- losing-hand state;
- two or three completed scoring groups;
- Remaining tiles;
- visible partial/completeness state;
- current supported score if shown.

**Instructional job:** make “partial evidence is valid” tangible.

**Likely steps:**

1. Enter the completed scoring groups you know.
2. Add the pair / Flowers / Seasons if relevant.
3. Add loose ordinary tiles under Remaining tiles if useful.
4. Stop without inventing the rest of the hand.

**Reuse:**

- Help → What if I only know part of a losing hand?
- Help → What are Remaining tiles?
- Features → Partial-evidence scoring
- Features → Clear completeness state
- How It Works → Evidence / Partial

**Priority:** **very high**.

---

## 05 — How to tell the scorer which tile completed Mah Jong

**Slug:** `winning-tile`

**Assets:**

- `winning-tile-mobile.png`
- `winning-tile-tablet.png`
- `winning-tile-desktop.png`

**Show:**

- completed winning hand;
- “Which tile completed Mah Jong?” prompt;
- selectable tiles / destination group where applicable;
- “I’m not sure” option.

**Instructional job:** explain why the app occasionally asks one more question and show that uncertainty is allowed.

**Likely steps:**

1. Look at the completed hand.
2. Tap the tile that completed Mah Jong.
3. If you genuinely do not know, choose **I’m not sure**.

**Reuse:**

- Help → Why does the scorer ask which tile completed Mah Jong?
- Help → What if I do not know?
- Features → Winning-tile provenance
- How It Works → asks only when necessary

---

## 06 — How to understand the score

**Slug:** `score-breakdown`

**Assets:**

- `score-breakdown-mobile.png`
- `score-breakdown-tablet.png`
- `score-breakdown-desktop.png`

**Show:**

- entered hand;
- current/final score;
- points and doubles breakdown;
- at least one contextual explanation/pattern.

**Instructional job:** answer “Why did it score that?”

**Likely steps:**

1. Check the overall score.
2. Read the point components.
3. Check which doubles or patterns applied.
4. Compare the evidence with the relevant rule if something looks unexpected.

**Reuse:**

- Help → What if the scorer and our table disagree?
- Features → Points and doubles
- Features → Contextual explanations
- How It Works → Calculate / Explain
- Scoring guide → bridge into the live scorer

**Priority:** **very high**.

---

## 07 — How to read settlement and game history

**Slug:** `ledger-settlement`

**Assets:**

- `ledger-settlement-mobile.png`
- `ledger-settlement-tablet.png`
- `ledger-settlement-desktop.png`

**Show:**

- at least two confirmed hands;
- one expanded ledger entry;
- winner / player scores;
- actual player-to-player settlement transactions;
- running balances;
- East / prevailing context if visible.

**Instructional job:** explain settlement, running totals, history and the canonical record in one state.

**Likely steps:**

1. Open the confirmed hand in the ledger.
2. Read each player’s hand score.
3. Check the stored payments between players.
4. Read the updated running balances.

**Reuse:**

- Help → How does settlement work?
- Features → Automatic settlement
- Features → Running balances
- Features → Rich game record
- How It Works → Settle / Record

**Priority:** **very high**.

---

## 08 — How to print or save the game record

**Slug:** `print-save-game`

**Assets:**

- `print-save-game-mobile.png`
- `print-save-game-tablet.png`
- `print-save-game-desktop.png`

**Show:**

- Print / Save game action;
- Full game record vs Game summary choice;
- relevant explanation around the two modes.

**Instructional job:** show exactly where the saved record comes from and clarify Full vs Summary before the browser-native print flow.

**Likely steps:**

1. Open Print / Save game.
2. Choose **Game summary** for a compact record or **Full game record** for captured evidence and detail.
3. Continue to the browser print flow.
4. Print physically or choose the browser’s Save as PDF option.

**Reuse:**

- Help → How do I save the game record?
- Help → Full game record vs Game summary
- Help → Can I print before the game is finished?
- Features → Print / Save as PDF
- Features → Full vs Summary

**Important:** do not maintain screenshots of native browser Print dialogs. They vary by browser and operating system and would age badly.

---

# Phase 2 candidate how-tos

Only add these after the first two pilot topics prove that the responsive screenshot pattern is genuinely helpful.

## 09 — How to enter a hand that does not fit normal sets

**Slug:** `special-layout`

Show the “My hand doesn’t fit normal sets” route and loose-tile special layout entry.

Useful for:

- Help → special layout
- Features → irregular special layouts
- contextual special-hand guidance

## 10 — How to understand special-hand fishing

**Slug:** `special-fishing`

Show a complete non-winning hand, detected fishing pattern, completing tile(s) and fishing value.

Useful for:

- Help → special fishing
- Features → automatic special-hand fishing

## 11 — How to correct a confirmed hand

**Slug:** `correct-hand`

Show the confirmed ledger entry and the correction/undo affordance in context.

Useful for:

- Help → mistake in a confirmed hand
- Features → undo/correction

## 12 — How to use Flowers and Seasons in the scorer

**Slug:** `flowers-seasons-entry`

Only add if user testing shows that people understand the Mahjong concept but struggle to locate or use the product controls.

Do not add simply because Flowers and Seasons are an important rule area; the existing tile/guide illustrations already teach the underlying concept.

---

# Features/topics that should not automatically get screenshots

| Feature / help topic | Decision | Reason |
| --- | --- | --- |
| Local browser recovery | Text first | Unless a distinct Resume/Recover UI exists, storage behaviour is not meaningfully visible. |
| No account required | No screenshot | Absence of login is not useful instructional imagery. |
| Tile copy limits | Only if users get stuck | Validation text is stronger unless the error UI itself is confusing. |
| Kong physical vs structural count | Tile diagram + text | This is mainly a Mahjong/data-model concept, not a control-location problem. |
| “Unknown means unknown” | Reuse Winning tile | The I’m-not-sure state demonstrates it naturally. |
| Draws / game progression | Reuse game screenshots | Do not create images just to show labels changing. |
| Final standings | Reuse ledger/record unless materially different | Capture separately only if the completed-game UI has distinct instructional value. |
| Navigation / safe exits | Text first | Add images only if testing shows people cannot locate the controls. |
| Ruleset comparison | Use comparison page itself | It is learning content, not an app-control how-to. |

---

# Pilot before full capture

Do **not** immediately build all 24 Phase-1 files.

First implement and evaluate **two complete responsive how-to sets**.

Recommended pilots:

## Pilot A — Partial losing hand

Why:

- unusually valuable product behaviour;
- hard to explain with a generic screenshot;
- meaningful layout differences likely across phone/tablet/desktop;
- useful in Help, Features and How It Works.

Capture:

- `partial-losing-hand-mobile.png`
- `partial-losing-hand-tablet.png`
- `partial-losing-hand-desktop.png`

## Pilot B — Print / Save game

Why:

- straightforward practical task;
- visually clear controls;
- likely to appear in Help;
- lets us test whether device-specific screenshots still add value when the task itself is simple.

Capture:

- `print-save-game-mobile.png`
- `print-save-game-tablet.png`
- `print-save-game-desktop.png`

## Pilot questions

Before scaling, answer:

- Does the screenshot materially reduce explanation?
- Does automatic viewport selection feel natural?
- Is the device selector obvious without dominating the help content?
- Is Mobile / Tablet / Desktop the right language?
- Are the crops readable at normal page width?
- Does manually viewing Desktop on a phone remain useful enough without a zoom/full-size control?
- Do we need annotations at all?
- Does one how-to block feel helpful or visually heavy?

Only then capture the remaining Phase-1 sets.

---

# Screenshot style rules

## Use the real product

Canonical instructional images must be captures of the actual application state.

Do not use AI-generated substitute UI, recreated mockups or decorative device frames in Help documentation.

## Teach the task, not the whole screen

Capture enough surrounding context to orient the user, but keep the relevant labels readable.

A desktop capture does not need to show the entire page merely because the viewport is wide.

Device variants may use different crops when the UI itself is genuinely reorganised. They should still show the same logical task state.

## Same state across all three views

Within one how-to set, Mobile, Tablet and Desktop should represent the **same logical example** wherever possible.

Example:

- same player names;
- same hand;
- same score;
- same ledger history;
- same expanded item;
- same selected Full/Summary option.

The aim is to demonstrate layout difference, not change the lesson between devices.

## Consistent demo game

Prefer one fictitious game across the whole library.

Suggested players:

- Alex
- Beth
- Chris
- Dee

Use stable Wind assignments and deterministic example hands so the screenshots feel like one coherent walkthrough and can later be regenerated automatically.

## Avoid volatile/private capture content

Do not include:

- real player names;
- browser bookmarks or history;
- notification banners;
- operating-system chrome;
- local development URLs;
- private tabs/windows;
- timestamps unless relevant to the instruction.

## Annotation policy

Start with **unannotated real screenshots**.

The written steps should do the teaching where possible.

If the pilot shows that a control is still hard to locate:

- create a lightly annotated derivative;
- use one or two restrained numbered markers / outlines;
- never cover the label being explained;
- keep the clean source screenshot as the canonical base asset.

Do not bake a forest of arrows into every image.

---

# Accessibility

## Alt text

Every screenshot set needs task-focused alt text.

Good:

> “Partial losing hand in the scorer showing completed groups, Remaining tiles and the Partial evidence status.”

Bad:

> “Screenshot of app.”

The same alt description may normally be used for all three device versions because they demonstrate the same task. Mention device/layout only where that difference itself matters.

## Instructions cannot live only in the image

The surrounding text must still contain the action and relevant warning/tip.

Screenshots may orient and reassure. They must not be the sole carrier of required instructions.

## Selector accessibility

The Mobile / Tablet / Desktop control should:

- use actual buttons;
- have an accessible group label such as “Screenshot view”;
- expose selected state with `aria-pressed` or an equivalent appropriate pattern;
- work by keyboard;
- retain visible focus states;
- not rely on device icons alone.

## Motion

Changing screenshot view should not use elaborate sliding/zoom animation. A simple image replacement/fade is sufficient, and no animation is required.

---

# Suggested reusable component contract

This is a design contract, not an instruction to build a component in this documentation PR.

A future component could conceptually accept:

```ts
type InstructionScreenshotSet = {
  id: string;
  alt: string;
  caption?: string;
  mobile: { src: string; width: number; height: number };
  tablet: { src: string; width: number; height: number };
  desktop: { src: string; width: number; height: number };
};
```

The component should own:

- native automatic responsive selection;
- Mobile / Tablet / Desktop override buttons;
- session-level override reuse;
- image dimensions to reduce layout shift;
- lazy loading for screenshots below the fold;
- accessible alt text and selector labels.

The individual Help page should not contain repeated breakpoint-selection logic.

---

# Reuse map

| How-to set | Help | Features | How It Works / Guides |
| --- | --- | --- | --- |
| Start game | Start complete game | Four-player scoring | Complete-game walkthrough |
| Game score entry | Mixed/manual entry | Manual or calculated | Game workflow |
| Ordinary hand | Enter ordinary hand | Visual tile entry | Hand walkthrough |
| Partial losing hand | Partial / Remaining tiles | Partial evidence | Evidence model |
| Winning tile | Winning tile / unknown | Provenance | Ask only when needed |
| Score breakdown | Disagreement | Explanations | Calculate → Explain |
| Ledger / settlement | Settlement | Settlement / balances / record | Settle → Record |
| Print / Save | Save / Full vs Summary | Printable record | Record |
| Special layout | Irregular hand | Special layout | Special-hand help |
| Special fishing | Fishing | Automatic fishing | Special-hand learning |
| Correction | Correct hand | Undo / correction | — |

---

# Capture automation direction

The long-term ideal is a **repeatable screenshot fixture**, not 24 manually staged images nobody can recreate after a UI change.

Do not build that automation until the two pilot topics establish that the visual pattern is worth keeping.

If the pilot succeeds, a lightweight browser-capture workflow should eventually be able to:

1. load a deterministic demo state;
2. set the required viewport;
3. wait for fonts/tile artwork/layout to settle;
4. capture the named task region or viewport;
5. repeat at Mobile, Tablet and Desktop sizes;
6. save to the canonical filenames;
7. fail visibly if the target UI can no longer be found.

The three-device variants should come from **one fixture state**, not three separately maintained fake games.

## Prefer deterministic state over brittle click scripts

If practical, the capture workflow should load known local game/hand fixtures before navigation rather than replaying a very long sequence of UI clicks merely to reach the screenshot state.

The screenshot still has to render the real product. The fixture is only a reproducible way of getting the product into that state.

## Do not make screenshot automation part of scoring logic

Fixtures/capture helpers belong in documentation/testing support. They must not become production scoring dependencies.

---

# Maintenance rules

A screenshot set should be regenerated when:

- the control it explains changes position or wording materially;
- a breakpoint changes the relevant layout;
- the underlying workflow changes;
- the screenshot becomes misleading.

It does **not** need regeneration for every cosmetic spacing change.

If only one breakpoint changes materially, it is acceptable to regenerate only that device asset as long as the three images still represent the same logical state.

When a feature changes, review the canonical how-to once and let all pages that reference it benefit from the same update.

---

# Implementation sequence

## Step 1 — merge this plan

Agree the responsive instructional model before adding image infrastructure.

## Step 2 — pilot the reusable UI pattern

Build one small `InstructionScreenshot`/equivalent component with:

- automatic responsive image selection;
- Mobile / Tablet / Desktop selector;
- session override behaviour;
- accessible markup.

Do not yet wire screenshots across every page.

## Step 3 — capture the two pilot sets

Create the six pilot images for:

- Partial losing hand; and
- Print / Save game.

## Step 4 — place them in real Help content

Use the actual Help answers, not a throwaway demo page, so we can judge the pattern in context.

## Step 5 — review the experience

Check mobile, tablet and desktop physically or in browser responsive mode and answer the pilot questions above.

## Step 6 — scale only if it helps

If the pattern works, capture the remaining Phase-1 sets and reuse them from Features / How It Works / guides where they add value.

If it feels heavy or redundant, keep only the topics where screenshots genuinely improve comprehension.

---

# Success criteria

This screenshot system is successful if:

- a user can recognise the interface shown on their own device without manually choosing a view first;
- a user can deliberately inspect another layout when helping someone on a different device;
- one set of instructional copy works across all three screenshots;
- screenshots reduce uncertainty rather than add visual clutter;
- Help remains useful with images unavailable;
- the same canonical screenshot set can be reused across Help, Features and explanatory pages;
- updating an instructional image does not require editing multiple independent copies;
- the project can eventually regenerate the image library predictably after meaningful UI changes.

The target is not “more screenshots”. The target is a small **responsive visual manual** that makes the scorer easier to use.