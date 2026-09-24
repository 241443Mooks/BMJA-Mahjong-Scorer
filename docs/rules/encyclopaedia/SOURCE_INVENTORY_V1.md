# Encyclopaedia 251A1 — profile-local source inventory v1

Status: **source inventory ready; cross-family concept matching deliberately not started**  
Parent: #251  
Date: 17 September 2026

## Purpose

Inventory the finite, source-backed scoring concepts already available for the first Mahjong Reference Encyclopaedia corpus without asserting cross-family equivalence before the runtime profiles exist.

The inventory is deliberately **profile-local**. A row in one source is not the same thing as a future neutral Encyclopaedia concept.

## Inventory contract

For later extraction/crosswalk work, every source-owned item should be able to supply these fields where the source/profile supports them:

| Field | Meaning |
| --- | --- |
| `profileId` / profile status | The exact rules profile or source programme that owns the treatment |
| `sourceItemId` | Stable project binding ID where one already exists; otherwise a source-local working ID |
| `localName` | The name used by that profile/source |
| `kind` | Special hand, fan, yaku, yakuman, named limit/event concept or other profile-local scoring concept |
| `valueTreatment` | Fixed score, fan/han value, limit/yakuman treatment, calculated treatment or profile-defined value |
| `qualification` | Concise structural/event/context requirements |
| `exposure` | Open/closed/exposure rule where material |
| `evidence` | Non-structural facts required to decide the item where material |
| `sourceId` | Pinned provenance/source identity |
| `sourceLocator` | Page/section/other stable locator |
| `implementationStatus` | Implemented, source-ready, provisional or blocked |
| `runtimeIdentity` | Filled only when an executable registry/catalogue identity exists |

251A1 records profile-local facts. **Relationship fields do not belong here.**

## Coverage summary

The first inventory contains **at least 234 finite profile-local catalogue/limit entries before any cross-family de-duplication**:

| Profile/source corpus | Finite inventory | Current status | Authoritative item-level source |
| --- | ---: | --- | --- |
| British / BMJA-style `bmja@1.0` | 18 special-hand bindings | Implemented/runtime | `artifacts/mahjong-scorer/src/scoring/special-hands.ts` plus `SPECIAL_HANDS_PROVENANCE.md` |
| Thompson & Maloney Companion / `western-tm@0.1` catalogue | 84 unique source hands / 85 bindings | Catalogue complete/source-certified; ordinary profile remains provisional | `TM_COMPANION_CATALOGUE_INDEX.md` |
| Buzzard 2000 | 10 named limit hands, plus named ordinary/event scoring concepts | Source-complete, implementation-ready | `BUZZARD_2000_RULE_EVIDENCE.md` |
| MCR 2006 | 81 fan | Source-complete, implementation-ready | `MCR_FAN_CATALOGUE_2006.md` |
| EMA Riichi 2025 | 29 yaku + 12 yakuman = 41 | Source-complete, implementation-ready | `riichi/EMA_2025_YAKU_CATALOGUE.md` |

`18 + 84 + 10 + 81 + 41 = 234` is a **profile-local item count**, not a claim that the future Encyclopaedia has 234 unique concepts. Many items may later prove equivalent, related, partially analogous or unrelated despite similar names.

The count also deliberately excludes ordinary arithmetic primitives and Buzzard's additional named bonuses/events from the finite total above, so it is a conservative starting corpus rather than a page-count target.

---

## 1. British / BMJA-style — implemented special-hand inventory

Profile: `bmja@1.0`  
Implementation authority: `artifacts/mahjong-scorer/src/scoring/special-hands.ts`

The current runtime exposes these 18 fixed special-hand bindings:

| Runtime pattern ID | Local name | Winning value |
| --- | --- | ---: |
| `knitting` | Knitting | 500 |
| `triple-knitting` | Triple Knitting | 500 |
| `all-pair-honours` | All pair honours | 500 |
| `imperial-jade` | Imperial Jade | 1,000 |
| `thirteen-unique-wonders` | Thirteen unique wonders | 1,000 |
| `gates-of-heaven` | The Gates of Heaven | 1,000 |
| `wriggling-snake` | The Wriggling Snake | 1,000 |
| `all-winds-and-dragons` | All Winds and Dragons | 1,000 |
| `heads-and-tails` | Heads and Tails | 1,000 |
| `fourfold-plenty` | Fourfold Plenty | 1,000 |
| `three-great-scholars` | Three great scholars | 1,000 |
| `four-blessings` | Four Blessings Hovering over the Door | 1,000 |
| `buried-treasure` | Buried treasure | 1,000 |
| `heavens-blessing` | Heaven's Blessing | 1,000 |
| `earths-blessing` | Earth's Blessing | 1,000 |
| `gathering-plum-blossom` | Gathering the Plum Blossom from the Roof | 1,000 |
| `plucking-moon` | Plucking the Moon from the Bottom of the Sea | 1,000 |
| `twofold-fortune` | Twofold Fortune | 1,000 |

Qualification descriptions and event detection remain owned by the runtime binding/detector and provenance material. Do not manufacture universal aliases from this table.

---

## 2. Thompson & Maloney Companion — complete source catalogue

Profile target: `western-tm@0.1`  
Pinned special-hand source: Patricia A. Thompson & Betty Maloney, *The Mah Jong Player's Companion* (1997).

`TM_COMPANION_CATALOGUE_INDEX.md` is already the complete item-level source inventory and remains the authority rather than being copied here.

Current certified state:

- **84 unique named source hands**;
- **85 profile bindings**;
- Big Robert is the sole intentional duplicate source name because two mutually exclusive structural/value forms are represented separately;
- source locators, value/fishing bands, exposure interpretation and historical discrepancy decisions are retained there;
- the special-hand catalogue is complete/source-certified;
- the **ordinary Thompson & Maloney rules profile remains provisional** pending #121 and must not inherit catalogue completeness as whole-profile verification.

251A2 must read the Companion items as **Western profile-local records**, even where the names resemble BMJA, Buzzard, MCR or Riichi items.

---

## 3. Buzzard 2000 — source-complete named scoring inventory

Working source/profile ID: `buzzard-2000-classical`  
Authority: Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, source snapshot dated 30 March 2000.  
Source ledger: `BUZZARD_2000_RULE_EVIDENCE.md`

### Ten source-named limit hands

Buzzard states that the following ten hands/events score the agreed table limit:

1. All Winds and Dragons.
2. Pungs/Kongs of three Winds + pair of the fourth + any final set.
3. Original Hand.
4. Winning with East Wind's first discard.
5. All Ones and Nines.
6. Pungs/Kongs of at least three Dragons.
7. Concealed Pungs/Kongs.
8. Thirteen Odd Majors.
9. Calling Nine Tile Hand.
10. East Wind's thirteenth consecutive Mahjong.

These are **Buzzard-local source items** for 251A1. Do not pre-map them to BMJA/MCR/Riichi concepts.

### Other named scoring concepts worth retaining for later Encyclopaedia decisions

The same source also gives profile-local named/event concepts including:

- Standing Hand (+100 when the source-defined condition is satisfied);
- Only Possible Tile (+2);
- No Chows (+10, and a separate all-Pungs/no-Chows double may also apply);
- Scoreless Hand (+10);
- Last Wall win (+10 plus the source's last-wall double);
- Loose Tile win (+10 plus the source's Loose-Tile double);
- Snatching a Kong / rob-Kong double;
- All Chows + non-scoring pair double;
- four Flowers / four Seasons ×8;
- Original Hand and All Winds and Dragons also appear as ordinary double/limit interactions.

These are not added to the conservative 234 finite-item total because the future Encyclopaedia still needs to decide which ordinary scoring concepts justify standalone public entries.

---

## 4. MCR 2006 — complete 81-fan inventory

Profile target: `mcr-wmo-2006@0.x`  
Authority/source ID: WMO 2006 Green Book / `mcr-ema`.  
Item authority: `MCR_FAN_CATALOGUE_2006.md`.

The MCR catalogue already records all **81 fan** with:

- stable binding ID `mcr2006.fan.*`;
- source fan name;
- point value;
- detector synopsis;
- evidence class;
- formal rulebook locator.

This is exactly the profile-local source shape 251A1 needs. Do not copy the 81 rows into a second Encyclopaedia-owned score table.

Important 251A2 warning: similarity to a British special hand or Riichi yaku does not establish equivalence. MCR interactions/non-combinations and qualification rules remain profile-owned even where the visible tile pattern looks familiar.

---

## 5. EMA Riichi 2025 — complete yaku/yakuman inventory

Profile target: `riichi-ema-2025@0.x`  
Authority/source ID: `ema-riichi-2025`.  
Item authority: `riichi/EMA_2025_YAKU_CATALOGUE.md`.

The source-bound catalogue contains:

- **29 yaku** across 1/2/3/5/6-han bands;
- **12 yakuman**;
- total **41 profile-local catalogue items**.

Each row already records the stable project ID, local/English/Japanese name where applicable, closed/open han treatment or yakuman status, evidence/detector class and source-owned notes.

Dora, kan-dora and ura-dora are deliberately **not yaku** and should remain separate Riichi scoring modules. They may later merit explanatory Encyclopaedia/reference treatment, but they are not part of the 41-item yaku/yakuman count.

Important 251A2 warning: EMA 2025 non-stacking rules, open reductions, furiten/yaku legality and the profile's non-cumulative yakuman policy remain Riichi-owned semantics even when structural predicates are reusable.

---

## 6. What 251A2 will consume later

After Buzzard, MCR and Riichi are executable, 251A2 should extract/compare the profile-local records above and add **relationship analysis**, not rewrite their facts.

For every candidate relationship, compare at minimum:

1. tile/shape predicate;
2. irregular vs ordinary decomposition requirements;
3. open/concealed/exposure requirements;
4. winning method/event requirements;
5. seat/round/table context requirements;
6. value/limit semantics;
7. combination/suppression/exclusion behaviour;
8. profile/source provenance;
9. executable runtime/catalogue identity.

Only then classify the relationship as exact identity, sourced alias, genuine equivalent, partial analogue, related, or unrelated.

## 7. High-value pilot candidates — **not yet crosswalked**

The following are good later stress cases because multiple source inventories contain superficially related material:

- Thirteen Unique Wonders / Thirteen Odd Majors / Thirteen Orphans / Kokushi Musou;
- Gates of Heaven / Nine Gates / Chuuren Poutou;
- Three Great Scholars / Big Three Dragons / Daisangen;
- Four Blessings / Big Four Winds / Daisuushii;
- Fourfold Plenty / Four Kongs / Suukantsu;
- Seven Pairs / Chiitoitsu;
- one-suit / Full Flush families;
- All Winds and Dragons / honours-only families;
- Wriggling Snake / Wriggly Snake as a British/Western spelling/name case;
- at least one MCR-only fan and one Riichi-only yaku with no forced cross-family partner.

This list is a **test queue only**. It deliberately makes no relationship claim.

## 8. 251A1 completion gate

251A1 is complete when:

- [x] the initial five-profile source corpus is identified;
- [x] the finite catalogue counts/statuses are recorded;
- [x] every corpus has an authoritative item-level source location;
- [x] BMJA's current runtime special-hand bindings are explicitly enumerated;
- [x] Buzzard's ten limit hands and additional named scoring concepts are retained;
- [x] MCR and Riichi complete source catalogues are linked rather than duplicated;
- [x] T&M catalogue completeness is kept separate from ordinary-profile verification;
- [x] no cross-family equivalence has been asserted;
- [x] the later relationship audit criteria are explicit.

Public Encyclopaedia architecture/pages remain held until 251A2 can work from the implemented runtime profiles.
