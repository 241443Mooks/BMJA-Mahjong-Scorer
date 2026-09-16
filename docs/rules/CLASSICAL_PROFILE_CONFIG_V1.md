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

### 1.1 Profiles are data, engines execute rules

A profile may say:

```text
score.double.final-discard = disabled
score.point.standing-hand = 100
score.double.pure-suit = 3 doubles using any-standard-melds
```

It must not contain executable JavaScript/TypeScript callbacks.

The engine owns:

- how `score.double.pure-suit` is detected;
- how a double changes arithmetic;
- how a winning-method evidence field is read;
- how settlement transactions are calculated.

The profile owns:

- whether the rule is enabled;
- its supported numeric/enum value;
- its evidence/provenance metadata;
- catalogue membership and binding values.

### 1.2 Stable rule IDs are the API

Configuration references stable machine IDs, not English labels.

Example:

```text
score.double.own-wind-set
```

not:

```text
"Double for your own Wind"
```

Display names/descriptions are presentation/i18n data.

### 1.3 Published profiles and user variants resolve differently

Published profiles such as BMJA, Buzzard and OTB are immutable/versioned presets.

A Plus user variant may store:

```text
basePreset + overrides
```

for editing convenience, but a started game should retain enough **resolved immutable configuration identity/snapshot** to reproduce its mathematics later.

### 1.4 Configuration is bounded

Use:

- booleans;
- numbers;
- finite enums;
- stable rule/policy IDs;
- special-hand bindings;
- profile/source metadata.

Do not introduce:

- arbitrary expressions;
- JavaScript formulas;
- user-supplied predicates;
- user-supplied settlement code;
- a universal Mahjong DSL.

### 1.5 Unknown rule = capability gap, not malformed configuration

If a club needs a rule that the registry cannot express, onboarding should report:

> **Unsupported rule capability — engineering required.**

Once implemented once, the new capability becomes selectable by every later profile.

---

## 2. Resolution model

The configuration system has four conceptual layers:

```text
Classical engine capabilities
        ↓
base preset
        ↓
profile overrides / catalogue patch
        ↓
resolved immutable profile
```

For a user-defined variant:

```text
published/base preset
        +
user overrides
        ↓
validated resolved profile snapshot
        ↓
started game
```

The important distinction is:

- **editable variant** — may remain `base + overrides`;
- **game replay contract** — must not depend on what the base profile happens to mean next year.

---

## 3. Proposed top-level shape

Illustrative TypeScript contract:

```ts
export type ClassicalProfileConfigV1 = {
  schemaVersion: 1;

  identity: {
    id: string;
    version: string;
    family: 'classical-western';
    kind: 'published' | 'club' | 'user';
  };

  basePreset?: {
    id: string;
    version: string;
  };

  evidence?: {
    status: 'verified' | 'verified-club' | 'provisional' | 'custom-user';
    sourceIds?: string[];
  };

  validation?: {
    normal?: {
      maxChows?: number | null;
    };
  };

  ordinaryPoints?: {
    preset?: 'classical-standard-points-v1';
  };

  pointRules?: Record<string, NumericRuleOverride>;
  doubleRules?: Record<string, NumericRuleOverride>;

  options?: {
    bonusSetStacking?: 'inclusive-of-own' | 'additive-with-own';
    pureSuitShape?: 'pung-kong-only' | 'allow-one-chow' | 'any-standard-melds';
    concealedHandEligibility?: 'any-concealed-winner' | 'self-drawn-only' | 'disabled';
    afterDrawMode?: 'normal' | 'bmja-goulash' | 'otb-goulash';
    fixedSpecialBonusTreatment?: 'capped-with-final-score' | 'add-after-special-cap';
  };

  limit?: {
    default: number;
    userAdjustable?: boolean;
  };

  specialHands?: {
    remove?: string[];
    upsert?: ClassicalSpecialHandBindingV1[];
  };

  settlement?: {
    ordinaryPolicy: 'classical-pairwise';
    eastMultiplier: number;
    incidentPolicies?: string[];
  };

  progression?: {
    policy: 'classical-winds';
  };
};

export type NumericRuleOverride = {
  enabled: boolean;
  value?: number;
};
```

This is a **target contract**, not a command to use these exact property names. Implementation may choose arrays/maps or Zod-friendly discriminated unions if they preserve the semantics below.

---

## 4. Why ordinary points should be a preset first

Across the four current comparison profiles, the ordinary Classical point table is effectively one reusable component:

- exposed/concealed minor/major Pungs;
- exposed/concealed minor/major Kongs;
- Dragon pair;
- own/prevailing Wind pair;
- Flower/Season points.

There is no current evidence that our first-wave custom users need to alter each of these twelve values independently.

So v1 should prefer:

```text
ordinaryPoints.preset = classical-standard-points-v1
```

rather than exposing twelve sliders.

If future club evidence shows a recurring variation, add bounded overrides then.

This keeps the future house-rules builder understandable instead of presenting every internal constant as a user decision.

---

## 5. v1 rule registry

The profile configuration should be validated against a registry of implemented Classical rules.

Each registry entry conceptually owns:

```ts
{
  id,
  kind: 'points' | 'doubles',
  appliesTo: 'winner' | 'all-hands' | 'event',
  evidenceRequirements: [...],
  allowedConfig: { enabled, numericRange? },
  presentationKey,
  evaluator
}
```

`evaluator` remains engine code and is never serialised into a profile.

### Point rule IDs required by the current matrix

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

### Double rule IDs required by the current matrix

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

Not every rule is user-facing just because it is configurable internally.

---

## 6. Evidence dependencies

A major advantage of a registry-backed configuration is that the UI can discover which questions it needs to ask.

Examples:

| Rule ID | Required evidence |
|---|---|
| `score.point.standing-hand` | manual `standingHand` yes/no |
| `score.point.only-possible-tile` | manual or future inferred `onlyPossibleWinningTile` |
| `score.point.last-wall` | winning method / event evidence |
| `score.double.rob-kong` | `winningMethod = robbing-kong` |
| `score.double.original-call` | `originalCall` |
| Buzzard East first-discard limit | event evidence |
| Buzzard East 13th consecutive win | table context / counter |

The future hand-entry UI should not show every possible checkbox permanently.

Instead:

> **resolved profile enables rule → registry says what evidence it needs → UI shows the relevant question.**

This is important for a custom-profile feature: changing a house rule can automatically change what the scorer asks without bespoke UI per club.

---

## 7. Finite rule options

Some variation is not just on/off or numeric.

### Bonus-set stacking

```text
inclusive-of-own
additive-with-own
```

BMJA/OTB current bouquet treatment is inclusive; Buzzard is additive.

### Pure-suit shape

```text
pung-kong-only
allow-one-chow
any-standard-melds
```

This captures the real distinctions already visible across BMJA/OTB, provisional T&M catalogue behaviour and Buzzard without inventing arbitrary pattern syntax.

### Concealed-hand eligibility

```text
any-concealed-winner
self-drawn-only
disabled
```

This replaces profile-specific filtering callbacks for the currently observed differences.

### After-draw mode

```text
normal
bmja-goulash
otb-goulash
```

Goulash is a named rule bundle, not a single collection of raw free-form variables in v1.

### Fixed-special bonus treatment

```text
capped-with-final-score
add-after-special-cap
```

OTB already proves this needs profile-level control, but it is probably an advanced/internal setting rather than an early user-facing house-rule selector.

---

## 8. Special-hand binding v1

The existing architecture is already close to the required design.

Proposed serialisable binding:

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

The new reusable concept Buzzard proves is:

```text
scoreModel.kind = configured-limit
```

A Buzzard limit hand should score whatever limit was agreed for that game, not a hard-coded 600 copied into every binding.

A special hand whose **detector does not exist** remains an engineering event.

---

## 9. Settlement and incidents

### Ordinary settlement

The current four profiles overwhelmingly support one named ordinary policy:

```text
classical-pairwise
```

with:

```text
eastMultiplier = 2
```

Do not expose a settlement formula editor.

### Incident policies

Incidents are selected from a registry of known payment behaviours.

Example IDs:

```text
liability.full-winner-payment
false-mahjong.half-limit-each
false-mahjong.double-limit-each
incorrect-hand.otb
a incorrect-hand.buzzard
```

(The final implementation names should be clean; the last two are illustrative only.)

A new payout topology requires engine work once, then becomes selectable.

The user's future custom-rules UI can describe these policies conversationally rather than exposing their internal IDs.

---

## 10. Published profile manifests

These examples are deliberately partial; the implementation should derive complete manifests from the matrix and existing catalogues.

### BMJA

```yaml
schemaVersion: 1
identity:
  id: bmja
  version: "1.0"
  family: classical-western
  kind: published
validation:
  normal:
    maxChows: 1
ordinaryPoints:
  preset: classical-standard-points-v1
limit:
  default: 1000
  userAdjustable: false
options:
  bonusSetStacking: inclusive-of-own
  pureSuitShape: pung-kong-only
  concealedHandEligibility: any-concealed-winner
  afterDrawMode: bmja-goulash
settlement:
  ordinaryPolicy: classical-pairwise
  eastMultiplier: 2
progression:
  policy: classical-winds
```

The existing BMJA catalogue remains authoritative and is attached as its profile binding set.

### provisional T&M Western

```yaml
schemaVersion: 1
identity:
  id: western-tm
  version: "0.1"
  family: classical-western
  kind: published
evidence:
  status: provisional
ordinaryPoints:
  preset: classical-standard-points-v1
limit:
  default: 1000
options:
  pureSuitShape: allow-one-chow
settlement:
  ordinaryPolicy: classical-pairwise
  eastMultiplier: 2
progression:
  policy: classical-winds
```

This must retain provisional evidence status for ordinary behaviour until the intended T&M source is verified. Migration is not permission to relabel provisional assumptions as facts.

### Outside the Box

```yaml
schemaVersion: 1
identity:
  id: outside-the-box
  version: "0.1"
  family: classical-western
  kind: club
ordinaryPoints:
  preset: classical-standard-points-v1
limit:
  default: 1000
options:
  bonusSetStacking: inclusive-of-own
  pureSuitShape: pung-kong-only
  concealedHandEligibility: self-drawn-only
  afterDrawMode: otb-goulash
  fixedSpecialBonusTreatment: add-after-special-cap
settlement:
  ordinaryPolicy: classical-pairwise
  eastMultiplier: 2
  incidentPolicies:
    - liability.full-winner-payment
progression:
  policy: classical-winds
```

Its 33-hand catalogue remains explicit profile data.

### Buzzard 2000

```yaml
schemaVersion: 1
identity:
  id: buzzard-2000-classical
  version: "0.x"
  family: classical-western
  kind: published
ordinaryPoints:
  preset: classical-standard-points-v1
validation:
  normal:
    maxChows: null
limit:
  default: 600
  userAdjustable: true
options:
  bonusSetStacking: additive-with-own
  pureSuitShape: any-standard-melds
  concealedHandEligibility: disabled
  afterDrawMode: normal
pointRules:
  score.point.standing-hand: { enabled: true, value: 100 }
  score.point.only-possible-tile: { enabled: true, value: 2 }
  score.point.no-chows-bonus: { enabled: true, value: 10 }
  score.point.scoreless-hand: { enabled: true, value: 10 }
  score.point.last-wall: { enabled: true, value: 10 }
  score.point.loose-tile: { enabled: true, value: 10 }
doubleRules:
  score.double.final-discard: { enabled: false }
  score.double.original-call: { enabled: false }
  score.double.pure-suit: { enabled: true, value: 3 }
  score.double.all-chows-nonscoring-pair: { enabled: true, value: 1 }
settlement:
  ordinaryPolicy: classical-pairwise
  eastMultiplier: 2
  incidentPolicies:
    - liability.full-winner-payment
    - false-mahjong.double-limit-each
progression:
  policy: classical-winds
```

The ten Buzzard limit-hand bindings use `configured-limit` where applicable.

This manifest is the test case for #219.

---

## 11. User variant representation

A Plus user's “My Tuesday Club Rules” should not need to duplicate a 200-line resolved manifest just to change three settings.

Editable record:

```ts
export type ClassicalProfileVariantV1 = {
  schemaVersion: 1;
  id: string;
  name: string;
  base: {
    profileId: string;
    profileVersion: string;
  };
  overrides: {
    validation?: ...;
    pointRules?: ...;
    doubleRules?: ...;
    options?: ...;
    limit?: ...;
    specialHands?: ...;
    settlement?: ...;
  };
};
```

Example:

```yaml
name: Our Tuesday Mahjong
base:
  profileId: bmja
  profileVersion: "1.0"
overrides:
  limit:
    default: 500
  doubleRules:
    score.double.concealed-hand:
      enabled: false
    score.double.final-discard:
      enabled: false
  specialHands:
    upsert:
      - patternId: three-great-scholars
        scoreModel:
          kind: fixed
          value: 1500
        fishingValue: 600
```

When a game begins, resolve/validate the variant and persist immutable rules identity/snapshot data according to the cloud/local replay design.

---

## 12. Runtime validation rules

A v1 validator should reject rather than guess when:

- `schemaVersion` is unsupported;
- a rule ID is unknown;
- a policy ID is unknown;
- a special `patternId` has no registered detector;
- an enum value is unknown;
- a numeric value is non-finite or outside the bounded range defined by the registry;
- a profile enables a rule but the engine does not support its required evidence type;
- a binding uses incompatible fields for its score model;
- a user variant references a missing/incompatible base version.

Published profile build/tests should additionally prove:

- no duplicate rule IDs;
- no duplicate special-hand bindings after resolution;
- no unresolved remove/upsert conflict;
- complete profile resolution is deterministic;
- serialise → parse → resolve round-trip is stable.

---

## 13. Provenance model

For published/club profiles, provenance belongs beside configuration without contaminating runtime arithmetic.

Conceptual metadata:

```ts
{
  ruleId: 'score.point.standing-hand',
  profile: 'buzzard-2000-classical@0.x',
  sourceId: 'buzzard-2000-classical',
  locator: 'PDF p.10',
  status: 'verified'
}
```

A user-created override should instead record:

```text
status = custom-user
```

and may optionally retain a note such as “Auntie Jean's rule”.

The scorer does not need this metadata to calculate, but explanations, auditability and future sharing/import/export benefit from retaining it.

---

## 14. User-facing house-rule controls

The configuration contract should not automatically expose every field to ordinary users.

### Strong first-wave UI candidates

- choose starting rules profile;
- ordinary limit;
- maximum Chows / unrestricted Chows;
- concealed-hand double;
- final-discard double;
- own Flower/Season double;
- complete Flowers/Seasons treatment;
- pure-suit treatment;
- last-wall / Loose-Tile bonuses;
- Original Call / Standing Hand where relevant;
- Goulash after draw;
- include/exclude known special hands;
- choose known cannon/liability policy where relevant.

### Keep advanced/internal initially

- raw intrinsic point table;
- special-cap bonus arithmetic;
- settlement policy identifiers;
- progression policy identifiers;
- detector/exposure implementation details;
- provenance metadata.

The UI can become more advanced later if real users ask for it.

---

## 15. Club onboarding workflow

Once the v1 layer exists, a Western-adjacent club onboarding should be:

```text
1. Choose closest published/base profile.
2. Compare club guide/description against the configuration matrix.
3. Record changed toggles, values and special-hand bindings.
4. Flag unsupported concepts as capability gaps.
5. Create/source-link the profile manifest.
6. Add a small golden fixture set for every difference from the base.
7. Run cross-profile regression.
8. Publish/version the club profile.
```

The implementation effort should scale with **novel rules**, not with the number of clubs.

A club that only changes existing selectors should require no scoring-engine code.

---

## 16. Codex boundary for #219

Before Codex, this contract and the matrix settle the product/architecture questions.

Codex should perform the risky implementation work:

- introduce the typed/validated configuration representation;
- extract hard-coded Classical rules into registry-backed configurable behaviour;
- preserve exact BMJA output;
- represent Buzzard primarily through configuration;
- migrate/re-express T&M and OTB where safe without changing behaviour;
- add source-linked fixtures and cross-profile regressions;
- report remaining custom code/capability gaps.

Codex should **not**:

- design the public Plus house-rules UI;
- invent unsupported settings;
- create a universal DSL;
- change the product into a gameplay simulator;
- silently “verify” provisional T&M rules.

---

## 17. Success criteria

The configuration-layer experiment is successful when all of these are true:

1. Buzzard is mostly a readable serialisable manifest.
2. BMJA, provisional T&M and OTB can be represented with the same vocabulary without semantic loss.
3. The scorer's control flow knows rule capabilities, not profile names.
4. A user/club can change common house rules through bounded values/selectors.
5. A missing rule produces a clear capability gap rather than a bespoke profile hack.
6. Started games remain reproducible after profile/base changes.
7. Adding the next ordinary Western-adjacent club is primarily evidence + configuration + fixtures.

At that point, a future Plus **“How does your table play?”** builder is UI over a proven model rather than another architecture project.
