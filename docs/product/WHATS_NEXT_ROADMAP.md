# What's next — project handoff roadmap

**Snapshot:** 3 October 2026
**Purpose:** current restart point after truth-corpus closeout, Riichi preflight and recent product-assurance work.
**Live authority:** issue #105 remains the programme map; this file is the dated handoff companion, not a second backlog.

## Where Mahjong Reference is now

Mahjong Reference is a multi-ruleset Table Companion rather than the original British-only scorer.

Production `main` has:

- five public rules profiles: British / BMJA-style, Western — Thompson & Maloney, Club, Buzzard 2000 and MCR / WMO 2006 `0.1`;
- the shared rules platform, permanent parity/replay harness and current caller cutover;
- rules-aware one-hand scoring and whole-game tracking;
- settlement, balances, East/Wind progression, history, recovery and printable records;
- the completed Classical hybrid evidence-first hand-entry model;
- a task-first mobile hand calculator and state-safe canonical Share action;
- a concept-first Special Hands Guide with 71 learner entries backed by 146 exact current Classical treatments;
- exact scorer-result → Guide-treatment deep links and local comparison of 2–3 exact treatments;
- the completed #399 machine-readable rules-truth architecture, with typed source/evidence/treatment records, fail-closed integrity gates and Classical + MCR proof;
- the shared #406 profile × dimension contract for #296/#405 projections.

Verified production baseline for this reconciliation: `718bdc496983a249ef714d090872075116fce6a0`.

## Completed architecture programme — #399 rules truth

**#399 is closed complete.**

Delivered slices:

- **A / PR #438** — Truth Model v0 and authority contract;
- **B / PR #439** — Classical Special Hands source → treatment → runtime proof;
- **C / PR #441** — canonical typed/sharded truth corpus + query surface;
- **D / PR #442** — fail-closed integrity and reverse-impact validation;
- **E / PR #443** — MCR second-family proof;
- **F / PR #444** — pre-Riichi readiness audit, PASS.

The proved authority chain is:

```text
real source
→ source record
→ evidence claim
→ canonical semantic identity
→ exact profile treatment
→ executable profile/runtime
→ downstream projection / decision trace
```

The important boundary is that #399 proved this **vertically**. It did not turn into the bulk migration it was designed to avoid.

## User-facing truth path tightened after the architecture work

Two small but important Special Hands improvements also landed:

- **#432 / PR #445** — scorer special-hand and fishing results link to the exact owning Guide treatment rather than merely the concept page;
- **#433 / PR #446** — the Guide can compare 2–3 exact treatments locally while preserving exact profile ownership and remembered rules state.

This is useful evidence that the source/treatment/runtime/reference model is producing practical user-facing value rather than remaining an internal architecture exercise.

## Completed bounded truth-corpus expansion — #440

#440 is complete and closed. Final closeout records **317 semantic subjects, 380 evidence claims, 378 exact-profile treatments and zero unknown treatment states**. Classical and MCR expansion reached the deliberately bounded closeout; unresolved and source-blocked material remains explicit rather than guessed. #399 remains historical and complete.

## #405 / #296 projection substrate — foundation complete, stream not current priority

The first shared engineering slice is already done: **#406 / PR #417 is complete and #406 is now closed**.

The shared contract includes:

- a reviewed 37-dimension catalogue;
- exact profile × dimension projection;
- distinct runtime/implementation and source/evidence states;
- explicit present / absent / unknown / not-applicable semantics;
- #296 relationship vocabulary;
- calibrated BMJA, T&M, Club/OTB, Buzzard and MCR examples.

#407 is therefore technically unblocked when the ruleset-report stream is deliberately resumed.

Preferred shape remains:

```text
runtime/profile truth + reviewed evidence
                  ↓
      shared dimension/value contract
             ↙              ↘
       #296 comparator      #405 profile report
```

Do not build a separate report facts database.

## Riichi — fresh preflight complete; #494 is the next prerequisite

The EMA Riichi 2025 source/correctness corpus is complete and runtime implementation has not started. Required fresh preflight **#491 is complete** against `main@718bdc496983a249ef714d090872075116fce6a0`:

```text
A — scoring/runtime: SMALL GAP → #494
B — neutral table-state: PASS; no B0 prerequisite currently required
→ #494 grammar-extensible compiled-runtime registration seam
→ #262 scoring core
→ #263 settlement/progression/finalisation
→ #264 selectable product integration + Riichi-owned persisted strategy state
→ experienced EMA/European Riichi review before 1.0
```

#494 is a small neutral registration change; it must not implement Riichi rules. The current profile/resolver/schema supports `riichi-han-fu`; the remaining gap is the production compiled-runtime registry's Classical/MCR-only dispatch assumption. Do not describe #491 as future work or insert a B0 issue without new evidence.

## American / NMJL-style — #434

#434 remains an evidence/architecture programme at **N0**, not a runtime build.

Product boundary:

> **Use the annual card; do not become the annual card.**

N0 should establish:

- source-backed general American/NMJL mechanics;
- the annual-card/external-evidence boundary;
- Joker physical evidence without invented represented identity;
- winner-only score semantics using the player-supplied printed card value;
- settlement/progression evidence;
- whether the existing target-catalogue grammar can support a card-external/manual-target path honestly.

Do not reproduce, transcribe, OCR, scrape or encode a current annual NMJL card.

## Ruleset compiler / authoring pipeline — #447 PARKED

#447 captures the longer-term goal: ingest source documents, extract structured claims, identify conflicts/gaps and help assemble an auditable candidate ruleset without hours of manual setup.

That is a good future direction, but it is **not the next batch**. It should be informed by actual #440 migration pain and future family onboarding rather than being designed speculatively now.

## Small bounded product work

Useful independent/lighter slices remain:

- **#429 MCR scorer UX** — results are visually noisy and too many information boxes are required; preflight exact materiality before changing UI;
- **#412 Public What's New** — a curated player-facing milestone history above the technical changelog;
- **#378 British learning-path ownership** — Gameplay Basics versus Scoring Guide;
- **#393 contact/feedback** — keep account-free and low-friction;
- **#288 static-route/real-404 boundary** — separate from the merged visitor-facing 404 UI.

## Parallel production confidence work

Keep these moving without allowing them to become another broad engineering programme:

- **#253 production QA / launch stability**;
- **#89 real-table validation on 10 October 2026**;
- **#246 analytics observation** under the existing privacy boundary;
- experienced-player **MCR review** before stable `1.0`;
- search visibility logging when a durable milestone occurs.

Use real table evidence from 10 October to reprioritise product friction; do not protect an old roadmap from better evidence.

## Branch housekeeping

Issue **#398** owns mechanical branch pruning.

Rules:

- delete only branches proven merged;
- preserve any branch with an open PR;
- preserve deliberately retained unique parked work identified by #167;
- never force a branch to `main` as a substitute for deletion;
- if merge status is ambiguous, leave it.

There were no open PRs when this reconciliation began. Branches were not deleted: the available safe ref-deletion capability was not established, and branch names alone do not prove merge status. Preserve `main`, open-PR heads, unique/unmerged work, #167 parking-lot branches and ambiguous refs. In particular, `docs/2026-10-03-eod-housekeeping` was not present among fetched refs; no similarly named branch was moved or reset. Record proven cleanup candidates in #398 for a safe deletion-capable pass.

## Current next-step position

Unless new evidence changes the priority:

1. Product validation: **#253 current-production QA → #89 real-table validation on 10 October 2026**; continue #246 analytics observation and experienced-player MCR review.
2. Riichi: **#494 → #262 → #263 → #264 → experienced EMA/European player review**.
3. Suitable independent bounded work: **#412** public What's New and **#429** MCR evidence UX.
4. Keep **#434** at American/NMJL-style N0 evidence + architecture.
5. Keep **#447 parked** until real ruleset onboarding/migration pain provides evidence for the authoring workflow.
6. #407 remains technically available but is not automatically next. #167 remains the parking-lot index.

## Things not to do on restart

- Do not reopen #386 without a concrete regression.
- Do not restart the completed rules-platform migration or old integration train.
- Do not reopen #399 as a bulk-migration umbrella; #440 owns the expansion.
- Do not build a second rules-facts database for #296, #405, #251 or SEO.
- Do not let learner/reference prose become scoring authority.
- Do not make AI calculate rules or invent missing material evidence.
- Do not skip #494 before #262; #491 is already complete and B passed without a B0 prerequisite.
- Do not encode an NMJL annual card in code, fixtures, screenshots or hidden data.
- Do not pull #447 forward merely because automated ingestion is attractive; let real migration/onboarding evidence shape it.
- Do not make accounts/network services a dependency for ordinary free table play.
- Do not implement an old open issue merely because it exists; confirm that it still serves the live product.

## Definition of a good restart

A good restart should not require reconstructing the September issue tree.

Read, in order:

1. this file;
2. issue #105;
3. the exact active issue from the current programme map (currently #253 validation or #494 Riichi prerequisite, by chosen track);
4. only the current `main` code/tests and authority documents needed by that batch.

Then do one bounded thing.
