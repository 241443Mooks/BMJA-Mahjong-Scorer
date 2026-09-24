# EMA Riichi 2025 — scoring, settlement and progression contract

Status: **pre-code normative correctness contract for #202**  
Profile: `riichi-ema-2025@0.x`  
Authority: `ema-riichi-2025`  
Primary locators: §§3.3.7, 3.4, 3.5, 3.7, 4.1; Annex scoring table p. 43.

## 1. Scoring grammar

EMA 2025 uses the dedicated `riichi-han-fu` grammar.

```text
legal winning shape + at least one yaku
→ enumerate all lawful interpretations
→ detect yaku / yakuman
→ apply source-owned yaku interactions/open reductions
→ add dora han where permitted
→ calculate fu where relevant
→ choose highest lawful score
→ determine limit/base value
→ derive ron/tsumo payments
```

Do not pass Riichi through Classical points/doubles/limit scoring.

---

## 2. Han and yakuman

For ordinary non-yakuman hands:

```text
total han = counted yaku han
          + normal dora
          + kan dora
          + ura dora when winner declared riichi
```

At least one **yaku** is required before dora are considered for legal-win eligibility.

EMA 2025 does not use red fives.

EMA 2025 yakuman are not cumulative. Yakuman use the dedicated yakuman tier rather than adding ordinary yaku/dora han.

EMA 2025 does **not** promote 13+ ordinary han to a counted yakuman: the limit table uses **11 or more han = sanbaiman**, while yakuman is a separate tier.

Source: §§3.2, 4.1, 4.1.2, 4.2.

---

## 3. Fu / minipoints

### Fixed special case

```text
Seven Pairs = exactly 25 fu
no additional fu
no rounding
```

### Ordinary base

```text
base fu = 20
```

### Winning condition

```text
concealed ron  +10
tsumo           +2   // not combined with Pinfu
```

### Triplet / quad fu

| Set | Melded | Concealed |
|---|---:|---:|
| sequence | 0 | 0 |
| simple triplet (2–8) | 2 | 4 |
| terminal/honour triplet | 4 | 8 |
| simple quad (2–8) | 8 | 16 |
| terminal/honour quad | 16 | 32 |

If a ron winning tile completes a triplet, that triplet is treated as **melded** for fu/concealed-triplet evaluation. A tsumo-completed triplet remains concealed.

### Pair fu

```text
dragon pair          +2
seat wind pair       +2
round wind pair      +2
```

EMA-2025-specific rule: a pair that is **both seat and round wind still scores only 2 fu, not 4**.

### Wait fu

```text
edge wait     +2
closed wait   +2
pair wait     +2
two-sided      0
triplet wait   0
```

Wait fu is awarded even if the hand has additional waiting tiles; the selected lawful interpretation is whichever produces the highest score.

### Open 20-fu hand

An open hand that would otherwise total exactly 20 fu receives +2 fu (`open pinfu` treatment), then ordinary rounding applies.

### Pinfu

Pinfu is structurally zero-extra-fu by definition:

```text
pinfu ron   = 30 fu (20 + concealed ron 10)
pinfu tsumo = 20 fu (tsumo +2 is not added)
```

### Rounding

Except Seven Pairs, round total fu **up** to the next 10.

Source: §4.1.1; Annex p. 43.

---

## 4. Base hand value / limit tiers

For fewer than five han and non-yakuman hands:

```text
baseValue = roundedFu × 2^(han + 2)
```

Any calculated base value greater than 1,900 becomes 2,000 (mangan).

EMA 2025 also explicitly applies **kiriage mangan**:

```text
4 han 30+ fu → mangan
3 han 60+ fu → mangan
```

Limit tiers:

| Han | Tier | Base value |
|---:|---|---:|
| 5 | Mangan | 2,000 |
| 6–7 | Haneman | 3,000 |
| 8–10 | Baiman | 4,000 |
| 11+ | Sanbaiman | 6,000 |
| yakuman | Yakuman | 8,000 |

No counted-yakuman tier is added for ordinary 13+ han.

Source: §§4.1.2–4.1.3.

---

## 5. Base ron / tsumo payments

All individual payer amounts are rounded **up to the next 100**.

### Ron

For base value `B`:

```text
non-East winner: discarder pays ceil100(4 × B)
East winner:     discarder pays ceil100(6 × B)
```

### Tsumo — East winner

Each of the three opponents pays:

```text
ceil100(2 × B)
```

### Tsumo — non-East winner

```text
East pays:            ceil100(2 × B)
each non-East loser:  ceil100(B)
```

The Annex p. 43 table is a golden oracle for these formulae.

---

## 6. Honba / counters

Counters do not change the hand's han/fu/tier.

For each counter:

```text
ron:   discarder pays winner +300
tsumo: each opponent pays winner +100
```

With multiple ron winners, the discarder pays the +300 per counter to **each** winner.

Counter state:

- add one counter after East wins;
- add one counter after an exhaustive draw;
- remove all counters when a non-East player wins and East is not also a winner;
- chombo does not add a counter.

Source: §3.4.4 and §4.1.

---

## 7. Riichi deposits / pot

A valid riichi declaration contributes 1,000 points to the table pot.

### Ordinary single winner

The winner collects carried riichi bets.

### Multiple winners

EMA 2025 has a specific ordering rule:

1. every winner who declared riichi in the current hand gets **their own current-hand riichi bet back**;
2. remaining current-hand bets from non-winners plus any carried bets from earlier hands go to the winner **first in turn order after the discarder**.

### Exhaustive draw

Riichi bets remain on the table for the next winner.

### End of game

Any remaining riichi bets are collected by the game winner; if first place is tied, the points are split, with decimals rounded down.

Source: §§3.3.10, 3.4.2–3.4.3, 3.7, 4.1.

---

## 8. Multiple ron

More than one player may win on the same discard.

For each winner independently:

```text
discarder pays that winner's full ron hand value
+ that winner's honba amount
```

Do not collapse multi-ron into one combined score result. `RoundResolution` must carry multiple accepted winner score results.

Dealer continuation: if East is among the winners, East remains East.

Source: §§3.3.1, 3.4.3, 3.4.5.

---

## 9. Daisangen / Daisuushii liability

Liability applies only when the source-defined final called set was fed after the other required sets had already been called.

### Tsumo yakuman

The liable player alone pays the **full yakuman hand payment**.

### Ron yakuman where a different opponent discarded the winning tile

The liable player and discarder split the **hand payment equally**.

Only the discarder pays honba/counters.

This is payment routing, not a change to the yakuman hand value.

Source: §3.3.7 and yakuman definitions §4.2.6.

---

## 10. Exhaustive draw settlement

Total noten transfer pool = **3,000 points**.

```text
0 tenpai → no transfer
1 tenpai → each of 3 noten pays 1,000 to the tenpai player
2 tenpai → each noten pays 1,500; each tenpai receives 1,500
3 tenpai → sole noten pays 1,000 to each tenpai player
4 tenpai → no transfer
```

Players may choose to declare noten even with a tenpai hand; use the resolved table declaration for settlement/progression.

After exhaustive draw:

- add one counter;
- riichi pot remains;
- East retains dealership if East is declared tenpai; otherwise dealer rotates.

Source: §3.4.2 and §3.4.5.

---

## 11. Dealer progression

After each resolved hand:

```text
East wins → East retains
East is a winner in multi-ron → East retains
exhaustive draw + East tenpai → East retains
otherwise → dealer rotates South→East, West→South, North→West, East→North
```

Chombo, if recorded as a resolved procedure outcome, causes re-deal with no dealer rotation and no new counter.

Source: §3.4.5–3.4.6.

---

## 12. Round / game progression

A full game has **East and South rounds**.

When the player who started as East becomes East again after all four players have been East in the East round, South round begins.

When that starting player becomes East again after all four players have been East in the South round, the ordinary full game ends.

Renchan/dealer retention can make a round contain more than four hands.

There is **no bankruptcy rule**: negative balances do not terminate the game.

Source: §§3.1, 3.5, 4.1.4.

---

## 13. Finalisation / uma

When the South round ends:

1. award/split any remaining riichi pot as source-defined;
2. take each player's actual points and subtract 30,000;
3. apply uma:
   - 1st +15,000
   - 2nd +5,000
   - 3rd -5,000
   - 4th -15,000
4. for tied positions, combine the bonuses/penalties for occupied places and split evenly;
5. apply any separate tournament penalties only if the selected procedure mode requires them.

Final scores may be divided by 1,000 for display/reporting.

Source: §§3.7–3.7.1.

---

## 14. Procedure/chombo boundary

Mahjong Reference should not detect rule infractions automatically.

If a table resolves a chombo and the product supports recording it:

- social EMA policy: reverse mangan payment (4,000 to East, 2,000 to each non-East; if offender is East, 4,000 to each opponent);
- tournament EMA policy: -20,000 applied after game/uma;
- current-hand riichi bets are returned;
- no new counter;
- dealer does not rotate;
- current hand is re-dealt.

Procedure mode must be pinned in game state if executable behaviour differs.

Source: §3.4.6.

---

## 15. Audit/result shape

A Riichi `HandScoreResult` should expose enough information to verify the calculation:

```text
winning interpretation/decomposition
legal-yaku gate
counted yaku + han
suppressed yaku + reason
dora / kan-dora / ura-dora counts
han total
fu components + rounded fu
limit tier / calculated base value
winner dealer status
base ron/tsumo payment amounts
profile/version/fingerprint/source metadata
```

Round settlement should separately expose neutral payer→payee transactions for:

```text
hand payment
honba
riichi deposit / pot award
noten transfer
liability routing
procedure adjustment if supported
finalisation/uma where represented as transactions or finalisation payload
```

Do not hide these adjustments inside one opaque balance mutation.

## Acceptance for engineering

- [ ] p.43 payment table is reproducible from formula/tier policy;
- [ ] 4h30 and 3h60 are mangan;
- [ ] 11+ ordinary han remains sanbaiman, not counted yakuman;
- [ ] double-wind pair is 2 fu only;
- [ ] Seven Pairs is fixed 25 fu;
- [ ] open-20-fu hand receives +2 before rounding;
- [ ] winning-tile interpretation maximises lawful score;
- [ ] multi-ron settlement is independent per winner;
- [ ] honba and riichi pot are settlement layers, not hand-value arithmetic;
- [ ] liability changes payer routing, not yakuman value;
- [ ] exhaustive-draw transfer/progression fixtures cover 0–4 declared-tenpai players;
- [ ] negative score does not end game;
- [ ] final uma/tie handling is deterministic and fixture-covered.
