# British Mahjong Scorer — How it works page content

> **Purpose:** publishable source copy for a future `/how-it-works` page.
>
> This document is derived from `docs/PRODUCT_HANDBOOK.md`, `docs/FEATURES_CONTENT.md` and `docs/HELP_CONTENT.md`.
>
> The page should explain the product model clearly and visually. It is not a replacement for Help, the scoring guide or the full feature list.
>
> **Tone:** calm, practical, transparent and beginner-friendly. Focus on what happens from the player's point of view.

---

# How it works

## From tiles to score to settlement — with the reasoning left visible

British Mahjong Scorer is designed to help with the parts of British Mahjong that are hardest to keep in your head while playing: hand scoring, special patterns, settlement, running totals and the record of what happened.

The product follows a simple principle:

> **Tell the scorer what you know. It works out what it safely can, asks only when it needs more information, and keeps the reasoning visible.**

You do not need to know the internal scoring categories before you begin.

---

# The simple version

The whole product can be understood as six connected steps.

1. **Set the game context**  
   Tell the scorer who is playing, who is East, the prevailing Wind and whether the hand was won or drawn.

2. **Enter the hand evidence**  
   Build a full hand, enter only the scoring parts of a losing hand, or type a numeric score if you already know it.

3. **The scorer applies only supported rules**  
   It calculates points, doubles and supported patterns from the evidence actually entered.

4. **Relevant patterns are explained**  
   Instead of showing every possible rule, the scorer surfaces the patterns that actually apply.

5. **The game settles automatically**  
   In a full game, the scores become player-to-player payments and updated running balances.

6. **The ledger becomes the game record**  
   Every confirmed hand is added to the same canonical history that can later be printed or saved.

---

# 1. Start with the game context

Scoring a Mahjong hand is not always about the tiles alone.

Some rules depend on things such as:

- your seat Wind
- the prevailing Wind
- whether you are East
- whether the hand was won or is unfinished
- how Mah Jong was completed
- which tile completed Mah Jong
- a small number of rare game-event facts

British Mahjong Scorer therefore starts with the context that matters.

## In a full game

The game scorer already knows and tracks much of this for you, including:

- the four players
- seat Winds
- East
- prevailing Wind
- game progression

When you open the detailed scorer from the game, that context can flow into the hand calculation instead of being re-entered from scratch.

## In the standalone hand scorer

You provide the relevant hand context directly.

The scorer only asks for information that can affect the result.

### Page-design note

A useful visual here would be a small context card showing:

- South seat
- East prevailing
- Winner: yes
- Winning method: discard

with a short caption:

> The scorer uses game context only where the rules require it.

---

# 2. Enter what you know

The scorer is designed around evidence, not around forcing every player through the same data-entry route.

There are three main ways to provide a score.

## Build a detailed hand

Use visual tile entry to record:

- Pungs
- Kongs
- Chows
- pairs
- Remaining tiles
- Flowers and Seasons
- irregular special layouts where normal sets do not fit

This gives the scorer structured evidence it can use to calculate and explain the hand.

## Enter only part of a losing hand

A losing hand does not need to be reconstructed completely just to score the parts that are already known.

For example, if you know you have:

- a Red Dragon Pung
- a concealed 9 Circles Pung
- an own-Wind pair
- Flower 3

then you can enter those pieces and score them.

You do not have to enter every unrelated loose tile merely to prove the things already visible on the table.

The scorer marks that as **partial evidence** and limits itself accordingly.

## Type a numeric score

If you already know the score, you can simply enter the number.

That keeps the game practical when:

- the table has already scored the hand
- only one or two players want detailed scoring
- you do not want to reconstruct every player's tiles

A manual number remains a valid game score, but the scorer does not pretend that it independently verified the hand.

### Product principle

> **Different evidence levels can coexist in the same game.**

One player can have a fully reconstructed hand, another can have partial evidence, and another can have a manual numeric score.

The game record preserves those differences.

---

# 3. The scorer works from evidence, not guesses

This is the most important part of the product model.

British Mahjong Scorer only applies a rule when there is enough evidence to support it.

## If the evidence is complete

The scorer can safely evaluate the whole-hand properties supported by the implementation, including relevant:

- points
- doubles
- whole-hand patterns
- special hands
- special-hand fishing
- winning-method effects
- winning-tile-sensitive rules

## If the evidence is partial

The scorer still calculates things that can be proved directly from what you entered.

It does **not** infer properties that unseen tiles could change.

For example, a partial hand may prove that a Dragon Pung scores, but it may not prove that the whole hand is pure or that it is one tile away from a special hand.

## If the evidence is impossible

The scorer treats impossible input differently from incomplete input.

Examples include:

- entering more than the legal structural hand count
- entering a fifth copy of an ordinary tile

Partial is allowed.

Impossible is not.

### Suggested visual

Three cards:

**Partial**  
Score what is proved. Hold back whole-hand deductions.

**Complete**  
Run the full analysis supported by the scorer.

**Invalid**  
Explain the contradiction and ask the player to correct it.

---

# 4. Unknown is a valid answer

Some Mahjong rules genuinely depend on facts that may not be obvious after the hand has finished.

The scorer does not force you to guess.

## Winning tile

Some special-hand exceptions depend on which tile actually completed Mah Jong.

Where that matters, the scorer can ask:

> **Which tile completed Mah Jong?**

You choose from the entered hand.

If you do not know, use the uncertainty route.

The scorer then avoids applying any winning-tile-sensitive exception that it cannot prove.

## Rare event-based specials

A small number of special hands depend on events rather than only the final tile layout.

The scorer avoids recording a full turn-by-turn event log just for those rare cases.

Instead it:

- infers the event where the existing context already proves it
- asks a short question only where the answer could matter
- allows uncertainty where appropriate
- scores conservatively if the event cannot be proved

### Product principle

> **Unknown means unknown. The scorer should reduce certainty, not manufacture it.**

---

# 5. The scorer calculates the hand

Once the relevant evidence is available, the scoring engine applies the British Mahjong rules implemented by the project.

The exact rule definitions live in the engineering rules reference, but from a player's point of view the scorer combines the relevant parts of the hand into a visible result.

This can include:

- set and pair points
- Flowers and Seasons
- doubles
- own/prevailing Wind effects
- winning-method effects
- whole-hand patterns
- supported special hands
- special-hand fishing
- applicable limits

The product is deterministic rule logic.

It is not an AI system making a probabilistic judgement about the hand.

---

# 6. Relevant patterns appear when they matter

The working scorer does not display a permanent list of every possible special hand or scoring rule.

That would make the table experience longer and harder to scan.

Instead, the scorer surfaces patterns that actually apply to the entered hand.

A detected pattern can show:

- the pattern name
- its score effect
- a short explanation

For example:

> **Pattern detected: Purity**  
> Your hand uses one numbered suit with no Winds or Dragons. This gives 3 doubles.

The purpose is to answer the question:

> **Why did my score just change?**

The complete catalogue remains available separately for people who want to browse all supported special hands.

---

# 7. You do not need to know the special-hand name first

Special hands are a good example of the beginner-first design.

The scorer should not require you to recognise and name a pattern before it can help you.

Where the entered evidence is sufficient, supported special hands are detected from the hand itself.

## Special-hand fishing

The same idea applies when a non-winning hand is one tile away from a supported special hand.

With complete enough evidence, the scorer can:

- consider legal completing tiles
- test supported special patterns
- show possible waits
- handle overlapping matches
- apply the appropriate highest lawful fishing result

You do not have to select a special-hand name from a list first.

### Suggested visual

A row of entered tiles → arrow → two possible finishing tiles → detected special/fishing value.

Caption:

> Enter the evidence. Let the scorer identify the supported pattern.

---

# 8. Flowers, Seasons and Kongs stay structurally correct

Some Mahjong details are easy to mishandle if the user is expected to do the counting themselves.

The scorer keeps those structural distinctions inside the model.

## Flowers and Seasons

Flowers and Seasons are bonus tiles.

They are entered separately and do not consume places in the normal structural hand count.

Their relationship to seat Wind is surfaced visually rather than hidden behind a lookup table.

## Kongs

A Kong contains four physical tiles but occupies one structural group position.

The scorer accounts for that difference when validating the hand.

This means a valid hand with a Kong is not rejected simply because the physical tile count is larger.

---

# 9. In a game, hand scores become settlement

Once the four player scores are known, the game scorer moves from hand scoring into settlement.

It calculates who pays whom according to the implemented British Mahjong settlement rules.

This includes East doubling where applicable.

## Why the scorer stores transactions

The game does not only keep a final net change.

It keeps the settlement as player-to-player transactions.

That means it can explain what actually happened, conceptually:

> Jenn receives 320 from SMooks.  
> Jenn receives 320 from Louise.  
> Jenn receives 640 from Andy because Andy is East.

This is more useful than showing four unexplained net numbers.

## Preview before confirmation

The game can show the settlement changes before the hand is committed.

Only confirmed results become part of the historical ledger.

---

# 10. Every confirmed hand joins the same ledger

The game ledger is not an afterthought or a separate reporting feature.

It is the canonical game history.

Each confirmed hand can retain:

- hand number
- winner or draw
- East
- prevailing Wind
- each player's score
- each player's settlement change
- each player's running total
- settlement transactions
- detailed hand evidence where it exists
- manual-score labelling where a number was typed directly

The ledger grows as the game is played.

## Detailed evidence stays attached

If a player used the detailed scorer, the stored hand evidence can remain with that historical entry.

That may include:

- visual grouped sets
- Remaining tiles
- Flowers and Seasons
- special layout tiles
- winning-tile provenance
- scoring breakdown

If the original hand was only partially entered, the historical record remains partial rather than inventing the missing tiles later.

### Product principle

> **The game record reflects what was actually captured at the table.**

---

# 11. Running totals and progression come from confirmed history

Each confirmed hand updates the running balances.

The game also advances its progression state according to the implemented rules.

This means:

- the current totals
- current East
- prevailing Wind
- final standings

all derive from the same confirmed game history rather than separate manually maintained values.

If an ordinary scoring mistake needs correcting, the correction/undo flow works from that canonical history rather than asking you to start the entire game again.

---

# 12. The game can survive an accidental refresh

An in-progress game is stored locally in the browser.

That means an ordinary:

- page refresh
- accidental tab closure
- browser restart

does not have to destroy the game.

The most recent compatible saved game can be recovered on the same browser and device.

## What this does not mean

Local recovery is not:

- cloud backup
- an account
- cross-device sync
- online multiplayer

The product remains intentionally lightweight and account-free for ordinary scoring.

### Suggested visual

Browser → local saved snapshot → browser reopens → game restored.

Caption:

> Recovery stays local to the browser. No account is required.

---

# 13. The ledger becomes the printable game record

At the end of the game — or while the game is still in progress — the same confirmed ledger can be printed or saved using the browser print flow.

There is no second report engine rebuilding the story afterwards.

## Full game record

Use this when you want the most detailed version of the captured game history.

It can include the detailed hand and scoring evidence that was actually recorded.

## Game summary

Use this when you want a more compact record focused on:

- standings
- hand-by-hand results
- scores
- settlement changes
- running totals

Detailed tile/evidence cards are omitted from the summary.

## Save as PDF

The app uses the browser's normal print system.

On browsers that provide **Save as PDF** as a print destination, that becomes the saved game file.

The product does not currently require accounts, hosted report links or a separate PDF-generation service.

---

# 14. One scoring model, several useful views

A core design decision is to avoid having multiple competing versions of the truth.

The same underlying evidence should support:

- the live hand score
- contextual explanations
- game settlement
- running balances
- confirmed hand history
- the printable game record

This reduces the chance that a live score says one thing while a later report silently reconstructs something different.

### Canonical flow

`game context + entered evidence`

↓

`scoring result`

↓

`settlement`

↓

`confirmed ledger`

↓

`print / save`

The product should keep extending this chain rather than creating parallel scoring or reporting systems.

---

# 15. Learning is connected to the scorer

The product includes separate learner pages because not every rule belongs in the active scoring flow.

Current learner/reference areas include:

- Gameplay basics
- Beginner scoring guide
- Special hands
- About this project

The active scorer gives you the rule when it matters.

The learner pages let you explore the rule when you want more depth.

That separation keeps the scorer usable at the table without throwing away the teaching value.

---

# 16. Why this approach is useful for beginners

Traditional scoring material often assumes you already know which rule or pattern you are looking for.

British Mahjong Scorer tries to reverse that dependency.

You should be able to:

- enter the tiles before knowing the score
- enter a partial losing hand without reconstructing everything
- discover a supported pattern without naming it first
- admit that you do not know a rare event fact
- see why a score changed
- see who pays whom
- keep the game record without maintaining a separate score sheet

The goal is not to remove Mahjong knowledge from the game.

It is to make that knowledge easier to acquire while playing.

---

# 17. Why this approach is useful for experienced players

The same design also supports players who do not need hand-holding.

Experienced players can:

- type known scores directly
- use detailed scoring only where useful
- inspect the rule breakdown when a score is disputed
- keep running balances automatically
- preserve a full game ledger
- save a compact summary afterwards

The scorer is intended to reduce bookkeeping rather than force a detailed reconstruction of every hand.

---

# 18. What the scorer deliberately does not do

The current product keeps its scope narrow enough to remain understandable and reliable.

It does not currently provide:

- user accounts
- cloud game history
- cross-device sync
- online multiplayer
- photo-based tile recognition
- solo computer opponents
- hosted shareable game-report links
- cross-game analytics
- AI scoring or AI commentary

Some of these exist as backlog or exploratory ideas, but they are not part of the current scoring model.

This page should present those boundaries as intentional clarity rather than as apology.

---

# 19. Trust and transparency

British Mahjong Scorer is an independent project.

It is not an official British Mah-Jong Association product and should not imply endorsement.

The scoring implementation is based on the British rules documented by the project, with rule sources, interpretations and test coverage maintained in the repository.

If the scorer and a table disagree, the preferred response is not “trust the app”.

It is:

1. inspect the scoring breakdown;
2. identify the rule responsible;
3. compare the table's rule or house convention;
4. correct entered evidence if necessary;
5. report an implementation problem if the scorer is wrong.

The product is designed to make disagreement inspectable.

---

# 20. Suggested public page structure

The actual `/how-it-works` route should be significantly shorter than this source file.

Recommended page hierarchy:

## Hero

**From tiles to score to settlement — with the reasoning left visible**

Short intro + links:

- Score a game
- Score a hand

## Six-step visual overview

1. Set the context
2. Enter what you know
3. Calculate from evidence
4. Explain relevant patterns
5. Settle the game
6. Keep the ledger

Each step should use one concise card/illustration.

## Enter what you know

Three routes:

- detailed hand
- partial losing hand
- manual numeric score

This is one of the product's strongest differentiators and deserves its own section.

## Evidence, not guesses

Show Partial / Complete / Invalid and the uncertainty principle.

## You do not need to know the pattern first

Show contextual detected patterns + automatic special fishing.

## From hand score to game history

Visual flow:

`hand → settlement → running balances → ledger`

## Recover locally

Short localStorage / no-account explanation.

## Save the same game record

Full game record vs Game summary.

## Learn as you play

Links to:

- Gameplay basics
- Scoring guide
- Special hands
- Help

## Trust footer

Short independence/evidence wording with link to About.

---

# 21. Suggested visual storytelling

This page should do more visually than Features or Help.

Possible diagrams/illustrations:

## A. Main six-step flow

Six simple connected cards/icons:

Context → Evidence → Score → Explain → Settle → Record

## B. Evidence completeness

Three side-by-side hand cards:

- partial
- complete
- invalid

Use actual tile examples if practical.

## C. Mixed evidence table

Four player rows showing:

- detailed complete
- detailed partial
- manual score
- detailed complete

Then one shared settlement/ledger output.

This communicates that the product does not require uniform data entry.

## D. Special detection

Entered tiles → detected pattern callout.

## E. Game data flow

Detailed hand score → settlement transactions → running total → ledger entry.

## F. Local recovery

Same browser/device → refresh/reopen → recovered game.

## G. Print modes

One canonical ledger branching visually into:

- Full game record
- Game summary

Emphasise that the source history remains the same.

---

# 22. Short reusable explainer copy

These snippets can be reused in cards, metadata or secondary pages.

## 25-word version

Enter the game context and the hand evidence you know. The scorer calculates supported rules, explains the result, settles the game and keeps the record.

## 50-word version

British Mahjong Scorer works from the evidence you enter. Build a full hand, enter only the scoring parts of a losing hand, or type a known score. The scorer applies supported rules, explains relevant patterns, calculates settlement and adds each confirmed result to the same printable game ledger.

## 100-word version

British Mahjong Scorer connects hand scoring and full-game bookkeeping in one flow. Tell it the game context and enter as much hand evidence as you actually know. Complete evidence enables whole-hand and special-pattern analysis; partial losing hands can still score directly evidenced sets and bonus tiles. Unknown facts stay unknown rather than being guessed. In a full game, confirmed scores become player-to-player settlement, running balances and a canonical hand ledger. That same ledger can later be printed or saved as a detailed game record or a compact summary, without requiring an account or a second report system.

---

# 23. Search / metadata direction

Possible title:

**How British Mahjong Scorer Works | From Hand to Game Record**

Possible meta description:

**See how British Mahjong Scorer turns entered tiles and game context into explained scores, settlement, running balances and a printable game record.**

Useful search concepts this page can support naturally:

- how British Mahjong scoring works
- British Mahjong score calculator explained
- how to score British Mahjong hands
- British Mahjong settlement
- Mahjong East doubling
- British Mahjong hand calculator
- British Mahjong scoring app

Do not keyword-stuff the page. The conceptual flow should remain primary.

---

# 24. Contextual links from this page

How it works should route people onward rather than answer every detailed question itself.

Suggested links:

## After “Set the context”

- Gameplay basics

## After “Enter what you know”

- Help: How do I score a hand?
- Help: What if I only know part of a losing hand?

## After “Evidence, not guesses”

- Help: Why is my hand marked partial?
- Help: What if I do not know the winning tile?

## After “Patterns”

- Special hands
- Beginner scoring guide

## After “Settlement”

- Help: How does settlement work?

## After “Recovery”

- Help: What happens if I refresh or close the browser?

## After “Print/save”

- Help: Full game record or Game summary?

## Footer

- Features
- Help
- About

---

# 25. Content guardrails

This page should not:

- become another complete feature list;
- reproduce the Help centre;
- duplicate detailed scoring tables;
- imply official BMJA endorsement;
- describe manual scores as verified hands;
- imply partial evidence is a complete hand;
- imply local recovery is cloud storage;
- imply Save as PDF is a hosted report system;
- claim support for unshipped photo recognition, solo play, cloud sync or analytics;
- describe the scorer as AI-powered;
- use absolute claims such as “perfect” or “guaranteed”.

Use concrete behavioural explanations instead.

---

# 26. Maintenance rule

`docs/PRODUCT_HANDBOOK.md` remains the canonical product source.

When product behaviour changes:

1. update the handbook first;
2. review this file for conceptual drift;
3. review Features and Help for affected wording;
4. update the eventual `/how-it-works` page if the change affects the main product flow.

This source should remain a clear explanation of the system even as individual features evolve.
