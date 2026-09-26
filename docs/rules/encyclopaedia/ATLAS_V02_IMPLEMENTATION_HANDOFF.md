# Atlas v0.2 — implementation handoff

Status: **Sol-authored knowledge/content contract complete; implementation not started**  
Issue: #354  
Parent product contract: #353  
Programme: #342  
Evidence audit: #351 / PR #352  
Base used for content work: `efe2cec955f973a28a5e982160f3b6e39593606a`

## 1. What is now settled

The content pass is complete for the current Classical Atlas corpus.

Exact treatment coverage:

| Profile | Current treatments | Learner-content identity coverage |
|---|---:|---:|
| BMJA `bmja@1.0` | 18 | 18 / 18 |
| Thompson & Maloney `western-tm@0.1` | 85 | 85 / 85 |
| Outside the Box `outside-the-box@0.1` | 33 | 33 / 33 |
| Buzzard `buzzard-2000@0.1` | 10 | 10 / 10 |
| **Total** | **146** | **146 / 146** |

The content layer now proves these learner presentation states:

- reviewed concept;
- reviewed family/topic containing distinct variants;
- standalone verified treatment;
- standalone unresolved treatment.

The implementation agent is **not** asked to decide which treatments are equivalent, which are variants, what a hand means, or what unresolved evidence should imply. Those decisions are authored here.

## 2. Authoritative structured entry point

Use:

`docs/rules/encyclopaedia/ATLAS_V02_FINAL_CONTENT_MANIFEST.json`

as the authoritative #354 ownership/index contract.

It provides:

- the exact 146-treatment corpus counts;
- the primary learner entry that owns every exact `referenceId`;
- the content source file for each authored research batch;
- final explicit overrides for the small number of research-stage extensions/corrections;
- the distinction between existing scorer examples and proof-only examples/generators;
- the exact unresolved treatment identities that must retain evidence limitations.

The implementation must not re-run fuzzy grouping, infer relationships from names, or choose a different owner because two entries look similar.

### Research content sources

The manifest points to:

- `ATLAS_V02_LEARNER_CONTENT_PROOF.json`
- `ATLAS_V02_EVIDENCE_BINDINGS_BATCH1.json`
- `ATLAS_V02_LEARNER_CONTENT_BATCH2.json`
- `ATLAS_V02_LEARNER_CONTENT_BATCH3.json`
- `ATLAS_V02_LEARNER_CONTENT_BATCH4A.json`
- `ATLAS_V02_LEARNER_CONTENT_BATCH4B.json`

`ATLAS_V02_FINAL_CONTENT_MANIFEST.json` wins on ownership/final override fields.

The final runtime shape may be cleaner than these research files. The implementation may normalise them into appropriate TypeScript/data modules, but the semantic content and exact links are the contract.

## 3. Atomic truth stays exact treatment truth

Never replace:

```text
profile id + profile version + executable pattern id
```

with a learner concept id.

The knowledge relationship remains:

```text
learner concept / family / standalone entry
        -> exact treatment referenceId(s)
        -> runtime-derived treatment facts
```

Score/value, fishing treatment, exposure, winning methods, profile identity and configured-limit semantics must remain derived from the existing exact treatment/runtime projection.

The learner layer may explain those facts. It must not become a second scoring database.

## 4. Minimum rendered learner floor

Every exact treatment must remain reachable through a learner entry that answers, as evidence permits:

1. **What is it?**
2. **What does it look like?**
3. **What does it mean?**
4. **Why is it special / why does it qualify?**
5. **How does it score here?**

The fifth answer comes from the exact treatment projection, not duplicated authored values.

If an entry is unresolved, render what is safely known plus its calm reference limitation. Do not invent missing qualification in order to fill the five fields.

## 5. Quick reference + progressive learning

The #353 usability rule is binding:

> **The first screen answers the immediate question. Deeper layers teach without getting in the way of reference.**

The upper concept/treatment experience should function as quick reference. It must expose enough to answer:

- what the hand/event is;
- what the pattern looks like;
- whether it exists in `My rules`;
- the exact treatment summary for `My rules` where applicable;
- the important represented restriction that could invalidate it.

Do not create a separate Quick/Learn mode unless evidence later requires it.

A stable deeper order should remain recognisable across entries:

1. At a glance
2. How it works
3. Your rules
4. Other rules
5. Watch out for / reference note
6. Related hands
7. Try / score / worked example

Not every section needs content, but the important answer should not migrate unpredictably between hands.

## 6. Search and browse behaviour

### Search

Search should resolve sourced/local names to the primary learner entry while preserving the local treatment name underneath.

Examples:

- `Unique Wonder` -> Thirteen Unique Wonders concept;
- `13 Unique Wonders` -> same concept;
- `Imperial Jade` -> Imperial Jade family/topic;
- `Three Dragons` -> Buzzard exact unresolved treatment rather than silently redirecting to Three Great Scholars;
- `Confused Gates` / `Golden Gates` / `Dragon's Gates` -> the Western Gates disambiguation topic/variant;
- exact treatment/profile search must continue to work.

No fuzzy alias creation.

### Facet browse

Facets are overlapping graph edges, not exclusive folders.

The current content work proves/uses at least:

- ordinary grouped;
- irregular hand;
- hybrid layout;
- one suit;
- multiple suits;
- terminals;
- honours;
- Winds;
- Dragons;
- pairs;
- Pungs/Kongs;
- Chow-involving;
- knitted/interleaved;
- green tiles;
- event-defined;
- mixed Chow;
- rank parity;
- parallel ranks.

A treatment/concept may match several facets but should normally appear once in a result set.

### `My rules`

Preference changes priority, not truth:

```text
shared learner explanation
    -> Your rules treatment prominent/open
    -> other supported treatments available
```

Searching, filtering, opening another treatment or entering `All rules` must not mutate the remembered rules preference.

If `My rules` does not participate in a learner concept/family, say so neutrally and retain the useful shared reference content.

## 7. Visual/example grammar

Do not implement every example as one flat tile strip.

The content proves four example asset forms:

### A. Grouped tile hand

Preserve meaningful group boundaries: Chows, Pungs, Kongs, pairs and concealment where relevant.

A learner should be able to see `four Wind Pungs/Kongs + pair`, not merely fourteen adjacent tiles.

### B. Irregular loose layout

Show the collection/pattern directly; do not fake ordinary meld groups.

### C. Hybrid layout

Show represented groups and loose structural tiles as distinct meaningful regions. Examples include Windy Ones/Nines, Dragonfly, Civil War and Red Lantern.

### D. Event sequence

Use a semantic ordered sequence/timeline when the event defines the treatment, e.g. Heaven's Blessing, Earth's Blessing, Twofold Fortune, Plum Blossom, Plucking the Moon, Buzzard East's First Discard and East's Thirteenth Consecutive Mahjong.

Do not display an arbitrary fourteen-tile hand as though it defines an event treatment.

### Generator examples

Some authored examples are intentionally `tile-hand-generator` records. Their concrete tile arrangement must be materialised from the referenced canonical predicate/source constraints during implementation.

This is deliberate for rules-owned mappings such as corresponding Dragons. Do not replace a generator with a guessed hard-coded example.

## 8. Example action safety

Existing runtime scorer examples are explicitly listed in the final manifest.

Only those may be treated immediately as existing `Try this hand` routes.

All other proof examples are knowledge/content assets until implementation:

1. converts them to the runtime example shape where useful;
2. proves the target exact profile accepts the example;
3. adds a truthful scorer/action route.

A visually valid proof example must not automatically become a scorer link for every profile in a family.

## 9. Accessibility and ease-of-reference acceptance

The rendered result must satisfy:

> **A beginner or table-side user can identify the hand, understand the essential pattern, and find the applicable rules treatment quickly, without relying on colour, visual tile recognition, hover, hidden multi-step interaction, or a long block of prose; a user who wants to learn more can continue into progressively deeper teaching without leaving the concept context.**

Implementation implications:

- tile visuals always have equivalent useful visible/programmatic text;
- accessible descriptions should derive from the same structured example where practical;
- colour may reinforce but never carry sole meaning;
- specialist Mahjong vocabulary is taught in context rather than assumed;
- treatment accordions/tabs/details expose the important delta in their collapsed label where possible;
- interactive disclosure is keyboard operable, has visible focus and exposes expanded state;
- quick-reference essential patterns fit a phone without mandatory horizontal panning;
- large teaching diagrams may use an accessible horizontal scroll region if needed;
- do not make essential information depend on 8–11px microcopy;
- use proper heading order and landmarks so repeated reference is predictable to screen-reader and keyboard users.

## 10. Mobile visual requirement

At approximately 390px width, a user must be able to understand the whole essential pattern without horizontally panning a fourteen-tile row.

Acceptable approaches include:

- group-aware wrapping;
- two meaningful rows;
- responsive smaller tiles while remaining legible;
- a compact structural representation paired with text.

Do not split a Pung/Chow across rows merely because a generic flex-wrap hits the viewport edge.

## 11. Unresolved treatments are first-class reference entries

The exact unresolved treatment list is in the final manifest.

Important examples include:

- BMJA/OTB Knitting source/runtime suit-count mismatch;
- BMJA/OTB Triple Knitting completeness difference;
- OTB Three Great Scholars source/runtime qualification mismatch;
- Buzzard Three Dragons / Three Winds non-winner-limit semantics;
- Buzzard Thirteen Odd Majors exact predicate evidence gap;
- Buzzard Original Hand cross-profile qualification gap.

Rules for rendering:

- keep the exact local treatment findable;
- teach what is known;
- do not borrow another profile's visual definition if that would imply unresolved equivalence;
- use a calm reference note where the current product/evidence boundary matters;
- do not display alarming internal ontology terminology to ordinary users.

## 12. Legacy and completeness requirements

Atlas v0.2 must not regress G1 completeness.

Acceptance:

- every one of the 146 current exact treatment referenceIds resolves to one primary learner owner in the manifest;
- exact treatment search still works;
- all existing BMJA legacy anchors still land on the BMJA treatment inside the relevant learner entry;
- Purity remains correctly represented as authored/calculated knowledge and does not inflate the BMJA fixed-special count;
- MCR remains outside this Classical Atlas treatment corpus until the later cross-family programme deliberately extends it.

## 13. Implementation boundaries

Allowed in the implementation child:

- production-neutral/runtime learner-content model derived from this contract;
- Atlas browse/search/detail redesign;
- accessible structured visual components;
- concept/family/treatment relationship UI;
- facet filtering;
- treatment comparison;
- scorer/example links after exact-profile proof;
- tests and responsive/a11y verification.

Not allowed without a separate rules-integrity decision:

- changing scorer detectors;
- changing treatment bindings, values or exposure/winning semantics;
- resolving Knitting/Three Great Scholars/Buzzard semantic gaps by changing rules code;
- inventing aliases/equivalence;
- broad MCR/Riichi canonicalisation;
- replacing exact treatment identity with a concept id.

If implementation discovers that this content contract cannot be represented without changing scorer/rules semantics, stop and report rather than silently repairing rules.

## 14. Required implementation proof cases

At minimum render/test these vertical journeys:

1. **Four Blessings** — ordinary grouped shared concept.
2. **Thirteen Unique Wonders** — irregular shared concept, aliases and treatment-value differences.
3. **Heaven's Blessing** — event-defined treatment/timeline.
4. **Imperial Jade** — family/topic with narrower BMJA/OTB and broader T&M variant plus treatment-specific visual.
5. **Twofold Fortune** — verified profile-specific event treatment.
6. **OTB Three Great Scholars or Buzzard Three Dragons** — unresolved reference note without borrowed certainty.
7. **Wriggling/Wriggly Snake** — narrower/broader family.
8. **All Pair family** — name collision + narrower related hands.
9. **Windy Ones or Dragonfly** — hybrid-layout visual grammar.
10. **Mixed Chow family** — a reusable structural teaching concept introduced by Western content.
11. **Up You Go / Down You Go** — fixed mirrored irregular layouts.
12. **Purity** — calculated-treatment boundary and no false fixed score.

## 15. Validation expected from implementation child

Follow `Agents.md` and current repo requirements, including the normal code gate when production code changes.

In addition prove:

- all 146 manifest treatment keys resolve against the current treatment projection;
- every primary learner owner exists;
- every referenced example id exists in either the implementation content registry or approved existing example registry;
- no proof-only example receives a scorer action without target-profile validation;
- no treatment-local score/restriction is copied into concept authority;
- search aliases are only sourced/reviewed aliases/local names;
- facet result de-duplication;
- `My rules` non-mutation;
- stable legacy BMJA anchors;
- phone rendering around 390px;
- desktop rendering;
- keyboard-only navigation;
- semantic inspection for tile examples, event sequences and disclosure controls;
- no essential information encoded solely through colour or image recognition.

## 16. Product direction after implementation

This model is deliberately reusable beyond `/special-hands`:

```text
structured learner knowledge
    -> Atlas browse/search
    -> quick reference
    -> exact treatment comparison
    -> scorer links
    -> related-hand navigation
    -> future concept/family detail
    -> future Encyclopaedia
    -> search/indexing/metadata
```

Do not copy the knowledge into a second Encyclopaedia catalogue later. The Atlas content model should become one input to that broader linked knowledge layer.

---

## Handoff conclusion

The knowledge/content decision work for the current Classical Atlas is complete enough to hand to an implementation agent **after #354 review/merge**.

Luna's later job should be implementation and proof, not ontology or learner-copy invention.
