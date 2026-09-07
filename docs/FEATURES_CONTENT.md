# British Mahjong Scorer — features page content

> **Purpose:** publishable source copy for a future `/features` page.
>
> This document is derived from `docs/PRODUCT_HANDBOOK.md`. It should describe the shipped product only. If behaviour changes, update the handbook first and then review this file for content drift.
>
> **Tone:** clear, practical, specific and confident without overclaiming. Focus on what the player can do and why it helps.

---

# Features

## British Mahjong scoring without keeping the whole rulebook in your head

British Mahjong Scorer helps you score a complete game, calculate individual hands, understand why a score applies, and keep a clear record of what happened.

It is built specifically around the British rules used by this project, with a beginner-first approach: enter what you know, let the scorer infer what it safely can, and only answer extra questions when the rules genuinely need more context.

You do not need an account to start scoring.

---

# Score a complete game

Track a four-player British Mahjong game from the first hand to the final standings.

## Four-player game scoring

Set up the players and score each completed hand as the game progresses.

The game view tracks:

- player names
- seat Winds
- the current East player
- the prevailing Wind
- the winner or draw
- each player’s hand score
- settlement between players
- running balances
- hand-by-hand history

The aim is to replace the awkward arithmetic and bookkeeping, not the table itself.

## Manual or calculated hand scores

For each player, you can either:

- enter a numeric score directly; or
- open the detailed hand scorer and calculate the score from the tiles and game context.

This means a table does not have to use the detailed scorer for every player in every hand.

If only one or two players want detailed scoring, the others can still enter ordinary numeric scores and continue the game normally.

## Automatic settlement

Once the hand scores are confirmed, the game works out the payments between players using the stored game context.

This includes the effect of East where applicable.

The result is shown as actual player-to-player transactions rather than leaving you to reconstruct the arithmetic from net totals.

For example, the ledger can explain that one player paid another a particular amount and that an East payment was doubled.

## Running balances

Each confirmed hand updates the players’ running balances so the current table position remains visible throughout the game.

You do not have to maintain a separate score sheet alongside the scorer.

## Game progression

The scorer tracks East and prevailing-Wind progression through the game so the relevant context is carried forward rather than re-entered from scratch each hand.

## Draws and wins

A hand can be recorded as either:

- a win; or
- a draw.

The ledger keeps the result as part of the canonical game history.

## Undo and correction

If a confirmed hand needs correcting, the game supports the existing correction/undo flow rather than requiring the whole game to be restarted.

The goal is to make an ordinary scoring mistake recoverable without losing everything that came before it.

---

# Score one hand in detail

Use the standalone hand scorer or open the same detailed scorer from inside a game.

## Visual tile entry

Build the hand using visual Mahjong tiles rather than entering compact notation.

The scorer supports:

- Pungs
- Kongs
- Chows
- pairs
- Remaining tiles for unfinished hands
- Flowers
- Seasons
- irregular special-hand layouts where ordinary sets do not fit

The same local SVG tile artwork is reused throughout the scorer and learner material so the visual language stays consistent.

## Exposed and concealed sets

Where scoring depends on whether a group is exposed or concealed, that information can be recorded with the set.

The scoring engine uses the structured hand rather than asking the player to calculate the point value manually.

## Winning method

For a winning hand, the scorer records how Mah Jong was completed where that information affects scoring or special-hand logic.

Supported context includes ordinary draw/claim routes and the additional event context needed by the project’s implemented special hands.

## Winning-tile provenance

Some British Mahjong rules genuinely depend on knowing which tile completed Mah Jong.

When that matters, the scorer can show the completed hand and ask:

> **Which tile completed Mah Jong?**

You can tap the relevant tile from the hand rather than choosing from a long abstract list.

For grouped hands, the scorer can retain which set or pair the winning tile completed.

If you do not know, **I’m not sure** is a valid answer. The scorer then calculates conservatively rather than inventing the missing fact.

---

# Score unfinished and partial losing hands

A losing player does not need to reconstruct every irrelevant tile simply to score the parts of the hand that matter.

## Remaining tiles

For an unfinished losing hand, completed scoring groups can be entered alongside any loose Remaining tiles the player wants to record.

This supports ordinary unfinished hands without forcing them into an artificial incomplete-set template.

## Partial-evidence scoring

You can stop before entering all 13 structural playing tiles in a losing hand.

For example, if you only want to record:

- a Red Dragon Pung
- a concealed major Pung
- an own-Wind pair
- a Flower

then the scorer can calculate the score supported by those entered items without requiring every unrelated loose tile.

The product rule is:

> **Partial evidence is valid. Complete evidence unlocks additional inference.**

## Conservative whole-hand inference

When the losing hand is only partially entered, the scorer does not pretend it knows the unseen tiles.

Whole-hand conclusions that depend on the complete composition are withheld until enough evidence exists.

That can include things such as:

- whole-hand suit composition
- no-Chow / all-Pung-style conclusions
- special-hand detection
- special-hand fishing

Once all 13 structural playing tiles are entered, the scorer can safely run the relevant complete-hand analysis.

## Clear completeness state

Partial hands are treated as valid partial evidence rather than as errors.

The interface makes the distinction visible so a saved or printed record does not imply that a partial hand was a complete reconstruction.

---

# Automatic scoring and explanations

The scorer is designed to calculate the score and make the reasoning visible.

## Points and doubles

The detailed scorer calculates the ordinary point and double rules supported by the entered hand and context.

The live score updates as the hand changes.

## Contextual pattern explanations

The working scorer does not show a giant catalogue of every possible pattern during normal scoring.

Instead, it surfaces patterns that actually apply to the hand.

A detected pattern can show:

- the pattern name
- its scoring effect
- a short plain-English explanation

The purpose is to answer:

> **Why did my score just change?**

without making the player leave the scoring flow to search a rulebook.

## No second pattern engine

These explanations are derived from the same structured scoring outputs used to calculate the score.

The interface does not run a separate marketing/explanation detector that could drift away from the actual scoring logic.

---

# Special hands

The scorer supports the project’s implemented British Mahjong special-hand rules rather than expecting the player to identify every special manually.

## Layout-based special hands

Supported special layouts can be detected from the entered hand where sufficient evidence exists.

The current implemented set includes the layout-based special hands covered by the project’s engineering rules reference and tests.

The dedicated **Special hands** page provides the visual browse-all catalogue; the working scorer only surfaces a special when it is relevant.

## Irregular special layouts

Some special hands do not fit naturally into Pungs, Kongs, Chows and pairs.

For those hands, the scorer provides a separate Special layout route so the player can enter the actual tile arrangement rather than forcing the hand into the wrong structure.

## Event-based special hands

Some special hands depend on what happened during play rather than only on the final tile layout.

The scorer uses the minimum extra context required.

Where the existing hand context is enough, the special is inferred automatically.

Where an event fact cannot be inferred, the scorer asks a short conditional question only when that question is relevant.

Examples of implemented event-dependent logic include the project’s handling of:

- Heaven’s Blessing
- Earth’s Blessing
- Gathering the Plum Blossom from the Roof
- Plucking the Moon from the Bottom of the Sea
- Twofold Fortune

Ordinary hands are not interrupted with questions about specials that cannot apply.

## “I’m not sure” handling

If an event-dependent fact is unknown, the scorer does not silently choose the answer that produces the largest score.

Unknown information is treated conservatively and the unsupported special is not applied.

---

# Automatic special-hand fishing

You do not need to know the name of the special hand you are waiting for.

For a complete non-winning hand where the evidence supports fishing analysis, the scorer can examine legal completing tiles and test the resulting hands against the supported special patterns.

It can then show:

- the detected special-hand fishing pattern
- the tile or tiles that would complete it
- the applicable fishing value

## Multiple possible waits

If more than one legal tile could complete the special, the scorer can retain multiple possible completing tiles.

## Overlapping patterns

If a hand could qualify as fishing for more than one supported special, the scorer evaluates the lawful results rather than relying on whichever detector happened to run first.

The highest lawful fishing score is used while the relevant detected patterns remain visible.

---

# Flowers and Seasons

Flowers and Seasons are treated as real scoring information rather than decorative extras.

The scorer includes:

- all four Flowers
- all four Seasons
- their associated seat-Wind relationships
- own Flower / own Season scoring
- complete Flower or Season bouquet handling

The tile controls show the tile names and Wind associations so the player does not have to memorise the mapping before entering them.

Flowers and Seasons are kept separate from the structural 13/14 playing-tile count.

---

# Validation without unnecessary blocking

The scorer tries to prevent impossible input while still allowing incomplete evidence where incomplete evidence is legitimate.

## Tile copy limits

The scorer checks entered tile inventory and does not allow an impossible fifth copy of the same playing tile within the hand evidence.

## Structural hand counts

It understands the difference between:

- structural hand size; and
- physical tile count where a Kong contains an additional tile.

Flowers and Seasons do not count toward the 13/14 structural playing-tile base.

## Partial is different from invalid

For a losing hand:

- fewer than 13 entered structural tiles can be **partial and valid**;
- exactly 13 can provide **complete evidence** for whole-hand analysis;
- impossible or contradictory input remains **invalid**.

That distinction is deliberate. Missing evidence does not automatically mean bad evidence.

---

# Manual numeric scoring remains available

The detailed scorer is optional.

A player can simply type a numeric hand score when that is faster or when the table has already agreed the score.

The product keeps that distinction visible.

A manually entered score is not presented later as if the app reconstructed or verified the hand.

In the game ledger and printable record, manual scores are clearly labelled and no invented tiles or scoring breakdown are added.

---

# Recover an in-progress game

Refreshing the page should not destroy an ordinary game in progress.

## Local browser recovery

The scorer stores the current game locally in the browser so it can recover after:

- refresh
- accidental tab closure
- browser restart on the same device/browser

No account is required for this recovery.

## What is retained

The saved game includes the canonical information needed to continue, including where relevant:

- game setup
- progression state
- confirmed ledger/history
- running balances
- detailed score records already applied
- current round state needed for recovery

## Defensive loading

Saved data is versioned and loaded defensively.

Malformed or incompatible saved state should not prevent the application from opening.

## Start over

A deliberate Start over / New game action clears or replaces the saved game so an old session does not unexpectedly reappear.

## Local means local

This is browser-local recovery, not cloud sync.

The current product does not promise cross-device game history or an account-based archive.

---

# Keep a rich hand-by-hand game record

The live game ledger is also the canonical game record.

The product deliberately does not reconstruct the game later using a second report model.

## Rich ledger summaries

Each confirmed hand can include:

- hand number
- winner or draw
- East
- prevailing Wind
- each player’s hand score
- each player’s net settlement change
- each player’s running total after the hand

## Settlement explanations

Expanded ledger entries can show the actual stored player-to-player settlement transactions in understandable language.

## Detailed hand evidence

Where a player used the detailed hand scorer, the ledger can retain and show the evidence that was actually recorded.

That can include:

- grouped sets
- loose special-layout tiles
- Remaining tiles
- Flowers and Seasons
- winning-tile provenance where known
- scoring breakdown
- matched patterns or special-hand information

## Complete and partial records stay distinct

If only partial evidence was entered, the ledger shows only that partial evidence and labels it accordingly.

It does not fill in unseen tiles.

## Manual scores stay distinct

Where a numeric score was entered manually, the record says so and does not fabricate a detailed hand.

---

# Print or save the game

The game page can become the saved record without requiring a separate report account or document-generation system.

## Browser Print / Save as PDF

The scorer uses the browser’s normal print flow.

You can print physically or use your browser’s **Save as PDF** option.

## Full game record

Full mode is designed for a detailed record of the game.

It can include:

- game status and standings
- full confirmed ledger
- detailed recorded hands
- tile diagrams
- scoring evidence
- settlement explanations

The print flow exposes the ledger detail needed for the record even if some entries were collapsed on screen.

## Game summary

Summary mode keeps the record more compact.

It focuses on:

- standings
- hand-by-hand results
- scores
- balance changes

Detailed tile/evidence cards are excluded from the summary output.

## Same canonical history

Both print modes use the existing game history.

There is no second report engine attempting to reinterpret what happened after the fact.

---

# Final standings

When the game is complete, the same game page becomes a finished record.

It shows:

- that the game is complete
- the number of confirmed hands
- ranked final standings
- final balances
- the overall winner

The printable game record uses the same canonical completed-game state.

---

# Learn while you play

British Mahjong Scorer is not only a calculator.

The learner material is designed to explain the same rules the scoring engine uses.

## Gameplay basics

A practical introduction to the flow of the game and the concepts needed before scoring makes sense.

## Beginner scoring guide

Explains ordinary hand structure, points, doubles, fishing, settlement and related scoring concepts in progressive layers.

## Visual tile explanations

The learner pages use the same tile artwork as the scorer so tile families and examples are easier to recognise at the table.

## Special-hand catalogue

A dedicated visual catalogue lets players browse the supported special hands away from the working scorer.

This keeps normal scoring focused while preserving deeper reference material for players who want it.

## Contextual learning

When a scoring pattern actually appears in the hand, the scorer can explain it there and then.

The broader guides remain available for deeper learning without forcing the player to study them first.

---

# Designed for phones as well as larger screens

The scoring flows are designed to remain usable on narrow mobile screens as well as desktop/tablet layouts.

The hand scorer uses a mobile-specific flow that keeps game context visible and moves tile entry close to the part of the hand being edited rather than relying on a permanently detached tile bank.

Touch targets, navigation and the hand-entry sequence are treated as table-use concerns rather than desktop-only afterthoughts.

---

# Consistent navigation and safe exits

The main site areas share one navigation pattern.

From the menu, players can reach:

- Home
- Score a game
- Score a hand
- Gameplay basics
- Scoring basics
- Special hands
- About this project

The logo/title also returns to Home.

## Leave a standalone hand

The standalone hand scorer provides a clear route out.

If leaving would discard entered work, the app can warn rather than silently losing it.

## Return from an in-game hand

When the detailed scorer is opened from a game, leaving it can return to the game without applying the score unless **Apply score** was chosen.

The product keeps navigation and score confirmation as separate actions.

---

# No account required

You can open the site and start scoring without creating an account.

The current product deliberately favours browser-side features where they are sufficient.

That means ordinary scoring does not require:

- registration
- login
- a cloud database
- a hosted game-history service

Local game recovery is stored in the browser rather than tied to an online account.

---

# Transparent about what it knows

One of the core product principles is that the scorer should not invent evidence just to produce a more impressive result.

That shows up throughout the product:

- partial losing hands are allowed
- whole-hand deductions wait for complete evidence
- unknown winning-tile provenance can remain unknown
- event-special questions include conservative unknown handling
- manual scores are identified as manual
- partial hands remain labelled partial in the ledger and print record

The goal is not maximum automation at any cost. It is useful automation with the reasoning and evidence boundary left visible.

---

# Built specifically for this British ruleset

British Mahjong Scorer is aimed at the British Mahjong / BMJA-style rules used by this project.

It is not intended to behave as a generic scorer for every Mahjong variant or every table’s house rules.

The engineering rules reference records:

- implemented rules
- project interpretations
- source links
- known ambiguity
- test/fixture coverage

Public explanations are project-owned paraphrases rather than copied rulebook text.

British Mahjong Scorer is an independent project and is not an official British Mah-Jong Association product.

---

# Feature highlights

For shorter cards, metadata or promotional sections, the strongest shipped product capabilities are:

## Built for British Mahjong

A scorer designed around this British ruleset rather than a generic Mahjong calculator with renamed fields.

## A scorer that tells you why

See the points, doubles, relevant patterns and settlement logic behind the result.

## Enter what you know

Losing hands can be scored from partial evidence. You do not have to reconstruct every irrelevant tile just to record the scoring groups.

## You do not need to know the special-hand name first

Supported special hands and special fishing can be detected from the tiles and context where the evidence is sufficient.

## Unknown means unknown

Use **I’m not sure** where necessary. The scorer reduces certainty rather than quietly inventing a favourable fact.

## One connected hand-and-game system

A detailed hand score can flow into the game, retain its evidence and become part of the final ledger and printable record.

## Recover after ordinary browser accidents

An in-progress game is stored locally so a refresh or browser restart does not automatically wipe the table’s work.

## Save the game without creating an account

Print a compact summary or a full evidence-rich record using the browser’s normal Print / Save as PDF flow.

---

# Suggested `/features` page structure

Recommended public-page hierarchy:

1. **Hero**  
   British Mahjong scoring without keeping the whole rulebook in your head.

2. **Three outcome cards**  
   - Score a game
   - Score a hand
   - Understand the score

3. **Game scoring**  
   Settlement, balances, progression, recovery and ledger.

4. **Detailed hand scoring**  
   Tile entry, partial hands, automatic scoring, specials and fishing.

5. **Explain, don’t just calculate**  
   Contextual patterns, conservative unknown handling and evidence transparency.

6. **Your game becomes the record**  
   Canonical ledger, detailed evidence, summary/full print modes.

7. **Learn while playing**  
   Gameplay basics, guide and special-hand catalogue.

8. **Simple browser-first model**  
   No account required, local recovery, independent British-rules focus.

9. **CTA row**  
   - Score a game
   - Score a hand
   - Learn the rules

Avoid presenting all feature bullets at once on the actual page. Use this file as the source bank and progressively disclose the deeper detail.

---

# Claims and wording guardrails

Safe claims include:

- “Built for British Mahjong.”
- “Scores complete games and individual hands.”
- “Explains why a score applies.”
- “Supports partial losing-hand evidence.”
- “Detects supported special hands where the entered evidence is sufficient.”
- “Detects supported special-hand fishing from complete entered evidence.”
- “Recovers an in-progress game locally in the browser.”
- “No account required.”
- “Print or save a full game record or compact summary.”

Qualify where necessary:

- say **supported special hands**, not every possible Mahjong special across all traditions;
- say **British rules used by this project**, not every British house rule;
- say **local browser recovery**, not cloud backup or sync;
- say **where the evidence is sufficient**, not that the app can infer facts that were never entered;
- say **calculated detailed score** only when the detailed scorer was actually used.

Avoid:

- “official BMJA scorer”
- “100% accurate”
- “guaranteed correct”
- “the only British Mahjong scorer”
- “AI-powered scoring”
- claims of cloud sync, cross-device history, photo recognition or solo play while those remain future/backlog items

---

# Current future/backlog items — do not market as shipped

The following are not part of the current feature page unless clearly labelled as future ideas:

- shared physical tile inventory / cross-player availability warnings
- photo-based tile recognition
- solo practice against browser-based computer players
- account-based cloud sync
- hosted/shareable game-record URLs
- cross-game analytics
- automated game statistics or notable-moment analysis
- AI/personality commentary

These belong in roadmap/backlog material, not the current product feature list.
