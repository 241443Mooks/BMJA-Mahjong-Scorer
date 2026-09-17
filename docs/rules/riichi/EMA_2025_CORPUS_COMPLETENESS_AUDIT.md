# EMA Riichi 2025 — correctness corpus completion audit

Status: **pre-code rules/scoring research complete; implementation pending**  
Issue: #202  
Profile target: `riichi-ema-2025@0.x`  
Authority: European Mahjong Association, *Riichi: Rules for Japanese Mahjong*, 2025 edition (August 2025)

## Purpose

This audit asks whether future engineering can implement the EMA 2025 Riichi scorer/Table Companion profile without rediscovering the scoring, settlement and progression rules from scratch.

The product boundary is:

```text
resolved physical hand/round + minimum score-relevant context
→ lawful score
→ settlement transactions
→ next table state
→ game finalisation when applicable
```

The product does not need to simulate the physical wall, enforce every call, continuously track every discard, arbitrate claim timing or act as a referee merely to score and record the game.

Result of this audit: **PASS for the pre-code correctness gate**.

---

## 1. Source identity audit

Pinned source:

- European Mahjong Association;
- *Riichi: Rules for Japanese Mahjong*;
- 2025 edition, August 2025;
- repo source ID `ema-riichi-2025`;
- formal EMA authority for the named profile.

The target is deliberately `riichi-ema-2025`, not generic universal `riichi`.

A later EMA edition that changes executable semantics must become a distinct version/profile decision rather than silently changing saved games.

Result: **PASS**.

---

## 2. Product-scope audit

The existing architecture decisions and the new score-evidence contract agree that full digital-game simulation is unnecessary.

The deterministic scorer/table recorder can operate from:

- final structural hand evidence;
- identifiable winning tile;
- trusted tracked-game context;
- a finite Riichi-specific score-evidence object;
- a profile-owned resolved round outcome.

Facts that would require intrusive continuous tracking — e.g. ippatsu/furiten derivation from every physical action — may be supplied as explicit resolved evidence when not already known safely.

Rules concerning etiquette, claim timing and automatic foul detection remain reference/procedure concerns rather than prerequisites for the scorer.

Result: **PASS**.

---

## 3. Yaku / yakuman catalogue audit

`EMA_2025_YAKU_CATALOGUE.md` records the complete EMA 2025 scoring catalogue from §4.2:

- 13 one-han yaku;
- 11 two-han-base yaku;
- 3 three-han yaku;
- Renhō at 5 han;
- Chin'itsu at 6 han closed / 5 open;
- 12 yakuman.

For each binding the corpus records:

- stable project ID;
- closed value;
- open value/reduction where relevant;
- detector/evidence class;
- source-owned interaction notes.

Dora are correctly kept outside the yaku catalogue because they add han/value but do not satisfy legal-win yaku eligibility.

Engineering still needs one positive executable fixture per binding, but that is test implementation rather than missing rules research.

Result: **PASS**.

---

## 4. Interaction / legality audit

Source-owned non-stacking/interaction rules explicitly captured include:

- Double Riichi suppresses ordinary Riichi;
- Ryanpeikō suppresses Iipeikō;
- Rinshan Kaihō does not combine with Haitei;
- Renhō combines with neither other yaku nor dora;
- yakuman are not cumulative.

Source-owned lawful additive cases explicitly preserved include:

- Little Three Dragons plus the applicable individual dragon-triplet han;
- Honrōtō plus Toitoi or Seven Pairs as structurally applicable;
- one wind triplet scoring both Seat Wind and Round Wind where both identities apply.

The general legality gate is pinned:

```text
complete winning shape
+ at least one yaku/yakuman
+ ron not furiten
→ legal win
```

Dora-only hands fail.

Result: **PASS**.

---

## 5. Decomposition / winning-tile audit

The source requires the highest-scoring lawful interpretation whenever a winning tile/hand admits multiple possibilities.

The contract therefore uses:

```text
enumerate legal decompositions / winning-tile assignments
→ evaluate each completely
→ reject illegal/no-yaku interpretations
→ select highest EMA value
```

Official examples 8 and 10 directly fixture this requirement.

The winning tile remains explicit because it affects wait fu and whether a ron-completed triplet is melded for fu/concealed-triplet evaluation.

Result: **PASS**.

---

## 6. Fu audit

The corpus pins every ordinary fu category in §4.1.1:

- base 20;
- concealed ron +10;
- tsumo +2 except Pinfu;
- all triplet/quad fu cells, melded vs concealed and simple vs terminal/honour;
- value-pair fu;
- EMA-2025 double-wind pair = only 2 fu;
- edge/closed/pair wait +2 and zero for two-sided/triplet waits;
- open-20-fu adjustment +2;
- Seven Pairs fixed 25 with no further additions;
- ordinary rounding up to the next 10;
- Pinfu's source-defined 20 self-draw / 30 discard treatment.

Dedicated golden fixtures cover each mechanism.

Result: **PASS**.

---

## 7. Dora audit

The source-bound evidence/contract covers:

- suited indicator cycling including 9→1;
- wind cycle East→South→West→North→East;
- dragon cycle Red→White→Green→Red;
- multiple indicators stacking;
- kan-dora;
- ura-dora only for Riichi winners;
- EMA 2025 no-red-five rule.

Indicators are scorer evidence; users do not enter an authoritative dora count.

Result: **PASS**.

---

## 8. Hand-value / payment audit

The corpus pins:

```text
base = fu × 2^(han+2)
```

for ordinary sub-five-han hands, with EMA limit handling and all payments rounded up to the next 100.

Pinned limit choices:

- Mangan 5 han / base 2,000;
- Haneman 6–7 / 3,000;
- Baiman 8–10 / 4,000;
- Sanbaiman 11+ / 6,000;
- real yakuman / 8,000;
- EMA 2025 kiriage Mangan for 4 han 30+ fu and 3 han 60+ fu;
- no separate counted-yakuman tier for 13+ ordinary han.

Ron and dealer/non-dealer tsumo formulae are pinned. The official Annex p. 43 table is an executable parity target generated from those rules rather than the scoring algorithm itself.

Result: **PASS**.

---

## 9. Official scoring-example audit

All ten EMA examples on pp. 26–28 have named expected-result fixtures in `EMA_2025_GOLDEN_FIXTURES.md`.

Together they directly exercise:

- closed/open Ittsū;
- Riichi;
- Menzen Tsumo;
- Pinfu;
- dora;
- open 20-fu adjustment;
- yakuman;
- ron-completed triplet handling;
- San'ankō / Toitoi / Tanyao;
- Ippatsu;
- Seven Pairs fixed fu;
- maximum decomposition;
- double wind yaku;
- open/closed Half Flush;
- edge wait;
- dealer/non-dealer payment routes;
- kiriage Mangan.

Exact tile notation from the source should be transcribed into executable fixtures during scorer implementation, while these source-bound expected results remain the oracle.

Result: **PASS for pre-code handoff**.

---

## 10. Settlement audit

Scoring and settlement are separate.

The corpus covers:

- ordinary ron;
- ordinary tsumo;
- dealer vs non-dealer payment routes;
- honba/counters;
- multiple ron;
- current-hand and carried riichi-pot allocation;
- Daisangen/Daisuushii liability routing;
- exhaustive-draw tenpai/noten transfers;
- optional resolved chombo treatment by persisted procedure mode.

Liability changes **who pays**, not the yakuman hand value.

All settlement should emit neutral auditable payer→payee transactions rather than hidden balance mutation.

Result: **PASS**.

---

## 11. Exhaustive-draw audit

The complete 3,000-point noten transfer cases are pinned for 0, 1, 2, 3 and 4 declared-tenpai players.

The contract also pins the post-draw table changes:

- honba +1;
- riichi bets remain on table;
- East retains only if declared tenpai;
- otherwise dealership rotates.

The scorer/table companion consumes the resolved tenpai declarations rather than requiring strategy analysis or wall simulation.

Result: **PASS**.

---

## 12. Progression / game-end audit

Pinned progression rules:

- East win → East retains;
- multiple ron including East → East retains;
- exhaustive draw + East tenpai → East retains;
- otherwise dealership rotates;
- counter handling follows the outcome independently;
- full game is East round + South round;
- round changes when the original East returns to East after all other players have been East;
- game ends on the corresponding return after the South round;
- negative score does not end the game.

These semantics belong to the Riichi progression/game-end strategies, not a transition-flavoured dealer-model ID.

Result: **PASS**.

---

## 13. Finalisation audit

The corpus pins:

- any remaining riichi pot awarded to first place / split on tied first place as the source directs;
- score relative to the 30,000 starting point;
- uma +15,000 / +5,000 / -5,000 / -15,000;
- source tie handling by combining occupied-place uma and splitting evenly;
- penalties after uma only where the selected procedure mode requires them.

Game finalisation therefore fits the platform `GameEndResult`/finalisation seam rather than ordinary hand scoring.

Result: **PASS**.

---

## 14. Procedure / referee boundary audit

EMA contains detailed live-play procedure and penalty rules. The product does not need to infer those from move history to implement the scoring/table profile.

V1 may:

- explain them in rules/reference content;
- accept a resolved chombo/procedure result if that feature is deliberately implemented;
- persist social/tournament procedure mode where it changes executable treatment.

V1 does not need:

- automatic foul detection;
- claim arbitration;
- tournament clock administration;
- referee workflow;
- continuous discard logging solely for penalty policing.

Result: **PASS / deliberately outside automatic scoring scope**.

---

## 15. Rules-platform / Lego fit audit

No fifth scoring grammar is required.

Riichi maps to the already-approved `riichi-han-fu` grammar and requires the existing planned platform seams:

```text
family.riichi
riichi-han-fu
tiles.riichi-136
shape.four-sets-pair + source-owned irregular structures
catalogue.yaku.riichi-ema-2025
catalogue.yakuman.riichi-ema-2025
riichi-decomposition.ema-2025-enumerate-max
dora.riichi-ema-2025
fu.riichi-ema-2025
riichi-limit-tier.ema-2025
riichi-hand-value.ema-2025
settlement.riichi-ema-2025-four-player
progression.riichi-ema-2025-renchan
game-end.riichi-ema-2025
source.ema-riichi-2025
```

Exact executable registry names may be normalised by #229/#230, but no new architectural category is required by the completed corpus.

Family-owned evidence/outcome/state codecs carry the Riichi-specific facts; they must not be added as nullable fields to every Mahjong profile.

Result: **PASS**.

---

## 16. What remains engineering rather than research

The following work is deliberately **not** required to call the pre-code correctness corpus complete:

- implementing tile decomposition enumeration;
- implementing each yaku/yakuman detector;
- transcribing official examples into executable tile fixtures;
- generating the p. 43 scoring-table parity data/tests;
- wiring the Riichi runtime/profile through the shared platform;
- building Riichi entry/result UI;
- implementing table strategy state;
- real-player terminology/table-flow validation.

These are bounded engineering/validation tasks against a now-pinned rules contract.

---

## Handoff decision

The pre-code scoring/settlement/progression research gate for EMA 2025 Riichi is **complete**.

Engineering should read, in order:

1. `EMA_2025_SCORE_EVIDENCE_CONTRACT.md`;
2. `EMA_2025_YAKU_CATALOGUE.md`;
3. `EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md`;
4. `EMA_2025_GOLDEN_FIXTURES.md`;
5. this audit;
6. existing `EMA_2025_ARCHITECTURE_DECISIONS.md` for the wider domain/platform boundary.

If implementation exposes a contradiction with the pinned EMA source, stop that slice and return the exact contradiction to source review. Do not resolve it from another Riichi app, WRC rule set or general Riichi convention.
