# EMA Riichi 2025 — golden correctness fixtures

Status: **pre-code normative oracle set for #202**  
Profile: `riichi-ema-2025@0.x`  
Authority: `ema-riichi-2025` — EMA, *Riichi: Rules for Japanese Mahjong*, 2025 edition (August 2025)

## Purpose

These fixtures are implementation oracles, not UI mock data.

Future executable tests may use a different internal representation, but must reproduce the same rule outcomes.

The product boundary remains:

```text
resolved hand/round + score-relevant evidence
→ deterministic Riichi score
→ settlement transactions
→ next table state
```

Do not build wall/turn/claim simulation merely to satisfy these fixtures.

---

# A. Ten official EMA worked examples — pp. 26–28

These ten examples are mandatory release gates because they are source-authored worked scores rather than project-invented hands.

Exact tile/group fixtures should be transcribed into executable test data from the source during implementation. The expected scoring outcomes below are already pinned and must not drift.

## EMA-01 — closed Ittsū, Pinfu, Riichi, tsumo

Source: official example 1, p. 26.

Expected yaku/value:

```text
Riichi                         1 han
Pinfu                          1 han
Pure Straight / Ittsū          2 han (closed)
Menzen Tsumo                   1 han
------------------------------------
Total                          5 han
Tier                           Mangan
```

Expected payments:

```text
East winner:
  each opponent -> East: 4,000
  total received: 12,000

Non-East winner:
  East -> winner: 4,000
  each other non-East -> winner: 2,000
  total received: 8,000
```

Oracle: **5 han Mangan**.

---

## EMA-02 — same basic hand won by ron

Source: official example 2, p. 26.

Expected:

```text
Riichi                         1 han
Pinfu                          1 han
Pure Straight / Ittsū          2 han (closed)
------------------------------------
Total                          4 han
Fu                             30 fu
EMA 2025 kiriage              → Mangan
```

Expected ron payment:

```text
East winner:      12,000
Non-East winner:   8,000
```

Oracle: **4 han 30 fu is Mangan under EMA 2025**.

---

## EMA-03 — open Ittsū + dora

Source: official example 3, p. 26.

Expected:

```text
Pure Straight / Ittsū          1 han (open)
Dora                           1 han
------------------------------------
Total                          2 han
Fu:
  base                         20
  open 20-fu adjustment        +2
                               =22 → 30 fu
```

Expected ron payment:

```text
East winner:      2,900
Non-East winner:  2,000
```

Oracles:

- open Ittsū loses one han;
- dora contributes value but is not itself a yaku;
- otherwise-20-fu open hand receives +2 before rounding.

---

## EMA-04 — Four Concealed Triplets

Source: official example 4, p. 26.

Expected:

```text
Four Concealed Triplets / Sūankō
→ Yakuman
```

Expected tsumo payments:

```text
East winner:
  each opponent -> East: 16,000
  total: 48,000

Non-East winner:
  East -> winner: 16,000
  each other non-East -> winner: 8,000
  total: 32,000
```

Oracle: **Yakuman base/payment route**.

---

## EMA-05 — ron-completed triplet is melded for concealed-triplet evaluation

Source: official example 5, p. 27.

Expected:

```text
Three Concealed Triplets / San'ankō   2 han
All Triplets / Toitoi                 2 han
All Simples / Tanyao                  1 han
Dora                                   3 han
--------------------------------------------
Total                                  8 han
Tier                                   Baiman
```

Expected ron:

```text
East winner:      24,000
Non-East winner:  16,000
```

Key oracle:

> A triplet completed by the ron tile is treated as melded for concealed-triplet/fu evaluation.

---

## EMA-06 — Riichi + Ippatsu + Menzen Tsumo + Tanyao + Seven Pairs

Source: official example 6, p. 27.

Expected:

```text
Riichi                         1
Ippatsu                        1
Menzen Tsumo                   1
Tanyao                         1
Seven Pairs                    2
--------------------------------
Total                          6 han
Fu                             fixed 25
Tier                           Haneman
```

Expected tsumo:

```text
East winner:
  6,000 from each opponent
  total 18,000

Non-East winner:
  6,000 from East
  3,000 from each other non-East
  total 12,000
```

Oracles:

- Seven Pairs is fixed 25 fu;
- Ippatsu may stack with Riichi;
- no additional fu is applied to Seven Pairs.

---

## EMA-07 — Seven Pairs ron only

Source: official example 7, p. 27.

Expected:

```text
Seven Pairs                    2 han
Fu                             25
```

Expected ron:

```text
East winner:      2,400
Non-East winner:  1,600
```

Oracle:

> Dragon-pair and pair-wait fu are **not** added to Seven Pairs; its fu remains exactly 25.

---

## EMA-08 — choose the higher scoring decomposition

Source: official example 8, p. 27.

The tiles can be interpreted as Seven Pairs or as a standard four-set hand. The standard decomposition produces the higher value and must be selected.

Expected winning interpretation:

```text
Twice Pure Double Sequence / Ryanpeikō   3 han
Menzen Tsumo                              1 han
-----------------------------------------------
Total                                     4 han

Fu:
base                                      20
self-draw                                  +2
dragon pair                                +2
pair wait                                  +2
                                         =26 → 30 fu

EMA 2025 kiriage                         → Mangan
```

Oracle:

> Enumerate lawful interpretations and select the **highest-scoring** result; do not stop at Seven Pairs simply because it is structurally valid.

---

## EMA-09 — East ron, open Half Flush + double wind value

Source: official example 9, p. 28.

Expected:

```text
Half Flush / Hon'itsu             2 han (open)
Seat Wind triplet                 1 han
Round Wind triplet                1 han
Half Outside Hand / Chanta        1 han (open)
Dora                               1 han
---------------------------------------
Total                              6 han
Tier                               Haneman
```

Expected East ron:

```text
18,000
```

Oracle:

> The same wind triplet may score both Seat Wind and Round Wind yaku when it has both roles.

---

## EMA-10 — winning-tile interpretation maximises value

Source: official example 10, p. 28.

Expected:

```text
Half Flush / Hon'itsu             3 han (closed)
Menzen Tsumo                       1 han
---------------------------------------
Total                              4 han

Fu:
base                               20
self-draw                           +2
concealed honour triplet            +8
edge wait                            +2
                                  =32 → 40 fu

Tier                               Mangan
```

Expected non-East tsumo:

```text
East -> winner:          4,000
other non-East -> winner 2,000 each
Total                    8,000
```

Oracle:

> Where the hand has multiple potential winning-tile interpretations/waits, evaluate them and choose the highest scoring lawful result.

---

# B. Yaku legality and interaction fixtures

## RI-Y01 — dora-only hand is illegal

Input condition:

- complete winning shape;
- no yaku/yakuman;
- one or more dora.

Expected:

```text
legal win: false
reason: no-yaku
```

Dora must not satisfy the yaku requirement.

---

## RI-Y02 — Double Riichi suppresses ordinary Riichi

Input:

- valid Double Riichi evidence.

Expected counted:

```text
Double Riichi 2 han
```

Expected suppressed:

```text
Riichi
reason: stronger-source-owned-yaku
```

Ippatsu may still be counted if independently eligible.

---

## RI-Y03 — Ryanpeikō suppresses Iipeikō

Expected counted:

```text
Ryanpeikō 3 han
```

Expected suppressed:

```text
Iipeikō
```

---

## RI-Y04 — Rinshan excludes Haitei

Input:

- winning tile is a replacement tile after declared quad;
- that replacement occurs at end of drawable wall.

Expected:

```text
Rinshan Kaihō counted
Haitei not counted
```

---

## RI-Y05 — Renhō is exclusive

Input:

- source-valid Renhō event;
- structural hand would otherwise have additional yaku and/or dora.

Expected:

```text
Renhō 5 han only
all other yaku suppressed
dora suppressed
```

---

## RI-Y06 — yakuman are non-cumulative

Input:

- one hand satisfying at least two yakuman predicates.

Expected:

```text
result tier: one Yakuman
payment: single-yakuman payment
```

Audit output may report all matched predicates but the EMA value does not multiply.

---

## RI-Y07 — Shōsangen stacks with dragon Yakuhai

Input:

- two dragon triplets/quads;
- pair of third dragon.

Expected:

```text
Shōsangen            2 han
Dragon Triplet       1 han each for the two sets
```

---

## RI-Y08 — Honrōtō structural companion yaku

Two separate cases:

```text
A. triplet-shaped Honrōtō
   → Honrōtō + Toitoi

B. seven-pairs Honrōtō
   → Honrōtō + Seven Pairs
```

---

# C. Open/closed value fixtures

At minimum test closed vs open where the source reduces value:

```text
Sanshoku Dōjun  2 → 1
Ittsū            2 → 1
Chanta           2 → 1
Hon'itsu         3 → 2
Junchan          3 → 2
Chin'itsu        6 → 5
```

Also prove closed-only yaku fail when the hand is open:

```text
Riichi
Double Riichi
Ippatsu (requires Riichi)
Menzen Tsumo
Pinfu
Iipeikō
Ryanpeikō
Seven Pairs
```

where the source/structure makes exposure impossible or invalid.

---

# D. Fu fixtures

## RI-F01 — Seven Pairs fixed 25

Add no pair/wait/ron/tsumo/set fu. Do not round.

## RI-F02 — double-wind pair is only +2

Seat wind = round wind and pair is that wind.

Expected pair fu:

```text
+2 total
```

not +4.

## RI-F03 — concealed ron

Expected winning-condition fu:

```text
+10
```

## RI-F04 — tsumo

Expected:

```text
+2
```

except Pinfu.

## RI-F05 — Pinfu tsumo remains 20

No +2 tsumo fu.

## RI-F06 — open hand otherwise exactly 20

Expected:

```text
20 + 2 open adjustment = 22 → 30 fu
```

## RI-F07 — ron-completed triplet becomes melded

Prove both:

- lower fu value for that triplet;
- does not count as concealed triplet for San'ankō/Sūankō evaluation.

## RI-F08 — all set-value cells

Table-driven fixture covering:

```text
simple triplet:          melded 2 / concealed 4
terminal/honour triplet: melded 4 / concealed 8
simple quad:             melded 8 / concealed 16
terminal/honour quad:    melded 16 / concealed 32
```

## RI-F09 — wait types

Table-driven:

```text
edge   +2
closed +2
pair   +2
two-sided 0
triplet wait 0
```

---

# E. Dora fixtures

## RI-D01 — suit wrap

Indicator 9 → dora 1 of same suit.

## RI-D02 — wind cycle

```text
East → South
South → West
West → North
North → East
```

## RI-D03 — dragon cycle

```text
Red → White
White → Green
Green → Red
```

## RI-D04 — repeated indicators stack

Same dora identity indicated twice and present once in hand → +2 han.

## RI-D05 — ura requires Riichi

Same ura indicators:

- Riichi winner → count them;
- non-Riichi winner → ignore them.

## RI-D06 — no red-five dora

EMA 2025 tile/profile configuration must not award aka-dora.

---

# F. Value / payment-table fixtures

## RI-V01 — formula-generated p.43 table

Generate every ordinary East/non-East ron/tsumo cell in the official Annex p. 43 table from:

```text
rounded fu
han
EMA limit/kiriage policy
base value
ceil-to-100 payer formula
```

Compare to pinned expected table data transcribed into the executable test corpus. Do not hard-code the table as the scoring algorithm.

## RI-V02 — kiriage 4 han 30 fu

Expected: Mangan.

## RI-V03 — kiriage 3 han 60 fu

Expected: Mangan.

## RI-V04 — 11 ordinary han

Expected: Sanbaiman, **not** counted Yakuman.

## RI-V05 — 13+ ordinary han

Expected: still Sanbaiman under EMA 2025 unless the hand independently matches a real yakuman.

---

# G. Settlement fixtures

## RI-S01 — ron + honba

For one counter:

```text
discarder → winner: base ron payment
+ separate/traceable 300 honba transfer
```

Hand han/fu/tier unchanged.

## RI-S02 — tsumo + honba

For one counter each opponent pays +100 to winner.

## RI-S03 — multi-ron

One discard, two winners.

Expected:

- discarder pays each winner their independent full ron result;
- honba +300 per counter is paid to each winner;
- each winner retains its own score result;
- no synthetic combined winner result.

## RI-S04 — riichi pot single winner

Winner receives carried pot after ordinary settlement.

## RI-S05 — riichi pot multi-ron

Expected ordering:

1. each current-hand winner who declared Riichi receives their own current-hand 1,000 bet back;
2. remaining current-hand losing-player bets + carried pot go to the first winner in turn order after the discarder.

## RI-S06 — Daisangen/Daisuushii liability, tsumo

Liable player pays full yakuman hand payment alone.

## RI-S07 — liability, ron from third party

Liable player + discarder split the **hand payment** equally.

Honba remains solely payable by discarder.

---

# H. Exhaustive draw fixtures

Use declared tenpai status, not reconstructed strategy advice.

## RI-X00 — zero tenpai

No 3,000-point transfer.

## RI-X01 — one tenpai

Each of three noten players pays 1,000 to the sole tenpai player.

## RI-X02 — two tenpai

Each noten player pays 1,500; each tenpai player receives 1,500.

## RI-X03 — three tenpai

Sole noten player pays 1,000 to each tenpai player.

## RI-X04 — four tenpai

No transfer.

For **all five** exhaustive-draw cases:

- increment honba by 1;
- keep riichi pot on table;
- East retains only if East is declared tenpai.

---

# I. Progression fixtures

## RI-P01 — East wins

East retained; honba +1.

## RI-P02 — non-East wins, East not a co-winner

Dealer rotates; honba resets to 0.

## RI-P03 — multi-ron includes East

East retained; honba +1.

## RI-P04 — exhaustive draw, East tenpai

East retained; honba +1.

## RI-P05 — exhaustive draw, East noten

Dealer rotates; honba +1.

## RI-P06 — round transition

After all four players have held East and dealership passes from the original East again:

```text
East round → South round
```

## RI-P07 — game end

After the corresponding South-round cycle completes:

```text
game complete = true
```

## RI-P08 — negative balance

One or more players below zero:

```text
game complete = false solely because balance < 0
```

---

# J. Finalisation fixtures

## RI-G01 — ordinary ranking

Starting from final raw balances:

```text
subtract 30,000 from each player
apply uma +15k / +5k / -5k / -15k
```

Verify sum remains zero before separate tournament penalties.

## RI-G02 — tied positions

For a tie occupying adjacent places, combine those places' uma and split evenly.

Example oracle:

```text
tie for 2nd/3rd:
(+5,000 + -5,000) / 2 = 0 each
```

Apply the source tie ordering/ranking semantics consistently.

## RI-G03 — remaining riichi pot

At game end:

- sole first place collects it;
- tied first places split it;
- source-specified decimal handling is deterministic.

---

# K. Procedure-mode fixture (optional executable layer)

This is not required for the first ordinary scorer, but if procedure/chombo is implemented it must be source-correct.

## RI-C01 — social chombo

Resolved offender pays reverse-mangan amounts:

```text
non-East offender:
  4,000 to East
  2,000 to each other non-East

East offender:
  4,000 to each opponent
```

Current-hand riichi declarations are returned; no dealer rotation; no new honba; hand re-dealt.

## RI-C02 — tournament chombo

No immediate reverse-mangan transfer. Apply the EMA tournament penalty as finalisation after game/uma, according to the pinned procedure mode.

---

# L. Missing-evidence / fail-closed fixtures

The scorer must refuse to guess where the missing fact can alter outcome.

Examples:

```text
ron + furiten status required but unknown
riichi/ippatsu claim with declaration state unknown
ura-dora attempted without knowing Riichi status
winning tile missing where decomposition/fu can change
resolved win event unknown where event yaku is claimed
liability route selected but liable player unknown
```

If tracked context already supplies a fact, the UI must not ask for it again.

---

# Engineering conversion gate

When #202 moves into implementation, the executable suite must include:

- all ten official EMA examples;
- at least one positive fixture for every yaku/yakuman binding;
- open/closed reduction coverage;
- source-owned exclusion/non-stacking coverage;
- all fu categories;
- p.43 formula/table parity;
- decomposition maximisation;
- dora cycles and eligibility;
- ron/tsumo + dealer/non-dealer payment routes;
- honba + riichi pot;
- multiple ron;
- liability;
- exhaustive draws 0–4 tenpai;
- dealer/round/game progression;
- final uma/ties;
- missing material evidence fail-closed.

This document supplies the expected rules outcomes. Engineering chooses the smallest deterministic test representation that fits the rules-platform runtime.
