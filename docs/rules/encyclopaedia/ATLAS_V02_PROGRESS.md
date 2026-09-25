# Atlas v0.2 learner-content progress

Issue: #354  
Branch: `research/atlas-v02-learner-content`  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`

## Final status

The Sol-owned content/knowledge pass is complete for the **entire current Classical Atlas corpus** and is ready for PR review.

Coverage by exact executable treatment identity:

- **18 / 18 BMJA**;
- **85 / 85 Thompson & Maloney Western**;
- **33 / 33 Outside the Box**;
- **10 / 10 Buzzard 2000**;
- **146 / 146 total**.

Every represented exact treatment identity has been checked against its current executable binding source. Relationship/equivalence confidence remains separately evidence-gated: exact binding resolution does not upgrade a source/runtime discrepancy.

The branch is **21 commits ahead of and 0 commits behind** the unchanged #354 base before this final progress-only commit. All changed files are under `docs/rules/encyclopaedia/`; no scorer, binding, UI or rules-runtime file is changed.

## Final learner model

Across the content batches the pack contains:

- **22 reviewed concepts** established before the Western-only final waves;
- **16 reviewed families/topics** after Western discovery/disambiguation families are added;
- **32 standalone verified learner entries**;
- **9 standalone unresolved learner entries** preserving evidence/runtime boundaries;
- **98 structured example objects** across concrete tile hands, event sequences and runtime-constrained generators;
- **7 learner entries without a direct defining visual**, deliberately retained where a concrete picture would overstate current evidence or duplicate a rules mapping not yet safely materialised.

These are learner records, not claims about globally unique Mahjong concepts.

## Authoritative handoff

Implementation must begin from:

- `ATLAS_V02_FINAL_CONTENT_MANIFEST.json` — final treatment ownership/index, overrides, unresolved identities and example classifications;
- `ATLAS_V02_IMPLEMENTATION_HANDOFF.md` — implementation and accessibility contract;
- `ATLAS_V02_SOURCE_BINDING_SCHEMA.md` — evidence-binding rules;
- the batch content files named by the final manifest.

The final manifest owns the exact 146-treatment mapping. The research batches must not be re-grouped by name or similarity during implementation.

## Validation completed

- Batch 1: **36 / 36** exact treatment references resolve.
- Batch 2: **46 / 46** newly covered references resolve.
- Batch 3: **11 / 11** newly covered references resolve.
- Batch 4: **53 / 53** Western remainder references resolve; omission-control list exhausted.
- Combined: **146 / 146 current Classical treatment identities represented**.
- `main` remains exactly `efe2cec955f973a28a5e982160f3b6e39593606a`, so the content branch is still based on the intended runtime truth.
- Branch comparison shows docs-only changes; no scoring/rules semantics changed.

## Important unresolved boundaries retained

The final manifest explicitly preserves nine unresolved exact treatments, including BMJA/OTB Knitting and Triple Knitting, OTB Three Great Scholars, Buzzard Three Dragons, Buzzard Thirteen Odd Majors, Buzzard Original Hand and Buzzard Three Winds and a Pair. These remain first-class reference entries with calm limitations; implementation must not repair or generalise them silently.

## Next step

Open the #354 PR for review. After review/merge, create a separate Luna implementation child pinned to the resulting exact `main` SHA. Luna's task should be implementation, testing and rendered proof only — not ontology, grouping or learner-copy invention.

No scoring/rules semantics are changed by this content branch.
