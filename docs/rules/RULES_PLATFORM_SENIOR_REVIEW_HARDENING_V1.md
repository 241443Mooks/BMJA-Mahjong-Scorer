# Rules platform senior-review hardening v1

Status: **normative amendment to #227 before implementation**\
Target branch: `integration/rules-platform-v1`\
Applies to: `RULES_PLATFORM_ENVELOPE_V1.md`, `RULES_PLATFORM_REGISTRY_INVENTORY.md`, `RULES_PLATFORM_ARCHITECTURE_FIXTURES.md`, `RULES_PLATFORM_MIGRATION_AND_CODEX_HANDOFF.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`, and implementation slices 227-A through 227-H.

## 1. Precedence

This document is a narrow hardening patch after senior-development review. It does **not** redesign the architecture.

Where this document conflicts with an earlier #227 design document, **this document wins** until the older document is consolidated in a later documentation-cleanup pass.

The four scoring grammars, immutable resolved profiles, score-neutral canonical predicates, typed registries, family/profile-owned evidence, and strangler migration remain unchanged.

---

## 2. Make the family contract explicit

`familyId` must not be an untyped label from which `compileProfile()` guesses codecs and semantics.

Introduce a typed family registry. Conceptually:

```ts
export type RulesFamilyDefinition = {
  id: string;
  allowedGrammars: readonly ScoringGrammarId[];
  handEvidenceCodecId: string;
  roundOutcomeCodecId: string;
  strategyStateCodecId: string;
  allowedTileSetIds?: readonly string[];
  allowedSeatModelIds?: readonly string[];
};
```

A resolved profile pins the family definition semantically, either by explicit codec references in the snapshot or by a versioned family registry reference included in the executable semantic projection.

`compileProfile()` must never infer a hand/outcome/state codec from display names or loose `familyId` string conventions.

Initial family IDs remain those already identified, including Classical/Western, MCR, Hong Kong, Taiwanese, Zung Jung, Riichi, Riichi/Sanma and American target-catalogue families.

---

## 3. Root and derived authoring definitions are different types

The previous conceptual `ProfileAuthoringDefinition` required `baseProfile`, which is correct for custom/derived profiles but not for published root profiles.

Use a discriminated contract:

```ts
export type RootProfileDefinition = {
  kind: 'root';
  schemaVersion: 1;
  identity: ProfileAuthoringIdentity;
  definition: JsonObject; // validated by family/grammar schemas
};

export type DerivedProfileDefinition = {
  kind: 'derived';
  schemaVersion: 1;
  identity: ProfileAuthoringIdentity;
  baseProfile: RulesProfileRef;
  overrides: Record<string, JsonValue>;
};

export type ProfileAuthoringDefinition =
  | RootProfileDefinition
  | DerivedProfileDefinition;
```

Published profiles may be roots or deliberately derived published profiles. Custom/club profiles normally use `derived`.

No root profile may accidentally inherit from itself or rely on an implicit base.

---

## 4. Hand scoring consumes evidence **and trusted game context**

Do not make `scoreHand(evidence)` the universal signature.

Introduce a hand-evaluation input boundary:

```ts
export type HandEvaluationInput<THandEvidence, TContext> = {
  evidence: THandEvidence;
  context: TContext;
};
```

The family codec validates evidence. The runtime/family validates trusted context. Context may include seat/dealer/round state or other profile-owned facts supplied by active game orchestration rather than manually entered in the hand.

This preserves the current Classical distinction between `MahjongHand` and `GameContext` while allowing MCR/Riichi/other families to have their own typed context.

`requiredEvidence()` must distinguish facts already supplied by trusted context from facts the user still needs to confirm.

---

## 5. Add an explicit round-resolution boundary

Scoring decides what accepted hand evidence is worth. Settlement decides who owes whom. Progression decides the next game state. Those concerns remain separate, but settlement/progression need a complete accepted round record.

Introduce a generic round-resolution envelope, conceptually:

```ts
export type RoundResolution<
  TRoundOutcome,
  TAcceptedScoreResult,
  TRoundEvidence = JsonObject,
> = {
  outcome: TRoundOutcome;
  acceptedScores: readonly TAcceptedScoreResult[];
  roundEvidence?: TRoundEvidence;
};
```

Family-owned codecs/types define the exact payloads.

Examples:

- Classical may carry accepted scores for all four players plus current incidents;
- MCR may carry winner score plus discard/self-draw outcome evidence;
- Riichi may carry one or more winner score results, exhaustive-draw/tenpai facts, counters/pot facts and liability evidence;
- OTB incidents remain round-level facts rather than being forced into hand scoring.

Settlement and progression therefore consume the accepted `RoundResolution` plus strategy state, not a bare `outcome` alone.

A corrected conceptual runtime is:

```ts
export interface RulesRuntime<
  THandEvidence,
  THandContext,
  TScore extends HandScoreResult,
  TRoundOutcome,
  TRoundResolution,
  TStrategyState,
> {
  profile: ResolvedRulesProfile;
  validateHand(input: HandEvaluationInput<THandEvidence, THandContext>): ValidationResult;
  scoreHand(input: HandEvaluationInput<THandEvidence, THandContext>): TScore;
  requiredEvidence(context: PartialHandContext): EvidenceRequirement[];
  settleRound(round: TRoundResolution, state: TStrategyState): SettlementTransaction[];
  progressGame(round: TRoundResolution, state: TStrategyState): TStrategyState;
  evaluateGameEnd(round: TRoundResolution | null, state: TStrategyState): GameEndResult;
}
```

Exact implementation names may differ; this semantic boundary is normative.

---

## 6. Game completion returns a result, not only a boolean

Replace the universal conceptual `isGameComplete(state): boolean` boundary with an evaluative result:

```ts
export type GameEndResult = {
  complete: boolean;
  reasonId?: string;
  finalisation?: {
    transactions?: readonly SettlementTransaction[];
    payload?: JsonObject;
  };
};
```

This allows profile-specific completion reasons and finalisation without pushing them into progression or ordinary hand settlement.

Examples include final riichi-pot handling, final ranking/adjustment payloads, or profile-specific end conditions.

A simple Classical adapter may return only `{ complete: boolean }` initially.

---

## 7. Executable registry semantics are versioned

Stable registry IDs are not sufficient for historical deterministic replay if the implementation behind an ID later changes.

Every executable registry entry whose semantics can affect legality, scoring, settlement, progression, evidence requirements or game completion must have a **semantic revision**.

Conceptually:

```ts
export type ExecutableRegistryIdentity = {
  id: string;
  semanticRevision: number;
};
```

A resolved profile must pin the semantic revision of every executable dependency in its executable semantic projection/fingerprint.

Examples:

```text
pattern.big-three-dragons@1
validation.classical-current@1
settlement.classical-pairwise@1
progression.classical-east-cycle@1
```

Rules:

1. Refactoring with proved identical semantics may retain the revision.
2. Any intentional or bug-fix change that can change an accepted result/replay increments the semantic revision.
3. Old saved games must never silently execute against a different semantic revision.
4. If an old revision is no longer available, replay must fail explicitly rather than substitute the newest implementation.

The profile `id@version` remains required; registry semantic revisions are an additional replay/integrity guard, not a replacement.

---

## 8. Dealer identity and progression have one source of truth

Earlier documents accidentally blurred dealer representation and dealer progression.

Correct boundary:

- **seat/dealer model** describes how dealer/seat identity is represented in table/strategy state;
- **progression strategy** alone decides whether dealer/seat assignment is retained, passed or rotated after a round.

Therefore IDs such as `dealer.always-pass`, `dealer.rotate-every-hand`, `dealer.riichi-renchan` and `dealer.riichi-sanma-renchan` must **not** encode transition policy.

Prefer neutral dealer-model identities such as:

```text
dealer.east-seat
dealer.none-or-profile-state
```

or omit a separate dealer model entirely where the seat/strategy-state codec already represents dealer identity cleanly.

The implementation slice must choose one clean representation; it must not allow both `dealerModelId` and `progression.*` to disagree about passing/retention.

Architecture manifests that currently use transition-flavoured `dealerModelId` values are interpreted as paper shorthand only. Their executable form must be normalised before becoming playable.

---

## 9. Canonical registry category inventory additions

The registry inventory must include every reference category actually used by the normalised manifests. Add explicit categories/namespaces for:

```text
family.*
evidence-policy.*
interpretation.*
riichi-decomposition.*
riichi-limit-tier.*
riichi-hand-value.*
target-match.*
target-exposure.*
target-value.*
```

Together with the existing tile, seat, hand-shape, validation, predicate, condition, wait, event, evidence-field, scoring-catalogue/policy, settlement, progression, game-end, incident/procedure and target-catalogue registries, this is the authoritative category set for V1.

Every ID in every architecture manifest must resolve to **exactly one** typed registry category.

No manifest-only namespace is allowed to emerge by accident.

---

## 10. Canonical fingerprinting distinguishes ordered arrays from sets

Object keys are sorted recursively as already specified.

Additionally, every array field in the semantic projection must be declared either:

- **ordered** — order is semantically meaningful and must be preserved; or
- **set-like** — order is irrelevant and canonicalisation sorts/deduplicates by stable semantic identity before hashing.

Examples likely to be set-like include `policyIds`, `incidentPolicyIds`, many capability collections and some evidence-ID lists.

Examples likely to be ordered include explicitly ordered calculation/priority sequences where the selected policy says order affects behaviour.

Two profiles that differ only in insertion order of a set-like array must have the same fingerprint.

---

## 11. Purity and determinism are platform invariants

All executable scoring/validation/predicate/settlement/progression/game-end registry entries must be deterministic functions of explicit validated inputs.

They must not depend on:

- current clock/time;
- randomness;
- network calls;
- mutable process-global state;
- UI state;
- database access;
- hidden environment-specific state.

Side effects belong outside the rules core.

This preserves the existing scorer's strong pure-function model and makes offline/mobile replay practical.

---

## 12. Classical V1 amendment — additive concealed-hand bonus

`CLASSICAL_PROFILE_CONFIG_V1.md` omitted the additive concealed-hand bonus that the European Classical stress test proved must exist separately from the concealed-hand double.

Normative amendment to `ClassicalProfileConfigV1.bonuses`:

```ts
bonuses: {
  onlyPossibleTile: number;
  standingHand: number;
  noChows: number;
  scorelessHand: number;
  lastWall: number;
  looseTile: number;
  completedPairMinor: number;
  completedPairMajor: number;
  concealedHand: number; // additive points; independent of doubles.concealedHand
};
```

Stable capability ID:

```text
classical.bonus.concealed-hand
```

It is **not** an alias for `classical.double.concealed-hand`; a profile may enable either, both or neither.

Until `CLASSICAL_PROFILE_CONFIG_V1.md` is consolidated, this amendment supersedes its earlier TypeScript example.

---

## 13. TypeScript implementation hardening

At untrusted persistence/import boundaries, validate with the project's existing schema approach (Zod is already available).

Inside source-owned code, prefer typed builders/helpers for profile/registry definitions so obvious family/grammar/category mistakes are caught by TypeScript before runtime validation.

Do not rely on TypeScript function-parameter bivariance for registry correctness. The repository currently has `strictFunctionTypes: false`; registry APIs must therefore enforce category/input/output compatibility explicitly through generic/container design and runtime schema checks where appropriate.

Changing the repository-wide compiler flag is **not** required by #227.

---

## 14. New/updated acceptance fixtures

Add these to the #227 architecture test contract:

### H01 — family codec pinning

A resolved profile explicitly resolves the correct hand-evidence, round-outcome and strategy-state codecs through its family definition; an incompatible codec/family combination fails.

### H02 — root vs derived definitions

A valid root profile resolves without a base. A derived profile requires an exact base `id@version`. Self/cyclic inheritance fails.

### H03 — hand context separation

The same structural hand evidence can produce different lawful evaluation where trusted profile-owned game context legitimately differs, without mutating the hand evidence object.

### H04 — round resolution supplies settlement

Classical settlement receives accepted player scores through `RoundResolution`; Riichi-shaped fixture can carry two winner score results. A bare outcome is insufficient for strategies that require score results.

### H05 — semantic revision changes fingerprint

Changing only an executable registry dependency from semantic revision 1 to 2 changes the resolved fingerprint even when its stable ID is unchanged.

### H06 — missing historical semantic revision fails replay

A pinned old registry revision that is unavailable fails explicitly; resolver/compiler never substitutes the latest revision.

### H07 — game-end finalisation

A game-end strategy can return a completion reason and optional finalisation transaction/payload without changing ordinary round settlement.

### H08 — dealer/progression disagreement impossible

The executable profile model has one source of truth for dealer transition. No profile can independently configure contradictory dealer-retention and progression policies.

### H09 — registry namespace completeness

Every referenced ID in all eight architecture manifests resolves to exactly one registered category. Unknown namespace/category references fail.

### H10 — set-like fingerprint canonicalisation

Two semantically identical profiles whose set-like arrays use different insertion order resolve to the same fingerprint.

### H11 — deterministic rule core

Test doubles/guards demonstrate registry evaluators receive all required input explicitly; rules-platform contracts expose no clock/network/database dependency.

### H12 — concealed bonus independence

A Classical fixture can enable additive concealed-hand points and concealed-hand doubles independently and simultaneously.

---

## 15. Updated senior sign-off gate

227-A may start only when implementation treats this document as normative.

The architecture remains approved. These amendments are contract hardening, not a request to reopen the four-grammar/family design.

If Codex discovers a domain question beyond this contract, it must still stop the affected slice and return the question rather than inventing semantics.
