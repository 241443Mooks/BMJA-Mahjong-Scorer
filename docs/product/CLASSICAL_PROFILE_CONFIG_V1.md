# Classical / Western profile configuration v1

Status: **pre-Codex design contract**  
Implementation target: #219  
Evidence matrix: `docs/rules/CLASSICAL_PROFILE_CONFIG_MATRIX.md`

## Product intent

Mahjong Reference should treat Western-adjacent rules as a **configurable family**, not as a growing collection of copied scorers.

The intended product model is:

> **known baseline + common selectors + supported value changes + special-hand catalogue choices = a deterministic rules profile**

This serves two use cases with the same underlying machinery:

1. **published presets** such as BMJA, Thompson & Maloney, Outside the Box and Buzzard 2000;
2. **future Plus custom variants** for a family, club or regular table.

The user should not need to understand implementation architecture. The future UI can ask questions such as:

- “Does a concealed hand double?”
- “How many Chows are allowed?”
- “What is your table limit?”
- “Does winning on the last wall tile add points, a double, both or neither?”
- “Which special hands does your table use?”

The saved configuration then feeds the same deterministic scorer as a published profile.

## Non-goals

Version 1 is **not**:

- a universal Mahjong rules language;
- an expression evaluator;
- user-authored JavaScript/functions;
- a way to invent arbitrary payment formulae;
- an attempt to make Riichi or MCR fit the Classical engine;
- a wall/draw/discard simulator;
- the public Plus custom-rules UI itself.

The purpose of #219 is to prove the configuration contract with Buzzard before building that UI.

---

## 1. Architecture

```text
                       reusable engine code
                   ┌──────────────────────────┐
                   │ canonical predicates     │
                   │ rule evaluators          │
                   │ special-hand detectors   │
                   │ settlement policies      │
                   │ progression policies     │
                   │ mode policies            │
                   └────────────┬─────────────┘
                                │ selected by stable IDs
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                ClassicalProfileConfig v1                       │
│ booleans / numbers / enums / catalogue bindings / policy IDs   │
└───────────────────────────────┬────────────────────────────────┘
                                │ resolve + validate
                                ▼
                   deterministic resolved profile
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
                 scorer                table runner
```

A profile configuration is **data**. Executable behaviour lives in reviewed engine registries.

When a new club introduces a genuinely new concept, engineering adds one reusable capability to a registry. Every later profile may then select it as data.

---

## 2. Published presets and user variants are not the same kind of inheritance

There are two useful representations.

### Published profile manifest

A published/source-backed profile should resolve to an **explicit immutable configuration**.

Examples:

```text
bmja@1.0
western-tm@0.1
outside-the-box@0.1
buzzard-2000-classical@0.x
```

Do not implement `Buzzard extends BMJA` or `Western extends BMJA` as a rules-authority claim.

They may share engine presets/components, but each published profile should resolve explicitly so changing BMJA later cannot silently change Buzzard.

### Custom house-rule variant

For user convenience, a custom variant may store:

```text
base profile ref + override patch
```

For example:

```json
{
  "baseProfile": { "id": "bmja", "version": "1.0" },
  "overrides": {
    "defaultLimit": 500,
    "rules": {
      "score.double.concealed-hand": { "enabled": false }
    }
  }
}
```

Before a game starts, the resolver materialises a **resolved snapshot**. That snapshot/version must remain reproducible for saved games.

Editing “Mum's Sunday Mahjong” next month must not silently change a game started under last month's version.

---

## 3. Proposed data model

Exact TypeScript names are implementation-detail dry-wipe. The semantic contract is the important part.

A reasonable v1 shape is:

```ts
interface ClassicalProfileConfigV1 {
  schemaVersion: 1;

  profile: {
    id: string;
    version: string;
    family: 'classical-western';
    kind: 'published' | 'custom';
    displayNameKey?: string;
  };

  provenance?: ProfileProvenance;

  defaultLimit: {
    value: number;
    userAdjustable: boolean;
  };

  intrinsicPoints: {
    preset: 'classical-standard-v1';
    overrides?: Record<string, number>;
  };

  validation: {
    normal: {
      maxChows: number | null;
    };
    modes?: Record<string, unknown>;
  };

  rules: Record<ClassicalRuleId, ClassicalRuleSetting>;

  specialHands: SpecialHandProfileConfig;

  settlement: {
    basePolicy: 'classical-pairwise';
    eastMultiplier: 1 | 2;
    incidentPolicies: string[];
  };

  progression: {
    policy: 'classical-winds';
  };

  modes: {
    afterDraw: 'normal' | 'bmja-goulash' | 'otb-goulash';
  };
}
```

This is **not** permission to make every field generic. Prefer finite known choices.

---

## 4. Rule settings

The core idea is a registry-backed selector.

### Config data

A profile stores only safe serialisable settings, for example:

```ts
interface ClassicalRuleSetting {
  enabled: boolean;
  amount?: number;
  option?: string;
}
```

Examples:

```json
{
  "score.point.standing-hand": {
    "enabled": true,
    "amount": 100
  },
  "score.double.final-discard": {
    "enabled": false
  },
  "score.double.pure-suit": {
    "enabled": true,
    "amount": 3,
    "option": "any-standard-melds"
  }
}
```

### Engine registry

Executable code owns the meaning of each ID.

Conceptually:

```ts
interface ClassicalRuleDefinition {
  id: ClassicalRuleId;
  settingKind: 'toggle' | 'points' | 'doubles' | 'select' | 'doubles-select';
  allowedOptions?: readonly string[];
  min?: number;
  max?: number;
  evidence?: readonly EvidenceFieldId[];
  uiGroup: string;
  evaluate: /* reviewed engine function */;
}
```

The configuration never stores `evaluate`.

The registry can later drive both:

- runtime validation;
- a future Plus selector UI.

This avoids two bad extremes:

1. hundreds of bespoke `club-x-scoring.ts` callbacks;
2. an unsafe general-purpose rules DSL.

---

## 5. v1 rule-setting types

The evidence matrix supports four common control types.

### Toggle

Examples:

```text
concealed hand doubles? yes/no
final discard doubles? yes/no
Original Call enabled? yes/no
```

Stored as:

```json
{ "enabled": true }
```

### Toggle + amount

Examples:

```text
Standing Hand: +100
No Chows bonus: +10
Robbing Kong: 1 double
```

Stored as:

```json
{ "enabled": true, "amount": 100 }
```

The rule definition determines whether `amount` means points or doubles.

### Toggle + amount + finite option

Examples:

```text
Pure suit = 3 doubles; any standard melds
Full Flower set = 3 doubles; additive with own Flower
```

Stored as:

```json
{
  "enabled": true,
  "amount": 3,
  "option": "additive-with-own"
}
```

The registry rejects unsupported option strings.

### Policy selection

For richer known behaviour, use a policy ID rather than user-authored arithmetic.

Examples:

```text
afterDraw = otb-goulash
settlement.basePolicy = classical-pairwise
incident policy = false-mahjong.half-limit-each
```

A genuinely new policy requires engineering once.

---

## 6. Rule IDs and grouping

Stable machine IDs are part of the compatibility contract. Display text is not.

The initial registry should cover at least the real rules identified by the four-profile matrix:

```text
validation.normal.max-chows

score.point.mahjong
score.point.self-draw-live-wall
score.point.winning-pair
score.point.standing-hand
score.point.only-possible-tile
score.point.no-chows-bonus
score.point.scoreless-hand
score.point.last-wall
score.point.loose-tile

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

The final naming may change during implementation, but one principle should not:

> **Profile data refers to stable rule IDs, never English labels.**

That also makes the configuration naturally compatible with multilingual UI.

---

## 7. Rule definitions should declare evidence requirements

A future custom-rules UI is much easier if each rule declares what scorer input it needs.

Examples:

| Rule | Evidence needed |
|---|---|
| own Wind double | tiles + player Wind |
| pure suit | tiles/sets |
| final-discard double | `winningMethod` |
| Standing Hand +100 | manual `standingHand` boolean |
| only-possible tile +2 | manual/provable `onlyPossibleTile` evidence |
| East first-discard limit | winning event evidence |
| East 13th consecutive win | table context / consecutive East-win count |
| cannon liability | end-of-round incident + liable player |

If a selected profile enables a rule requiring manual evidence, the hand/table UI can reveal that control.

This is preferable to permanently cluttering the scorer with every profile's toggles.

---

## 8. Intrinsic-point preset

All four profiles currently use, or provisionally reuse, the same Classical intrinsic point table.

Therefore v1 should model it as:

```text
intrinsicPoints.preset = classical-standard-v1
```

The engine preset contains:

- exposed/concealed minor/major Pung values;
- exposed/concealed minor/major Kong values;
- Dragon pair;
- own/prevailing Wind pair;
- Flower/Season basic points.

Optional numeric overrides may exist in the schema for future evidence, but do not make twelve advanced inputs part of the first user-facing house-rule builder without demand.

---

## 9. Special-hand configuration

The existing canonical-pattern/profile-binding model is already suitable.

### Published profile

A resolved published profile owns an explicit list of bindings.

### User custom variant

A custom patch should support:

```ts
interface SpecialHandOverridePatch {
  remove?: string[];
  upsert?: SpecialHandBindingConfig[];
}
```

`patternId` must already exist in the canonical detector registry.

If the pattern does not exist, adding it is an engineering task. Once added, future profiles can bind it with no scorer changes.

### Binding score models needed by v1

Keep existing fixed/calculated binding capability and add the smallest reusable mode Buzzard proves necessary:

```text
fixed-number
calculated
configured-limit
```

`configured-limit` means “this matched hand scores the active table limit”.

Do not copy the profile's current default (600/1000/etc.) into every limit-hand binding.

### Exposure/fishing

Retain data-driven fields for:

- fishing value;
- exposed allowed / forbidden;
- exposed fixed value / fishing value;
- calculated exposure multiplier;
- permitted winning methods.

These are already demonstrated by current Western/OTB catalogue data.

---

## 10. Pure-suit variation

Current profiles prove at least three useful shapes:

```text
pung-kong-only
allow-one-chow
any-standard-melds
```

Rather than profile callbacks, the `score.double.pure-suit` rule can select one of those known predicates and a double count.

Examples:

```text
BMJA:    pung-kong-only, 3 doubles
OTB:     pung-kong-only, 3 doubles
T&M:     allow-one-chow through its calculated Purity binding
Buzzard: any-standard-melds, 3 doubles
```

If future evidence introduces another genuinely distinct pure-suit condition, add one predicate option once.

---

## 11. Bonus-tile complete-set variation

The first configuration layer must support both known stacking behaviours.

```text
inclusive-of-own
additive-with-own
```

Example conceptual manifests:

```text
BMJA / OTB
own Flower = 1 double
full Flower set = 2 doubles
full-set stacking = inclusive-of-own

Buzzard
own Flower = 1 double
full Flower set = 3 doubles
full-set stacking = additive-with-own
```

When Buzzard has all four Flowers including the player's own Flower, those two enabled rules yield four doubles total from Flowers (×16).

The engine should calculate this from selected rules, not from a profile-name condition.

---

## 12. Validation belongs to the profile too

`validation.ts` currently contains BMJA assumptions that are not universal across the Classical family.

The first required selector is:

```text
normal.maxChows
```

Candidate values from current evidence:

```text
BMJA = 1
Buzzard = null / unrestricted within ordinary four-set structure
T&M = provisional/unknown until source verified
OTB = source question for normal mode; Goulash = 0
```

Codex should move the rule out of global validation without weakening BMJA behaviour.

Future validation options should be added only when profile evidence demonstrates a difference.

---

## 13. Settlement and progression

Do not turn ordinary settlement into dozens of user toggles when all known profiles use the same topology.

Use a named base policy:

```text
settlement.basePolicy = classical-pairwise
settlement.eastMultiplier = 2
progression.policy = classical-winds
```

The Classical pairwise policy means:

- each loser pays the winner;
- losers then settle score differences;
- East multiplier applies when East is either side.

Profile-specific incidents are selected separately.

This keeps the user-facing model simple while retaining a clear engineering seam.

---

## 14. Incident policy registry

OTB and Buzzard prove that liability/penalties recur, but the exact consequences differ.

Do not put formulas in JSON.

Use stable policy IDs implemented in code, for example:

```text
liability.full-winner-payment
false-mahjong.half-limit-each
false-mahjong.double-limit-each
incorrect-hand.otb
incorrect-hand.buzzard
```

A profile selects policies and any small safe parameter they explicitly support.

Later, if enough evidence shows multiple policies differ only by one multiplier, that multiplier can become configuration. Start from real evidence, not anticipated flexibility.

---

## 15. Goulash / alternate hand mode

Treat a known Goulash ruleset as a named mode policy first:

```text
afterDraw = normal | bmja-goulash | otb-goulash
```

The mode policy owns its internal validation and state transition.

This lets a future house-rule UI offer a simple selector without forcing users to configure blank-tile constraints individually.

If club research later shows repeatable Goulash variables, extract them then.

---

## 16. Provenance for published settings

Published presets should retain evidence metadata independently from user custom profiles.

Conceptual shape:

```ts
interface ProfileProvenance {
  sourceId: string;
  evidenceStatus: 'verified' | 'verified-club' | 'provisional-compatible';
  sourceVersion?: string;
}
```

Optionally, individual settings/bindings can reference a rule/source ID already recorded in `docs/rules/`.

Do not require a casual Plus user to provide citations for their own house rules. Their profile authority is simply “user-defined”.

---

## 17. Custom-profile identity and immutability

Future user profile example:

```text
id: custom:<account-profile-id>
version: 7
name: Tuesday Club
base: bmja@1.0
```

Editing a saved custom profile creates a new revision/version for future games.

A started/saved game must retain enough information to reproduce the rules used at start. Recommended design target:

```text
custom profile ID + revision
resolved config schemaVersion
resolved-config checksum/hash
```

Cloud/local persistence can additionally retain the resolved configuration snapshot where appropriate.

Never resolve an old game against “whatever the user's profile looks like now”.

---

## 18. Resolution algorithm

For a custom variant:

```text
1. load exact base published/custom profile version
2. validate base schemaVersion
3. apply only allowed override keys
4. apply special-hand remove/upsert patch
5. validate every rule ID exists
6. validate each setting against its rule definition
7. validate policy IDs exist
8. reject incompatible mutually-exclusive choices
9. materialise a complete ResolvedClassicalProfile
10. calculate deterministic config hash
11. persist the resolved identity/snapshot with the game
```

No silent fallback for unknown rule IDs.

Unknown means “profile version cannot be resolved safely”, not “ignore it and continue”.

---

## 19. Validation rules for configuration itself

At minimum:

- `schemaVersion` must be supported;
- profile ID/version are non-empty and stable;
- limit must be positive and finite;
- every rule ID exists in the registry;
- a disabled rule cannot carry an impossible required option;
- amount must meet the rule definition's bounds/type;
- option must be one of that rule's declared options;
- mutually exclusive rule variants cannot both be active;
- special-hand `patternId` must exist;
- special-hand values must be valid for their score model;
- `configured-limit` cannot also carry an independent fixed value;
- selected settlement/progression/mode policies must exist;
- custom overrides may only touch fields designated customisable;
- profile resolution must be deterministic.

Use runtime validation (likely Zod, already in the frontend stack) as well as TypeScript types once implementation begins.

---

## 20. User-facing control tiers

The registry should distinguish what is technically configurable from what is sensible to expose casually.

### Basic house rules

Strong candidates:

- table limit;
- maximum Chows / unrestricted Chows;
- concealed-hand double;
- no-Chows double;
- pure-suit treatment;
- last-wall / final-discard / rob-Kong treatment;
- own/full Flower and Season treatment;
- Goulash after a draw;
- special-hand include/exclude choices.

### Advanced

Potential later controls:

- numeric overrides to common bonuses/doubles;
- special-hand value/fishing/exposure override;
- liability/cannon policy;
- false-Mahjong penalty policy;
- unusual evidence bonuses such as Standing Hand;
- scoreless / only-possible tile bonuses.

### Internal/published-profile only initially

Do not expose these merely because they are configurable internally:

- intrinsic Pung/Kong point table;
- cap arithmetic internals;
- settlement topology implementation details;
- progression engine primitives;
- detector IDs;
- evidence-field IDs.

The public UI can grow from user demand.

---

## 21. Suggested future Plus flow

Not part of #219, but the config contract should make this possible without a redesign.

```text
How does your table play?

Start with:
[ British / BMJA ▼ ]

Scoring
✓ Concealed hand doubles
✓ Own Wind doubles
✓ Prevailing Wind doubles
✓ Dragons double
[ 1000 ] table limit

Winning tiles
✓ Last wall tile doubles
✓ Robbing a Kong doubles
✓ Final discard doubles

Flowers & Seasons
✓ Used
✓ Own Flower / Season doubles
Full set: [ Two doubles total ▼ ]

Special hands
[ 17 selected ]  Change…

After a draw
[ British Goulash ▼ ]

[ Save as “Wednesday Club” ]
```

A preset can show only differences from its selected base for readability.

---

## 22. Published presets should also be inspectable as settings

One valuable product consequence is that users can understand differences rather than memorise ruleset names.

For example, a future profile compare screen could say:

```text
Buzzard 2000 compared with British/BMJA

+ Standing Hand: +100
+ Only possible tile: +2
+ No Chows: +10 as well as the double
+ Last wall: +10 as well as the double
+ Loose Tile: +10 as well as the double
+ All-Chows/non-scoring pair: doubles
~ Pure suit: Chows allowed
~ Full Flower/Season set: three doubles, stacks with own tile
~ Default limit: 600
- Concealed-hand ordinary double
- Final-discard double
- Original Call
```

That comparison is generated naturally from manifests rather than maintained as prose.

---

## 23. What #219 should implement versus defer

### Implement in #219

- rule registry/config schema sufficient for ordinary Classical scoring differences already evidenced;
- runtime validation of profile config;
- profile resolution;
- configurable normal maximum Chow count;
- individual common point/double selectors currently hard-coded as bundles;
- pure-suit predicate choice;
- bonus-tile complete-set stacking choice;
- `configured-limit` special binding if required by Buzzard limit hands;
- Buzzard as primarily a data manifest;
- source-linked fixtures;
- no regressions to BMJA/T&M/OTB.

### Defer to #220

- non-winner Buzzard Wind/Dragon limit settlement;
- Buzzard dangerous-discard liability;
- false-Mahjong and incorrect-hand settlement consequences;
- incident-policy migration beyond what #219 needs.

### Defer to later configuration migration

- moving every existing OTB incident/Goulash rule onto generic config if doing so would inflate #219;
- full BMJA/T&M/OTB manifest migration unless safe and naturally adjacent;
- Plus storage/editor UI.

However, #219 must report whether those profiles **can** be expressed by the v1 vocabulary and where they cannot.

---

## 24. Definition of success

The configuration-layer experiment has worked if we can truthfully say:

> **For a normal Western-adjacent club, once its rules have been understood, onboarding is mostly selecting known rule switches, values and special hands. Engineering happens only when the club introduces a rule concept Mahjong Reference has never supported before.**

Buzzard is the first test. BMJA, T&M and OTB are the control group. Future clubs are the scaling case.
