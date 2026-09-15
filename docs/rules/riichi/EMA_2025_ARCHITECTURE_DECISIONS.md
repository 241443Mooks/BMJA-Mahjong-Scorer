# EMA Riichi 2025 — architecture decisions

Status: **architecture questions resolved; scorer/source corpus still required before broad implementation**  
Issue: #202  
Primary source: European Mahjong Association, _Riichi: Rules for Japanese Mahjong_, 2025 edition

This document resolves the nine open architecture questions in `EMA_2025_IMPLEMENTATION_MATRIX.md` against the current codebase and the EMA 2025 rule domains.

The decisions are intentionally practical for a **physical-table companion**. We should not turn the app into a full digital Mahjong server merely because Riichi has eventful rules.

## Decision summary

Riichi will be a **separate scoring + game strategy** that reuses stable tile/group/event primitives where semantics genuinely match.

Do not force Riichi into the current classical `ScoreBreakdown`, single-winner `HandOutcome`, BMJA progression, or fixed settlement-reason model.

The platform changes required by Riichi should also improve MCR/Buzzard support rather than create Riichi-only application forks.

---

## Q1. Which existing hand-evidence fields can be reused?

### Decision

Reuse structural evidence **without changing its meaning**:

- `PlayingTile` suit/Wind/Dragon identity;
- `HandSet` Chow/Pung/Kong/pair structure;
- exposed/concealed visibility;
- `looseTiles` for irregular shapes where useful;
- winning tile identity/provenance where the existing target model fits;
- generic win-source concepts such as discard, wall/self-draw, replacement tile and robbing Kong after exact event mapping.

Do **not** overload these classical fields:

- `originalCall` is not riichi declaration;
- `handMode` (`normal | goulash`) is not a Riichi state mechanism;
- `bonusTiles` is not dora/ura-dora state;
- `limit` is not a Riichi limit tier;
- British `fishing` is not tenpai;
- current `winningEventEvidence` is too narrow for all Riichi event facts.

### Required shape

Add a profile-specific evidence object alongside shared structural hand evidence, conceptually:

```ts
type RiichiScoreEvidence = {
  riichi: 'none' | 'riichi' | 'double-riichi';
  ippatsuEligible: boolean;
  winSource: 'ron' | 'tsumo' | 'rinshan' | 'chankan' | 'haitei' | 'houtei';
  furiten?: 'clear' | 'self-discard' | 'temporary' | 'riichi-pass';
  doraIndicators: PlayingTile[];
  uraDoraIndicators?: PlayingTile[];
  kanDoraIndicators?: PlayingTile[];
  // other source-bound context as required
};
```

Exact field names wait for implementation. The semantic decision does not.

---

## Q2. Does the current hand model retain enough history for furiten and ippatsu?

### Decision

**No.**

The current scoring hand stores final structural evidence and only minimal win-event facts. It does not retain the full discard/call sequence required to derive all furiten and ippatsu states automatically.

Do not solve this by requiring users to log every physical-table action in v1.

### Product split

For the first Riichi scorer/Table Companion:

- deterministic scorer accepts explicit derived evidence for furiten/ippatsu/riichi state;
- the game tracker automatically records events it already needs for balances/progression, especially riichi deposits and hand outcomes;
- users enter/confirm scoring-only context at hand end where automatic derivation would require intrusive full-event capture.

A later optional `full table event log` may derive furiten/ippatsu automatically, but it is **not a correctness prerequisite for the deterministic hand scorer**.

This protects the product principle: reduce interruption at a physical table.

---

## Q3. Where does dead-wall / dora-indicator state live?

### Decision

In **Riichi strategy-owned hand/table state**, not inside `MahjongHand`.

The dead wall is table state. Dora indicators are visible table evidence that affect scoring. They are not bonus tiles owned by a player's hand.

For first implementation:

- standalone scorer may accept visible dora/kan-dora/ura-dora indicators as scoring evidence;
- full game state stores Riichi hand-state facts required across a deal (kan count, currently revealed indicators where we choose to track them);
- we do not simulate the physical order/content of the entire wall unless a demonstrated feature needs it.

The platform needs a profile-owned `handState` / `strategyState` snapshot in the game record rather than expanding shared game state with Riichi-specific top-level fields.

---

## Q4. How are multiple valid decompositions scored to maximum value?

### Decision

Use deterministic **enumerate → evaluate → select maximum**.

1. Generate every legal decomposition/interpretation for the completed tile multiset and winning tile under EMA 2025.
2. For each interpretation, evaluate yaku eligibility, han, dora, fu, limit tier and payments.
3. Reject interpretations that do not contain a legal yaku.
4. Select the interpretation producing the highest lawful EMA score/payment result.
5. Keep enough candidate/explanation data to show why that interpretation won.

The engine must not stop at the first structurally valid decomposition.

If two interpretations produce exactly the same official value, use a deterministic internal tie-break only for stable explanations/tests; the tie-break must not change the rules outcome.

This should be a pure scoring-engine concern and independently testable from UI.

---

## Q5. Are yaku reusable profile bindings or Riichi-owned evaluators?

### Decision

Use a **hybrid**.

Reuse canonical structural predicates where exact tile structure is genuinely shared, for example structural candidates such as:

- Thirteen Orphans;
- Nine Gates;
- Big Three Dragons;
- Big/Little Four Winds;
- Four Kongs;
- All Green;
- All Honours;
- All Terminals;
- Seven Pairs.

Riichi owns the executable yaku binding/evaluator because it adds:

- han value;
- open/closed value differences;
- yaku eligibility;
- source-specific exclusions/non-stacking;
- event/context requirements;
- EMA-specific choices.

Eventful yaku such as Riichi, Ippatsu, Menzen Tsumo, Rinshan, Chankan, Haitei/Houtei, Tenhou/Chihou/Renhou are Riichi-owned evaluators rather than pretending to be generic tile predicates.

Canonical pattern identity remains separate from yaku semantics.

---

## Q6. Can the current settlement transaction model express Riichi?

### Decision

The **payer→payee transaction concept is reusable**, but the current TypeScript shape is too classical and must be generalised before Riichi full-game implementation.

Current constraints that must change:

- `HandOutcome` permits only one winner;
- `SettlementTransaction.reason` is a fixed BMJA/OTB union;
- every transaction requires `eastMultiplier: 1 | 2`, which is not a neutral cross-profile field;
- `RoundInput.scores` assumes one scalar hand score for every player;
- progression receives only single-winner/draw outcome and cannot see tenpai, riichi pot, counters or multi-ron.

### Target boundary

Keep generic transaction facts:

```text
from player
→ to player / pot
amount
reason/rule id
optional explanation metadata
```

Profile-specific strategies should generate transactions for:

- ron;
- split tsumo;
- honba/counters;
- riichi deposits/pot awards;
- multiple ron winners;
- Daisangen/Daisuushii liability;
- exhaustive-draw tenpai/noten transfers;
- finalisation adjustments where represented as ledger transactions.

Do not add all possible Riichi reasons to one universal string union. Use stable profile-owned reason IDs under a generic transaction envelope.

The round outcome model also needs to support **multiple winners** and profile-specific draw/result evidence.

---

## Q7. How are tournament-only penalties separated from social defaults?

### Decision

Treat procedure mode as a **persisted game/session option layered on the pinned EMA rules edition**, not as scoring-engine state.

Conceptually:

```text
rulesProfile: riichi-ema-2025@...
procedureMode: social | tournament
```

Initial implementation should prioritise normal/social physical-table play. Tournament timing/referee/administrative procedure stays reference-only until deliberately implemented.

Where EMA specifies different executable outcomes (for example chombo treatment), the selected procedure mode must be stored with the saved game so replay is deterministic.

Do not fork yaku/fu scoring into separate social/tournament engines when the scoring mathematics are identical.

---

## Q8. What immutable profile/version data is persisted?

### Decision

Persist at least:

```text
rulesProfile: {
  id: "riichi-ema-2025",
  version: "<project implementation version>"
}
gameSchemaVersion: <n>
procedureMode: "social" | "tournament"   // if executable procedure differs
```

The existing `RulesProfileRef { id, version }` is the correct identity primitive and must remain language-independent.

Do not store only the display label `Riichi`.

Do not silently resolve an old game to a later EMA edition. A new formal edition that changes executable behaviour receives a new profile identity/version and migration is explicit.

Profile version identifies the complete executable rules contract, including EMA-specific choices such as no red fives and the 2025 scoring revisions.

---

## Q9. What should the Table Companion actively track versus explain/reference?

### Decision

Track the **minimum state needed for scores, balances and progression**, not every physical action.

### Actively track in initial full-game Riichi support

- player identity and current seat winds;
- round wind / hand index;
- current balances;
- dealer/East;
- honba/counter state;
- riichi declarations and 1,000-point deposits;
- carried riichi-stick pot;
- hand outcome: ron / tsumo / exhaustive draw / implemented procedure result;
- one or multiple winners;
- tenpai players on exhaustive draw;
- scoring evidence/result accepted for each winner;
- liability evidence where applicable;
- dealer repeat/rotation;
- game completion/final uma.

### Enter/confirm at scoring time unless later automation justifies continuous tracking

- dora indicators;
- ura-dora indicators;
- kan-dora indicators;
- furiten status relevant to a ron declaration;
- ippatsu eligibility;
- detailed wait type when not derivable from entered hand/winning tile;
- kan/replacement event facts required by a yaku.

### Reference/explain initially

- etiquette;
- tournament time-limit administration;
- referee procedure not needed to compute the current game;
- optimal discard/strategy advice;
- full wall simulation;
- automatic continuous discard tracking.

This is deliberate UX scope, not a rules omission. The scorer remains deterministic from the evidence the user confirms.

---

# Cross-profile platform changes implied by these decisions

Before broad Riichi implementation, make the following platform seams profile-neutral:

## A. Profile-discriminated hand score result

Current `ScoreBreakdown` is classical. Introduce a boundary capable of:

```text
classical result
MCR result
Riichi result
```

without pretending each grammar has points/doubles/limit fields.

## B. Profile-owned game/hand strategy state

Current `GameState` has BMJA-shaped top-level state (`prevailingWind`, `eastCycleStartPlayerId`, `currentHandMode`).

Future saved-game architecture should allow a versioned profile-specific strategy-state payload while retaining generic players/balances/history.

## C. Richer round result/outcome

Support profile-specific outcomes, including:

- one winner;
- multiple winners;
- draw with per-player tenpai state;
- profile-owned procedural result where implemented.

## D. Generic transaction envelope

Retain payer/payee/amount, but move `eastMultiplier` and fixed British reason enums out of the universal contract.

## E. Profile-owned progression + game completion

`progressGame` should eventually be able to determine both next strategy state and completion. `game.ts` should not hard-code BMJA four-wind completion rules for every profile.

---

# Riichi implementation sequence after architecture gate

1. source-linked yaku/fu/payment fixture corpus;
2. generic score-result and outcome/transaction seams above;
3. Riichi structural decomposition enumerator;
4. yaku + legality engine;
5. dora + fu + limit/payment engine;
6. official EMA pp. 26–28 examples;
7. standalone hand scorer UX;
8. game strategy: dealer/round/honba/riichi pot/draw/multi-ron;
9. full-game settlement/final uma;
10. experienced EMA-player validation.

## Architecture gate result

**Passed.**

The nine questions are no longer blockers to beginning bounded Riichi engine work once the shared platform seams and source-linked scorer fixtures are ready.

They do **not** mean Riichi is ready for broad one-shot implementation. Source-indexed scoring fixtures remain the next correctness gate.
