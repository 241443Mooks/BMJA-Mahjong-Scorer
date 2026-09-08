# British Mahjong Scorer — Product Handbook

> **Purpose:** canonical product truth for `mahjong.smooks.co.uk`.
>
> This handbook records what the product currently does, how it behaves, what evidence it uses, what it deliberately does not infer, and which ideas remain future work. It is intentionally more detailed than any single public page.
>
> **Baseline:** `main` reviewed on 8 September 2026, including merged product work through PR #62 and the subsequent README refresh.
>
> Public Features, Help, How it works, About, learner content and marketing copy should be derived from this handbook and the engineering rules reference rather than becoming independent descriptions of the product.

---

# 1. Product definition

British Mahjong Scorer is a free, browser-based **British Mahjong scoring calculator** and learning companion.

It has three connected jobs:

1. **Score accurately** — calculate individual hands and complete four-player games using the British rules implemented by this project.
2. **Explain what happened** — show why a score applies, how settlement works and what evidence supports the result.
3. **Teach without interrupting play** — surface useful rules when they become relevant and keep deeper learning/reference material available separately.

The main product principle is:

> **Explain the game. Do not make the player learn the scoring engine.**

The main trust principle is:

> **Never invent missing evidence. Calculate what can be supported, ask only when necessary, and treat unknown facts conservatively.**

The product is deliberately:

- British-Mahjong-specific;
- beginner-first;
- evidence-first;
- browser-first;
- local-first where practical;
- deterministic rather than AI-scored.

It is not intended to support every Mahjong ruleset or every table/house rule.

---

# 2. Product status vocabulary

Every capability in this handbook should use one of these states.

## Shipped

Implemented on current `main` and suitable to describe publicly as available capability.

## Backlog

A defined future feature with an issue/specification, but not available in the current product.

## Exploratory

An idea being investigated. It may never ship and must not be presented as committed functionality.

## Explicitly not current product behaviour

An idea intentionally excluded from the current product or an existing MVP. It may be revisited separately but should not be implied by current wording.

When an issue remains administratively open but its implementation has already shipped, **current code behaviour takes precedence over issue state** for this handbook.

---

# 3. Current public product surfaces

The current canonical public routes are defined in `artifacts/mahjong-scorer/src/site-seo.json`.

| Route | Status | Purpose |
| --- | --- | --- |
| `/` | Shipped | Action-led homepage and scoring-calculator entry point |
| `/game` | Shipped | Four-player game scorer and canonical game ledger |
| `/hand` | Shipped | Standalone British Mahjong hand calculator |
| `/gameplay-basics` | Shipped | Beginner explanation of how British Mahjong is played |
| `/guide` | Shipped | Beginner British Mahjong scoring guide |
| `/special-hands` | Shipped | Visual catalogue of supported special hands |
| `/features` | Shipped | Outcome-led explanation of current scorer capabilities |
| `/how-it-works` | Shipped | Evidence → score → explanation → settlement → record model |
| `/help` | Shipped | Searchable practical Help hub with responsive visual how-tos |
| `/mahjong-rules-compared` | Shipped | British vs Hong Kong vs Riichi vs MCR vs American rules comparison |
| `/about` | Shipped | Project purpose, rules, trust, privacy, attribution and support |

Canonical aliases:

- `/beginner-guide` → `/guide`
- `/special-hand-catalogue` → `/special-hands`

The homepage should remain concise and action-led. Rich explanation belongs behind it in the dedicated learner, Help, Features and How it works surfaces.

---

# 4. Product-wide trust rules

These rules apply across the scorer, game history, learner explanations and public claims.

## 4.1 Evidence over assumption

A rule should only be applied when the entered tiles, entered game context or explicit user answer provide enough evidence.

If necessary evidence is unknown, the scorer should either:

- calculate only the portion that can be proved;
- ask a short relevant question; or
- omit the uncertain bonus/pattern.

It should not silently manufacture the most favourable interpretation.

## 4.2 “I’m not sure” is a valid state

Where the scorer asks for evidence the user may genuinely not know, an uncertainty route should remain available where practical.

Unknown should result in conservative scoring rather than forced guessing.

## 4.3 Manual scores are not scorer-verified hands

A numeric score entered manually remains valid game input.

However:

- the app must not invent tiles;
- the app must not imply that the hand was calculated by the detailed scorer;
- historical/print records should identify the score as manually entered;
- detailed scoring evidence should only appear when it actually exists.

## 4.4 Partial evidence is not a complete hand reconstruction

A losing player may enter only part of a hand.

The scorer can calculate directly evidenced scoring elements from that partial entry, but it must not claim that the full hand has been reconstructed.

Whole-hand deductions that depend on unseen tiles are withheld until enough evidence exists.

## 4.5 Canonical data should be reused, not reinterpreted

The same canonical scoring/game information should drive:

- live scoring;
- settlement;
- running balances;
- game history;
- explanatory evidence;
- local recovery;
- printable/savable game records.

Where stored settlement transactions exist, explanatory wording should use those transactions rather than reverse-engineering them from totals.

Where a detailed hand record exists, the ledger should reuse that record rather than regenerate an imagined hand.

## 4.6 One rules engine

Public examples, Help content and future practice/example modes should reuse the normal scorer model wherever practical.

Do not create a second scoring path merely to demonstrate or explain the first one.

---

# 5. Full four-player game scoring

**Status:** Shipped  
**Relevant route:** `/game`

The full game scorer manages a British Mahjong game hand by hand rather than acting as a simple running total.

## 5.1 Game setup and progression

The game flow supports:

- four player names;
- seat Winds;
- East;
- prevailing Wind;
- the project's implemented game-length/progression behaviour;
- winner and draw outcomes.

Game context can be passed into the detailed hand scorer so own/prevailing Wind and event-sensitive scoring can be evaluated where applicable.

## 5.2 Per-player score entry

For a given hand, each player's score can come from either:

### Detailed calculated scoring

The player opens the detailed hand scorer and builds enough evidence for calculation.

When applied back to the game, structured hand/scoring evidence can be retained alongside the numeric score.

### Manual numeric scoring

The player types the score directly.

This keeps the game scorer useful when:

- a player already knows their score;
- only one or two players want detailed scoring;
- the table does not want to reconstruct every hand;
- a hand was scored independently.

Manual and calculated scores can coexist in the same game and in the same confirmed hand.

## 5.3 Settlement

After hand scores are known, the game calculates settlement according to the implemented British rules.

This includes East doubling where applicable.

Settlement is stored as canonical transactions, not only final net changes, so the app can explain who paid whom in plain English.

## 5.4 Preview before confirmation

Settlement changes can be previewed before a hand is confirmed.

Unconfirmed live entry is not historical game-record data.

Only confirmed results belong in the canonical ledger.

## 5.5 Confirmed hand ledger

The existing game ledger is the single canonical hand-history surface.

Each confirmed hand can include:

- hand number;
- winner or draw;
- East player;
- prevailing Wind;
- each player's hand score;
- each player's net settlement change;
- each player's running total after the hand;
- settlement explanation;
- detailed hand evidence where detailed scoring was used;
- manual-score labelling where a numeric score was entered manually.

Entries use a compact expandable presentation on screen.

The ledger grows as the game is played; it is not a separate report reconstructed later.

## 5.6 Detailed evidence inside history

Where a player's score came from the detailed scorer, the stored record may include:

- grouped sets;
- exposed/concealed information;
- loose/special-layout tiles;
- Remaining tiles;
- Flowers and Seasons;
- winning-tile provenance where known;
- scoring breakdown;
- matched patterns or special-hand result;
- fishing result where applicable;
- base points, doubles and final score.

The ledger must not add tiles that were not entered.

If the stored record is partial evidence, it should be presented as partial evidence.

## 5.7 Mixed evidence is valid

One confirmed game hand can legitimately contain different evidence levels for different players.

For example, one player may have a complete detailed hand, another a partial detailed hand, another a manual numeric score and another a different complete detailed hand.

The ledger retains those distinctions.

## 5.8 Running balances, correction and completion

The game maintains running balances after each confirmed hand.

Undo/correction is supported so an ordinary scoring mistake does not require restarting the entire game.

When the game reaches its implemented completion condition, the same page presents:

- Game complete;
- number of confirmed hands;
- ranked final standings;
- final balances;
- winner.

---

# 6. Local game persistence and recovery

**Status:** Shipped  
**Relevant implementation:** issue #14 / PR #23

A refresh, accidental tab closure or browser restart should not casually destroy an in-progress game.

The application stores a versioned snapshot of relevant canonical game state in browser `localStorage`.

This supports recovery on the same browser/device without requiring an account or server-side game-history service.

Persisted information includes relevant canonical game information such as:

- game setup/player information;
- progression context;
- confirmed ledger/history;
- running balances;
- detailed scoring records already applied to players;
- recoverable current-round/draft information supported by the implementation.

Malformed or incompatible saved snapshots should not prevent the app from loading. Incompatible persisted state is rejected/cleared defensively.

An intentional Start over/new-game action clears or replaces the saved in-progress state so an obsolete game does not unexpectedly return.

Local recovery does **not** mean:

- account-based cloud history;
- cross-device sync;
- remote backup;
- shared multiplayer state;
- hosted report storage.

---

# 7. Detailed hand calculator

**Status:** Shipped  
**Relevant route:** `/hand`, plus the same scorer opened from `/game`

The standalone hand page is explicitly positioned as a **British Mahjong hand calculator** while retaining the British Mahjong Scorer product name.

The same underlying hand/scoring model is used independently and from inside a full game.

## 7.1 Core evidence model

The player can describe:

- winner/non-winner context;
- relevant Winds/game context;
- grouped sets where appropriate;
- Remaining tiles where appropriate;
- Flowers and Seasons;
- irregular/special layouts where normal grouping does not fit;
- winning method and limited event information where required;
- winning-tile provenance where required and known.

The scorer calculates only what the evidence supports.

## 7.2 Normal grouped hand entry

Supported structural group types include:

- Pung;
- Chow;
- Kong;
- Pair.

Sets retain exposed/concealed information where relevant.

The UI is visual and beginner-oriented rather than requiring notation.

## 7.3 Chow and structural constraints

The scorer enforces the project's implemented ordinary-hand restrictions and structural validation rather than silently accepting impossible/unsupported arrangements.

## 7.4 Tile copy limits

The app prevents or rejects impossible entered inventories such as more than four copies of the same ordinary playing tile across relevant entered evidence.

Impossible inventory is distinct from incomplete evidence.

## 7.5 Kongs and hand counts

A Kong contains four physical tiles but occupies one structural group slot.

Validation/counting accounts for this distinction.

## 7.6 Flowers and Seasons

Flowers and Seasons are bonus tiles and remain outside the ordinary structural 13/14 playing-tile base.

Their seat-Wind relationships are surfaced in scorer/learner content rather than being hidden assumptions.

---

# 8. Winning hands and provenance

**Status:** Shipped

A detailed winning hand normally requires enough evidence for the scorer to validate and calculate the completed hand.

The scorer can then apply the supported combination of:

- base points;
- doubles;
- winning-method effects;
- whole-hand patterns;
- special hands;
- event-sensitive specials;
- applicable limits.

## 8.1 Winning method

The scorer records the implemented winning-method context rather than treating every Mah Jong as identical.

The method can be required evidence for bonuses or event-sensitive specials.

## 8.2 Winning-tile provenance

**Relevant implementation:** issue #3 / PR #13

Some rules cannot be applied safely from the final 14-tile layout alone. They depend on which tile completed Mah Jong and, for grouped hands, which group it completed.

For relevant winning hands the UI can ask:

> Which tile completed Mah Jong?

The user selects from the entered/reconstructed hand rather than a detached long dropdown.

The model can retain:

- winning tile identity;
- completed group where relevant;
- existing winning method as source/claim context.

If the user does not know, the scorer avoids winning-tile-sensitive exceptions that cannot be proved.

If the hand is later edited, stale provenance should be revalidated or cleared.

---

# 9. Losing hands, Remaining tiles and partial evidence

**Status:** Shipped  
**Relevant implementation:** issue #15, PR #22 and PR #30

This is a core product capability.

## 9.1 Real structural count

A non-winning hand has a 13-tile structural playing base, with represented Kong fourth tiles handled separately and Flowers/Seasons excluded from the structural count.

## 9.2 Remaining tiles

A losing hand does not need to be forced into fake completed groups.

The scorer supports arbitrary **Remaining tiles** for loose/uncompleted evidence.

## 9.3 Partial evidence

A losing player may enter fewer than all 13 structural playing tiles and still receive a valid score for directly evidenced scoring elements.

They do not have to reconstruct irrelevant loose tiles merely to score known components.

Partial evidence can support directly evidenced items such as:

- completed scoring Pungs;
- completed Kongs;
- relevant pairs;
- bonus tiles;
- other rule components whose truth does not depend on unseen tiles.

## 9.4 What partial evidence must not infer

Where unseen tiles could change the conclusion, the scorer withholds whole-hand deductions such as, where applicable:

- whole-hand suit/honour composition;
- Purity/one-suit conclusions;
- no-Chow/all-Pung-style whole-hand conclusions;
- special-hand completion claims requiring the complete layout;
- special fishing detection requiring complete one-away evidence.

## 9.5 Completeness states

### Partial

Fewer than the full structural tiles have been entered for a non-winning hand.

Valid for directly evidenced scoring components.

### Complete evidence

All required structural playing tiles for the non-winning hand have been entered.

The scorer may run supported whole-hand and fishing analysis.

### Invalid

The evidence describes an impossible/contradictory state, for example too many structural tiles or an impossible copy count.

**Incomplete is not the same as invalid.**

---

# 10. Irregular/special layouts

**Status:** Shipped

Some supported special hands do not fit naturally into the ordinary grouped-set builder.

The scorer provides a secondary Special layout/irregular route for these cases.

It is deliberately less prominent than ordinary set entry because normal sets are the primary user journey.

The user should not need to know the special hand's name merely to choose the irregular entry route.

---

# 11. Scoring and explanation model

**Status:** Shipped

The deterministic rules engine calculates the implemented British Mahjong rules from the evidence supplied.

The public score breakdown may include supported combinations of:

- set/pair/base points;
- bonus points where applicable;
- doubles;
- winning-method effects;
- whole-hand patterns;
- special-hand/fishing values;
- applicable limits.

The engineering rule source of truth is `BMJA_RULES_REFERENCE.md`, with implementation/testing detail in `artifacts/mahjong-scorer/SCORING_AUDIT.md` and the scorer tests.

## 11.1 Contextual detected patterns

The working scorer does not display every possible special hand/pattern during every scoring session.

Instead it surfaces patterns that actually apply to the entered evidence.

A contextual callout can communicate:

- pattern name;
- score effect;
- short plain-English explanation.

The purpose is to answer:

> Why did my score just change?

The UI derives these explanations from structured scorer outputs rather than running a second presentation-only rules engine.

The full browse-all catalogue remains on `/special-hands`.

---

# 12. Special hands and fishing

**Status:** Shipped for the set currently implemented by the project

The scorer supports the project's documented special-hand catalogue, including layout-based and event-based specials implemented through issues #1–#4.

For the exact current list and values, use `BMJA_RULES_REFERENCE.md` and `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md` rather than duplicating rule-value tables here.

## 12.1 Automatic recognition principle

The user should generally not need to know the special-hand name before the scorer can recognise it.

Where entered tile evidence and context are sufficient, detection is automatic.

## 12.2 Special-hand fishing

**Relevant implementation:** issue #2 / PR #12

When complete non-winning evidence supports fishing analysis, the scorer can:

- consider legal additional tiles that would not create an impossible fifth copy;
- test candidate completions against supported special-hand patterns;
- identify possible completing tiles;
- handle overlapping matches;
- use the appropriate highest lawful fishing result according to the implemented rules.

Partial losing-hand evidence does not trigger fishing claims where unseen tiles could change the result.

## 12.3 Event-based specials

**Relevant implementation:** issue #4 / PR #16

The app does not maintain a complete turn-by-turn event log merely to score a small number of event-sensitive specials.

Instead it uses minimum necessary context and asks short conditional questions only in plausible cases.

Implemented event-sensitive work includes:

- Heaven's Blessing;
- Earth's Blessing;
- Gathering the Plum Blossom from the Roof;
- Plucking the Moon from the Bottom of the Sea;
- Twofold Fortune.

If an event fact is unknown, the unsupported special is omitted rather than assumed.

---

# 13. Manual numeric score fallback

**Status:** Shipped

A user can enter a numeric hand score without building tiles.

Manual entry:

- is accepted for settlement/game progression;
- does not create a fictional detailed hand;
- does not produce a rule breakdown that was never calculated;
- is labelled as manually entered in historical evidence where relevant.

The product must never imply that a manually typed score was verified against tiles.

---

# 14. Navigation and mobile table use

**Status:** Shipped

## 14.1 Global navigation

Major routes share a consistent site-level header/navigation pattern.

The menu is organised around clear product destinations rather than page-specific one-off navigation.

The logo/site title returns home.

## 14.2 Safe scorer exits

A standalone hand scorer has an obvious way to leave, with protection against silently discarding entered work where relevant.

A scorer opened from a game has a clear cancel/return path and must not apply unfinished changes unless the user explicitly applies the score.

## 14.3 Current mobile hand-scoring hierarchy

The mobile flow is designed around the order a player needs to think at the table:

1. **Context** — winner/non-winner and relevant hand/game state first;
2. **Hand** — normal grouped tile entry as the primary route;
3. **Bonus/relevant special information** — including Flowers and Seasons and conditional information where needed;
4. **Score and explanation** — the outcome of the entered evidence.

Current mobile behaviour includes:

- winner/non-winner context before normal tile building;
- normal content in document flow;
- compact picker associated with the active destination;
- active destinations including sets, Remaining tiles and Special layout;
- Special layout visually secondary to normal set entry;
- partial-hand guidance positioned beside/above Remaining tiles rather than as a competing top-level action;
- no confusing exposed mobile section-number jumps;
- ordinary page scrolling to score/actions/footer;
- desktop/tablet layout preserved rather than unnecessarily redesigned.

The mobile experience should remain a table tool, not a shrunken desktop form.

---

# 15. Canonical printable/savable game record

**Status:** Shipped  
**Relevant implementation:** issue #6 / PR #32

The current product does **not** generate a separate reconstructed report from a parallel data model.

Instead:

> **The canonical game ledger is enriched enough to tell the story of the game, and the browser prints/saves that record.**

## 15.1 Print / Save game

The user can invoke browser print/save behaviour from the game record.

The browser may then print physically or Save as PDF using destinations supported by the device/browser.

## 15.2 Full game record

Full mode includes the detailed confirmed ledger history available, including tile/scoring evidence where actually recorded.

Collapsed ledger entries can be temporarily expanded for print and then returned to their prior screen state.

## 15.3 Game summary

Summary mode focuses on:

- standings;
- hand-by-hand results;
- scores/changes/running totals;
- confirmed game history.

It deliberately excludes detailed tile/evidence cards.

## 15.4 Confirmed data only

Print output should contain confirmed history, not unconfirmed live settlement previews or unfinished score-entry controls.

Completed games show ranked final standings; in-progress records reflect current confirmed standings/history without pretending completion.

## 15.5 Current print non-goals

The current print/save feature does not provide:

- custom PDF generation;
- hosted/shareable report URLs;
- account-based report storage;
- email delivery;
- screenshot/PNG export;
- native share-sheet report integration;
- cross-game analytics;
- AI-generated commentary.

---

# 16. Learner, Help and reference ecosystem

**Status:** Shipped

The learning/reference surfaces are part of the product rather than detached repository documentation.

## 16.1 Gameplay basics — `/gameplay-basics`

Explains the practical flow of British Mahjong for learners.

Source content: `docs/GAMEPLAY_BASICS_CONTENT.md`.

## 16.2 Scoring guide — `/guide`

Explains scoring progressively rather than dumping the full rule catalogue at once.

Source content: `docs/BEGINNER_GUIDE_CONTENT.md`.

## 16.3 Special hands — `/special-hands`

Provides a browseable visual reference to supported special hands without forcing the full catalogue into the working scorer.

Source content: `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`.

## 16.4 Features — `/features`

Explains what the current product can do in outcome-led language, including full games, detailed/partial scoring, explanations, recovery and printable records.

Source content: `docs/FEATURES_CONTENT.md`.

## 16.5 How it works — `/how-it-works`

Explains the evidence-first model through the six-step flow:

> **Context → Evidence → Score → Explain → Settle → Record**

The page reuses real product screenshots through compact `See it in the scorer` disclosures rather than becoming a mockup gallery.

Source content: `docs/HOW_IT_WORKS_CONTENT.md`.

## 16.6 Help — `/help`

Provides searchable, answer-first practical guidance covering game scoring, hand scoring, partial evidence, special situations, recovery, settlement, saving/printing and rules/trust questions.

Stable anchors are used for direct linking where appropriate.

Source content: `docs/HELP_CONTENT.md`.

## 16.7 Mahjong rules compared — `/mahjong-rules-compared`

Compares structural differences between:

- British / BMJA-style Mahjong;
- Hong Kong Mahjong;
- Japanese Riichi;
- Chinese Official / Mahjong Competition Rules (MCR);
- American / NMJL-style Mah Jongg.

Its purpose is to help users identify which Mahjong family they are actually playing and understand why scorers/rules are not interchangeable.

It is not a universal rules engine and does not change the British scorer's ruleset.

Source content: `docs/MAHJONG_RULES_COMPARED_CONTENT.md`.

## 16.8 About — `/about`

Explains project purpose, independent status, rule sources, evidence/uncertainty approach, data model, artwork/licensing and support.

Source content: `docs/ABOUT_THIS_PROJECT_CONTENT.md`.

---

# 17. Responsive instructional screenshot system

**Status:** Shipped

The product contains a repeatable visual-manual system built from real deterministic product states.

Phase 1 contains **eight instructional topics**, each with Mobile, Tablet and Desktop captures — **24 real product screenshots** in total:

1. start a game;
2. enter scores during a game;
3. build an ordinary hand;
4. score a partial losing hand;
5. identify the tile that completed Mah Jong;
6. understand the score and reasoning;
7. read settlement and game history;
8. print or save the game record.

The Help page:

- automatically selects an image suitable for the visitor's viewport;
- allows a manual Mobile / Tablet / Desktop override;
- keeps the chosen override across instructional blocks for the session.

The How it works page reuses the same responsive screenshot infrastructure in compact collapsed disclosures.

Screenshots are:

- real application UI;
- generated from deterministic states;
- not manually cropped/redrawn mockups;
- regenerated using `pnpm --filter @workspace/mahjong-scorer screenshots:help`;
- protected by checks that required visible product images have loaded successfully before capture.

The canonical screenshot folder is:

`artifacts/mahjong-scorer/public/help/screenshots/`

Do not edit committed instructional PNGs by hand when the UI changes; regenerate them.

Low-priority polish remains in issue #60 to better differentiate the score-focused and reasoning-focused How it works screenshots.

---

# 18. Rules, sourcing and independence

**Status:** Shipped product position

The project implements the British Mahjong rules used by this scorer, based primarily on published material referenced in `BMJA_RULES_REFERENCE.md`.

## 18.1 Independent project

British Mahjong Scorer is independent.

It must not be described as:

- an official BMJA app;
- BMJA-endorsed unless that becomes factually true;
- authoritative for every British Mahjong group or house rule.

## 18.2 Public wording

Public rule explanations are project-owned paraphrases rather than substantial reproductions of source material.

## 18.3 Engineering transparency

The project maintains:

- explicit rule/source references;
- interpretation notes;
- known ambiguity notes;
- test/fixture mapping;
- a scoring audit.

If the scorer and a table disagree, the product should encourage inspection of the score breakdown and relevant rule rather than asserting infallibility.

Possible causes include:

- different house rules;
- a different Mahjong variant;
- missing/incorrect entered evidence;
- a project interpretation;
- an implementation defect.

---

# 19. Data, privacy and technical boundary

**Status:** Shipped current architecture

The user-facing scorer is built with React, TypeScript, Vite and the project's current front-end stack, and is deployed on Cloudflare Pages.

Ordinary scoring does not require:

- a user account;
- sign-in;
- a cloud game database;
- a server-side scoring engine;
- cross-device sync.

In-progress game recovery uses browser `localStorage`.

The current public product should therefore be described precisely as **no-account and local-recovery-first**, not broadly as “fully private” without a wider site/network audit.

Cloudflare Web Analytics may provide page/traffic analytics operationally; this does not change the local canonical game-state model.

Issue #44 proposes a future narrowly scoped product-insight/feedback endpoint. That work is not current product behaviour.

---

# 20. Accessibility and table-use principles

The product should continue to favour:

- semantic controls;
- keyboard-accessible navigation;
- accessible labels for tile images/controls;
- comfortable mobile touch targets;
- meaningful headings;
- warnings before destructive navigation where work would be lost;
- text explanations rather than colour-only meaning;
- print records that remain understandable in greyscale.

Readability is part of table usability. Issue #50 tracks further improvement to small supporting text for older and mobile users.

Accessibility is a product-quality requirement, not a separate marketing flourish.

---

# 21. Search, metadata and discoverability

**Status:** Shipped engineering foundation  
**Relevant work:** issue #29 / PR #31, later integration work, and calculator-discoverability PR #62

## 21.1 Calculator positioning

The product name remains **British Mahjong Scorer**.

Public metadata and visible copy also accurately describe it as a:

- British Mahjong calculator;
- British Mahjong scoring calculator;
- British Mahjong hand calculator where relevant.

The homepage remains action-led rather than becoming a keyword-stuffed landing page.

## 21.2 One canonical SEO configuration

Public-route SEO configuration is centralised in:

`artifacts/mahjong-scorer/src/site-seo.json`

It contains the canonical site URL, social image, route paths, titles, descriptions, indexability, aliases and homepage WebApplication data.

That shared configuration is reused by runtime/build behaviour so route metadata, prerender output and sitemap/redirect generation do not need separate hand-maintained route lists.

## 21.3 Current canonical indexable routes

The current set is:

- `/`
- `/game`
- `/hand`
- `/gameplay-basics`
- `/guide`
- `/special-hands`
- `/features`
- `/how-it-works`
- `/help`
- `/mahjong-rules-compared`
- `/about`

## 21.4 Generated/public search signals

The production build provides relevant:

- route-specific titles;
- descriptions;
- canonical links;
- Open Graph/Twitter metadata;
- social preview image;
- sitemap;
- permissive `robots.txt` with sitemap reference;
- Cloudflare Pages alias redirects;
- truthful homepage WebApplication structured data.

Homepage structured data includes factual alternate names, `en-GB`, free accessibility, a GBP 0 Offer and a concise implemented feature list.

Do not add fabricated ratings, reviews, awards or official-association claims.

## 21.5 Retrieval/AI-discoverability guardrails

Public discoverability should rely on normal crawlable factual content and metadata.

Current direction explicitly avoids:

- hidden AI-only keyword blocks;
- bot-specific content variants;
- `llms.txt` solely for discoverability;
- fabricated structured-data claims.

Operational search-engine verification, submission and ranking remain outside application truth and do not guarantee discovery.

---

# 22. Artwork, licensing and support

## 22.1 Tile artwork

**Status:** Shipped

Mahjong tile artwork is sourced from the project's pinned copy of the Regular SVG set from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, under CC BY 4.0.

It is reused across tile entry, learner guides, special-hand examples, detailed ledger evidence, screenshots and print records where relevant.

See:

- `THIRD_PARTY_NOTICES.md`
- `docs/TILE_ASSET_DECISION.md`

Project source code is MIT licensed as recorded in `LICENSE`. Original written content retains the separate copyright position described in the README unless explicitly stated otherwise.

## 22.2 Support model

**Status:** Shipped

A quiet Buy Me a Coffee support route is available.

Support messaging should remain secondary to gameplay and learning and should not create a payment wall or interrupt active scoring.

---

# 23. Current shipped feature inventory

This section is a compact product inventory. More specific behavioural sections above take precedence if wording ever conflicts.

## Game scoring

- four-player game setup and scoring;
- player names and seat Winds;
- East/prevailing-Wind progression;
- winner/draw handling;
- manual or detailed player score entry;
- automatic settlement;
- East doubling where applicable;
- canonical settlement transactions;
- plain-English payment explanation;
- settlement preview before confirmation;
- confirmed hand ledger;
- per-player scores/net changes/running totals;
- detailed evidence in ledger where available;
- manual-score distinction;
- undo/correction;
- local recovery;
- completed-game ranked standings;
- Full game record print/save;
- Game summary print/save.

## Hand scoring

- standalone hand calculator and in-game detailed scorer;
- visual tile entry;
- Pungs, Chows, Kongs and pairs;
- exposed/concealed state;
- Remaining tiles;
- arbitrary unfinished losing-hand shapes;
- partial losing-hand evidence;
- complete losing-hand evidence;
- structural/physical Kong counting;
- Flowers and Seasons;
- copy-limit/structural validation;
- ordinary points/doubles;
- whole-hand detection when evidence is complete;
- contextual pattern explanations;
- irregular/special layout entry;
- supported special-hand detection;
- automatic supported special fishing;
- multiple completing tiles where supported;
- overlapping fishing-match handling;
- winning method;
- winning-tile provenance;
- conservative unknown provenance;
- minimum-context event-special handling;
- conditional event questions;
- conservative unknown event answers;
- manual numeric scoring fallback.

## Learning/reference

- gameplay basics;
- beginner scoring guide;
- tile-family and major/minor explanations;
- Flower/Season guidance;
- visual special-hand catalogue;
- Features page;
- How it works page;
- searchable Help hub;
- responsive visual manual with 24 screenshots;
- major Mahjong-ruleset comparison page;
- About/project transparency;
- contextual scorer explanations;
- engineering rules/source/interpretation tracking.

## Product experience/discoverability

- action-led homepage;
- shared navigation;
- safe scorer exits;
- mobile-first hand-entry refinements;
- no account required for ordinary scoring;
- local browser recovery;
- static Cloudflare Pages deployment;
- centralised route/SEO configuration;
- route-specific crawler-visible metadata;
- sitemap/robots/social metadata;
- truthful WebApplication structured data;
- quiet support link.

---

# 24. Current backlog and exploratory boundary

These items must **not** be presented as current features.

## #63 Reciprocal scorer ↔ learning links and safe return-to-game navigation

**Status:** Backlog

Future intent:

- stronger contextual links between scorer explanations and learning/reference content;
- stable deep-link anchors;
- clear Return to game affordance on learner pages when a recoverable game exists;
- no mutation/discard of game state merely because the user reads Help/reference content.

## #64 Interactive prefilled special-hand examples

**Status:** Backlog

Future intent:

- let catalogue examples open safely as deterministic prefilled `/hand` examples;
- reuse canonical example data rather than duplicating truth;
- never overwrite an active game;
- return to the exact catalogue example.

## #65 Tested scoring examples and lightweight practice

**Status:** Backlog

Future intent:

- one substantive `/scoring-examples` hub;
- worked examples backed by scorer tests/canonical data;
- open a completed example in the normal scorer;
- lightweight “build it yourself” practice without accounts, streaks or a second scoring engine.

This is distinct from the broader computer-opponent exploration in #17.

## #48 Progressive Web App / offline installability

**Status:** Backlog

Future intent:

- installable home-screen/app-like experience;
- web app manifest/icons;
- safe service-worker caching;
- core scoring usable offline after installation/loading;
- preserve the existing canonical website/SEO/deployment model.

No separate native Android/iOS app is required by this issue.

## #49 Clearer beginner entry path

**Status:** Backlog

Future intent:

- more obvious beginner route from the homepage;
- contextual explanation of setup terms such as starting Winds/game length;
- no mandatory onboarding wizard.

## #50 Small-text readability improvement

**Status:** Backlog

Future intent:

- improve readability of important supporting text on phones/tablets, especially for older players;
- preserve visual hierarchy without relying on tiny text for essential information.

## #51 Optional house-rule evidence gathering

**Status:** Exploratory / discovery

The canonical baseline remains the project's BMJA-style rules.

House-rule support should only be implemented where evidence shows a repeated real-user need, and any future switches must be explicit rather than silently changing what “BMJA” means.

## #44 Lightweight product insight and feedback

**Status:** Backlog

Future intent is narrowly scoped, privacy-conscious product evidence such as game start/completion/recovery/print events and end-of-game feedback.

It is not current behaviour and must not be described as existing product telemetry.

## #60 Differentiate How it works score/reasoning screenshots

**Status:** Backlog / low-priority polish

The current page is usable; this issue improves distinction between two existing visual examples without changing scoring behaviour or the screenshot architecture.

## #7 Shared physical tile inventory

**Status:** Backlog

Future intent is cross-player availability/impossible-tile warnings when multiple detailed hands are known.

Manual numeric scores remain composition-unknown.

## #8 Photo-based tile recognition

**Status:** Backlog

Future intent is optional browser-side recognition feeding the same canonical hand/correction model.

Photo recognition is not current functionality.

## #17 Solo play against computer players

**Status:** Exploratory

Future concept is one human against deterministic local browser bots reusing the current scoring/game models.

It is not a committed current feature.

## Explicitly not current product behaviour

No current product capability should be implied for:

- account/cloud game history;
- cross-device game sync;
- online multiplayer;
- native app-store distribution;
- hosted/shareable report URLs;
- built-in email report delivery;
- native screenshot/PNG export;
- cross-game player statistics/dashboarding;
- AI scoring;
- AI-generated game commentary.

---

# 25. Comprehensive “what if?” truth bank

This section records canonical answers behind Help/FAQ content.

## What if I only know part of a losing hand?

Enter the scoring sets and bonus tiles you know.

The scorer can calculate directly evidenced components and treat the hand as partial. It will not infer whole-hand patterns or special fishing that depend on unseen tiles.

## What if I only want to enter the sets that score?

That is supported for a losing hand. You do not have to reconstruct every irrelevant loose tile merely to receive a score for completed scoring evidence.

## What if I enter all 13 structural tiles for a losing hand?

The evidence becomes complete enough for the supported whole-hand/fishing analysis to run.

## What if I enter too many structural tiles or five copies of one ordinary tile?

That is invalid/impossible evidence, not merely partial evidence, and should be rejected/warned about.

## What if I have a Kong and the physical tile count looks high?

The scorer understands that a Kong has four physical tiles while occupying one structural group slot.

## What if I have Flowers or Seasons?

Enter them separately as bonus tiles. They are not part of the normal structural 13/14 playing-tile base.

## What if my hand does not fit normal Pungs/Chows/Kongs/Pairs?

Use the secondary Special layout route for an irregular supported layout.

## What if I think I am fishing for a special hand but do not know its name?

Enter complete non-winning tile evidence. The scorer can detect supported one-tile-away patterns and possible completing tiles automatically.

## What if several fishing patterns match?

The scorer evaluates supported lawful matches rather than depending on detector order and applies the appropriate highest result.

## What if I do not know which tile completed Mah Jong?

Use the uncertainty route. The scorer avoids winning-tile-sensitive exceptions it cannot prove.

## What if I edit the hand after choosing the winning tile?

Stored provenance should be revalidated/cleared where it no longer matches the edited hand.

## What if I do not know whether a rare event-based special happened?

Use the “not sure”/unknown path where provided. The unsupported event special is omitted rather than assumed.

## What if the rare special can be inferred from information already entered?

The scorer should infer it instead of asking the same fact again.

## What if I already know the score?

Enter it manually. It can be used for game settlement/progression, but the record will not pretend a detailed hand was captured or verified.

## What if only one player uses detailed scoring?

That is valid. Detailed and manual scores can coexist and the ledger preserves the evidence actually available for each player.

## What if I refresh or close the browser during a game?

The most recent compatible in-progress game should recover from local storage on the same browser/device.

## What if the saved browser data is malformed or incompatible?

It should not prevent the application from loading. Invalid/incompatible state is rejected/cleared defensively.

## What if I want to start again completely?

Use the explicit Start over/new-game action so the old saved snapshot does not return.

## What if I leave a standalone hand with unsaved work?

The application should warn where leaving would discard entered work.

## What if I cancel a detailed scorer opened from a game?

Return to the game without applying the unfinished score.

## What if I want to save the game?

Use Print / Save game and the browser print flow. Save as PDF is normally available as a browser print destination.

## What if I want every captured tile and scoring detail?

Use **Full game record**.

## What if I only want standings and hand-by-hand results?

Use **Game summary**.

## What if ledger entries are collapsed when I print the Full record?

The print flow temporarily exposes the required confirmed detail and restores the prior screen state afterwards.

## What if the game is unfinished but I want a record so far?

The print system can represent current confirmed history/standings without falsely presenting final completed-game standings.

## What if the scorer and our table disagree?

Inspect the score breakdown and relevant rule. Possible reasons include different house rules, a different Mahjong variant, missing/incorrect evidence, a project interpretation or a defect.

## What if our group plays Riichi, Hong Kong, MCR or American Mahjong?

Use `/mahjong-rules-compared` to understand major differences, but do not expect this British scorer to calculate those rulesets.

## What if I want the game on another device?

Current local recovery is not cross-device sync.

## What if I want a shareable web link to the report?

Hosted/shareable report URLs are not part of the current print/save feature.

## What if I want to photograph my tiles?

Photo recognition is backlog work (#8), not current functionality.

## What if I want the site installed like an app or to work offline?

PWA/offline installability is backlog work (#48), not current functionality.

## What if I want worked scoring examples or to practise building a hand?

A tested worked-example/practice hub is backlog work (#65), not current functionality.

## What if I want to tap a special-hand catalogue example and load it into the scorer?

That interactive prefill path is backlog work (#64), not current functionality.

## What if I want to read a rule during a live game and return directly to the game?

Broader reciprocal scorer/reference linking and the reusable learner-page Return to game affordance are backlog work (#63). Existing navigation/recovery remains available, but do not describe the future contextual system as shipped yet.

## What if our group uses house rules?

The current baseline remains the documented British rules implemented by the project. Optional house-rule support is still evidence-gathering work (#51).

## What if I want to practise alone against computer players?

That remains exploratory future work (#17).

---

# 26. Canonical product claims allowed today

These statements are safe foundations for public copy when phrased appropriately:

- British Mahjong Scorer is a free browser-based British Mahjong scoring calculator.
- It scores complete four-player games and individual hands.
- It can calculate detailed hand scores from visual tile entry.
- It can also accept manually entered numeric scores.
- Detailed and manual scores can coexist in the same game.
- It calculates settlement and East doubling according to the implemented rules.
- It keeps a canonical hand-by-hand ledger with running balances.
- It explains stored settlement transactions in plain English.
- It supports partial scoring evidence for unfinished losing hands.
- It distinguishes partial, complete and invalid evidence.
- It automatically detects supported special hands where the evidence is sufficient.
- It automatically detects supported special-hand fishing from complete non-winning evidence.
- It asks for winning-tile/event facts only when they matter.
- It supports conservative scoring when required facts are unknown.
- It provides gameplay, scoring, special-hand, Help, Features, How it works and rules-comparison content.
- Help includes a responsive visual manual built from 24 real product screenshots.
- It can recover an in-progress game locally after refresh/browser restart on the same browser/device.
- It does not require an account for ordinary scoring.
- Its printable/savable game record comes from the same canonical ledger used during play.
- It offers Full game record and Game summary browser print/save modes.
- It is an independent project and not an official BMJA publication.

---

# 27. Claims that require qualification

## “Accurate”

Prefer:

- “built against the British rules documented by this project”;
- “scoring rules are explicit and tested”;
- “shows the score breakdown so the result can be checked”.

Avoid:

- “100% accurate”;
- “guaranteed correct”.

## “Private”

Prefer:

- “no account required”;
- “in-progress recovery is stored locally in your browser”;
- “ordinary scoring does not require cloud game-history storage”.

Avoid broad privacy claims that would require a wider site/network/privacy audit.

## “Automatic”

It is fair to describe detection as automatic where the scorer derives the result from entered evidence.

Do not imply the app can infer facts it explicitly asks the user to provide.

## “Complete hand scoring”

Detailed scoring is complete only to the extent the required evidence is entered and supported by the implemented rules.

Manual numeric input is not detailed scorer verification.

## “App”

The current product is a web application, but it is not yet an installable/offline PWA. Do not describe #48 as shipped.

## “BMJA”

The project can describe the British/BMJA-style rules it implements and sources, but must not imply official status or endorsement.

---

# 28. Canonical How it works explanation

The shipped `/how-it-works` page uses a six-step model.

## Step 1 — Context

Give the scorer the context it actually needs. Inside a full game, some context can already come from the game state.

## Step 2 — Evidence

Enter the hand at the level of detail needed: a completed winning hand, a complete losing hand, partial losing evidence, or a manual numeric score where detailed reconstruction is unnecessary.

## Step 3 — Score

The scorer applies only rules supported by the evidence and uses whole-hand analysis only when the input is complete enough.

## Step 4 — Explain

Relevant scoring components and detected patterns show why the score changed. If a material fact cannot be inferred, the scorer asks only when necessary and allows conservative uncertainty where practical.

## Step 5 — Settle

In a full game, player scores feed the canonical settlement calculation and running balances.

## Step 6 — Record

Confirmed results enter the canonical ledger, which becomes both the game history and the source for Full/Summary browser print-save records.

---

# 29. Product voice principles

Public product content should be:

- plain English;
- calm;
- specific;
- useful at the table;
- beginner-friendly without being patronising;
- transparent about uncertainty;
- concrete about what is automated and what is entered;
- independent rather than authority-posturing;
- restrained about marketing claims.

Prefer ideas such as:

- “Enter what you know.”
- “The scorer works out what it safely can.”
- “If a rule needs a fact the app cannot infer, it asks.”
- “If you do not know, the scorer scores conservatively.”

Avoid:

- hype;
- gamified celebration that interrupts table use;
- “AI-powered” framing;
- forced technical terminology;
- making a beginner select rule names before the system can help them.

---

# 30. Public-content and product-truth maintenance

The old handbook accumulated drift because the same status/route truth was repeated in too many places. This version deliberately consolidates that information.

When product behaviour changes, maintain sources in this order.

## 1. Rule truth

If scoring rules changed:

- update implementation/tests;
- update `BMJA_RULES_REFERENCE.md`;
- update `SCORING_AUDIT.md` where relevant.

## 2. Product truth

Update this handbook to reflect the behaviour users now experience.

## 3. Public/learner source content

Review relevant sources:

- `HELP_CONTENT.md`;
- `FEATURES_CONTENT.md`;
- `HOW_IT_WORKS_CONTENT.md`;
- `ABOUT_THIS_PROJECT_CONTENT.md`;
- `BEGINNER_GUIDE_CONTENT.md`;
- `GAMEPLAY_BASICS_CONTENT.md`;
- `SPECIAL_HAND_CATALOGUE_CONTENT.md`;
- `MAHJONG_RULES_COMPARED_CONTENT.md`;
- `MARKETING_COPY_BANK.md`;
- `INSTRUCTIONAL_SCREENSHOT_PLAN.md` where UI/how-to captures are affected.

## 4. Public route/discoverability truth

If a public canonical page or alias changes, update the shared `site-seo.json` configuration and ensure runtime/build/prerender/sitemap/robots/redirect output remains aligned.

## 5. Screenshots

If documented UI changes materially, regenerate affected instructional screenshots rather than hand-editing PNGs.

Recommended PR checklist item:

> **Content impact checked:** Product Handbook, Help, Features, How it works, learner/reference pages, rules reference, SEO route config and instructional screenshots reviewed where relevant.

When repetition conflicts, the more specific behavioural section should be corrected first, then inventory/claims brought back into alignment.

---

# 31. Product-level issue / PR implementation map

This is a product map, not an exhaustive commit log.

| Area | Issue / PR | Product result |
| --- | --- | --- |
| Missing layout special hands | #1 / PR #11 | Complete the currently targeted layout-based special-hand set |
| Automatic special fishing | #2 / PR #12 | Detect supported special fishing/completing tiles without naming the special first |
| Winning-tile provenance | #3 / PR #13 | Capture final-tile evidence for rules that genuinely depend on it |
| Event-based specials | #4 / PR #16 | Add five event-sensitive specials using minimal context/questions |
| Learner/rules reference | #5 / PR #18 | Beginner guide, special-hand catalogue, rule/test mapping and tile-artwork decision |
| Canonical printable game record | #6 / PR #32 | Enriched ledger plus Full/Summary browser print-save modes |
| Local game recovery | #14 / PR #23 | Versioned localStorage recovery without accounts |
| Unfinished/partial losing hands | #15 / PR #22 + PR #30 | Remaining tiles, correct counting and partial-evidence scoring |
| Homepage/product entry | PR #19 | Action-led homepage and learner routes |
| Contextual pattern callouts | #20 / PR #25 | Show only relevant detected patterns in the working scorer |
| Navigation/safe exits | #21 / PR #24 | Shared site navigation and safe leaving behaviour |
| Mobile hand-scorer UX | PR #28, later PR #55 | In-flow mobile picker plus context-first hierarchy and cleaner information order |
| SEO/indexing foundation | #29 / PR #31 | Static route metadata, aliases, sitemap, robots and social preview |
| Product-content system | PRs #33–#38 | Product plan, canonical handbook baseline, Features/Help/How-it-works source copy and marketing bank |
| Background product pages | PRs #39–#43 | Shipped How it works, Features and Help plus navigation/SEO integration |
| Mahjong rules comparison | PRs #45–#47 | Sourced rules-comparison content, live route and contextual internal links |
| Responsive screenshot system | #53 / PR #56, #57 / PR #58 | Reusable Help how-tos and complete 8-topic / 24-image Phase 1 library |
| How it works visual reuse | PR #59 | Reuse responsive scorer screenshots in six collapsed How it works disclosures |
| Calculator discoverability / central SEO truth | #61 / PR #62 | Calculator wording, shared SEO configuration and enriched truthful WebApplication data |
| README project-front-door refresh | direct main commit 1e3ae83 | Repository front door aligned to current shipped product and roadmap |
| Shared tile inventory | #7 | Backlog |
| Photo tile recognition | #8 | Backlog |
| Solo computer-opponent practice | #17 | Exploratory |
| Product insight/feedback | #44 | Backlog |
| PWA/offline installability | #48 | Backlog |
| Beginner entry path | #49 | Backlog |
| Readability | #50 | Backlog |
| House rules | #51 | Exploratory/discovery |
| How it works screenshot differentiation | #60 | Low-priority polish |
| Reciprocal scorer/reference links | #63 | Backlog |
| Interactive special-hand examples | #64 | Backlog |
| Tested scoring examples/practice | #65 | Backlog |

---

# 32. Handbook maintenance status

This file should be reviewed whenever a feature PR changes user-facing behaviour.

At minimum, future reviews should check:

- shipped/backlog status;
- public route list;
- What if? answers;
- persistence implications;
- ledger/evidence implications;
- print implications;
- learner/Help implications;
- screenshot implications;
- SEO/discoverability implications;
- public feature/marketing claims;
- backlog/current-product boundary.

The handbook is intentionally detailed, but should avoid needless status duplication. The goal is to make product truth easy to retrieve without requiring someone to reconstruct design decisions from old GitHub issues.