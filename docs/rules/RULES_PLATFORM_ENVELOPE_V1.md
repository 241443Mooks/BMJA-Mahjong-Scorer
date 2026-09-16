# Rules platform envelope v1

Status: **pre-Codex implementation contract for #227**  
Branch target: `integration/rules-platform-v1`  
Derived from: `EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md`, `EIGHT_RULESET_PAPER_MANIFESTS.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`, `MCR_PROFILE_CROSSWALK.md`, `riichi/EMA_2025_ARCHITECTURE_DECISIONS.md`, and `CROSS_PROFILE_CLOUD_GAME_CONTRACT.md`.

## 1. Purpose

Define the smallest universal contract that can host materially different Mahjong rules families without turning the application into either:

- a pile of bespoke scorers; or
- one giant switchboard containing every Mahjong concept.

This document settles the platform boundary before Codex changes runtime code.

> **The universal layer describes the table, tile set, hand grammar, scoring grammar, required evidence and finite strategies. Family modules own scoring semantics. Published and custom profiles resolve to one immutable executable snapshot.**

The universal layer does **not** calculate Mahjong. It selects and configures registered code that does.

## 2. Core invariants

1. A profile has exactly one scoring grammar.
2. A profile may only select capabilities registered for that grammar/family.
3. Shared canonical predicates describe structural/event truth, not score meaning.
4. Scoring, settlement, progression and game completion remain separate concerns.
5. Authoring inheritance is resolved before play; runtime never follows a mutable base-profile chain.
6. Published profiles and custom profiles produce the same resolved runtime shape.
7. Unknown IDs, unknown fields and incompatible overrides fail closed.
8. No profile contains JavaScript, callbacks, expression languages or arbitrary executable strings.
9. Every saved game pins exact profile identity **and** an immutable resolved-rules fingerprint/snapshot contract.
10. Existing BMJA/T&M/OTB behaviour must remain byte-for-byte/fixture-equivalent while the new platform is introduced alongside it.

---

# 3. Identity and version primitives

Retain the existing language-independent primitive:

```ts
export type RulesProfileRef = {
  id: string;
  version: string;
};
```

Add stable architecture identifiers:

```ts
export type ScoringGrammarId =
  | 'classical-points-doubles'
  | 'pattern-accumulator'
  | 'riichi-han-fu'
  | 'target-catalogue';

export type ProfileStatus =
  | 'published'
  | 'club'
  | 'provisional'
  | 'custom';
```

`familyId` is a stable namespaced string rather than a closed universal enum. Initial examples:

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

A new family ID does not imply a new scoring grammar.

---

# 4. Authoring profile versus resolved profile

## 4.1 Authoring definition

Humans and future Plus UI work with intent:

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

The `overrides` keys are **registered capability IDs**, not arbitrary object paths.

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

The authoring resolver must reject an override when:

- the ID is unknown;
- the base profile does not declare it customisable;
- its value fails the capability schema;
- it changes scoring grammar;
- it violates a declared require/conflict rule;
- it references an unavailable predicate/catalogue/strategy.

Changing grammar means choosing a different base profile, not applying an override.

## 4.2 Resolved runtime snapshot

Runtime consumes a complete snapshot:

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

There is no unresolved inheritance in this object.

---

# 5. Table, tile-set and hand-shape boundaries

These are universal because the eight-profile stress test proves they vary independently of scoring grammar.

## 5.1 Table

```ts
export type ResolvedTableConfig = {
  playerCount: 3 | 4;
  seatModelId: string;
  dealerModelId: string;
};
```

Initial registered examples:

```text
seats.winds-4
seats.riichi-winds-4
seats.riichi-sanma-east-south-west

dealer.classical-east
dealer.always-pass
dealer.riichi-renchan
```

Do not make East retention, four players or four seat winds platform invariants.

## 5.2 Tile set

```ts
export type ResolvedTileSetConfig = {
  presetId: string;
  options: JsonObject;
};
```

`options` is validated by the selected tile-set registry entry. It is not arbitrary runtime JSON.

Initial architecture fixtures require at least:

```text
tiles.standard-136
tiles.flowers-144
tiles.riichi-136
tiles.riichi-red-fives
tiles.sanma-108
tiles.american-joker-capable
```

The tile-set registry owns multiplicity, excluded ranks, red-tile identity, bonus/joker properties and any source-bound tile capability.

## 5.3 Hand shape

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

Family modules may additionally register legal irregular structures/catalogues.

This is the seam that removes current BMJA assumptions such as globally fixed group count or a one-Chow rule from generic validation.

---

# 6. Validation boundary

Validation has two layers.

## 6.1 Universal structural validation

The platform may safely validate facts that are universally structural, for example:

- tile IDs exist in the selected tile set;
- physical copy counts do not exceed the selected tile-set multiplicity;
- supplied groups contain structurally valid tile combinations;
- required generic fields have the correct shape.

## 6.2 Profile/family validation

Everything else is selected by registered policy IDs:

```ts
export type ResolvedValidationConfig = {
  handShapePolicyId: string;
  policyIds: string[];
};
```

Examples:

```text
validation.classical-standard
validation.classical-bmja-max-one-chow
validation.mcr-winning-shape
validation.taiwanese-five-sets-pair
validation.riichi-winning-shape
validation.sanma-calls-no-chii
validation.target-catalogue-match
```

A rule such as “BMJA ordinary hand may contain at most one Chow” must never again be expressed as a universal `validateHand()` invariant.

---

# 7. Scoring grammar discriminated union

```ts
export type ResolvedScoringConfig =
  | {
      grammar: 'classical-points-doubles';
      config: ClassicalScoringConfigV1;
    }
  | {
      grammar: 'pattern-accumulator';
      config: PatternAccumulatorConfigV1;
    }
  | {
      grammar: 'riichi-han-fu';
      config: RiichiScoringConfigV1;
    }
  | {
      grammar: 'target-catalogue';
      config: TargetCatalogueConfigV1;
    };
```

The `identity.grammar` and `scoring.grammar` values must match exactly.

## 7.1 Classical points × doubles

Target semantics:

```text
intrinsic points
+ additive bonuses
→ base score
× configured doubles/multipliers
→ limit/cap/special treatment
```

`CLASSICAL_PROFILE_CONFIG_V1.md` remains the authoritative family design input for the first implementation proof. During migration it may be adapted/split so table/evidence/settlement/progression fields move into the universal envelope; its scoring semantics must not change merely for naming neatness.

## 7.2 Pattern accumulator

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

This grammar does **not** imply “sum every matched pattern”. The selected interaction policy controls combinations/exclusions/series rules.

Required architecture examples:

- Hong Kong — fan catalogue + profile minimum + fan/payment conversion;
- MCR — 81 fan + non-combination policy + 8-point qualification + Flower treatment;
- Taiwanese — additive tai + five-set hand grammar;
- Zung Jung — 44 patterns + same-series exclusion + floor/cap policy.

## 7.3 Riichi han + fu

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

The EMA architecture decision remains binding:

```text
enumerate legal decompositions
→ evaluate yaku/han/dora/fu
→ reject no-yaku interpretations
→ calculate lawful value
→ choose maximum lawful result deterministically
```

Sanma selects the same scoring grammar with different table/tile/call/dora/settlement/progression policies; it does not fork the scorer.

## 7.4 Target catalogue

```ts
export type TargetCatalogueConfigV1 = {
  configVersion: 1;
  catalogueRef: {
    id: string;
    version: string;
  };
  matchPolicyId: string;
  substitutionPolicyId: string;
  exposurePolicyId: string;
  valuePolicyId: string;
};
```

The platform supports a versioned target-matching engine independently from the legal/licensing question of distributing a commercial annual card.

---

# 8. Score-result boundary

Do not stretch the current Classical `ScoreBreakdown` into a universal result with dozens of nullable fields.

```ts
export type HandScoreResult =
  | ClassicalHandScoreResult
  | PatternAccumulatorHandScoreResult
  | RiichiHandScoreResult
  | TargetCatalogueHandScoreResult;
```

Every result carries a small common audit header:

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

Grammar-specific result bodies retain their real concepts:

- Classical: points, doubles, cap/limit, special treatment;
- accumulator: matched bindings, interaction decisions, qualifying subtotal, bonuses, conversion/cap;
- Riichi: yaku, han, dora, fu, tier/base value/payment input;
- target catalogue: matched target, substitutions, exposure legality, value.

A presentation adapter may derive a common UI summary. The domain result must not pretend these grammars are mathematically identical.

---

# 9. Evidence contract

Evidence is a registry of explicit physical-table facts required to score or progress a selected profile.

```ts
export type EvidenceFieldId = string;

export type ResolvedEvidenceConfig = {
  policyIds: string[];
  alwaysRequired: EvidenceFieldId[];
};

export type EvidenceRequirement = {
  id: EvidenceFieldId;
  requirement: 'required' | 'optional' | 'not-needed';
  reasonIds: string[];
};
```

Runtime interface:

```ts
requiredEvidence(
  profile: ResolvedRulesProfile,
  context: PartialHandContext
): EvidenceRequirement[];
```

A field is shown only when the active resolved profile/rules need it.

Initial stable namespaces should include examples such as:

```text
evidence.winning-method
evidence.winning-tile-provenance
evidence.seat-wind
evidence.round-wind
evidence.standing-hand
evidence.original-call
evidence.only-possible-tile
evidence.liable-player
evidence.riichi-declaration
evidence.ippatsu-eligibility
evidence.furiten-status
evidence.dora-indicators
evidence.ura-dora-indicators
evidence.honba
evidence.riichi-sticks
evidence.nuki-dora-count
evidence.initial-hand-event
```

Do not overload one evidence ID merely because two rules have similar English labels. Exact semantics must be proven first.

---

# 10. Strategies: settlement, progression and game end

A strategy reference is generic but its parameters are validated by the selected registry entry.

```ts
export type ResolvedStrategyRef = {
  id: string;
  params: JsonObject;
};
```

`params` must pass the strategy's registered schema before the profile can resolve.

## 10.1 Settlement

All settlement strategies emit neutral transactions:

```ts
export type SettlementTransaction = {
  from: LedgerPartyId;
  to: LedgerPartyId;
  amount: number;
  reasonId: string;
  metadata?: JsonObject;
};
```

No universal `eastMultiplier` field. No fixed British reason union.

Required strategy fixtures include:

```text
settlement.classical-pairwise
settlement.hk-profile
settlement.mcr-2006
settlement.taiwanese-winner-only
settlement.zung-jung-formal
settlement.riichi-four-player
settlement.riichi-sanma
```

## 10.2 Progression

Progression returns the next profile-owned strategy state. Initial examples:

```text
progression.classical-east-cycle
progression.rotate-every-hand
progression.always-pass
progression.riichi-renchan
progression.riichi-sanma-renchan
```

## 10.3 Game end

Game completion is not hidden inside BMJA orchestration.

```text
game-end.classical-east-cycle
game-end.four-round-always-pass
game-end.zung-jung-profile
game-end.riichi-profile
game-end.riichi-sanma
```

The exact strategy list grows only from evidenced profiles.

---

# 11. Round outcome and profile strategy state

The current single-winner/draw outcome cannot be the universal contract.

Use a generic envelope with a validated profile-owned body:

```ts
export type ResolvedRoundOutcome = {
  kind: string;            // stable namespaced outcome ID
  payload: JsonObject;     // validated by active profile/family codec
};
```

Examples may include:

```text
classical.win
classical.draw
mcr.win
riichi.ron
riichi.tsumo
riichi.exhaustive-draw
riichi.abortive-draw
```

Likewise, game orchestration may carry a `strategyState` JSON payload, but it is always validated by a registered profile/family codec. It is not a universal untyped dumping ground.

This matches the existing cloud-game contract: generic envelope, profile-owned validated replay payload.

---

# 12. Canonical resolution and fingerprint

The resolver contract is:

```text
load exact base profile id/version
→ validate authoring identity
→ validate every override capability ID/value
→ apply overrides through capability registry
→ resolve every referenced preset/catalogue/strategy ID
→ validate cross-field invariants
→ produce complete resolved profile
→ canonicalise executable rules snapshot
→ fingerprint
→ deep-freeze / treat immutable
```

## Fingerprint rule

Use a deterministic cryptographic fingerprint (target: SHA-256) over canonical JSON of **executable resolved rule semantics**.

Include:

- family + grammar;
- table/tile/hand/validation configuration;
- scoring config and complete bound catalogue/version references required for execution;
- evidence policy IDs that change executable interpretation;
- settlement/progression/game-end/hand-mode/incident/procedure strategy IDs + validated params.

Exclude presentation-only mutable metadata such as:

- display label;
- translated strings;
- help copy;
- decorative category/order metadata.

Provenance remains stored separately and profile identity/version remains pinned. The fingerprint is an integrity/replay guard, not a substitute for profile identity.

Canonicalisation must recursively sort object keys and preserve array order where array order is semantic. Do not fingerprint normal `JSON.stringify()` output unless canonical ordering has first been enforced.

---

# 13. Published and custom profile persistence

## Published profiles

Keep reviewed published profiles and catalogues as version-controlled application assets initially.

They are source-controlled, testable and ship with the deterministic rules core.

## Custom/club profiles

Future Plus persistence stores authoring intent and frozen resolution:

```text
custom_profile
- id
- owner_user_id
- name
- created_at

custom_profile_version
- id
- custom_profile_id
- version
- base_profile_id
- base_profile_version
- overrides_json
- resolved_profile_json
- rules_fingerprint
- created_at
```

A game pins the exact custom profile version/fingerprint used at creation/confirmation time.

Changing `Tuesday Club` later creates a new version; it never silently reinterprets old games.

This is a future D1 concern and does not require #227 to build the database.

---

# 14. Capability / override contract

Each user-configurable option is registered metadata, conceptually:

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

The resolver applies overrides through these definitions rather than arbitrary deep-object patching.

This is also the future source for a Plus “How does your table play?” UI.

---

# 15. Fail-closed compatibility rules

The following must be rejected deterministically:

- unknown profile ID/version;
- unknown grammar;
- `identity.grammar !== scoring.grammar`;
- unknown registry or strategy ID;
- unknown capability override;
- capability from another grammar/family;
- arbitrary additional fields in validated config;
- negative/NaN/infinite values where not explicitly legal;
- unresolved `research-required` placeholders in a playable published profile;
- custom profile attempting to change grammar;
- custom profile attempting to override a non-customisable authority field;
- target catalogue profile without an exact catalogue version;
- profile referencing an executable predicate/strategy unavailable in the current application build;
- saved game whose pinned profile/fingerprint cannot be resolved/validated.

No “best effort” fallback to the current/latest profile.

---

# 16. Platform compiler boundary

The target runtime entry point is conceptually:

```ts
export type RulesRuntime = {
  profile: ResolvedRulesProfile;
  validateHand(...args: unknown[]): ValidationResult;
  scoreHand(...args: unknown[]): HandScoreResult;
  requiredEvidence(...args: unknown[]): EvidenceRequirement[];
  settleRound(...args: unknown[]): SettlementTransaction[];
  progressGame(...args: unknown[]): ProfileStrategyState;
  isGameComplete(...args: unknown[]): boolean;
};

export function compileProfile(profile: ResolvedRulesProfile): RulesRuntime;
```

The implementation should use proper typed generic/family adapters rather than literally `unknown[]`; the pseudotype above describes the architectural boundary only.

Named rulesets become data + registered strategies:

```text
published profile manifest
→ resolve/validate
→ compileProfile()
→ RulesRuntime
```

Current hand-written `BMJA_RULESET`, `WESTERN_TM_RULESET` and `OUTSIDE_THE_BOX_RULESET` become migration adapters first, then eventually compiled outputs once parity is proven.

---

# 17. Deliberate exclusions

#227 does not design or permit:

- arbitrary expressions/JSONLogic;
- user-authored JavaScript;
- general-purpose rule scripting;
- full physical wall/draw/discard simulation;
- a universal event log of every tile action;
- server-side scoring authority;
- one giant universal hand-score structure;
- automatic equivalence of similarly named patterns;
- current NMJL card reproduction/distribution without an approved lawful catalogue path.

---

# 18. Acceptance gate

The envelope is ready for implementation only when the architecture fixtures prove that one schema can represent and validate all eight external paper profiles while rejecting invalid cross-family combinations.

Implementation is then mechanical:

```text
define types/schemas
→ define registries
→ make eight manifests validate
→ make negative manifests fail
→ fingerprint deterministically
→ adapt current runtime behind compiler boundary
→ prove BMJA/T&M/OTB parity
```

If coding discovers an unresolved Mahjong-domain decision, implementation pauses and the contract is amended outside Codex before proceeding.
