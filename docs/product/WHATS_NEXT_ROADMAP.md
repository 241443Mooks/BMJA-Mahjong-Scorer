# What's next — project handoff roadmap

**Snapshot:** 27 September 2026 — end of day  
**Purpose:** a calm restart point after the hybrid hand-entry programme and mobile/table-use refinement.  
**Live authority:** issue #105 remains the programme map; this file is the dated handoff companion, not a second backlog.

## Where Mahjong Reference is now

Mahjong Reference is now a multi-ruleset Table Companion rather than the original British-only scorer.

Production `main` has:

- five public rules profiles: British / BMJA-style, Western — Thompson & Maloney, Club, Buzzard 2000 and MCR / WMO 2006 `0.1`;
- the shared rules platform, permanent parity/replay harness and current caller cutover;
- a concept-first Special Hands Guide with 71 learner entries backed by 146 exact current Classical treatments;
- rules-aware one-hand scoring and whole-game tracking;
- settlement, balances, East/Wind progression, history, recovery and printable records;
- a task-first mobile hand calculator;
- an always-visible, state-safe Share action for the canonical Mahjong Reference URL;
- the completed Classical hybrid evidence-first hand-entry model.

The current production baseline after the #386 close-out is commit `9abe36c771601748355aed3b796d2c618e9d14a4`.

## Major programme just completed — #386 hybrid evidence-first hand entry

**#386 is closed complete.** Final acceptance proof landed in PR #436.

Product principle now implemented:

> **Enter what you know. Add the rest. Interpret only what can be proved. Ask only for material facts the evidence cannot supply.**

The delivered path includes:

- explicit groups plus unresolved physical tiles as peer evidence;
- all-loose ordinary Classical entry;
- explicit-only entry remaining authoritative;
- exact-profile Classical decomposition over only unresolved tiles;
- complete-winner resolution and persistence/reopen support;
- partial, 13-tile and fishing interpretation;
- deterministic conservative non-winner inference;
- explicit handling of ambiguity rather than a universal highest-score shortcut;
- inferred-Kong confirmation only when material;
- winning-tile and other material evidence questions only when exact-runtime outcomes can differ;
- fail-closed unknown/default material evidence;
- representative all-explicit, mixed and all-loose coverage across BMJA, Club, Buzzard and Western;
- real-phone task-first/mobile-density refinement through #411 / PR #431.

Do not reopen this programme casually. A future defect should be a bounded regression issue with a concrete failing fixture.

## Product polish completed today

- **#411 / PR #431** — task-first, app-like standalone hand calculator; mobile entry was simplified through repeated real-phone QA.
- **#400 / PR #435** — always-visible Share action using the canonical product URL without leaking hand/game/query state.
- **#255 / PR #286** — visitor-facing 404 recovery experience is merged. The separate HTTP/static-hosting boundary remains #288.

## Next major architecture programme — #399 machine-readable rules truth layers

This is the next architectural gate before Riichi runtime work and the best place to begin tomorrow once a fresh baseline check is complete.

Goal:

```text
real source
→ source record
→ evidence claim
→ canonical semantic identity
→ exact profile treatment
→ executable profile/runtime
→ input evidence
→ decision trace/result
→ reference / comparator / Table Companion / AI projections
```

This is **not** a rules rewrite and **not** another rules database.

Recommended sequence:

### 399A — Truth Model v0

Start with the minimum schema/authority contract only:

- source record;
- evidence claim;
- semantic subject identity;
- profile treatment;
- relationship/status vocabulary;
- source locator;
- version/immutability rules;
- explicit ownership of runtime truth versus reference/editorial projection.

No scoring behaviour changes.

### 399B — Classical Special Hands vertical proof

Use the strongest existing corpus:

- 4 current Classical profiles;
- 146 exact treatment identities;
- 71 learner-facing entries;
- existing source/evidence links.

Prove the full source → treatment → executable binding → learner/scorer path without duplicating score facts.

### 399C/D — source continuity + integrity gates

Make important source/evidence links machine-checkable, then fail closed on orphaned or contradictory authority links.

### 399E — MCR second-family proof

Use MCR to prove the model is not accidentally Classical-specific.

### 399F — pre-Riichi readiness gate

Only after Classical and MCR prove the truth model should the fresh EMA Riichi implementation preflight begin.

## Closely related projection work

### #405 ruleset profile report + #296 comparator substrate

The #405 preflight found that its first real engineering slice is also the missing #296 shared dimension/profile-value substrate.

Do not build a separate report database.

Preferred shape:

```text
shared dimension + exact profile-value contract
        ├─ #296 multi-profile comparator
        └─ #405 single-profile human-readable report
```

#405 can proceed in bounded slices from current runtime truth, but source/evidence fields that really belong to #399 should wait rather than being hand-authored.

### #412 public What's New

This is a small, independent product/communication feature. It can be used as a bounded lighter task when useful, but it should remain a curated public projection above the technical changelog rather than a dump of commits or PR titles.

## New rules-family programme — #434 American / NMJL-style Mahjong

#434 is now captured as an umbrella programme with a strict copyright/product boundary:

> **Use the annual card; do not become the annual card.**

The first step is **N0 preflight/evidence only**, not implementation.

N0 should establish:

- source-backed general American/NMJL mechanics;
- the annual-card/external-evidence boundary;
- Joker physical evidence without invented represented identity;
- winner-only score semantics using the player-supplied printed card value;
- settlement/progression evidence;
- whether the existing target-catalogue grammar can support a card-external/manual-target path honestly.

Do not reproduce, transcribe, OCR, scrape or encode a current annual NMJL card.

#434 can be researched alongside #399, but executable implementation should consume rather than bypass the settled shared truth/runtime contracts.

## Riichi remains downstream of #399

The EMA Riichi 2025 source/correctness corpus is complete; runtime implementation is not started.

Do not jump straight to #262.

Sequence remains:

```text
#399 truth-layer project
→ fresh Riichi preflight against resulting main
→ optional bounded A0 grammar/runtime seam
→ #262 scoring core
→ optional neutral B0 state seam
→ #263 settlement/progression/finalisation
→ #264 public integration
→ experienced EMA/European Riichi review before 1.0
```

Broad Riichi research should reopen only for an exact source/fixture contradiction.

## Parallel production confidence work

Keep these moving without allowing them to become another broad engineering programme:

- **#253 production QA / launch stability**;
- **#89 real-table validation on 10 October 2026**;
- **#246 analytics observation** under the existing privacy boundary;
- experienced-player **MCR review** before stable `1.0`;
- **#288 static-route/real-404 boundary** — separate from the now-merged visitor-facing 404 UI;
- **#378 British learning-path ownership** where Gameplay Basics and the Scoring Guide still overlap.

Use real table evidence from 10 October to reprioritise product friction; do not protect an old roadmap from better evidence.

## Branch housekeeping

Issue **#398** owns mechanical branch pruning.

Rules:

- delete only branches proven merged;
- preserve any branch with an open PR;
- preserve deliberately retained unique parked work identified by #167;
- never force a branch to `main` as a substitute for deletion;
- if merge status is ambiguous, leave it.

After tonight's close-out there should be no need to preserve the completed #386/#400/#411 implementation branches for active work. The current branch-deletion capability available to ChatGPT does not expose safe ref deletion, so #398 remains the explicit manual/mechanical cleanup queue rather than pretending branches were removed.

## Tomorrow restart order

Unless new evidence changes the priority:

1. **Confirm clean production baseline** after tonight's housekeeping PR and Cloudflare/docs-only deployment effects, if any.
2. **Start #399A preflight/schema contract** from exact current `main`; no scoring changes.
3. Use **#405A/#296 substrate** as an early consumer/falsification target for the truth model rather than building a competing data layer.
4. Run **#434 N0 American/NMJL preflight** as a source/architecture track when capacity allows; keep annual-card content outside the repository.
5. Pick off a bounded public-product task such as **#412 What's New** when a lighter implementation slice is useful.
6. Continue #253 / #89 / #246 / MCR review in parallel.
7. Only after #399's readiness gate, run the fresh Riichi preflight.

## Things not to do on restart

- Do not reopen #386 without a concrete regression.
- Do not restart the completed rules-platform migration or old integration train.
- Do not build a second rules-facts database for #296, #405, #251 or SEO.
- Do not let learner/reference prose become scoring authority.
- Do not make AI calculate rules or invent missing material evidence.
- Do not jump into Riichi runtime implementation before #399.
- Do not encode an NMJL annual card in code, fixtures, screenshots or hidden data.
- Do not make accounts/network services a dependency for ordinary free table play.
- Do not implement an old open issue merely because it exists; confirm that it still serves the live product.

## Definition of a good restart

A good restart should not require reconstructing the September issue tree.

Read, in order:

1. this file;
2. issue #105;
3. the exact next issue being worked;
4. only the current `main` code/tests and authority documents needed by that issue.

Then do one bounded thing.
