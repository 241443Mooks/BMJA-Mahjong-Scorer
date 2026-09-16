# Classical / Western profile configuration v1

Status: **pre-implementation contract for #219**  
Derived from: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`, existing BMJA/T&M/OTB runtime, and Buzzard 2000 evidence  
Scope: Classical/Western-family scoring and table-running configuration only

## 1. Purpose

Define a small, serialisable, validateable configuration contract that can express:

- published presets such as BMJA, T&M Western, Outside the Box and Buzzard 2000;
- named club variants;
- later Plus user/family house-rule profiles;
- deterministic replay of a saved profile version.

The contract must not contain executable functions.

The scoring engine remains code. The profile tells the engine **which known rules are active and what their supported values are**.

## 2. Two representations: authoring vs runtime

Do not make runtime scoring depend on a mutable inheritance chain.

### Authoring profile

Useful for humans/UI/storage of user intent:

```text
base preset
+ overrides
= my table rules
```

Example:

```json
{
  "schemaVersion": 1,
  "basePreset": { "id": "western-tm", "version": "0.1" },
  "overrides": {
    "limit.default": 600,
    "doubles.concealed-hand": 0,
    "points.standing-hand": 100
  }
}
```

### Resolved profile

The scorer should consume a **complete resolved snapshot** with no unresolved inheritance.

Benefits:

- old games remain reproducible;
- a future change to BMJA/T&M/Buzzard presets does not silently alter a saved custom game;
- validation happens once at resolution time;
- cloud/local persistence can store or fingerprint the deterministic resolved rules state.

## 3. Working TypeScript shape

This is a design contract, not a requirement to use these exact names. #219 may refine names where the current code makes a different shape materially cleaner, but it should preserve the semantics and serialisability.

```ts
export type ClassicalProfileConfigV1 = {
  schemaVersion: 1;

  identity: {
    id: string;
    version: string;
    family: 'classical-western';
    status: 'published' | 'club' | 'provisional' | 'custom';
    basePreset?: { id: string; version: string };
  };

  limit: {
    default: number;
    tableAdjustable: boolean;
  };

  points: {
    chow: number;
    pung: {
      minor: { exposed: number; concealed: number };
      major: { exposed: number; concealed: number };
    };
    kong: {
      minor: { exposed: number; concealed: number };
      major: { exposed: number; concealed: number };
    };
    pairs: {
      dragon: number;
      ownWind: number;
      prevailingWind: number;
    };
    bonusTileEach: number;
    mahjong: number;
    selfDrawLiveWall: number;
  };

  bonuses: {
    onlyPossibleTile: number;
    standingHand: number;
    noChows: number;
    scorelessHand: number;
    lastWall: number;
    looseTile: number;
    completedPairMinor: number;
    completedPairMajor: number;
  };

  doubles: {
    ownWindSet: number;
    prevailingWindSet: number;
    dragonSet: number;
    noChows: number;
    mixedOneSuitHonours: number;
    allMajors: number;
    concealedHand: {
      doubles: number;
      eligibility: 'any-concealed-win' | 'self-drawn-wall-only' | 'disabled';
    };
    winningMethod: {
      robKong: number;
      lastWall: number;
      looseTile: number;
      finalDiscard: number;
    };
    originalCall: number;
    allChowsNonScoringPair: number;
    threeConcealedPungKong: number;
    littleThreeDragons: number;
    bigThreeDragons: number;
    littleFourWinds: number;
    bigFourWinds: number;
  };

  bonusTiles: {
    enabled: boolean;
    ownFlowerDoubles: number;
    ownSeasonDoubles: number;
    fullFlowerSetDoubles: number;
    fullSeasonSetDoubles: number;
    fullSetCombination: 'replace-own' | 'additive';
  };

  pureSuit: {
    predicateId:
      | null
      | 'pure-suit-pung-kong-only'
      | 'pure-suit-any-standard-meld';
    doubles: number;
  };

  specialHands: ClassicalSpecialBindingConfig[];

  specialScoring: {
    fixedSpecialCapTreatment:
      | 'at-least-fixed-value'
      | 'ordinary-cap'
      | 'published-fixed-plus-bonus-side-score';
  };

  evidence: {
    originalCall: boolean;
    standingHand: boolean;
    onlyPossibleTile: boolean;
    firstDiscardWin: boolean;
    firstWallDrawWin: boolean;
    eastConsecutiveWins: boolean;
    liabilityIncident: boolean;
  };

  handMode: {
    preset: 'none' | 'bmja-goulash' | 'outside-the-box-goulash';
  };

  settlement: {
    preset: 'classical-pairwise';
    loserToLoser: boolean;
    eastMultiplier: number;
    incidentPolicyIds: string[];
  };

  progression: {
    preset: 'classical-east-cycle';
  };
};
```

## 4. Rule values and semantics

### Numbers over booleans where possible

For a points rule:

- `0` = disabled;
- positive number = awarded points.

For a double rule:

- `0` = disabled;
- `1` = one double (×2);
- `2` = two doubles (×4);
- `3` = three doubles (×8).

This lets one field express both an on/off switch and supported numeric variation without losing the current explainable `RuleResult` model.

### Enums only when semantics differ

Use an enum where changing a number is not enough.

Known examples:

- Flower/Season full-set combination: `replace-own` vs `additive`;
- concealed-hand eligibility: generic vs wall-only vs disabled;
- pure-suit predicate variant;
- cap treatment;
- Goulash mode preset;
- settlement/progression strategy preset.

Do not invent dozens of abstract strategy enums in advance. Add one only when real profiles demonstrate a semantic choice.

## 5. Stable rule and predicate registry

The configuration references **stable machine IDs**. It does not embed arbitrary code.

Examples:

```text
bonus.standing-hand
bonus.only-possible-tile
double.no-chows
double.final-discard
pure-suit-pung-kong-only
pure-suit-any-standard-meld
three-great-scholars
thirteen-unique-wonders
```

The engine owns the implementation of these predicates/rules.

When a new club requires a genuinely new predicate:

1. add and test the predicate once;
2. assign a stable ID;
3. expose it to the configuration registry where appropriate;
4. future profiles select it as data.

## 6. Special-hand binding config

The existing `SpecialHandPatternBinding` model is already close to the desired serialisable form.

A v1 config binding should support roughly:

```ts
export type ClassicalSpecialBindingConfig = {
  patternId: string;
  enabled: boolean;
  nameKey?: string;
  scoreModel:
    | {
        kind: 'fixed';
        value: number;
        fishingValue?: number;
        exposure?:
          | { allowed: false }
          | {
              allowed: true;
              exposedValue?: number;
              exposedFishingValue?: number;
            };
      }
    | {
        kind: 'calculated';
        exposure?: {
          multiplier: number;
          triggerSetKinds: Array<'chow' | 'pung' | 'kong' | 'pair'>;
          forbiddenSetKinds?: Array<'chow' | 'pung' | 'kong' | 'pair'>;
        };
      };
  winningMethods?: string[];
  scoreAsTableLimit?: boolean;
};
```

`nameKey` is presentation metadata, not the structural identity of the hand.

The canonical `patternId` owns detection. The profile owns membership/value/exposure.

## 7. Published preset vs custom profile

### Published preset

A maintained Mahjong Reference profile such as BMJA or Buzzard has:

- stable profile ID/version;
- source/provenance record;
- reviewed configuration;
- source-linked fixtures;
- release/version lifecycle.

### Custom profile

A Plus user's house rules should have:

- user-owned ID;
- config schema version;
- starting/base preset reference for editing convenience;
- complete resolved profile snapshot for deterministic scoring/replay;
- user-visible name, e.g. `Mum's rules`, `Thursday Club`, `Rachel's table`;
- no claim of governing-body/source authority unless it actually points to a published preset.

## 8. Resolution algorithm

The resolver should be deterministic and boring.

Conceptually:

```text
load exact base preset version
validate override keys and values
apply allowed overrides
resolve special-hand membership/bindings
produce complete ClassicalProfileConfigV1
validate invariants
freeze/canonicalise
return resolved config + deterministic fingerprint
```

A custom profile must not be allowed to override unknown fields silently.

## 9. Validation rules

At minimum:

- `schemaVersion` must be supported;
- profile id/version must be non-empty;
- point values and limit must be finite and non-negative;
- double counts must be finite non-negative integers within a sensible supported bound;
- referenced canonical pattern/predicate IDs must exist;
- special bindings must be structurally valid for their score model;
- `exposedValue` requires exposed play to be allowed;
- unsupported strategy/preset IDs fail closed;
- profile cannot enable evidence that the engine does not know how to capture;
- base preset/version must resolve exactly when authoring overrides are used;
- custom config cannot contain functions or executable strings;
- unknown fields are rejected rather than ignored.

Use the project's existing validation approach/library rather than inventing a parallel schema system.

## 10. Evidence-driven UI derivation

The future house-rules UI should not hard-code separate forms for each preset.

A registry can provide metadata for each configurable field:

```text
rule ID
category
display key
control type: toggle / number / choice / catalogue picker
allowed range/options
advanced/basic
required evidence input
help/reference key
```

Then the same registry can drive:

- profile validation;
- future Plus editor controls;
- score explanation labels;
- comparison/diff views;
- club onboarding worksheets.

Do not build this UI in #219; only keep the config design compatible with it.

## 11. Derived input visibility

Scoring questions should be conditional on the resolved config.

Examples:

- if `bonuses.standingHand === 0`, do not ask “Standing Hand?”;
- if `doubles.originalCall === 0`, hide Original Call;
- if neither last-wall points nor doubles are active, the scorer need not surface that option for scoring purposes;
- if cannon/liability policy is absent, do not show the incident control;
- if a special/event binding needs East consecutive-win count, expose it only for that profile.

This keeps custom profiles from creating a giant intimidating scorer form.

## 12. Preset migration target

After Buzzard proves the configuration layer, test the following in order:

1. **BMJA** — resolve to config with no behaviour change;
2. **Outside the Box** — remove ordinary scoring callbacks where they are merely selectable/value-based; retain only genuinely unusual incident/hand-mode mechanics until those too can be represented safely;
3. **T&M Western** — express current executable behaviour as a **provisional** config without upgrading unresolved primary-source assumptions;
4. compare all results against existing golden/regression tests.

A migration is successful only if its scores and settlements do not change.

## 13. Deliberate v1 exclusions

Do not put the following into `ClassicalProfileConfigV1` unless #219 proves they are unavoidable:

- arbitrary expressions/formulas;
- JavaScript callbacks;
- arbitrary regex/JSONLogic-style rules;
- physical wall simulation;
- tile-draw/discard event programming;
- arbitrary progression scripts;
- arbitrary settlement formulas;
- Riichi/MCR/American scoring concepts.

Those disciplines have different scoring grammars and should not distort the Classical/Western config.

## 14. Success test

The configuration layer is successful when a new Western-adjacent club can normally be onboarded by:

```text
choose nearest preset
→ compare club sheet to configuration vocabulary
→ change selectors/values/catalogue membership
→ add source-linked fixtures
→ validate
→ publish/save
```

Engineering is required only for a rule whose **concept** is absent from the vocabulary, not simply because its value differs.

## 15. Buzzard proof criteria

#219 should answer these questions with code and tests:

- Can Buzzard ordinary scoring be represented almost entirely by this config?
- Which fields were too specific or too generic?
- Which new predicate/rule capabilities were genuinely required?
- Can the same resolved config shape express BMJA without changing results?
- Can OTB's ordinary scoring move out of handwritten callbacks?
- Which controls are ready to become Plus user-facing selectors?
- Does any remaining custom code represent a genuinely rare semantic rather than a missing configuration field?

The implementation report should update this document if real code disproves any design assumption.