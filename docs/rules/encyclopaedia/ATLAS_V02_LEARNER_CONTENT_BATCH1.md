# Atlas v0.2 learner content — first structured authoring batch

Status: **Sol-owned content/model proof for #354; not production runtime authority**  
Base: `efe2cec955f973a28a5e982160f3b6e39593606a`  
Structured companion: `ATLAS_V02_LEARNER_CONTENT_PROOF.json`

## Why this batch exists

The objective is not to write a second static guide. The objective is to prove a reusable learner knowledge layer that binds:

```text
reviewed learner entry
    -> exact treatment referenceId(s)
    -> reviewed relationship/family structure
    -> structural facets
    -> structured tile/event example(s)
    -> evidence/source locator(s)
    -> exact runtime-derived scoring treatment
    -> scorer/worked-example route where available
    -> authored learner explanation
```

The authored prose is therefore one projection of the knowledge record. It must be reusable in browse/search, quick reference, detail teaching, comparison, accessibility text and the future Encyclopaedia.

No score value, exposure rule, winning method or profile identity in this proof becomes a second scoring authority. Those facts remain owned by the exact treatment projection.

## Learner floor

Every eventual Atlas entry should answer five questions as far as verified evidence permits:

1. **What is it?** — plain-English definition while preserving the exact local/source name.
2. **What does it look like?** — structured tile hand or event sequence, with explicit scope.
3. **What does it mean?** — the mental model a beginner needs to recognise/build/understand it.
4. **Why is it special / why does it qualify?** — structural/event reason, not invented history or strategy.
5. **How does it score here?** — derived from the linked exact treatment, with restrictions represented where the treatment owns them.

Player strategy is not part of the mandatory `why`. It may be added later only where separately supported and genuinely useful.

## Presentation states proved

The first batch proves all four v0.2 states:

- **reviewed concept** — one supported idea across exact treatments;
- **reviewed family/topic** — one useful learner topic containing reviewed, materially different variants;
- **standalone verified treatment** — useful exact treatment with no justified grouping required;
- **standalone unresolved treatment** — useful exact treatment whose relationship or source/runtime qualification is not safe to generalise.

Standalone does not mean second-class. It means the product refuses to invent a relationship.

## First batch coverage

The structured proof currently covers **36 of the 146 current exact Classical treatment identities**.

It includes the full #354 stress corpus:

- Thirteen Unique Wonders / Thirteen Odd Majors;
- Four Blessings;
- Imperial Jade;
- Wriggling / Wriggly Snake;
- All Pair Honours / All Pair / Heavenly Twins / Seven Twins;
- Heaven's Blessing / Buzzard Original Hand;
- Twofold Fortune;
- Three Great Scholars / Three Dragons;
- Knitting;
- Triple Knitting;
- Gates of Heaven / Calling Nine Tile Hand.

Current learner-entry shape in the proof:

- **3 reviewed concepts**: Thirteen Unique Wonders; Four Blessings; reviewed BMJA/T&M Three Great Scholars;
- **4 reviewed families/topics**: Imperial Jade; Wriggling/Wriggly Snake; special pair-based hands; Gates family;
- **4 standalone verified learner entries**: BMJA Heaven's Blessing; BMJA Twofold Fortune; Western Knitting; Western Triple Knitting;
- **8 standalone unresolved learner entries**: Buzzard Thirteen Odd Majors; Buzzard Original Hand; OTB Three Great Scholars; Buzzard Three Dragons; BMJA/OTB Knitting; BMJA/OTB Triple Knitting.

These counts describe learner entries, not treatment identities. A reviewed concept/family may bind several exact treatments.

## Visual/example coverage

The proof defines **16 reusable structured examples**.

Examples are bound separately from prose so one example can drive:

- compact browse visual;
- full teaching visual;
- accessible description;
- scope caption;
- scorer prefill where an existing scorer example already exists;
- future Encyclopaedia embedding.

### Existing examples deliberately reused

The current repo already contains useful structured examples for Four Blessings, Thirteen Unique Wonders, Imperial Jade, Wriggling Snake, All Pair Honours, Heaven's Blessing, Twofold Fortune, Three Great Scholars, Knitting, Triple Knitting and Gates of Heaven.

The proof links those rather than re-entering their tile truth.

### New proof examples added only where the learner distinction needs them

The docs-scoped model adds explicit structured proof examples for:

- Western Imperial Jade with the permitted `2-3-4 Bamboo` Chow;
- broader Wriggly Snake with a non-1 duplicate;
- Western All Pair;
- Heavenly Twins;
- Seven Twins.

These are not production scorer fixtures yet. They prove that the content model can represent the learner distinction. Luna must not turn them into runtime authority without the later implementation contract/tests.

### Deliberately no borrowed example

Four current proof treatments do not receive a defining visual because doing so would overclaim evidence:

- Buzzard `Thirteen Odd Majors`;
- Buzzard `Original Hand`;
- Outside the Box `Three Great Scholars` while its source/runtime shape remains mismatched;
- Buzzard `Three Dragons` while the non-winning source qualification is unrepresented by the current detector.

The correct learner behaviour is a calm reference limitation, not a picture copied from a neighbouring rules profile.

## Grouping decisions that matter for the UX

### Thirteen Unique Wonders

One reviewed concept can safely bind BMJA, Thompson & Maloney and Outside the Box. Their local names and scoring/restrictions stay exact-treatment facts. Buzzard `Thirteen Odd Majors` remains separate until its tile predicate is source-verified.

### Imperial Jade

This is intentionally a **family/topic**, not one universal concept.

The shared learner idea is the Green Dragon + green Bamboo tile family. The British/OTB no-Chow form is narrower; Thompson & Maloney permits one `2-3-4 Bamboo` Chow. A rules-aware user can therefore learn the common idea once and then see the exact structural variant for their table.

### Wriggling / Wriggly Snake

One family/topic contains two reviewed predicates. `Wriggling Snake` is narrower because the suited 1 must be the duplicate; the broader `Wriggly Snake` can duplicate any tile in the thirteen-tile base.

### Pair hands

Pair-based is useful browsing, not identity. The family keeps All Pair Honours, All Pair, Heavenly Twins and Seven Twins structurally distinct and records the reviewed name collision / narrower relation / winning-method distinction.

### Knitting

The learner explanation can still be useful while concept grouping remains blocked.

BMJA and OTB source wording describes two-suit cross-rank pairs, but the current shared detector is broader. Western T&M has a source-aligned exact two-suit detector. The proof therefore authors standalone entries linked by common facets rather than falsely resolving the ontology.

### Gates family

The shared `1112345678999`-style skeleton is teachable as a family, while BMJA completion/provenance logic, T&M treatment and Buzzard any-rank completion remain distinct variants.

## Accessibility / reference implications proved by the data shape

### The example is structured, not just an image

Every example owns:

- kind (`tile-hand` or `event-sequence`);
- scope;
- structured data or exact existing example reference;
- visible explanation;
- accessible description;
- the concept/family/variant it supports.

### Group boundaries are knowledge

A Four Blessings example must preserve four Wind Pung/Kong groups plus the pair. Flattening the same fourteen tiles into an undifferentiated strip loses learner meaning.

### Event-defined specials are not forced into tile pictures

Heaven's Blessing and Twofold Fortune use event-sequence examples. The event order is part of the qualification and therefore part of the structured knowledge.

### Mobile quick reference cannot depend on horizontal panning

The implementation may choose responsive tile sizing, group-aware wrapping or multiple rows, but the content structure must allow the whole essential pattern to be understood without requiring the user to pan through a fourteen-tile strip.

## Linking/binding rule for the next authoring pass

A learner record is not complete merely because its prose is good.

For the next batch, completion means:

- exact treatment identities are bound;
- presentation state is explicit;
- reviewed relationship/family membership is explicit where applicable;
- facets are reusable identifiers rather than words buried in prose;
- examples are reusable records;
- source/evidence locators are retained;
- treatment-local scoring remains linked/derived;
- learner prose explains rather than duplicates authority.

The next proof revision should also normalise `evidenceRefs` from human-readable locator strings into structured path/section records before the data shape is considered implementation-ready.

## Next Sol authoring pass

Continue from this shape across the remaining current Classical bindings, prioritising:

1. hands already backed by existing structured BMJA examples;
2. treatments that share a canonical predicate and have source-supported concept membership;
3. high-value browse families such as one-suit, Winds/Dragons, terminals, Pung/Kong and event-defined specials;
4. profile-specific Western catalogue entries;
5. Buzzard entries with sufficient source detail;
6. unresolved entries last, with explicit evidence blockers rather than guessed teaching.

The target remains **maximum safe coverage**, not an arbitrary percentage.
