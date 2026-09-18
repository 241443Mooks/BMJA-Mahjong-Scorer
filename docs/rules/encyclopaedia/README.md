# Encyclopaedia research staging

Issue: #251

This directory prepares the **rules-aware Mahjong Encyclopaedia** without creating a second rules authority.

## Current phase

### 251A1 — source inventory — active / safe before runtime expansion

Record what each source/profile already says, using profile-local identity only.

This phase may record:

- profile/source item ID;
- local/source name;
- item kind (special hand, fan, yaku, yakuman, named limit/event concept);
- source-owned value/treatment;
- concise qualification/evidence notes;
- source/provenance locator;
- current implementation status.

It must **not** decide that items from different profiles are the same concept merely because names or tile shapes look similar.

Current inventory records:

- `SOURCE_INVENTORY_V1.md` — initial five-corpus pass: BMJA, Thompson & Maloney, Buzzard, MCR and EMA Riichi;
- `SOURCE_INVENTORY_V2.md` — adds Outside the Box and Mahjong Time European Classical and records the wider inventory frontier;
- `ZUNG_JUNG_V33_SOURCE_INDEX.md` — official-source 44-pattern Zung Jung v3.3 index;
- `GMCR_SOURCE_INDEX.md` — named GMCR 56-condition source-local admission and evidence-grade note;
- `TAIWANESE_16_TILE_SOURCE_RECOVERY.md` — recovered 36-item Taiwanese 16-tile association scoring index and provenance chain;
- `IMJ_SOURCE_INDEX.md` — first-party maintained 55-grade-element International Mahjong index;
- `BABCOCK_1923_SOURCE_INDEX.md` — fixed public-domain 1923 source index with 24 reference-worthy scoring concepts;
- `SINGAPORE_MAHJONG_IMPLEMENTATION_SOURCE_INDEX.md` — 26-condition Fan index for the named SingaporeMahjong.com implementation profile;
- `SICHUAN_TFMJ_2024_SOURCE_INDEX.md` — 14-category formal Sichuan competition-standard index with MIL SBR corroboration;
- `SPGG_2024_SOURCE_INDEX.md` — 31-concept January 2024 Singapore Polytechnic Graduates' Guild competition-profile index;
- `CHINESE_CLASSICAL_SOURCE_MAP.md` — historical source/edition map; research only except for separately admitted Babcock 1923;
- `HKMA_SOURCE_PINS.md` — first-party HKMA Clear Chapter and 16-tile profile pins; tables not yet counted;
- `TENHOU_SANMA_PROFILE_NOTE.md` — first-party Tenhou ranked Sanma delta; deliberately not a duplicate counted Riichi corpus;
- `SOURCE_INVENTORY_V4.md` — **current coverage manifest: 15 corpora / 565 finite source-local entries**.

`SOURCE_INVENTORY_V4.md` is the current coverage manifest. It points back to earlier inventory passes and to underlying source/profile files rather than duplicating all rules data.

### 251A2 — concept crosswalk — held until runtime profiles exist

After Buzzard 2000, MCR and Riichi are executable on the shared rules platform, compare the implemented profile/catalogue identities and classify relationships such as:

- exact same implemented concept;
- sourced alias;
- genuine equivalent;
- narrower/broader treatment where justified;
- partial analogue;
- related but materially different;
- unrelated lookalike.

That is the point at which a neutral public concept identity can safely be assigned.

## Why this split exists

The source facts are already mature enough to inventory. The universal concept model is not.

The safe flow is:

```text
source-owned evidence
    -> profile-local source inventory (251A1)
    -> executable profile/catalogue identities
    -> cross-family relationship audit (251A2)
    -> neutral public concept model
    -> Encyclopaedia pages
```

Do not reverse that flow by inventing Encyclopaedia IDs and then forcing the rules runtime to match them.

## Authority rule

The inventory documents are **indexes/manifests**, not duplicate rulebooks. Where a profile already has a complete item-level catalogue, that source-owned catalogue remains authoritative and this directory points to it rather than copying hundreds of rows into another drifting table.

Authority grades must stay explicit. A first-party source, formal standard, named secondary/curated profile source, recovered copy, named implementation source, named organiser competition profile and modern historical synthesis are different evidence classes and must not be collapsed into one label.

If an inventory statement conflicts with the named source corpus, the source corpus wins.

## Inventory boundary rule

Not every score-table row is an Encyclopaedia concept, and not every profile deserves a second copy of an inherited catalogue.

Historical/Classical sources may mix primitive arithmetic mechanics with named hands, patterns, event bonuses and configurable optional treatments. Count the latter when they are useful reference concepts; keep primitive set/pair arithmetic in the future rules/scoring model rather than inflating A1 page-like counts.

Likewise, a derived profile such as Tenhou Sanma may be important because of its profile delta while inheriting an existing Riichi yaku vocabulary. Record the delta rather than automatically duplicating the whole inherited catalogue.

A named implementation profile may be admitted when its own first-party rules expose a closed finite scoring catalogue, but its authority grade must not be promoted into a regional/national standard. `SINGAPORE_MAHJONG_IMPLEMENTATION_SOURCE_INDEX.md` is the current example.

A formal regional competition standard may be counted when its own text explicitly enumerates a finite scoring catalogue. `SICHUAN_TFMJ_2024_SOURCE_INDEX.md` is the current example; overlapping MIL SBR summary material is kept as corroboration rather than automatically counted again.

A dated organiser competition profile may also be counted when its scoring sections are finite and auditable. Settlement-only rows stay outside the count. `SPGG_2024_SOURCE_INDEX.md` demonstrates this boundary.

## Explicit non-goals for 251A1

- no public `/encyclopaedia/*` routes;
- no SEO page generation;
- no cross-family canonical IDs;
- no fuzzy/name-based equivalence;
- no runtime scoring changes;
- no Codex requirement;
- no changes to #229–#231 architecture.
