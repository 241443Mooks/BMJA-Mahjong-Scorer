# MCR 2006 executable detector predicates

Status: **source-complete implementation contract for #299**\
Issue: #303\
Parent: #259\
Profile target: `mcr-wmo-2006@0.x`\
Catalogue identity: `catalogue.pattern.mcr-wmo-2006`\
Evidence policy: `evidence-policy.mcr-wmo-2006`

Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 (“Green Book”), English edition. The English book states that disputes caused by translation/different understanding are settled against the original Chinese edition. This contract therefore preserves an escalation rule: an unresolved English ambiguity is not guessed in code.

## Purpose

This file closes the gap exposed by the first #299 preflight. `MCR_FAN_CATALOGUE_2006.md` remains the concise 81-fan index; this file is the implementation-facing predicate and positive-fixture contract.

The goal is that #299 can implement every binding without rereading the rulebook or inferring Mahjong semantics from another rules family.

This document does **not** complete the five §3.9.1 counting principles. Candidate detection may emit overlapping or repeated structural occurrences; #300 owns lawful combination, suppression and highest-scoring interpretation unless a condition below is explicitly part of the fan predicate itself.

## Source anchors

- §3.7.2: ordinary four-sets-plus-pair structure and the permitted irregular structures.
- §3.8.1: formal list of all 81 fan and point values (PDF pp.14–18).
- Appendix 1: fan definitions, named inclusions/exclusions and worked examples (PDF pp.24–41).
- §3.9.1: five counting principles, deferred to #300.
- §3.11.6.6: the 8-point minimum excludes Flower points.

## Runtime assumptions after #302

`McrHandEvidence` supplies:

```text
fixedGroups
freeTiles
winningTile
flowerCount
```

with trusted table context separate.

- `fixedGroups` contains only physically authoritative declarations: melded Chow/Pung/Kong and declared concealed Kong.
- ordinary concealed tiles remain an ungrouped `freeTiles` multiset.
- detector/decomposition code must enumerate lawful interpretations rather than trust UI grouping.
- `winningTile` is one tile within `freeTiles`; removing one occurrence reconstructs the pre-win free multiset.
- Flowers are count-only evidence and are not normal hand tiles.

## Fixture notation

The recipes below are detector fixtures, not final scoring totals. A positive fixture only needs to prove that the target binding/stage behaviour is present; other lawful fan may also be candidates unless the row says otherwise.

```text
C/B/D     Characters / Bamboo / Dots
E/S/W/N   Wind tiles
R/G/Wh    Red / Green / White Dragon
C123      a Chow
C555      a Pung
pair C55  a pair
M(C123)   physically fixed melded Chow
M(EEE)    physically fixed melded Wind Pung
KM(C5)    physically fixed melded Kong of C5
KC(C5)    physically fixed concealed Kong of C5
free ...  ungrouped concealed/free tiles
```

When a recipe is written as ordinary decomposition elements without `M/KM/KC`, a test helper may encode those tiles in `freeTiles` and prove the detector through the enumerated interpretation.

## Candidate occurrence identity

Stable `mcr2006.fan.*` ID is a **binding identity**, not a unique scoring occurrence.

Candidate occurrence IDs must be deterministic and must include enough structural identity to distinguish repeated matches, conceptually:

```text
<binding-id>#<interpretation-id>#<matched-element-ids-or-face/event-key>
```

Examples:

- Double Pung: unordered pair of Pung/Kong element IDs.
- Pure Double Chow: unordered pair of Chow element IDs.
- Tile Hog: canonical tile face.
- Dragon Pung / Kong fan: exact matched group ID.
- Wait fan: interpretation + winning-tile role, after the global sole-winning-face gate.
- event fan: resolved event key.

# 81 binding contracts

| # | Stable binding | Fan | Pts | Stage | Executable predicate | Evidence | Occurrence | Minimum positive fixture | Detector-boundary note / source locator |
|---:|---|---|---:|---|---|---|---|---|---|
| 1 | `mcr2006.fan.big-four-winds` | Big Four Winds | 88 | `candidate/hand` | An ordinary decomposition contains four Pung/Kong elements, one for each Wind E/S/W/N. | `H` | single per interpretation | `EEE SSS WWW NNN + pair RR` | Interaction exclusions (Big Three Winds, All Pungs, wind fan, terminal/honor pung) belong to #300. §3.8.1 #1; App.1 #1. |
| 2 | `mcr2006.fan.big-three-dragons` | Big Three Dragons | 88 | `candidate/hand` | An ordinary decomposition contains Pung/Kong elements of Red, Green and White Dragon. | `H` | single per interpretation | `RRR GGG WhWhWh + C123 + pair C55` | Lower Dragon fan are interaction-stage suppressions. §3.8.1 #2; App.1 #2. |
| 3 | `mcr2006.fan.all-green` | All Green | 88 | `candidate/hand` | Every non-Flower tile is one of B2/B3/B4/B6/B8/Green Dragon. | `H` | single per hand | `B234 B222 B666 B888 + pair GG` | Exact allowed tile set is part of the predicate. §3.8.1 #3; App.1 #3. |
| 4 | `mcr2006.fan.nine-gates` | Nine Gates | 88 | `candidate/hand+wait` | No melded groups; before the winning tile the free concealed multiset is exactly 1112345678999 in one numbered suit; winning tile is rank 1–9 of that same suit. | `H,X,W` | single per hand | `pre-win C1112345678999; win C5` | Use reconstructed pre-win state, not final-shape pattern matching alone. §3.8.1 #4; App.1 #4. |
| 5 | `mcr2006.fan.four-kongs` | Four Kongs | 88 | `candidate/hand` | Final hand contains four declared Kongs, concealed or melded. | `H,X` | single per hand | `KM(C1) KC(D2) KM(B3) KC(E) + pair C55` | Concealment is separate evidence; lower Kong fan are #300. §3.8.1 #5; App.1 #5. |
| 6 | `mcr2006.fan.seven-shifted-pairs` | Seven Shifted Pairs | 88 | `candidate/irregular` | Seven pairs in one numbered suit whose pair ranks are seven consecutive ranks. | `H` | single per hand | `C11 C22 C33 C44 C55 C66 C77` | All fourteen tiles are free/concealed; no ordinary decomposition is required. §3.8.1 #6; App.1 #6. |
| 7 | `mcr2006.fan.thirteen-orphans` | Thirteen Orphans | 88 | `candidate/irregular` | Final free tiles contain all 13 terminal/honor tile kinds exactly once plus one duplicate of any one of those kinds. | `H` | single per hand | `C1 C9 B1 B9 D1 D9 E S W N R G Wh + C1` | Exact 13-type set is fixed. §3.8.1 #7; App.1 #7. |
| 8 | `mcr2006.fan.all-terminals` | All Terminals | 64 | `candidate/hand` | Every tile is a suited rank 1 or 9; ordinary decomposition therefore consists only of terminal Pung/Kong elements and a terminal pair. | `H` | single per hand | `C111 C999 B111 B999 + pair D11` | No Honors is implied but interaction is #300. §3.8.1 #8; App.1 #8. |
| 9 | `mcr2006.fan.little-four-winds` | Little Four Winds | 64 | `candidate/hand` | Ordinary decomposition contains Pung/Kong elements of three Wind kinds and a pair of the fourth Wind. | `H` | single per interpretation | `EEE SSS WWW + C123 + pair NN` | Seat/Prevalent wind candidates are separate and resolved by #300. §3.8.1 #9; App.1 #9. |
| 10 | `mcr2006.fan.little-three-dragons` | Little Three Dragons | 64 | `candidate/hand` | Ordinary decomposition contains Pung/Kong elements of two Dragon kinds and a pair of the third Dragon kind. | `H` | single per interpretation | `RRR GGG + C123 B456 + pair WhWh` | Dragon-Pung/Two-Dragon interactions are #300. §3.8.1 #10; App.1 #10. |
| 11 | `mcr2006.fan.all-honors` | All Honors | 64 | `candidate/hand` | Every non-Flower tile is a Wind or Dragon. | `H` | single per hand | `EEE SSS WWW RRR + pair GG` | Ordinary Pung/pair shape is implied by tile composition. §3.8.1 #11; App.1 #11. |
| 12 | `mcr2006.fan.four-concealed-pungs` | Four Concealed Pungs | 64 | `candidate/hand` | An ordinary decomposition contains four Pung/Kong elements achieved without melding; fixed concealed Kongs count, melded fixed groups do not. | `H,X` | single per interpretation | `free C222 D333 B444 EEE + pair C55` | Winning method is not itself part of this detector; Fully Concealed is separate. §3.8.1 #12; App.1 #12. |
| 13 | `mcr2006.fan.pure-terminal-chows` | Pure Terminal Chows | 64 | `candidate/hand` | One-suit decomposition is exactly two 123 Chows, two 789 Chows and a pair of 5s in that suit. | `H` | single per interpretation | `C123 C123 C789 C789 + pair C55` | Named lower fan suppression is #300. §3.8.1 #13; App.1 #13. |
| 14 | `mcr2006.fan.quadruple-chow` | Quadruple Chow | 48 | `candidate/hand` | Four Chow elements have identical suit and start rank. | `H,I` | single per interpretation | `C123 C123 C123 C123 + pair D55` | Source-specific exclusions and Non-Repeat remain #300. §3.8.1 #14; App.1 #14. |
| 15 | `mcr2006.fan.four-pure-shifted-pungs` | Four Pure Shifted Pungs | 48 | `candidate/hand` | Four Pung/Kong elements are in one suit and their ranks are four consecutive values. | `H,I` | single per interpretation | `C111 C222 C333 C444 + pair D55` | All-Pungs and lower pattern suppression are #300. §3.8.1 #15; App.1 #15. |
| 16 | `mcr2006.fan.four-pure-shifted-chows` | Four Pure Shifted Chows | 32 | `candidate/hand` | Four same-suit Chows have start ranks forming either x,x+1,x+2,x+3 or x,x+2,x+4,x+6; mixing step sizes is invalid. | `H,I` | single per interpretation | `C123 C234 C345 C456 + pair D55` | Step consistency is detector-owned. §3.8.1 #16; App.1 #16. |
| 17 | `mcr2006.fan.three-kongs` | Three Kongs | 32 | `candidate/hand` | Final hand contains at least three declared Kongs. | `H,X,I` | single per interpretation | `KM(C1) KC(D2) KM(B3) + B456 + pair C55` | Do not score per 3-Kong subset; Four Kongs/lower Kong interactions are #300. §3.8.1 #17; App.1 #17. |
| 18 | `mcr2006.fan.all-terminals-and-honors` | All Terminals and Honors | 32 | `candidate/hand` | Every tile is either a suited 1/9 or an Honor, and both categories are permitted. | `H` | single per hand | `C111 C999 EEE RRR + pair B99` | All-Pungs and per-Pung fan suppression are #300. §3.8.1 #18; App.1 #18. |
| 19 | `mcr2006.fan.seven-pairs` | Seven Pairs | 24 | `candidate/irregular` | Final free tiles can be partitioned into exactly seven identical pairs. | `H` | single per hand | `C11 C22 D33 D44 B55 B66 EE` | A four-of-a-kind can structurally supply two pair elements because each element is a pair; Tile Hog may be a separate candidate subject to #300. §3.8.1 #19; App.1 #19. |
| 20 | `mcr2006.fan.greater-honors-knitted` | Greater Honors and Knitted Tiles | 24 | `candidate/irregular` | Fourteen single tiles: all seven distinct Honors plus seven distinct suited tiles drawn from one knitted assignment that maps 147, 258 and 369 to the three suits one-to-one. | `H` | single per knitted assignment | `E S W N R G Wh + C1 C4 C7 B2 B5 D3 D6` | All tiles are singles; no duplicates. Greater is distinguished from Lesser by containing all seven Honors. §3.8.1 #20; App.1 #20. |
| 21 | `mcr2006.fan.all-even-pungs` | All Even Pungs | 24 | `candidate/hand` | Every element is a Pung/Kong or pair of suited even ranks 2/4/6/8; no Chows or Honors. | `H` | single per interpretation | `C222 D444 B666 C888 + pair D22` | All-Pungs/All-Simples are implied interactions. §3.8.1 #21; App.1 #21. |
| 22 | `mcr2006.fan.full-flush` | Full Flush | 24 | `candidate/hand` | Every non-Flower tile belongs to one numbered suit; no Honors. | `H` | single per hand | `C123 C456 C789 C777 + pair C55` | No-Honors interaction is #300. §3.8.1 #22; App.1 #22. |
| 23 | `mcr2006.fan.pure-triple-chow` | Pure Triple Chow | 24 | `candidate/hand` | Three Chow elements have identical suit and start rank. | `H,I` | per unordered 3-Chow subset | `C123 C123 C123 + B456 + pair D55` | Candidate occurrence key includes the three element IDs. §3.8.1 #23; App.1 #23. |
| 24 | `mcr2006.fan.pure-shifted-pungs` | Pure Shifted Pungs | 24 | `candidate/hand` | Three Pung/Kong elements are in one suit with consecutive ranks x,x+1,x+2. | `H,I` | per unordered 3-element subset | `C111 C222 C333 + B456 + pair D55` | Candidate occurrence key includes the three element IDs. §3.8.1 #24; App.1 #24. |
| 25 | `mcr2006.fan.upper-tiles` | Upper Tiles | 24 | `candidate/hand` | Every non-Flower tile is a suited rank 7, 8 or 9; no Honors. | `H` | single per hand | `C789 D789 B777 C888 + pair D99` | No-Honors interaction is #300. §3.8.1 #25; App.1 #25. |
| 26 | `mcr2006.fan.middle-tiles` | Middle Tiles | 24 | `candidate/hand` | Every non-Flower tile is a suited rank 4, 5 or 6; no Honors. | `H` | single per hand | `C456 D456 B444 C555 + pair D66` | All-Simples/No-Honors interaction is #300. §3.8.1 #26; App.1 #26. |
| 27 | `mcr2006.fan.lower-tiles` | Lower Tiles | 24 | `candidate/hand` | Every non-Flower tile is a suited rank 1, 2 or 3; no Honors. | `H` | single per hand | `C123 D123 B111 C222 + pair D33` | No-Honors interaction is #300. §3.8.1 #27; App.1 #27. |
| 28 | `mcr2006.fan.pure-straight` | Pure Straight | 16 | `candidate/hand` | Three Chow elements in one suit are 123, 456 and 789. | `H,I` | per exact 3-Chow subset | `C123 C456 C789 + B222 + pair D55` | Occurrence key is the three Chow element IDs. §3.8.1 #28; App.1 #28. |
| 29 | `mcr2006.fan.three-suited-terminal-chows` | Three-Suited Terminal Chows | 16 | `candidate/hand` | Two suits each contribute both 123 and 789 Chows; the pair is 55 in the third suit. | `H,I` | single per interpretation | `C123 C789 D123 D789 + pair B55` | All three suits and exact pair suit are detector-owned. §3.8.1 #29; App.1 #29. |
| 30 | `mcr2006.fan.pure-shifted-chows` | Pure Shifted Chows | 16 | `candidate/hand` | Three same-suit Chows have start ranks x,x+1,x+2 or x,x+2,x+4; mixed step sizes are invalid. | `H,I` | per exact 3-Chow subset | `C123 C234 C345 + B777 + pair D55` | Occurrence key is the three Chow element IDs. §3.8.1 #30; App.1 #30. |
| 31 | `mcr2006.fan.all-fives` | All Fives | 16 | `candidate/hand` | Every one of the four sets and the pair contains at least one suited rank-5 tile. | `H` | single per interpretation | `C345 D456 B567 C555 + pair D55` | Because Honors cannot contain 5, no Honor element can appear. §3.8.1 #31; App.1 #31. |
| 32 | `mcr2006.fan.triple-pung` | Triple Pung | 16 | `candidate/hand` | Three Pung/Kong elements share the same rank, one in each numbered suit. | `H` | per rank/triple | `C555 D555 B555 + C123 + pair D77` | Occurrence key includes rank and three element IDs. §3.8.1 #32; App.1 #32. |
| 33 | `mcr2006.fan.three-concealed-pungs` | Three Concealed Pungs | 16 | `candidate/hand` | An ordinary decomposition contains at least three concealed Pung/Kong elements; melded fixed groups do not count. | `H,X` | single per interpretation | `free C222 D333 B444 + M(C678) + pair D55` | Four Concealed Pungs interaction is #300. §3.8.1 #33; App.1 #33. |
| 34 | `mcr2006.fan.lesser-honors-knitted` | Lesser Honors and Knitted Tiles | 12 | `candidate/irregular` | Fourteen distinct single tiles fitting one knitted 147/258/369 suit assignment plus Honors, but not all seven Honors. With only nine knitted suited tile kinds available, a 14-tile hand therefore contains exactly five or six distinct Honors and respectively nine or eight distinct knitted suited tiles. | `H` | single per knitted assignment | `E S W R G + C1 C4 C7 B2 B5 B8 D3 D6 D9` | Source arithmetic makes the 5/6-Honor boundary explicit; all seven Honors is fan 20. §3.8.1 #34; App.1 #34. |
| 35 | `mcr2006.fan.knitted-straight` | Knitted Straight | 12 | `candidate/hand-or-irregular` | Hand contains the complete nine-tile knitted set from one one-to-one assignment of 147, 258 and 369 to Characters/Bamboo/Dots. | `H` | per knitted assignment | `C1 C4 C7 B2 B5 B8 D3 D6 D9 + EEE + pair RR` | The remaining five tiles may form the rest of a lawful hand; detection does not force ordinary Chow grouping. §3.8.1 #35; App.1 #35. |
| 36 | `mcr2006.fan.upper-four` | Upper Four | 12 | `candidate/hand` | Every non-Flower tile is a suited rank 6–9; no Honors. | `H` | single per hand | `C678 D789 B666 C999 + pair D88` | No-Honors interaction is #300. §3.8.1 #36; App.1 #36. |
| 37 | `mcr2006.fan.lower-four` | Lower Four | 12 | `candidate/hand` | Every non-Flower tile is a suited rank 1–4; no Honors. | `H` | single per hand | `C123 D234 B111 C444 + pair D22` | No-Honors interaction is #300. §3.8.1 #37; App.1 #37. |
| 38 | `mcr2006.fan.big-three-winds` | Big Three Winds | 12 | `candidate/hand` | Ordinary decomposition contains Pung/Kong elements of any three distinct Wind kinds. | `H` | single per interpretation | `EEE SSS WWW + C123 + pair D55` | Big/Little Four Wind and wind-value interactions are #300. §3.8.1 #38; App.1 #38. |
| 39 | `mcr2006.fan.mixed-straight` | Mixed Straight | 8 | `candidate/hand` | Three Chow elements are 123, 456 and 789, with each Chow in a different numbered suit. | `H,I` | per exact 3-Chow subset | `C123 D456 B789 + C777 + pair D55` | Occurrence key contains the three Chow element IDs. §3.8.1 #39; App.1 #39. |
| 40 | `mcr2006.fan.reversible-tiles` | Reversible Tiles | 8 | `candidate/hand` | Every non-Flower tile is in the exact Green-Book reversible set: Dots 1,2,3,4,5,8,9; Bamboo 2,4,5,6,8,9; White Dragon. | `H` | single per hand | `D123 D345 B456 B888 + pair WhWh` | Characters, Winds, Red/Green Dragons, D6/D7, B1/B3/B7 are not reversible. §3.8.1 #40; App.1 #40. |
| 41 | `mcr2006.fan.mixed-triple-chow` | Mixed Triple Chow | 8 | `candidate/hand` | Three Chow elements have the same start rank, one in each numbered suit. | `H,I` | per exact 3-Chow subset | `C123 D123 B123 + C777 + pair D55` | Occurrence key contains the three Chow element IDs. §3.8.1 #41; App.1 #41. |
| 42 | `mcr2006.fan.mixed-shifted-pungs` | Mixed Shifted Pungs | 8 | `candidate/hand` | Three Pung/Kong elements, one in each suit, have ranks that form a consecutive three-rank sequence when ordered by rank. | `H,I` | per exact 3-element subset | `C111 D222 B333 + C456 + pair D55` | Any permutation of suit-to-rank assignment is lawful; occurrence key stores exact elements. §3.8.1 #42; App.1 #42. |
| 43 | `mcr2006.fan.chicken-hand` | Chicken Hand | 8 | `fallback/#300` | A legal Hu receives Chicken Hand only after ordinary non-Flower fan resolution yields zero counted points. | `H,I` | single fallback per scored interpretation | `M(C123) + C678 D345 B789 + pair EE; discard win, neutral winds/events, two-sided wait` | Do not emit as an ordinary shape candidate in #299; preserve binding and facts for #300 fallback. §3.8.1 #43; App.1 #43. |
| 44 | `mcr2006.fan.last-tile-draw` | Last Tile Draw | 8 | `candidate/context` | Resolved win event is last-wall-draw and win source is self-draw. | `E,M` | single per hand/event | `Any valid hand; winSource=self-draw; resolvedWinEvent=last-wall-draw` | Self-Drawn suppression is #300. §3.8.1 #44; App.1 #44. |
| 45 | `mcr2006.fan.last-tile-claim` | Last Tile Claim | 8 | `candidate/context` | Resolved win event is last-discard and win source is discard. | `E,M` | single per hand/event | `Any valid hand; winSource=discard; resolvedWinEvent=last-discard` | Do not infer from wall history. §3.8.1 #45; App.1 #45. |
| 46 | `mcr2006.fan.out-with-replacement-tile` | Out with Replacement Tile | 8 | `candidate/context` | Resolved win event is kong-replacement and win source is self-draw. Flower-replacement is explicitly excluded. | `E,M` | single per hand/event | `Any valid hand; winSource=self-draw; resolvedWinEvent=kong-replacement` | The English table contains a stray last-discard sentence, but the same entry explicitly defines Kong replacement and excludes Flower replacement; the repo evidence contract adopts that specific event meaning. §3.8.1 #46; App.1 #46. |
| 47 | `mcr2006.fan.robbing-the-kong` | Robbing The Kong | 8 | `candidate/context` | Resolved win event is rob-kong and win source is discard. | `E,M` | single per hand/event | `Any valid hand; winSource=discard; resolvedWinEvent=rob-kong` | Last Tile suppression is #300. §3.8.1 #47; App.1 #47. |
| 48 | `mcr2006.fan.two-concealed-kongs` | Two Concealed Kongs | 8 | `candidate/hand` | At least two fixed declared Kongs have exposure=concealed. | `H,X,I` | per unordered pair of concealed-Kong group IDs | `KC(C1) KC(D2) + B345 EEE + pair C55` | Higher/lower Kong interactions are #300. §3.8.1 #48; App.1 #48. |
| 49 | `mcr2006.fan.all-pungs` | All Pungs | 6 | `candidate/hand` | Ordinary decomposition has four Pung/Kong elements and one pair; no Chows. | `H` | single per interpretation | `C111 D222 B333 EEE + pair C55` | Higher composition fan may imply/suppress it in #300. §3.8.1 #49; App.1 #49. |
| 50 | `mcr2006.fan.half-flush` | Half Flush | 6 | `candidate/hand` | All numbered tiles belong to exactly one suit and at least one Honor tile is present. | `H` | single per hand | `C123 C456 C789 EEE + pair C55` | Full Flush is distinct because it has no Honors. §3.8.1 #50; App.1 #50. |
| 51 | `mcr2006.fan.mixed-shifted-chows` | Mixed Shifted Chows | 6 | `candidate/hand` | Three Chows, one per suit, have consecutive start ranks x,x+1,x+2. | `H,I` | per exact 3-Chow subset | `C123 D234 B345 + C777 + pair D55` | Occurrence key contains exact Chow elements. §3.8.1 #51; App.1 #51. |
| 52 | `mcr2006.fan.all-types` | All Types | 6 | `candidate/hand` | Across the five ordinary elements (four sets plus pair), all five tile categories are represented: Characters, Bamboo, Dots, Winds, Dragons. | `H` | single per interpretation | `C123 B456 D789 EEE + pair RR` | Each ordinary element is category-homogeneous, so this is equivalent to one represented element of each category. §3.8.1 #52; App.1 #52. |
| 53 | `mcr2006.fan.melded-hand` | Melded Hand | 6 | `candidate/hand+wait` | All four sets are fixed melded groups; the only concealed/free pre-win tile is one tile of the eventual pair; win source is discard and the winning tile is the same face, with that face the sole legal winning tile. | `H,X,M,W` | single per interpretation | `M(C123) M(D456) M(B789) M(EEE); free pre-win [R]; win R by discard` | Pair completion and sole-wait requirement are detector-owned; Single Wait non-combination is #300. §3.8.1 #53; App.1 #53. |
| 54 | `mcr2006.fan.two-dragon-pungs` | Two Dragon Pungs | 6 | `candidate/hand` | Ordinary decomposition contains Pung/Kong elements of two distinct Dragon kinds. | `H,I` | per unordered pair of Dragon element IDs | `RRR GGG + C123 B456 + pair D55` | Big/Little Three Dragons and Dragon-Pung suppression are #300. §3.8.1 #54; App.1 #54. |
| 55 | `mcr2006.fan.outside-hand` | Outside Hand | 4 | `candidate/hand` | Every ordinary element contains a terminal or Honor: Chows must be 123 or 789; Pung/Kong/pair must be terminal or Honor. | `H` | single per interpretation | `C123 D789 EEE B999 + pair RR` | Detector checks every element, including pair. §3.8.1 #55; App.1 #55. |
| 56 | `mcr2006.fan.fully-concealed-hand` | Fully Concealed Hand | 4 | `candidate/hand+context` | No melded fixed group is present (declared concealed Kongs are allowed) and win source is self-draw. | `H,X,M` | single per hand | `all free: C123 D456 B789 C777 + pair D55; self-draw` | Concealed Kong does not break concealment under §3.6.8. §3.8.1 #56; App.1 #56. |
| 57 | `mcr2006.fan.two-melded-kongs` | Two Melded Kongs | 4 | `candidate/hand` | For each pair of declared Kongs: two melded Kongs qualify directly for the 4-point binding. A mixed pair (one melded, one concealed) also uses this 4-point pair-base, while the concealed Kong separately emits fan 67 for +2, reproducing the source-stated mixed total of 6. Two concealed Kongs use fan 48 instead. | `H,X,I` | per unordered Kong pair that contains at least one melded Kong | `KM(C1) KM(D2) + B345 EEE + pair C55; separately test KM(C1)+KC(D2) => fan57 candidate plus fan67 candidate` | This source-specific mixed-Kong bridge avoids inventing an 82nd fan and is required by App.1 #57's explicit 6-point mixed case. §3.8.1 #57; App.1 #57. |
| 58 | `mcr2006.fan.last-tile` | Last Tile | 4 | `candidate/external-evidence` | `lastVisibleCopy` is explicitly true for the recorded winning tile. | `V,W` | single per hand | `Any valid hand; winningTile=C5; lastVisibleCopy=true` | Unknown must surface evidence rather than assume true; Robbing-the-Kong suppression is #300. §3.8.1 #58; App.1 #58. |
| 59 | `mcr2006.fan.dragon-pung` | Dragon Pung | 2 | `candidate/hand` | Each Dragon Pung/Kong element independently qualifies. | `H,I` | per Dragon element ID | `RRR + C123 D456 B789 + pair C55` | Multiple Dragon occurrences stay distinct; higher Dragon fan suppression is #300. §3.8.1 #59; App.1 #59. |
| 60 | `mcr2006.fan.prevalent-wind` | Prevalent Wind | 2 | `candidate/hand+context` | Ordinary decomposition contains a Pung/Kong of the trusted prevailing Wind. | `H,C` | per matching Wind element ID | `EEE + C123 D456 B789 + pair C55; prevailingWind=east` | Missing prevailing Wind is material evidence when such a Wind set exists. §3.8.1 #60; App.1 #60. |
| 61 | `mcr2006.fan.seat-wind` | Seat Wind | 2 | `candidate/hand+context` | Ordinary decomposition contains a Pung/Kong of the player's trusted Seat Wind. | `H,C` | per matching Wind element ID | `SSS + C123 D456 B789 + pair C55; seatWind=south` | Seat and prevailing fan may both be candidates when winds coincide; #300 resolves only source-owned interactions. §3.8.1 #61; App.1 #61. |
| 62 | `mcr2006.fan.concealed-hand` | Concealed Hand | 2 | `candidate/hand+context` | No melded fixed group is present (declared concealed Kongs allowed) and win source is discard. | `H,X,M` | single per hand | `all free: C123 D456 B789 C777 + pair D55; discard win` | Higher concealed fan are #300. §3.8.1 #62; App.1 #62. |
| 63 | `mcr2006.fan.all-chows` | All Chows | 2 | `candidate/hand` | Ordinary decomposition has four Chow elements and a suited (non-Honor) pair. | `H,I` | single per interpretation | `C123 D456 B789 C456 + pair D22` | No Honors is implied and handled by #300. §3.8.1 #63; App.1 #63. |
| 64 | `mcr2006.fan.tile-hog` | Tile Hog | 2 | `candidate/hand` | For a suited tile face, all four physical copies appear in the final hand but those four are not a declared/decomposed Kong. | `H` | per suited tile face | `C345 + C555 + D123 B789 + pair D22` | Occurrence key is canonical tile face; multiple different Tile Hogs may coexist. §3.8.1 #64; App.1 #64. |
| 65 | `mcr2006.fan.double-pung` | Double Pung | 2 | `candidate/hand` | Two Pung/Kong elements have the same rank in two different numbered suits. | `H,I` | per unordered qualifying element pair | `C555 D555 + B123 C789 + pair B22` | Multiple independent pair occurrences are allowed as candidates; source examples explicitly show Double Pung twice. §3.8.1 #65; App.1 #65. |
| 66 | `mcr2006.fan.two-concealed-pungs` | Two Concealed Pungs | 2 | `candidate/hand` | Two Pung/Kong elements in an interpretation are concealed (not melded fixed groups). | `H,X,I` | per unordered qualifying concealed-element pair | `free C555 D666 B123 C789 + pair B22` | Three/Four Concealed Pungs and repeated-pair counting are #300. §3.8.1 #66; App.1 #66. |
| 67 | `mcr2006.fan.concealed-kong` | Concealed Kong | 2 | `candidate/hand` | Each fixed declared Kong with exposure=concealed independently qualifies. | `H,X,I` | per concealed-Kong group ID | `KC(C5) + D123 B456 C789 + pair D22` | Two Concealed Kongs interaction is #300. §3.8.1 #67; App.1 #67. |
| 68 | `mcr2006.fan.all-simples` | All Simples | 2 | `candidate/hand` | No tile is a suited 1/9 and no tile is an Honor. | `H` | single per hand | `C234 D345 B456 C666 + pair D55` | All tiles must be suited ranks 2–8. §3.8.1 #68; App.1 #68. |
| 69 | `mcr2006.fan.pure-double-chow` | Pure Double Chow | 1 | `candidate/hand` | Two Chow elements are identical in suit and start rank. | `H,I` | per unordered qualifying Chow pair | `C123 C123 + D456 B789 + pair D22` | Multiple distinct occurrences remain separate candidates; counting constraints are #300. §3.8.1 #69; App.1 #69. |
| 70 | `mcr2006.fan.mixed-double-chow` | Mixed Double Chow | 1 | `candidate/hand` | Two Chow elements have the same start rank but different suits. | `H,I` | per unordered qualifying Chow pair | `C123 D123 + B456 C789 + pair D22` | Occurrence key is the two Chow element IDs. §3.8.1 #70; App.1 #70. |
| 71 | `mcr2006.fan.short-straight` | Short Straight | 1 | `candidate/hand` | Two Chows in one suit form six consecutive ranks: start ranks differ by exactly 3. | `H,I` | per unordered qualifying Chow pair | `C123 C456 + D789 B222 + pair D55` | Multiple pair occurrences may be emitted and later counted under #300. §3.8.1 #71; App.1 #71. |
| 72 | `mcr2006.fan.two-terminal-chows` | Two Terminal Chows | 1 | `candidate/hand` | One suit contains both a 123 Chow and a 789 Chow. | `H,I` | per qualifying Chow pair/suit | `C123 C789 + D456 B222 + pair D55` | Multiple occurrences may be emitted if distinct Chow pairs exist. §3.8.1 #72; App.1 #72. |
| 73 | `mcr2006.fan.pung-terminals-or-honors` | Pung of Terminals or Honors | 1 | `candidate/hand` | Each Pung/Kong of a suited 1 or 9, or of a Wind, qualifies. Dragon sets do not qualify here because Dragon Pung is fan 59. | `H,I` | per qualifying Pung/Kong element ID | `C111 + D234 B456 C789 + pair D55` | Source explicitly distinguishes Dragon Pung at 2 points. §3.8.1 #73; App.1 #73. |
| 74 | `mcr2006.fan.melded-kong` | Melded Kong | 1 | `candidate/hand` | Each fixed declared Kong with exposure=melded independently qualifies. | `H,X,I` | per melded-Kong group ID | `KM(C5) + D123 B456 C789 + pair D22` | Two Melded/Three/Four Kongs interactions are #300. §3.8.1 #74; App.1 #74. |
| 75 | `mcr2006.fan.one-voided-suit` | One Voided Suit | 1 | `candidate/hand` | Exactly two of the three numbered suits appear in the hand; Honors may also appear. | `H,I` | single per hand | `C123 C456 D789 D777 + pair EE` | Using only one numbered suit is Full/Half Flush territory and is not this detector's positive condition. §3.8.1 #75; App.1 #75. |
| 76 | `mcr2006.fan.no-honors` | No Honors | 1 | `candidate/hand` | No Wind or Dragon tile appears anywhere in the hand. | `H,I` | single per hand | `C123 D456 B789 C777 + pair D55` | Higher suit-only fan may imply/suppress it in #300. §3.8.1 #76; App.1 #76. |
| 77 | `mcr2006.fan.edge-wait` | Edge Wait | 1 | `candidate/wait` | After removing one winning tile, the set of tile faces that can make any lawful complete hand is exactly the recorded winning face; within a candidate ordinary interpretation that tile is 3 completing 1-2-3 or 7 completing 7-8-9. | `H,W,I` | per qualifying interpretation role, behind one global sole-face gate | `M(D123) M(B555) M(EEE); free pre-win C1 C2 D7 D7; win C3` | Do not ask the user for a wait label. If any other tile face can win, emit no Edge Wait candidate. §3.8.1 #77; App.1 #77. |
| 78 | `mcr2006.fan.closed-wait` | Closed Wait | 1 | `candidate/wait` | After pre-win reconstruction, the recorded winning face is the sole tile face that can complete any lawful hand; within a candidate ordinary interpretation it fills the middle tile of a Chow. | `H,W,I` | per qualifying interpretation role, behind one global sole-face gate | `M(D123) M(B555) M(EEE); free pre-win C2 C4 D7 D7; win C3` | If another tile face can win, emit no Closed Wait candidate. §3.8.1 #78; App.1 #78. |
| 79 | `mcr2006.fan.single-wait` | Single Wait | 1 | `candidate/wait` | After pre-win reconstruction, the recorded winning face is the sole tile face that can complete any lawful hand; within a candidate interpretation it completes the pair. | `H,W,I` | per qualifying interpretation role, behind one global sole-face gate | `M(C123) M(D456) M(B789) M(EEE); free pre-win D7; win D7` | If another tile face can win, emit no Single Wait candidate. §3.8.1 #79; App.1 #79. |
| 80 | `mcr2006.fan.self-drawn` | Self-Drawn | 1 | `candidate/context` | `winSource=self-draw` for an ordinary draw or Flower replacement; source event interactions may later suppress it. | `M,E,I` | single per hand | `Any valid hand; winSource=self-draw; resolvedWinEvent=none (also separately test flower-replacement)` | Last Tile Draw non-combination and Kong-replacement interactions belong to #300; Flower replacement still qualifies. §3.8.1 #80; App.1 #80. |
| 81 | `mcr2006.fan.flower-tiles` | Flower Tiles | 1 | `post-qualification/#300` | One bonus point per retained Flower, using flowerCount, only after the hand has met the 8-point non-Flower qualification threshold. | `F,I` | not a catalogue candidate; bonus amount = flowerCount | `Otherwise qualifying hand with flowerCount=1` | Never place Flower points in candidate detection or allow them to rescue a sub-eight Hu. §3.8.1 #81; App.1 #81. |

## Cross-binding source decisions required by #299

### Irregular structures

The Green Book makes the ordinary structure four sets plus a pair and separately permits Seven Pairs, Thirteen Orphans, and Greater/Lesser Honors and Knitted Tiles.

For the knitted irregular hands:

- choose one one-to-one assignment of the residue groups `147`, `258`, `369` to the three numbered suits;
- every tile in Greater/Lesser is a **single** tile, not a pair/set;
- Greater uses all seven distinct Honors plus seven distinct suited tiles from that assignment;
- Lesser uses the same knitted universe but not all seven Honors. Since there are only nine suited tile kinds in one assignment and the hand has fourteen distinct singles, Lesser necessarily has five or six distinct Honors and nine or eight suited tiles respectively;
- Knitted Straight is the complete nine suited tiles of one such assignment and may appear as part of another lawful hand structure.

Do not import knitted definitions from another Mahjong family.

### Exact Reversible Tiles set

The only permitted tile faces are:

```text
Dots:    1 2 3 4 5 8 9
Bamboo:  2 4 5 6 8 9
Dragon:  White
```

No Character, Wind, Red Dragon or Green Dragon belongs to this fan.

### Wait reconstruction

For Edge / Closed / Single Wait:

1. remove exactly one occurrence of `winningTile` from `freeTiles`;
2. enumerate every non-Flower tile face that could legally be added without exceeding four physical copies;
3. determine which faces make **any** lawful MCR complete hand, including permitted irregular structures;
4. the set of winning faces must contain exactly the recorded winning face;
5. only then inspect each candidate ordinary interpretation:
   - Edge: the winning tile is `3` completing `1-2-3`, or `7` completing `7-8-9`;
   - Closed: the winning tile is the middle tile of a Chow;
   - Single: the winning tile completes the pair.

If another tile face can complete the pre-win hand, no favourable wait fan is emitted. Alternate decompositions for the same sole winning face remain separate candidate interpretations for #300.

### Event distinctions

Use the finite resolved event field, not reconstructed procedure:

```text
last-wall-draw      -> Last Tile Draw
last-discard        -> Last Tile Claim
kong-replacement    -> Out with Replacement Tile
flower-replacement  -> Self-Drawn may apply; Out with Replacement Tile does not
rob-kong            -> Robbing the Kong
```

`Last Tile` is different: it uses `lastVisibleCopy=true`, not wall position.

### Chicken Hand

Chicken Hand is not a tile-shape detector. #299 must retain the binding and enough evidence/candidate information for #300. #300 awards it only when the legal winning interpretation has zero other counted non-Flower fan.

### Flower Tiles

Flower Tiles is not part of the non-Flower candidate subtotal. `flowerCount` is applied only by the post-qualification bonus stage after the hand has already met the eight-point threshold.

### Mixed concealed/melded Kong source arithmetic

Appendix 1 #57 explicitly states that one melded Kong plus one concealed Kong scores six points. The 81-fan list has no separate 6-point “mixed two Kongs” binding.

For the existing fixed-value binding model, represent the source arithmetic as:

```text
two melded Kongs:
  fan 57 Two Melded Kongs = 4

one melded + one concealed:
  fan 57 pair-base = 4
  fan 67 Concealed Kong = 2
  total before other interaction = 6

two concealed:
  fan 48 Two Concealed Kongs = 8
```

This is a source-specific detector bridge, not an invented 82nd fan. #300 must preserve the source-stated result when applying the general counting principles.

### Multiple occurrences

The source examples explicitly demonstrate that some lower fan can occur more than once (for example Double Pung twice, Tile Hog multiple times, and lower Chow relationships multiple times). #299 must not deduplicate by binding ID.

Detectors may emit exact structural occurrences. #300 decides which occurrences can lawfully count together under Non-Repeat, Non-Separation, Non-Identical, High-versus-Low and Account-Once.

## #299 handoff gate

The detector/evidence slice may restart only from this contract plus the existing catalogue/evidence/golden-fixture documents.

Required implementation proof remains:

- 81/81 bindings present with exact stable IDs, values and source locators;
- 81/81 positive behavioural or correct-stage fixtures;
- raw free tiles are decomposed independently of UI grouping;
- ordinary and permitted irregular structures are enumerated deterministically;
- repeated candidate occurrences retain deterministic identity;
- wait fan use reconstructed pre-win evidence;
- event/Last Tile evidence fails closed when materially unknown;
- Chicken Hand and Flower Tiles remain at their correct later stages;
- the five counting principles and final highest-lawful score remain out of #299 and are completed in #300.

Any contradiction with this contract or the pinned 2006 source is a source-review stop, not permission to guess.
