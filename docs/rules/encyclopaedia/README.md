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
- `SOURCE_INVENTORY_V3.md` — **current coverage manifest: 8 corpora / 323 finite profile-local entries**.

`SOURCE_INVENTORY_V3.md` is the current coverage manifest. It points back to the earlier inventory passes and to underlying source/profile files rather than duplicating all rules data.

### 251A2 — concept crosswalk — held until runtime profiles exist

After Buzzard 2000, MCR and Riichi are executable on the shared rules platform, compare the implemented profile/catalogue identities and classify relationships such as:

- exact same implemented concept;
- sourced alias;
- genuine equivalent;
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

If an inventory statement conflicts with the named source corpus, the source corpus wins.

## Explicit non-goals for 251A1

- no public `/encyclopaedia/*` routes;
- no SEO page generation;
- no cross-family canonical IDs;
- no fuzzy/name-based equivalence;
- no runtime scoring changes;
- no Codex requirement;
- no changes to #229–#231 architecture.
