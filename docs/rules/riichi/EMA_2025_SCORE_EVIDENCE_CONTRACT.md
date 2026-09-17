# EMA Riichi 2025 — score/table evidence contract

Status: **pre-code normative contract for #202**  
Profile target: `riichi-ema-2025@0.x`  
Authority: `ema-riichi-2025` — EMA, *Riichi: Rules for Japanese Mahjong*, 2025 edition (August 2025)

## Product boundary

Mahjong Reference is a physical-table scoring and bookkeeping companion.

For Riichi it should:

```text
record a resolved hand/round + minimum score-relevant context
→ calculate the lawful hand score
→ emit settlement transactions
→ update balances / honba / riichi pot
→ advance or retain dealer / round
→ evaluate game completion / finalisation
```

It should **not** simulate the wall, police calls, arbitrate claim timing, recommend discards or require continuous discard logging merely to score a resolved hand.

Where a physical-table event cannot be derived without intrusive live tracking, the table supplies the resolved fact at scoring time.

---

## 1. Three evidence layers

### A. Structural hand evidence

Captured by hand entry and suitable for deterministic decomposition:

- final tile multiset;
- declared groups / quads;
- exposed vs concealed state of each group;
- winning tile identity;
- ordinary four-sets-plus-pair structure or the permitted irregular structures (Seven Pairs / Thirteen Orphans);
- enough group provenance to distinguish melded vs concealed triplets/quads for fu and yaku.

The winning tile must remain identifiable. EMA 2025 scoring can change depending on which set/wait the winning tile completes.

### B. Trusted active-game context

Use tracked state rather than asking the player again where available:

- exact rules profile/version;
- player identity;
- current seat wind;
- round wind;
- dealer/East identity;
- current balances;
- honba/counter count;
- carried riichi-stick pot;
- discarder identity for ron;
- current hand/round position.

Speech/manual hand entry must not silently override this trusted context.

### C. Score-relevant facts not safely derivable from final tiles

The Riichi evidence codec/policy needs a small explicit set:

```text
win source / resolved win event
riichi state: none | riichi | double-riichi
ippatsu eligibility
furiten status where a ron is being accepted
dora indicators
kan-dora indicators
ura-dora indicators when the winner declared riichi
liability player where Daisangen / Daisuushii liability has been resolved
```

For exhaustive draws, the round outcome additionally needs the set of players declared tenpai/noten.

For a resolved chombo/procedure result, if supported, record the already-decided procedure outcome; do not infer it from move history.

---

## 2. Resolved win-event vocabulary

Do not model these as contradictory independent booleans.

The score evidence should be able to distinguish at least:

```text
ron
tsumo
rinshan-kaihou       // replacement-tile win after a declared quad
chankan               // robbing an extended quad; Kokushi exception for concealed quad
haitei                 // self-draw on last wall tile
houtei                 // ron on last discard
tenhou                 // East wins with starting hand
chihou                 // non-East self-draw in first uninterrupted set of turns
renhou                 // ron before player's first turn in first uninterrupted set of turns
```

Ordinary `ron`/`tsumo` remain the payment source; event-specific yaku refine the score.

Source: §§3.3.11–3.3.13, 3.4.1, 4.2.

---

## 3. Riichi / ippatsu / furiten

### Riichi

The scorer only needs the resolved declaration state:

```text
none | riichi | double-riichi
```

The live declaration procedure does not need to be simulated by the hand scorer. The game tracker does need to record the 1,000-point deposit when a declaration is accepted because it changes the pot/balances.

### Ippatsu

Ippatsu is score evidence. EMA defines it as winning in the first uninterrupted set of turns after declaring riichi; a called set or declared quad interrupts it.

V1 may accept an explicit `ippatsuEligible` derived fact instead of requiring complete live call history.

### Furiten

Furiten is a legality gate for `ron`, not for `tsumo`.

V1 does **not** need to log every discard merely to derive furiten. For an accepted ron, the scoring/table flow may require explicit confirmation that the winner is not furiten when the game tracker cannot prove it.

Do not collapse self-discard, temporary and post-riichi furiten into British fishing semantics.

Source: §§3.3.9–3.3.12.

---

## 4. Dora evidence

Dora are not yaku and therefore cannot satisfy the requirement that a winning hand contain at least one yaku.

The scorer receives visible **indicator tiles**, not a user-entered dora total, and deterministically maps indicator → dora:

- suited 1→2 ... 8→9, 9→1;
- winds East→South→West→North→East;
- dragons Red→White→Green→Red.

Each matching tile in the hand contributes one han for each applicable indicator. A tile indicated more than once counts more than once.

`uraDoraIndicators` are used only for winners who declared riichi.

EMA 2025 does **not** use red fives.

Source: §§1.3, 2.7, 3.3.10, 4.1.

---

## 5. What the scorer derives rather than asks

Given tiles/groups, winning tile and trusted context, derive where possible:

- all legal decompositions;
- ordinary/special winning shape;
- open/concealed status;
- structural yaku;
- open-value reduction;
- triplet/quad fu;
- pair fu;
- wait fu;
- whether ron completed a triplet and therefore makes that triplet melded for fu/concealed-triplet evaluation;
- dora count from indicators;
- han subtotal;
- fu subtotal + rounding;
- limit tier;
- ron/tsumo base payments;
- dealer/non-dealer payment split.

Do not turn Riichi into a checklist of yaku or let users type an authoritative han/fu total when the engine can derive it.

---

## 6. Maximum-lawful-interpretation rule

When the same tiles/winning tile allow multiple legal decompositions or ways to assign the winning tile, enumerate and evaluate all lawful interpretations and choose the **highest-scoring EMA result**.

This affects both yaku and fu. Official scoring examples 8 and 10 explicitly exercise this rule.

A deterministic internal tie-break may stabilise explanations where values are equal, but it must not change payments.

Source: §§3.4.3, 4.1.1 and official examples 8/10.

---

## 7. Round evidence beyond a winning hand

### Win round

Round resolution may contain one or more winners. For each winner retain:

- accepted score result;
- win source;
- discarder where applicable;
- liability player where applicable.

Also retain:

- honba count;
- riichi pot state;
- current dealer/seat state.

### Exhaustive draw

Record only the resolved tenpai/noten declarations needed for settlement and progression.

No wall simulation is required once the table has reached the exhaustive draw.

### Procedure/chombo

If later implemented, treat this as a profile-owned resolved procedure outcome. The app records the table/referee decision and applies the selected EMA social/tournament policy; it does not detect infractions automatically.

---

## 8. `requiredEvidence()` behaviour

The UI should ask only for facts that are:

1. not derivable from current hand evidence;
2. not already present in trusted game context; and
3. capable of changing legality, score, payment or progression.

Examples:

- do not ask seat wind during a tracked game;
- do not ask the user to count dora manually when indicators are entered;
- do not ask for ura-dora indicators when no winner declared riichi;
- do not ask furiten for a tsumo;
- do not ask liability unless the hand/event can use the Daisangen/Daisuushii liability rule;
- do not ask ippatsu unless riichi/double-riichi is present.

---

## 9. Explicit non-goals

This contract does not require:

- continuous wall state;
- full discard history;
- claim-priority arbitration;
- automatic riichi declaration policing;
- automatic ippatsu/furiten derivation from every physical action;
- automatic chombo/foul detection;
- tournament clock/score-sheet administration;
- strategy or discard advice.

Those may be separate later capabilities if table evidence shows value.

## Acceptance for implementation handoff

- [ ] a Riichi hand can be scored from final structural evidence + the small external evidence set above;
- [ ] no generic British fishing/original-call/bonus-tile field is overloaded;
- [ ] dora are derived from indicators and do not create yaku eligibility;
- [ ] winning tile remains identifiable for decomposition/fu;
- [ ] furiten gates ron without requiring full event logging;
- [ ] multi-winner and exhaustive-draw round evidence fit the profile-owned outcome/`RoundResolution` seams;
- [ ] tracked context is reused rather than re-entered;
- [ ] unknown material evidence fails closed rather than being guessed.
