# EMA Riichi 2025 — pre-Riichi truth readiness audit

Status: **PASS — ready for a fresh implementation preflight**  
Issue: #399, Slice F  
Audit baseline: `main` at `3390a9d48a39dd11e6e3cb773abb034d7dcaf6b0` (merged Slice E)  
Authority: European Mahjong Association, *Riichi: Rules for Japanese Mahjong*, 2025 edition (August 2025)

## Decision

The existing A–E truth architecture can hold representative EMA Riichi facts without a new truth store, a fifth scoring grammar, invented cross-profile relationships, or a Riichi branch in the family-neutral validator. The migrated Classical and MCR corpus is guarded by the same integrity gate. **No architecture defect blocks Riichi from beginning a fresh, bounded implementation preflight.**

This is a readiness audit, not a Riichi corpus migration or runtime authorization. Riichi remains `riichi-ema-2025@0.x` for research; no exact executable profile version is selected here.

## Gate results

### 1. A–E truth architecture is proved on Classical and MCR — PASS

- The Classical vertical test in [`special-hands-atlas.test.ts`](../../../artifacts/mahjong-scorer/src/guide/special-hands-atlas.test.ts) follows a source record and evidence claim to the shared `pattern.thirteen-orphans` subject, four exact profile treatments, current runtime bindings, the 71-entry learner projection / 146-treatment Atlas, and scorer handoff. The test ties each exact treatment and claim to its runtime binding and verifies the example through the scorer path.
- The MCR proof in [`truth-corpus.test.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/truth-corpus.test.ts) joins the EMA Green Book source and exact MCR claim to the same structural subject, then to MCR `binding` and `policy` references. It confirms the Thirteen Orphans reference reaches the existing detector binding and fixture. The test also checks deterministic source impact and exact profile/version filtering.
- [`truth-integrity.test.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/truth-integrity.test.ts) exercises the fail-closed validator with duplicate, orphaned, mismatched, unresolved, wrong-profile, and unknown-runtime mutations. `currentTruthIndex` is constructed through this integrity gate. MCR family joins are supplied by an edge adapter; [`integrity.ts`](../../../artifacts/mahjong-scorer/src/rules-knowledge/truth/integrity.ts) remains family-neutral.
- This proof is deliberately representative: it does not claim all 146 Classical treatments have been migrated, nor require the later #440 migration.

### 2. Version and fingerprint ownership is clear — PASS

- `VersionedTruthRecord` in [`truth-model.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/truth-model.ts) owns truth-record history through `recordVersion`, lifecycle, and an explicit `supersedes` record/version reference.
- `RulesProfileRef` owns the exact profile identity as `{ id, version }`. Claims and treatments use that exact reference; the integrity gate rejects unknown versions.
- Executable registry entries own runtime semantic revisions and executable contracts in [`registry.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/registry.ts). The resolver records exact executable dependencies and computes `rulesFingerprint` from the resolved profile plus those dependency identities in [`resolver.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/resolver.ts).
- Therefore an evidence/source edit alone does not silently rewrite the executable identity of a saved game. If a reviewed source change changes runtime semantics, implementation must deliberately change the affected executable semantic revision or profile version so the resolved fingerprint changes. Slice F does not alter fingerprint code.

### 3. No competing score database — PASS

- `ProfileTreatment` stores an exact profile, subject, evidence-claim IDs, runtime reference/state, and optional relationships. It has no score, han, fu, payment, or qualification-value fields.
- Classical Atlas treatment facts are derived from the exact profile bindings; the vertical test checks that treatment runtime references and projected entries resolve to those bindings. The MCR Slice E records likewise point to detector/policy identities without copying fan values or qualification data.
- Riichi research documents remain source-backed evidence and test oracles. A future executable treatment must point to runtime-owned yaku/yakuman bindings or scoring policies; han values, fu arithmetic, dora, limits, payments, settlement, and progression must not be copied into truth records or learner content as a second production rules store.

### 4. Representative EMA Riichi records map into the model — PASS

This is a paper map only. It does not create records or assert cross-family relationships.

| Representative fact | Truth-model representation | Existing authority / boundary |
| --- | --- | --- |
| Source | `SourceRecord` for `source.ema-riichi-2025`; source identity is the EMA 2025 English rules edition. | [`SOURCES.md`](SOURCES.md) pins the authority, August 2025 edition, URL, and scope. Historical research shorthand `ema-riichi-2025` remains acceptable in existing documents; canonical joins should use `source.ema-riichi-2025`. |
| Shared structural pattern | `SemanticSubject { id: 'pattern.thirteen-orphans', kind: 'pattern' }` can represent the terminal/honour structure for Kokushi Musou: the EMA source defines one of each of thirteen terminals and honours plus one duplicate. | The [EMA 2025 rules, §4.2.6](http://mahjong-europe.org/portal/images/docs/Riichi-rules-2025-EN.pdf) and [`EMA_2025_YAKU_CATALOGUE.md`](EMA_2025_YAKU_CATALOGUE.md) identify the Thirteen Orphans structure. Its yakuman membership and treatment remain owned by the exact Riichi profile. No cross-profile `identical` relationship is inferred or authored. |
| Riichi-owned event/rule | A Riichi `rule` subject can represent Riichi declaration / Ippatsu eligibility, with evidence tied to the resolved event and declaration facts. | [`EMA_2025_SCORE_EVIDENCE_CONTRACT.md`](EMA_2025_SCORE_EVIDENCE_CONTRACT.md) defines these finite source-owned facts. The source's `evidence-policy.riichi-ema-2025` seed is the existing policy category; cross-family name similarity does not create a relationship. |
| Scoring policy | A `rule` or `concept` subject for indicator-to-dora treatment can point to `dora.riichi-ema-2025` through `RuntimeTreatmentRef.kind: 'policy'`. | The dora cycles, ura eligibility, and no-red-five decision are in the score evidence contract and [`EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md`](EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md). Arithmetic remains in the runtime policy. |
| Table strategy | Source claims and `rule` subjects can describe EMA dealer retention, settlement, and finalisation facts. The v0 `RuntimeTreatmentRef` has no progression, settlement, or game-end strategy variant, so a `ProfileTreatment` cannot directly reference those strategy IDs today. | [`EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md`](EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md) pins round outcomes, honba/pot handling, and game progression. Executable strategy identities remain owned by the exact resolved profile and its fingerprint. |

The source and evidence contracts are sufficiently specific to map claims to locators and semantic subjects. Canonical Riichi `supportsProfile` claims and `ProfileTreatment` records must wait until the exact implementation profile version is chosen in the fresh preflight. If #263 requires direct treatment-level reverse impact into strategy IDs, assess a typed strategy reference deliberately in that child’s preflight; Slice F does not extend the schema.

### 5. Riichi fits existing grammar and registry categories — PASS

- `riichi-han-fu` is an existing scoring grammar in [`types.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/types.ts) and the resolver's scoring schema. The architecture fixture `A05` in [`architecture-fixtures.test.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/architecture-fixtures.test.ts) resolves the EMA Riichi shape using that grammar.
- [`architecture-seeds.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/architecture-seeds.ts) already has the EMA source, Riichi family, tile/seat identities, yaku/yakuman catalogues, decomposition, dora, fu, limit/value policies, settlement, progression, and game-end identities.
- [`registry.test.ts`](../../../artifacts/mahjong-scorer/src/rules-platform/registry.test.ts) verifies the EMA source remains metadata-only and architecture seeds are not executable. Slice F does not promote them.
- No fifth grammar, generic `houseRules` bag, duplicate truth store, or Riichi-specific validator branch is required by the corpus.

### 6. Exact Riichi profile version is deferred — PASS

The source corpus deliberately labels its target `riichi-ema-2025@0.x`. F chooses no `0.1` or other exact version and creates no canonical executable-support claims or treatments against an unapproved version. The fresh implementation preflight must pin the first exact version before profile-specific truth records are authored.

### 7. Fresh implementation handoff is required — PASS WITH FOLLOW-UP

After this audit is reviewed and Slice F lands:

1. Complete/close #399.
2. Re-read #202, #244, and intended first executable child #262 against the then-current `main`.
3. Produce a fresh bounded #262 preflight grounded in the merged A–F architecture and exact Riichi source corpus.
4. Only after that preflight should a Riichi implementation child begin.

The older programme issues remain useful background, but their dependency wording predates #399. Do not start implementation from umbrella #244 or reuse a stale pre-#399 preflight.

## Verification performed for this audit

The architecture remains unchanged. On the Slice F branch, the focused executable gate passed:

```text
pnpm --filter @workspace/mahjong-scorer exec vitest run \
  src/rules-platform/truth-corpus.test.ts \
  src/rules-platform/truth-integrity.test.ts \
  src/guide/special-hands-atlas.test.ts \
  src/rules-platform/mcr-profile.test.ts \
  src/rules-platform/mcr-detectors.test.ts \
  src/rules-platform/mcr-scoring.test.ts \
  src/rules-platform/architecture-fixtures.test.ts \
  src/rules-platform/registry.test.ts \
  src/rules-platform/resolver.test.ts \
  src/rules-platform/current-runtime-registry.test.ts \
  --config vitest.config.ts

10 test files passed; 163 tests passed.
pnpm typecheck       # passed
git diff --check     # passed
```

## Scope boundary

No Riichi truth records were migrated. No exact Riichi profile version was invented. No scorer, runtime, yaku implementation, UI, settlement strategy, or scoring arithmetic was added. Architecture seeds remain architecture-only. The only follow-up after F lands is the fresh #262 preflight.
