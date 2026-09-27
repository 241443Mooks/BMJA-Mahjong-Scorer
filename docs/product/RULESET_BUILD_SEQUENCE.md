# Platform + ruleset build sequence

Status: **historical/readiness guide — refreshed 27 September 2026**  
Live programme authority: #105  
Current restart sequence: `WHATS_NEXT_ROADMAP.md`

## Purpose

This file retains the architectural sequencing logic that helped Mahjong Reference grow from one Classical scorer into a multi-grammar rules platform. It is no longer the live task list.

Current production truth:

- shared rules platform — **complete and live**;
- Buzzard 2000 — **complete and live**;
- MCR / WMO 2006 `0.1` — **complete and live**, with experienced-player review remaining before a future `1.0`;
- Classical hybrid evidence-first hand entry — **complete** under #386;
- EMA Riichi 2025 source/correctness corpus — complete, runtime not implemented;
- #399 machine-readable rules truth layers — current architecture gate before Riichi runtime work;
- #434 American/NMJL-style — new umbrella at evidence/architecture preflight stage.

For current priorities, use #105 and `WHATS_NEXT_ROADMAP.md` rather than treating the older sequence below as an execution queue.

## Durable sequencing principle

The useful principle from the original plan remains:

> **Build up, discover, then generalise only what the next real profile proves we need.**

That approach has now been exercised successfully:

1. adjacent Classical profiles proved composable profile variation;
2. Buzzard pressured Classical configuration without requiring a copied scorer;
3. MCR proved a materially different `pattern-accumulator` grammar;
4. #386 proved that evidence-first hand interpretation can remain exact-profile and fail closed;
5. the next architecture step is to make source/evidence/treatment/runtime ownership machine-readable before adding a larger new family.

## Current rules-family sequence

### Existing production families

#### Classical points + doubles

Current executable profiles include:

- British / BMJA-style;
- Western — Thompson & Maloney;
- configured Club;
- Buzzard 2000.

They share a Classical grammar while retaining exact profile identity, values, treatments, settlement and progression differences.

#### Pattern accumulator

MCR / WMO 2006 `0.1` is the first complete executable profile on this grammar.

It remains Provisional pending experienced-player terminology/table-flow review, not because the runtime programme is unfinished.

### Architecture gate — #399

Before Riichi, prove one governed machine-readable chain:

```text
source
→ evidence claim
→ semantic identity
→ exact profile treatment
→ executable runtime
→ decision trace/result
→ reference/comparator/Table Companion/AI projection
```

Start vertically rather than migrating everything at once:

- Truth Model v0;
- Classical Special Hands proof;
- machine-readable source/evidence continuity;
- integrity/impact gates;
- MCR second-family proof;
- pre-Riichi readiness gate.

### EMA Riichi 2025

The source/correctness corpus is complete. Runtime implementation starts only after #399 and a fresh preflight against the resulting production architecture.

Planned sequence:

```text
#399 readiness gate
→ fresh Riichi preflight
→ optional bounded grammar/runtime seam
→ #262 scoring core
→ optional neutral state seam
→ #263 settlement/progression/finalisation
→ #264 public integration
→ experienced EMA/European Riichi review before 1.0
```

The preflight must prove whether current architecture can express the actual requirements, including richer outcomes, honba, riichi pot and profile-owned table state. Do not generalise speculatively.

### American / NMJL-style — #434

This is a separate family track, currently at N0 evidence/architecture preflight.

Product boundary:

> **Use the annual card; do not become the annual card.**

The programme may source and implement general American/NMJL-style mechanics and work alongside a player's annual card. It must not reproduce, transcribe, OCR, scrape or encode a current annual card.

N0 should test whether the existing target-family architecture can support a card-external/manual-target evidence path, including first-class physical Jokers and winner-only scoring around a player-supplied printed value. Do not create another scoring grammar unless real evidence proves one is required.

## Shared platform changes remain evidence-led

Already justified shared seams include:

- stable profile id/version separate from display language;
- exact resolved profile artifacts and fingerprints;
- profile-discriminated scoring results;
- generic payer→payee settlement transactions;
- profile-owned progression/game-end state;
- richer outcome/state contracts where a real profile demonstrates the need;
- source/evidence/treatment identity that can be joined and audited through #399.

Still avoid speculative infrastructure such as:

- universal wall simulation;
- one generic rule-expression language for every Mahjong discipline;
- a mandatory tile-by-tile event log;
- a second hand-maintained rules facts database;
- generic architecture that exists only because a future ruleset might need it.

## Related projections

The same governed rules truth should support, without duplication:

- #296 rules comparator;
- #405 single-profile ruleset report;
- #251 structured reference / Encyclopaedia;
- exact scorer → rule/explanation links;
- future profile/version diagnostics;
- bounded voice/AI explanation packets.

## Current operational rule

For a new or expanded rules family:

```text
source/evidence review
→ architecture preflight against current main
→ smallest proved substrate change, if any
→ exact executable profile/runtime
→ fixtures + parity/isolation proof
→ settlement/progression
→ public integration
→ human terminology/table-flow review where required
```

Stop on contradictions instead of filling gaps from memory or a neighbouring Mahjong tradition.
