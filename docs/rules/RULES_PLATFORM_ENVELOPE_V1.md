# Rules platform envelope v1

Status: **pre-Codex implementation contract for #227**  
Branch target: `integration/rules-platform-v1`  
Derived from: `EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md`, `RULES_PLATFORM_EIGHT_MANIFESTS_V1.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`, `MCR_PROFILE_CROSSWALK.md`, `riichi/EMA_2025_ARCHITECTURE_DECISIONS.md`, and `CROSS_PROFILE_CLOUD_GAME_CONTRACT.md`.

## 1. Purpose

Define the smallest universal contract that can host materially different Mahjong rules families without producing either bespoke scorer copies or one giant universal switchboard.

> **The universal layer describes the table, tile set, hand grammar, scoring grammar, evidence contract and finite strategies. Family modules own scoring semantics. Published and custom profiles resolve to one immutable executable snapshot.**

The universal layer selects/configures registered code. It does not itself calculate Mahjong.

## 2. Core invariants

1. A profile has exactly one scoring grammar.
2. A profile may only select capabilities registered for that grammar/family.
3. Shared canonical predicates describe structural/event truth, never score meaning.
4. Scoring, settlement, progression and game completion remain separate concerns.
5. Authoring inheritance is fully resolved before play.
6. Published and custom profiles produce the same resolved runtime shape.
7. Unknown IDs/fields and incompatible overrides fail closed.
8. Profiles contain no JavaScript, callbacks, expression languages or arbitrary executable strings.
9. Saved games pin exact profile identity plus immutable rules fingerprint/snapshot contract.
10. Current BMJA/T&M/OTB behaviour remains fixture-equivalent while new infrastructure is introduced beside it.
11. The current `MahjongHand`, `ScoreBreakdown`, four-player `GameState` and single-winner `HandOutcome` are current-family contracts, not universal platform contracts.

---

# 3. Identity/version primitives

Retain:

```ts
export type RulesProfileRef = {
  id: string;
  version: string;
};
```

Initial scoring grammars:

```ts
export type ScoringGrammarId =
  | 'classical-points-doubles'
  | 'pattern-accumulator'
  | 'riichi-han-fu'
  | 'target-catalogue';
```

Profile status:

```ts
export type ProfileStatus =
  | 'published'
  | 'club'
  | 'provisional'
  | 'custom';
```

`familyId` is a stable namespaced string, initially including examples such as:

```text
family.classical-western
family.hong-kong
family.mcr
family.taiwanese-16-tile
family.zung-jung
family.riichi
family.riichi-sanma
family.american-nmjl-style
```

A new family does not imply a new scoring grammar.

---

# 4. Authoring versus resolved profiles

## 4.1 Authoring definition

```ts
export type ProfileAuthoringDefinition = {
  schemaVersion: 1;
  identity: {
    id: string;
    version: string;
    name: string;
    status: ProfileStatus;
  };
  baseProfile: RulesProfileRef;
  overrides: Record<string, JsonValue>;
};
```

Override keys are **registered capability IDs**, not arbitrary object paths.

Example:

```json
{
  "schemaVersion": 1,
  "identity": {
    "id": "custom.tuesday-club",
    "version": "3",
    "name": "Tuesday Club",
    "status": "custom"
  },
  "baseProfile": { "id": "buzzard-2000-classical", "version": "1.0" },
  "overrides": {
    "classical.limit.default": 1000,
    "classical.bonus.standing-hand": 0
  }
}
```

Reject an override when its ID is unknown, non-customisable, invalid for the base family/grammar, fails its value schema, violates requires/conflicts, or references unavailable executable capability.

Changing grammar requires choosing a different base profile.

## 4.2 Resolved runtime snapshot

```ts
export type ResolvedRulesProfile = {
  schemaVersion: 1;

  identity: {
    id: string;
    version: string;
    status: ProfileStatus;
    familyId: string;
    grammar: ScoringGrammarId;
    baseProfile?: RulesProfileRef;
  };

  table: ResolvedTableConfig;
  tileSet: ResolvedTileSetConfig;
  handShape: ResolvedHandShapeConfig;
  validation: ResolvedValidationConfig;

  scoring: ResolvedScoringConfig;
  evidence: ResolvedEvidenceConfig;

  settlement: ResolvedStrategyRef;
  progression: ResolvedStrategyRef;
  gameEnd: ResolvedStrategyRef;

  handMode?: ResolvedStrategyRef;
  incidents?: ResolvedStrategyRef[];
  procedure?: ResolvedStrategyRef;

  provenance: ProfileProvenance;
};
```

No unresolved inheritance remains here.

---

# 5. Table boundary

Do not hard-code 3/4 players into the universal type merely because the current acceptance corpus contains 3- and 4-player profiles.

```ts
export type ResolvedTableConfig = {
  playerCount: number;     // validated positive integer + seat-model compatibility
  seatModelId: string;
  dealerModelId: string;
};
```

V1 acceptance explicitly proves 3 and 4 players. Future legitimate player-count variants can be added by registered table/seat models without changing this envelope.

Initial examples:

```text
seats.winds-4
seats.riichi-winds-4
seats.riichi-sanma-east-south-west

dealer.classical-east
dealer.always-pass
dealer.riichi-renchan
```

East retention, four players and four Wind seats are not platform invariants.

---

# 6. Tile identity and tile-set boundary

The current `PlayingTile` (`suit | wind | dragon`) is a useful current primitive but cannot be the permanent universal physical-tile type because the architecture corpus includes Flowers/Seasons, red fives, removed Sanma ranks and American Jokers.

Keep two concepts separate:

```ts
export type CanonicalTileFace =
  | { family: 'suit'; suit: string; rank: number }
  | { family: 'wind'; wind: string }
  | { family: 'dragon'; dragon: string }
  | { family: 'flower'; id: string }
  | { family: 'season'; id: string }
  | { family: 'joker'; id: string };

export type PhysicalTileEvidence = {
  face: CanonicalTileFace;
  traitIds?: string[];   // e.g. red-five physical variant
};
```

Exact final TypeScript naming may differ, but the semantic rule is fixed:

> **structural face identity and physical/scoring variants are separable.**

A red five remains structurally a five of its suit while retaining a red trait for Riichi dora calculation. A North tile used as Sanma nuki-dora remains a North tile; extraction/nuki is event/evidence state rather than a new tile face. A Joker is a real tile identity only in tile sets/profiles that permit it.

Current Classical code may continue using `PlayingTile` behind an adapter while these universal primitives are introduced additively.

Tile-set config:

```ts
export type ResolvedTileSetConfig = {
  presetId: string;
  options: JsonObject; // validated by selected tile-set registry entry
};
```

Initial architecture fixtures require:

```text
tiles.standard-136
tiles.flowers-144
tiles.riichi-136
tiles.riichi-red-fives
tiles.sanma-108
tiles.american-joker-capable
```

The tile-set registry owns multiplicity, excluded tiles/ranks and physical variants. It does **not** decide score value.

---

# 7. Hand shape and hand-evidence boundary

## 7.1 Hand shape

```ts
export type ResolvedHandShapeConfig = {
  presetId: string;
  options: JsonObject;
};
```

Initial architecture fixtures require:

```text
shape.four-sets-pair
shape.five-sets-pair
shape.irregular-canonical
shape.target-catalogue
```

Four sets + pair and BMJA Chow restrictions are not universal.

## 7.2 Do not universalise `MahjongHand`

The platform needs one **evidence envelope**, not one giant family-independent hand object.

Conceptually:

```ts
export type HandEvidenceEnvelope = {
  evidenceSchemaVersion: number;
  kind: string;                    // stable registered evidence codec id
  shared?: SharedHandEvidence;
  profilePayload: JsonObject;      // validated by the selected evidence codec
};
```

Family runtimes use typed codecs/generics internally. `profilePayload` is not unchecked JSON at runtime.

Shared primitives may include canonical tile faces, grouped sets, exposure state and winning-tile provenance where semantics match. A family may add evidence without polluting every other hand type.

Migration examples:

```text
Classical current profiles
  → adapter over existing MahjongHand + GameContext

MCR
  → shared grouped-hand primitives + MCR context/evidence

Riichi
  → shared grouped-hand primitives + RiichiScoreEvidence

American target catalogue
  → target-catalogue evidence codec with Joker/exposure semantics
```

This also keeps future voice interpretation clean: speech maps into the active profile's validated evidence contract; it does not need a universal “VoiceHand”.

---

# 8. Validation boundary

Validation has two layers.

Universal structural validation may safely check things such as:

- tile identity exists in the selected tile set;
- copy/multiplicity constraints;
- generic data/schema correctness;
- group primitives are structurally well-formed where that evidence codec uses groups.

Family/profile validation is selected by policy:

```ts
export type ResolvedValidationConfig = {
  handShapePolicyId: string;
  policyIds: string[];
};
```

Examples:

```text
validation.classical-current
validation.classical-bmja-max-one-chow
validation.mcr-winning-shape
validation.taiwanese-five-sets-pair
validation.riichi-winning-shape
validation.sanma-no-chii
validation.target-catalogue-match
```

The current `validateHand()` first moves behind `validation.classical-current` unchanged. Extraction/generalisation happens only with parity tests.

---

# 9. Scoring grammar union

```ts
export type ResolvedScoringConfig =
  | { grammar: 'classical-points-doubles'; config: ClassicalScoringConfigV1 }
  | { grammar: 'pattern-accumulator'; config: PatternAccumulatorConfigV1 }
  | { grammar: 'riichi-han-fu'; config: RiichiScoringConfigV1 }
  | { grammar: 'target-catalogue'; config: TargetCatalogueConfigV1 };
```

`identity.grammar` and `scoring.grammar` must match.

## 9.1 Classical

```text
intrinsic points
+ additive bonuses
→ base score
× doubles/multipliers
→ cap/limit/special treatment
```

`CLASSICAL_PROFILE_CONFIG_V1.md` remains authoritative design input. During migration its non-scoring fields may move to the universal envelope without changing scoring semantics.

## 9.2 Pattern accumulator

```ts
export type PatternAccumulatorConfigV1 = {
  configVersion: 1;
  unit: 'fan' | 'points' | 'tai';
  patternCatalogueId: string;
  interactionPolicyId: string;
  qualificationPolicyId: string;
  interpretationPolicyId: string;
  postQualificationBonusPolicyId?: string;
  floorPolicyId?: string;
  capPolicyId?: string;
  conversionPolicyId?: string;
};
```

This hosts HK/MCR/Taiwanese/Zung Jung with different interaction/qualification/conversion policies. It never implies “sum all matches blindly”.

## 9.3 Riichi han + fu

```ts
export type RiichiScoringConfigV1 = {
  configVersion: 1;
  yakuCatalogueId: string;
  yakumanCatalogueId: string;
  decompositionPolicyId: string;
  doraPolicyId: string;
  fuPolicyId: string;
  limitTierPolicyId: string;
  handValuePolicyId: string;
};
```

EMA architecture remains binding:

```text
enumerate legal interpretations
→ evaluate yaku/han/dora/fu
→ reject no-yaku interpretations
→ calculate lawful value
→ choose maximum lawful result deterministically
```

Sanma uses this same grammar with different table/tile/dora/settlement/progression policies.

## 9.4 Target catalogue

```ts
export type TargetCatalogueConfigV1 = {
  configVersion: 1;
  catalogueRef: { id: string; version: string };
  matchPolicyId: string;
  substitutionPolicyId: string;
  exposurePolicyId: string;
  valuePolicyId: string;
};
```

Engine capability remains independent of catalogue licensing/distribution.

---

# 10. Score-result boundary

Do not widen Classical `ScoreBreakdown` until it means everything.

```ts
export type HandScoreResult =
  | ClassicalHandScoreResult
  | PatternAccumulatorHandScoreResult
  | RiichiHandScoreResult
  | TargetCatalogueHandScoreResult;
```

Common audit header:

```ts
export type HandScoreAuditHeader = {
  grammar: ScoringGrammarId;
  profile: RulesProfileRef;
  rulesFingerprint: string;
  legal: boolean;
  explanation: ScoreExplanationEntry[];
  matchedCanonicalPatternIds: string[];
};
```

Grammar-specific bodies retain their actual concepts:

- Classical: points/doubles/cap/special treatment;
- accumulator: bindings/interactions/qualifying subtotal/bonuses/conversion;
- Riichi: yaku/han/dora/fu/tier/payment input;
- target catalogue: target match/substitution/exposure/value.

Current `ScoreBreakdown` becomes the Classical body/adapter initially.

---

# 11. Evidence contract

```ts
export type ResolvedEvidenceConfig = {
  policyIds: string[];
  alwaysRequired: string[];
};

export type EvidenceRequirement = {
  id: string;
  requirement: 'required' | 'optional' | 'not-needed';
  reasonIds: string[];
};
```

Runtime:

```ts
requiredEvidence(
  profile: ResolvedRulesProfile,
  context: PartialHandContext
): EvidenceRequirement[];
```

A field appears only when active rules/context require it.

Examples include winning method/provenance, Winds, Standing Hand, liability, riichi declaration, furiten/ippatsu, dora indicators, honba, riichi sticks and nuki-dora count.

Similar labels are not merged until semantics are proven.

---

# 12. Strategy references

```ts
export type ResolvedStrategyRef = {
  id: string;
  params: JsonObject; // validated by strategy registry schema
};
```

## Settlement

All strategies emit neutral transactions:

```ts
export type SettlementTransaction = {
  from: LedgerPartyId;
  to: LedgerPartyId;
  amount: number;
  reasonId: string;
  metadata?: JsonObject;
};
```

No mandatory universal `eastMultiplier`; no British-only reason union.

## Progression

Returns next profile-owned strategy state.

Initial examples include Classical East cycle, rotate-every-hand, always-pass, Riichi renchan and Sanma renchan.

## Game end

Game completion is an explicit strategy. Generic orchestration must not infer universal completion from BMJA prevailing-Wind advancement.

---

# 13. Round outcome / strategy state

Current single-winner/draw `HandOutcome` remains a legacy current-profile type.

Universal envelope:

```ts
export type ResolvedRoundOutcome = {
  kind: string;
  payload: JsonObject; // validated by active family/profile codec
};
```

This can represent current Classical win/draw, MCR win, Riichi ron/tsumo, multi-ron, exhaustive draw and future profile-owned results without adding every possibility to one union.

Game orchestration may carry profile-owned `strategyState`, likewise codec-validated.

This matches the existing cloud contract: generic envelope + profile-owned validated replay payload.

---

# 14. Canonical resolution and fingerprint

Resolver contract:

```text
load exact base id/version
→ validate authoring identity
→ validate each capability override
→ apply through capability registry
→ resolve all preset/catalogue/strategy IDs
→ validate cross-field invariants
→ produce complete resolved profile
→ project executable semantic fields
→ canonicalise JSON
→ SHA-256 fingerprint
→ freeze/treat immutable
```

Fingerprint includes executable family/grammar/table/tile/hand/validation/scoring/evidence/settlement/progression/game-end semantics and exact executable catalogue/version references.

Exclude display labels, translations/help text and decorative presentation metadata.

Recursively sort object keys; preserve semantically ordered arrays. Do not fingerprint raw insertion-order `JSON.stringify()`.

Fingerprint is an integrity/replay guard, not a substitute for exact profile identity/version.

---

# 15. Published/custom persistence

Published reviewed profiles/catalogues remain version-controlled application assets initially.

Future Plus custom profiles store:

```text
custom_profile
  identity/owner/name

custom_profile_version
  base profile id/version
  overrides JSON
  frozen resolved snapshot
  rules fingerprint
  creation/version metadata
```

Editing a club/table profile creates a new version. Old games never silently reinterpret.

No D1 work is required in #227.

---

# 16. Capability contract

Customisable options are registered metadata, conceptually:

```ts
export type ProfileCapabilityDefinition = {
  id: string;
  grammar: ScoringGrammarId;
  familyIds?: string[];
  valueSchemaId: string;
  customisable: boolean;
  requires?: string[];
  conflicts?: string[];
  evidenceIds?: string[];
  presentationKey: string;
  category: string;
  advanced: boolean;
};
```

The same metadata later drives override validation, profile diffing and Plus “How does your table play?” UI.

---

# 17. Fail-closed rules

Reject deterministically:

- unknown profile/version/grammar;
- grammar mismatch between identity and scoring config;
- unknown/unavailable registry ID;
- unknown or forbidden capability override;
- cross-family/grammar capability misuse;
- additional unvalidated fields;
- malformed strategy params;
- unresolved architecture placeholders in a playable profile;
- custom grammar mutation;
- target catalogue without exact version;
- saved game whose exact pinned profile/fingerprint cannot be resolved.

Never fall back to “latest” or a nearby profile.

---

# 18. Compiler/runtime boundary

Conceptually:

```ts
export interface RulesRuntime<
  THandEvidence,
  TScore extends HandScoreResult,
  TRoundOutcome,
  TStrategyState
> {
  profile: ResolvedRulesProfile;
  validateHand(evidence: THandEvidence): ValidationResult;
  scoreHand(evidence: THandEvidence): TScore;
  requiredEvidence(context: PartialHandContext): EvidenceRequirement[];
  settleRound(outcome: TRoundOutcome, state: TStrategyState): SettlementTransaction[];
  progressGame(outcome: TRoundOutcome, state: TStrategyState): TStrategyState;
  isGameComplete(state: TStrategyState): boolean;
}
```

Named profiles become:

```text
published/custom manifest
→ resolve/validate
→ compileProfile()
→ typed RulesRuntime
```

Current `BMJA_RULESET`, `WESTERN_TM_RULESET` and `OUTSIDE_THE_BOX_RULESET` are migration adapters first and compiled outputs only after parity is proven.

---

# 19. Deliberate exclusions

#227 does not permit or require:

- arbitrary expressions/JSONLogic;
- user-authored JavaScript;
- generic rule scripting;
- full wall/draw/discard simulation;
- one universal event log of every tile action;
- one universal hand-evidence object;
- one giant hand-score object;
- server-side scoring authority;
- fuzzy/name-based pattern equivalence;
- unlicensed current commercial catalogue distribution.

---

# 20. Acceptance gate

The envelope is Codex-ready only when the architecture fixtures prove all eight external profile families can be represented while invalid cross-family combinations fail.

Implementation should then be mechanical:

```text
define types/schemas
→ define registries
→ make eight architecture manifests validate
→ make negative fixtures fail
→ fingerprint deterministically
→ adapt current runtime behind compiler boundary
→ prove BMJA/T&M/OTB parity
```

If implementation exposes an unresolved Mahjong-domain decision, pause the slice and amend this contract outside Codex before continuing.
