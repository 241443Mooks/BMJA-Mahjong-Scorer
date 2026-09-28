# Rules truth model v0

Status: **Slice A contract for issue #399**  
Scope: schema and authority contract only; no scoring behaviour or corpus migration.

## Purpose

Join existing source, evidence, semantic identity, exact profile treatment, and executable runtime layers without creating a second rules database. The TypeScript contracts live in `artifacts/mahjong-scorer/src/rules-platform/truth-model.ts` and are exported from the rules-platform entry point.

```text
source record -> evidence claim -> semantic subject -> exact profile treatment -> runtime identity
                                                                     -> reference fact -> editorial explanation
```

Every edge is an explicit identifier reference. Names and display labels are not identity. A profile reference always includes both `id` and `version`.

## Contracts

- **SourceRecord** registers citation, authority class, profile scope, and publication version. It stores no copied source passages.
- **SourceLocator** identifies a URL section, publication edition/page, club-material section/page, or image in a named collection. Locators should be as narrow as the source allows.
- **EvidenceClaim** is a concise project-authored factual claim tied to a registered source, locator, semantic subject, review date, and optional exact profile version. Its `EvidenceStatus` describes evidence confidence only; neither `verified` nor a runtime reference silently changes executable behaviour.
- **SemanticSubject** gives a stable ID and one of the kinds `rule`, `pattern`, or `concept`. The subject is profile-independent; profile names and scores do not belong in its identity.
- **ProfileTreatment** joins a subject to one exact profile version and its evidence. When executable, it points to a runtime-owned rule, binding, or policy identity. Its contract intentionally has no score/value payload: `ResolvedProfileArtifact` and the compiled runtime remain the executable authority.
- **ProfileRelationship** records a research comparison (`identical`, `subset`, `superset`, `override`, `alias`, `unique`, or `unknown`). It is descriptive and is never an inheritance or execution instruction.

## Status vocabularies

Evidence status is epistemic: `verified`, `verified-club`, `needs-primary-source`, `needs-club-confirmation`, `secondary-only`, or `conflict`. These values preserve the existing provenance model.

Record lifecycle is separate: `draft`, `current`, or `superseded`. Runtime support remains owned by the runtime and is not inferred from evidence status or record lifecycle.

## Versioning and immutability

IDs identify semantic records and remain stable across edits. A versioned record has a schema version and monotonically increasing record version. Once current, a record is immutable: correction or changed evidence creates a new version and marks the previous record superseded, with `supersedes` pointing to its prior record identity. Exact profile versions used in saved results remain immutable; a new rules treatment requires a new profile version and fingerprint. Never rewrite a saved result's profile identity in place.

## Ownership boundaries

| Fact | Authority |
|---|---|
| Executable rules, values, restrictions, and runtime support | Exact `ResolvedProfileArtifact` and its compiled runtime |
| Source citation, locator, evidence claim, and semantic identity | Truth records |
| Learner/reference treatment facts | Projection from exact profile treatment/runtime identity |
| Explanatory prose and examples | Product/editorial content, written independently |

Reference and editorial layers may link to upstream identities. They must not independently store a competing score, restriction, or executable rule. Explanatory prose is not source evidence.

## Deliberate limits of v0

This slice defines contracts only. It does not introduce a persisted record corpus, runtime validator, migration, source-register generator, query system, integrity gate, or scoring change. Those belong to later slices once the vertical proofs define what must be validated.
