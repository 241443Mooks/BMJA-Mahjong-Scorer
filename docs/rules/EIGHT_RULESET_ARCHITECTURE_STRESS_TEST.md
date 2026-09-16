# Eight-ruleset architecture stress test

Status: **pre-implementation architecture validation**  
Date: 2026-09-16  
Scope: use Mahjong Time's eight published ruleset families as an external stress test of Mahjong Reference's rules-platform design before widening runtime implementation.

## Why this document exists

The Classical/Western configuration work in `CLASSICAL_PROFILE_CONFIG_V1.md` has now survived BMJA, provisional Thompson & Maloney, Outside the Box, Buzzard 2000, and a blind European Classical paper test.

That is meaningful evidence for **one rules family**, but it is not evidence that Mahjong as a whole should be represented by one universal switchboard.

Mahjong Time currently exposes eight named rulesets:

1. American Mah Jongg;
2. Hong Kong Mahjong;
3. Chinese Official / MCR;
4. Taiwanese Mahjong;
5. Riichi Mahjong;
6. European Classical Mahjong;
7. Zung Jung Mahjong;
8. Sanma Mahjong.

This document asks a harder question:

> What architecture lets Mahjong Reference support all eight families, plus real variants inside those families, without either copying scorers or inventing one unsafe universal rule language?

The result is a platform architecture, not an implementation promise and not a claim that Mahjong Time is the canonical authority for every family. Mahjong Time is used here as a broad external corpus because it exposes materially different live rulesets in one product. Production profiles must still be pinned to appropriate primary/formal sources.

## Executive conclusion

Do **not** build one giant universal rule bank where every Mahjong rule is an interchangeable checkbox.

Do build:

> **one universal profile framework + shared Mahjong primitives + a small number of scoring grammars + family/profile configuration over those grammars.**

The current Classical/Western work should remain exactly what its name says: `ClassicalProfileConfigV1`. It should become the first family module inside a wider rules platform, not be stretched into Riichi, MCR or American semantics.

The eight Mahjong Time rulesets collapse naturally into approximately four scoring grammars:

```text
Shared Mahjong platform
│
├── Classical points × multipliers grammar
│   └── European Classical / BMJA / Western / club / Buzzard variants
│
├── Pattern-accumulator grammar
│   ├── Hong Kong fan + conversion table
│   ├── MCR additive fan + formal combination policy
│   ├── Taiwanese additive tai
│   └── Zung Jung additive points + series/limit policy
│
├── Riichi han + fu grammar
│   ├── formal Riichi profile
│   ├── Ari Ari variants
│   └── Sanma variants
│
└── Versioned target-catalogue grammar
    └── American / NMJL-style annual cards
```

This is a software taxonomy, not a claim of historical lineage.

The crucial architectural boundary is:

> **Configuration changes values, selections and supported finite policies inside a compatible grammar. A scoring grammar changes how a legal score is derived.**

---

# 1. Evidence from the eight-rule external corpus

## 1.1 European Classical

Mahjong Time's European Classical implementation remains close to the existing Classical/Western family: intrinsic set/pair values, additive winner bonuses, doubles, limit hands, East-sensitive settlement and conventional grouped hands.

The blind paper test in `MAHJONG_TIME_EUROPEAN_CLASSICAL_V1_TEST.md` found that the large majority of ordinary rules map to the merged Classical config vocabulary. The remaining findings were small reusable rules/policies rather than a new scoring grammar.

**Architecture classification:** `classical-points-doubles`.

**Variant pressure:** limits, bonus rules, Flower/Season treatment, special-hand catalogue, concealed-hand treatment, wait bonuses, progression, settlement.

## 1.2 Hong Kong / Cantonese

Mahjong Time describes a fan-based system. Its published profile includes pattern fan, configurable/practical minimum-fan conventions, Flowers/Seasons, self-draw/win-source fan and a fan-to-payment conversion table. Its own text also acknowledges that Hong Kong scoring is flexible and exists in well-liked variations.

This is not Classical `base points × 2^doubles`, even though many structural predicates overlap.

**Architecture classification:** `pattern-accumulator` with:

- unit `fan`;
- profile-specific pattern catalogue;
- minimum-fan qualification policy;
- fan-to-payment conversion table;
- Hong Kong settlement/progression strategies;
- optional Flower/Season module;
- possible liability/penalty policies.

**Variant pressure:** minimum fan, Flower use, catalogue differences, limits/payment conversion, dealer continuation, liability conventions, special-hand treatment.

## 1.3 Chinese Official / MCR

MCR uses a formally bounded catalogue of 81 scoring fan, additive point values, an 8-point legal-win threshold, Flower points outside that threshold and formal non-combination principles.

The existing `MCR_PROFILE_CROSSWALK.md` correctly concludes that MCR must not be routed through Classical scoring.

**Architecture classification:** `pattern-accumulator` with a **different combination policy** from Hong Kong:

- unit `points` / fan points;
- formal 81-pattern catalogue;
- combination/exclusion/implication policy;
- qualifying subtotal distinct from post-qualification Flower points;
- legal minimum threshold;
- MCR settlement;
- MCR progression/game-end strategy.

This is useful evidence that the pattern-accumulator engine must allow registered **combination policies**, not merely sum every matching pattern blindly.

## 1.4 Taiwanese

Mahjong Time's Taiwanese profile changes both hand shape and scoring. Players use a 16-tile dealt hand and win with **five sets plus a pair**, rather than four sets plus a pair. Scoring is additive `tai`; only the winner is paid, and discard/self-draw payment routing differs. The source explicitly notes significant variations in Taiwanese pattern scoring and that limits may be absent or table-agreed.

**Architecture classification:** `pattern-accumulator` plus a different hand grammar:

- `handShape = five-sets-plus-pair`;
- unit `tai`;
- additive pattern catalogue;
- optional/table limit;
- Taiwanese payment strategy;
- profile-specific Flowers/Seasons;
- profile-specific early-win/original-hand event evidence.

**Variant pressure:** Flower use, tai catalogue and values, limits, payment conventions, ready/original-hand rules and regional variants.

This proves that `four sets + pair` cannot remain a platform invariant.

## 1.5 Riichi

Mahjong Time's Riichi scoring uses yaku/dora han, fu/minipoints, rounding, tiered hand-value tables, ron/tsumo settlement, counters/honba and riichi deposits. Its Riichi pages and separate Ari Ari rules also expose variation such as red fives.

**Architecture classification:** `riichi-han-fu`.

The reusable part is the **predicate/evidence layer**, not the Classical or generic additive score arithmetic.

Required family concepts include:

- yaku eligibility catalogue;
- han values dependent on open/closed state where applicable;
- dora/ura/kan-dora/aka-dora counting;
- fu calculation;
- yakuman/limit tiers;
- ron/tsumo/dealer payment tables;
- honba/counter handling;
- riichi deposits;
- furiten/riichi evidence where legality is in product scope;
- multiple-winner policy;
- exhaustive/abortive draw and dealer-continuation policies.

## 1.6 Sanma

Mahjong Time's Sanma profile is especially valuable because it exposes variation as configuration-like data. It changes player count, seat winds, tile-set composition, dead wall, Chii availability, red fives, dora types, multiple-Ron policy, bankruptcy, dealer continuation, abortive draws, yakuman options and other Riichi-family switches.

**Architecture classification:** `riichi-han-fu` family variant, not a separate universal scoring grammar.

The important result is that a robust Riichi profile framework should support Sanma by changing:

- `playerCount` and seat set;
- `tileSetRef`;
- legal calls/actions relevant to scoring evidence;
- dora modules including nuki-dora;
- yaku/yakuman catalogue selections;
- settlement strategy/parameters;
- progression/game-end parameters;
- draw/incident policy IDs.

This is one of the strongest external proofs that **profile = modules + values + finite strategies** is the right long-term model.

## 1.7 Zung Jung

Mahjong Time publishes Zung Jung v1.03 as a 44-pattern additive scoring system. Patterns generally add, but multiple patterns in the same series cannot all count; there is a 320-point limit, listed-limit handling, a token score for a zero-pattern winning hand, and a distinctive payoff scheme. Dealer always passes and prevailing wind is not used for scoring.

**Architecture classification:** `pattern-accumulator` with:

- unit `points`;
- series-aware non-combination policy;
- direct additive values;
- token/chicken-hand floor;
- compound/listed limit policy;
- dedicated payoff strategy;
- always-pass progression.

This provides a second strong example, after MCR, of why additive pattern scoring needs a registered **interaction policy**, not merely `matchedPatterns.reduce(sum)`.

## 1.8 American / NMJL-style

Mahjong Time points American play to NMJL rules. The National Mah Jongg League currently sells a 2026 card and states that American play uses a card of Standard Hands which changes annually, uses Jokers, begins with the Charleston and uses Joker substitution in larger groups.

**Architecture classification:** `target-catalogue`.

The scoring/winning grammar is fundamentally different:

- exact/parametric target patterns from a versioned annual catalogue;
- Joker substitution restrictions;
- exposure/concealment/card semantics;
- card-defined values;
- annual catalogue identity as part of the profile version.

Charleston is a gameplay procedure rather than final-hand score mathematics, so Mahjong Reference can keep it in the reference/table-running layer unless product scope expands to active-play enforcement.

The engine and catalogue must be separated legally and technically. The platform may support a target-catalogue matcher without reproducing a sold current NMJL card without permission.

---

# 2. Universal platform model

The universal layer should not know BMJA, Riichi or MCR names. It should know only stable structural concepts and strategy interfaces.

## 2.1 Resolved profile envelope

Conceptually:

```ts
type ResolvedRulesProfile = {
  schemaVersion: number;
  identity: {
    id: string;
    version: string;
    status: 'published' | 'club' | 'provisional' | 'custom';
    familyId: string;
    grammar: ScoringGrammarId;
    basePreset?: RulesProfileRef;
  };

  table: TableConfig;
  tileSet: TileSetConfig;
  handShape: HandShapeConfig;
  validation: ValidationConfig;
  scoring: ScoringGrammarConfig;
  evidence: EvidenceConfig;
  settlement: StrategyConfig;
  progression: StrategyConfig;
  gameEnd: StrategyConfig;
  handMode?: StrategyConfig;
  incidents?: StrategyConfig[];
  provenance: ProfileProvenance;
};
```

The persisted runtime object is fully resolved and immutable. Authoring may use `base + overrides`, but scoring never follows a mutable inheritance chain.

## 2.2 Scoring grammar discriminated union

```ts
type ScoringGrammarConfig =
  | ClassicalScoringConfig
  | PatternAccumulatorConfig
  | RiichiScoringConfig
  | TargetCatalogueConfig;
```

Do not allow a custom profile to combine arbitrary fields from incompatible grammar branches.

### Classical

```text
intrinsic point table
+ additive bonuses
+ doubles/multipliers
+ special bindings
+ limit policy
```

### Pattern accumulator

```text
matched pattern bindings
+ interaction/combination policy
+ qualification policy
+ post-qualification bonuses
+ cap/floor/conversion policy
```

This one kernel can potentially host Hong Kong, MCR, Taiwanese and Zung Jung while keeping their policies separate and versioned.

### Riichi

```text
yaku eligibility
+ han sources
+ fu
+ limit tier
+ payment table/routing
+ table counters/deposits
```

### Target catalogue

```text
versioned target catalogue
+ substitutions/joker policy
+ exposure constraints
+ target value
```

---

# 3. The registries / “banks” we actually need

A single flat rule bank would become incoherent. The platform should expose several typed registries.

## 3.1 Tile-set registry

Examples:

- `tiles.standard-136`;
- `tiles.flowers-144`;
- `tiles.riichi-136`;
- `tiles.riichi-red-fives`;
- `tiles.sanma-108`;
- American tile-set preset with Jokers where lawfully sourced.

Fields may include tile identity, multiplicity, red/bonus/joker properties and excluded ranks.

## 3.2 Hand-shape registry

Examples:

- `shape.four-sets-pair`;
- `shape.five-sets-pair`;
- irregular canonical structures such as seven pairs / thirteen orphans where profile-legal;
- `shape.target-catalogue` for American.

Validation must consume the resolved hand-shape/profile rather than hard-code BMJA's one-Chow or four-set assumptions.

## 3.3 Canonical predicate registry

A predicate answers **what is structurally/event-wise true**, not what it scores.

Examples:

- `pattern.big-three-dragons`;
- `pattern.big-four-winds`;
- `pattern.seven-pairs`;
- `pattern.thirteen-orphans`;
- `pattern.nine-gates`;
- `condition.no-chows`;
- `condition.concealed-hand`;
- `wait.edge`;
- `wait.closed`;
- `wait.single`;
- `event.self-draw`;
- `event.rob-kong`;
- `event.last-wall`.

The same predicate can feed different profile-local score bindings only where structural equivalence is proven.

## 3.4 Pattern/rule binding registry

A profile binding owns:

- local name;
- predicate/pattern ID;
- enabled/disabled status;
- value/unit;
- exposure/open/closed variants;
- eligibility requirements;
- interaction series/category;
- source/provenance locator.

This is where Big Three Dragons can be a Classical limit hand, Hong Kong fan, MCR fan, Taiwanese tai pattern, Zung Jung point pattern or Riichi yakuman without copying the structural detector.

## 3.5 Evidence-field registry

Rules declare what facts they need from the physical table.

Examples:

- winning method;
- winning tile provenance;
- standing hand;
- original call / ready declaration;
- only possible tile;
- first-discard/initial-deal event;
- dora indicators;
- ura-dora eligibility/indicators;
- riichi declaration;
- honba/counters;
- riichi sticks;
- liable player;
- East consecutive wins;
- discard count / early-win evidence;
- nuki-dora count.

The scorer UI is derived from active requirements: if no enabled rule needs an evidence field, the UI does not ask for it.

## 3.6 Settlement strategy registry

Examples:

- `settlement.classical-pairwise`;
- `settlement.hk-fan-laak`;
- `settlement.mcr-2006`;
- `settlement.taiwanese-winner-only`;
- `settlement.zung-jung-formal`;
- `settlement.riichi-four-player`;
- `settlement.riichi-sanma`;
- American profile-specific settlement.

All strategies emit a common transaction result:

```text
from -> to -> amount -> reason
```

Hand value and payment routing remain separate.

## 3.7 Progression and game-end strategy registry

Examples:

- Classical East-retention cycle;
- rotate every hand;
- MCR four-round always-pass;
- Zung Jung always-pass cycle;
- Riichi renchan/honba/game-end policy;
- Sanma round/game-end policy.

Do not make “dealer progression” and “game complete?” global BMJA logic.

## 3.8 Incident / table-mode registry

Use registered finite components for unusual mechanics such as:

- BMJA/OTB Goulash;
- dangerous-discard/cannon/pao-like liability;
- false-win penalties;
- incorrect-hand consequences;
- abortive draw policies;
- optional house-rule modes.

Do not expose arbitrary user-authored executable formulas.

---

# 4. Variant architecture

Supporting a named ruleset is not enough. The profile model must expect variants from the beginning.

## 4.1 Authoring model

```text
exact named/versioned preset
+ allowed overrides
= custom/club/table profile
```

Examples:

```text
Riichi formal edition
+ red fives ON
+ kuitan ON
+ multiple Ron policy X
= Thursday Riichi
```

```text
Hong Kong named baseline
+ 3-fan minimum
+ Flowers ON
+ table-specific limit/conversion
= Club HK profile
```

```text
Taiwanese named baseline
+ Flowers OFF
+ 40-tai cap
+ local pattern-value overrides
= Family profile
```

## 4.2 Family/grammar compatibility gate

Overrides must be schema-validated against the profile's grammar/family capability declaration.

A user must not be able to create nonsense such as:

- `Riichi fu` on an NMJL target catalogue;
- a Classical bouquet multiplier on MCR;
- Sanma nuki-dora in BMJA;
- an annual card target inside Zung Jung.

Moving to another grammar should mean selecting another base family/profile, not toggling a hidden switch.

## 4.3 Published profile versus custom profile

Published profile:

- exact authority/source edition;
- reviewed immutable config;
- versioned fixtures;
- maintained release lifecycle.

Custom/club profile:

- user/club-owned name;
- base profile/version;
- allowed overrides;
- resolved immutable snapshot/fingerprint for every game;
- no claim of governing-body authority.

## 4.4 Variant capability metadata

Each configurable field should include metadata such as:

```text
field/rule ID
compatible grammar/families
control type
allowed values
advanced/basic
evidence dependency
requires/conflicts
source/help key
customisable yes/no
```

That metadata can eventually drive the Plus “How does your table play?” editor.

---

# 5. Eight-rule capability matrix

| Domain | American | Hong Kong | MCR | Taiwanese | Riichi | European Classical | Zung Jung | Sanma |
|---|---|---|---|---|---|---|---|---|
| Players | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **3** |
| Typical tile model | Jokers + card ecosystem | 136/144 | 144 | 144 | 136, optional red fives by profile | 136/bonus variants | 136 | **108** in MT profile |
| Ordinary grouped hand | card target | 4+pair | 4+pair | **5+pair** | 4+pair + specials | 4+pair + specials | 4+pair + 2 irregular | 4+pair + Riichi specials |
| Scoring grammar | target catalogue | fan + conversion | additive fan + combination rules | additive tai | han + fu | points × doubles | additive points + series rules | han + fu |
| Qualification gate | catalogue target | profile min fan | 8 qualifying points | profile rules | at least one yaku | Classical legality | no minimum | Riichi/Sanma policy |
| Interaction policy | target definition | profile-specific | formal non-combination | mostly additive/profile-specific | yaku/fu rules | Classical rule stacking | same-series exclusion | Riichi/Sanma |
| Settlement | American-specific | fan-laak/profile | MCR-specific | discard/self-draw winner-only | ron/tsumo + dealer/honba/sticks | Classical | formal payoff | Sanma Riichi variant |
| Progression | American-specific | East retention in MT profile | always pass | profile-specific | renchan | profile-specific Classical | always pass | renchan variant |
| Strong variant pressure | **annual card** | **high** | edition/version | **high** | **very high** | **high** | lower/formal | **very high** |

The architecture is robust only if all rows above are represented by profile modules/strategies rather than implicit assumptions in shared code.

---

# 6. What this means for the current codebase

The current code still contains platform assumptions that must not become permanent API contracts.

## 6.1 `validateHand`

Current BMJA assumptions such as a global one-Chow maximum must move behind resolved profile/hand-shape validation. Taiwanese also proves that group count must be profile-owned.

## 6.2 `ScoreBreakdown`

Do not extend Classical fields until they mean everything to everyone.

Use a discriminated platform result:

```ts
type HandScoreResult =
  | ClassicalScoreResult
  | PatternScoreResult
  | RiichiScoreResult
  | TargetCatalogueScoreResult;
```

Each variant still exposes common top-level fields where sensible:

- legal/valid;
- explanation entries;
- matched canonical patterns;
- source/provenance;
- final hand value representation;
- settlement input.

But it retains grammar-specific detail.

## 6.3 `GameRuleset`

The long-term runtime should be compiled from a resolved profile rather than hand-written once per named ruleset.

Conceptually:

```text
ResolvedRulesProfile
      ↓
compileProfile()
      ↓
RulesRuntime {
  validateHand
  scoreHand
  settleRound
  progressGame
  isGameComplete
  requiredEvidence
}
```

Named profiles are data/configuration plus registered strategy IDs.

## 6.4 `ScoringPolicy` callbacks

Current OTB callbacks are useful migration seams, but they should not be the normal authoring mechanism for future club profiles.

Known reusable conditions/rules become registry-backed selectors. Callbacks/strategies remain only for genuinely different finite semantics.

---

# 7. Architecture acceptance tests before calling the platform robust

Before claiming the rules platform is ready for broad multi-ruleset development, prove these **architecture fixtures**. They are not full scoring implementations of all eight.

## A. Profile resolution

- exact base version + overrides resolves deterministically;
- unknown fields/rule IDs fail closed;
- incompatible cross-grammar overrides fail;
- resolved profile is immutable/fingerprintable;
- old games replay after preset updates.

## B. Tile/table variation

- 4-player 136/144 profile;
- 3-player Sanma profile with removed tiles;
- red-five tile identity;
- bonus Flowers/Seasons on/off;
- Joker-capable tile type can exist without altering normal tile identity.

## C. Hand grammar variation

- standard 4 sets + pair;
- Taiwanese 5 sets + pair;
- irregular canonical hand;
- target-catalogue matching interface.

## D. Same canonical structure, different score grammar

Use one structurally equivalent pattern, e.g. Big Three Dragons, across at least:

- Classical profile;
- Hong Kong;
- MCR;
- Taiwanese;
- Zung Jung;
- Riichi.

The **detector may be shared**; name/value/eligibility/interaction/payment remain profile-owned.

## E. Pattern accumulator policies

- simple additive accumulation;
- minimum qualification threshold;
- excluded-from-threshold bonus;
- MCR-style non-combination hook;
- Zung Jung same-series exclusion;
- cap/floor/converted-payment post-processing.

## F. Riichi-family variants

One common Riichi engine must be able to resolve at least three paper profiles:

- formal four-player Riichi;
- Ari Ari with red fives;
- Sanma with three players, 108 tiles, no Chii and nuki-dora.

No scorer copy per variant.

## G. Settlement variation

Prove the shared transaction model can represent:

- Classical pairwise loser differences;
- Hong Kong payment-table result;
- MCR discard/self-draw routing;
- Taiwanese winner-only routing;
- Zung Jung formal payoff;
- Riichi ron/tsumo;
- Sanma payment variant.

## H. Progression/game end

Prove profile-owned strategies can represent:

- dealer retention;
- rotate every hand;
- always pass;
- Riichi renchan;
- three-player game-end state.

## I. Evidence-driven UI

Given a resolved profile, `requiredEvidence()` must be able to produce the facts needed by that profile without showing every possible Mahjong field.

---

# 8. Recommended implementation sequence

The correct next step is **not** to implement all eight scorers.

It is to make the platform boundaries real while implementing only enough family code to prove them.

### Phase 1 — platform envelope

Before or alongside #219:

- introduce/confirm a universal resolved-profile envelope;
- keep `ClassicalProfileConfigV1` nested inside it rather than renaming it universal;
- add `grammar`/family identity;
- make hand validation consume profile-owned shape/config;
- introduce a grammar-discriminated `HandScoreResult` platform boundary;
- make progression and game-end profile-owned interfaces;
- retain generic transaction settlement output.

Do **not** implement other scoring grammars yet.

### Phase 2 — Classical proof (#219)

Use Buzzard to prove registry + config + resolver in the Classical family.

Then migrate BMJA and OTB ordinary scoring with zero regression.

### Phase 3 — paper implementations for all eight

Create serialisable **paper profile manifests** for the eight external profiles. They do not need working scorers; they must prove the universal envelope can express:

- table/tile/hand shape;
- selected scoring grammar;
- required strategy IDs;
- variant controls;
- evidence requirements;
- profile version/provenance.

Any field that cannot be expressed becomes a platform ticket before more scorers are built.

### Phase 4 — second grammar proof

MCR is a strong next executable proof because its source is formal and the repo already has an architecture crosswalk.

Implement the pattern-accumulator interface and MCR combination policy from source-linked fixtures.

### Phase 5 — variant-family proof

Implement Riichi only after a source-bound yaku/fu/payment corpus exists, then prove the same family engine with Ari Ari and Sanma configs.

This is the decisive proof that variants are data/policies rather than scorer forks.

### Phase 6 — Hong Kong / Taiwanese / Zung Jung

Reuse the pattern-accumulator kernel with their own profile bindings, interaction policies, hand shape, settlement and progression.

### Phase 7 — American

Implement the target-catalogue engine only when there is a lawful catalogue strategy (licensed, user-provided or otherwise approved). Keep engine capability separate from distribution of annual card contents.

---

# 9. What not to build

Do not build:

- one universal expression DSL;
- arbitrary user-authored JavaScript;
- a giant `RuleOption` type containing every field from every Mahjong family;
- one `ScoreBreakdown` with dozens of mostly-null grammar-specific fields;
- one profile inheriting incompatible scoring concepts across families;
- copies of the scorer for each club/variant;
- full physical-play simulation merely because a source describes dealing, walls or claims.

The product remains a scoring/table companion unless a separate product decision expands scope.

---

# 10. Decision gate

After this stress test, the project should consider itself:

- **ready to implement the Classical family config proof**;
- **not yet ready to call the rules platform universal** until the Phase 1 platform-envelope seams are explicit and paper manifests exist for all eight external profiles;
- **well-positioned** to support variants if configuration is family/grammar-constrained and every saved game stores a resolved profile snapshot.

The standard for “done properly” should be:

> A new profile first selects a compatible scoring grammar and table/hand model, then chooses from typed registries and finite policies. Engineering is required only when it introduces a genuinely new structural predicate, scoring grammar concept, settlement/progression strategy or table-state requirement.

That gives Mahjong Reference a real rules platform rather than either a pile of bespoke scorers or an unmaintainable universal switchboard.

## External architecture sources used for this stress test

- Mahjong Time Game Info: https://www.mahjongtime.com/mahjong-game-info.html
- Hong Kong rules/scoring: https://www.mahjongtime.com/hong-kong-mahjong-rules.html ; https://www.mahjongtime.com/hong-kong-mahjong-scoring.html
- MCR rules/scoring: https://www.mahjongtime.com/chinese-official-mahjong-rules.html ; https://www.mahjongtime.com/chinese-official-mahjong-scoring.html
- Taiwanese rules/scoring: https://www.mahjongtime.com/mahjong-taiwanese-rules.html ; https://www.mahjongtime.com/mahjong-taiwanese-scoring.html
- Riichi rules/scoring: https://www.mahjongtime.com/mahjong-japanese-rules.html ; https://www.mahjongtime.com/mahjong-japanese-scoring.html
- Ari Ari variant pages: https://www.mahjongtime.com/mahjong-ariari-rules.html ; https://www.mahjongtime.com/mahjong-ariari-scoring.html
- European Classical rules/scoring: https://www.mahjongtime.com/european-classical-mahjong-rules.html ; https://www.mahjongtime.com/european-classical-mahjong-scoring.html
- Zung Jung v1.03 rules/scoring: https://www.mahjongtime.com/mahjong-WSOM-rules.html ; https://www.mahjongtime.com/mahjong-WSOM-scoring.html
- Sanma rules: https://www.mahjongtime.com/Mahjong-sanma-rules.html
- NMJL current site / annual card ecosystem: https://www.nationalmahjonggleague.org/

For implementation authority, use the project's primary/formal source register rather than treating this secondary cross-family corpus as canonical.