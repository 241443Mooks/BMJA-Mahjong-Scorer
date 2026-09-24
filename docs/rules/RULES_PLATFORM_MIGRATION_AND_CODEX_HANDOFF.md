# Rules platform migration and Codex handoff

Status: **pre-implementation delivery contract for #227**\
Integration branch: `integration/rules-platform-v1`\
Feature branch for this design packet: `docs/227-rules-platform-contract`

## 1. Objective

Change the foundations of Mahjong Reference without gambling the working product.

Two requirements are equally important:

1. make the rules architecture genuinely extensible across families/variants; and
2. preserve the current BMJA/T&M/Outside-the-Box product until the replacement path has independently proved equivalence.

> **This is a strangler migration, not a rewrite. New infrastructure is introduced beside the current runtime, current behaviour remains authoritative until parity passes, and `main` is not the experimentation branch.**

Codex receives implementation decisions, not domain questions.

---

# 2. Branch and deployment safety model

## Production

```text
main
→ production deployment
→ mahjong.smooks.co.uk
```

`main` remains the known-good product branch.

## Rules-platform integration

```text
integration/rules-platform-v1
```

All #227/#219 platform migration PRs target this branch first.

Individual work uses short feature branches:

```text
integration/rules-platform-v1
    ↑
feature/rules-platform-envelope
feature/rules-platform-registries
feature/rules-platform-resolver
feature/rules-platform-runtime-adapter
...
```

When Cloudflare branch previews are configured, the integration branch should have a stable preview deployment. That preview is the environment for manual end-to-end use before any integration-to-main PR.

## Promotion to production

Only after the complete migration gate passes:

```text
integration/rules-platform-v1
→ final reviewed PR into main
→ production deployment
```

No rules-platform child PR should target `main` merely because its unit tests pass.

---

# 3. Current production seams that must be preserved

The current code is not “wrong”; it is the reference implementation that proves current behaviour.

## `game/ruleset.ts`

Current state:

- hand-built `BMJA_RULESET`;
- hand-built `WESTERN_TM_RULESET`;
- hand-built `OUTSIDE_THE_BOX_RULESET`;
- one Map keyed by `id@version`;
- all three route through the Classical `scoreHand()`;
- BMJA/T&M directly reuse BMJA settlement/progression;
- OTB supplies special-hand bindings, a handwritten scoring policy, incident preparation/settlement and Goulash mode.

Migration role:

> Treat these objects as legacy adapters and parity oracles until compiled resolved profiles replace them.

Do not delete or rewrite them in the first platform slice.

## `scoring/types.ts`

Current shared hand/scoring model contains legitimate reusable primitives:

- suits/Winds/Dragons;
- Chow/Pung/Kong/pair;
- exposed/concealed;
- grouped and ungrouped tile evidence;
- winning tile provenance;
- several winning-method/event facts.

It also contains Classical-specific result semantics:

- `RuleResult.unit = points | doubles`;
- `ScoreBreakdown.basePoints`;
- `ScoreBreakdown.doubles`;
- `limitApplied`;
- `scoringMode`.

Migration role:

> Keep `ScoreBreakdown` unchanged as the Classical result body. Introduce a new discriminated platform result **around/beside it**, not by adding MCR/Riichi fields to it.

## `scoring/validation.ts`

Current validation mixes:

- safe structural checks;
- ordinary four-sets+pair assumptions;
- BMJA max-one-Chow;
- Goulash-specific blank rules;
- Classical initial-deal/event semantics;
- 13/14 structural-tile assumptions;
- special-fishing/catalogue logic.

Migration role:

> First place this entire current validator behind a `validation.classical-current` adapter. Then extract profile-neutral structural checks and named policy checks incrementally. Do not alter existing outcomes during the first seam change.

## `game/types.ts`

Current universal-looking types are in fact Classical-shaped:

- exactly four Winds/seats;
- single winner or draw;
- `HandMode = normal | goulash`;
- fixed OTB/British incidents;
- fixed settlement reason union;
- mandatory `eastMultiplier`;
- scalar score for every player;
- BMJA progression state;
- `GameState` top-level prevailing Wind/East-cycle/Goulash fields;
- `GameRuleset.scoreHand -> ScoreBreakdown`.

Migration role:

> Do not widen these unions until they contain every future family. Introduce new platform envelopes beside them and adapt current types into those envelopes.

## `game/game.ts`

Current orchestration:

- requires exactly four players;
- requires four unique Wind seats;
- constructs BMJA-shaped state;
- normalises scalar score records;
- calls selected ruleset settlement/progression;
- hard-codes game completion using prevailing-wind advancement and north-round logic.

Migration role:

> Existing `createBmjaGame` / replay remains intact for parity. New generic orchestration is introduced only after profile-owned table/progression/game-end interfaces exist.

---

# 4. No-big-bang rule

At no point should one commit simultaneously:

- replace profile resolution;
- rewrite validation;
- rewrite scoring;
- rewrite settlement;
- rewrite game state;
- rewrite persistence/UI.

Each seam must be independently reversible.

Preferred pattern:

```text
old implementation remains
+ new interface/module added
+ adapter makes old implementation satisfy new interface
+ parity tests prove output
+ callers migrate
+ old implementation removed only in a later explicit cleanup
```

---

# 5. Pre-Codex design gate

Codex implementation may start only when these documents exist and agree:

- `RULES_PLATFORM_ENVELOPE_V1.md`;
- `RULES_PLATFORM_REGISTRY_INVENTORY.md`;
- `RULES_PLATFORM_ARCHITECTURE_FIXTURES.md`;
- `EIGHT_RULESET_PAPER_MANIFESTS.md` normalised to the envelope;
- this migration/handoff document;
- existing `CLASSICAL_PROFILE_CONFIG_V1.md`;
- existing MCR crosswalk;
- existing EMA Riichi architecture decisions.

If those documents conflict, resolve the documents first.

---

# 6. Codex operating rule

Every implementation prompt should contain:

```text
1. exact branch/base
2. exact files/docs to read
3. explicit files/seams it may change
4. explicit domain decisions already made
5. acceptance tests/fixtures
6. current behaviour that must remain unchanged
7. stop condition for unresolved domain semantics
```

Codex must **not**:

- research Mahjong rules while coding;
- infer equivalence from names;
- invent a new registry/grammar because implementation is awkward;
- widen scope to “clean up” unrelated current code;
- migrate production callers before parity tests exist;
- merge feature work directly to `main`.

If a required semantic choice is not covered by the design packet, the correct implementation outcome is:

> **blocked by design question: <specific question>**

not an invented answer.

---

# 7. Mechanical implementation slices for #227

The slices below are deliberately small. They can become separate PRs into `integration/rules-platform-v1`.

## 227-A — platform types only

Goal: add the universal type/schema vocabulary with **zero runtime caller changes**.

Implement:

- `ScoringGrammarId`;
- authoring and resolved profile envelope types;
- table/tile/hand/validation config types;
- discriminated scoring config type shells;
- generic `HandScoreResult` union boundary;
- generic evidence requirement type;
- generic strategy ref;
- generic settlement transaction envelope;
- generic profile-owned outcome/strategy-state envelope.

Acceptance:

- new type/schema tests compile;
- existing test suite unchanged/green;
- no existing scorer/game behaviour changed;
- no callers switched to new runtime.

## 227-B — registry contracts and stable IDs

Goal: implement registry containers/metadata, not Mahjong calculations.

Implement:

- typed registry helper with duplicate-ID rejection;
- registry categories from `RULES_PLATFORM_REGISTRY_INVENTORY.md`;
- capability metadata schema;
- placeholder **architecture-only** entries required by paper manifests;
- distinction between executable entries and unresolved architecture references.

Acceptance:

- duplicate IDs fail;
- unknown lookups fail;
- incompatible grammar/family capability validation fails;
- unresolved entries cannot compile a playable runtime;
- existing runtime untouched.

## 227-C — profile resolver and fingerprint

Goal: make authoring definition → complete immutable snapshot deterministic.

Implement:

- exact base profile lookup;
- capability-ID override application;
- allowed-value validation;
- require/conflict checks;
- cross-grammar/family checks;
- canonical JSON semantic projection;
- SHA-256 fingerprint;
- deep freeze/immutability convention.

Acceptance:

- same semantic profile in different object-key insertion order gives same fingerprint;
- semantic change gives different fingerprint;
- display-only metadata change does not change rules fingerprint;
- unknown/forbidden override fails closed;
- changing grammar via override fails;
- original base definition is never mutated.

## 227-D — eight architecture manifests as executable schema fixtures

Goal: prove the envelope rather than implement eight games.

Implement test fixtures representing:

- European Classical;
- Hong Kong;
- MCR;
- Taiwanese;
- Riichi;
- Sanma;
- Zung Jung;
- American/NMJL-style.

Important distinction:

- `ProfileArchitectureManifest` may explicitly mark source/strategy fields unresolved for design testing;
- `ResolvedRulesProfile` used for real play must contain **zero unresolved placeholders**.

Acceptance:

- all eight architecture manifests pass structural/family envelope validation;
- none with unresolved execution dependencies can compile as playable;
- corresponding invalid cross-grammar fixtures fail.

## 227-E — current runtime adapter / compiler shell

Goal: introduce `compileProfile()` without replacing current scorers.

Implement:

- compiler dispatcher by grammar;
- a Classical legacy adapter that can wrap the current `GameRuleset` behaviour;
- profile/runtime identity + fingerprint propagation;
- `requiredEvidence()` adapter surface;
- no MCR/Riichi scoring implementation.

Acceptance:

- BMJA, T&M and OTB can be exposed through the new runtime boundary while internally delegating to current implementations;
- direct legacy calls and adapter calls produce identical outputs on parity fixtures;
- old public callers remain in place initially.

## 227-F — generic transaction/outcome/progression/game-end seams

Goal: make the platform interfaces capable of non-Classical families without converting the current game orchestrator yet.

Implement:

- neutral transaction mapping from existing Classical settlement;
- generic outcome envelope/adapters for current win/draw;
- strategy-state/progression interface;
- explicit `isGameComplete` strategy interface;
- adapter around current BMJA completion semantics.

Acceptance:

- current settlement can round-trip through neutral transactions without changing balances;
- current win/draw outcomes adapt losslessly;
- BMJA current progression/completion outputs remain identical;
- type-level fixture can represent Riichi multi-winner/draw payload without changing current `HandOutcome` yet.

## 227-G — validation strategy seam

Goal: stop treating current Classical validator as universal, without changing current validation results.

Implement:

- profile-selected validation interface;
- `validation.classical-current` adapter around current `validateHand()`;
- clean separation point for safe structural checks vs profile checks;
- no mass extraction/refactor yet unless trivially behavior-preserving.

Acceptance:

- every existing validation fixture returns the same errors/result through adapter and direct old path;
- architecture fixture can select Taiwanese/Sanma validation IDs without them becoming executable before implementations exist.

## 227-H — parity harness and cutover guard

Goal: formalise the old-vs-new safety net.

Implement one reusable parity suite that runs current profiles through:

```text
legacy path
versus
resolved-profile/compiled adapter path
```

Minimum corpus:

- existing BMJA golden scoring fixtures;
- current special hands;
- T&M golden/catalogue tests;
- OTB ordinary scoring;
- OTB Goulash;
- OTB incidents/settlement;
- current progression;
- current persistence/replay profile identity.

Acceptance:

- no mismatches;
- mismatch output identifies profile + fixture + legacy/new result;
- integration branch cannot switch public callers until parity is fully green.

---

# 8. Boundary between #227 and #219

#227 ends when the **platform envelope and adapters are real**.

It does not implement Buzzard scoring.

Then #219 becomes mechanical:

```text
existing Classical rule predicates
→ registry-backed predicates/rules
→ Classical config resolver
→ Buzzard profile data
→ golden/source fixtures
```

#219 must use the #227 envelope rather than defining a parallel profile architecture.

After #219/Buzzard proves the Classical family, #220/#221 continue as already planned.

---

# 9. Subsequent family proofs

Do not implement every family in one Codex window.

Recommended proof order remains:

```text
#227 universal envelope/adapters
→ #219 Buzzard / Classical config proof
→ MCR pattern-accumulator grammar proof
→ Riichi four-player grammar proof
→ Sanma variant proof on same Riichi family
→ HK/Taiwanese/Zung Jung reuse of accumulator family
→ American target-catalogue when lawful catalogue path exists
```

The expensive reasoning/data work for later scorers happens outside Codex before each scorer implementation.

---

# 10. Current behaviour parity matrix

| Current behaviour | Legacy authority | New-path requirement before cutover |
|---|---|---|
| BMJA ordinary score | current `scoreHand` + golden tests | identical result/explanation |
| BMJA special hands | current special-hand detectors/tests | identical matched/result values |
| T&M catalogue/profile | current Western catalogue + pass/golden tests | identical bindings/results |
| OTB ordinary scoring | `outside-the-box-scoring.ts` | identical output before callback removal |
| OTB Goulash | current Goulash tests | identical validity/scoring/mode progression |
| OTB incidents | current incident tests | identical transactions/balances |
| Classical settlement | current settlement tests | neutral transaction adapter preserves result |
| dealer/round progression | current progression/game tests | same seats/Wind/completion |
| save/replay | current persistence tests | exact profile identity and replay unchanged |
| UI scorer handoff | current GameScorer/handoff tests | no user-visible regression |

No callback or legacy branch is removed in the same PR that first introduces its replacement.

---

# 11. Cutover gates on integration branch

Before routing current UI/game callers through the new platform:

- all existing tests green;
- #227 parity harness green;
- typecheck green;
- production build green;
- current BMJA/T&M/OTB manual smoke test green;
- saved-game recovery/replay smoke test green;
- mobile scorer/game flow smoke test green.

Before integration branch may merge to `main`:

- stable preview deployment exercised manually;
- no architecture fixture marked unresolved is accidentally public/playable;
- current profiles have no known parity delta;
- migration/recovery path documented;
- final integration diff reviewed as a release, not merely accumulated PRs.

---

# 12. Reversibility rules

To keep the project recoverable if the broader programme stalls:

- new platform modules must be additive initially;
- current public profile IDs remain stable;
- existing persisted games remain readable during migration;
- no destructive database migration is part of #227;
- no source profile is silently version-bumped;
- feature branches remain small/reviewable;
- old adapters are deleted only after an explicit later cleanup gate;
- `main` is always a valid rollback target until final promotion.

---

# 13. Definition of “Codex-ready”

A Codex slice is ready only when a competent programmer who does **not know Mahjong** can implement it correctly from:

- type/schema contract;
- registry IDs;
- target files;
- fixtures;
- old-behaviour parity requirements;
- explicit failure cases.

If the programmer needs to answer “what does this Mahjong rule mean?” to finish the slice, the preparation is incomplete.
