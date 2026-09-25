# Atlas v0.2 learner-content progress

Issue: #354  
Branch: `research/atlas-v02-learner-content`  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`

## Current progress

Two structured authoring batches now prove the learner model across the original stress corpus and a much broader set of source-backed shared treatments.

Artifacts now include:

- `ATLAS_V02_LEARNER_CONTENT_PROOF.json` — first stress/proof batch;
- `ATLAS_V02_LEARNER_CONTENT_BATCH1.md` — human review of the first batch;
- `ATLAS_V02_SOURCE_BINDING_SCHEMA.md` — source/evidence-link contract;
- `ATLAS_V02_EVIDENCE_BINDINGS_BATCH1.json` — normalised source/evidence companion bindings for batch 1;
- `ATLAS_V02_BATCH1_REFERENCE_VALIDATION.md` — 36/36 exact treatment references resolved;
- `ATLAS_V02_LEARNER_CONTENT_BATCH2.json` — second broad source-backed authoring batch;
- `ATLAS_V02_BATCH2_CORRECTIONS.json` — structural-facet refinements exposed by the second batch;
- `ATLAS_V02_BATCH2_REFERENCE_VALIDATION.md` — 46/46 newly covered exact treatment references resolved.

Current combined coverage:

- **82 / 146 exact Classical treatments** have an identity-validated learner representation;
- **21 reviewed concepts** are represented across the two batches;
- **6 reviewed families/topics** are represented;
- **4 standalone verified learner entries** remain intentionally standalone;
- **8 standalone unresolved learner entries** preserve current evidence/runtime limits rather than being forced into groups;
- **38 reusable structured examples** are represented across tile-hand and event-sequence forms;
- **4 represented treatments** remain deliberately without a defining visual because available evidence is not strong enough to borrow a neighbouring profile's example safely;
- batch 2 adds a useful `hybrid-layout` structural facet for hands that deliberately combine represented groups with loose tiles.

The 82 exact treatment identities represented so far have all been checked against the current executable profile bindings. Exact identity validation does not upgrade unresolved semantic/source relationships.

## Notable modelling improvements from batch 2

1. OTB `All Pair` and `Heavenly Twins` are now linked into the existing pair-family structure rather than remaining unnecessary duplicate standalone records.
2. A third learner structural shape, `hybrid-layout`, is required alongside ordinary grouped and wholly irregular hands. Windy Ones/Nines/Chow and Dragonfly prove this need.
3. Explicit OTB `reuse-identical` and structural-difference evidence now supports a large set of T&M/OTB shared learner concepts without copying profile-local value/exposure rules upward.
4. Structured examples are being authored as reusable knowledge objects rather than embedded UI prose.
5. Score/value/fishing/exposure/winning-method truth remains derived from exact treatments; the content files do not become a second scorer database.

## Required next work

1. Consolidate the batch-1 structured evidence companion and batch-2 corrections into the final handoff shape; do not leave the implementation agent to reconcile overlays.
2. Continue authoring across the remaining **64 / 146** exact treatments, prioritising:
   - remaining BMJA event/grouped hands with existing structured examples;
   - remaining OTB memberships already tied to Western canonical patterns;
   - Western-only treatments with source-certified catalogue evidence and straightforward structured examples;
   - Buzzard treatments only to the level the captured primary evidence safely supports.
3. Add/normalise scorer and worked-example action bindings where a truthful existing target exists. Proof-only examples must be explicitly promoted/tested during implementation rather than treated as existing scorer routes.
4. Keep Knitting/Triple Knitting and the Three Great Scholars/Three Dragons source-runtime gaps unresolved in the knowledge model until separate rules-integrity work resolves them.
5. Produce the final coverage report and Luna implementation handoff only after maximum safe coverage has been reached and the overlays have been consolidated into one unambiguous model.

No scoring/rules semantics are changed by this content branch.
