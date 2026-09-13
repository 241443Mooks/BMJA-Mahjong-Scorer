# Mahjong Reference — Table Companion transformation

Status: agreed product plan after completion of Outside the Box profile work (#88)

## Product direction

**Mahjong Reference** remains the product/brand.

**Table Companion** is the proposition, not a replacement name.

Primary proposition:

> **Your Mahjong table companion.**
> Score a hand, track the whole game, understand settlement and use the rules your table actually plays.

Always make these product facts easy to find:

- free to use;
- no signup required for ordinary scoring, learning or game tracking;
- local browser recovery is not an account/cloud-sync system.

Strategic principle:

> **Mahjong Reference should reduce friction, uncertainty and arithmetic at a real Mahjong table.**

## Product mental model

The public product should answer two independent questions:

1. **What do you want to do?** — track a game, score a hand, understand settlement, check a rule, or learn.
2. **Which rules are you using?** — British/BMJA-style, Western — Thompson & Maloney, a named club profile, or a future supported rules family.

Use **Rules** in public UI. Keep internal `RulesProfileRef` / version IDs as implementation and provenance detail.

## Current product truth

The underlying product now has capabilities that the public frontend does not yet expose coherently:

- versioned rules profiles;
- stable British/BMJA behaviour;
- `western-tm@0.1` with a source-certified Companion special-hand catalogue and provisionally shared ordinary play;
- a certified `outside-the-box@0.1` named-club profile;
- profile-specific scoring/bindings without cross-profile leakage;
- full-game progression, settlement, running balances, history and print records;
- Goulash and physical blank-tile support where the selected rules require it;
- Outside the Box incidents/liability;
- persistence/replay with exact profile/version identity.

The frontend and public copy still overstate the old product boundary by describing Mahjong Reference primarily as a British hand/game calculator.

The purpose of #105 is therefore:

> **Make the public product catch up with the product that already exists.**

## Route architecture

Preserve existing useful URLs where possible. Avoid URL churn merely for hierarchy neatness.

Target public structure:

```text
/
├── game
├── hand
├── mahjong-settlement
│
├── rules
│   ├── british
│   ├── western
│   └── which-mahjong-rules-do-i-play
│
├── mahjong-rules-compared
│
├── gameplay-basics
├── guide
├── special-hands
├── scoring-examples
│
├── help
├── how-it-works
└── about
```

Do not create `/rules/compare` while `/mahjong-rules-compared` already owns that search/content job.

Do not create a competing `/mahjong-game-tracker` page while `/game` can own the full-game job.

### Rules-specific game entry routes

It is desirable for the game tracker to have a clean entry route for each supported rules context without duplicating the game engine.

Recommended functional route pattern:

```text
/game
/game/british
/game/western
/game/outside-the-box   # public only after naming permission is confirmed
```

These are **entry states into the same game component**, not separate implementations.

Rules:

- `/game` remains the primary whole-game destination and safe default entry;
- a rules-specific route preselects the relevant current supported profile for a **new** game;
- do not put raw profile version IDs in the public URL;
- once a game begins, the exact profile/version is persisted and locked;
- visiting a different rules-specific route must never silently mutate an existing recovered game;
- if an incompatible saved game exists, explain the current saved rules and require an explicit new-game action to change them;
- profile/version provenance remains in the stored game and printed record;
- initially avoid duplicate indexable content between the rules-specific tool entries and `/game`; rules-specific reference/SEO authority lives primarily on `/rules/...` pages unless a later route has genuinely distinct useful content.

This pattern can later be considered for `/hand` if the game implementation proves useful, but do not create symmetry for its own sake.

## Existing route decisions

- `/` — keep; reposition as whole-product home.
- `/game` — keep; elevate to primary Table Companion workspace and full-game destination.
- `/hand` — keep; make rules-aware and clearly scoped to one hand.
- `/scoring-examples` — keep; British examples remain valid assets until profile-aware examples are deliberately added.
- `/gameplay-basics` — keep; main beginner entry route.
- `/guide` — keep explicitly British/BMJA-style initially.
- `/special-hands` — keep; later become profile-aware or clearly rules-scoped without gratuitous URL change.
- `/features` — de-emphasise; most product capability should be visible from home/game/how-it-works. Decide later whether this page still earns a distinct job.
- `/how-it-works` — keep; update to explain the rules-aware evidence → score → settlement → record model.
- `/help` — keep; make rules-aware.
- `/mahjong-rules-compared` — keep canonical comparison route.
- `/about` — keep; project/trust/sources, with detailed rules authority moving toward `/rules`.

Existing learning URLs should not be moved under `/learn/` merely for architectural neatness. Navigation can present a Learn section without changing canonical paths.

Longer term, learning content should become rules-aware where it creates real value; do not solve that prematurely in the first frontend pass.

## Global navigation direction

Primary groups should reflect user jobs:

### Play
- Track a game
- Score a hand
- Understand settlement

### Rules
- Choose / understand rules
- Find which rules I play
- Compare Mahjong rules

### Learn
- Gameplay basics
- British scoring guide
- Special hands
- Scoring examples

Help / How it works / About remain secondary utility/project destinations.

## Rules availability and public wording

### British / BMJA-style

Status: available and stable.

Use as the safe default unless the user deliberately selects another supported rules context.

### Western — Thompson & Maloney

Status: public and selectable while still provisional.

Suggested human-facing status:

> **Scorer available. Special-hand catalogue source-verified; ordinary play is still under source review.**

Do not call the whole profile fully verified until #121 is complete.

### Outside the Box

Status: executable/certified internally.

Public naming/profile-page/chooser exposure is gated by explicit permission to use the club name publicly.

The product architecture should support named club rules now, but public copy must not assume permission.

## Frontend transformation slices

#105 is the umbrella product-transformation epic. It should not be implemented as one large PR.

### 105A — product/route audit and target architecture

Status: complete when this document and the corresponding #105 plan are agreed.

Deliverables:

- current route/content audit;
- target information architecture;
- route preservation decisions;
- rules-entry strategy;
- issue consolidation/dependency map;
- implementation slices and limits.

No Codex implementation should be required for this slice.

### 105B — rules-selection foundation

Goal: make the existing tools truthfully usable with supported rules before broad marketing repositioning.

Scope:

- one reusable human-facing rules descriptor/selector;
- British safe default;
- Western selectable with clear provisional wording;
- named-club support in the data/UI model, with public OTB naming permission gate respected;
- `/game` creation uses selected profile rather than hard-wired BMJA creation;
- rules-specific `/game/...` entry routes as defined above;
- `/hand` can select rules when standalone;
- hand scorer invoked from a game inherits and locks that game's rules;
- active rules always visible in game/hand contexts;
- persisted games cannot silently change rules/version;
- no homepage redesign in this slice.

### 105C — homepage, navigation and readability

Goal: make the public shell tell the truth about the product.

Scope:

- reposition `/` around **Your Mahjong table companion**;
- explicitly state **Free · no signup required** near the primary proposition;
- update primary calls to action around real jobs;
- implement Play / Rules / Learn navigation direction;
- absorb #49 beginner-entry requirements;
- treat #50 readability as a cross-cutting acceptance standard, not a later cosmetic ticket;
- preserve British SEO equity while broadening the global proposition.

### 105D — rules/reference experience

Goal: connect profile architecture to a useful public rules layer.

Consumes #91, #72 and #95.

Scope:

- `/rules` hub;
- `/rules/british`;
- `/rules/western` with explicit provisional ordinary-rule status;
- `Which Mahjong rules do I play?` diagnostic;
- preserve `/mahjong-rules-compared` rather than duplicate it;
- scorer/reference deep links to the most specific useful rule explanation;
- distinguish **what rules are being described** from **whether Mahjong Reference can score them**;
- profile/source/provenance detail progressively disclosed rather than forced into table UI.

### 105E — game tracker and settlement experience

Goal: make `/game` visibly deserve the Table Companion proposition.

Consumes the product/content side of #116.

Scope:

- treat `/game` as a primary product workspace;
- make game state, current rules, East/Wind progression, running totals, settlement and history easier to understand at the table;
- add/expand `/mahjong-settlement` as the canonical settlement explainer;
- connect `/hand` ↔ settlement ↔ `/game` ↔ rules deliberately;
- reuse engine-backed examples instead of duplicating arithmetic in prose;
- preserve rules-specific settlement differences.

### 105F — consolidation and table-use polish

Goal: remove stale product stories and make the whole public experience coherent.

Scope:

- reconcile Help / How it works / About with the multi-profile product truth;
- decide the future of `/features` based on whether it retains a distinct user job;
- mobile/table readability and interaction pass;
- incorporate #89 / 10 October observations as refinements, not architecture blockers;
- remove stale British-only claims where the route is now product-wide while preserving explicitly British pages.

After this phase:

- #48 PWA/offline becomes high-value Table Companion hardening;
- #44 lightweight product insight becomes useful because there is now a coherent journey worth measuring.

## Related issue map

Bring into this transformation:

- #91 — Rules hub/reference: core child stream of 105D.
- #116 — Full-game/settlement acquisition: core child stream of 105E.
- #49 — Beginner entry: absorb into 105C.
- #50 — Readability: cross-cutting acceptance criterion from 105C onward.
- #95 — Exact rule deep links: absorb into 105D.
- #72 — Western/Australian discoverability: reframe beneath the Western rules/reference work; old assumptions that no Western scorer exists are now stale.

Keep parallel/separate:

- #89 — broader cross-profile validation + October field validation; refines the frontend but does not block it.
- #121 — T&M ordinary-rule evidence gate; Western remains public and truthfully provisional meanwhile.
- #51 — architecture umbrella housekeeping; update stale #87/#88 completion state and close when its remaining validation conditions are satisfied.

Follow after the core transformation:

- #48 — PWA/offline/installability.
- #44 — privacy-minimal product insight/feedback.

Park during this phase:

- #7 shared tile inventory;
- #8 photo recognition;
- #17 solo play;
- #60 screenshot polish;
- #66–#70 video production;
- #71 Playing for Pennies;
- #79 book exploration.

These may benefit from the transformed product later but should not consume current implementation/review capacity.

## Work allocation and limits

### ChatGPT / product-analysis role

Own:

- repository archaeology/audit;
- product and information architecture;
- issue consolidation;
- rules/SEO/GEO/content reasoning;
- implementation briefs;
- PR review against product and architecture intent;
- keeping this document and the umbrella issue current.

Do not spend Codex budget on discovery that can be done from the repository directly.

### Codex role

Use as a bounded implementation engine.

Each Codex task should have:

- one small slice;
- explicit files/surfaces likely involved;
- acceptance criteria;
- mobile/tablet/desktop checks for visual work;
- tests/build/typecheck requirements;
- explicit non-goals;
- one PR left open/unmerged for review.

Avoid prompts such as "redesign the site" or "work out the rules UX".

### Human/product-owner role

Reserve decisions for product judgement, wording/taste and real-table usability.

Target a small number of meaningful sign-off points rather than many low-level implementation decisions.

## Delivery rhythm

For each slice:

```text
Audit / define
→ human sign-off on genuine product choices
→ record decision here / in issue
→ narrow Codex implementation brief
→ one PR
→ live review
→ amend same PR if needed
→ merge
```

Avoid parallel frontend branches unless they truly do not touch shared shell/navigation/metadata/state. Frontend transformation has more shared surface than the rules-catalogue work did.

## Visual acceptance standard

Any significant frontend PR should be reviewed at minimum at:

- ~390px mobile;
- tablet width;
- desktop.

Essential gameplay, rule context, errors and helper text must not rely on tiny typography. Small uppercase/mono labels may remain decorative, but important explanatory text should be comfortably readable beside a physical Mahjong table.

## SEO / GEO principles

Keep product positioning separate from acquisition language.

Positioning:

> **Mahjong Reference — your table companion for the whole game.**

Acquisition remains concrete and route-specific, e.g.:

- British Mahjong scoring calculator;
- Western Mahjong scoring;
- Mahjong hand calculator;
- Mahjong game tracker;
- Mahjong settlement;
- who pays whom in Mahjong;
- British Mahjong rules;
- Western Mahjong rules;
- which Mahjong rules do I play.

Core principles:

> **Search for the problem. Arrive at the table companion.**

> **Answer the question directly. Name the rules context. Show the evidence. Then offer the interactive tool.**

Do not flatten British/BMJA pages into generic Western pages. Preserve established British intent while broadening the global brand story.

## Explicit non-goals for #105

- new scoring grammars;
- new catalogue expansion;
- universal custom-rules editor;
- forcing Riichi/MCR/American into the British/Western-family engine;
- changing rules to satisfy SEO copy;
- gratuitous route/framework rewrite;
- React Router/Next.js migration merely for IA work;
- photo recognition;
- shared physical table tile inventory;
- solo/bot gameplay;
- cash settlement/Playing for Pennies;
- book/video production;
- exposing internal profile/version IDs as primary UI.

## Completion condition

The transformation is complete when a visitor can understand and use Mahjong Reference as one coherent product:

- they know it is free and usable without signup;
- they can choose the rules they actually play where supported;
- active rules are always visible in scoring/game contexts;
- they can score one hand or track a whole game without confusing the two jobs;
- settlement and "who pays whom" are understandable and linked to the game flow;
- they can identify/compare rules and see whether scorer support is available;
- beginner learning remains easy to find;
- British search equity is preserved;
- Western support is public but honestly provisional where appropriate;
- named-club support exists without overclaiming public permission;
- mobile/table use is readable and calm;
- the frontend no longer understates or contradicts the rules-aware engine beneath it.
