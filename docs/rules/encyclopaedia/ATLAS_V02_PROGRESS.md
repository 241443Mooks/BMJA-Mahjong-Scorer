# Atlas v0.2 learner-content progress

Issue: #354  
Branch: `research/atlas-v02-learner-content`  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`

## Current progress

The first structured authoring batch is complete enough to validate the model across the required stress corpus.

Artifacts:

- `ATLAS_V02_LEARNER_CONTENT_PROOF.json`
- `ATLAS_V02_LEARNER_CONTENT_BATCH1.md`
- `ATLAS_V02_SOURCE_BINDING_SCHEMA.md`

Current proof coverage:

- 36 / 146 exact Classical treatments represented;
- 3 reviewed concepts;
- 4 reviewed families/topics;
- 4 standalone verified learner entries;
- 8 standalone unresolved learner entries;
- 16 reusable structured examples;
- 4 represented treatments deliberately left without a defining visual because the available evidence is not strong enough to borrow a neighbouring profile's example safely.

## Required next work

1. Normalise `evidenceRefs` from human-readable strings into the structured source/evidence binding shape.
2. Validate all 36 exact treatment references against the current Classical binding projection.
3. Continue authoring across the remaining treatment corpus, prioritising source-backed shared predicates and treatments with existing structured examples.
4. Add scorer/worked-example action bindings where a truthful target exists.
5. Produce the final coverage report and implementation handoff only after maximum safe coverage has been reached.

No scoring/rules semantics are changed by this content branch.
