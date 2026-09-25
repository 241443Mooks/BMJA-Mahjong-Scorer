# Atlas v0.2 learner-content progress

Issue: #354  
Branch: `research/atlas-v02-learner-content`  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`

## Current progress

Three structured authoring batches now cover the original stress corpus, the source-backed shared T&M/OTB layer, and every current BMJA/OTB/Buzzard exact treatment identity.

Artifacts now include:

- `ATLAS_V02_LEARNER_CONTENT_PROOF.json` — first stress/proof batch;
- `ATLAS_V02_LEARNER_CONTENT_BATCH1.md` — human review of the first batch;
- `ATLAS_V02_SOURCE_BINDING_SCHEMA.md` — source/evidence-link contract;
- `ATLAS_V02_EVIDENCE_BINDINGS_BATCH1.json` — normalised source/evidence companion bindings for batch 1;
- `ATLAS_V02_BATCH1_REFERENCE_VALIDATION.md` — 36/36 exact treatment references resolved;
- `ATLAS_V02_LEARNER_CONTENT_BATCH2.json` — broad source-backed shared-concept/family batch;
- `ATLAS_V02_BATCH2_CORRECTIONS.json` — structural-facet refinements exposed by batch 2;
- `ATLAS_V02_BATCH2_REFERENCE_VALIDATION.md` — 46/46 newly covered exact treatment references resolved;
- `ATLAS_V02_LEARNER_CONTENT_BATCH3.json` — remaining BMJA/OTB/Buzzard learner entries;
- `ATLAS_V02_BATCH3_REFERENCE_VALIDATION.md` — 11/11 newly covered exact treatment references resolved.

Current combined coverage:

- **93 / 146 exact Classical treatments** have an identity-validated learner representation;
- all **18 BMJA** special-hand bindings are represented;
- all **33 Outside the Box** fixed special-hand bindings are represented;
- all **10 Buzzard 2000** special-hand bindings are represented;
- the remaining **53 uncovered treatments are Thompson & Maloney Western-only catalogue entries**;
- **22 reviewed concepts** are represented;
- **6 reviewed families/topics** are represented;
- **12 standalone verified learner entries** are represented;
- **9 standalone unresolved learner entries** preserve current evidence/runtime limits rather than being forced into groups;
- **48 reusable structured examples** are represented across tile-hand and event-sequence forms;
- **4 represented treatments** remain deliberately without a defining visual because available evidence is not strong enough to borrow a neighbouring profile's example safely;
- `hybrid-layout` is now required alongside ordinary grouped and wholly irregular learner structures.

All 93 represented exact treatment identities have been checked against the current executable profile bindings. Exact identity validation does not upgrade unresolved semantic/source relationships.

## Notable modelling improvements

1. OTB `All Pair` and `Heavenly Twins` are linked into the existing pair-family structure rather than becoming unnecessary duplicate standalone records.
2. A third learner structural shape, `hybrid-layout`, is required for patterns that deliberately combine represented groups with loose tiles. Windy Ones/Nines/Chow and Dragonfly prove this need.
3. Explicit OTB `reuse-identical` and structural-difference evidence supports a large set of T&M/OTB shared learner concepts without copying profile-local value/exposure rules upward.
4. Structured examples are authored as reusable knowledge objects rather than embedded UI prose.
5. Score/value/fishing/exposure/winning-method truth remains derived from exact treatments; the content files do not become a second scorer database.
6. BMJA event specials are represented as event sequences rather than arbitrary tile pictures.
7. Buzzard content distinguishes current executable treatment examples from source-complete qualification where its unusual non-winner limits exceed the current winning-only detector.

## Required next work

1. Continue authoring the remaining **53 Thompson & Maloney Western-only treatments**, using `TM_COMPANION_CATALOGUE_INDEX.md` plus current executable predicates/bindings as the authority. Prefer meaningful families where the source/runtime structure genuinely supports them; otherwise use fully useful standalone verified treatments.
2. Consolidate the batch-1 structured evidence companion and batch-2 corrections into the final handoff shape; do not leave the implementation agent to reconcile overlays.
3. Add/normalise scorer and worked-example action bindings where a truthful existing target exists. Proof-only examples must be explicitly promoted/tested during implementation rather than treated as existing scorer routes.
4. Keep Knitting/Triple Knitting and the Three Great Scholars/Three Dragons source-runtime gaps unresolved in the knowledge model until separate rules-integrity work resolves them.
5. Produce the final coverage report and Luna implementation handoff only after maximum safe coverage has been reached and the overlays have been consolidated into one unambiguous model.

No scoring/rules semantics are changed by this content branch.
