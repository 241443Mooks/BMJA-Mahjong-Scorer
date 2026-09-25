# Atlas v0.2 source/evidence binding schema

Status: **docs-scoped contract for #354; not production authority**

The first structured learner proof deliberately used human-readable `evidenceRefs` so the content shape could be tested quickly. Before implementation handoff, those locators must be normalised into explicit source/evidence bindings.

The learner layer must not own source truth. It should point to existing source/evidence records and preserve the status that those records already carry.

## Required binding shape

Each learner entry or variant that makes a sourced relationship/qualification claim should be able to carry one or more records conceptually equivalent to:

```json
{
  "kind": "repo-evidence",
  "path": "docs/rules/TM_COMPANION_CATALOGUE_INDEX.md",
  "locator": "Knitting / p.20 / synopsis pp.57-59",
  "supports": [
    "treatment-qualification",
    "local-name",
    "relationship"
  ],
  "status": "source-certified"
}
```

or, where the reviewed relationship is inherited from the audit rather than re-proved in the learner pack:

```json
{
  "kind": "reviewed-audit",
  "path": "docs/rules/encyclopaedia/CLASSICAL_ATLAS_CONCEPT_AUDIT_V1.md",
  "locator": "§6 Imperial Jade / All Green family",
  "supports": [
    "family-membership",
    "broader-than"
  ],
  "status": "reviewed"
}
```

## Binding principles

1. **Exact source path and locator are data**, not prose buried in `whatItIs`.
2. **Support purpose is explicit**. A source proving a local name does not automatically prove concept equivalence.
3. **Evidence status is preserved**. `verified`, `source-certified`, `inferred`, `unresolved`, etc. must not be silently upgraded by the learner layer.
4. **One claim may need more than one authority**. Effective qualification can require runtime detector + binding + source evidence.
5. **Learner prose may paraphrase but does not replace the evidence link**.
6. **Relationships inherit reviewed evidence** from #351/#352 unless stronger evidence is deliberately added.
7. **Scoring facts do not use this source-binding layer as their authority** when the exact treatment/runtime already owns them.

## Runtime/treatment binding

Every learner treatment member is always linked structurally by exact `referenceId`:

```text
profile@version:patternId
```

The implementation must resolve that identifier back through the current treatment projection. The learner layer does not copy:

- winner value;
- fishing value/floor;
- exposure policy;
- winning methods;
- profile display identity;
- calculated/configured/fixed model.

## Example binding

A learner example should similarly point to an existing structured example where one exists:

```json
{
  "source": {
    "type": "existing-example",
    "id": "thirteen-unique-wonders"
  }
}
```

Only variant examples not already represented may carry docs-scoped structured proof data. If promoted into implementation, they must become proper structured examples with tests rather than duplicated static tile lists across UI surfaces.

## Action binding

Scorer/worked-example actions should eventually be represented structurally, for example:

```json
{
  "kind": "scorer-example",
  "exampleId": "thirteen-unique-wonders",
  "profileReferenceId": "bmja@1.0:thirteen-unique-wonders"
}
```

The UI may render labels such as `Try this hand`, but the learner prose must not own the destination URL.

## Completion gate before Luna handoff

Before #354 can hand implementation to Luna:

- `evidenceRefs` in the proof must be migrated from strings to structured bindings;
- each relationship claim must name the audit/source evidence that supports it;
- each exact treatment member must resolve against current bindings;
- existing examples must be linked by ID, not duplicated;
- new proof-only examples must be explicitly identified for later promotion/testing;
- score/restriction facts must remain derived from exact treatments.

This keeps the content pack as a linked knowledge system rather than a prose-and-JSON shadow database.
