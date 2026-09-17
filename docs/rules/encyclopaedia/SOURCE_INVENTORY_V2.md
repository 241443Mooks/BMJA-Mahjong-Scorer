# Encyclopaedia 251A1 — expanded profile-local source inventory v2

Status: **seven source/profile corpora inventoried; cross-family concept matching deliberately not started**  
Parent: #251  
Date: 17 September 2026

## Purpose

Extend the first 251A1 inventory beyond the initial five corpora while preserving the same rule:

> record what each source/profile says; do not decide yet that items from different profiles are the same concept.

`SOURCE_INVENTORY_V1.md` remains the detailed first-pass record for BMJA, Thompson & Maloney, Buzzard, MCR and EMA Riichi. This v2 manifest adds Outside the Box and Mahjong Time European Classical, updates the conservative corpus count, and records the next source-inventory frontier.

This document is an **inventory/index**, not a second rules authority. The named profile/source files remain authoritative for item-level facts.

## Current seven-corpus coverage

The conservative finite profile-local corpus now contains **at least 279 catalogue/limit entries before any cross-family de-duplication**:

| Profile/source corpus | Finite inventory counted for 251A1 | Status | Item-level authority |
| --- | ---: | --- | --- |
| British / BMJA-style `bmja@1.0` | 18 special-hand bindings | Implemented/runtime | `artifacts/mahjong-scorer/src/scoring/special-hands.ts`, `SPECIAL_HANDS_PROVENANCE.md` |
| Thompson & Maloney Companion / `western-tm@0.1` catalogue | 84 unique source hands / 85 bindings | Catalogue complete/source-certified; ordinary profile provisional | `TM_COMPANION_CATALOGUE_INDEX.md` |
| Buzzard 2000 | 10 named limit hands | Source-complete, implementation-ready | `BUZZARD_2000_RULE_EVIDENCE.md` |
| MCR 2006 | 81 fan | Source-complete, implementation-ready | `MCR_FAN_CATALOGUE_2006.md` |
| EMA Riichi 2025 | 29 yaku + 12 yakuman = 41 | Source-complete, implementation-ready | `riichi/EMA_2025_YAKU_CATALOGUE.md` |
| Outside the Box `outside-the-box@0.1` | 33 unique special-hand names | Implemented named club profile; some follow-up evidence remains | `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` |
| Mahjong Time European Classical | 12 named 500-point limit hands | Secondary/provisional published implementation profile; not canonical European truth | `MAHJONG_TIME_EUROPEAN_CLASSICAL_V1_VALIDATION.md` |

```text
18 + 84 + 10 + 81 + 41 + 33 + 12 = 279
```

**279 is not a page count and not a unique-concept count.** It is the number of finite source/profile-local catalogue or named limit entries we can currently point to without performing the later relationship audit.

The total remains deliberately conservative. It excludes many ordinary scoring rules, event bonuses, dora modules, incidents and procedure concepts that may later deserve reference pages but are not finite hand/pattern catalogue entries.

---

## 1. First five corpora

The first five corpora remain described in `SOURCE_INVENTORY_V1.md`:

1. British / BMJA-style — 18 implemented special-hand bindings.
2. Thompson & Maloney Companion — 84 unique source hands / 85 bindings.
3. Buzzard 2000 — 10 named limit hands plus additional ordinary/event concepts.
4. MCR 2006 — 81 source-bound fan.
5. EMA Riichi 2025 — 29 yaku + 12 yakuman.

Do not duplicate their full item tables here. Their existing catalogues/runtime files remain the item-level authority.

---

## 2. Outside the Box — named club corpus

Profile identity: `outside-the-box@0.1`  
Source ID: `otb-guide-2026-09`  
Authority: Outside the Box club guide supplied by Rachel, September 2026.  
Item authority: `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md`.

### Finite special-hand inventory

The supplied guide contains **35 table rows but 33 unique OTB hands**. Hachi Ban and All Pair Ruby Jade each appear more than once as one membership with multiple illustrated forms/sections.

The 33 unique source-local hand names are:

1. Buried Treasure
2. Purity
3. Imperial Jade
4. Heads & Tails
5. All Winds & Dragons
6. Three Great Scholars
7. Four Blessings
8. Fourfold Plenty
9. Knitting
10. Triple Knitting
11. All Pair Honours
12. 13 Unique Wonders
13. Wriggling Snake
14. All Pair
15. Heavenly Twins
16. All Pair Ruby Jade
17. Sparrow's Sanctuary
18. Hovering Angel
19. Big Robert
20. Wriggly Snake
21. Windfall
22. Windy Ones
23. Windy Nines
24. Windy Chow
25. Hachi Ban
26. Dragonfly
27. Dragon Breath / Dragon's Breath
28. Wriggly Dragon
29. Green Jade
30. Red Coral
31. White Opal
32. Run, Pung & Pair
33. Grand Sequence

### Why this belongs in 251A1

Outside the Box is not merely commentary about another ruleset. It is a **named primary club source for its own rules**, and the product already models it as an explicit profile.

The profile crosswalk records for these items, where relevant:

- OTB-local hand name;
- winning/fishing treatment;
- exposure treatment;
- structural synopsis;
- canonical/runtime pattern used by the current implementation where safe;
- divergence from BMJA or T&M;
- `verified-club` / follow-up status.

That is exactly the profile-local evidence shape the Encyclopaedia will eventually consume.

### Important A2 guardrail

The current implementation already reuses some canonical detectors across OTB/BMJA/T&M. That implementation reuse is valuable evidence later, but **251A1 still does not declare universal public concept identity**.

Examples that must remain distinguishable until A2 include:

- Wriggling Snake vs Wriggly Snake;
- OTB Imperial Jade vs T&M Imperial Jade;
- OTB Grand Sequence vs the broader Western pattern;
- profile-specific values/exposure for Four Blessings, Three Great Scholars and the Jade/Coral/Opal family.

### Additional OTB concepts not included in the 33 count

The profile also contains source-local scoring/table concepts that may later deserve Encyclopaedia/reference treatment, including:

- Little/Big Three Dragons and Four Joys doubles;
- three-concealed Pung/Kong treatment;
- Heavenly/Earthly/first-wall-draw limit events;
- Goulash mode and blank-tile legality;
- cannon / `No choice!` liability;
- false Mahjong / false discard name / wrong tile claim / incorrect tile count incidents;
- fixed-special Flower/Season side scoring.

These are retained in the profile evidence but excluded from the conservative 279 catalogue/limit-item total unless they are already part of the 33 named hand inventory.

---

## 3. Mahjong Time European Classical — secondary implementation corpus

Working profile ID: `mahjong-time-european-classical`  
Evidence authority: Mahjong Time's published European Classical rules/scoring pages.  
Project status: **named secondary/implementation source, architecture validation only**.  
Authority: `MAHJONG_TIME_EUROPEAN_CLASSICAL_V1_VALIDATION.md`.

Mahjong Time is **not** treated as proof of a universal European Classical ruleset. It is useful because it is a concrete published implementation independently encountered after the Classical configuration model was designed.

### Twelve named limit hands

The published profile lists these as **500-point limit hands**:

1. All Green
2. Four Kongs
3. Hidden Treasure
4. Three Great Scholars
5. Big Four Winds
6. Little Four Winds
7. All Honours
8. All Terminals
9. Nine Gates
10. Thirteen Orphans
11. Heavenly Hand
12. Earthly Hand

These 12 are admitted to the 251A1 source inventory as **Mahjong-Time-local items** only.

Do not infer from the familiar English names that they are already identical to BMJA, T&M, OTB, Buzzard, MCR or Riichi concepts. The validation document itself explicitly requires structural comparison for items including All Green, Hidden Treasure, All Honours, All Terminals and Little Four Winds.

### Other profile-local concepts worth retaining

The same source gives potentially useful later reference concepts including:

- concealed hand +10 points;
- one-chance Chow +2;
- fully concealed winning-hand double;
- all-Chows/non-scoring-pair double;
- no-Chows double;
- all-terminals-and-honours double;
- one-suit + honours double;
- pure one-suit ×8;
- last-wall, final-discard, supplement-tile and rob-Kong win doubles;
- 500-point configured limit;
- pairwise loser settlement with East ×2;
- rotate-every-hand four-round progression.

They remain profile-local evidence. They are not added to the finite 279 count because 251A1 does not yet need to turn every ordinary scoring primitive into a candidate Encyclopaedia entry.

### Known source gap

Mahjong Time scoring page 2 was unavailable during the validation pass, so Flower/Season scoring values remain explicitly unknown. Do not fill them from BMJA/Buzzard merely because much of the ordinary arithmetic resembles the Classical family.

---

## 4. Next inventory frontier — known corpora not yet admitted to the 279 count

The repo already contains architecture/research evidence for additional rules families. They should **not** silently become part of the Encyclopaedia inventory until an item-level source boundary is clear.

| Candidate corpus | What the repo currently knows | Why it is not yet counted | Next safe 251A1 step |
| --- | --- | --- | --- |
| Named Hong Kong / Cantonese profile | Strong `hkma-rules` authority exists; architecture proves a fan-based grammar | No pinned item-level catalogue/profile extraction in the repo; “Hong Kong Mahjong” is not one universal ruleset | Select/pin the named authority/version and inventory its pattern/fan catalogue profile-locally |
| Taiwanese 16-tile | Architecture paper proves 5-sets+pair, tai scoring and variant pressure | Current material is an external architecture test, not an item-level named-profile catalogue | Pin a named authority/profile and extract its tai catalogue without generalising all Taiwanese play |
| Sanma | Architecture paper proves 3-player Riichi-family variation | Current `mt-sanma` is architecture-only; no formal target rules edition/profile selected for product truth | Select a named Sanma authority/profile before inventorying yaku/options as source truth |
| Zung Jung v1.03 | Architecture paper records **44 patterns**, additive values and distinctive interaction/cap rules | The 44 patterns have not been source-bound item-by-item in the repo; implementation authority is still `research-required-zung-jung-primary` | This is a strong next inventory candidate: pin the primary v1.03 source and index all 44 patterns |
| American / NMJL-style | Annual target-card grammar, Jokers and Charleston are established; NMJL is the authority | The annual card is sold/copyrighted and the repo intentionally does not contain the current target catalogue | Keep engine/catalogue architecture separate; inventory only lawfully available/licensed or user-provided catalogue content |
| Max Robertson | Comparative Western evidence and ordinary arithmetic are preserved | Evidence is secondary/edition-incomplete; no direct, pinned item-level special-hand catalogue | Obtain/index the intended edition before admitting Robertson-local catalogue items |
| Sichuan and other regional families | Landscape acknowledges them | No bounded item-level source corpus in repo yet | Research only when product/demand priority justifies it |

### Why architecture-only manifests are not inventory truth

`EIGHT_RULESET_PAPER_MANIFESTS.md` deliberately labels several profiles `architecture-only` or `research-required`. Those manifests prove the platform shape, not the exact rules catalogue.

For 251A1:

```text
architecture says a family can fit
            ≠
source inventory says these exact items exist
```

The distinction protects the future Encyclopaedia from presenting architecture assumptions as Mahjong facts.

---

## 5. Best next 251A1 research candidates

Without waiting for runtime implementation, the highest-value inventory work after this seven-corpus pass is likely:

1. **Zung Jung v1.03** — finite 44-pattern catalogue already identified at architecture level; source-pin and itemise it.
2. **Named Hong Kong/Cantonese authority** — high cross-family overlap potential, but first choose a specific authority/version rather than generic “Hong Kong”.
3. **Taiwanese 16-tile named profile** — structurally distinctive and useful for proving the Encyclopaedia can represent concepts beyond 14-tile families.
4. **Max Robertson** — useful Western historical/reference expansion once the intended edition is directly available.
5. **Sanma** — probably after the main EMA Riichi runtime exists, because many entries may be Riichi-family treatments rather than a wholly separate concept catalogue.
6. **American/NMJL** — architecture can proceed, but catalogue inventory remains licensing/access gated.

This priority list is a research convenience, not a product implementation order.

---

## 6. 251A1 state after this expansion

Completed now:

- [x] first five-profile source inventory;
- [x] Outside the Box admitted as the sixth, named club corpus;
- [x] Mahjong Time European Classical admitted as a seventh, explicitly secondary/provisional corpus;
- [x] conservative finite profile-local count updated from 234 to **279**;
- [x] architecture-only/source-incomplete families separated from item-level inventory truth;
- [x] next inventory frontier recorded with explicit evidence/licensing gates;
- [x] no cross-family equivalence asserted.

Still deliberately held:

- 251A2 universal relationship/crosswalk decisions for the runtime-target corpora;
- public concept IDs;
- public `/encyclopaedia/*` routes;
- SEO page generation;
- any claim that similarly named items are equivalent before structural/profile comparison.
