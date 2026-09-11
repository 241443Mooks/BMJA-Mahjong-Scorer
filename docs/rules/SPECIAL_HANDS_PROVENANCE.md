# Special-hands provenance crosswalk

This document starts the canonical-pattern map needed to separate **what a hand is** from **what a rules profile calls it and scores it as**.

It is intentionally incomplete. Only hands supported by the current research baseline are included here. Additional hands should be added only when their source identity and pattern are checked.

## Evidence key

- `verified` — source checked for that profile;
- `verified-club` — documented by Outside the Box;
- `needs-primary-source` — Western ordinary-rules context still requires _The Game of Mah Jong Illustrated_;
- `needs-pattern-check` — name overlap is known but exact tile predicate still needs source-by-source confirmation;
- `unknown` — no current evidence.

## 1. Core architecture rule

A special-hand record should be split into two layers:

```text
canonical pattern
    ↓
profile binding
    ├─ local name
    ├─ enabled / disabled
    ├─ winning score
    ├─ fishing score
    ├─ exposure policy
    ├─ aliases
    └─ provenance
```

Never store the score directly on the canonical pattern.

---

## 2. High-value shared patterns

These are the best candidates for the first cross-profile golden tests because they recur across multiple Mahjong traditions.

| Canonical pattern ID        | British / BMJA name                                             | Western / T&M name                           | Outside the Box                  | Current status                                                                                  |
| --------------------------- | --------------------------------------------------------------- | -------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pattern.thirteen-orphans`  | Thirteen Unique Wonders                                         | equivalent Western hand present in Companion | present/expected where selected  | BMJA `verified`; T&M catalogue `verified`; OTB exact binding to index                           |
| `pattern.nine-gates`        | Gates of Heaven                                                 | Gates of Heaven                              | present in OTB guide             | BMJA `verified`; T&M `verified`; OTB `verified-club`; exact predicate cross-check still prudent |
| `pattern.big-three-dragons` | Three Great Scholars                                            | Three Great Scholars                         | Three Great Scholars             | shared identity strongly supported; profile values differ                                       |
| `pattern.big-four-winds`    | Four Blessings                                                  | Four Blessings                               | Four Blessings                   | shared identity strongly supported                                                              |
| `pattern.four-kongs`        | Fourfold Plenty                                                 | Fourfold Plenty                              | selected where present           | shared identity strongly supported                                                              |
| `pattern.all-honours`       | Heads and Tails / related honours family requires exact mapping | Western honours-family hands present         | OTB honours-family hands present | `needs-pattern-check`; avoid name-based merge                                                   |
| `pattern.all-green`         | Imperial Jade / related green-family mapping                    | Green-family Western hands present           | Green Jade present               | `needs-pattern-check`; names may represent different predicates/values                          |
| `pattern.seven-pairs`       | pair-based special-hand family present                          | pair-based Western family present            | pair-based hands present         | canonical seven-pairs predicate likely reusable; local catalogue mapping to verify              |
| `pattern.heavenly-hand`     | special way of going out                                        | Western equivalent present                   | OTB binding to index             | shared concept; naming/score may differ                                                         |
| `pattern.earthly-hand`      | special way of going out                                        | Western equivalent present                   | OTB binding to index             | shared concept; naming/score may differ                                                         |

The table deliberately avoids asserting exact equivalence where the current evidence is based primarily on names or thematic grouping.

---

## 3. Three Great Scholars — reference architecture case

`pattern.three-great-scholars` is the strongest concrete proof that pattern identity and score must be separate.

| Profile                      | Local name           |         Winning value | Fishing value | Evidence                                             |
| ---------------------------- | -------------------- | --------------------: | ------------: | ---------------------------------------------------- |
| British / BMJA               | Three Great Scholars | 1,000 limit treatment |           400 | BMJA special-hands source — `verified`               |
| Thompson & Maloney Companion | Three Great Scholars |                 1,500 |           600 | Companion synopsis/photos — `verified` for catalogue |
| Outside the Box              | Three Great Scholars |                 1,000 |           400 | OTB guide — `verified-club`                          |

Engineering consequence:

```text
pattern.three-great-scholars
```

must contain only the structural predicate. Each profile binding supplies the score.

## 3.1 Executable provisional T&M profile

`western-tm@0.1` is the first executable Thompson & Maloney profile. It is deliberately provisional: its ordinary game reuses the existing BMJA-compatible British/Western base for ordinary scoring and validation; Pung, Kong and pair values; Flowers and Seasons; ordinary doubles; East and prevailing-wind treatment; settlement; progression; and ordinary winner handling. Each of those reused domains is **provisional-compatible**, not `verified-identical`: no credible contrary evidence is currently known, but direct T&M primary-source verification remains pending.

The verified Western special-hand bindings in this version are Three Great Scholars (1,500 winning / 600 fishing), Unique Wonder via `thirteen-unique-wonders` (2,000 / 800), All Pair Honours via `all-pair-honours` (1,000 / 400), Four Blessings via `four-blessings` (1,500 / 600), All Winds and Dragons via `all-winds-and-dragons` (1,000 / 400), and Heads and Tails via `heads-and-tails` (1,000 / 400). The Companion source page and edition references are retained in `TM_COMPANION_CATALOGUE_INDEX.md` (§4). Other BMJA special hands are not implicitly Western members; each needs provenance-controlled evidence before it is bound. This does not claim that Western rules extend or derive from BMJA; it is a bounded implementation reuse pending primary-source review.

Do not promote this profile to `western-tm@1.0` while executable provisional-compatible assumptions remain.

---

## 4. BMJA hands also found in the wider Thompson & Maloney catalogue

The 9 September research identified substantial overlap, including at least the following names/concepts:

| Working pattern/hand ID           | BMJA                 | T&M Companion                        | OTB                                       | Notes                                                     |
| --------------------------------- | -------------------- | ------------------------------------ | ----------------------------------------- | --------------------------------------------------------- |
| `pattern.buried-treasure`         | present — `verified` | present — `verified`                 | OTB binding to index                      | exact exposure predicate should be checked across sources |
| `pattern.purity`                  | present — `verified` | present — `verified`                 | OTB binding to index                      | likely same family; verify exact tile predicate           |
| `pattern.imperial-jade`           | present — `verified` | present — `verified`                 | green-family OTB hands present            | do not merge with `Green Jade` without predicate check    |
| `pattern.heads-and-tails`         | present — `verified` | present — `verified`                 | OTB binding to index                      | exact Western/OTB mapping to index                        |
| `pattern.all-winds-and-dragons`   | present — `verified` | present — `verified`                 | OTB binding to index                      | strong overlap                                            |
| `pattern.three-great-scholars`    | present — `verified` | present — `verified`                 | present — `verified-club`                 | values differ by profile                                  |
| `pattern.four-blessings`          | present — `verified` | present — `verified`                 | present — `verified-club`                 | value/exposure to index                                   |
| `pattern.knitting`                | present — `verified` | present — `verified`                 | OTB binding to index                      | exact predicate to compare                                |
| `pattern.triple-knitting`         | present — `verified` | present — `verified`                 | OTB binding to index                      | exact predicate to compare                                |
| `pattern.all-pair-honours`        | present — `verified` | present — `verified`                 | OTB binding to index                      | pair-family                                               |
| `pattern.wriggling-snake`         | present — `verified` | present — `verified`                 | present in OTB material — `verified-club` | alias spelling may vary; use canonical ID                 |
| `pattern.thirteen-unique-wonders` | present — `verified` | equivalent hand present — `verified` | OTB binding to index                      | canonical alias likely `pattern.thirteen-orphans`         |
| `pattern.fourfold-plenty`         | present — `verified` | present — `verified`                 | OTB binding to index                      | canonical alias likely `pattern.four-kongs`               |

This overlap supports the hypothesis that BMJA preserves a narrower standardised catalogue within a broader Western tradition.

It does **not** prove direct historical derivation from Thompson & Maloney.

---

## 5. Additional Western-style hands documented by Outside the Box

The Outside the Box guide includes many non-BMJA hands that also appear in Thompson & Maloney material or the wider Western catalogue identified during research.

Initial list:

| Working ID               | Outside the Box name | T&M / Western evidence                    | BMJA                                              | Status / note                             |
| ------------------------ | -------------------- | ----------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| `pattern.windfall`       | Windfall             | present in Western material               | not BMJA-recognised in current baseline           | OTB `verified-club`; T&M mapping to index |
| `pattern.windy-ones`     | Windy Ones           | present in T&M material                   | not in BMJA baseline                              | strong Western-selection candidate        |
| `pattern.windy-nines`    | Windy Nines          | present in T&M material                   | not in BMJA baseline                              | strong Western-selection candidate        |
| `pattern.dragonfly`      | Dragonfly            | present in T&M material                   | not in BMJA baseline                              | strong Western-selection candidate        |
| `pattern.wriggly-dragon` | Wriggly Dragon       | present in OTB and wider Western material | not in BMJA baseline                              | exact T&M name/predicate to verify        |
| `pattern.green-jade`     | Green Jade           | present in Western/OTB material           | do not equate automatically to BMJA Imperial Jade | `needs-pattern-check`                     |
| `pattern.red-coral`      | Red Coral            | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |
| `pattern.white-opal`     | White Opal           | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |
| `pattern.gretas-garden`  | Greta's Garden       | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |
| `pattern.gretas-dragon`  | Greta's Dragon       | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |
| `pattern.gretas-garter`  | Greta's Garter       | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |
| `pattern.red-lantern`    | Red Lantern          | present in Western/OTB material           | not in BMJA baseline                              | source locator to index                   |

These hands are useful evidence for the narrower hypothesis:

> Some British club house-rule catalogues are selections from wider Western Mahjong rather than wholly local inventions.

A multi-club sample is still needed before generalising that claim across British Mahjong.

---

## 6. Name-matching hazards

Names are not safe identifiers.

### Hazard A — same pattern, different name

Examples across world rulesets include:

- Thirteen Unique Wonders / Thirteen Orphans / Kokushi Musou;
- Gates of Heaven / Nine Gates / Chuuren Poutou;
- Three Great Scholars / Big Three Dragons / Daisangen;
- Four Blessings / Big Four Winds / Daisuushii;
- Fourfold Plenty / Four Kongs / Suukantsu.

These are candidates for shared canonical predicates with profile-specific display names.

### Hazard B — similar name, different pattern

The Companion research showed that thematically similar or similarly named hands may not be structurally identical.

Therefore:

- never merge records using fuzzy text matching alone;
- compare tile predicates;
- compare exposure requirements;
- compare whether Flowers/Seasons or honours are structural or merely scoring bonuses;
- keep aliases profile-scoped until equivalence is proven.

### Hazard C — same name, different score

Three Great Scholars proves this directly.

A canonical-pattern table with a single `score` field is therefore invalid for a multi-ruleset product.

---

## 7. Proposed canonical-pattern record

Conceptually:

```ts
type CanonicalPattern = {
  id: string;
  structuralDefinition: PatternPredicate;
  semanticFamily?: string;
  notes?: string;
};
```

No local name. No score. No fishing value.

Then profile bindings:

```ts
type PatternProfileBinding = {
  profileId: string;
  patternId: string;
  localName: string;
  aliases?: string[];
  enabled: boolean;
  scoreModel: FixedScore | OrdinaryScore | ProfileGrammarScore;
  fishingValue?: number;
  exposurePolicy?: ExposurePolicy;
  sourceEvidenceIds: string[];
};
```

---

## 8. First golden-test candidates

When the rules architecture reaches implementation, create cross-profile test fixtures for patterns that are well-supported and materially different by profile.

Priority order:

1. Three Great Scholars — same hand, demonstrably different fixed values;
2. Four Blessings — shared high-value pattern;
3. Fourfold Plenty / Four Kongs — shared structural pattern, different naming families;
4. Thirteen Unique Wonders / Thirteen Orphans — strong cross-discipline canonicalisation test;
5. Gates of Heaven / Nine Gates — strong alias/pattern test;
6. Wriggling Snake — British/Western overlap and spelling/alias handling;
7. one OTB-only Western selection such as Greta's Garter — proves catalogue inclusion is profile data rather than engine code.

Each fixture should verify:

- pattern detection;
- local name;
- enabled/disabled status;
- winning value;
- fishing value where applicable;
- exposure policy;
- provenance metadata.

---

## 9. Source-indexing backlog

Before this document can drive a complete Western profile, add exact source locators for:

- every Companion hand used in production;
- every OTB imported hand;
- every BMJA hand used as a cross-profile golden fixture;
- exact tile predicate where names alone are currently being used as the link.

For the supplied Companion photographs, index:

```text
book edition/year
page number
hand name
winning value
fishing value
exposure note
structural synopsis
```

Do not reproduce the source illustration or prose. Record only the factual structure/value/provenance needed for the rules model.

---

## 10. Current safe conclusion

The special-hand evidence strongly supports three separate concepts:

1. a reusable canonical pattern library;
2. a narrower BMJA catalogue/profile;
3. a much broader Western catalogue from which a named club may select additional hands.

Outside the Box is therefore a strong first real-world test of a composable catalogue architecture.
