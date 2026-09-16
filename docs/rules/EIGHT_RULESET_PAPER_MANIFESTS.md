# Eight-ruleset paper manifests

Status: **architecture acceptance input for PR #226 / issue #227**  
Date: 2026-09-16  
Purpose: prove that the proposed universal rules-profile envelope can describe eight materially different Mahjong profiles without pretending they share one scoring grammar.

These are **paper manifests**, not executable profiles and not source-of-truth implementations. They deliberately use `research-required` where the external corpus does not justify a production value. Production profiles must bind to the project's formal/primary source register.

## 1. Acceptance rule

The universal envelope passes this paper test only if every manifest can be represented without:

- adding profile-specific executable callbacks to the envelope;
- adding fields from an incompatible scoring grammar;
- hard-coding four players, 136/144 tiles, four sets + pair, dealer retention, or a Classical score result as platform invariants;
- inventing a universal expression DSL;
- losing version/provenance information needed for deterministic replay.

Each manifest therefore identifies:

- table/player model;
- tile-set model;
- hand-shape model;
- scoring grammar;
- family-specific scoring/configuration components;
- evidence requirements;
- settlement strategy;
- progression/game-end strategy;
- variant controls;
- provenance/readiness state.

## 2. Paper manifest envelope

The examples below use this conceptual shape:

```yaml
identity:
  id: string
  version: string
  familyId: string
  grammar: classical-points-doubles | pattern-accumulator | riichi-han-fu | target-catalogue
  status: external-paper-test

table:
  playerCount: number
  seatModel: strategy-id

tileSet:
  preset: registry-id
  options: {}

handShape:
  preset: registry-id
  options: {}

scoring:
  grammar: same discriminator as identity.grammar
  config: family-specific serialisable data / strategy references

evidence:
  required: [registry ids]
  conditional: [registry ids]

settlement:
  preset: registry-id
  params: {}

progression:
  preset: registry-id
  params: {}

gameEnd:
  preset: registry-id
  params: {}

variantControls:
  - field/rule ids valid only within the compatible family/grammar

provenance:
  architectureSource: external corpus locator
  implementationAuthority: source-register-id | research-required
  confidence: architecture-only | source-pinned
```

The exact TypeScript names are deliberately not fixed here. The semantic separation is the contract.

---

# 3. European Classical — Mahjong Time external profile

```yaml
identity:
  id: mt-european-classical
  version: paper-2026-09-16
  familyId: classical-western
  grammar: classical-points-doubles
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.classical-winds-4

tileSet:
  preset: tiles.standard-136
  options:
    bonusTiles: research-required

handShape:
  preset: shape.four-sets-pair
  options:
    irregularCatalogue: profile-special-bindings

scoring:
  grammar: classical-points-doubles
  config:
    intrinsicTable: classical-standard-compatible
    ordinaryRuleBindings: profile-data
    specialHands: profile-catalogue
    limitPolicy: profile-value
    pureSuitPredicate: pattern.pure-suit-any-standard-meld

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
  conditional:
    - evidence.wait-shape

settlement:
  preset: settlement.classical-pairwise
  params:
    eastMultiplier: 2
    loserToLoser: true

progression:
  preset: progression.rotate-every-hand
  params: {}

gameEnd:
  preset: game-end.four-wind-rounds
  params: {}

variantControls:
  - classical.limit
  - classical.bonus-rules
  - classical.double-rules
  - classical.special-catalogue
  - classical.flower-season-policy
  - progression.preset

provenance:
  architectureSource: https://www.mahjongtime.com/european-classical-mahjong-rules.html
  implementationAuthority: research-required
  confidence: architecture-only
```

**Envelope result:** clean fit inside `ClassicalProfileConfigV1` plus a non-BMJA progression preset. No new scoring grammar.

---

# 4. Hong Kong / Cantonese — Mahjong Time external profile

Mahjong Time's scoring page describes a fan system, acknowledges scoring variation, and notes commonly imposed minimum-fan requirements. The paper manifest therefore treats the exact Hong Kong profile as one named configuration, not generic truth for all Cantonese tables.

```yaml
identity:
  id: mt-hong-kong
  version: paper-2026-09-16
  familyId: hong-kong-cantonese
  grammar: pattern-accumulator
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.winds-4

tileSet:
  preset: tiles.flowers-144-capable
  options:
    flowersSeasons: profile-configurable

handShape:
  preset: shape.four-sets-pair
  options:
    irregularCatalogue: profile-pattern-bindings

scoring:
  grammar: pattern-accumulator
  config:
    unit: fan
    patternCatalogue: hk-profile-bindings
    interactionPolicy: interaction.hk-profile
    qualificationPolicy:
      kind: minimum-value
      minimumFan: profile-configurable
    postQualificationBonuses: profile-configurable
    valueConversion: conversion.hk-fan-payment-table
    capPolicy: profile-configurable

evidence:
  required:
    - evidence.winning-method
    - evidence.seat-wind
    - evidence.round-wind
  conditional:
    - evidence.flower-season-ownership
    - evidence.last-wall
    - evidence.rob-kong
    - evidence.replacement-tile
    - evidence.liable-player

settlement:
  preset: settlement.hk-profile
  params:
    conversionTable: profile-versioned

progression:
  preset: progression.hk-profile
  params: research-required

gameEnd:
  preset: game-end.hk-profile
  params: research-required

variantControls:
  - pattern.minimum-fan
  - pattern.catalogue-membership
  - pattern.values
  - flower-season-policy
  - conversion-table
  - cap-policy
  - dealer-continuation-policy
  - liability-policy

provenance:
  architectureSource: https://www.mahjongtime.com/hong-kong-mahjong-scoring.html
  implementationAuthority: research-required
  confidence: architecture-only
```

**Envelope result:** clean `pattern-accumulator` fit, but demonstrates that qualification and payment conversion are separate policies rather than fields in a Classical scorer.

---

# 5. Chinese Official / MCR — WMO/EMA family

The repo already pins the intended implementation authority separately. Mahjong Time is used here only as an external architecture cross-check: 81 scoring combinations, additive points, an 8-point legal threshold, Flowers outside that threshold, and no dealer repeat/payment multiplier.

```yaml
identity:
  id: mcr-wmo-2006
  version: paper-0.x
  familyId: mcr
  grammar: pattern-accumulator
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.winds-4

tileSet:
  preset: tiles.flowers-144
  options: {}

handShape:
  preset: shape.four-sets-pair
  options:
    irregularCatalogue: mcr-permitted-special-shapes

scoring:
  grammar: pattern-accumulator
  config:
    unit: fan-points
    patternCatalogue: mcr-81-fan
    interactionPolicy: interaction.mcr-2006
    qualificationPolicy:
      kind: minimum-qualifying-subtotal
      minimum: 8
      excludedFromThreshold:
        - bonus.flowers
    postQualificationBonuses:
      - bonus.flowers
    capPolicy: mcr-profile

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
    - evidence.seat-wind
    - evidence.round-wind
  conditional:
    - evidence.wait-shape
    - evidence.rob-kong
    - evidence.last-tile

settlement:
  preset: settlement.mcr-2006
  params: {}

progression:
  preset: progression.always-pass-four-wind
  params: {}

gameEnd:
  preset: game-end.four-wind-rounds
  params: {}

variantControls:
  - none-until-source-versioning-policy-defined

provenance:
  architectureSource: https://www.mahjongtime.com/chinese-official-mahjong-scoring.html
  implementationAuthority: mcr-ema
  confidence: source-pinned-architecture
```

**Envelope result:** strong fit. Proves `PatternAccumulatorConfig` needs formal combination/exclusion policy and separate qualifying/post-qualification subtotals.

---

# 6. Taiwanese — Mahjong Time external profile

Mahjong Time explicitly requires five sets plus a pair from a 16-tile hand, uses additive pattern values, normally pays only the winner, and notes significant variation across Taiwanese scoring traditions.

```yaml
identity:
  id: mt-taiwanese
  version: paper-2026-09-16
  familyId: taiwanese-16-tile
  grammar: pattern-accumulator
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.winds-4

tileSet:
  preset: tiles.flowers-144
  options:
    bonusTiles: configurable
    deadWallSize: 16

handShape:
  preset: shape.five-sets-pair
  options:
    dealtConcealedTiles: 16
    winningStructuralTiles: 17
    irregularCatalogue: taiwanese-profile

scoring:
  grammar: pattern-accumulator
  config:
    unit: tai
    patternCatalogue: taiwanese-profile-bindings
    interactionPolicy: interaction.taiwanese-profile
    qualificationPolicy: profile-specific
    capPolicy: optional-table-cap

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
  conditional:
    - evidence.flower-season-ownership
    - evidence.initial-hand-event
    - evidence.ready-declaration

settlement:
  preset: settlement.taiwanese-winner-only
  params:
    selfDraw: each-loser-pays-winner
    discard: discarder-only-pays

progression:
  preset: progression.taiwanese-profile
  params: research-required

gameEnd:
  preset: game-end.taiwanese-profile
  params: research-required

variantControls:
  - flower-season-policy
  - tai-pattern-membership
  - tai-values
  - cap-policy
  - payment-policy
  - dealer-repeat-policy
  - special-event-rules

provenance:
  architectureSource: https://www.mahjongtime.com/mahjong-taiwanese-rules.html
  implementationAuthority: research-required
  confidence: architecture-only
```

**Envelope result:** critical pass. Proves player count and scoring grammar are not enough: hand shape itself must be profile-owned.

---

# 7. Riichi — Mahjong Time competition-style external profile

Mahjong Time's Riichi scoring separates yaku/dora han from fu, rounds fu, uses hand-value tiers/payment tables, adds honba/counters, and routes riichi deposits separately. This requires a dedicated grammar result rather than a generic pattern sum.

```yaml
identity:
  id: mt-riichi
  version: paper-2026-09-16
  familyId: riichi
  grammar: riichi-han-fu
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.riichi-winds-4

tileSet:
  preset: tiles.riichi-136
  options:
    redFives: profile-configurable

handShape:
  preset: shape.four-sets-pair
  options:
    irregularCatalogue:
      - pattern.seven-pairs
      - pattern.thirteen-orphans
      - profile-yakuman-shapes

scoring:
  grammar: riichi-han-fu
  config:
    yakuCatalogue: riichi-profile-yaku
    yakumanCatalogue: riichi-profile-yakuman
    doraModules:
      - dora.normal
      - dora.kan
      - dora.ura-if-riichi
      - dora.aka-if-enabled
    fuPolicy: fu.riichi-profile
    limitTierPolicy: limits.riichi-profile
    handValueTable: payments.riichi-base

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
    - evidence.open-closed-state
    - evidence.seat-wind
    - evidence.round-wind
  conditional:
    - evidence.riichi-declaration
    - evidence.dora-indicators
    - evidence.ura-dora-indicators
    - evidence.honba
    - evidence.riichi-sticks
    - evidence.furiten
    - evidence.wait-shape
    - evidence.first-turn-event

settlement:
  preset: settlement.riichi-four-player
  params:
    multipleWinnerPolicy: profile-configurable

progression:
  preset: progression.riichi-renchan
  params: profile-configurable

gameEnd:
  preset: game-end.riichi-profile
  params: profile-configurable

variantControls:
  - riichi.kuitan
  - riichi.atozuke
  - riichi.red-fives
  - riichi.multiple-ron
  - riichi.abortive-draws
  - riichi.bankruptcy
  - riichi.yakuman-options
  - riichi.renchan
  - riichi.game-length

provenance:
  architectureSource: https://www.mahjongtime.com/mahjong-japanese-scoring.html
  implementationAuthority: research-required-formal-riichi-edition
  confidence: architecture-only
```

**Envelope result:** dedicated `riichi-han-fu` grammar required; canonical structural predicates remain reusable where exact equivalence is proved.

---

# 8. Sanma — Mahjong Time three-player Riichi profile

Mahjong Time exposes Sanma as a dense variant configuration: three players, East/South/West seats, 108 tiles, no Chii, red fives, ura/kandora, North nuki-dora, multiple-Ron choices, bankruptcy, renchan, abortive-draw choices and yakuman options.

```yaml
identity:
  id: mt-sanma
  version: paper-2026-09-16
  familyId: riichi-sanma
  grammar: riichi-han-fu
  status: external-paper-test
  basePreset: mt-riichi@paper-2026-09-16

table:
  playerCount: 3
  seatModel: seats.riichi-sanma-east-south-west

tileSet:
  preset: tiles.sanma-108
  options:
    redFives: 3
    nukiDoraTile: north
    deadWallSize: 18

handShape:
  preset: shape.four-sets-pair
  options:
    calls:
      chii: false
    irregularCatalogue: riichi-sanma-profile

scoring:
  grammar: riichi-han-fu
  config:
    yakuCatalogue: sanma-profile-yaku
    yakumanCatalogue: sanma-profile-yakuman
    doraModules:
      - dora.normal
      - dora.kan
      - dora.ura
      - dora.aka
      - dora.nuki-north
    fuPolicy: fu.riichi-compatible
    limitTierPolicy: limits.sanma-profile
    handValueTable: payments.sanma-profile

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
    - evidence.open-closed-state
    - evidence.seat-wind
  conditional:
    - evidence.riichi-declaration
    - evidence.dora-indicators
    - evidence.ura-dora-indicators
    - evidence.nuki-dora-count
    - evidence.honba
    - evidence.riichi-sticks
    - evidence.furiten
    - evidence.abortive-draw-reason
    - evidence.liable-player

settlement:
  preset: settlement.riichi-sanma
  params:
    doubleEastTsumoPayment: false
    doubleRon: true
    tripleRon: profile-value

progression:
  preset: progression.riichi-sanma-renchan
  params:
    dealerRepeatsOnWin: true
    dealerRepeatsOnTenpaiDraw: true

 gameEnd:
  preset: game-end.riichi-sanma
  params:
    bankruptcy: true
    lastDealerLeadEnd: true

variantControls:
  - table.player-count
  - tile-set.sanma
  - call.chii
  - riichi.kuitan
  - riichi.atozuke
  - riichi.red-fives
  - riichi.ura-dora
  - riichi.kan-dora
  - sanma.nuki-dora
  - riichi.multiple-ron
  - riichi.bankruptcy
  - riichi.renchan
  - riichi.abortive-draws
  - riichi.yakuman-options

provenance:
  architectureSource: https://www.mahjongtime.com/Mahjong-sanma-rules.html
  implementationAuthority: research-required-named-sanma-profile
  confidence: architecture-only
```

**Envelope result:** decisive variant proof. Sanma should compile from the Riichi family plus profile modules/overrides, not fork the Riichi scorer.

---

# 9. Zung Jung v1.03 — Mahjong Time external profile

Mahjong Time documents 44 patterns, additive values, same-series exclusion, no minimum, a 1-point floor for a zero-pattern winning hand, a 320-point compound limit, listed-limit handling, and a dedicated payoff scheme.

```yaml
identity:
  id: mt-zung-jung-1.03
  version: paper-2026-09-16
  familyId: zung-jung
  grammar: pattern-accumulator
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.winds-4

tileSet:
  preset: tiles.standard-136
  options: {}

handShape:
  preset: shape.four-sets-pair
  options:
    irregularCatalogue: zung-jung-category-10

scoring:
  grammar: pattern-accumulator
  config:
    unit: points
    patternCatalogue: zung-jung-44
    interactionPolicy: interaction.same-series-highest-only
    qualificationPolicy:
      kind: none
    zeroPatternFloor:
      value: 1
    capPolicy:
      compoundCap: 320
      listedLimit: highest-listed-pattern-only

evidence:
  required:
    - evidence.winning-method
    - evidence.winning-tile-provenance
  conditional:
    - evidence.responsible-discarder
    - evidence.same-turn-discard-history

settlement:
  preset: settlement.zung-jung-formal
  params:
    fixedWinnerIncomeMultiplier: 3
    standardSmallHandThreshold: 30

progression:
  preset: progression.always-pass
  params: {}

gameEnd:
  preset: game-end.zung-jung-profile
  params: research-required

variantControls:
  - pattern-catalogue-version
  - settlement-competition-profile

provenance:
  architectureSource: https://www.mahjongtime.com/mahjong-WSOM-scoring.html
  implementationAuthority: research-required-zung-jung-primary
  confidence: architecture-only
```

**Envelope result:** strong `pattern-accumulator` proof. Demonstrates interaction policy, floor, cap and settlement must be independently pluggable.

---

# 10. American / NMJL-style — annual target catalogue

Mahjong Time identifies its American style as NMJL rules. NMJL states that American play uses an annually changed Standard Hands card, Jokers, Charleston, and Joker substitution in larger groups. The current 2026 card is sold separately. The platform must therefore separate **engine capability** from **catalogue distribution/licensing**.

```yaml
identity:
  id: american-nmjl-style
  version: paper-2026
  familyId: american-nmjl
  grammar: target-catalogue
  status: external-paper-test

table:
  playerCount: 4
  seatModel: seats.american-4

tileSet:
  preset: tiles.american-joker-capable
  options:
    jokerCount: source-versioned

handShape:
  preset: shape.target-catalogue
  options:
    catalogueRef: external-versioned-card

scoring:
  grammar: target-catalogue
  config:
    catalogueRef: nmjl-card-version
    targetMatcher: matcher.american-card
    jokerPolicy: joker.nmjl-versioned
    exposurePolicy: exposure.nmjl-versioned
    targetValues: catalogue-owned

evidence:
  required:
    - evidence.exposure-state
    - evidence.joker-substitution
    - evidence.winning-target
  conditional:
    - evidence.winning-method

settlement:
  preset: settlement.american-profile
  params: research-required

progression:
  preset: progression.american-profile
  params: research-required

gameEnd:
  preset: game-end.american-profile
  params: research-required

handMode:
  preset: table-mode.charleston-reference
  params:
    enforcementInScorerV1: false

variantControls:
  - catalogue.version
  - joker-policy-version
  - house-rules-only-where-family-schema-allows

provenance:
  architectureSource:
    - https://www.mahjongtime.com/mahjong-american-style-rules.html
    - https://www.nationalmahjonggleague.org/game.aspx
  implementationAuthority: licensed-or-user-provided-catalogue-strategy-required
  confidence: architecture-only
```

**Envelope result:** clean universal-envelope fit only if the target catalogue is a first-class grammar and versioned data source. Do not force American hands into the canonical fixed-pattern catalogue used by MCR/Riichi/Classical.

---

# 11. Cross-manifest conclusions

## 11.1 Platform fields justified by all eight

The paper manifests justify a universal envelope containing, at minimum:

- identity/version/provenance;
- `familyId`;
- scoring `grammar` discriminator;
- table/player/seat model;
- tile-set reference/configuration;
- hand-shape reference/configuration;
- family-specific scoring config union;
- evidence requirements;
- settlement strategy;
- progression strategy;
- game-end strategy;
- optional incident/table-mode strategy references;
- resolved immutable snapshot/fingerprint.

## 11.2 What must remain family-specific

Do **not** lift these into universal scalar fields:

- Classical base points/doubles;
- Hong Kong fan conversion;
- MCR 8-point qualification/non-combination rules;
- Taiwanese tai catalogue;
- Riichi yaku/han/fu/dora/tier logic;
- Zung Jung same-series exclusion/320 handling;
- American annual target catalogue/Joker semantics.

They belong to grammar/family config branches.

## 11.3 What should be shared where structurally proven

The strongest reusable banks are:

- tile identities;
- set/group representation;
- seat/round context;
- winning source/event facts;
- exposure/concealment facts;
- canonical structural predicates such as Big Three Dragons, Big Four Winds, Seven Pairs, Thirteen Orphans and Nine Gates where exact equivalence is source-proven;
- generic payment transactions;
- deterministic profile resolution/versioning.

## 11.4 Variant model passes the paper test

The eight profiles support the intended rule:

> variant = exact compatible base profile + schema-approved overrides + resolved immutable snapshot

Sanma is the strongest proof because many differences are ordinary profile switches around a Riichi-family grammar rather than a new scorer.

## 11.5 Remaining architecture questions before runtime work

These are bounded and should become explicit design/fixture decisions in #227 rather than being discovered accidentally during scorer work:

1. exact TypeScript discriminated-union shape for the universal envelope;
2. whether tile-set and hand-shape registries are resolved IDs or fully embedded snapshots at runtime;
3. common `HandScoreResult` top-level fields shared across grammars;
4. strategy parameter validation/versioning;
5. provenance representation on profile fields/rule bindings;
6. canonical pattern identity/version lifecycle;
7. exact `requiredEvidence()` interface;
8. profile-owned game-end interface;
9. compatibility metadata used to expose safe Plus variant controls;
10. how external/licensed target catalogues are referenced without storing prohibited content.

None of these requires implementing all eight scoring engines.

---

# 12. Gate for #227 / #219

Before calling the universal envelope ready, implement or fixture-test the following **without implementing full MCR/Riichi/American scorers**:

- all eight paper manifests validate against one envelope schema;
- Classical config nests cleanly under the envelope;
- `pattern-accumulator`, `riichi-han-fu`, and `target-catalogue` can exist as typed placeholder branches with no fake scoring implementation;
- 3-player Sanma + 108-tile tile set validates;
- Taiwanese 5-set+pair validates;
- cross-grammar override attempts fail closed;
- one canonical predicate can bind to profile-local values across at least Classical/MCR/Riichi paper fixtures;
- settlement/progression/game-end strategy IDs validate independently of scoring grammar;
- profile fingerprint changes when any score-relevant config changes;
- `requiredEvidence()` can differ between European Classical, MCR, Riichi and Sanma paper profiles.

If those tests pass, #219 can implement Buzzard as the first executable family proof without baking Classical assumptions into the platform boundary.