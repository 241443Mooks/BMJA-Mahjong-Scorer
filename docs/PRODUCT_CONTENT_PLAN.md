# British Mahjong Scorer — product content system

> **Purpose:** canonical plan for the product-guide, feature, USP, support and deeper marketing content behind `mahjong.smooks.co.uk`.
>
> This document is not intended to become one long public page. It defines the reusable content system from which focused public pages, help content and marketing copy can be built.

## 1. Product position

British Mahjong Scorer is a browser-based companion for people who want to play British Mahjong without having to keep the entire scoring system in their head.

The product has three connected jobs:

1. **Score accurately.** Calculate individual hands and complete four-player games.
2. **Explain what happened.** Show why a score applies, how settlement works and what evidence was used.
3. **Teach without interrupting play.** Surface the relevant rule at the point it matters and keep deeper reference material available when wanted.

Core product principle:

> **Explain the game. Do not make the player learn the scoring engine.**

Supporting trust principle:

> **Never invent missing evidence. Calculate what can be supported, ask only when necessary, and say when something is unknown.**

## 2. Content architecture

Do not put all of this content on the homepage. The homepage should remain an action-led entry point.

Build the deeper content as a set of focused pages/resources that share one canonical source of product truth.

### A. Product guide / Help centre

Working route: `/help` or `/product-guide`

Purpose: answer “How do I do this?” and “What happens if…?” questions.

Suggested sections:

- Start here
- Score a complete game
- Score one hand
- Enter a winning hand
- Enter an unfinished losing hand
- Enter only part of a losing hand
- Enter Flowers and Seasons
- Enter irregular / special layouts
- Use manual numeric scoring
- Understand detected patterns
- Understand fishing
- Understand winning-tile questions
- Understand East and settlement
- Recover a game after refresh or browser restart
- Undo / correct a confirmed hand
- Finish a game
- Print or save a game record
- Leave a scorer safely
- Start over / clear a saved game

Every task article should use the same shape where practical:

1. **What this does**
2. **How to do it**
3. **What the scorer will work out automatically**
4. **What it may ask you**
5. **What if…**
6. **What is saved / not saved**
7. **Related guide**

### B. “What if?” / edge-case library

This should be part of Help, not a separate technical FAQ dump.

Capture the cases already designed into the product, including:

- What if I do not know the exact hand?
- What if a losing hand is incomplete?
- What if I only want to enter the sets that score?
- What if I do not know which tile completed Mah Jong?
- What if I do not know whether East’s first discard was involved?
- What if the hand does not fit ordinary sets?
- What if I think I am fishing for a special hand but do not know its name?
- What if the same tiles could match more than one special hand?
- What if I enter an impossible fifth copy of a tile?
- What if a Kong means there are physically more tiles than the structural hand count?
- What if I refresh or close the browser during a game?
- What if I navigate away by mistake?
- What if I entered a score manually rather than building the hand?
- What if only some players used detailed scoring?
- What if I want a compact game record rather than every tile and scoring detail?
- What if I want a full printable record?
- What if the scorer and my table disagree?
- What if my group uses a different Mahjong ruleset?

The answer pattern should be calm and explicit: what the app knows, what it does not know, what it will calculate, and what the user can do next.

### C. Features page

Working route: `/features`

Purpose: comprehensive but readable product capability list.

Organise by user outcome rather than software subsystem.

#### Score a game

- Four-player British Mahjong game scoring
- Player names and seat Winds
- East / prevailing-Wind progression
- Winner and draw handling
- Manual or detailed calculated player scores
- Canonical settlement calculation
- East doubling
- Plain-English payment explanation from stored transactions
- Running balances
- Expandable hand-by-hand ledger
- Undo / correction flow
- Local recovery after refresh, tab closure or browser restart
- Completed-game final standings
- Full or summary print/save game record

#### Score a hand

- Visual tile entry
- Pungs, Kongs, Chows and pairs
- Exposed / concealed set handling
- Flowers and Seasons
- Own Flower / own Season relationships
- Remaining tiles for unfinished hands
- Partial-evidence scoring for losing hands
- Complete-hand inference when enough evidence exists
- Irregular special-hand layout entry
- Winning method
- Winning-tile provenance where relevant
- Automatic points and doubles
- Automatic ordinary pattern detection
- Automatic special-hand detection
- Automatic special-hand fishing detection
- Highest lawful fishing result where patterns overlap
- Event-based special handling using minimum necessary questions
- Conservative unknown / “I’m not sure” handling
- Copy-limit and impossible-tile validation
- Manual numeric score fallback

#### Learn while playing

- Gameplay basics
- Beginner scoring guide
- Tile-family explanations
- Flower and Season guidance
- Visual special-hand catalogue
- Contextual detected-pattern explanations inside the scorer
- Plain-English settlement explanations
- Rule/source transparency

#### Keep control of your data

- No account required
- Static browser application
- In-progress game recovery stored locally in the browser
- No cloud game-history requirement
- No backend required for ordinary scoring
- Clear Start over / clear-saved-game control

#### Save a game record

- Existing canonical ledger remains the record
- Rich per-hand history
- Detailed hand reconstruction where the user entered it
- Manual scores clearly distinguished from calculated hands
- Partial evidence clearly distinguished from complete evidence
- Full game record print mode
- Compact game summary print mode
- Browser Print / Save as PDF rather than a separate report account or hosted-document system

### D. USP / differentiation page or reusable marketing bank

This may not need its own top-level navigation item. It can live as reusable copy for About, search landing pages, README, social copy and future promotion.

Primary USPs:

1. **Built for British Mahjong specifically**  
   Not a generic Mahjong calculator with a British label added afterwards.

2. **It explains the score, not just the number**  
   Points, doubles, detected patterns, settlement and relevant special-hand logic are surfaced in understandable language.

3. **You do not need to know the name of the pattern first**  
   The scorer detects supported patterns and special fishing from the tiles and context where the evidence is sufficient.

4. **Partial hands are genuinely supported**  
   A losing player can enter only the scoring evidence they care about instead of reconstructing every irrelevant loose tile.

5. **Unknown means unknown**  
   “I’m not sure” is a valid route. The scorer reduces certainty rather than inventing facts.

6. **The detailed hand and the game ledger are one system**  
   Scores calculated in the hand scorer can flow into the game, retain their evidence and appear in the final game record.

7. **The game survives ordinary browser accidents**  
   In-progress games recover locally without requiring an account.

8. **The final record comes from the same ledger used during play**  
   No second report engine and no rewritten version of what happened. Full and summary print modes use the canonical game history.

9. **Beginner-first without removing depth**  
   The main flow asks only what is relevant; deeper rules and special-hand material remain available behind it.

10. **No account required**  
    Open the site and score the game. No sign-up wall before the table can start.

Useful short positioning lines to develop later:

- “Score British Mahjong without keeping the whole rulebook in your head.”
- “A scorer that tells you why.”
- “Enter what you know. The scorer works out what it safely can.”
- “Built for the table, not for studying the scoring engine.”
- “From tiles to settlement, with the reasoning left visible.”

Do not claim uniqueness unless it has been researched and verified. Prefer “designed to…” and concrete capability statements over “the only…” or “the most…”.

### E. Trust, accuracy and privacy content

Working route could remain part of `/about`, with a deeper `/accuracy` or `/how-scoring-works` page only if needed.

Must cover:

- independent project / not official BMJA
- rules sources and project-owned paraphrasing
- explicit interpretations and known ambiguity
- rule-to-test coverage in engineering docs
- conservative scoring when evidence is missing
- distinction between manual scores and calculated detailed scores
- distinction between partial and complete hand evidence
- local browser persistence and what it does / does not mean
- no account required
- ruleset scope: British rules used by this project, not every Mahjong variant or house rule

### F. “How it works” product explainer

Working route: `/how-it-works`

This is different from Help. It should explain the product model in a few visual stages:

1. Tell the scorer the game context.
2. Enter the hand — fully or partially where appropriate.
3. The scoring engine applies rules supported by the evidence.
4. Relevant detected patterns are explained.
5. In a game, the score flows into settlement and the ledger.
6. The ledger becomes the printable/savable game record.

This is a strong background marketing page because it demonstrates the product without making the homepage longer.

## 3. Canonical “everything we have thought about” handbook

Create one internal product handbook that is intentionally more exhaustive than any public page.

Suggested file:

`docs/PRODUCT_HANDBOOK.md`

It should be the place to record, for every product behaviour:

- capability
- current status: shipped / backlog / exploratory
- user problem
- user-facing behaviour
- automatic inference
- required user input
- unknown / conservative behaviour
- validation / impossible-state behaviour
- persistence behaviour
- evidence retained for the ledger
- print behaviour
- relevant issue / PR
- related learner content
- future ideas explicitly excluded from the current behaviour

This prevents future content from describing an old or imagined version of the product.

## 4. Public-content source files

Recommended source set after the handbook is created:

- `docs/PRODUCT_HANDBOOK.md` — exhaustive canonical product behaviour
- `docs/PRODUCT_CONTENT_PLAN.md` — this architecture and publishing plan
- `docs/FEATURES_CONTENT.md` — publishable feature-page copy
- `docs/HELP_CONTENT.md` — task guides and what-if answers
- `docs/HOW_IT_WORKS_CONTENT.md` — product explainer copy
- `docs/MARKETING_COPY_BANK.md` — USPs, short descriptions, metadata variants, social copy, support copy
- existing `docs/ABOUT_THIS_PROJECT_CONTENT.md`
- existing `docs/GAMEPLAY_BASICS_CONTENT.md`
- existing `docs/BEGINNER_GUIDE_CONTENT.md`
- existing `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`
- `BMJA_RULES_REFERENCE.md` — engineering rules source of truth, not public marketing copy

Keep rule facts in the rules reference / scoring implementation and product facts in the handbook. Public copy should be derived from those rather than becoming a third source of truth.

## 5. Publishing sequence

### Phase 1 — canonicalise current product truth

1. Create `PRODUCT_HANDBOOK.md` from the current shipped application, merged PRs and active backlog.
2. Mark every capability as shipped, backlog or exploratory.
3. Remove stale “future” wording from existing docs when the feature has already landed.
4. Keep #7, #8 and #17 clearly future/exploratory rather than accidentally marketing them as present features.

### Phase 2 — write the useful background pages

1. `FEATURES_CONTENT.md`
2. `HELP_CONTENT.md`
3. `HOW_IT_WORKS_CONTENT.md`
4. `MARKETING_COPY_BANK.md`

The Help content is the largest piece. Build it as many short answerable sections rather than one narrative guide.

### Phase 3 — implement routes

Recommended public routes:

- `/features`
- `/how-it-works`
- `/help`

Keep existing:

- `/gameplay-basics`
- `/guide`
- `/special-hands`
- `/about`

The homepage can link quietly to Features / Help / How it works from secondary navigation or footer. They do not need to become the homepage’s main calls to action.

### Phase 4 — connect and maintain

- Add contextual Help links from difficult scorer states where useful.
- Link feature claims to the appropriate explainer/help content rather than duplicating long explanations.
- Update search metadata/sitemap when new canonical routes ship.
- Add a lightweight documentation checklist to future feature PRs: “Does this change PRODUCT_HANDBOOK / Help / Features / About?”

## 6. Content standards

All product content should be:

- plain English
- specific rather than promotional-for-its-own-sake
- beginner-friendly without being patronising
- explicit about what is calculated vs manually supplied
- explicit about what is known vs unknown
- clear that this is an independent project
- accurate to the shipped application
- careful not to imply support for unimplemented backlog features
- reusable across mobile and desktop

Avoid:

- “AI-powered” language: the scorer is deterministic rule logic, not an AI scoring service
- “perfect”, “guaranteed”, “100% accurate” or similar claims
- “official BMJA” wording
- “the only” / “best” claims without evidence
- promising cloud sync, accounts, photo recognition, solo play or cross-game analytics before they exist
- presenting manual scores as scorer-verified hands
- presenting partial hand evidence as a complete reconstruction

## 7. Current shipped product baseline — 7 September 2026

The content system should treat the following as shipped baseline, based on merged work through PR #32:

- complete four-player game scoring
- detailed standalone/in-game hand scorer
- complete supported layout-based and event-based special-hand work currently implemented by the project
- automatic special-hand fishing
- winning-tile provenance where required
- arbitrary Remaining tiles for losing hands
- partial-evidence scoring for losing hands
- learner guide, gameplay basics, special-hand catalogue and About page
- local tile artwork and attribution
- local in-progress game recovery
- shared site navigation / safe scorer exits
- contextual detected-pattern callouts
- mobile hand-scorer UX refinements
- route-specific SEO/indexing metadata
- enriched canonical game ledger
- detailed hand evidence in the ledger where recorded
- plain-English settlement transactions
- completed-game final standings
- Full game record and Game summary browser print/save modes

Future/backlog items must remain clearly separate, including:

- shared physical tile inventory / availability warnings (#7)
- photo-based tile recognition (#8)
- lightweight solo practice exploration (#17)
- any account/cloud sync system
- hosted/shareable game reports
- cross-game analytics

## 8. Maintenance rule

When a feature changes behaviour, update the product truth before adding more marketing copy.

Recommended PR checklist item:

> **Content impact checked:** product handbook, Help, Features, How it works, About, learner guides and rules reference reviewed where relevant.

The goal is that six months from now the site can contain rich product material without becoming a collection of slightly different stories about what the scorer does.
