# Received rules source material — 24 September 2026

Status: **research evidence captured; no runtime/scoring semantics changed**  
Parent context: #251 Encyclopaedia / rules evidence programme

## Purpose

Record two user-supplied Mahjong rules documents received on 24 September 2026 without silently promoting either document into executable rules truth or duplicating an already-counted source corpus.

The project rule remains:

> preserve source-local facts, source identity and uncertainty first; only promote rules into runtime/profile truth through the normal provenance and implementation gates.

---

## 1. *A Guide to Mahjong (Chinese / Official International Rules)*

User-supplied filename: `A_GUIDE_TO_MAHJONG.PDF`  
Length: 38 pages  
Source family named by the document: **Chinese / Official International Rules**

### Source identity and distribution note

The document identifies itself as a guide to Chinese / Official International rules. Its own sharing section says the document is free to share, but asks websites that make it available to use the links published at:

- `http://www.mahjonged.com/chinese_rules.html`

rather than hosting a copied PDF, so readers receive the latest version from the source site.

For that reason this repository records the source and its contents/provenance rather than committing the supplied PDF binary.

### What the document contains

The guide includes:

- tile-set basics, Flowers/Seasons and Wind correspondence;
- setup, wall building, wall break and a **14-tile dead wall**;
- dealing and replacement-tile procedure;
- Chow/Pung/Kong/Pair definitions and claim priority;
- ready/waiting and ordinary winning-hand structure;
- round/Wind rotation;
- basic scoring;
- a complete section described as **81 scoring hands**, arranged by point value from 1 through 88 points.

The 81-item section covers the same broad Chinese Official / competition-scoring family already represented in Mahjong Reference by the MCR/WMO 2006 corpus.

### Repository treatment

Treat this as a **corroborating / secondary implementation-readable MCR-family reference**, not as a replacement for the current formal MCR authority.

Current project authority remains:

- WMO 2006 / EMA Green Book evidence;
- `MCR_FAN_CATALOGUE_2006.md`;
- the sealed `mcr-wmo-2006` runtime/profile evidence.

Do **not** add another 81 entries to the #251 source-local count merely because this guide also enumerates 81 scoring hands. That would duplicate the already-counted MCR corpus rather than add a genuinely new profile/source family.

### Useful future checks

This document is useful for:

1. plain-language cross-checks of MCR concepts and table procedure;
2. identifying terminology differences between older/general English explanations and the current WMO/EMA project source;
3. spotting source presentation issues that should **not** be silently normalised.

Examples of source quirks visible in the supplied guide include numbering/label inconsistencies in the scoring catalogue. Preserve those as source artefacts if the document is ever used for a formal comparison; do not repair them by inference.

### Evidence status

```text
source family identified                 yes — Chinese / Official International
formal project authority                 no — corroborating reference only
finite scoring catalogue                 yes — 81 scoring hands
new #251 counted corpus                   no — overlaps existing MCR 81-fan corpus
runtime implication                      none
safe immediate use                       corroboration / terminology / procedure cross-check
```

---

## 2. *Singaporean Mahjong* two-page reference sheet

User-supplied filename: `Singaporean-Reference.PDF`  
Length: 2 pages  
Visible title: **Singaporean Mahjong**

### Source identity

The sheet itself does not provide enough bibliographic metadata to establish a named author, organisation, publication date or edition.

It ends with:

- `For basic Mahjong rules, see http://www.mahjongpictureguide.com`

That link is useful context but does **not** by itself prove who authored the two-page scoring/reference sheet or whether it represents a club, teaching group, website profile or wider convention.

Until source identity is pinned, treat this as **user-supplied source material with unresolved provenance**.

### Distinctive rules captured by the sheet

The first page explicitly states, among other things:

- four Animal tiles: **cat, mouse, chicken, centipede**;
- wall lengths of 2×19 on East/West and 2×18 on South/North;
- **minimum 1 tai** to win;
- **Seven Pairs not allowed**;
- temporary restrictions on claiming an identical tile after discarding/skipping it;
- a **15-tile dead wall**;
- the player drawing the last playable tile does not discard;
- dealer continuation rules tied to dealer wins and some drawn hands.

The scoring table includes 1–5 tai treatments for items such as:

- Animals and seat Flowers;
- Dragon/valued-Wind Pungs;
- Little/ordinary Ping Hu;
- Fully Concealed Hand;
- replacement-tile wins, robbing a Kong and last-tile draw;
- Half/Full Flush;
- All Pungs;
- Little/Big Dragons and Winds;
- 13 Orphans;
- All Green;
- Nine Gates;
- Four Kongs;
- Heavenly/Earthly Hand.

The second page also defines:

- immediate side payments for Kongs, Flower/Season "Wedding", animal "Bite", Flower Set and Animal Set;
- a **tai-to-points conversion capped at 5 or more tai = 16 points**;
- separate discard/self-draw winner payments;
- explicit **pay-for-all** / dangerous-discard situations.

### Important: this is not the same profile as the existing SingaporeMahjong.com corpus

Mahjong Reference already has a bounded `SingaporeMahjong.com` implementation-profile source index with 26 source-local Fan conditions.

The supplied sheet must **not** be merged into that profile by name alone. It contains materially different treatments, for example:

- this sheet caps its displayed conversion at **5+ tai**;
- Big Dragons / Big Winds are shown as **5 tai**;
- Seven Pairs is explicitly disallowed;
- a **15-tile dead wall** is specified;
- its side-payment and pay-for-all table has its own explicit structure.

Those differences are evidence of the exact problem the project is designed to preserve: "Singaporean Mahjong" is not one safely inferable universal profile.

### Repository treatment

For now:

- preserve this sheet as a **separate unresolved-provenance Singaporean reference profile candidate**;
- do not use it to amend `SINGAPORE_MAHJONG_IMPLEMENTATION_SOURCE_INDEX.md`;
- do not add its rows to the 626 inventory count yet;
- do not infer equivalence with SingaporeMahjong.com, Hong Kong, Taiwanese or other Cantonese-derived profiles;
- if provenance is later identified, create a dedicated source-local index and compare exact predicates, values, settlement and progression before deciding whether it deserves a named profile.

### Evidence status

```text
source/profile identity                  unresolved
user-supplied complete reference sheet   yes — 2 pages
materially distinct Singaporean profile  yes, relative to current SingaporeMahjong.com evidence
finite scoring/payment material          yes
new #251 counted corpus                   not yet — provenance gate first
runtime implication                      none
next useful action                       identify source/author/date, then source-local index if warranted
```

---

## Consequence for #251 / future comparator work

These two documents strengthen different parts of the evidence base without changing the current 626-corpus count:

- the Chinese/Official guide is an **additional MCR-family corroborating reference** over an already-counted 81-fan corpus;
- the Singaporean sheet is evidence of a **potentially distinct Singaporean table/profile**, but must remain source-local and unresolved until its provenance is identified.

This distinction should survive into later comparator/Encyclopaedia work:

```text
same broad family / corroborating source
    !=
new independently counted profile

shared regional label
    !=
identical rules profile
```

No executable scorer, settlement or progression behaviour should change from this note alone.
