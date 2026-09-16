# Classical / Western profile configuration v1

Status: **pre-Codex contract**  
Implementation target: #219  
Derived from: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`, current scorer architecture, BMJA, provisional T&M Western, Outside the Box, and Buzzard 2000 evidence.

## Purpose

Define the smallest serialisable configuration contract that can represent the recurring Classical/Western differences already evidenced in the repository.

The target product model is deliberately simple:

> **Choose a baseline profile → change supported selectors/values → choose catalogue bindings → save the variant.**

A new club/family profile should require engineering only when it introduces a rule concept the shared Classical engine cannot yet express.

This document is not implementation code and is not a universal rules language. It is the contract Codex should try to realise in #219.

---

## 1. Design principles

### Profiles are data; engines execute rules

A profile may say:

```text
score.double.final-discard = disabled
score.point.standing-hand = 100
score.double.pure-suit = 3 doubles using any-standard-melds
```

It must not contain executable JavaScript/TypeScript callbacks.

The engine owns detection, arithmetic and settlement. The profile owns enabled/disabled state, supported values/options, catalogue membership and provenance.

### Stable rule IDs are the API

Configuration references stable machine IDs, not English labels.

```text
score.double.own-wind-set
```

not:

```text
"Double for your own Wind"
```

Display names/descriptions belong to presentation/i18n.

### Published profiles and user variants resolve differently

Published profiles such as BMJA, Buzzard and OTB are immutable/versioned presets.

A Plus user variant may store:

```text
base profile + overrides
```

for editing convenience, but a started game must retain enough resolved immutable configuration identity/snapshot to reproduce its mathematics later.

### Configuration is bounded

Use booleans, numbers, finite enums, stable rule/policy IDs, special-hand bindings and provenance metadata.

Do not introduce arbitrary expressions, user-supplied predicates, settlement formulas or a universal Mahjong DSL.

### Missing vocabulary is the engineering trigger

If a club needs a rule the registry cannot express, onboarding should report a capability gap. Implement that reusable capability once; future profiles then select it as data.

---

## 2. Resolution model

```text
Classical engine capabilities
        ↓
published/base profile
        ↓
optional user/club override patch
        ↓
validated resolved profile
        ↓
started game snapshot
```

Important distinction:

- **editable custom variant** may remain `base + overrides`;
- **game replay truth** must never depend on what the base profile means in a later release.

Published profiles should resolve explicitly. Do not implement `Buzzard extends BMJA` or `Western extends BMJA` as a historical/rules-authority claim merely because they share engine components.

---

## 3. Proposed top-level shape

Illustrative contract:

```ts
export type ClassicalProfileConfigV1 = {
  schemaVersion: 1;

  identity: {
    id: string;
    version: string;
    family: 'classical-western';
    kind: 'published' | 'club' | 'user';
  };

  evidence?: {
    status: 'verified' | 'verified-club' | 'provisional-compatible' | 'custom-user';
    sourceIds?: string[];
  };

  ordinaryPoints: {
    preset: 'classical-standard-points-v1';
  };

  validation: {
    normal: {
      maxChows: number | null;
    };
  };

  limit: {
    default: number;
    userAdjustable: boolean;
  };

  rules: Record<ClassicalRuleId, ClassicalRuleSetting>;

  specialHands: {
    bindings: ClassicalSpecialHandBindingV1[];
  };

  settlement: {
    ordinaryPolicy: 'classical-pairwise';
    eastMultiplier: 1 | 2;
    incidentPolicies: string[];
  };

  progression: {
    policy: 'classical-winds';
  };

  modes: {
    afterDraw: 'normal' | 'bmja-goulash' | 'otb-goulash';
  };
};
```

Exact property names remain dry-wipe. The semantics are the contract.

---

## 4. Rule registry and settings

Config stores safe data. Engine code owns rule definitions/evaluators.

Conceptually:

```ts
export type ClassicalRuleSetting = {
  enabled: boolean;
  amount?: number;
  option?: string;
};

export type ClassicalRuleDefinition = {
  id: ClassicalRuleId;
  settingKind: 'toggle' | 'points' | 'doubles' | 'select' | 'doubles-select';
  allowedOptions?: readonly string[];
  min?: number;
  max?: number;
  evidenceRequirements?: readonly EvidenceFieldId[];
  presentationKey: string;
  evaluate: /* reviewed engine function */;
};
```

The profile never serialises `evaluate`.

This registry can later drive both runtime validation and the Plus house-rule UI.

---

## 5. Initial rule IDs proven by real profiles

### Point rules

```text
score.point.mahjong
score.point.self-draw-live-wall
score.point.winning-pair
score.point.standing-hand
score.point.only-possible-tile
score.point.no-chows-bonus
score.point.scoreless-hand
score.point.last-wall
score.point.loose-tile
```

### Double rules

```text
score.double.own-wind-set
score.double.prevailing-wind-set
score.double.dragon-set
score.double.own-flower
score.double.own-season
score.double.complete-flower-set
score.double.complete-season-set
score.double.no-chows
score.double.mixed-one-suit
score.double.all-majors
score.double.concealed-hand
score.double.pure-suit
score.double.all-chows-nonscoring-pair
score.double.three-concealed-pung-kong
score.double.little-three-dragons
score.double.big-three-dragons
score.double.little-four-winds
score.double.big-four-winds
score.double.rob-kong
score.double.last-wall
score.double.loose-tile
score.double.final-discard
score.double.original-call
```

Not every internally configurable rule must become a user-facing control.

---

## 6. Evidence dependencies

Rule definitions should declare what scorer/table evidence they need.

| Rule | Evidence |
|---|---|
| own Wind double | tiles + player Wind |
| pure suit | represented tiles/sets |
| final-discard double | winning method |
| Standing Hand +100 | manual `standingHand` boolean |
| only-possible tile +2 | manual/future inferred evidence |
| East first-discard limit | winning-event evidence |
| East 13th consecutive win | table context/counter |
| cannon liability | end-of-round incident + liable player |

Future UI rule:

> **resolved profile enables rule → registry declares evidence → scorer shows the relevant question**

This avoids permanently showing every club-specific toggle.

---

## 7. Intrinsic-point preset

Across BMJA, OTB and Buzzard, and provisionally in current T&M runtime, the same Classical intrinsic table is used.

Model it as:

```text
ordinaryPoints.preset = classical-standard-points-v1
```

The preset owns:

- exposed/concealed minor/major Pung values;
- exposed/concealed minor/major Kong values;
- Dragon pair;
- own/prevailing Wind pair;
- Flower/Season basic points.

Do not expose twelve numeric controls just because they exist internally. Add bounded overrides later only if real club evidence shows recurring variation.

---

## 8. Finite options proven by current profiles

### Complete Flower/Season set stacking

```text
inclusive-of-own
additive-with-own
```

BMJA/OTB current bouquet treatment is inclusive. Buzzard is additive.

### Pure-suit shape

```text
pung-kong-only
allow-one-chow
any-standard-melds
```

These correspond to real current distinctions across BMJA/OTB, T&M catalogue behaviour and Buzzard.

### Concealed-hand eligibility

```text
any-concealed-winner
self-drawn-only
disabled
```

This replaces profile-specific filtering for the currently observed variation.

### After-draw mode

```text
normal
bmja-goulash
otb-goulash
```

Treat known Goulash modes as policy bundles first. Do not expose every internal blank/wild rule until evidence shows repeated user demand.

### Fixed-special bonus treatment

```text
capped-with-final-score
add-after-special-cap
```

OTB proves this differs by profile. It is likely advanced/internal initially.

---

## 9. Validation belongs to the profile

`validation.ts` currently hard-codes the BMJA one-Chow maximum globally.

The first required configurable validation field is:

```text
validation.normal.maxChows
```

Current evidence:

```text
BMJA = 1
Buzzard = null / unrestricted inside ordinary four-set structure
T&M = provisional/unknown until primary verification
OTB = normal cap not independently settled; Goulash = 0
```

Codex must move this out of global BMJA validation without weakening BMJA behaviour.

Future validation options should be extracted only when real profile evidence proves a difference.

---

## 10. Special-hand binding v1

The existing canonical-pattern/profile-binding architecture is already close to the desired model.

A serialisable binding needs:

```ts
export type ClassicalSpecialHandBindingV1 = {
  patternId: string;
  nameKey?: string;

  scoreModel:
    | { kind: 'fixed'; value: number }
    | { kind: 'configured-limit' }
    | {
        kind: 'calculated';
        exposure?: {
          multiplier: number;
          triggerSetKinds: ('pung' | 'kong' | 'chow')[];
          forbiddenSetKinds?: ('pung' | 'kong' | 'chow')[];
        };
      };

  fishingValue?: number;

  exposure?:
    | { allowed: false }
    | {
        allowed: true;
        exposedValue?: number;
        exposedFishingValue?: number;
      };

  winningMethods?: string[];
};
```

Buzzard proves the need for one new reusable score model:

```text
configured-limit
```

A Buzzard limit hand should score the active agreed table limit, not a copied hard-coded 600.

If a custom profile asks for a hand whose canonical detector does not exist, that is an engineering event. Once the detector exists, later profiles only bind it as data.

For user variants, catalogue editing can be represented as:

```text
specialHands.remove[]
specialHands.upsert[]
```

against the exact base profile version.

---

## 11. Ordinary settlement and progression

Do not turn common settlement into dozens of selectors when all four profiles use or provisionally reuse the same topology.

Use named reusable policies:

```text
settlement.ordinaryPolicy = classical-pairwise
settlement.eastMultiplier = 2
progression.policy = classical-winds
```

`classical-pairwise` means:

- each loser pays the winner;
- losers settle score differences;
- East multiplier applies when East is either side.

T&M remains provisional until source verification even if the runtime currently uses this policy.

---

## 12. Incident policy registry

OTB and Buzzard prove liability/penalties recur but differ in consequence.

Do not put formulas in JSON.

Use stable known policy IDs, for example:

```text
liability.otb-cannon
liability.buzzard-dangerous-discard
false-mahjong.half-limit-each
false-mahjong.double-limit-each
incorrect-hand.otb
incorrect-hand.buzzard
```

A new payment topology requires engineering once. If later evidence shows multiple policies differ only by a simple bounded parameter, extract that parameter then.

#219 may define the config seam, but the Buzzard settlement implementation remains #220.

---

## 13. Published profile sketches

These are design sketches, not executable manifests.

### BMJA

```yaml
identity: bmja@1.0
family: classical-western
evidence: verified
ordinaryPoints: classical-standard-points-v1
validation:
  maxChows: 1
limit:
  default: 1000
rules:
  concealed-hand: { enabled: true, amount: 1, option: any-concealed-winner }
  final-discard: { enabled: true, amount: 1 }
  original-call: { enabled: true, amount: 1 }
  pure-suit: { enabled: true, amount: 3, option: pung-kong-only }
  complete-flower-set: { enabled: true, amount: 2, option: inclusive-of-own }
settlement: classical-pairwise / east x2
progression: classical-winds
```

### Provisional T&M Western

```yaml
identity: western-tm@0.1
family: classical-western
evidence: provisional-compatible
ordinaryPoints: classical-standard-points-v1 # current runtime, source not yet fully verified
limit:
  default: 1000
specialHands: existing T&M Companion bindings
settlement: current classical-pairwise behaviour # provisional
progression: current classical-winds behaviour # provisional
```

Do not invent a verified ordinary T&M manifest from inherited runtime assumptions.

### Outside the Box

```yaml
identity: outside-the-box@0.1
family: classical-western
evidence: verified-club
ordinaryPoints: classical-standard-points-v1
limit:
  default: 1000
rules:
  concealed-hand: { enabled: true, amount: 1, option: self-drawn-only }
  pure-suit: { enabled: true, amount: 3, option: pung-kong-only }
  three-concealed-pung-kong: { enabled: true, amount: 1 }
  little-three-dragons: { enabled: true, amount: 1 }
  big-three-dragons: { enabled: true, amount: 2 }
  little-four-winds: { enabled: true, amount: 1 }
  big-four-winds: { enabled: true, amount: 2 }
  fixed-special-bonus-treatment: add-after-special-cap
specialHands: existing 33 OTB bindings
settlement: classical-pairwise / east x2 + OTB incident policies
modes:
  afterDraw: otb-goulash
```

Audit note: the current global one-Chow normal validation and any inherited Original Call behaviour must remain explicit evidence questions rather than being silently upgraded to `verified-club`.

### Buzzard 2000

```yaml
identity: buzzard-2000-classical@0.x
family: classical-western
evidence: verified
ordinaryPoints: classical-standard-points-v1
validation:
  maxChows: null
limit:
  default: 600
  userAdjustable: true
rules:
  standing-hand: { enabled: true, amount: 100 }
  only-possible-tile: { enabled: true, amount: 2 }
  no-chows-bonus: { enabled: true, amount: 10 }
  scoreless-hand: { enabled: true, amount: 10 }
  last-wall-points: { enabled: true, amount: 10 }
  loose-tile-points: { enabled: true, amount: 10 }
  concealed-hand: { enabled: false }
  final-discard: { enabled: false }
  original-call: { enabled: false }
  pure-suit: { enabled: true, amount: 3, option: any-standard-melds }
  complete-flower-set: { enabled: true, amount: 3, option: additive-with-own }
  complete-season-set: { enabled: true, amount: 3, option: additive-with-own }
  all-chows-nonscoring-pair: { enabled: true, amount: 1 }
specialHands:
  ten source-defined limit bindings using configured-limit where appropriate
settlement: classical-pairwise / east x2 + later Buzzard incidents (#220)
progression: classical-winds
modes:
  afterDraw: normal
```

Buzzard is the #219 implementation test case.

---

## 14. User variant representation

A Plus user's named table profile should store a compact patch over an exact base version.

Example:

```yaml
name: Wednesday Club
base:
  profileId: bmja
  profileVersion: "1.0"
overrides:
  limit:
    default: 500
  validation:
    maxChows: 2
  rules:
    score.double.concealed-hand:
      enabled: false
    score.double.final-discard:
      enabled: false
    score.point.last-wall:
      enabled: true
      amount: 10
  specialHands:
    remove:
      - buried-treasure
    upsert:
      - patternId: three-great-scholars
        scoreModel:
          kind: fixed
          value: 1500
        fishingValue: 600
```

When a game begins, resolve/validate the patch and persist immutable rules identity/snapshot data according to the local/cloud replay design.

Editing the saved profile later must create a new revision/version for future games rather than changing historical games.

---

## 15. Runtime configuration validation

Reject rather than guess when:

- `schemaVersion` is unsupported;
- rule ID is unknown;
- policy ID is unknown;
- enum option is unknown;
- numeric value is invalid or out of registry bounds;
- special `patternId` has no detector;
- `configured-limit` binding also carries a conflicting fixed value;
- selected rule requires an unsupported evidence field;
- base profile/version is missing;
- custom override attempts to mutate a field marked non-customisable.

Published-profile build/tests should additionally prove:

- no duplicate rule IDs;
- no duplicate resolved special bindings;
- deterministic resolution;
- serialise → parse → resolve stability;
- exact profile version participates in replay identity.

Use runtime validation as well as TypeScript once implementation begins; the existing stack already includes Zod and no second validation framework is needed.

---

## 16. Provenance

Published/club profile settings should retain source/evidence metadata without contaminating arithmetic.

Conceptually:

```text
ruleId: score.point.standing-hand
profile: buzzard-2000-classical@0.x
sourceId: buzzard-2000-classical
status: verified
```

A user-created override simply has authority `custom-user`, optionally with a free-text note such as “our club rule”.

Configuration is not permission to turn provisional T&M behaviour into verified fact.

---

## 17. Future Plus control tiers

### Strong first-wave house-rule controls

- starting rules profile;
- table limit;
- maximum Chows / unrestricted Chows;
- concealed-hand double;
- final-discard double;
- pure-suit treatment;
- own/full Flower/Season treatment;
- last-wall / Loose-Tile treatment;
- Original Call / Standing Hand where applicable;
- Goulash after a draw;
- include/exclude known special hands.

### Advanced later

- numeric overrides to uncommon bonuses/doubles;
- special-hand value/fishing/exposure overrides;
- liability/cannon policy;
- false-Mahjong penalty policy;
- unusual evidence bonuses.

### Keep internal initially

- raw Pung/Kong point table;
- cap arithmetic internals;
- settlement/progression implementation IDs;
- detector IDs;
- evidence-field IDs;
- provenance internals.

Do not expose complexity simply because the engine can represent it.

---

## 18. Repeatable club onboarding workflow

Once v1 exists:

```text
1. Choose the closest supported published profile.
2. Compare the club guide/practice against the configuration matrix.
3. Record changed toggles, values, options and special-hand bindings.
4. Flag unsupported concepts as engineering capability gaps.
5. Create/version the profile manifest with provenance.
6. Add focused golden fixtures for every difference from the base.
7. Run cross-profile regression.
8. Publish the profile.
```

Implementation effort should scale with **novel rules**, not with number of clubs.

A club that only changes existing selectors should require no scoring-engine code.

---

## 19. Codex boundary for #219

Before Codex, this contract and the matrix settle the product/architecture decisions.

Codex should:

- introduce the typed/runtime-validated config representation;
- extract hard-coded Classical rules into registry-backed configurable behaviour;
- preserve exact BMJA output;
- represent Buzzard primarily as configuration;
- keep T&M evidence status provisional;
- migrate/re-express OTB pieces where safe and naturally adjacent;
- implement source-linked fixtures from `CLASSICAL_PROFILE_CONFIG_FIXTURE_PLAN.md`;
- report remaining capability gaps/profile-specific callbacks.

Codex should not:

- design the public Plus editor;
- create a universal DSL;
- invent unsupported settings;
- make Riichi/MCR fit this engine;
- simulate physical play;
- silently reinterpret source gaps.

---

## 20. Success criteria

The experiment succeeds when:

1. Buzzard is mostly a readable serialisable manifest.
2. BMJA, provisional T&M and OTB can be represented by the same vocabulary without semantic loss.
3. Scorer control flow knows capabilities/rule IDs, not profile names.
4. Common house-rule changes are bounded selector/value changes.
5. Unsupported rules produce a clear capability gap rather than a bespoke club hack.
6. Started games remain reproducible after profile/base edits.
7. The next ordinary Western-adjacent club is primarily evidence + configuration + fixtures.

At that point, the future Plus **“How does your table play?”** builder is UI over a proven model rather than another architecture project.
