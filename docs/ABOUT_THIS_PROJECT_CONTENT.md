# About this project — page content

> **Purpose:** learner-facing content for `/about`.
>
> This is the public project story and credits page. It should feel human, transparent and concise rather than like repository documentation.
>
> **Tone:** plain English, calm, friendly and independent. Do not imply that the project is an official BMJA product.

---

# About this project

## British Mahjong is easier to enjoy when the rules are easier to see

British Mahjong Scorer is a small independent project built to make British Mahjong easier to **score, understand and learn while you play**.

The aim is not to turn the game into a screen, or to make players memorise a scoring engine. It is to take care of the awkward bookkeeping and surface the useful rule at the moment it matters.

You should be able to say what tiles you have and what happened, and let the scorer do the rest.

> **Project principle**  
> Explain the game. Don’t make the player learn the scoring engine.

---

## What the project is trying to do

British Mahjong has a lot of small rules that interact:

- Pungs, Kongs and the limited use of Chows
- concealed and exposed sets
- major and minor tiles
- own Wind and prevailing Wind
- Flowers and Seasons
- doubles
- special hands
- fishing
- how the winning tile was obtained
- East’s effect on settlement
- progression through a complete game

None of those ideas is especially unreasonable on its own. The difficulty is remembering all of them at once while four people are also trying to play a game.

British Mahjong Scorer therefore has three jobs:

1. **Score the hand accurately.**
2. **Explain why it scored that way.**
3. **Help a newer player gradually understand the game without requiring them to study everything first.**

That is why the project includes both a scorer and learner-facing guides.

---

## What you can do here

### Score a game

Track a four-player game hand by hand, including player Winds, East, settlement between players, running balances and game progression. Confirmed hands build an expandable game ledger, and the finished record can be printed or saved as either a full game record or a compact game summary.

### Score a hand

Build one hand in detail and let the calculator work through the points, doubles, winning conditions and supported special patterns. For an unfinished losing hand, you can also enter only the scoring evidence you want to record; the scorer will not pretend that partial evidence is a complete reconstruction.

### Learn as you go

The Gameplay basics, Scoring basics and Special hands guides explain the same rules the scorer uses, with real tile illustrations rather than requiring you to translate notation or rulebook language first.

Inside the scorer, relevant detected patterns are surfaced when they actually apply instead of making you scan a permanent catalogue while playing.

---

## Rules and sources

The project uses **British Mahjong / BMJA-style rules**.

The main current public rules reference used during development is:

**Mah-Jong British Rules**  
`mahjongbritishrules.wordpress.com`

The site explains the British Mah-Jong Association rules and is based on the third edition of *Mah-Jong (Know the Game)* by Gwyn Headley and Yvonne Seeley. Where published corrections or later clarifications are available, the project aims to take those into account.

The scorer keeps a separate engineering rules reference so that implementation decisions, interpretations and known ambiguities can be recorded rather than hidden inside the code.

**Important:** British Mahjong Scorer is an **independent project**. It is not an official British Mah-Jong Association product and is not presented as being endorsed by the BMJA.

Where a rule is uncertain, the project should say so rather than quietly invent certainty.

---

## Accuracy and transparency

Mahjong rules can vary between groups, publications and traditions. This scorer is deliberately aimed at the British ruleset used by this project rather than trying to support every Mahjong variant.

The approach is:

- keep scoring rules explicit and testable
- use worked examples where useful
- record interpretations where the source is ambiguous
- ask the player for missing information when the scorer cannot safely infer it
- provide an “I’m not sure” route where appropriate and score conservatively
- distinguish partial evidence from a complete hand
- distinguish manually entered numeric scores from calculated detailed hands
- avoid claiming a special hand or bonus unless the entered evidence supports it
- keep the score breakdown visible so a player can understand the result

If the scorer and your table disagree, the detailed score breakdown should make it easier to identify exactly which rule is responsible.

---

## Designed for beginners too

A lot of Mahjong material is written for people who already know what they are looking for.

This project takes the opposite approach.

You should not need to know the name of a special hand before the app can detect it. You should not need to know which scoring category a tile belongs to before entering it. And you should not need to understand the settlement calculation before the scorer can tell you who pays whom.

The learning pages are therefore intentionally visual and practical. They are companions to playing the game, not a replacement rulebook.

---

## No account required

The scorer is designed as a lightweight browser-based tool and does not require a user account to score a hand or game.

An in-progress game is recovered locally in the same browser using browser storage, so ordinary refreshes, tab closure and browser restarts do not have to destroy the table’s current game. This is local recovery, not cloud sync or an online account history.

The project favours simple, low-maintenance browser-side features where they are sufficient rather than adding accounts, servers or databases without a clear reason.

---

## Your game record stays tied to what was actually entered

The live game ledger is also the source of truth for the printable game record.

Where a player used the detailed hand scorer, the ledger can retain the recorded tile evidence and scoring breakdown. Where a score was entered manually, the record says so rather than inventing a hand that was never captured. Partial hand evidence remains labelled as partial.

The game can be printed or saved through the browser as either:

- a **Full game record**, including detailed tile/scoring evidence where it exists; or
- a **Game summary**, focused on standings and the hand-by-hand results.

There is no separate report engine rewriting the history after the game.

---

## Tile artwork

The tile illustrations used throughout the scorer and guides come from the **Regular SVG set from `xhokir/riichi-mahjong-tiles`**, based on `FluffyStuff/riichi-mahjong-tiles`.

They are used under the **Creative Commons Attribution 4.0 International licence (CC BY 4.0)**.

The project uses a pinned copy of the artwork at build time rather than loading the tiles from an external site while you play.

> Mahjong tile artwork from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, used under CC BY 4.0.

The same tile artwork is reused across the scorer, learner guides, special-hand examples and saved game records so that the visual language stays consistent.

---

## Built in the open

Development takes place in the project’s GitHub repository:

`241443Mooks/BMJA-Mahjong-Scorer`

The repository contains the scoring logic, tests, working rules reference, learner-content drafts and implementation notes behind the site.

The public site is:

**mahjong.smooks.co.uk**

---

## Support the project

British Mahjong Scorer is a personal independent project. If it has made a game easier to score, helped you understand a rule, or saved an argument over the table, you can support its continued development here:

**Buy Me a Coffee**  
`buymeacoffee.com/sharronmo`

There is no requirement to contribute. The scorer and learning material are intended to remain useful without putting the basic experience behind an account or an unnecessary barrier.

---

## A note on the name

The project is called **British Mahjong Scorer** because it is built specifically around this British style of play and scoring.

It is not intended to imply ownership of British Mahjong, association with a governing body, or compatibility with every Mahjong ruleset.

---

# Suggested page design

Implementation should follow the visual language already established by the Beginner guide and Special hands catalogue.

Recommended hierarchy:

1. **Intro / project principle** — short hero, no marketing language.
2. **What the project is trying to do** — three simple purposes.
3. **What you can do here** — three compact cards linking to Score a game, Score a hand and the learner guides.
4. **Rules and sources** — visually distinct transparency panel.
5. **Designed for beginners too** — short editorial section.
6. **Accuracy and transparency** — restrained expandable/detail section if the page feels long.
7. **No account / local recovery** — short practical privacy/product section.
8. **Your game record** — explain the canonical ledger and Full/Summary print choices.
9. **Tile artwork / credits** — compact credit block, with CC BY 4.0 link in implementation.
10. **Built in the open** — GitHub + production site links.
11. **Support the project** — quiet Buy Me a Coffee card near the bottom, not a large donation banner.

## Navigation

Use the shared site header.

- Logo / British Mahjong Scorer title → Home
- Menu available top right
- No separate oversized Back button is necessary where the shared navigation already provides a clear route

## Links in implementation

Use real links for:

- Home
- Score a game
- Score a hand
- Gameplay basics
- Scoring basics / Beginner guide
- Special hands
- `https://mahjongbritishrules.wordpress.com/`
- the GitHub repository
- `https://creativecommons.org/licenses/by/4.0/`
- `https://buymeacoffee.com/sharronmo`

## Do not

- call this an official BMJA scorer
- imply BMJA endorsement
- reproduce substantial wording from the rules website or books
- describe unimplemented backlog ideas as current features
- turn the page into a technical architecture document
- put donation messaging ahead of the project explanation
