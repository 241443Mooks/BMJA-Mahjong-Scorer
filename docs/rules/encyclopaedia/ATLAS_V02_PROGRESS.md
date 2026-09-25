# Atlas v0.2 learner-content progress

Issue: #354  
Branch: `research/atlas-v02-learner-content`  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`

## Current progress

The structured authoring pass now covers the **entire current Classical Atlas treatment corpus**.

Coverage by exact executable treatment identity:

- **18 / 18 BMJA**;
- **85 / 85 Thompson & Maloney Western**;
- **33 / 33 Outside the Box**;
- **10 / 10 Buzzard 2000**;
- **146 / 146 total**.

Every represented exact treatment identity has been checked against its current executable binding source. Relationship/equivalence confidence remains separately evidence-gated: exact binding resolution does not upgrade a source/runtime discrepancy.

## Structured learner model now represented

Across the authoring batches the content pack contains:

- **22 reviewed concepts** established before the Western-only final waves;
- **16 reviewed families/topics** after the Western discovery/disambiguation families are added;
- **32 standalone verified learner entries**;
- **9 standalone unresolved learner entries** preserving evidence/runtime boundaries;
- **98 structured example objects** across concrete tile hands, event sequences and runtime-constrained generators;
- **7 learner entries without a direct defining visual**, deliberately retained where a concrete picture would overstate current evidence or duplicate a rules mapping not yet safely materialised in the content layer.

These counts describe learner records, not unique Mahjong concepts globally. A reviewed family/topic may contain several exact variants and is not a claim of universal equivalence.

## Current artifacts

### Core contract / schema

- `ATLAS_V02_LEARNER_CONTENT_BATCH1.md`
- `ATLAS_V02_SOURCE_BINDING_SCHEMA.md`
- #353 learner/accessibility contract
- #354 structure-first clarification

### Structured content

- `ATLAS_V02_LEARNER_CONTENT_PROOF.json` — original stress batch
- `ATLAS_V02_EVIDENCE_BINDINGS_BATCH1.json` — normalized evidence bindings for original stress entries
- `ATLAS_V02_LEARNER_CONTENT_BATCH2.json` — broad T&M/OTB shared-content batch
- `ATLAS_V02_BATCH2_CORRECTIONS.json` — explicit facet corrections including `hybrid-layout`
- `ATLAS_V02_LEARNER_CONTENT_BATCH3.json` — remaining BMJA/OTB/Buzzard content
- `ATLAS_V02_LEARNER_CONTENT_BATCH4A.json` — first Western-only completion wave
- `ATLAS_V02_LEARNER_CONTENT_BATCH4B.json` — final Western-only completion wave

### Omission/reference validation

- `ATLAS_V02_BATCH1_REFERENCE_VALIDATION.md` — 36 / 36
- `ATLAS_V02_BATCH2_REFERENCE_VALIDATION.md` — 46 / 46 newly covered
- `ATLAS_V02_BATCH3_REFERENCE_VALIDATION.md` — 11 / 11 newly covered
- `ATLAS_V02_WESTERN_REMAINDER_PLAN.md` — exact 53-item final omission-control list
- `ATLAS_V02_BATCH4_REFERENCE_VALIDATION.md` — 53 / 53; 0 uncovered

## Knowledge-shape findings that implementation must preserve

1. **Treatment identity is still atomic truth.** Learner groupings sit above exact `profile@version:patternId` references.
2. **Concept and family/topic are different.** A family can provide one useful learner entry while retaining materially different variant predicates.
3. **Three visual grammars are needed:** ordinary grouped, wholly irregular and `hybrid-layout`; event-defined treatments use event sequences rather than arbitrary final hands.
4. **Examples are linked knowledge objects.** They may be existing scorer examples, authored structured proof examples, event sequences or runtime-constrained generators.
5. **Generator constraints are preferable to invented examples** where a canonical predicate owns a mapping such as a suit-to-corresponding-Dragon rule.
6. **Score/exposure/fishing/winning method are treatment-owned.** Learner content explains them but never becomes their authority.
7. **Source/runtime gaps remain visible reference limitations.** Knitting/Triple Knitting, OTB Three Great Scholars and Buzzard non-winner-limit cases are not silently repaired or grouped.
8. **Browse facets are reusable graph edges**, not prose-only labels. New proven facets include `hybrid-layout`, `mixed-chow`, `rank-parity` and `parallel-ranks` in addition to the original structural vocabulary.

## Remaining #354 work before Luna

Coverage authoring is complete. Remaining work is packaging and proof, not new Mahjong interpretation:

1. create an authoritative final content manifest/index so Luna does not have to infer ownership across research batches;
2. explicitly mark existing scorer-example actions versus proof-only examples/generators;
3. provide deterministic final facet/evidence values for the few entries with research overlays/extensions;
4. write the implementation handoff and acceptance matrix from #353/#354;
5. review the branch diff and documentation consistency, then open the #354 PR for review.

No scoring/rules semantics are changed by this content branch.
