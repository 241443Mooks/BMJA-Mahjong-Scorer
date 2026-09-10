# BMJA ↔ Western ↔ Outside the Box rules crosswalk

This document is the first rule-level comparison for the three profiles most relevant to the next implementation phase:

- **British / BMJA** — current canonical product rules profile;
- **Western / Thompson & Maloney** — recognised Western rules family, with the ordinary-game baseline still requiring primary verification from *The Game of Mah Jong Illustrated*;
- **Outside the Box** — named club profile documented by Rachel on 9 September 2026.

This is a research crosswalk, not executable configuration.

## Status key

- `verified` — authoritative/reference source checked for that profile;
- `verified-club` — documented by the club's own guide;
- `needs-primary-source` — Western baseline must still be checked in *The Game of Mah Jong Illustrated*;
- `needs-club-confirmation` — Outside the Box wording needs Rachel's clarification;
- `unknown` — current evidence does not establish the point.

Relationship terms follow `PROVENANCE_MODEL.md`.

---

## 1. Tile set and setup

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `setup.tile-set.classical-144` | 144-tile classical set including Flowers and Seasons — `verified` | likely classical 144-tile baseline — `needs-primary-source` | ordinary play uses classical set; local Goulash additionally uses four blanks — `verified-club` | OTB ordinary play appears aligned with British/classical baseline; Goulash adds local material |
| `setup.players.standard-four` | four players — `verified` | expected four-player baseline — `needs-primary-source` | four-player club play — `verified-club` | probably identical, Western verification pending |
| `setup.seat-winds` | East/South/West/North seat winds — `verified` | expected — `needs-primary-source` | used — `verified-club` | likely identical core |
| `setup.prevailing-wind` | used in scoring/progression — `verified` | `needs-primary-source` | used in guide/scoring context — `verified-club` | Western relationship still to prove |

---

## 2. Ordinary hand construction and calling

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `play.ordinary.structure` | ordinary Mahjong uses four sets plus a pair, subject to BMJA restrictions — `verified` | expected classical structure plus special hands — `needs-primary-source` | British-style ordinary structure — `verified-club` | likely common classical core |
| `play.ordinary.max-chows` | maximum one Chow in ordinary play — `verified` | **unknown until primary source checked** | guide appears British-style; exact general maximum should be confirmed from full guide — `verified-club`/follow-up | this is a key hypothesis test for whether BMJA narrows a broader Western rule |
| `play.call.pung` | discard may be claimed for Pung under BMJA procedure — `verified` | `needs-primary-source` | used — `verified-club` | likely common core |
| `play.call.kong` | discard/conversion Kong rules exist — `verified` | `needs-primary-source` | used — `verified-club` | details need exact cross-check |
| `play.call.chow` | BMJA calling restrictions apply; one-Chow cap in ordinary hand — `verified` | `needs-primary-source` | British-style ordinary play indicated — `verified-club` | potential profile difference |
| `play.exposure` | exposed/concealed distinction materially affects ordinary scoring and some special hands — `verified` | Companion clearly distinguishes exposure for special hands; ordinary rules still `needs-primary-source` | guide explicitly records exposed treatment for special hands — `verified-club` | shared concept; profile-specific policy |

---

## 3. Ordinary intrinsic scoring

The strongest current evidence for common ancestry is the shared classical point structure visible in BMJA and the Outside the Box guide. Western ordinary scoring must still be checked against the main Thompson & Maloney rules book before being marked verified.

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---:|---:|---:|---|
| `score.base.pung.minor.exposed` | 2 — `verified` | `needs-primary-source` | 2 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.pung.minor.concealed` | 4 — `verified` | `needs-primary-source` | 4 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.pung.major-honour.exposed` | 4 — `verified` | `needs-primary-source` | 4 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.pung.major-honour.concealed` | 8 — `verified` | `needs-primary-source` | 8 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.kong.minor.exposed` | 8 — `verified` | `needs-primary-source` | 8 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.kong.minor.concealed` | 16 — `verified` | `needs-primary-source` | 16 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.kong.major-honour.exposed` | 16 — `verified` | `needs-primary-source` | 16 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.kong.major-honour.concealed` | 32 — `verified` | `needs-primary-source` | 32 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.pair.dragon` | 2 — `verified` | `needs-primary-source` | 2 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.pair.own-prevailing-wind` | 2 where qualifying — `verified` | `needs-primary-source` | 2 where qualifying — `verified-club` | BMJA ↔ OTB identical |
| `score.base.flower-season` | 4 each — `verified` | `needs-primary-source` | 4 each — `verified-club` | BMJA ↔ OTB identical |
| `score.base.mahjong` | 20 — `verified` | `needs-primary-source` | 20 — `verified-club` | BMJA ↔ OTB identical |
| `score.base.self-drawn-winning-tile` | 2 where applicable — `verified` | `needs-primary-source` | 2 in supplied ordinary-score table — `verified-club` | BMJA ↔ OTB identical |

### Working inference

The ordinary-score table gives strong evidence that Outside the Box is not using a wholly separate scoring grammar. It uses the same British/classical intrinsic point structure for ordinary hands.

The unresolved question is whether Thompson & Maloney Western uses the same complete table and, if so, whether BMJA should be modelled as a restricted profile over that broader Western core.

---

## 4. Doubles

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `score.double.own-wind` | double for qualifying own-wind set — `verified` | `needs-primary-source` | present — `verified-club` | likely common |
| `score.double.prevailing-wind` | double for qualifying prevailing-wind set — `verified` | `needs-primary-source` | present — `verified-club` | likely common |
| `score.double.dragons` | dragon-set doubles — `verified` | `needs-primary-source` | present — `verified-club` | likely common |
| `score.double.flower-season.complete-set` | BMJA complete Flower/Season-set bonuses — `verified` | `needs-primary-source` | guide includes Flower/Season doubling conventions — `verified-club` | exact profile parity still to map |
| `score.double.little-big-dragon-wind` | BMJA-specific catalogue/rule treatment to map exactly — `verified` at source level | `needs-primary-source` | guide includes Little/Big Dragon and Little/Big Wind bonuses — `needs-club-confirmation` for stacking | OTB stacking semantics unresolved |

### Open OTB question

Confirm whether Little/Big Dragon and Little/Big Wind bonuses:

- stack with individual qualifying-set doubles; or
- replace those component doubles.

Do not encode until Rachel confirms.

---

## 5. Limits and special-hand values

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `score.limit.normal` | normal 1,000-point limit — `verified` | Companion shows values above 1,000; baseline limit semantics require `needs-primary-source` | 1,000 used as normal top special value in supplied guide — `verified-club` | OTB closely tracks BMJA in many selected hands |
| `ready.special-hand.fishing-value` | explicit fishing values for special hands — `verified` | Companion explicitly gives winning/fishing pairs — `verified` for catalogue; ordinary semantics `needs-primary-source` | explicit winning/fishing values — `verified-club` | shared Western/British concept, profile-specific values |
| `special-hand.catalogue.finite` | finite BMJA-recognised list — `verified` | Companion contains 120+ hands — `verified` for catalogue | guide contains BMJA-marked hands plus many additional hands — `verified-club` | BMJA is a substantially narrower catalogue than Companion |
| `special-hand.exposure-policy` | hand-specific — `verified` | Companion records exposed treatment for many hands — `verified` for catalogue | guide records exposed treatment — `verified-club`, interpretation of some half/full labels needs clarification | same dimension, different bindings |

### Important architecture finding

The special-hand catalogue behaves like a **profile binding layer**, not like the identity of the underlying tile pattern.

A single structural hand can have different:

- names;
- winning values;
- fishing values;
- exposure policy;
- inclusion/exclusion status.

See `SPECIAL_HANDS_PROVENANCE.md`.

---

## 6. Settlement

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `settlement.winner-v-losers` | winner settles with each loser — `verified` | `needs-primary-source` | British-style settlement described — `verified-club` | likely common, Western unverified |
| `settlement.loser-to-loser` | losers also settle pairwise — `verified` | **priority Western verification item** | included — `verified-club` | important distinguishing feature from many other Mahjong families |
| `settlement.east-double` | East pays and receives double — `verified` | `needs-primary-source` | included — `verified-club` | BMJA ↔ OTB identical in principle |
| `liability.cannon` | BMJA treatment must be mapped from source/Q&A if present in current implementation context | `needs-primary-source` | explicit cannon rule — `verified-club` | OTB has named local liability behaviour |
| `liability.cannon.no-choice-fishing` | no current BMJA binding established in this crosswalk | `unknown` | explicit “No choice!” exception when fishing — `verified-club` | currently treat as OTB-specific unless independent Western evidence appears |

The exact order of Outside the Box cannon/liability settlement where multiple liabilities could apply remains `needs-club-confirmation`.

---

## 7. Penalties and procedure

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `penalty.wrong-tile-count` | BMJA procedure exists; exact current binding to index from approved source — `verified` at source-family level | `needs-primary-source` | explicit penalty — `verified-club` | potentially common classical procedure, not yet proven |
| `penalty.false-mahjong` | BMJA procedure exists — `verified` at source-family level | `needs-primary-source` | explicit penalty — `verified-club` | exact values/effects need side-by-side indexing |
| `penalty.false-discard-name` | BMJA source/Q&A to index | `needs-primary-source` | explicit rule — `verified-club` | do not generalise yet |
| `penalty.wrongful-claim` | BMJA source/Q&A to index | `needs-primary-source` | explicit rule — `verified-club` | do not generalise yet |

Pass 3 or a dedicated source-indexing pass should replace these broad source-family statuses with exact section/page locators.

---

## 8. Goulash / drawn-hand variant

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `goulash.trigger.draw` | Goulash follows a drawn hand — `verified` | `needs-primary-source` | draw can trigger Goulash — `verified-club` | likely related tradition |
| `goulash.blank-wilds.count` | BMJA Goulash rules use their own defined mechanism — `verified`; exact representation should be indexed | `needs-primary-source` | four blank wild tiles — `verified-club` | may be OTB/Western-derived variation |
| `goulash.charleston.exchange` | BMJA exchange procedure to map exactly | `needs-primary-source` | three Charleston-style exchanges — `verified-club` | OTB guide explicitly uses exchange stage |
| `goulash.chows` | BMJA Goulash Chow rule to map exactly | `needs-primary-source` | no Chows — `verified-club` | direct comparison pending |
| `goulash.blank-use` | BMJA rule to map | `needs-primary-source` | guide restricts blank usage — `verified-club` | profile-specific until proven otherwise |

Goulash is sufficiently rule-dense that it should become its own reusable component, not a single boolean.

---

## 9. Progression and game length

| Rule ID | BMJA | Western / T&M | Outside the Box | Relationship / note |
|---|---|---|---|---|
| `progression.east-retention` | BMJA progression implemented in current game flow — `verified` | `needs-primary-source` | club follows wind/round progression; exact full rule should be indexed — `verified-club` | likely common classical structure |
| `progression.game-end` | current product uses British full-game progression — `verified` | `needs-primary-source` | exact guide wording to index | must not infer Western parity yet |

---

## 10. What currently supports the “BMJA is a restricted Western branch” hypothesis?

### Evidence supporting it

1. **Shared classical mechanics** — Pungs, Kongs, Chows, pair, winds, dragons, Flowers and Seasons.
2. **Shared intrinsic point grammar** — BMJA and OTB ordinary values match exactly in the supplied tables.
3. **Shared doubles concept** — winds, dragons and bonus-tile related doubling conventions appear across the British/club material.
4. **Shared special-hand/fishing model** — both BMJA and Thompson & Maloney catalogue material explicitly distinguish winning and fishing values.
5. **Large special-hand overlap** — many BMJA special hands also appear in Thompson & Maloney's wider catalogue.
6. **BMJA catalogue is much narrower** — consistent with standardisation/restriction rather than invention of an unrelated game.
7. **Real club behaviour** — Outside the Box can mix BMJA-marked hands with wider Western hands while retaining the same ordinary-score core.

### Evidence still needed before treating this as an engineering inheritance rule

1. ordinary Western intrinsic score table from *The Game of Mah Jong Illustrated*;
2. Western Chow limits/calling rules;
3. Western settlement, especially loser-to-loser settlement;
4. East/dealer payment and progression;
5. Western Goulash rules;
6. ordinary exposure/concealment rules;
7. procedural penalties.

### Safe conclusion now

The research strongly supports **close structural kinship** and a likely reusable classical/Western core.

It does **not yet justify coding** `BMJA extends WESTERN` until the missing Western baseline rules are checked.

---

## 11. What supports the “house rules are often Western selections” hypothesis?

Outside the Box provides one strong example:

- ordinary British-style scoring remains intact;
- official British hands are explicitly distinguished;
- many additional hands have counterparts in Thompson & Maloney Western material;
- local rules add further liability/Goulash/procedural choices.

This supports the narrower statement:

> Some British club “house rules” may be selections or adaptations from wider Western Mahjong traditions rather than wholly novel inventions.

It does **not** establish that this is true for most British clubs.

To substantiate the broader claim, collect at least:

- independent rules sheets from multiple clubs;
- the names/patterns of non-BMJA special hands they use;
- whether those hands occur in recognised Western sources;
- whether scores/exposure rules are copied, modified or locally invented;
- club/tutor statements about where their rules came from.

This should become a structured field in future user research rather than an assumption built into the product.

---

## 12. Immediate evidence priorities

### Highest priority — Western baseline

Obtain/check *The Game of Mah Jong Illustrated* for:

1. ordinary scoring table;
2. Chows and calling rules;
3. doubling rules;
4. Flowers/Seasons;
5. East/dealer treatment;
6. winner and loser settlement;
7. fishing semantics;
8. drawn hands/Goulash;
9. penalties;
10. game progression.

### Outside the Box clarification

Ask Rachel to confirm:

1. Little/Big Dragon/Wind stacking;
2. exact exposed half/full interpretation;
3. which imported special hands have local modifications;
4. cannon priority/order when multiple liabilities are possible;
5. any ordinary-play rule in the guide that deliberately differs from BMJA beyond the special-hand catalogue.

### BMJA indexing

Replace source-family labels in this crosswalk with exact approved-page headings/locators for:

- penalties;
- Goulash sub-rules;
- progression;
- exposure edge cases.

---

## 13. Implementation consequence

The next architecture pass should aim to represent the rows in this document as composition rather than branching.

Conceptually:

```text
classical tile/state primitives
        ↓
ordinary scoring component
        ↓
rules-profile bindings
        ├─ BMJA
        ├─ Thompson & Maloney Western
        └─ Outside the Box
        ↓
profile-specific catalogue / settlement / Goulash / progression
```

But this is deliberately **not yet a claim that BMJA inherits Western in code**. The remaining primary-source checks decide whether that relationship is truly safe.
