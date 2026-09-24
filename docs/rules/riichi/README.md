# Riichi / EMA 2025 rules programme

Status: **pre-code correctness research complete; runtime implementation pending under #244**  
Programme issue: #202  
Initial executable target: `riichi-ema-2025@0.x`

This directory is the implementation-facing evidence base for adding **Japanese Riichi Mahjong** to Mahjong Reference / Table Companion.

The target profile is deliberately the **European Mahjong Association (EMA) 2025 rules edition**, not generic unversioned `Riichi`, because Riichi traditions and formal profiles differ in scoring details, procedure and optional rules.

Primary authority:

- European Mahjong Association, *Riichi: Rules for Japanese Mahjong*, 2025 edition, August 2025;
- source ID `ema-riichi-2025`;
- formal source URL recorded in `SOURCES.md`.

The supplied 2023 one-page yaku sheet is a secondary learning aid only and never overrides EMA 2025.

## Current handoff — 17 September 2026

The architecture and pre-code scoring/settlement/progression research gates are complete.

Future engineering should begin from this corpus rather than re-reading the rulebook ad hoc:

1. `EMA_2025_SCORE_EVIDENCE_CONTRACT.md` — minimum hand/table facts the product actually needs;
2. `EMA_2025_YAKU_CATALOGUE.md` — source-bound yaku/yakuman values, open reductions and interactions;
3. `EMA_2025_SCORING_AND_SETTLEMENT_CONTRACT.md` — fu, dora/value formulae, payments, honba, riichi pot, liability, draw settlement, progression and uma;
4. `EMA_2025_GOLDEN_FIXTURES.md` — ten official EMA examples plus focused edge-case oracles;
5. `EMA_2025_CORPUS_COMPLETENESS_AUDIT.md` — proof that the rules research gate is closed rather than merely paused;
6. `EMA_2025_ARCHITECTURE_DECISIONS.md` — existing profile/platform boundary decisions;
7. `EMA_2025_IMPLEMENTATION_MATRIX.md` — original domain/source map and research record;
8. `SOURCES.md` — exact authority/version/source policy.

Runtime implementation is #244 and is deliberately blocked on the relevant #227 rules-platform prerequisites. Codex should implement the pinned contract; it should not perform Riichi research while changing production code.

## Product boundary

Mahjong Reference is a physical-table scoring/bookkeeping companion.

For Riichi it needs to:

```text
record a resolved hand/round + minimum score-relevant context
→ score it
→ settle it
→ update balances / honba / riichi pot
→ retain or advance dealer/round
→ finalise the game when appropriate
```

It does **not** need to simulate the wall, run turns, police claim timing, recommend discards, automatically referee fouls or require continuous discard logging merely to score a resolved physical game.

Where a scoring fact cannot be derived without intrusive live tracking, the table may supply a finite source-defined resolved fact at scoring time. Unknown material evidence must remain unknown/fail closed rather than be guessed.

## Why Riichi is a separate scoring grammar

A useful mental model is:

```text
complete winning shape?
        ↓
legal yaku / ron legality?
        ↓
enumerate all lawful interpretations
        ↓
yaku + dora → han
        +
hand/win structure → fu
        ↓
limit tier / base value
        ↓
ron or tsumo payment route
        +
honba / riichi pot / liability
        ↓
settlement
        ↓
renchan / dealer rotation / next round / finalisation
```

Riichi therefore uses the `riichi-han-fu` grammar and must not be stretched into British/Western points × doubles.

## EMA 2025 profile choices now pinned

The correctness corpus includes, among other source-specific decisions:

- 136 basic tiles; no Flowers, Seasons or Jokers;
- no red fives for EMA 2025;
- ordinary four-sets-plus-pair plus Seven Pairs and Thirteen Orphans;
- at least one yaku required; dora do not create yaku eligibility;
- furiten prevents ron but not tsumo;
- maximum lawful decomposition/winning-tile interpretation must be selected;
- Seven Pairs fixed at 25 fu;
- pair that is both seat and round wind scores only 2 fu;
- EMA kiriage Mangan for 4 han 30+ fu and 3 han 60+ fu;
- ordinary 11+ han = Sanbaiman; yakuman is a separate tier;
- yakuman are not cumulative;
- multiple ron is allowed;
- honba and riichi deposits are settlement layers rather than hand-value arithmetic;
- source-defined Daisangen/Daisuushii liability routing;
- exhaustive-draw 3,000-point tenpai/noten settlement;
- East retains after East win or East tenpai at exhaustive draw;
- East + South full-game lifecycle;
- no bankruptcy/end-on-negative-score rule;
- final 30,000 baseline + uma + tie handling.

## Minimum score evidence

Most scoring information should be derived from entered tiles/groups and trusted active-game state.

The small external/derived evidence set includes only facts such as:

- winning tile and source/event;
- riichi/double-riichi state;
- ippatsu eligibility where relevant;
- furiten status for ron when it cannot be safely derived;
- dora / kan-dora / ura-dora indicators;
- resolved liability player where applicable;
- declared tenpai/noten players on exhaustive draw.

The UI must not turn the yaku catalogue into a checkbox scorer.

## Mandatory executable correctness gates

When #244 is implemented:

- reproduce all ten official EMA worked scoring examples on pp. 26–28;
- generate and match the official scoring table on p. 43 from the formula/policies;
- positive detector coverage for every yaku/yakuman;
- open-reduction and source-owned non-stacking coverage;
- all fu categories;
- maximum-decomposition tests;
- dora indicator cycles and eligibility;
- dealer/non-dealer ron/tsumo;
- multi-ron, honba and riichi pot;
- liability;
- exhaustive draw 0–4 tenpai;
- renchan/round/game progression;
- final uma/ties;
- fail-closed missing-evidence cases.

## Procedure / tournament boundary

EMA 2025 also contains etiquette, live-play procedure, errors/penalties and tournament administration.

Those are not automatically part of the deterministic hand scorer.

If a future Table Companion feature records a **resolved** chombo/procedure outcome, the selected procedure mode must be explicit and replayable. The app does not need to infer offences from every physical action.

## Real-player validation gate

Because the maintainer does not currently play Riichi, stable/public `1.0` still requires experienced EMA/European Riichi-player review of terminology, evidence entry, scoring explanations and physical-table flow.

That validation is a release gate, not a reason for Codex to invent rules during implementation.

## Principle

> **The language/UI may explain the rules. The deterministic EMA 2025 profile creates the score.**
