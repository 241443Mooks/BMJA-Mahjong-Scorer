# Encyclopaedia research staging

Issue: #251

This directory prepares the **rules-aware Mahjong Encyclopaedia** without creating a second rules authority.

## Current phase

### 251A1 — source inventory — shelf-ready / may continue opportunistically

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

Current inventory records include:

- `SOURCE_INVENTORY_V1.md` — initial five-corpus pass;
- `SOURCE_INVENTORY_V2.md` — Outside the Box + Mahjong Time European Classical;
- `ZUNG_JUNG_V33_SOURCE_INDEX.md`;
- `GMCR_SOURCE_INDEX.md`;
- `TAIWANESE_16_TILE_SOURCE_RECOVERY.md`;
- `IMJ_SOURCE_INDEX.md`;
- `BABCOCK_1923_SOURCE_INDEX.md`;
- `SINGAPORE_MAHJONG_IMPLEMENTATION_SOURCE_INDEX.md`;
- `SICHUAN_TFMJ_2024_SOURCE_INDEX.md`;
- `SPGG_2024_SOURCE_INDEX.md`;
- `PINOY_CLASSIC_SOURCE_INDEX.md`;
- `TSUMO_VIETNAMESE_CLASSIC_SOURCE_INDEX.md`;
- `CHEAH_SLOPER_MALAYSIAN_3P_SOURCE_INDEX.md`;
- `CHINESE_CLASSICAL_SOURCE_MAP.md` — historical source map/gates;
- `HKMA_SOURCE_PINS.md` — first-party HKMA source pins, tables not yet counted;
- `TENHOU_SANMA_PROFILE_NOTE.md` — first-party Sanma delta, inherited Riichi catalogue not recounted;
- `WRIGHT_PATTERSON_SOURCE_GATE.md` — current paid/copyrighted source gate;
- `SOURCE_INVENTORY_V4.md` — **current manifest: 18 corpora / 626 finite source-local entries**.

`SOURCE_INVENTORY_V4.md` is the current coverage manifest. It points back to source/profile indexes rather than duplicating all rules data.

### 251A2 — concept crosswalk — held until runtime profiles exist

After Buzzard 2000, MCR and Riichi are executable on the shared rules platform, compare implemented profile/catalogue identities and classify relationships such as:

- exact same implemented concept;
- sourced alias;
- genuine equivalent;
- narrower/broader treatment where justified;
- partial analogue;
- related but materially different;
- unrelated lookalike.

That is the point at which a neutral public concept identity can safely be assigned.

## Why this split exists

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

The inventory documents are **indexes/manifests**, not duplicate rulebooks. Where a profile already has a complete item-level catalogue, that source-owned catalogue remains authoritative.

Authority grades stay explicit. First-party maintained rulesets, formal standards, association sources, organiser profiles, named implementations, bounded published profiles, secondary/curated sources, recovered copies and historical editions/syntheses are not interchangeable evidence classes.

If an inventory statement conflicts with the named source corpus, the source corpus wins.

## Inventory boundary rule

Not every score-table row is an Encyclopaedia concept, and not every profile deserves a second copy of an inherited catalogue.

Do not inflate A1 with:

- primitive/base scoring arithmetic;
- settlement-only transactions or penalties;
- inherited catalogues duplicated under derived profiles;
- architecture-only profiles;
- incomplete/non-gap-checkable tables;
- generic regional synthesis presented as one canonical profile;
- proprietary catalogues reconstructed without legitimate access;
- silently repaired source ambiguities.

Examples of the boundary:

- `BABCOCK_1923_SOURCE_INDEX.md` excludes primitive set/pair arithmetic;
- `TENHOU_SANMA_PROFILE_NOTE.md` records a profile delta without duplicating Riichi yaku;
- `SPGG_2024_SOURCE_INDEX.md` excludes instant-payout/liability rows from its concept count;
- `TSUMO_VIETNAMESE_CLASSIC_SOURCE_INDEX.md` distinguishes its seven-row primary table from other named scoring modifiers;
- `CHEAH_SLOPER_MALAYSIAN_3P_SOURCE_INDEX.md` preserves a bounded source profile without claiming a national standard.

## Current stopping point

251A1 is now broad enough to support later cross-family modelling across Classical/Western, British, MCR, Riichi, Zung Jung, Cantonese/Hong Kong-derived, Taiwanese, Sichuan Bloody, Singapore, Filipino, Vietnamese and Malaysian source profiles plus historical material.

Continue A1 opportunistically when a strong source presents itself, especially the explicit gates in `SOURCE_INVENTORY_V4.md`, but do not delay #227/runtime work merely to increase the inventory count.

## Explicit non-goals for 251A1

- no public `/encyclopaedia/*` routes;
- no SEO page generation;
- no cross-family canonical IDs;
- no fuzzy/name-based equivalence;
- no runtime scoring changes;
- no Codex requirement;
- no changes to #229–#231 architecture.
