# Public Mahjong rules content architecture

This document is Pass 6 of the 9 September 2026 multi-ruleset research and planning programme.

Its purpose is to turn the internal rules research into a durable **public reference architecture** for Mahjong Reference without confusing content coverage with scorer support.

The core product rule is:

> **Mahjong Reference may explain a ruleset before it can score that ruleset, but it must always say which rules the scorer actually supports.**

The public reference layer should become a trusted map of Mahjong rules families, not a collection of SEO landing pages that imply one universal set of rules.

## 1. Product position

Mahjong Reference has two related but distinct public roles:

1. **Playable tools** — hand scoring, full-game settlement and later selectable rules profiles.
2. **Reference content** — explain how Mahjong rules differ, where a rule comes from and which tradition/profile it belongs to.

These should share one evidence base but not share unsupported claims.

A page may therefore be:

- `supported` — Mahjong Reference has a selectable scorer/game profile for this ruleset;
- `reference-only` — researched content exists, but the scorer does not yet implement it;
- `planned` — a profile is on the roadmap but is not yet public-ready.

These states should be explicit in copy/components rather than inferred from route names.

## 2. Existing route to preserve

The site already has a public comparison route:

- `/mahjong-rules-compared`

Do not create a competing page that duplicates its purpose.

As the reference layer grows, this route can remain the broad comparison/entry page or become the canonical comparison hub. If a future `/rules/compare` hierarchy is introduced, prefer a deliberate redirect/canonical strategy rather than leaving two near-identical indexable pages.

## 3. Proposed public information architecture

The long-term structure should favour one rules hub with clear descendants.

```text
/rules
├── /rules/british
├── /rules/western
├── /rules/hong-kong
├── /rules/riichi
├── /rules/mcr
├── /rules/american
├── /rules/taiwanese
├── /rules/singapore-malaysia
├── /rules/sichuan
│
├── comparison hub
│   └── preserve /mahjong-rules-compared as the existing canonical/broad route
│
└── /rules/which-rules-am-i-playing
```

Not every route should be built immediately. Create a page only when it can answer a real learner question with sourced, useful content.

### Near-term routes

The first public expansion should be deliberately small:

1. `/rules` — Mahjong rules hub.
2. `/rules/british` — authoritative description of the currently supported British/BMJA-style profile.
3. `/rules/western` — Thompson & Maloney Western overview once the baseline evidence is sufficiently verified.
4. existing `/mahjong-rules-compared` — strengthen using the new taxonomy and source policy.
5. `/rules/which-rules-am-i-playing` — learner-oriented diagnostic/decision guide.

A dedicated `British vs Western` page can be added when the crosswalk is complete enough to provide substantial value beyond the two profile pages and broad comparison route.

## 4. Ruleset page template

Each ruleset page should answer the same core questions in roughly the same order.

### Identity

- What is this ruleset/tradition called?
- Is it a formally standardised ruleset, a recognised published tradition, or a broad regional family?
- Which authority/reference does Mahjong Reference use for this page?

### At the table

- tiles / Flowers / Seasons / Jokers where relevant;
- number of tiles held;
- ordinary winning shape;
- draw/discard/calling differences;
- dealer/East role;
- distinctive exchange mechanics such as Goulash or Charleston.

### How scoring works

Explain the **scoring grammar**, not merely a list of point values:

- British/Western: base points + doubles + special-hand values;
- Hong Kong: faan + payment conversion;
- Riichi: yaku/han + fu + payment formula;
- MCR: additive fan + interaction rules;
- American/NMJL: annual target-hand catalogue/card values.

### What happens after a hand

- who scores;
- who pays whom;
- whether non-winners score;
- dealer/East multipliers;
- draw/ready settlement;
- liability/penalty effects where central.

### Special mechanics

Only include mechanics genuinely distinctive to that profile, for example:

- BMJA Goulash;
- Riichi/furiten/dora;
- American Charleston/Jokers;
- Taiwanese 16-tile hand structure;
- Sichuan continue-after-win lifecycle.

### Mahjong Reference support state

Every page should contain a clear status block such as:

> **Scorer support:** Available — British / BMJA-style

or:

> **Scorer support:** Reference only — Riichi scoring is not currently implemented.

This is a product-integrity requirement, not merely UX polish.

### Sources

Provide a concise source/reference section with the exact governing body, rulebook, edition or published reference used.

Do not overload beginner copy with academic-style citations after every sentence, but important disputed/variable claims should remain traceable.

## 5. Comparison content model

Comparison pages should compare **dimensions**, not just hand names.

Reusable comparison dimensions include:

- tile set/composition;
- hand size / winning shape;
- Flowers/Seasons/Jokers;
- calling/exposure;
- minimum winning requirement;
- special-hand or pattern model;
- scoring grammar;
- ready/fishing/tenpai treatment;
- non-winner scoring;
- dealer/East treatment;
- settlement;
- draw handling;
- liability/penalties;
- exchange mechanics;
- game/round progression;
- rules authority/versioning.

This allows the same structured evidence to power prose pages, tables, future interactive comparisons and search snippets without creating independent sources of truth.

### Comparison editorial rule

Do not say two rulesets are "the same" simply because they recognise the same tile pattern.

For example, a Big Three Dragons pattern can exist in multiple disciplines while having completely different scoring and settlement consequences.

## 6. `Which rules am I playing?` page

This page could become one of the most useful learner entry points.

It should diagnose likely rules family through observable questions, not force users to know terminology first.

Candidate questions:

- Do you use an annually issued card of winning hands?
- Do you use Jokers?
- Do you pass tiles before play in a Charleston?
- Do you declare Riichi / use dora indicators?
- Do players hold 16 tiles before drawing a 17th?
- Do you score ordinary sets with small base-point values and then double?
- Do non-winning players calculate scores and settle differences?
- Do you use a Goulash after a drawn hand?
- Does your group use a large catalogue of named Western special hands?
- Are you following a named club/tutor rule sheet?

Outputs should be probabilistic/helpful rather than falsely definitive:

> Your group sounds closest to British/Western Mahjong. Check these three differences to narrow it down.

A later interactive implementation may use the same questions, but the first version can be a simple readable decision guide.

## 7. British page policy

`/rules/british` should be the clearest public description of the **currently supported** rules profile.

It should:

- state `British / BMJA-style` explicitly;
- avoid implying formal BMJA affiliation;
- explain the base-points + doubles grammar;
- explain fishing, East settlement and loser-to-loser settlement clearly;
- describe the BMJA special-hand catalogue as a defined/restricted catalogue;
- explain Goulash;
- link directly to the hand scorer, game scorer, scoring examples and special hands;
- distinguish standard BMJA-style rules from optional club/house variation.

Where a current learning page already explains a topic well, link/reuse shared content rather than duplicating a second body of rules prose.

## 8. Western page policy

`/rules/western` should not be published as a definitive complete rules page until the Western baseline from Thompson & Maloney's *The Game of Mah Jong Illustrated* is sufficiently verified.

When published, it should explain:

- Western Mahjong as a recognised published/classical tradition rather than one vague catch-all phrase;
- the relationship to British/BMJA carefully;
- the common base-points/doubles structure where verified;
- the larger special-hand ecosystem represented by the Thompson & Maloney Companion;
- where British standardisation narrows or fixes the wider Western range;
- that named clubs may select Western hands/conventions differently.

Do not state that all Australian Mahjong or all Western clubs use Thompson & Maloney unchanged.

Issue #72 remains the implementation/discoverability workstream for this content and should consume the verified rules evidence rather than drive it.

## 9. Future ruleset page policy

### Hong Kong

Use a **named codified authority/profile**, not generic "Hong Kong Mahjong" as though every table follows one universal rulebook.

Public copy can explain the broader family, but any selectable scorer must name the exact rules authority/version.

### Riichi

Use a formal rules source such as WRC/another deliberately chosen edition.

Clearly distinguish reference coverage from scorer support until han/fu, yaku, ron/tsumo, dealer continuation and draw settlement are implemented.

### MCR

Use the formal Mahjong Competition Rules edition.

The page should explain the 81-combination/additive-fan model and minimum qualifying score without flattening it into Western "special hands" terminology.

### American / NMJL

Explain the annual-card architecture, Charleston and Jokers at a high level.

Do not reproduce the proprietary annual card or imply that Mahjong Reference supplies current card content unless a lawful licensing/data strategy exists.

### Taiwanese / Singaporean / Malaysian / Sichuan

Do not publish generic authoritative pages until a named source/profile has been selected and the regional-variation problem has been researched carefully.

A broad comparison page may mention these families at a high level with the appropriate caveat.

## 10. Source and provenance policy for public content

Internal provenance should remain richer than public citation UX.

For each public rules page, keep a structured mapping back to:

- profile/ruleset ID;
- source ID from `SOURCE_REGISTER.md`;
- source edition/version;
- rule-level evidence status where relevant;
- date last reviewed.

### Public wording

Prefer wording such as:

- "Under the BMJA-style rules used by this scorer..."
- "In Thompson & Maloney's Western rules..."
- "Under World Riichi Championship rules..."
- "Outside the Box documents this local rule as..."

Avoid:

- "Mahjong rules say..." when the claim is profile-specific;
- "official" unless there is a genuine authority for that discipline;
- implying affiliation merely because an official/approved source is used;
- synthesising conflicting sources into an invented universal rule.

## 11. Status badges / disclosure component

Create one reusable content component eventually, conceptually:

```text
Rules profile: British / BMJA-style
Scorer support: Available
Source status: Verified
Last reviewed: 9 Sep 2026
```

For reference-only pages:

```text
Rules profile: Japanese Riichi (WRC edition)
Scorer support: Reference only
Source status: Verified source / scorer not implemented
```

This component can reinforce trust, reduce repeated caveat prose and make future profile expansion obvious.

Do not expose internal confidence codes such as `needs-primary-source` to ordinary users verbatim. Translate them into clear editorial states or withhold incomplete pages.

## 12. Internal linking architecture

The rules hub should connect four content layers:

```text
Rules overview/comparison
        ↓
Ruleset page
        ↓
Concept/reference page
        ↓
Interactive example / scorer (when supported)
```

Examples:

- `/rules/british` -> `/special-hands` -> `/scoring-examples` -> `/hand`
- `/rules/western` -> Western special-hand reference -> scorer only when Western support exists
- `/mahjong-rules-compared` -> each ruleset page
- `/rules/which-rules-am-i-playing` -> likely matching ruleset pages

Scorer pages should reciprocally link back to the active rules profile explanation.

This creates useful learner navigation and truthful search signals at the same time.

## 13. SEO / discovery principles

The rules reference should win searches by being genuinely useful, not by creating dozens of thin permutations.

### Good page opportunities

- British Mahjong rules
- Western Mahjong rules
- British vs Western Mahjong
- Mahjong rules compared
- Which Mahjong rules am I playing?
- British vs Riichi
- British vs American Mahjong
- Western vs American Mahjong

Only create a dedicated comparison page when there is enough unique content to justify it.

### Avoid

- one page for every keyword permutation;
- "Australian Mahjong rules" without a defensible named rule source;
- pages that imply unsupported scorer capability;
- copying the same comparison table onto many URLs;
- keyword-driven scoring logic.

Canonical metadata, sitemap inclusion and prerendering should continue to use the shared SEO architecture already in the application.

## 14. Content reuse and one source of truth

The research documents are not themselves public copy.

Public content should be generated/maintained from the same verified concepts but written for learners.

Where possible, create reusable structured domain/reference data for factual tables rather than manually maintaining the same rule fact in:

- scorer code;
- guide prose;
- comparison table;
- book manuscript;
- video script;
- SEO page.

Do not over-engineer a CMS prematurely, but preserve stable rule IDs/source IDs so consolidation remains possible.

## 15. Relationship to the book / learning ecosystem

Issue #79 should consume the same rules/provenance system.

The website, scorer, videos and any future book should be different presentations of the same verified rules evidence.

A useful long-term loop is:

```text
reference explanation
    -> worked example
        -> interactive scorer state
            -> deeper comparison/source note
```

This is a stronger proposition than a calculator plus unrelated blog posts.

## 16. Phased public rollout

### Phase A — truth and navigation

- create `/rules` hub;
- establish support/status component;
- strengthen existing `/mahjong-rules-compared` using the new taxonomy;
- add British rules page or consolidate existing British guide into an explicit rules entry point;
- add `Which rules am I playing?` page.

### Phase B — Western authority

After the Western baseline evidence gate:

- publish `/rules/western`;
- update #72's Western discoverability work around this canonical page;
- add substantial British-vs-Western comparison content;
- link Western special-hand catalogue/reference when ready.

### Phase C — reference-only major disciplines

Using formal source editions:

- Riichi;
- MCR;
- named Hong Kong profile.

These can be public reference pages before scorer support, with explicit `reference-only` status.

### Phase D — further regional families

Research a named standard/profile before publishing authoritative Taiwanese, Singaporean/Malaysian or Sichuan pages.

### Phase E — scorer expansion

As each future engine becomes real, switch its public state from `reference-only` to `supported` and expose direct scorer/game links.

## 17. Acceptance criteria for Pass 6 planning

Pass 6 is complete when:

- [x] a coherent public rules information architecture is defined;
- [x] public reference coverage is separated from scorer capability;
- [x] the existing `/mahjong-rules-compared` route is preserved rather than duplicated;
- [x] first-wave public pages are prioritised;
- [x] a reusable ruleset page template is defined;
- [x] comparison dimensions are standardised;
- [x] source/provenance policy is defined for public copy;
- [x] unsupported/unverified rules cannot masquerade as scorer support;
- [x] the relationship to #72 and #79 is explicit;
- [x] SEO/internal-linking principles are documented;
- [x] later disciplines can be referenced before their scoring engines exist without misleading users.

## Final principle

> **Mahjong Reference should help a player answer two different questions accurately: “What rules am I playing?” and “Can this tool score them?”**

Keeping those answers separate — while connecting them through one evidence base — is the foundation of the public rules/reference strategy.
