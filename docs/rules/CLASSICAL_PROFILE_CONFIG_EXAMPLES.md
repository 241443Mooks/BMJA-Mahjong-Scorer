# Classical / Western configuration examples

Status: **paper test for `ClassicalProfileConfigV1`**  
Purpose: prove the proposed configuration vocabulary against four real profiles before runtime refactoring.

These examples are deliberately written as configuration-like documents rather than production TypeScript. They test whether the model is expressive enough. Where source evidence is unresolved, the example says so instead of filling the gap.

## 1. Shared ordinary classical table

BMJA, OTB and Buzzard agree on the ordinary point values below. T&M currently executes the same base in the application but remains provisional until the primary ordinary-rules source is fully checked.

```json
{
  "points": {
    "chow": 0,
    "pung": {
      "minor": { "exposed": 2, "concealed": 4 },
      "major": { "exposed": 4, "concealed": 8 }
    },
    "kong": {
      "minor": { "exposed": 8, "concealed": 16 },
      "major": { "exposed": 16, "concealed": 32 }
    },
    "pairs": { "dragon": 2, "ownWind": 2, "prevailingWind": 2 },
    "bonusTileEach": 4,
    "mahjong": 20,
    "selfDrawLiveWall": 2
  }
}
```

This is the strongest candidate for a maintained internal `classical-standard` preset component.

---

## 2. BMJA paper config

The intent is zero behaviour change from the current product.

```json
{
  "schemaVersion": 1,
  "identity": {
    "id": "bmja",
    "version": "1.0",
    "family": "classical-western",
    "status": "published"
  },
  "limit": { "default": 1000, "tableAdjustable": true },
  "points": "classical-standard",
  "bonuses": {
    "onlyPossibleTile": 0,
    "standingHand": 0,
    "noChows": 0,
    "scorelessHand": 0,
    "lastWall": 0,
    "looseTile": 0,
    "completedPairMinor": 0,
    "completedPairMajor": 0
  },
  "doubles": {
    "ownWindSet": 1,
    "prevailingWindSet": 1,
    "dragonSet": 1,
    "noChows": 1,
    "mixedOneSuitHonours": 1,
    "allMajors": 1,
    "concealedHand": { "doubles": 1, "eligibility": "any-concealed-win" },
    "winningMethod": {
      "robKong": 1,
      "lastWall": 1,
      "looseTile": 1,
      "finalDiscard": 1
    },
    "originalCall": 1,
    "allChowsNonScoringPair": 0,
    "threeConcealedPungKong": 0,
    "littleThreeDragons": 0,
    "bigThreeDragons": 0,
    "littleFourWinds": 0,
    "bigFourWinds": 0
  },
  "bonusTiles": {
    "enabled": true,
    "ownFlowerDoubles": 1,
    "ownSeasonDoubles": 1,
    "fullFlowerSetDoubles": 2,
    "fullSeasonSetDoubles": 2,
    "fullSetCombination": "replace-own"
  },
  "pureSuit": {
    "predicateId": "pure-suit-pung-kong-only",
    "doubles": 3
  },
  "specialHands": "BMJA published bindings",
  "specialScoring": { "fixedSpecialCapTreatment": "at-least-fixed-value" },
  "evidence": {
    "originalCall": true,
    "standingHand": false,
    "onlyPossibleTile": false,
    "firstDiscardWin": false,
    "firstWallDrawWin": false,
    "eastConsecutiveWins": false,
    "liabilityIncident": false
  },
  "handMode": { "preset": "bmja-goulash" },
  "settlement": {
    "preset": "classical-pairwise",
    "loserToLoser": true,
    "eastMultiplier": 2,
    "incidentPolicyIds": []
  },
  "progression": { "preset": "classical-east-cycle" }
}
```

### Audit note

Before migrating BMJA to config, verify the exact current/source eligibility wording for the generic concealed-hand double and Goulash preset. The config migration must follow the existing tested behaviour, not this paper example if they differ.

---

## 3. Buzzard 2000 paper config

Buzzard is the main #219 test. It should be nearly all configuration.

```json
{
  "schemaVersion": 1,
  "identity": {
    "id": "buzzard-2000-classical",
    "version": "0.1",
    "family": "classical-western",
    "status": "published"
  },
  "limit": { "default": 600, "tableAdjustable": true },
  "points": "classical-standard",
  "bonuses": {
    "onlyPossibleTile": 2,
    "standingHand": 100,
    "noChows": 10,
    "scorelessHand": 10,
    "lastWall": 10,
    "looseTile": 10,
    "completedPairMinor": 0,
    "completedPairMajor": 0
  },
  "doubles": {
    "ownWindSet": 1,
    "prevailingWindSet": 1,
    "dragonSet": 1,
    "noChows": 1,
    "mixedOneSuitHonours": 1,
    "allMajors": 1,
    "concealedHand": { "doubles": 0, "eligibility": "disabled" },
    "winningMethod": {
      "robKong": 1,
      "lastWall": 1,
      "looseTile": 1,
      "finalDiscard": 0
    },
    "originalCall": 0,
    "allChowsNonScoringPair": 1,
    "threeConcealedPungKong": 0,
    "littleThreeDragons": 0,
    "bigThreeDragons": 0,
    "littleFourWinds": 0,
    "bigFourWinds": 0
  },
  "bonusTiles": {
    "enabled": true,
    "ownFlowerDoubles": 1,
    "ownSeasonDoubles": 1,
    "fullFlowerSetDoubles": 3,
    "fullSeasonSetDoubles": 3,
    "fullSetCombination": "additive"
  },
  "pureSuit": {
    "predicateId": "pure-suit-any-standard-meld",
    "doubles": 3
  },
  "specialHands": "ten source-bound Buzzard limit bindings",
  "specialScoring": { "fixedSpecialCapTreatment": "ordinary-cap" },
  "evidence": {
    "originalCall": false,
    "standingHand": true,
    "onlyPossibleTile": true,
    "firstDiscardWin": true,
    "firstWallDrawWin": false,
    "eastConsecutiveWins": true,
    "liabilityIncident": true
  },
  "handMode": { "preset": "none" },
  "settlement": {
    "preset": "classical-pairwise",
    "loserToLoser": true,
    "eastMultiplier": 2,
    "incidentPolicyIds": [
      "buzzard-dangerous-discard",
      "buzzard-false-mahjong",
      "buzzard-incorrect-hand"
    ]
  },
  "progression": { "preset": "classical-east-cycle" }
}
```

### What this config cannot yet express by itself

Two items deliberately remain engine/policy capabilities rather than ordinary toggles:

1. **non-winner limit achievements** for the incomplete Wind/Dragon cases;
2. incident-policy transaction semantics, although the profile can select a registered policy by ID.

Those are the expected small reusable additions in #220, not a reason to make the ordinary scorer bespoke.

---

## 4. Outside the Box paper config

OTB is useful because today's implementation already contains handwritten scoring-policy code. The paper test asks how much of that code should disappear after #219.

```json
{
  "schemaVersion": 1,
  "identity": {
    "id": "outside-the-box",
    "version": "0.1",
    "family": "classical-western",
    "status": "club"
  },
  "limit": { "default": 1000, "tableAdjustable": true },
  "points": "classical-standard",
  "bonuses": {
    "onlyPossibleTile": 0,
    "standingHand": 0,
    "noChows": 0,
    "scorelessHand": 0,
    "lastWall": 2,
    "looseTile": 0,
    "completedPairMinor": 2,
    "completedPairMajor": 4
  },
  "doubles": {
    "ownWindSet": 1,
    "prevailingWindSet": 1,
    "dragonSet": 1,
    "noChows": 1,
    "mixedOneSuitHonours": 1,
    "allMajors": 1,
    "concealedHand": { "doubles": 1, "eligibility": "self-drawn-wall-only" },
    "winningMethod": {
      "robKong": 1,
      "lastWall": 1,
      "looseTile": 1,
      "finalDiscard": 1
    },
    "originalCall": 1,
    "allChowsNonScoringPair": 0,
    "threeConcealedPungKong": 1,
    "littleThreeDragons": 1,
    "bigThreeDragons": 2,
    "littleFourWinds": 1,
    "bigFourWinds": 2
  },
  "bonusTiles": {
    "enabled": true,
    "ownFlowerDoubles": 1,
    "ownSeasonDoubles": 1,
    "fullFlowerSetDoubles": 2,
    "fullSeasonSetDoubles": 2,
    "fullSetCombination": "replace-own"
  },
  "pureSuit": {
    "predicateId": "pure-suit-pung-kong-only",
    "doubles": 3
  },
  "specialHands": "33 verified OTB club bindings",
  "specialScoring": {
    "fixedSpecialCapTreatment": "published-fixed-plus-bonus-side-score"
  },
  "evidence": {
    "originalCall": true,
    "standingHand": false,
    "onlyPossibleTile": false,
    "firstDiscardWin": false,
    "firstWallDrawWin": false,
    "eastConsecutiveWins": false,
    "liabilityIncident": true
  },
  "handMode": { "preset": "outside-the-box-goulash" },
  "settlement": {
    "preset": "classical-pairwise",
    "loserToLoser": true,
    "eastMultiplier": 2,
    "incidentPolicyIds": [
      "otb-incorrect-hand",
      "otb-false-discard-name",
      "otb-false-mahjong",
      "otb-wrong-tile-claim",
      "otb-cannon"
    ]
  },
  "progression": { "preset": "classical-east-cycle" }
}
```

### Important audit point

`lastWall: 2` above reflects the current OTB handwritten `outsideTheBoxPointRules` behaviour for `last-wall-tile`, where the rule is labelled as “Winning from the live wall”. Before migrating this callback to generic config, #219 should confirm the intended source meaning and stable rule ID. Do not simply rename it to fit the schema.

### Expected callback reduction

If the config model holds, OTB's current handwritten scoring policy should reduce substantially:

- pair-completion points → config + shared winning-tile predicate;
- concealed-hand eligibility filter → config enum;
- Little/Big Dragons/Winds → config + shared predicates;
- three concealed P/K → config + shared predicate;
- fixed-special side-score treatment → config strategy.

OTB's Goulash legality and incident settlement can remain registered mode/policy components in v1.

---

## 5. T&M Western paper config

This profile must remain **provisional** where the primary ordinary-rules source has not yet been verified. The config should truthfully represent current executable assumptions without laundering them into source certainty.

```json
{
  "schemaVersion": 1,
  "identity": {
    "id": "western-tm",
    "version": "0.1",
    "family": "classical-western",
    "status": "provisional"
  },
  "limit": { "default": 1000, "tableAdjustable": true },
  "points": "classical-standard — provisional compatibility",
  "bonuses": "current shared classical behaviour — provisional where not source-verified",
  "doubles": "current shared classical behaviour — provisional where not source-verified",
  "bonusTiles": "current shared classical behaviour — provisional where not source-verified",
  "pureSuit": "use profile's existing calculated Purity binding; audit during migration",
  "specialHands": "existing T&M binding catalogue",
  "specialScoring": {
    "fixedSpecialCapTreatment": "at-least-fixed-value"
  },
  "evidence": "derive only from enabled current executable rules",
  "handMode": { "preset": "none" },
  "settlement": {
    "preset": "classical-pairwise",
    "loserToLoser": true,
    "eastMultiplier": 2,
    "incidentPolicyIds": []
  },
  "progression": { "preset": "classical-east-cycle" }
}
```

### Why this is intentionally incomplete

The configuration architecture can be implemented before the T&M ordinary source is complete. What it must **not** do is turn current reuse assumptions into verified T&M rules. The published/executable profile can carry evidence status separately from its deterministic config.

---

## 6. Paper-test result

The proposed v1 vocabulary can represent the large majority of differences across all four profiles without per-profile scoring functions.

### Pure configuration or registered reusable component

- ordinary point table;
- bonus values;
- almost all standard doubles;
- winning-method doubles;
- concealed-hand eligibility;
- Flower/Season combination semantics;
- pure-suit predicate/value selection;
- profile-local special-hand catalogue;
- ordinary limit/default;
- fixed-special cap treatment;
- ordinary settlement values;
- classical progression;
- Goulash mode preset selection;
- incident-policy selection.

### Reusable code capability required once

- generic rule registry/resolver turning config into `RuleResult`s;
- Buzzard broad pure-suit predicate;
- Standing Hand / only-possible evidence fields;
- non-winner special/limit result;
- generic enough incident settlement registration to select OTB/Buzzard policies by ID.

### No evidence that we need

- profile-specific scorer copies;
- a user rule-expression language;
- arbitrary formulas;
- per-club application branches;
- wall/draw/discard simulation.

## 7. Repeatability forecast

If the #219 implementation matches this paper test, a normal new Classical/Western club should follow:

```text
1. select nearest published preset
2. record differences in a crosswalk
3. populate config selectors/values/catalogue
4. identify any missing vocabulary
5. add only genuinely missing shared primitive, if any
6. write a small golden fixture set
7. validate and publish/save
```

The long-term aim is that steps 1–4 and 6–7 can be done through an internal or Plus-facing rules editor, with step 5 being the exception rather than the normal onboarding path.