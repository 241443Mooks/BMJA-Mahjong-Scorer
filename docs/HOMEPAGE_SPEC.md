# Homepage / Entry Point Specification

## Purpose

The homepage should stop launching directly into a new game.

Instead, it should act as the front door to the whole British Mahjong Scorer experience: scoring, learning and reference.

The product is no longer only a calculator. It is becoming a **British Mahjong companion** that helps players:

- score a full game
- score one hand
- understand how gameplay works
- understand how scoring works
- browse special hands
- understand what the project is and how its rules/content are sourced

The homepage should make those choices obvious without making the user navigate a conventional, menu-heavy website.

## Core principle

A user who is sitting at a Mahjong table should be able to reach scoring in one tap.

A newer player should also be able to arrive at the site and understand what it can help them do without already knowing the structure of the rules.

The homepage should therefore prioritise **actions first, learning second, project information last**.

---

# Proposed homepage hierarchy

## Page heading

**British Mahjong Scorer**

Suggested supporting line:

> Score a game, check a hand, or learn the rules as you play.

Alternative supporting line if a warmer tone works better in implementation:

> Score a game, work out a hand, or learn British Mahjong as you play.

Avoid a long introductory paragraph above the choices.

---

# Primary actions

The first two choices should be visually stronger than the rest because they are the most likely actions during play.

## 1. Score a game

**Suggested card title**  
Score a game

**Suggested description**  
Start or continue a four-player game, score each hand, settle payments and keep running totals.

**Destination**  
The current full-game scorer.

**Priority**  
Primary.

**UX note**  
This should be the clearest first action on the page.

### Future persistence behaviour

Once issue #14 persistence/recovery is implemented, this card should become state-aware.

If there is no saved game:

> **Score a game**  
> Start a four-player game and keep track of every hand.

If a recoverable game exists:

> **Continue game**  
> Hand 7 · South prevailing  
> Continue where you left off.

A smaller secondary action can offer:

> Start a new game

Do not make users hunt through settings to resume a saved game.

The homepage becomes the natural recovery point for in-progress play.

---

## 2. Score a hand

**Suggested card title**  
Score a hand

**Suggested description**  
Work out the score for one hand without starting a full game.

**Destination**  
The existing standalone detailed hand scorer / current top-level hand-scoring route.

**Priority**  
Primary.

**UX note**  
This should remain useful for:

- checking a single completed hand
- learning scoring
- verifying a score during a game that is being recorded elsewhere
- exploring special hands

The standalone hand scorer should not require users to create or start a game.

---

# Learning and reference

These choices should sit below the two primary scoring actions.

A small section heading can be used:

## Learn British Mahjong

The learning cards should feel clearly available but should not visually compete with **Score a game** and **Score a hand**.

---

## 3. Gameplay basics

**Suggested card title**  
Gameplay basics

**Suggested description**  
Learn the tiles, sets, dealing, claiming, Kongs, Flowers and Seasons, Winds and how a game progresses.

**Destination**  
Future learner-facing gameplay guide.

**Content scope**

Likely topics:

- tile families
- numbered suits
- Winds and Dragons
- Flowers and Seasons
- major/minor terminology where useful
- the initial deal
- 13-tile structural hand
- East's initial 14 tiles
- drawing and discarding
- Chow, Pung, Kong and pair
- claiming a discard
- concealed and exposed sets
- Kong replacement tile
- going Mah Jong
- East and prevailing Wind
- East retention
- player rotation
- prevailing-Wind progression
- draws / washouts

The page should teach gameplay without forcing the user to understand scoring at the same time.

---

## 4. Scoring basics

**Suggested card title**  
Scoring basics

**Suggested description**  
Understand basic points, doubles, special hands and how players settle after each hand.

**Destination**  
Future learner-facing scoring guide based on `docs/BEGINNER_GUIDE_CONTENT.md`.

**Content scope**

Likely topics:

- how an ordinary hand receives base points
- Pung/Kong values
- pair values
- Flowers and Seasons
- Mah Jong points
- winning-method points
- what a double means
- stacking doubles
- the usual 1,000-point limit
- fixed-value special hands
- fishing / calling
- winner settlement
- loser-to-loser differences
- East doubling
- why the scorer asks certain contextual questions

Progressive disclosure is preferred. A beginner should not be greeted by the complete scoring table unless they choose to expand it.

---

## 5. Special hands

**Suggested card title**  
Special hands

**Suggested description**  
Browse British Mahjong special hands, their values, example patterns and how the scorer recognises them.

**Destination**  
Future special-hand catalogue based on `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`.

**Content principles**

The catalogue is a reference destination, not a prerequisite for using the scorer.

The player should not need to know the name of a special hand before entering their tiles.

Where possible, the scorer should detect special hands automatically from:

- tile pattern
- set composition
- visibility
- winning tile provenance
- winning method
- event facts already captured in the scoring flow

Each catalogue entry can show:

- name
- plain-English description
- winner value
- fishing value where applicable
- small visual tile example where useful
- entry route
- automatic-detection behaviour
- any short event question the scorer may need to ask

---

# Project information

## 6. About this project

**Suggested card title**  
About this project

**Suggested description**  
Learn how the scorer was built, which rules sources it uses, and how to support the project.

**Destination**  
Future About page.

**Content scope**

The About page can include:

- what British Mahjong Scorer is
- the aim: make British Mahjong scoring easier and clearer, particularly for newer players
- the project philosophy: explain the game without requiring the player to learn the scoring engine
- the rules-source hierarchy
- links to the underlying British Mahjong references
- statement that this is an independent project and not an official BMJA publication
- open-source / repository information where appropriate
- tile artwork source and CC BY 4.0 attribution
- `mahjong.smooks.co.uk`
- Buy Me a Coffee link: `https://buymeacoffee.com/sharronmo`

The support link should remain low-pressure. It is appropriate on the About page, in generated reports and other durable outputs rather than being a disruptive gameplay prompt.

---

# Visual hierarchy

Recommended mobile-first structure:

```text
British Mahjong Scorer
Score a game, check a hand, or learn the rules as you play.

[ Score a game ]
Start or continue a four-player game...

[ Score a hand ]
Work out one hand...

Learn British Mahjong

[ Gameplay basics ]   [ Scoring basics ]
[ Special hands ]

[ About this project ]
```

This is conceptual, not a requirement for a literal two-column layout.

On narrow screens, stacked cards may be clearer and more accessible.

## Primary cards

**Score a game** and **Score a hand** should have:

- stronger visual weight
- larger tap targets
- first-screen visibility where practical
- short descriptions
- no extra confirmation step

## Secondary cards

Gameplay basics, Scoring basics and Special hands should be clearly grouped as learning/reference routes.

## About

About this project should be visually quieter and can sit at the bottom of the page.

---

# Navigation philosophy

Avoid turning the homepage into a conventional marketing site with:

- a large hero section
- long promotional copy
- multiple calls to action for the same destination
- a large desktop-style navigation bar
- a hamburger menu as the main discovery mechanism

The six choices are themselves the navigation.

A small persistent header or compact navigation can still be added later if it improves movement between scorer and reference pages, but the homepage should remain understandable without it.

---

# Returning-player behaviour

The homepage should become more useful once local persistence exists.

Possible future states:

## No saved game

Primary action:

**Score a game**

## Saved game exists

Primary action:

**Continue game**

Useful context can include only what is reliable and concise, for example:

- hand number
- prevailing Wind
- current East
- player names if space permits

Do not overload the card with ledger details.

A clear **Start a new game** route must still be available.

---

# Content relationships

This homepage should link into existing/future project content rather than duplicate it.

Relevant source documents:

- `docs/BEGINNER_GUIDE_CONTENT.md`
- `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`
- `docs/TILE_ASSET_DECISION.md`
- `docs/END_GAME_REPORT_SPEC.md`
- `BMJA_RULES_REFERENCE.md`

The homepage itself should remain concise.

---

# Accessibility

The homepage must:

- use real links/buttons with clear accessible names
- provide large touch targets
- work fully by keyboard
- preserve visible focus states
- not rely on colour alone to distinguish primary from secondary cards
- maintain readable contrast
- avoid tiny explanatory text
- use heading hierarchy correctly
- make card descriptions optional context rather than part of the clickable label if that improves screen-reader clarity

---

# MVP acceptance criteria

The first implementation is complete when:

1. Visiting `/` shows a homepage rather than automatically starting the game scorer.
2. The homepage presents six clear destinations:
   - Score a game
   - Score a hand
   - Gameplay basics
   - Scoring basics
   - Special hands
   - About this project
3. Score a game reaches the current full-game scorer in one action.
4. Score a hand reaches the current standalone hand scorer in one action.
5. Learning/reference cards point to either implemented pages or deliberate placeholder routes while those pages are being built.
6. Primary scoring actions are visually stronger than learning/reference actions.
7. The design is mobile-first and works on a typical phone without requiring a menu to discover the six choices.
8. The homepage contains no unnecessary marketing copy or duplicated controls.
9. Once #14 persistence is available, the Score a game card can become a Continue game state without redesigning the page architecture.
10. The About route provides a natural home for project independence, sources, attribution and support information.

---

# Product principle

The homepage should communicate the central design philosophy of the project without needing to state it explicitly:

> The player should not need to know where they are in the rulebook before the app can help them.

Scoring should remain one tap away. Learning should be available when wanted. Reference material should support the game rather than stand in its way.
