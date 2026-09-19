# Mahjong Reference — structured reference / knowledge architecture

Status: **product/design decision for #251; no implementation yet**  
Date: 19 September 2026  
Programme: #105  
Encyclopaedia programme: #251  
Acquisition strategy: `SEO_GROWTH_STRATEGY.md`

## Decision

Do **not** build a wiki.

Build a **structured, source-backed Mahjong reference graph** that can render excellent human-readable concept pages and later provide grounded fact packets to voice/AI features.

`Encyclopaedia` remains a useful internal programme name for #251, but the public product should use the vocabulary people already search for: **Mahjong hands, special hands, patterns, fan, yaku and named concepts**.

The page is a view over structured facts. The page is not the authority.

```text
source evidence + executable rules identity
        ↓
canonical concept + profile-specific treatments
        ↓
relationship graph + evidence-backed editorial facts
        ↓
public reference page / hub / scorer link / AI fact packet
```

## Why not a wiki

A wiki is optimised for collaborative article editing. This project needs something different:

- one stable concept identity across multiple rules profiles;
- exact profile/version-specific scoring treatments;
- machine-readable aliases and relationships;
- direct links to executable scorer bindings;
- source/provenance at fact level;
- deterministic reuse by pages, search, voice and future APIs;
- protection against one article silently becoming a second rules database.

Human editing is still useful, but it should edit **reviewed structured records and bounded explanatory copy**, not an unconstrained page whose prose becomes rules truth.

## Current search evidence

Search Console for `sc-domain:mahjong.smooks.co.uk`, settled through **16 September 2026**, shows:

- site: **15 clicks / 382 impressions / 3.93% CTR / 10.59 average position** over the last 28 settled days;
- `/special-hands`: **2 clicks / 106 impressions / 1.89% CTR / 9.97 average position**;
- `/special-hands` is already the highest-impression individual route in the current page report;
- named-query impressions include:
  - `wriggling snake mahjong` — average position 9;
  - `triple knitting mahjong` — 11;
  - `seven honors and knitted` — 9;
  - `mahjong special hands` — 12.57;
  - `special hands` — 2;
  - `special hand` — 8.2.

Low-volume Search Console query privacy means the clicks cannot currently be attributed safely to a named query. Do not state that a particular hand query produced a click until the query is actually visible.

This is enough evidence to preserve `/special-hands` as an acquisition/discovery surface and to treat **named Mahjong concepts** as a promising long-tail reference cluster.

## Public information architecture

### Preserve `/special-hands`

`/special-hands` already has search visibility and should remain a strong curated discovery hub.

Its job is to help somebody browse and discover hands, not to carry every cross-rules detail on one long page.

It can later support filtering/grouping such as:

- British / Western special hands;
- unusual whole-hand shapes;
- limit hands;
- named event hands;
- concepts recognised across several rules families.

Do not replace or redirect it merely because #251 exists.

### Canonical concept pages

Each genuinely reviewed cross-profile concept should get **one canonical page**.

The durable namespace should be broad enough for concepts that are called a `hand` in one ruleset and a `fan`, `yaku`, `pattern`, `limit` or event condition in another. Therefore do not force the canonical identity into a type-specific URL before A2 has proved the model.

Current preferred route direction for the vertical proof:

```text
/reference/<concept-slug>
```

Examples might eventually include:

```text
/reference/thirteen-orphans
/reference/big-three-dragons
/reference/nine-gates
```

This is deliberately broader than `/hands/<slug>` and more user-oriented than making `encyclopaedia` part of every URL.

The **page title/H1** should use the language people search for, for example `Thirteen Orphans Mahjong hand`, regardless of the neutral route namespace.

Do not freeze this route until the 251B vertical proof confirms that it works cleanly with current routing/prerender/search conventions.

### Collection views, not duplicate concept pages

Later, the same concept records can appear in several useful collections without creating duplicate canonical pages:

```text
/special-hands
/rules/<profile>
/reference?type=yaku
/reference?rules=riichi-ema-2025
```

A future dedicated `yaku`, `fan` or family collection is a browse surface, not another copy of the concept.

## The page a search visitor should get

A visitor who searches a named hand/pattern should land on a page that answers the question immediately.

Recommended order:

1. **Name + aliases** — including profile-local names only when source-backed.
2. **Tile diagram / visual example** — a clear representative layout where the concept has one.
3. **Plain-language definition** — what the concept actually is.
4. **Rules comparison** — which verified supported profiles recognise it and what each profile calls/scores/requires.
5. **Exact requirements** — exposure, shape, event/context, winning method and other qualification facts.
6. **Try it** — open the correct scorer/profile with as much safe evidence prefilled as the product supports.
7. **Relationships** — exact aliases/equivalents, narrower/broader forms, partial analogues and related-but-different concepts.
8. **Evidence-backed questions / confusions** — only facts supported by rules/source/search/user evidence.
9. **Rarity / difficulty** — only when there is a sourced, derived or simulated result with an explicit methodology.
10. **Sources / provenance** — reader-visible rather than hidden in repository internals.

The visitor should not need to understand the project's internal `conceptId`, binding IDs or scoring grammar to use the page.

## Core data model

The exact TypeScript/schema belongs to 251B after A2, but the product contract should preserve these distinctions.

### `Concept`

One neutral reviewed identity.

Suggested fields/concepts:

```text
conceptId
slug
preferredName
conceptKinds[]
neutralDefinition
aliases[]
representativeExamples[]
relationships[]
```

`conceptKinds` may be plural because one concept can be described differently by different rules traditions.

A concept does **not** contain one universal score.

### `ProfileTreatment`

One rules-profile treatment of a concept.

Suggested fields/concepts:

```text
conceptId
rulesProfile { id, version }
recognitionStatus
localName / aliases
runtimeBindingIds / detector identity
value model + exact value/tier
tile/shape qualification
open/concealed/exposure requirements
winning-method/event/table-context requirements
combination / suppression / exclusion rules
source/provenance refs
try-in-scorer capability/link
```

Important states must distinguish at least:

- verified recognised;
- verified absent/not recognised;
- unresolved/insufficient evidence.

Absence must never be inferred merely because a concept is missing from an incomplete source inventory.

### `Relationship`

A2 owns cross-family relationship decisions.

Supported relationship classes should include:

- exact implemented concept;
- sourced alias;
- genuine equivalent;
- narrower treatment;
- broader treatment;
- partial analogue;
- related but materially different;
- unrelated lookalike where recording the distinction is useful.

Names alone never establish a relationship.

### `EvidenceClaim`

Any non-runtime statement that could be mistaken for factual authority should carry its evidence class.

Useful classes:

```text
source-stated
runtime-derived
mathematically-derived
simulation-derived
observed-user/search evidence
editorial explanation
```

The record should retain the relevant source/method/version where applicable.

Do not add a vague numeric `confidence score` as a substitute for evidence provenance.

## Rarity and difficulty

These must not be invented.

### Safe rarity evidence

A page may state rarity only through one of these routes:

1. **Source-stated** — a credible source explicitly characterises or quantifies rarity.
2. **Exact combinatorial result** — the quantity is mathematically defined and the assumptions are shown.
3. **Simulation** — a versioned reproducible model states rules profile, strategy assumptions, sample size and measured result.
4. **Observed product/table data** — only if future privacy-safe data is sufficiently representative and the limitation is stated.

Otherwise omit the claim.

### Do not collapse different questions

These are different measures:

- chance of being dealt the completed hand;
- chance of starting with N relevant tiles;
- chance of eventually completing it under a specified strategy/model;
- strategic difficulty or opportunity cost;
- frequency in real games.

One number must not be presented as all of them.

### Difficulty may be descriptive without pretending to be probability

Where runtime facts support it, a page can state constraints such as:

- must remain concealed;
- requires a specific event/winning method;
- uses a fixed set of tile identities;
- has no ordinary-set fallback;
- depends on seat/round context.

Calling a hand `hard`, `easy`, `rare` or `common` requires stronger evidence than listing its actual constraints.

## Common mistakes / questions

Do not manufacture `common mistakes` from intuition.

Use one of:

- a source FAQ or explicit warning;
- repeated real user/table observations;
- Search Console/query evidence;
- support/feedback evidence;
- a precise rules confusion that can be phrased without claiming frequency, e.g. `A common-looking confusion to check: ...` should still be avoided unless commonness is evidenced; prefer `Important distinction:` or `Watch for:`.

Rule-derived warnings are useful even without frequency claims, for example `This profile requires the hand to remain concealed` when that is executable/source truth.

## Visual model

Tile diagrams are part of the product, not decoration.

Prefer renderable structured tile examples over screenshots so that pages can later support:

- responsive accessible diagrams;
- consistent tile art;
- alt/text representation;
- profile-specific example differences;
- prefill into the scorer;
- future generated/share images.

One concept may need more than one example when the legal structure varies by profile or when the concept is not represented by one fixed full hand.

## Scorer bridge

A reference page should become executable where the product safely can.

Conceptually:

```text
reference concept
    ↓
choose profile treatment
    ↓
Try this hand / Score an example
    ↓
selected exact rules profile
+ safe structured evidence/example
    ↓
existing deterministic scorer
```

The reference layer never computes a second score.

A `Try this` link may prefill only evidence that is genuinely fixed by the example. Seat Wind, prevailing Wind, winning method or other context must remain explicit when they affect the result.

## AI / voice architecture

The same data model should later expose a **reference fact packet** rather than asking an LLM to infer rules from page prose.

Example conceptual contract:

```text
getReferenceFactPacket(conceptId, optional rulesProfileRef)
    -> concept identity + aliases
    -> verified profile treatments
    -> requirements / value / interactions
    -> relationship edges
    -> source/provenance IDs
    -> evidence-backed editorial claims
```

Then a future language layer may answer questions such as:

- `What is Thirteen Orphans?`
- `Does my ruleset allow Wriggling Snake?`
- `What is this called in Riichi?`
- `Why is it worth 88 in MCR but a yakuman in EMA Riichi?`
- `Can I expose this hand?`

The language model may **explain and compare reference truth but must not create rules truth**.

This complements #147's existing voice boundary: deterministic rules remain authoritative for scoring.

## Search / machine-readable output

Each concept page should be prerendered/indexable and should support structured machine-readable metadata derived from the same record.

Useful candidates to test in 251B include:

- `DefinedTerm` / `DefinedTermSet` semantics;
- `BreadcrumbList`;
- normal Article/WebPage metadata where appropriate;
- stable canonical URL;
- profile/alias text rendered in crawlable HTML;
- image/tile-diagram alt text.

Do not add structured data solely because a schema type exists. Validate what accurately represents the page.

A future static JSON representation may be useful for internal/future AI consumption, but a public API is not required for the first reference vertical.

## Editorial boundary

Three layers must remain separate:

```text
1. rules/runtime truth
   exact qualification/scoring/profile treatment

2. evidence-backed reference facts
   aliases, source history, rarity studies, observed confusions

3. editorial explanation
   clear prose that helps a human understand 1 and 2
```

Layer 3 may clarify. It may not silently amend layers 1 or 2.

## 251 sequencing consequence

The existing dependency gate remains correct:

```text
Buzzard executable identity
MCR executable identity
EMA Riichi executable identity
        ↓
251A2 relationship audit
        ↓
251B structured concept/treatment vertical proof
        ↓
251C reference hub/template + /special-hands integration
        ↓
251D bounded reviewed expansion
        ↓
251E search/content QA
        ↓
#250 site-wide acquisition consolidation
```

### What can happen before A2

Without Codex and without guessing cross-family identity, we can safely:

- maintain the source-local 626-row inventory;
- capture live Search Console named-hand queries;
- research candidate evidence for rarity/confusion questions;
- design the neutral record/evidence contract on paper;
- identify strong A2 stress-test concepts;
- prepare the 251B page/content acceptance contract;
- map what current scorer URLs/evidence could eventually be prefilled.

Do **not** assign canonical concept IDs or cross-family equivalence just to get pages live sooner.

## Recommended 251B vertical proof

After A2, prove the architecture with only three concepts:

1. **one strong multi-profile concept** — likely Thirteen Orphans / Thirteen Unique Wonders if A2 proves the relationship cleanly;
2. **one partial/narrower/broader analogue** — selected by the relationship audit;
3. **one genuinely profile-specific concept** that must remain unmerged.

For the first multi-profile page, prove:

- tile diagram;
- aliases;
- at least three verified profile treatments;
- value/qualification differences;
- source citations;
- correct scorer links;
- relationship display;
- prerender/metadata/canonical;
- mobile accessibility;
- no duplicate rules database.

Only after those three pages feel genuinely useful should #251 expand the corpus.

## Success test

The reference programme succeeds when a person can search a named Mahjong concept and quickly answer:

> **What is this, what does it look like, does my version of Mahjong use it, what is it called and worth there, what rules matter, and can I try it in the scorer?**

And the same verified data can later answer the equivalent voice question without an AI inventing Mahjong rules.
