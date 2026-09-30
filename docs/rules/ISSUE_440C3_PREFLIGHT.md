# Issue #440C3R — Original Call validation reconciliation

Baseline: `187ab900b9b762f1c093faf848ab38df3ccfebe4` (`origin/main`, freshly fetched; includes merged #467 / completed 440C2)

## Contradiction and source semantics

The merged #464 reconciliation records two BMJA Original Call layers from governing source `bmja-scoring` (*Working out the scores*: “Doubling for all players — Original call” and the winner “Going Mah-Jong with the original call” section), with the BMJA glossary/approved-site clarification where needed:

1. A player fishing after the first discard with an unaltered hand receives the all-player Original Call double, including before Mahjong.
2. A player who subsequently goes Mahjong with Original Call receives a further winner double.

Original Call is a table-supplied fact. The scorer does not reconstruct the historical declaration or prove that the hand stayed locked.

## Previous behavior and correction

The shared hand validator rejected `hand.originalCall && !hand.isWinner` with “Original Call applies only to a winning hand.” That contradicted both the source-backed all-player layer and `fishingIntrinsicHand()`, which already preserves `originalCall` when reconstructing a fishing hand.

The correction removes that stale winner-only validation rule. Ordinary structural validation remains active. The exact current BMJA runtime now accepts and scores a valid non-winning Original Call hand with `original-call`; a winning hand retains both `original-call` and `win-original-call`. A malformed oversized non-winner is still rejected. The exact Buzzard runtime remains isolated and emits neither Original Call double.

No truth records or score values changed. No general ready-hand detector was added.

## C3A handoff boundary

C3A may migrate the two established BMJA Original Call propositions using table-supplied evidence, preserving their distinct all-player and winner layers. This C3R patch changes validation only and does not author truth records or make additional source claims.

Physical-play simulation, declaration-order reconstruction, and Standing Hand equivalence are explicitly excluded. Buzzard Original Call / Standing Hand equivalence is not inferred.

## Verification

| Check | Result |
|---|---|
| Focused Classical validation, BMJA Original Call/scoring, fishing, exact Classical runtimes, Buzzard isolation, C1/C2A/C2B truth regressions | PASS — 10 files, 173 tests |
| `pnpm test` | PASS — 131 files, 1,187 tests |
| `pnpm run typecheck` | PASS |
| `PORT=5173 BASE_PATH=/ pnpm run build` | PASS — existing missing Riichi tile asset and chunk-size warnings; exit 0 |
| `git diff --check` | PASS |
