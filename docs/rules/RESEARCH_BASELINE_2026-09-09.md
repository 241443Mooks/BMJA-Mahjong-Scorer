# Mahjong rules research baseline — 9 September 2026

This document preserves the main conclusions from the 9 September 2026 deep-research pass so that later implementation work has a stable evidence base.

It is intentionally a **research baseline**, not an implementation specification. Where evidence is incomplete, the uncertainty is recorded rather than filled in by assumption.

## Executive findings

### 1. BMJA is best modelled as a British standardisation within the wider Western/classical tradition

The current evidence supports the working view that British/BMJA Mahjong is not a wholly independent rules family. BMJA was created to standardise a British playing environment in which multiple Western/British traditions and home rules had proliferated.

The safe historical statement is:

> British/BMJA Mahjong is a standardised British branch of the wider Western/classical Mahjong tradition.

The evidence does **not** support saying that BMJA derives from Thompson & Maloney. BMJA predates their principal Western reference works.

### 2. Thompson & Maloney needs to be split into a rules source and a catalogue source

The research identified an important distinction:

- **The Game of Mah Jong Illustrated** — key Thompson & Maloney Western rules reference.
- **The Mah Jong Player's Companion** — supplementary reference/catalogue containing a very large illustrated special-hand collection and assuming prior knowledge of Western Mahjong.

The Companion is therefore valuable as a **catalogue/extension source**, but it should not by itself define the Western rules profile.

Before a Thompson & Maloney Western profile is treated as production-ready, the project should verify ordinary play, scoring, settlement, dealer/East rules, chow restrictions, exposure rules, Goulash and progression against the main rules book.

### 3. Outside the Box is a strong real-world hybrid profile

The Outside the Box guide supplied on 9 September 2026 is particularly useful because it explicitly distinguishes official British hands from hands drawn from other disciplines.

Its documented play appears to combine:

- a British/classical ordinary scoring core;
- official British/BMJA special hands;
- a substantial selection of Western special hands also present in Thompson & Maloney material;
- local doubling/penalty/liability conventions;
- local Goulash rules.

This makes Outside the Box an excellent future stress-test for a composable rules-profile architecture.

### 4. Many recurring hand patterns are shared across otherwise different rulesets

Several canonical hand structures recur across British, Western, Hong Kong, Riichi and MCR under different names and scoring systems. Examples include:

- Thirteen Orphans / Thirteen Unique Wonders / Kokushi Musou;
- Nine Gates / Gates of Heaven / Chuuren Poutou;
- Big Three Dragons / Three Great Scholars / Daisangen;
- Big Four Winds / Four Blessings / Daisuushii;
- Four Kongs / Fourfold Plenty / Suukantsu;
- All Honours;
- All Green;
- All Terminals;
- Seven Pairs;
- Heavenly Hand;
- Earthly Hand;
- replacement-tile wins;
- last-tile wins.

This strongly suggests that future architecture should separate a **canonical pattern predicate** from the way each rules profile names, values and restricts that pattern.

### 5. Scoring grammars are materially different across major disciplines

A universal "one scoring engine plus switches" model is unlikely to scale cleanly.

The research identified several distinct scoring grammars:

- **British / Western / Outside the Box** — base points, doublings and fixed-value special hands, including fishing values and loser-to-loser settlement in British-style play.
- **Hong Kong / Cantonese** — additive faan, then conversion/payment rules.
- **Japanese Riichi** — yaku/han + fu, followed by capped base-point and ron/tsumo payment calculations.
- **Chinese Official / MCR** — additive fan with a qualifying minimum and interaction/exclusion rules.
- **American / NMJL** — annually versioned exact target-hand catalogue with printed hand values, Jokers and Charleston mechanics.

These families can still share tile-state, pattern, liability and progression primitives, but they should not be forced through the same final scoring grammar.

## British / BMJA findings

The BMJA-approved British reference is sufficiently explicit to remain the canonical source for the existing scorer unless and until a different primary source is deliberately adopted.

Key properties of the current British profile include:

- 144-tile classical set including Flowers and Seasons;
- standard four-sets-plus-pair hand plus named special hands;
- maximum one Chow in ordinary play;
- classical intrinsic scoring for pungs, kongs, qualifying pairs and bonus tiles;
- 20 points for going Mahjong;
- doublings layered onto ordinary intrinsic score;
- normal 1,000-point limit;
- a finite BMJA-recognised special-hand catalogue;
- hand-specific exposed/concealed rules;
- explicit fishing values for special hands;
- winner settlement plus loser-to-loser settlement;
- East pays/receives double;
- Goulash after a draw.

A crucial implementation invariant for future refactoring is:

> Existing BMJA scoring and settlement outputs must remain numerically identical after any architecture change.

## Thompson & Maloney / Western findings

The Companion photographs supplied on 9 September 2026 provide strong evidence about Western special-hand scope, but incomplete evidence about the entire underlying ruleset.

Important observations from the Companion:

- more than 120 special hands are catalogued;
- the same hand can appear in multiple thematic indexes;
- winning/fishing values vary beyond a simple 500/1,000 pattern;
- visible values include 500/200, 1,000/400, 1,500/600 and 2,000/800;
- some hands are ordinary-calculation hands rather than fixed special values;
- hand identity therefore cannot be derived from a single category or score.

A particularly useful cross-profile example is **Three Great Scholars**:

- BMJA treats the hand as a limit hand;
- the Companion shows 1,500 winning / 600 fishing;
- the Outside the Box guide shows 1,000 / 400.

That demonstrates why a tile pattern must be separate from its profile-specific score binding.

The Companion also exposes a naming hazard: similar names can refer to genuinely different patterns. Fuzzy-name matching must never be allowed to merge hand identities without source-level verification.

## Outside the Box findings

The supplied guide documents a named club ruleset rather than a vague collection of verbal preferences.

The guide includes:

- British-style intrinsic scoring values for ordinary pungs/kongs/pairs/bonus tiles;
- official British hands alongside additional hands from other disciplines;
- additional Western-style special hands such as Windfall, Windy Ones, Windy Nines, Dragonfly, Wriggly Dragon, Green Jade, Red Coral, White Opal, Greta's Garden, Greta's Dragon, Greta's Garter, Red Lantern and others;
- separate winning/fishing values;
- exposure treatment for special hands;
- an explicit cannon/liability rule;
- a documented "No choice!" exception when fishing;
- penalties for tile-count errors, false declarations and wrongful claims;
- a local Goulash using four blank wild tiles, exchanges and no Chows.

The following questions remain for Rachel before any Outside the Box profile is considered version 1.0:

1. Do Little/Big Dragon and Little/Big Wind bonuses stack with individual set doubles, or replace them?
2. Where a special hand table distinguishes exposed half/full values, what is the exact exposure interpretation?
3. Are all non-BMJA hands taken unchanged from an established Western source, or have any been locally modified?
4. What is the exact order of cannon/liability settlement when more than one liability condition could apply?

## Major other disciplines

### Hong Kong / Cantonese

Hong Kong should be treated as a family with local variation. A future implementation should name a specific codified profile rather than expose a generic "Hong Kong" switch with undefined provenance.

Architecturally important features include:

- faan-based scoring;
- configurable/defined minimum thresholds;
- payment conversion after scoring;
- dangerous-discard/liability concepts;
- recurring canonical patterns shared with other Mahjong traditions.

### Japanese Riichi

A formal rules source such as the current World Riichi Championship rules is suitable for a versioned canonical profile.

Architecturally important features include:

- 136-tile set without Flowers/Seasons;
- at least one yaku required to win;
- han/yaku plus fu scoring;
- capped tiers and yakuman;
- ron/tsumo payment distinction;
- riichi deposits;
- tenpai/noten draw settlement;
- dealer continuation;
- furiten;
- pao liability for specified high-value hands.

Riichi tenpai is **not** equivalent to British/Western fishing and should not reuse that semantic field.

### Chinese Official / MCR

MCR provides a formal, highly structured scoring system and is a strong future comparison profile.

Architecturally important features include:

- 81 scoring combinations;
- additive fan;
- qualifying minimum fan;
- formal combination/exclusion interaction rules;
- high-value patterns shared with other disciplines;
- settlement rules distinct from British, Hong Kong and Riichi.

### American / NMJL

American Mahjong is substantially more distinct than the Western/British family.

Architecturally important features include:

- annually changing Standard Hands card;
- exact target-hand matching rather than a universal four-sets-plus-pair winning structure;
- Jokers;
- Charleston before ordinary play;
- card-defined values;
- annual versioning as a first-class requirement.

The annual NMJL card is a sold, copyrighted product. Mahjong Reference should not scrape or reproduce current card content without a lawful basis or permission. Any future American implementation needs a licensing/user-owned-card strategy.

## Product and architecture implications preserved from the research

The research supports a future composition model with at least these conceptual layers:

1. tile set and raw game state;
2. hand legality;
3. canonical pattern detection;
4. profile-specific pattern bindings;
5. scoring grammar;
6. ready-state logic;
7. settlement;
8. liability/penalties;
9. exchanges such as Goulash or Charleston;
10. progression/seat rotation;
11. source/provenance metadata;
12. immutable rules snapshot for saved games.

The most important rule is:

> A canonical hand pattern should not contain its score. The active rules profile should bind a score, local name, exposure policy and source provenance to that pattern.

## Recommended implementation order

The research recommended the following sequence:

1. source register and detailed provenance matrix;
2. reusable canonical pattern model;
3. BMJA migration onto the new profile architecture with zero behavioural change;
4. verified Thompson & Maloney Western baseline;
5. Thompson & Maloney Companion catalogue layer;
6. Outside the Box named club profile;
7. cross-profile golden test suite;
8. live validation at the 10 October 2026 Outside the Box session.

Other major disciplines should remain roadmap/documentation items until this first three-profile architecture is proven.

## Open evidence gaps

The largest current evidence gap is a complete primary-source Western rules reference covering the ordinary game.

Before certifying a Thompson & Maloney Western implementation, verify from **The Game of Mah Jong Illustrated** where possible:

- ordinary point scoring;
- doublings;
- permitted Chow count;
- exposure/concealment rules;
- settlement between winner and losers;
- loser-to-loser settlement, if any;
- East/dealer treatment;
- draw handling;
- Goulash;
- penalties/procedure;
- seat/round progression.

These unknowns should remain visible in the source register and future provenance matrix.
