# Mahjong Competition Rules (MCR) — implementation / compatibility crosswalk

Status: **architecture-ready, scoring-corpus transcription still required before coding all fan**  
Issue: #176

## Pinned implementation authority

Initial target:

> **World Mahjong Organization, _Mahjong Competition Rules_, 2006 (“Green Book”), English edition distributed/referenced by the European Mahjong Association.**

Source register ID: `mcr-ema`  
EMA rules page: https://mahjong-europe.org/portal/index.php?Itemid=167&id=31&option=com_content&view=article  
English rulebook: https://mahjong-europe.org/portal/images/docs/mcr_EN.pdf

The EMA page identifies the 2006 WMO Green Book as the detailed MCR rules authority. If a later formal WMO/EMA edition is deliberately adopted, that must be a **new rules-profile version**, not a silent replacement.

Working profile identity:

```text
mcr-wmo-2006@0.x
```

Final `1.0` is gated by complete source-linked fan/combination fixtures.

## Executive compatibility decision

MCR is **not** a classical-profile configuration.

It can reuse substantial shared Mahjong primitives, but its scoring and settlement require a separate strategy:

```text
shared tiles / structural evidence / canonical predicates
                     ↓
              MCR fan evaluator
       + combination/exclusion policy
       + legal 8-point threshold
                     ↓
              MCR hand value
                     ↓
             MCR settlement
```

Do not route MCR through `base points → doubles → limit`.

## Formal source facts that drive architecture

The pinned rules establish, among other things:

- a 144-tile set including eight Flowers;
- ordinary four-sets-plus-pair hands plus permitted special winning structures;
- a declared win must satisfy structural legality and at least **8 fan points**;
- Flower points are bonus points and do not make an otherwise sub-8 hand legal;
- Basic Points are the sum of valid fan under MCR scoring/combination principles;
- a discard win charges all non-winners the fixed 8-point component, with the discarder additionally responsible for Basic Points;
- a self-drawn win charges each non-winner 8 + Basic Points;
- dealer/East does **not** repeat merely because East wins; dealer passes after the hand;
- a complete game uses four wind rounds in the formal competition model;
- penalties/procedure exist separately from ordinary hand value.

These facts are sufficient to decide the major software boundaries. Exact executable fan definitions and exclusions still bind to the full rulebook during scorer implementation.

## Current platform baseline

Useful existing pieces:

- stable suit/Wind/Dragon tile identities;
- Flower/Season bonus-tile representation (MCR will use the Flower concept but needs profile-specific naming/semantics);
- Chow/Pung/Kong/pair structural groups;
- exposed/concealed group state;
- ungrouped tiles for irregular special hands;
- winning-tile and win-event evidence;
- canonical pattern detector layer;
- versioned `RulesProfileRef`;
- transaction-based settlement output;
- ruleset-level scoring/settlement/progression strategy hooks;
- replay-oriented saved-game architecture.

Current classical assumptions that MCR must **not** inherit:

- `ScoreBreakdown` is shaped around points/doubles/classical special hands;
- current `GameRuleset` expects that breakdown shape;
- current BMJA settlement scores every player's hand and performs loser-to-loser difference payments;
- current BMJA progression repeats East on an East win/draw;
- current fixed incident/transaction reason unions are British/club shaped;
- game completion logic currently assumes the BMJA prevailing-wind cycle inside orchestration rather than a completely profile-owned end condition.

## Compatibility matrix

| MCR domain | Existing fit | Decision |
|---|---|---|
| 4 players | Direct | Reuse |
| suited/honour tile IDs | Direct | Reuse |
| Flowers | Structural concept exists | Reuse base tile capability; MCR-specific replacement/value rules |
| Chow/Pung/Kong/pair | Direct | Reuse structural evidence |
| exposed/concealed | Direct | Reuse |
| ordinary 4 sets + pair | Direct concept | Reuse |
| special winning structures | loose/canonical pattern layer exists | Reuse predicates only where exact structural identity is verified |
| win source: self-draw/discard/rob Kong/etc. | much of the evidence vocabulary exists | Reuse/extend event primitives |
| 81 named fan | no MCR value layer | **Build MCR profile bindings/evaluators** |
| additive fan total | incompatible with classical ScoreBreakdown | **Build separate scoring result grammar** |
| formal non-combination principles | no generic interaction graph suitable as-is | **Build MCR scoring policy/evaluator** |
| minimum 8-point legality | no analogous classical threshold | **Build MCR win-legality gate** |
| Flowers excluded from 8-point threshold | current bonus handling is classical | MCR-specific legality/value separation |
| discard settlement | transaction infrastructure reusable | **Build MCR settlement strategy** |
| self-draw settlement | transaction infrastructure reusable | **Build MCR settlement strategy** |
| no East payment multiplier | current transaction model encodes `eastMultiplier` | Generalise transaction representation; MCR emits neutral payments |
| no dealer repeat | current strategy hook exists | **Build MCR progression strategy** |
| four wind rounds | wind primitive exists | Profile-specific game-end/progression |
| claim priority | not a scoring concern; partial game-state support | Track only if Table Companion enforces live procedure |
| Kong/replacement | static group exists; lifecycle limited | MCR table strategy if actively tracked |
| penalties/fouls | fixed incident model insufficient | Separate procedure layer or generic profile-owned event payload |

## Scoring-result boundary

Do not stretch the existing classical `ScoreBreakdown` by adding MCR values to fields named `basePoints`, `doubles` and `limitApplied`.

Introduce a profile-discriminated scoring result at the platform boundary, conceptually:

```ts
type HandScoreResult =
  | { grammar: 'classical'; ... }
  | { grammar: 'mcr'; ... }
  | { grammar: 'riichi'; ... };
```

MCR's result should be able to explain at minimum:

```text
matched fan
+ value of each fan
+ exclusions/non-combinations applied
+ qualifying subtotal (for 8-point legality)
+ Flower/other post-qualification bonus points
+ Basic Points
+ legal / illegal win
+ source locators
```

This is an explanation/audit model, not only a number.

## Pattern reuse rule

Canonical predicates can be reused only for **tile structure**, not score semantics.

Examples likely to share structural detection with other profiles include Thirteen Orphans, Seven Pairs, Nine Gates, Big Three Dragons, Big Four Winds, Four Kongs, All Green, All Honours and All Terminals.

For every reused predicate, MCR still owns:

- MCR fan ID/name;
- point value;
- exact definition differences;
- exposure/concealment requirements;
- interaction/exclusion rules;
- event/context requirements;
- source locator.

A similarly named BMJA/Riichi pattern is not evidence of identical semantics.

## Fan-combination implementation

Do not model MCR as 81 independent checkboxes whose values are blindly summed.

The evaluator must be able to represent the formal scoring principles and explicit pattern relationships. Implementation may use a combination of:

- fan metadata (`implies`, `excludes`, `requires`, `cannotCombineWith`);
- evaluator-level rules for principles that are not clean pairwise relations;
- candidate interpretation enumeration when the same tiles can be grouped/scored differently;
- deterministic maximum lawful score selection where the rules require choosing among valid interpretations.

The full 81-fan inventory and source-linked non-combination corpus is a **pre-code data task**, not something Codex should infer from names.

## Settlement strategy

MCR hand value and MCR payment routing remain separate.

Conceptually, for Basic Points `x`:

```text
discard win:
  two non-discarding losers -> winner: 8 each
  discarder -> winner: 8 + x

self draw:
  each loser -> winner: 8 + x
```

The implementation must bind exact formulas/tests to the formal rulebook rather than this synopsis.

Do not reuse BMJA loser-to-loser difference settlement or East doubling.

## Progression strategy

MCR progression should not reuse `progressBmjaGame`.

The formal competition model passes dealer after each completed hand regardless of who won and uses a four-round East/South/West/North game structure.

This reveals an existing platform seam to improve before MCR implementation:

> **Game completion must become profile-owned rather than hard-coded around BMJA prevailing-wind progression in `game.ts`.**

The rules strategy should eventually decide both next table state and whether the game is complete.

## UI implications

MCR should not present British terminology such as `base points`, `doubles`, `limit` or loser hand scores.

A future MCR result UI should foreground:

- detected fan;
- fan points;
- why a fan did/did not combine;
- total qualifying fan;
- whether the 8-point win minimum is met;
- Flower bonus separately where relevant;
- discard vs self-draw payment route.

The hand-entry UI can reuse most tile/group capture but will need MCR-specific context/event questions.

## Source/data work remaining before scorer coding

The architecture is now decided, but the deterministic scoring corpus still requires:

1. enumerate all 81 fan with stable project IDs;
2. pin exact formal source locators for each definition/value;
3. transcribe explicit and principle-derived non-combinations;
4. record open/closed and event requirements;
5. capture the permitted special hand structures;
6. capture Flower/replacement behaviour;
7. capture claim/Kong/rob-Kong legality needed by a full Table Companion;
8. bind official/source examples into golden fixtures;
9. keep competition penalties/referee procedure separate from hand scoring.

Do this from the pinned Green Book, not the one-page summary sheet.

## Implementation sequence

1. source-linked 81-fan data corpus;
2. profile-discriminated score-result type;
3. MCR hand-shape + fan evaluator;
4. non-combination/qualification engine;
5. official golden scorer fixtures;
6. MCR settlement strategy;
7. MCR progression/game-end strategy;
8. MCR hand-entry/result UI;
9. full-game fixtures;
10. real MCR-player review.

## Build-size judgement

MCR reuses a lot of **Mahjong structure** but comparatively little of the **classical scoring engine**.

Expected shape:

- medium data/research effort because 81 fan and their interactions must be source-bound;
- medium-to-high deterministic scoring implementation;
- relatively small settlement maths;
- moderate progression/table UI work;
- no need to rebuild tiles, group capture, profile registry, local persistence or generic transaction infrastructure.

MCR is therefore a valuable second architecture proof after Buzzard: it proves that the platform can share Mahjong primitives while swapping the scoring grammar completely.
