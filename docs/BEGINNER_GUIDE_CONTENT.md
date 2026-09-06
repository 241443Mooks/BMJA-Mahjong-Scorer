# British Mahjong Beginner Guide — Content Draft

This document is the content source for a future beginner-friendly guide inside the British Mahjong Scorer.

It is **not an official BMJA publication**. It is a project-owned learner guide based on the rules implemented in the scorer and the source hierarchy recorded in `BMJA_RULES_REFERENCE.md`.

The aim is not to reproduce a rulebook. The aim is to help a beginner understand the game well enough to use the scorer confidently, while allowing the app to handle the obscure scoring logic automatically.

> **Content principle:** Explain the game; do not make the player learn the scoring engine.

---

## Recommended guide structure

Suggested top-level pages or expandable sections:

1. Getting started
2. What makes a Mahjong hand?
3. The tiles
4. Your 13 tiles and the winning tile
5. Exposed and concealed sets
6. How ordinary scoring works
7. What is a double?
8. What does fishing mean?
9. Special hands
10. Settling up
11. Glossary
12. Full scoring reference

The main learning flow should stay short and reassuring. Detailed tables, exhaustive doubles and the full special-hand catalogue should sit one level deeper under reference-style pages.

---

# 1. Getting started

## British Mahjong — a practical guide

British Mahjong can look complicated because scoring combines the tiles in your hand, how they were grouped, how you won, and sometimes what happened during play.

You do not need to memorise all of that to use this scorer.

This guide explains enough to understand what the app is asking you and why. The scorer handles the detailed arithmetic, checks the rules it can infer from your tiles, and only asks extra questions when the answer cannot be seen from the hand itself.

### Suggested callout

**New to scoring?**

Start with your actual tiles. The scorer will do most of the classification for you.

---

# 2. What makes a Mahjong hand?

A normal Mahjong hand is made from **four sets and a pair**.

A set can be:

- a **Pung** — three identical tiles
- a **Kong** — four identical tiles
- a **Chow** — three consecutive numbers in the same suit

Under British rules, a normal hand can contain **no more than one Chow**.

Some named special hands use completely different patterns. If your hand does not fit naturally into normal sets, the scorer can check those separately.

### Suggested interface link

**My hand does not fit normal sets →**

This should lead naturally to the irregular special-hand route rather than presenting “Special layout” as an equal default choice.

---

# 3. The tiles

There are three numbered suits:

- **Bamboos**
- **Characters**
- **Circles**

Each suit runs from 1 to 9.

There are also four Winds:

- East
- South
- West
- North

And three Dragons:

- Red
- Green
- White

Flowers and Seasons are bonus tiles. They are put aside when drawn and replaced, so they do not form part of the normal 13- or 14-tile hand.

## Major and minor tiles

British scoring distinguishes between **minor** and **major** tiles.

- 2–8 in the three numbered suits are **minor**.
- 1s, 9s, Winds and Dragons are **major**.

You do not need to classify these yourself. The scorer does it automatically.

## Honours

The Winds and Dragons are collectively called **honours**.

Some scoring rules refer to honours as a group, so you may see that term in score explanations.

---

# 4. Your 13 tiles and the winning tile

During normal play you hold a structural hand of **13 playing tiles**.

When you go Mah Jong, the winning tile stays in your hand, giving **14 playing tiles**.

## What about Kongs?

Kongs are the exception to the simple physical count.

A Kong contains four identical tiles rather than three. When a Kong is declared, a replacement tile is drawn, so a hand containing one or more Kongs can physically contain more than 13 or 14 playing tiles while still having the correct underlying hand structure.

The scorer should account for this automatically.

## What about Flowers and Seasons?

Flowers and Seasons do **not** count towards the 13- or 14-tile playing-hand total.

Each one is set aside and replaced when drawn.

### Suggested learner note

If the app says your tile count is wrong, check that:

- every ordinary playing tile is included
- Flowers and Seasons are entered as bonus tiles, not part of the hand structure
- any Kongs are entered as Kongs rather than Pungs

---

# 5. Exposed and concealed sets

A set is **concealed** if you made it entirely from tiles you drew yourself.

A set is **exposed** if you claimed another player’s discard to complete it.

Concealed Pungs and Kongs normally score more than exposed ones, so the scorer asks which applies.

The way the final winning tile was obtained can sometimes create an exception. When that matters, the scorer asks which tile completed Mah Jong rather than expecting you to know the rule.

### Suggested short explanation beside the control

**Concealed** — completed entirely from your own draws.

**Exposed** — completed by claiming another player’s discard.

---

# 6. How ordinary scoring works

British Mahjong scoring happens in stages.

First, the hand receives **basic points** for things such as:

- Pungs
- Kongs
- certain pairs
- Flowers and Seasons

A winning hand also receives **20 points for Mah Jong** and may receive additional points depending on how it was completed.

Next, any **doubles** are applied.

Finally, the normal score limit is applied — usually **1,000 points**.

You can inspect the scorer’s breakdown if you want to see exactly where a total came from.

## Basic set values

This table belongs in the deeper reference layer rather than the first-time learning flow.

### Pungs

| Tile type | Exposed | Concealed |
| --- | ---: | ---: |
| Minor | 2 | 4 |
| Major | 4 | 8 |

### Kongs

| Tile type | Exposed | Concealed |
| --- | ---: | ---: |
| Minor | 8 | 16 |
| Major | 16 | 32 |

### Other basic points

- Chow: 0 points
- Dragon pair: 2 points
- Pair of your own Wind: 2 points
- Pair of the prevailing Wind: 2 points
- Each Flower: 4 points
- Each Season: 4 points
- Mah Jong: 20 points
- Winning from the live wall: 2 additional points

If your own Wind and the prevailing Wind are the same, both pair awards can apply.

---

# 7. What is a double?

A **double** means the relevant score is multiplied by two.

Several doubles can apply to the same hand:

- one double = ×2
- two doubles = ×4
- three doubles = ×8

Examples include certain Dragon or Wind sets, having no Chows, using one suit with honours, a fully concealed winning hand, or particular ways of going Mah Jong.

The scorer checks these conditions from the information you enter and explains the doubles it applies.

## Beginner-facing guidance

Do not ask the player to memorise the full doubles list before using the scorer.

The exhaustive list should be available under **Full scoring reference**, while the normal hand result should explain only the doubles that actually applied.

---

# 8. What does “fishing” mean?

**Fishing** means your hand needs exactly one more tile to go Mah Jong.

You may also hear this described as *calling*.

Some special hands receive a score even when you were fishing for them when another player went Mah Jong.

You do not need to tell the scorer which special hand you were fishing for. Enter the tiles you actually hold and the scorer will look for valid completing tiles.

## Important distinction

Fishing is not the same thing as **Original Call**.

They are separate scoring concepts and the app treats them separately.

### Suggested result language

**You are fishing for:** Thirteen Unique Wonders

**Possible winning tiles:** Red Dragon, East Wind

The scorer should show the detected pattern and possible completing tiles without requiring the beginner to know the special-hand name in advance.

---

# 9. Special hands

British Mahjong includes a number of named **special hands** which do not use ordinary scoring in the usual way.

Some are unusual tile patterns, such as:

- Thirteen Unique Wonders
- Knitting
- Triple Knitting
- Gates of Heaven
- Wriggling Snake

Others depend on the circumstances of the win, such as drawing a particular tile from a particular place in the wall.

The scorer detects these where it can.

If it needs information that cannot be seen from the tiles, it asks a short question about what happened rather than asking you to identify the name of the special hand.

## Suggested call to action

**Browse special hands →**

This can lead to a separate reference catalogue.

## Future special-hand catalogue design

Each special-hand entry could contain:

- name
- simple description of the pattern or event
- winner value
- fishing value where applicable
- small visual example where useful
- whether the scorer detects it automatically
- any short event question the scorer may need to ask

Avoid presenting all special hands in the main beginner flow.

---

# 10. Settling up

Scoring the four hands is only the first step. Players then settle between one another.

The winner is paid their score by each of the other three players.

The three losing players also settle the differences between their own scores.

**East is special:** payments involving East are doubled.

The scorer handles these transfers automatically and shows who pays whom.

## Beginner-friendly example

A worked example should be added later using a verified project fixture.

The important learner message is:

> You do not need to calculate the payments yourself. Enter the four hand scores and the scorer will apply East doubling and the loser-to-loser differences.

## Draws / wash-outs

When a hand is a draw, East remains East and the current project implementation makes no settlement transfers.

This is documented as a project interpretation in `BMJA_RULES_REFERENCE.md` because the available source clearly supports East remaining unchanged after a draw, but a separate worked BMJA payment example for a wash-out has not yet been identified.

---

# 11. Glossary

## Chow

Three consecutive numbered tiles in the same suit.

## Pung

Three identical tiles.

## Kong

Four identical tiles.

## Pair

Two identical tiles.

## Concealed

A set completed entirely from tiles you drew yourself.

## Exposed

A set completed by claiming another player’s discard.

## Honours

The four Winds and three Dragons.

## Major tile

A 1, a 9, a Wind or a Dragon.

## Minor tile

A suited tile from 2 to 8.

## Fishing

Needing exactly one tile to go Mah Jong.

## Mah Jong

A completed winning hand.

## Prevailing Wind

The Wind of the current round.

## Own Wind

Your current seat Wind.

## Loose / replacement tile

A replacement tile drawn after a Kong or bonus tile.

## Original Call

A separate BMJA scoring condition. It is not simply another name for fishing.

---

# 12. Full scoring reference

The learner guide should link to a deeper reference rather than duplicate every rule in the main flow.

Suggested reference sections:

- standard set values
- honour-pair values
- bonus tiles
- all ordinary doubles
- winning-method bonuses and doubles
- complete special-hand catalogue
- special fishing values
- settlement rules
- East doubling
- game progression
- rule interpretations / ambiguities

The engineering source of truth remains `BMJA_RULES_REFERENCE.md`.

The public reference should be generated or maintained from the same rule decisions so the learner guide and scorer do not drift apart.

---

# Content and UX principles for implementation

## 1. Explain only what the player needs at that point

Do not front-load the full rule system.

Use progressive disclosure:

- short explanation first
- optional “Learn more” expansion
- exhaustive tables in the reference layer

## 2. Infer rather than ask where possible

If the app can derive something from the hand, player Wind, prevailing Wind, winning method or winning tile, it should do so.

Do not ask beginners to identify:

- which special hand they have
- which special hand they are fishing for
- whether a tile is major or minor
- arithmetic doubles
- internal scoring categories the app already knows

## 3. Ask factual questions, not rule questions

Good:

- “Was this East’s very first discard?”
- “Which tile completed Mah Jong?”
- “Did one Kong’s replacement tile make another Kong?”

Avoid:

- “Was this Earth’s Blessing?”
- “Does the Buried Treasure final-pung exception apply?”

## 4. Unknown should be safe

Where an event cannot be inferred, offer **I’m not sure**.

Unknown information should be scored conservatively rather than guessed.

## 5. Results should teach opportunistically

A score result is a better teaching moment than a long rules page.

For example:

- “Concealed major Pung: 8 points”
- “No Chows: 1 double”
- “East payment doubled”
- “Detected: Gathering the Plum Blossom from the Roof”

The explanation should tell the player *why this hand scored this way*.

## 6. Keep the rules reference and learner guide separate

`BMJA_RULES_REFERENCE.md` is for engineering precision, source tracking, interpretations and tests.

This file is for learner-facing language and page structure.

Do not weaken the engineering reference for readability. Do not expose engineering terminology unnecessarily in the learner guide.

---

# Issue #5 completion notes

Before closing issue #5, complete the following engineering/documentation housekeeping:

- add an explicit rule-to-test / fixture mapping to `BMJA_RULES_REFERENCE.md`
- remove completed backlog items #1, #2 and #4 from its current backlog section
- add current relevant backlog items including #14 and #15
- after issue #15 lands, update the reference and this guide to reflect the final arbitrary losing-hand / Remaining tiles model and corrected tile-count validation
- ensure all public learner wording is project-owned paraphrase rather than copied rulebook/site text
- keep source links available from the public reference/about section

---

# Primary implementation sources

Use `BMJA_RULES_REFERENCE.md` as the project-owned engineering source of truth.

Current external source hierarchy includes:

- https://mahjongbritishrules.wordpress.com/
- https://mahjongbritishrules.wordpress.com/scoring/
- https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/
- https://mahjongbritishrules.wordpress.com/scoring/special-hands/
- https://mahjongbritishrules.wordpress.com/scoring/settling-up/
- https://mahjongbritishrules.wordpress.com/questions/playing-the-game/
- https://mahjongbritishrules.wordpress.com/books/ktg-corrections-and-clarifications/

The learner guide should clearly state that it is not an official BMJA publication.
