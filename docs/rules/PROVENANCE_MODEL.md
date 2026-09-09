# Rule provenance model

This document defines the evidence model that should sit between Mahjong rules research and implementation.

The goal is simple:

> **Every rule, score binding and named hand used by Mahjong Reference should be traceable to a source and a rules profile.**

This prevents four recurring failure modes:

1. a club convention being presented as a universal rule;
2. a Western rule being silently labelled BMJA;
3. the same tile pattern being given one score across profiles that value it differently;
4. an unverified research inference becoming executable scoring logic.

## 1. Separate the things that are currently easy to conflate

The evidence model should distinguish at least these concepts.

### Canonical pattern

A structural tile predicate independent of any one ruleset.

Examples:

- thirteen-orphans-family;
- nine-gates-family;
- big-three-dragons-family;
- big-four-winds-family;
- four-kongs-family.

A canonical pattern **must not contain a ruleset-specific score**.

### Rule

A behavioural or scoring proposition.

Examples:

- maximum number of Chows in an ordinary hand;
- value of an exposed minor Pung;
- East pays and receives double;
- loser-to-loser settlement is performed;
- Goulash follows a drawn hand.

### Profile binding

A rules-profile-specific interpretation of a canonical rule or pattern.

Examples:

- the BMJA name and score for a canonical pattern;
- the Thompson & Maloney Western score for the same pattern;
- whether Outside the Box includes that pattern at all;
- whether an exposed version is prohibited, reduced or unchanged.

### Source evidence

The source that supports the binding or rule.

Examples:

- BMJA-approved rules page;
- a page/edition of *The Game of Mah Jong Illustrated*;
- a page in *The Mah Jong Player's Companion*;
- the Outside the Box guide supplied by Rachel.

### Product explanation

Mahjong Reference's own learner-facing wording.

This is **not** the source text. It should be written independently and can evolve without changing the underlying evidence record.

---

## 2. Stable identifiers

Rules and patterns should use stable semantic IDs rather than names copied from one source.

Suggested namespaces:

```text
pattern.*        canonical hand/tile patterns
play.*           turn/call/hand-construction rules
score.base.*     intrinsic point rules
score.double.*   doubling rules
score.limit.*    limit/cap rules
ready.*          fishing/tenpai/ready-state rules
settlement.*     payments and balance movement
liability.*      cannon/pao/dangerous-discard rules
penalty.*        procedural penalties
goulash.*        Goulash-specific mechanics
progression.*    East/round/game progression
setup.*          tile set, walls, seating, deal
```

Examples:

```text
play.ordinary.max-chows
score.base.pung.minor.exposed
score.base.kong.major.concealed
score.base.mahjong
score.limit.normal
settlement.loser-to-loser
settlement.east-double
ready.special-hand.fishing-value
goulash.trigger.draw
pattern.three-great-scholars
```

Display names remain profile-specific and must not be used as identity keys.

---

## 3. Evidence statuses

Use a deliberately small vocabulary.

| Status | Meaning |
|---|---|
| `verified` | Supported by the relevant authoritative/reference source for that profile |
| `verified-club` | Supported by the named club's own documented rules; authoritative only for that club |
| `needs-primary-source` | Plausible or supported by secondary/catalogue evidence, but the baseline rules source has not yet been checked |
| `needs-club-confirmation` | The club guide is ambiguous or interpretation needs confirmation from the club/tutor |
| `secondary-only` | Useful cross-check, not sufficient to drive canonical implementation |
| `conflict` | Two relevant sources disagree and the intended profile/edition must be resolved |

Do not convert `needs-primary-source`, `needs-club-confirmation`, `secondary-only` or `conflict` evidence into production scoring behaviour without an explicit decision.

---

## 4. Relationship between profiles

For crosswalk work, record the relationship of each rule/profile binding to another profile.

| Relation | Meaning |
|---|---|
| `identical` | Same behaviour/value in both profiles |
| `subset` | Profile deliberately permits/uses a narrower subset |
| `superset` | Profile adds recognised options/hands beyond the comparator |
| `override` | Same structural concept, different value or behaviour |
| `alias` | Same structural pattern, different local name |
| `unique` | Mechanic appears specific to this profile in the current evidence |
| `unknown` | Evidence is insufficient to classify |

These are research relationships, not inheritance instructions. A code architecture may later implement them using composition rather than literal profile inheritance.

---

## 5. Proposed evidence record

Conceptually:

```ts
type EvidenceStatus =
  | 'verified'
  | 'verified-club'
  | 'needs-primary-source'
  | 'needs-club-confirmation'
  | 'secondary-only'
  | 'conflict';

type ProfileRelation =
  | 'identical'
  | 'subset'
  | 'superset'
  | 'override'
  | 'alias'
  | 'unique'
  | 'unknown';

type RuleEvidence = {
  evidenceId: string;
  subjectId: string;       // stable rule or pattern id
  profileId: string;       // bmja, western-tm, outside-the-box, ...
  sourceId: string;        // SOURCE_REGISTER.md id
  sourceLocator: string;   // URL section, book page/edition, guide section
  status: EvidenceStatus;
  claim: string;           // concise project-written factual statement
  relationTo?: {
    profileId: string;
    relation: ProfileRelation;
  };
  checkedOn: string;
  notes?: string;
};
```

The `claim` should be a project-authored factual paraphrase, not copied source prose.

---

## 6. Pattern bindings

The same canonical pattern may have different names, scores and restrictions by profile.

Conceptually:

```ts
type PatternBinding = {
  profileId: string;
  patternId: string;
  enabled: boolean;
  localName: string;
  aliases?: string[];
  scoring:
    | { kind: 'fixed'; winning: number; fishing?: number }
    | { kind: 'ordinary-calculation' }
    | { kind: 'profile-grammar'; key: string };
  exposurePolicy?: 'allowed' | 'concealed-only' | 'reduced-if-exposed' | 'profile-specific';
  sourceEvidenceIds: string[];
};
```

This is required because values can differ even when the tile structure is the same.

### Important example: Three Great Scholars

Current evidence gives a useful architecture test:

- BMJA: limit-hand treatment, currently represented by the British profile's normal 1,000-point limit and 400 fishing value;
- Thompson & Maloney Companion: 1,500 winning / 600 fishing;
- Outside the Box: 1,000 winning / 400 fishing.

Therefore `pattern.three-great-scholars` cannot itself own `score = 1000`.

---

## 7. Source locators

Every evidence item should point as narrowly as practical to its source.

Preferred locator forms:

```text
URL + heading/section
book title + edition/year + page
club guide + version/date + heading/page
photograph set + image/page reference where no page number is yet known
```

Examples:

```text
bmja-scoring | Working out the scores > Pungs and Kongs
bmja-settlement | Settling up > East
TM Companion | 1997 | special-hand synopsis | page to verify
OTB guide | supplied 2026-09-09 | Special Hands table | page/image to index
```

Where a photographed source has not yet been indexed by page, use a temporary locator and mark a follow-up to replace it with the exact page.

---

## 8. Authority and conflicts

Authority is profile-relative.

- BMJA-approved material is authoritative for the BMJA profile.
- Thompson & Maloney is a recognised Western reference, not an authority over BMJA.
- Outside the Box documentation is authoritative for the Outside the Box profile, not for Western Mahjong generally.
- A formal Riichi rulebook is authoritative for the named Riichi profile, not for another Riichi league automatically.

If two sources disagree, do **not** pick whichever value is easiest to implement. Record a `conflict`, identify the intended profile/edition, then resolve deliberately.

---

## 9. Versioning requirements

A future production rules profile should be immutable once used in a saved game.

At minimum record:

```text
profileId
profileVersion
sourceSetVersion
catalogueVersion (where relevant)
```

A saved game must not silently change because:

- BMJA clarification changes;
- a Western source is corrected;
- Rachel changes an Outside the Box rule;
- a special-hand catalogue is expanded.

---

## 10. Copyright boundary

The provenance layer records facts and source locators. It is **not** a content-reproduction store.

Do not persist substantial copied prose, tables or illustrations from copyrighted books merely to make the evidence model convenient.

Mahjong Reference should instead store:

- stable factual claims;
- numeric values;
- pattern identities;
- source references;
- original project explanations and examples.

---

## 11. Implementation gate

Before a rule becomes executable in a new production profile, require:

1. a stable `subjectId`;
2. at least one relevant evidence record;
3. acceptable evidence status (`verified` or `verified-club` for a named club profile);
4. source locator;
5. explicit profile binding;
6. a regression/golden test where the rule changes numerical scoring or settlement.

For the existing BMJA implementation, migration work should first map current behaviour onto this model **without changing outputs**.

---

## 12. Pass-2 scope

This model is accompanied by:

- `BMJA_WESTERN_OTB_CROSSWALK.md` — rule-level comparison of the first three target profiles;
- `SPECIAL_HANDS_PROVENANCE.md` — initial canonical-pattern and special-hand crosswalk.

These remain research artefacts. They are intended to make the later rules-profile refactor evidence-driven rather than assumption-driven.
